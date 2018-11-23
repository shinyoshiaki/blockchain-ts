import test from "ava";
import ContractVM from "../../contract/contractVM";

const code = `
const initialState = { v0: 0 };

function reducer(prevState = initialState, action = { type: "", data: {} }) {  
  const data = action.data;
  switch (action.type) {
    case "increment":
      prevState.v0++;
      state = prevState;
      break;
    case "add":
      prevState.v0 += parseInt(data.v1, 10);
      state = prevState;
      break;
    default:
      state = prevState;
  }  
}
`;

const contract = new ContractVM("test", code);
contract.messageCall("add", { v1: "4" });
contract.messageCall("add", { v1: "4" });
contract.messageCall("increment");
contract.messageCall("increment");

test("contract", test => {
  test.is(10, contract.state.v0);
});
