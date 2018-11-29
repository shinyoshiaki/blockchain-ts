import test from "ava";
import ContractVM, { Icontract } from "../../contract/contractVM";

const contract: Icontract = {
  state: { num: 0 },
  reducers: {
    increment: "prev.num++;",
    decrement: "prev.num--;",
    add: "prev.num += parseInt(data.num, 10)",
    minus: "prev.num -= parseInt(data.num, 10)",
    mult: "prev.num *= parseInt(data.num, 10)",
    div: "prev.num /= parseInt(data.num, 10)"
  }
};

const vm = new ContractVM("test", contract, "test", "test");

console.log("code", vm.code, vm.idHash);

console.log("vm state", vm.state);
vm.messageCall("increment");
vm.messageCall("increment");
vm.messageCall("increment");
vm.messageCall("decrement");
vm.messageCall("add", { num: 10 });
vm.messageCall("minus", { num: 3 });
vm.messageCall("mult", { num: 2 });
vm.messageCall("div", { num: 4 });
console.log("vm state", vm.state, vm.getState("num"));

test(test => {
  test.is(vm.getState("num"), 4.5);
});
