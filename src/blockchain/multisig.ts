import BlockChain from "./blockchain";
import { multisigInfo } from "./interface";
import sha256 from "sha256";
import Cypher from "./cypher";
import crypto from "crypto-browserify";
import sha1 from "sha1";
const Buffer = require("buffer/").Buffer;
var aes256 = require("aes256");
const sss = require("shamirs-secret-sharing");

export enum type {
  MAKE = "multisig-make",
  TRAN = "multisig-tran",
  APPROVE = "multisig-approve",
  MULTISIG = "multisig"
}

interface multisigData {
  myShare: string;
  shares: Array<string>;
  threshold: number;
  pubKey: string;
  encryptSecKey: string;
  isOwner?: boolean;
}

//グローバルに置くと(ここ)staticになるかも

export default class Multisig {
  multiSig: { [key: string]: multisigData } = {};
  address: string;
  b: BlockChain;
  private onMultisigTran: { [key: string]: (v?: any) => void } = {};
  private onMultisigTranDone: { [key: string]: (v?: any) => void } = {};
  events = {
    onMultisigTran: this.onMultisigTran
  };
  private excuteEvent(ev: { [key: string]: (v?: any) => void }, v?: any) {
    console.log("excuteEvent", ev);
    Object.keys(ev).forEach(key => {
      ev[key](v);
    });
  }

  constructor(blockchain: BlockChain) {
    this.b = blockchain;
    console.log("address", this.b.address);
    this.address = this.b.address;
  }

  responder(tran: any) {
    this.b.addTransaction(tran);
    const data = tran.data;
    try {
      console.log("responder", data.opt);
      switch (data.opt) {
        case type.MAKE:
          this.getMultiSigKey(data.shares, data.info);
          break;
        case type.TRAN:
          {
            const info: multisigInfo = data.info;
            if (Object.keys(this.multiSig).includes(info.multisigAddress)) {
              console.log("onMultisigTran");
              this.excuteEvent(this.onMultisigTran, info);
            }
          }
          break;
        case type.APPROVE:
          {
            const info: multisigInfo = data.info;
            if (
              info.sharePubKeyRsa &&
              info.ownerPubKey === this.b.cypher.pubKey &&
              Object.keys(this.multiSig).includes(info.multisigAddress)
            ) {
              console.log("type.APPROVE");
              const shares = this.multiSig[info.multisigAddress].shares;
              console.log("progress", shares.length, info.threshold);
              const shareKey = crypto.privateDecrypt(
                this.b.cypher.secKey,
                Buffer.from(info.sharePubKeyRsa, "base64")
              );
              if (!shares.includes(shareKey)) {
                console.log("add sharekey", { shareKey });
                shares.push(shareKey);
              }
              if (shares.length >= info.threshold) {
                console.log("verify multisig", { shares });
                this.verifyMultiSig(info, shares);
                this.excuteEvent(this.onMultisigTranDone);
              }
            }
          }
          break;
      }
    } catch (error) {}
  }

  makeNewMultiSigAddress(
    friendsPubKeyAes: Array<string>,
    vote: number,
    amount: number
  ) {
    console.log(this.makeNewMultiSigAddress);
    const cypher = new Cypher();

    const aesKey = sha1(Math.random().toString()).toString();
    console.log({ aesKey });
    const encryptSecKey: string = aes256.encrypt(aesKey, cypher.secKey);

    const shareKeys: Array<any> = sss.split(Buffer.from(aesKey), {
      shares: friendsPubKeyAes.length + 1,
      threshold: vote
    });
    console.log({ shareKeys });

    const address = sha256(cypher.pubKey);
    const shares: { [key: string]: string } = {};

    friendsPubKeyAes.forEach((aes, i) => {
      const pubKey = aes256.decrypt("format", aes);
      const id = sha256(pubKey);
      console.log("makeNewMultiSigAddress sharekey", shareKeys[i]);
      shares[id] = crypto
        .publicEncrypt(pubKey, Buffer.from(shareKeys[i]))
        .toString("base64");
    });
    console.log({ shares });
    const myShare = shareKeys[shareKeys.length - 1];
    this.multiSig[address] = {
      myShare,
      threshold: vote,
      isOwner: false,
      pubKey: cypher.pubKey,
      encryptSecKey,
      shares: []
    };
    this.multiSig[address].shares.push(myShare);
    // console.log(this.multiSig[address]);
    const info: multisigInfo = {
      multisigPubKey: cypher.pubKey,
      multisigAddress: address,
      encryptSecKey,
      threshold: vote
    };
    const tran = this.b.newTransaction(
      this.b.address,
      address,
      amount,
      {
        type: type.MULTISIG,
        opt: type.MAKE,
        shares,
        info
      },
      cypher
    );
    this.b.addTransaction(tran);
    console.log("makeNewMultiSigAddress done", { tran });
    return tran;
  }

