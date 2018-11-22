"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("babel-polyfill");
const blockchain_1 = __importDefault(require("./blockchain"));
const sha1_1 = __importDefault(require("sha1"));
const multisig_1 = __importDefault(require("./multisig"));
const responder_1 = __importDefault(require("./responder"));
class BlockChainApp extends blockchain_1.default {
    constructor(secKey, pubKey) {
        super(secKey, pubKey);
        this.multisig = new multisig_1.default(this);
        this.responder = new responder_1.default(this);
        this.responder.events.onTransaction["multisig"] = (body) => {
            this.multisig.responder(body);
        };
    }
    mine() {
        //非同期処理
        return new Promise(resolve => {
            //プルーフオブワーク(ナンスの探索)
            const proof = this.proofOfWork();
            //最後のブロックのハッシュ値
            const previousHash = this.hash(this.lastBlock());
            //新しいブロック
            const block = this.newBlock(proof, previousHash);
            console.log("new block forged", { block });
            // this.saveChain();
            //完了
            resolve(block);
        });
    }
    makeTransaction(recipient, amount, data) {
        //入力情報が足りているか
        if (!(recipient && amount)) {
            console.log("input error");
            return;
        }
        //残高が足りているか
        if (amount > this.nowAmount()) {
            console.log("input error");
            return;
        }
        //トランザクションの生成
        const tran = this.newTransaction(this.address, recipient, amount, data);
        console.log("makeTransaction", tran);
        this.saveChain();
        return tran;
    }
    getChain() {
        return this.chain;
    }
    saveChain() {
        localStorage.setItem("blockchain", JSON.stringify(this.chain));
    }
    loadChain() {
        const keyword = sha1_1.default(this.cypher.pubKey + this.cypher.secKey);
        localStorage.setItem(keyword, JSON.stringify({
            publicKey: this.cypher.pubKey,
            secretKey: this.cypher.secKey
        }));
        const chain = localStorage.getItem("blockchain");
        if (chain) {
            this.chain = JSON.parse(chain);
        }
    }
}
exports.default = BlockChainApp;
//# sourceMappingURL=blockchainApp.js.map