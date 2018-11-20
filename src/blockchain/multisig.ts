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

  //通信などにより得られた命令に対する処理
  responder(tran: any) {
    this.b.addTransaction(tran);
    const data = tran.data;
    try {
      console.log("responder", data.opt);
      switch (data.opt) {
        case type.MAKE:
          {
            //トランザクションからマルチシグの情報を取得
            this.getMultiSigKey(data.shares, data.info);
          }
          break;
        case type.TRAN:
          {
            //イベントの準備
            this.onMultiSigTransaction(data.info);
          }
          break;
        case type.APPROVE:
          {
            this.onApproveMultiSig(data.info);
          }
          break;
      }
    } catch (error) {}
  }

  //マルチシグのアドレスを生成
  makeNewMultiSigAddress(
    friendsPubKeyAes: Array<string>, //共有者の情報
    vote: number, //しきい値
    amount: number //金額
  ) {
    console.log(this.makeNewMultiSigAddress);
    //秘密鍵と公開鍵を生成
    const cypher = new Cypher();

    //次に使うaeskeyを生成
    const aesKey = sha1(Math.random().toString()).toString();
    console.log({ aesKey });

    //aeskeyで秘密鍵を暗号化
    const encryptSecKey: string = aes256.encrypt(aesKey, cypher.secKey);

    //シャミアの秘密分散ライブラリでaeskeyをシェア化
    const shareKeys: Array<any> = sss.split(Buffer.from(aesKey), {
      shares: friendsPubKeyAes.length + 1,
      threshold: vote
    });

    console.log({ shareKeys });

    //マルチシグアドレスを導出
    const address = sha256(cypher.pubKey);
    const shares: { [key: string]: string } = {};

    //シェアの共有者にシェアを配布
    friendsPubKeyAes.forEach((aes, i) => {
      const pubKey = aes256.decrypt("format", aes);
      const id = sha256(pubKey);
      console.log("makeNewMultiSigAddress sharekey", shareKeys[i]);
      //共有者の公開鍵でシェアを暗号化
      shares[id] = crypto
        .publicEncrypt(pubKey, Buffer.from(shareKeys[i]))
        .toString("base64");
    });
    console.log({ shares });

    //自身にシェアを一つ割当
    const myShare = shareKeys[shareKeys.length - 1];

    //マルチシグの情報を保管
    this.multiSig[address] = {
      myShare,
      threshold: vote,
      isOwner: false,
      pubKey: cypher.pubKey,
      encryptSecKey,
      shares: []
    };
    this.multiSig[address].shares.push(myShare);

    //ブロックチェーンに載せるマルチシグ情報
    const info: multisigInfo = {
      multisigPubKey: cypher.pubKey,
      multisigAddress: address,
      encryptSecKey,
      threshold: vote
    };

    //トランザクションを生成
    const tran = this.b.newTransaction(this.b.address, address, amount, {
      type: type.MULTISIG,
      opt: type.MAKE,
      shares,
      info
    });
    console.log("makeNewMultiSigAddress done", { tran });
    return tran;
  }

  //トランザクションからマルチシグの情報を取得
  private getMultiSigKey(
    shares: { [key: string]: string },
    info: multisigInfo
  ) {
    console.log("getMultiSigKey");
    if (info.encryptSecKey && Object.keys(shares).includes(this.address)) {
      console.log("getMultiSigKey start");

      //シェアキーの公開鍵暗号を秘密鍵で解除
      const key = crypto.privateDecrypt(
        this.b.cypher.secKey,
        Buffer.from(shares[this.address], "base64")
      );

      console.log("getMultiSigKey get my key", key);

      //マルチシグ情報を保存
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

  //マルチシグのトランザクションを生成
  makeMultiSigTransaction(multisigAddress: string) {
    console.log("makeMultiSigTransaction start");

    //マルチシグアドレスの情報を自分が持っているのか
    const data = this.multiSig[multisigAddress];
    if (!data) return;
    const multisigPubKey = data.pubKey;

    //自分の持っているシェアキーを公開鍵で暗号化
    const shareKeyRsa = crypto
      .publicEncrypt(this.b.cypher.pubKey, Buffer.from(data.myShare, "base64"))
      .toString("base64");

    //ブロックチェーンに載せる情報
    const info: multisigInfo = {
      ownerPubKey: this.b.cypher.pubKey,
      multisigPubKey,
      multisigAddress,
      sharePubKeyRsa: shareKeyRsa,
      threshold: data.threshold
    };
    //マルチシグ情報にトランザクション実行者フラグを立てる
    data.isOwner = true;

    //マルチシグアドレスの残高を取得
    const amount = this.b.nowAmount(multisigAddress);
    console.log("multisig tran", { amount });

    //トランザクションを生成
    const tran = this.b.newTransaction(this.b.address, multisigAddress, 0, {
      type: type.MULTISIG,
      opt: type.TRAN,
      amount,
      info
    });
    console.log("makeMultiSigTransaction done", { tran });
    return tran;
  }

  //イベントコールバックに任せる
  private onMultiSigTransaction(info: multisigInfo) {
    if (Object.keys(this.multiSig).includes(info.multisigAddress)) {
      console.log("onMultisigTran");
      this.excuteEvent(this.onMultisigTran, info);
    }
  }

  //マルチシグの承認
  approveMultiSig(info: multisigInfo) {
    console.log("approveMultiSig");
    if (info.ownerPubKey) {
      //マルチシグの情報があるかを調べる
      if (Object.keys(this.multiSig).includes(info.multisigAddress)) {
        console.log("approveMultiSig start");

        //シェアキーを取り出す
        const key = this.multiSig[info.multisigAddress].myShare;
        //シェアキーをマルチシグトランザクション実行者の公開鍵で暗号化
        const shareKeyRsa = crypto
          .publicEncrypt(info.ownerPubKey, Buffer.from(key, "base64"))
          .toString("base64");
        info.sharePubKeyRsa = shareKeyRsa;
        //トランザクションを生成
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
        console.log("approveMultiSig done", { tran });
        return tran;
      }
    }
  }

  //マルチシグトランザクション実行者の関数
  private onApproveMultiSig(info: multisigInfo) {
    if (
      info.sharePubKeyRsa &&
      info.ownerPubKey === this.b.cypher.pubKey &&
      Object.keys(this.multiSig).includes(info.multisigAddress)
    ) {
      console.log("type.APPROVE");
      const shares = this.multiSig[info.multisigAddress].shares;
      
      //シェアキーの公開鍵暗号を自身の秘密鍵で解除
      const shareKey = crypto.privateDecrypt(
        this.b.cypher.secKey,
        Buffer.from(info.sharePubKeyRsa, "base64")
      );

      //新しいシェアキーなら保存する。
      if (!shares.includes(shareKey)) {
        console.log("add sharekey", { shareKey });
        shares.push(shareKey);
      }

      //シェアキーの数がしきい値を超えればトランザクションを承認
      if (shares.length >= info.threshold) {
        console.log("verify multisig", { shares });
        //トランザクションの承認関数
        this.verifyMultiSig(info, shares);
        this.excuteEvent(this.onMultisigTranDone);
      }
    }
  }

  //トランザクションの承認
  verifyMultiSig(info: multisigInfo, shares: Array<any>) {
    console.log("verifyMultiSig start", { shares });
    //シャミアのシェアキーからシークレットを復号化
    const recovered = sss.combine(shares).toString();
    console.log({ recovered });

    //aes暗号化されたシークレットキーを取り出す。
    const encryptedKey = this.multiSig[info.multisigAddress].encryptSecKey;
    //aes暗号を復号化
    const secKey = aes256.decrypt(recovered, encryptedKey);
    console.log({ secKey });
    const cypher = new Cypher(secKey, info.multisigPubKey);
    const address = info.multisigAddress;
    //マルチシグアドレスの残高を取得
    const amount = this.b.nowAmount(address);
    //残高があればトランザクションを実行
    if (amount > 0) {
      const tran = this.b.newTransaction(
        address,
        this.b.address,
        amount,
        { comment: "verifyMultiSig" },
        cypher
      );
      console.log("verifyMultiSig done", { tran });
      return tran;
    }
  }
}
