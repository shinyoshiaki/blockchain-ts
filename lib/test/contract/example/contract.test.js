"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const contractVM_1 = __importDefault(require("../../../contract/contractVM"));
const cypher_1 = __importDefault(require("../../../blockchain/crypto/cypher"));
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
const cypher = new cypher_1.default();
const sign = JSON.stringify(cypher.signMessage("test"));
const contract = new contractVM_1.default("test", code, cypher.pubKey, sign);
contract.messageCall("add", { v1: "4" });
contract.messageCall("add", { v1: "4" });
contract.messageCall("increment");
contract.messageCall("increment");
const mcypher = new cypher_1.default();
const mcontract = new contractVM_1.default("test", code, mcypher.pubKey, sign);
mcontract.messageCall("increment");
ava_1.default("contract", test => {
    test.is(10, contract.state.v0);
});
//# sourceMappingURL=contract.test.js.map