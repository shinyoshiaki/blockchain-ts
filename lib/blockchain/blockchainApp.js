"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("babel-polyfill");
const blockchain_1 = __importDefault(require("./blockchain"));
const multisig_1 = __importDefault(require("./multisig"));
const responder_1 = __importStar(require("./responder"));
const contract_1 = __importDefault(require("../contract/contract"));
class BlockChainApp extends blockchain_1.default {
    constructor(phrase) {
        super(phrase);
        this.multisig = new multisig_1.default(this);
        this.contract = new contract_1.default(this);
        this.responder = new responder_1.default(this);
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
        return tran;
    }
    transactionRPC(tran) {
        const rpc = { type: responder_1.typeRPC.TRANSACRION, body: tran };
        return rpc;
    }
}
exports.default = BlockChainApp;
//# sourceMappingURL=blockchainApp.js.map