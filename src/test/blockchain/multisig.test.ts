import BlockChain from "../../blockchain/blockchainApp";
import keypair from "keypair";
import { multisigInfo } from "../../blockchain/interface";
import { type } from "../../blockchain/responder";
var aes256 = require("aes256");

main();

async function main() {
  const bc1 = new BlockChain();

  const friends = [];

  const cypher = keypair();
  friends.push(aes256.encrypt("format", cypher.public));
  const bc2 = new BlockChain(cypher.private, cypher.public);

  const cypher2 = keypair();
  friends.push(aes256.encrypt("format", cypher2.public));
  const bc3 = new BlockChain(cypher2.private, cypher2.public);

  const block = await bc1.mine();
  console.log({ block });
  console.log("amount", bc1.address, bc1.nowAmount(bc1.address));

  bc2.chain = bc1.chain;
  bc3.chain = bc1.chain;

  let tran: any = bc1.multisig.makeNewMultiSigAddress(friends, 2, 1);

  bc2.multisig.responder(tran);
  bc3.multisig.responder(tran);

  const multisigAddress = Object.keys(bc1.multisig.multiSig)[0];
  tran = bc1.multisig.makeMultiSigTransaction(multisigAddress);

  bc2.multisig.events.onMultisigTran["test"] = (info: multisigInfo) => {
    console.log(
      `bc2.multisig.events.onMultisigTran["test"] = (info: multisigInfo) => {`
    );
    const tran: any = bc2.multisig.approveMultiSig(info);
    //   console.log({ tran });
    bc1.multisig.responder(tran);
  };
  if (tran) bc2.multisig.responder(tran);

  bc3.multisig.events.onMultisigTran["test"] = (info: multisigInfo) => {
    console.log(
      `bc3.multisig.events.onMultisigTran["test"] = (info: multisigInfo) => {`
    );
    const tran: any = bc3.multisig.approveMultiSig(info);
    //   console.log({ tran });
    bc1.multisig.responder(tran);
  };
  if (tran) bc3.multisig.responder(tran);
}
