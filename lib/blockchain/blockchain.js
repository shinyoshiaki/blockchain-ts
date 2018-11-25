"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sha256_1 = __importDefault(require("sha256"));
const decimal_js_1 = require("decimal.js");
const cypher_1 = __importDefault(require("./crypto/cypher"));
const type_1 = __importDefault(require("./type"));
const interface_1 = require("./interface");
const diff = /^000/;
class BlockChain {
    constructor(phrase) {
        this.chain = [];
        this.currentTransactions = [];
        this.callback = {
            onAddBlock: (v) => { }
        };
        this.onAddBlock = {};
        this.onTransaction = {};
        this.events = {
            onAddBlock: this.onAddBlock,
            onTransaction: this.onTransaction
        };
        this.cypher = new cypher_1.default(phrase);
        this.address = sha256_1.default(this.cypher.pubKey);
        this.newBlock(0, "genesis");
    }
    hash(obj) {
        const objString = JSON.stringify(obj, Object.keys(obj).sort());
        return sha256_1.default(objString);
    }
    jsonStr(obj) {
        return JSON.stringify(obj, Object.keys(obj).sort());
    }
    newBlock(proof, previousHash) {
        //採掘報酬
        this.newTransaction(type_1.default.SYSTEM, this.address, 1, {
            type: interface_1.ETransactionType.transaction,
            payload: "reward"
        });
        const block = {
            index: this.chain.length + 1,
            timestamp: Date.now(),
            transactions: this.currentTransactions,
            proof: proof,
            previousHash: previousHash || this.hash(this.lastBlock()),
            owner: this.address,
            publicKey: this.cypher.pubKey,
            sign: "" //このブロックを作った人の署名
        };
        //署名を生成
        block.sign = this.cypher.signMessage(this.hash(block)).signature;
        //ブロックチェーンに追加
        this.chain.push(block);
        //トランザクションプールをリセット
        this.currentTransactions = [];
        console.log("new block done", this.chain);
        return block;
    }
    newTransaction(sender, recipient, amount, data, cypher = this.cypher) {
        const tran = {
            sender: sender,
            recipient: recipient,
            amount: amount,
            data: data,
            now: Date.now(),
            publicKey: cypher.pubKey,
            nonce: this.getNonce(),
            sign: "" //署名
        };
        tran.sign = cypher.signMessage(this.hash(tran)).signature;
        //トランザクションを追加
        this.currentTransactions.push(tran);
        return tran;
    }
    lastBlock(blockchain = this.chain) {
        return blockchain[blockchain.length - 1];
    }
    addBlock(block) {
        if (this.validBlock(block)) {
            console.log("validBlock");
            this.currentTransactions = [];
            this.chain.push(block);
            this.callback.onAddBlock();
            this.excuteEvent(this.events.onAddBlock);
        }
    }
    excuteEvent(ev, v) {
        console.log("excuteEvent", ev);
        Object.keys(ev).forEach(key => {
            ev[key](v);
        });
    }
    validBlock(block) {
        const lastBlock = this.lastBlock();
        const lastProof = lastBlock.proof;
        const lastHash = this.hash(lastBlock);
        const owner = block.owner;
        const sign = block.sign;
        const publicKey = block.publicKey;
        block.sign = "";
        //署名が正しいかどうか
        if (this.cypher.verifyMessage({
            message: this.hash(block),
            publicKey,
            signature: sign
        })) {
            block.sign = sign;
            //ナンスが正しいかどうか
            if (this.validProof(lastProof, block.proof, lastHash, owner)) {
                return true;
            }
            else {
                console.log("block nonce error", this.address, this.chain);
                return false;
            }
        }
        else {
            console.log("block sign error", this.address);
            return false;
        }
    }
    validProof(lastProof, proof, lastHash, address) {
        const guess = `${lastProof}${proof}${lastHash}${address}`;
        const guessHash = sha256_1.default(guess);
        //先頭から４文字が０なら成功
        return diff.test(guessHash);
    }
    validChain(chain) {
        let index = 2;
        while (index < chain.length) {
            const previousBlock = chain[index - 1];
            const block = chain[index];
            //ブロックの持つ前のブロックのハッシュ値と実際の前の
            //ブロックのハッシュ値を比較
            if (block.previousHash !== this.hash(previousBlock)) {
                return false;
            }
            //ナンスの値の検証
            if (!this.validProof(previousBlock.proof, block.proof, this.hash(block), block.owner)) {
                return false;
            }
            index++;
        }
        return true;
    }
    validTransaction(transaction) {
        const amount = transaction.amount;
        const sign = transaction.sign;
        const result = this.currentTransactions.find(prev => {
            return prev.sign === sign;
        });
        if (result) {
            console.log("duplicate error", { result });
            return false;
        }
        const publicKey = transaction.publicKey;
        const address = transaction.sender;
        transaction.sign = "";
        //公開鍵が送金者のものかどうか
        if (sha256_1.default(publicKey) === address) {
            //署名が正しいかどうか
            //公開鍵で署名を解読しトランザクションのハッシュ値と一致することを確認する。
            if (this.cypher.verifyMessage({
                message: this.hash(transaction),
                publicKey,
                signature: sign
            })) {
                const balance = this.nowAmount(address);
                //送金可能な金額を超えているかどうか
                if (balance >= amount) {
                    //消した署名を戻す
                    transaction.sign = sign;
                    return true;
                }
                else {
                    console.log("balance error", amount, balance);
                    return false;
                }
            }
            else {
                console.log("sign error");
                return false;
            }
        }
        else {
            console.log("pubkey error");
            return false;
        }
    }
    addTransaction(tran) {
        if (this.validTransaction(tran)) {
            console.log("validTransaction", { tran });
            //トランザクションを追加
            this.currentTransactions.push(tran);
            this.excuteEvent(this.events.onTransaction);
        }
        else {
            console.log("error Transaction");
        }
    }
    proofOfWork() {
        const lastBlock = this.lastBlock();
        const lastProof = lastBlock.proof;
        const lastHash = this.hash(lastBlock);
        let proof = 0;
        while (!this.validProof(lastProof, proof, lastHash, this.address)) {
            //ナンスの値を試行錯誤的に探す
            proof++;
        }
        return proof;
    }
    nowAmount(address = this.address) {
        let tokenNum = new decimal_js_1.Decimal(0.0);
        this.chain.forEach(block => {
            block.transactions.forEach((transaction) => {
                if (transaction.recipient === address) {
                    tokenNum = tokenNum.plus(new decimal_js_1.Decimal(parseFloat(transaction.amount)));
                }
                if (transaction.sender === address) {
                    tokenNum = tokenNum.minus(new decimal_js_1.Decimal(parseFloat(transaction.amount)));
                }
            });
        });
        this.currentTransactions.forEach(transaction => {
            if (transaction.recipient === address) {
                tokenNum = tokenNum.plus(new decimal_js_1.Decimal(parseFloat(transaction.amount)));
            }
            if (transaction.sender === address) {
                tokenNum = tokenNum.minus(new decimal_js_1.Decimal(parseFloat(transaction.amount)));
            }
        });
        return tokenNum.toNumber();
    }
    getNonce(address = this.address) {
        let nonce = 0;
        this.chain.forEach(block => {
            block.transactions.forEach((transaction) => {
                if (transaction.sender === address) {
                    nonce++;
                }
            });
        });
        this.currentTransactions.forEach(transaction => {
            if (transaction.recipient === address) {
                nonce++;
            }
        });
        return nonce;
    }
}
exports.default = BlockChain;
//# sourceMappingURL=blockchain.js.map