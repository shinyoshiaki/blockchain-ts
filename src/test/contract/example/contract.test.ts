import test from "ava";
import ContractVM from "../../../contract/contractVM";
import Cypher from "../../../blockchain/crypto/cypher";

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

const cypher = new Cypher();
const sign = JSON.stringify(cypher.signMessage("test"));
const contract = new ContractVM("test", code, cypher.pubKey, sign);
contract.messageCall("add", { v1: "4" });
contract.messageCall("add", { v1: "4" });
contract.messageCall("increment");
contract.messageCall("increment");

const mcypher = new Cypher();
const mcontract = new ContractVM("test", code, mcypher.pubKey, sign);
mcontract.messageCall("increment");

test("contract", test => {
  test.is(10, contract.state.v0);
});
