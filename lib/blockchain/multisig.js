"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const interface_1 = require("./interface");
const sha256_1 = __importDefault(require("sha256"));
const cypher_1 = __importDefault(require("./crypto/cypher"));
const util_1 = require("../util");
const buffer_1 = require("./crypto/buffer");
const Buffer = require("buffer/").Buffer;
var aes256 = require("aes256");
const sss = require("shamirs-secret-sharing");
var type;
(function (type) {
    type["MAKE"] = "multisig-make";
    type["TRAN"] = "multisig-tran";
    type["APPROVE"] = "multisig-approve";
    type["MULTISIG"] = "multisig";
})(type = exports.type || (exports.type = {}));
class Multisig {
    constructor(blockchain) {
        this.multiSig = {};
        this.onMultisigTran = {};
        this.onMultisigTranDone = {};
        this.events = {
            onMultisigTran: this.onMultisigTran,
            onMultisigTranDone: this.onMultisigTranDone
        };
        this.b = blockchain;
        this.address = this.b.address;
    }
    //通信などにより得られた命令に対する処理
    responder(tran) {
        const data = tran.data;
        if (data.type === interface_1.ETransactionType.multisig) {
            const tranMultisig = data.payload;
            switch (tranMultisig.opt) {
                case type.MAKE:
                    {
                        //トランザクションからマルチシグの情報を取得
                        this.getMultiSigKey(tranMultisig.shares, tranMultisig.info);
                    }
                    break;
                case type.TRAN:
                    {
                        //イベントの準備
                        this.onMultiSigTransaction(tranMultisig.info);
                    }
                    break;
                case type.APPROVE:
                    {
                        this.onApproveMultiSig(tranMultisig.info);
                    }
                    break;
            }
        }
    }
    //マルチシグのアドレスを生成
    makeNewMultiSigAddress(friendsPubKeyAes, //共有者の情報
    friendsPubkeyRsaPass, vote, //しきい値
    amount //金額
    ) {
        const cypher = new cypher_1.default();
        //シャミアの秘密分散ライブラリでaeskeyをシェア化
        const shareKeys = sss.split(Buffer.from(cypher.phrase), {
            shares: friendsPubKeyAes.length + 1,
            threshold: vote
        });
        //マルチシグアドレスを導出
        const address = sha256_1.default(cypher.pubKey);
        const shares = {};
        //シェアの共有者にシェアを配布
        friendsPubKeyAes.forEach((aes, i) => {
            const pubKey = aes256.decrypt(friendsPubkeyRsaPass, aes);
            const id = sha256_1.default(pubKey);
            //共有者の公開鍵でシェアを暗号化
            shares[id] = cypher.encrypt(buffer_1.bufferToHex(shareKeys[i]), pubKey);
        });
        //自身にシェアを一つ割当
        const myShare = buffer_1.bufferToHex(shareKeys[shareKeys.length - 1]);
        //マルチシグの情報を保管
        this.multiSig[address] = {
            myShare,
            threshold: vote,
            isOwner: false,
            pubKey: cypher.pubKey,
            shares: []
        };
        this.multiSig[address].shares.push(myShare);
        //ブロックチェーンに載せるマルチシグ情報
        const info = {
            multisigPubKey: cypher.pubKey,
            multisigAddress: address,
            threshold: vote
        };
        //トランザクションを生成
        const tran = this.b.newTransaction(this.b.address, address, amount, {
            type: interface_1.ETransactionType.multisig,
            payload: { opt: type.MAKE, shares, info }
        });
        return tran;
    }
    //トランザクションからマルチシグの情報を取得
    getMultiSigKey(shares, info) {
        if (Object.keys(shares).includes(this.address)) {
            //シェアキーの公開鍵暗号を秘密鍵で解除
            const key = this.b.cypher.decrypt(shares[this.address]);
            //マルチシグ情報を保存
            this.multiSig[info.multisigAddress] = {
                myShare: key,
                isOwner: false,
                threshold: info.threshold,
                pubKey: info.multisigPubKey,
                shares: []
            };
        }
    }
    //マルチシグのトランザクションを生成
    makeMultiSigTransaction(multisigAddress) {
        //マルチシグアドレスの情報を自分が持っているのか
        const data = this.multiSig[multisigAddress];
        if (!data)
            return;
        const multisigPubKey = data.pubKey;
        //自分の持っているシェアキーを暗号化
        const shareKeyRsa = this.b.cypher.encrypt(data.myShare, this.b.cypher.pubKey);
        //ブロックチェーンに載せる情報
        const info = {
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
        //トランザクションを生成
        const tran = this.b.newTransaction(this.b.address, multisigAddress, 0, {
            type: interface_1.ETransactionType.multisig,
            payload: {
                opt: type.TRAN,
                amount,
                info
            }
        });
        return tran;
    }
    //イベントコールバックに任せる
    onMultiSigTransaction(info) {
        if (Object.keys(this.multiSig).includes(info.multisigAddress)) {
            //承認するかどうかを決めたいので、イベントを一回挟んでいる。
            util_1.excuteEvent(this.onMultisigTran, info);
        }
    }
    //マルチシグの承認
    approveMultiSig(info) {
        if (info.ownerPubKey) {
            //マルチシグの情報があるかを調べる
            if (Object.keys(this.multiSig).includes(info.multisigAddress)) {
                //シェアキーを取り出す
                const key = this.multiSig[info.multisigAddress].myShare;
                const shareKeyRsa = this.b.cypher.encrypt(key, info.ownerPubKey);
                info.sharePubKeyRsa = shareKeyRsa;
                //トランザクションを生成
                const tran = this.b.newTransaction(this.b.address, info.multisigAddress, 0, {
                    type: interface_1.ETransactionType.multisig,
                    payload: {
                        opt: type.APPROVE,
                        info: info
                    }
                });
                return tran;
            }
        }
    }
    //マルチシグトランザクション実行者の関数
    onApproveMultiSig(info) {
        if (info.sharePubKeyRsa &&
            info.ownerPubKey === this.b.cypher.pubKey &&
            Object.keys(this.multiSig).includes(info.multisigAddress)) {
            const shares = this.multiSig[info.multisigAddress].shares;
            const shareKey = this.b.cypher.decrypt(info.sharePubKeyRsa);
            //新しいシェアキーなら保存する。
            if (!shares.includes(shareKey)) {
                shares.push(shareKey);
            }
            //シェアキーの数がしきい値を超えればトランザクションを承認
            if (shares.length >= info.threshold) {
                //トランザクションの承認関数
                this.verifyMultiSig(info, shares);
            }
        }
    }
    //トランザクションの承認
    verifyMultiSig(info, _shares) {
        //シャミアのシェアキーからシークレットを復号化
        const shares = _shares.map(share => buffer_1.hexToBuffer(share));
        const phrase = sss.combine(shares).toString();
        const cypher = new cypher_1.default(phrase);
        const address = info.multisigAddress;
        //マルチシグアドレスの残高を取得
        const amount = this.b.nowAmount(address);
        //残高があればトランザクションを実行
        if (amount > 0) {
            const tran = this.b.newTransaction(address, this.b.address, amount, { type: interface_1.ETransactionType.transaction, payload: "verifymultisig" }, cypher);
            util_1.excuteEvent(this.onMultisigTranDone);
            return tran;
        }
    }
}
exports.default = Multisig;
//# sourceMappingURL=multisig.js.map