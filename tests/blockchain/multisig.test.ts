import BlockChain from "../../src/blockchain/blockchainApp";
import { multisigInfo } from "../../src/blockchain/interface";
import { typeRPC } from "../../src/blockchain/responder";
import Cypher from "../../src/blockchain/crypto/cypher";
const aes256 = require("aes256");

console.log("multisig test");
//マルチシグトランザクションを作る役(作成役とする)
const bc1 = new BlockChain();

test("blockchain/multisig", () => {
  bc1.multisig.events.onMultisigTranDone["test multisig"] = () => {
    expect("").toBe("");
  };
});

//シェアキー共有者
const friends: any[] = [];

const cypher = new Cypher();
friends.push(aes256.encrypt("format", cypher.pubKey));
//承認者１
const bc2 = new BlockChain({ phrase: cypher.phrase });

const cypher2 = new Cypher();
friends.push(aes256.encrypt("format", cypher2.pubKey));
//承認者２
const bc3 = new BlockChain({ phrase: cypher2.phrase });

//承認者が承認するためのコールバックを用意
bc2.multisig.events.onMultisigTran["test approve"] = (info: multisigInfo) => {
  const tran = bc2.multisig.approveMultiSig(info);
  //マルチシグの承認
  if (tran) bc1.responder.runRPC({ type: typeRPC.TRANSACRION, body: tran });
};
bc3.multisig.events.onMultisigTran["test approve"] = (info: multisigInfo) => {
  const tran = bc3.multisig.approveMultiSig(info);
  if (tran) bc1.responder.runRPC({ type: typeRPC.TRANSACRION, body: tran });
};

main();

async function main() {
  //作成役がマイニングしてトークンを稼ぐ
  await bc1.mine();

  //作成役と承認者のブロックチェーンのフォークを解決
  bc2.chain = bc1.chain;
  bc3.chain = bc1.chain;

  //作成役がマルチシグアドレスを生成
  let tran: any = bc1.multisig.makeNewMultiSigAddress(friends, "format", 3, 1);

  //承認者がマルチシグアドレスのトランザクションをresponderに渡す
  bc2.responder.runRPC({ type: typeRPC.TRANSACRION, body: tran });
  bc3.responder.runRPC({ type: typeRPC.TRANSACRION, body: tran });

  const multisigAddress = Object.keys(bc1.multisig.multiSig)[0];
  //マルチシグトランザクションを作成
  tran = bc1.multisig.makeMultiSigTransaction(multisigAddress);

  //マルチシグトランザクションをresponderに渡す。
  if (tran) bc2.responder.runRPC({ type: typeRPC.TRANSACRION, body: tran });
  if (tran) bc3.responder.runRPC({ type: typeRPC.TRANSACRION, body: tran });
}
