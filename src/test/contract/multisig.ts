import ContractVM, { Icontract } from "../../contract/contractVM";
import Cypher from "../../contract/std/cypher";
import BlockChainApp from "../../blockchain/blockchainApp";
import sha256 from "sha256";
import Account from "../../blockchain/account";

const target = sha256("target").toString();
const friends = [...Array(3)].map(() => new Account().pubKey);

const contract: Icontract = {
  state: { shares: [] },
  reducers: {
    start: `
        if (!isOwner()) return;
        console.log("multisig");
        const tran = makeTransaction("${target}", 1,"smartcontract");
        if(!tran)return;
        console.log("made");
        const friends = data.friends;
        const shares = sssSplit(tran, friends.length, 2);
        prev.shares = shares.map((share, index) => {
         return encrypt(share, friends[index]);
        });
    `
  }
};

console.log({ contract });

async function run() {
  const blockchain = new BlockChainApp();
  await blockchain.mine();
  const account = blockchain.accout;
  const cypher = new Cypher(account);
  const sign = cypher.signMessage(Math.random().toString());
  const vm = new ContractVM(contract, blockchain, sign, "test");
  vm.messageCall("start", { friends });
  console.log(vm.state);
}

run();
