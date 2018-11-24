"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../util");
var typeRPC;
(function (typeRPC) {
    typeRPC["NEWBLOCK"] = "NEWBLOCK";
    typeRPC["TRANSACRION"] = "TRANSACRION";
    typeRPC["CONFLICT"] = "CONFLICT";
    typeRPC["RESOLVE_CONFLICT"] = "RESOLVE_CONFLICT";
})(typeRPC = exports.typeRPC || (exports.typeRPC = {}));
class Responder {
    constructor(_bc) {
        this.callback = {
            checkConflict: () => { },
            onConflict: () => { }
        };
        this.onTransaction = {};
        this.events = { onTransaction: this.onTransaction };
        this.RPC = {};
        this.bc = _bc;
        this.RPC[typeRPC.NEWBLOCK] = async (block) => {
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
        this.RPC[typeRPC.TRANSACRION] = (body) => {
            console.log("blockchainApp transaction", body);
            if (
            //トランザクションプールに受け取ったトランザクションがあるか簡易的に調べる
            !this.bc
                .jsonStr(this.bc.currentTransactions)
                .includes(this.bc.jsonStr(body))) {
                //トランザクションをトランザクションプールに加える
                this.bc.addTransaction(body);
                this.bc.multisig.responder(body);
                this.bc.contract.responder(body);
                util_1.excuteEvent(this.onTransaction, body);
            }
        };
        this.RPC[typeRPC.CONFLICT] = (body) => {
            console.log("blockchain app check conflict");
            //自分のチェーンが質問者より長ければ、自分のチェーンを返す
            if (this.bc.chain.length > body.size) {
                console.log("blockchain app check is conflict");
                this.callback.onConflict(this.bc.chain, body.nodeId);
            }
        };
        this.RPC[typeRPC.RESOLVE_CONFLICT] = (chain) => {
            if (this.onResolveConflict)
                this.onResolveConflict(chain);
        };
    }
    runRPC(rpc) {
        if (Object.keys(this.RPC).includes(rpc.type))
            this.RPC[rpc.type](rpc.body);
    }
    checkConflicts() {
        return new Promise((resolve, reject) => {
            console.log("checkConflicts");
            //タイムアウト
            const timeout = setTimeout(() => {
                reject("checkconflicts timeout");
            }, 4 * 1000);
            //他のノードにブロックチェーンの状況を聞く
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