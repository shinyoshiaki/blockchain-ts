"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sha256_1 = __importDefault(require("sha256"));
const cypher_1 = __importDefault(require("./cypher"));
const crypto_browserify_1 = __importDefault(require("crypto-browserify"));
const sha1_1 = __importDefault(require("sha1"));
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
//グローバルに置くと(ここ)staticになるかも
class Multisig {
    constructor(blockchain) {
        this.multiSig = {};
        this.onMultisigTran = {};
        this.onMultisigTranDone = {};
        this.events = {
            onMultisigTran: this.onMultisigTran
        };
        this.b = blockchain;
        console.log("address", this.b.address);
        this.address = this.b.address;
    }
    excuteEvent(ev, v) {
        console.log("excuteEvent", ev);
        Object.keys(ev).forEach(key => {
            ev[key](v);
        });
    }
    //通信などにより得られた命令に対する処理
    responder(tran) {
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
        }
        catch (error) { }
    }
    //マルチシグのアドレスを生成
    makeNewMultiSigAddress(friendsPubKeyAes, //共有者の情報
    vote, //しきい値
    amount //金額
    ) {
        console.log(this.makeNewMultiSigAddress);
        //秘密鍵と公開鍵を生成
        const cypher = new cypher_1.default();
        //次に使うaeskeyを生成
        const aesKey = sha1_1.default(Math.random().toString()).toString();
        console.log({ aesKey });
        //aeskeyで秘密鍵を暗号化
        const encryptSecKey = aes256.encrypt(aesKey, cypher.secKey);
        //シャミアの秘密分散ライブラリでaeskeyをシェア化
        const shareKeys = sss.split(Buffer.from(aesKey), {
            shares: friendsPubKeyAes.length + 1,
            threshold: vote
        });
        console.log({ shareKeys });
        //マルチシグアドレスを導出
        const address = sha256_1.default(cypher.pubKey);
        const shares = {};
        //シェアの共有者にシェアを配布
        friendsPubKeyAes.forEach((aes, i) => {
            const pubKey = aes256.decrypt("format", aes);
            const id = sha256_1.default(pubKey);
            console.log("makeNewMultiSigAddress sharekey", shareKeys[i]);
            //共有者の公開鍵でシェアを暗号化
            shares[id] = crypto_browserify_1.default
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
        const info = {
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
    getMultiSigKey(shares, info) {
        console.log("getMultiSigKey");
        if (info.encryptSecKey && Object.keys(shares).includes(this.address)) {
            console.log("getMultiSigKey start");
            //シェアキーの公開鍵暗号を秘密鍵で解除
            const key = crypto_browserify_1.default.privateDecrypt(this.b.cypher.secKey, Buffer.from(shares[this.address], "base64"));
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
    makeMultiSigTransaction(multisigAddress) {
        console.log("makeMultiSigTransaction start");
        //マルチシグアドレスの情報を自分が持っているのか
        const data = this.multiSig[multisigAddress];
        if (!data)
            return;
        const multisigPubKey = data.pubKey;
        //自分の持っているシェアキーを公開鍵で暗号化
        const shareKeyRsa = crypto_browserify_1.default
            .publicEncrypt(this.b.cypher.pubKey, Buffer.from(data.myShare, "base64"))
            .toString("base64");
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
    onMultiSigTransaction(info) {
        if (Object.keys(this.multiSig).includes(info.multisigAddress)) {
            console.log("onMultisigTran");
            this.excuteEvent(this.onMultisigTran, info);
        }
    }
    //マルチシグの承認
    approveMultiSig(info) {
        console.log("approveMultiSig");
        if (info.ownerPubKey) {
            //マルチシグの情報があるかを調べる
            if (Object.keys(this.multiSig).includes(info.multisigAddress)) {
                console.log("approveMultiSig start");
                //シェアキーを取り出す
                const key = this.multiSig[info.multisigAddress].myShare;
                //シェアキーをマルチシグトランザクション実行者の公開鍵で暗号化
                const shareKeyRsa = crypto_browserify_1.default
                    .publicEncrypt(info.ownerPubKey, Buffer.from(key, "base64"))
                    .toString("base64");
                info.sharePubKeyRsa = shareKeyRsa;
                //トランザクションを生成
                const tran = this.b.newTransaction(this.b.address, info.multisigAddress, 0, {
                    type: type.MULTISIG,
                    opt: type.APPROVE,
                    info: info
                });
                console.log("approveMultiSig done", { tran });
                return tran;
            }
        }
    }
    //マルチシグトランザクション実行者の関数
    onApproveMultiSig(info) {
        if (info.sharePubKeyRsa &&
            info.ownerPubKey === this.b.cypher.pubKey &&
            Object.keys(this.multiSig).includes(info.multisigAddress)) {
            console.log("type.APPROVE");
            const shares = this.multiSig[info.multisigAddress].shares;
            //シェアキーの公開鍵暗号を自身の秘密鍵で解除
            const shareKey = crypto_browserify_1.default.privateDecrypt(this.b.cypher.secKey, Buffer.from(info.sharePubKeyRsa, "base64"));
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
    verifyMultiSig(info, shares) {
        console.log("verifyMultiSig start", { shares });
        //シャミアのシェアキーからシークレットを復号化
        const recovered = sss.combine(shares).toString();
        console.log({ recovered });
        //aes暗号化されたシークレットキーを取り出す。
        const encryptedKey = this.multiSig[info.multisigAddress].encryptSecKey;
        //aes暗号を復号化
        const secKey = aes256.decrypt(recovered, encryptedKey);
        console.log({ secKey });
        const cypher = new cypher_1.default(secKey, info.multisigPubKey);
        const address = info.multisigAddress;
        //マルチシグアドレスの残高を取得
        const amount = this.b.nowAmount(address);
        //残高があればトランザクションを実行
        if (amount > 0) {
            const tran = this.b.newTransaction(address, this.b.address, amount, { comment: "verifyMultiSig" }, cypher);
            console.log("verifyMultiSig done", { tran });
            return tran;
        }
    }
}
exports.default = Multisig;
//# sourceMappingURL=multisig.js.map