"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const blockchainApp_1 = __importDefault(require("../../blockchain/blockchainApp"));
const responder_1 = require("../../blockchain/responder");
const ava_1 = __importDefault(require("ava"));
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
main();
async function main() {
    const b = new blockchainApp_1.default();
    const bs = [];
    for (let i = 0; i < 2; i++) {
        bs.push(new blockchainApp_1.default());
    }
    await b.mine();
    bs.forEach(bc => {
        bc.chain = b.chain;
    });
    let tran = b.contract.makeContract(0, code);
    const address = tran.data.payload.address;
    bs.forEach((bc, i) => {
        bc.responder.runRPC({ type: responder_1.typeRPC.TRANSACRION, body: tran });
    });
    tran = b.contract.makeMessageCall(address, 0, {
        type: "add",
        data: { v1: "4" }
    });
    bs.forEach((bc, i) => {
        bc.responder.runRPC({ type: responder_1.typeRPC.TRANSACRION, body: tran });
    });
    ava_1.default("blockchain-contract", test => {
        bs.forEach((bc, i) => {
            console.log(bc.contract.contracts[address].state);
            test.is(bc.contract.contracts[address].state.v0, 4);
        });
    });
}
//# sourceMappingURL=contract.test.js.map