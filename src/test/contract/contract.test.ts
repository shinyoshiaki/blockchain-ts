import BlockChainApp from "../../blockchain/blockchainApp";
import { typeRPC } from "../../blockchain/responder";
import test from "ava";

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
  const b = new BlockChainApp();
  const bs: BlockChainApp[] = [];
  for (let i = 0; i < 2; i++) {
    bs.push(new BlockChainApp());
  }
  await b.mine();
  bs.forEach(bc => {
    bc.chain = b.chain;
  });

  let tran: any = b.contract.makeContract(0, code);
  const address = tran.data.payload.address;
  bs.forEach(bc => {
    bc.responder.runRPC({ type: typeRPC.TRANSACRION, body: tran });
  });

  tran = b.contract.makeMessageCall(address, 0, {
    type: "add",
    data: { v1: "4" }
  });
  bs.forEach(bc => {
    bc.responder.runRPC({ type: typeRPC.TRANSACRION, body: tran });
  });

  test("blockchain-contract", test => {
    bs.forEach(bc => {
      test.is(bc.contract.contracts[address].state.v0, 4);
    });
  });
}
