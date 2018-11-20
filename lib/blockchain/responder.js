"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var type;
(function (type) {
    type["NEWBLOCK"] = "NEWBLOCK";
    type["TRANSACRION"] = "TRANSACRION";
    type["CONFLICT"] = "CONFLICT";
    type["RESOLVE_CONFLICT"] = "RESOLVE_CONFLICT";
})(type = exports.type || (exports.type = {}));
class Responder {
    constructor(_bc) {
        this.RPC = {};
        this.bc = _bc;
        this.RPC[type.NEWBLOCK] = async (block) => {
            console.log("blockchainApp", "new block");
            //受け取ったブロックのインデックスが自分のチェーンより2長いか
            //現時点のチェーンの長さが1ならブロックチェーンの分岐を疑う
            if (block.index > this.bc.chain.length + 1 ||
                this.bc.chain.length === 1) {
                //ブロックチェーンの分岐を調べる
                await this.checkConflicts().catch(console.log);
            }
            else {
                //新しいブロックを受け入れる
                this.bc.addBlock(block);
            }
        };
        //トランザクションに対する処理
        this.RPC[type.TRANSACRION] = (body) => {
            console.log("blockchainApp transaction", body);
            if (
            //トランザクションプールに受け取ったトランザクションがあるか簡易的に調べる
            !this.bc
                .jsonStr(this.bc.currentTransactions)
                .includes(this.bc.jsonStr(body))) {
                //トランザクションをトランザクションプールに加える
                this.bc.addTransaction(body);
            }
        };
        this.RPC[type.CONFLICT] = (body) => {
            console.log("blockchain app check conflict");
            //自分のチェーンが質問者より長ければ、自分のチェーンを返す
            if (this.bc.chain.length > body.size) {
                console.log("blockchain app check is conflict");
                if (this.callback)
                    this.callback.onConflict(this.bc.chain, body.nodeId);
            }
        };
        this.RPC[type.RESOLVE_CONFLICT] = (chain) => {
            if (this.onResolveConflict)
                this.onResolveConflict(chain);
        };
    }
    runRPC(name, body) {
        if (Object.keys(this.RPC).includes(name))
            this.RPC[name](body);
    }
    checkConflicts() {
        return new Promise((resolve, reject) => {
            console.log("checkConflicts");
            //タイムアウト
            const timeout = setTimeout(() => {
                reject("checkconflicts timeout");
            }, 4 * 1000);
            //他のノードにブロックチェーンの状況を聞く
            if (this.callback)
                this.callback.checkConflict();
            //他のノードからの回答を調べる
            this.onResolveConflict = (chain) => {
                console.log("onResolveConflict");
                if (this.bc.chain.length < chain.length) {
                    if (this.bc.validChain(chain)) {
                        this.bc.chain = chain;
                    }
                    else {
                        console.log("conflict wrong chain");
                    }
                }
                clearTimeout(timeout);
                resolve(true);
            };
        });
    }
}
exports.default = Responder;
//# sourceMappingURL=responder.js.map