  makeMultiSigTransaction(multisigAddress: string, amount: number) {
    console.log("makeMultiSigTransaction start");
    const data = this.multiSig[multisigAddress];
    if (!data) return;
    const multisigPubKey = data.pubKey;

    // console.log(this.b.cypher.pubKey, data);
    const shareKeyRsa = crypto
      .publicEncrypt(this.b.cypher.pubKey, Buffer.from(data.myShare, "base64"))
      .toString("base64");

    const info: multisigInfo = {
      ownerPubKey: this.b.cypher.pubKey,
      multisigPubKey,
      multisigAddress,
      sharePubKeyRsa: shareKeyRsa,
      threshold: data.threshold
    };
    data.isOwner = true;
    const tran = this.b.newTransaction(this.b.address, multisigAddress, 0, {
      type: type.MULTISIG,
      opt: type.TRAN,
      amount,
      info
    });
    this.b.addTransaction(tran);
    console.log("makeMultiSigTransaction done", { tran });
    return tran;
  }

  private getMultiSigKey(
    shares: { [key: string]: string },
    info: multisigInfo
  ) {
    console.log("getMultiSigKey");
    if (info.encryptSecKey && Object.keys(shares).includes(this.address)) {
      console.log("getMultiSigKey start");
      const key = crypto.privateDecrypt(
        this.b.cypher.secKey,
        Buffer.from(shares[this.address], "base64")
      );

      console.log("getMultiSigKey get my key", key);

      this.multiSig[info.multisigAddress] = {
        myShare: key.toString("base64"),
        isOwner: false,
        threshold: info.threshold,
        pubKey: info.multisigPubKey,
        encryptSecKey: info.encryptSecKey,
        shares: []
      };
    }
  }

  approveMultiSig(info: multisigInfo) {
    console.log("approveMultiSig");
    if (info.ownerPubKey) {
      if (Object.keys(this.multiSig).includes(info.multisigAddress)) {
        console.log("approveMultiSig start");
        const key = this.multiSig[info.multisigAddress].myShare;
        const shareKeyRsa = crypto
          .publicEncrypt(info.ownerPubKey, Buffer.from(key, "base64"))
          .toString("base64");
        info.sharePubKeyRsa = shareKeyRsa;
        const tran = this.b.newTransaction(
          this.b.address,
          info.multisigAddress,
          0,
          {
            type: type.MULTISIG,
            opt: type.APPROVE,
            info: info
          }
        );
        this.b.addTransaction(tran);
        console.log("approveMultiSig done", { tran });
        return tran;
      }
    }
  }

  verifyMultiSig(info: multisigInfo, shares: Array<any>) {
    console.log("verifyMultiSig start", { shares });
    const recovered = sss.combine(shares).toString();
    console.log({ recovered });
    const encryptedKey = this.multiSig[info.multisigAddress].encryptSecKey;
    const secKey = aes256.decrypt(recovered, encryptedKey);
    console.log({ secKey });
    const cypher = new Cypher(secKey, info.multisigPubKey);
    const address = info.multisigAddress;
    const amount = this.b.nowAmount(address);
    const tran = this.b.newTransaction(
      address,
      this.b.address,
      amount,
      { comment: "verifyMultiSig" },
      cypher
    );
    this.b.addTransaction(tran);
    console.log("verifyMultiSig done", { tran });
    return tran;
  }
}
