import ContractVM, { Icontract } from "../../src/contract/contractVM";
import Cypher from "../../src/contract/std/cypher";
import BlockChainApp from "../../src/blockchain/blockchainApp";

const contract: Icontract = {
  state: { num: 0 },
  reducers: {
    increment: "prev.num++;",
    decrement: "prev.num--;",
    add: "prev.num += Number(data.num)",
    minus: "prev.num -= Number(data.num)",
    mult: "prev.num *= Number(data.num)",
    div: "prev.num /= Number(data.num)"
  }
};

const blockchain = new BlockChainApp();
const account = blockchain.accout;
const cypher = new Cypher(account);
const sign = cypher.signMessage(Math.random().toString());
const vm = new ContractVM(contract, blockchain, sign, "test");

console.log("code", vm.code);

console.log("vm state", vm.state);
vm.messageCall("increment");
vm.messageCall("increment");
vm.messageCall("increment");
vm.messageCall("decrement");
vm.messageCall("add", { num: 10 });
vm.messageCall("minus", { num: 3 });
vm.messageCall("mult", { num: 2 });
vm.messageCall("div", { num: 4 });
vm.messageCall("add", { num: 0.1 });
console.log("vm state", vm.state, vm.getState("num"));

test("contract/vm", () => {
  expect(vm.getState("num")).toBe(4.6);
});
