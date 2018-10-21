import BlockChain from "../../blockchain/blockchainApp";
import keypair from "keypair";
import { multisigInfo } from "../../blockchain/interface";
var aes256 = require("aes256");

main();

async function main() {
  //マルチシグトランザクションを作る役(作成役とする)
  const bc1 = new BlockChain();

  //シェアキー共有者
  const friends = [];

  const cypher = keypair();
  friends.push(aes256.encrypt("format", cypher.public));
  //承認者１
  const bc2 = new BlockChain(cypher.private, cypher.public);

  const cypher2 = keypair();
  friends.push(aes256.encrypt("format", cypher2.public));
  //承認者２
  const bc3 = new BlockChain(cypher2.private, cypher2.public);

  //作成役がマイニングしてトークンを稼ぐ
  const block = await bc1.mine();
  console.log({ block });
  console.log("amount", bc1.address, bc1.nowAmount(bc1.address));

  //作成役と承認者のブロックチェーンのフォークを解決
  bc2.chain = bc1.chain;
  bc3.chain = bc1.chain;

  //作成役がマルチシグアドレスを生成
  let tran: any = bc1.multisig.makeNewMultiSigAddress(friends, 2, 1);

  //承認者がマルチシグアドレスのトランザクションをresponderに渡す
  bc2.multisig.responder(tran);
  bc3.multisig.responder(tran);

  const multisigAddress = Object.keys(bc1.multisig.multiSig)[0];
  //マルチシグトランザクションを作成
  tran = bc1.multisig.makeMultiSigTransaction(multisigAddress);

  //承認者が承認するためのコールバックを用意
  bc2.multisig.events.onMultisigTran["test"] = (info: multisigInfo) => {
    //マルチシグの承認
    bc1.multisig.responder(bc2.multisig.approveMultiSig(info));
  };
  bc3.multisig.events.onMultisigTran["test"] = (info: multisigInfo) => {
    bc1.multisig.responder(bc3.multisig.approveMultiSig(info));
  };

  //マルチシグトランザクションをresponderに渡す。
  if (tran) bc2.multisig.responder(tran);
  if (tran) bc3.multisig.responder(tran);
}
