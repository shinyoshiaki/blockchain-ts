"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const blockchainApp_1 = __importDefault(require("../../blockchain/blockchainApp"));
const responder_1 = require("../../blockchain/responder");
const cypher_1 = __importDefault(require("../../blockchain/crypto/cypher"));
var aes256 = require("aes256");
main();
async function main() {
    //マルチシグトランザクションを作る役(作成役とする)
    const bc1 = new blockchainApp_1.default();
    //シェアキー共有者
    const friends = [];
    const cypher = new cypher_1.default();
    friends.push(aes256.encrypt("format", cypher.pubKey));
    //承認者１
    const bc2 = new blockchainApp_1.default(cypher.phrase);
    const cypher2 = new cypher_1.default();
    friends.push(aes256.encrypt("format", cypher2.pubKey));
    //承認者２
    const bc3 = new blockchainApp_1.default(cypher2.phrase);
    //作成役がマイニングしてトークンを稼ぐ
    const block = await bc1.mine();
    console.log({ block });
    console.log("amount", bc1.address, bc1.nowAmount(bc1.address));
    //作成役と承認者のブロックチェーンのフォークを解決
    bc2.chain = bc1.chain;
    bc3.chain = bc1.chain;
    bc1.multisig.events.onMultisigTranDone["test multisig"] = () => {
        console.log("multisig test done");
        ava_1.default("multisig", test => {
            test.pass();
        });
    };
    //承認者が承認するためのコールバックを用意
    bc2.multisig.events.onMultisigTran["test approve"] = (info) => {
        const tran = bc2.multisig.approveMultiSig(info);
        //マルチシグの承認
        if (tran)
            bc1.responder.runRPC({ type: responder_1.typeRPC.TRANSACRION, body: tran });
    };
    bc3.multisig.events.onMultisigTran["test approve"] = (info) => {
        const tran = bc3.multisig.approveMultiSig(info);
        if (tran)
            bc1.responder.runRPC({ type: responder_1.typeRPC.TRANSACRION, body: tran });
    };
    //作成役がマルチシグアドレスを生成
    let tran = bc1.multisig.makeNewMultiSigAddress(friends, "format", 3, 1);
    //承認者がマルチシグアドレスのトランザクションをresponderに渡す
    bc2.responder.runRPC({ type: responder_1.typeRPC.TRANSACRION, body: tran });
    bc3.responder.runRPC({ type: responder_1.typeRPC.TRANSACRION, body: tran });
    const multisigAddress = Object.keys(bc1.multisig.multiSig)[0];
    //マルチシグトランザクションを作成
    tran = bc1.multisig.makeMultiSigTransaction(multisigAddress);
    //マルチシグトランザクションをresponderに渡す。
    if (tran)
        bc2.responder.runRPC({ type: responder_1.typeRPC.TRANSACRION, body: tran });
    if (tran)
        bc3.responder.runRPC({ type: responder_1.typeRPC.TRANSACRION, body: tran });
}
//# sourceMappingURL=multisig.test.js.map