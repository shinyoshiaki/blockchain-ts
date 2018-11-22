import test from "ava";
import Contract from "../../contract/contract";

const contract = new Contract("test", 0);

const code = `
const initialState = { val1: 0 };

function reducer(prevState = initialState, action = { type: "", data: "{}" }) {
  console.log({ action });
  console.log("contract", { state });
  const data = action.data
  switch (action.type) {
    case "increment":
      prevState.val1++;
      state = prevState;
      break;
    case "add":
      prevState.val1 += parseInt(data.val2, 10);
      state = prevState;
      break;
    default:
      state = prevState;
  }
  console.log("contract", { state });
}
`;

contract.deploy(code);
contract.messageCall("add", { val2: "4" });
contract.messageCall("add", { val2: "4" });
contract.messageCall("increment");
contract.messageCall("increment");

test("contract", test => {
  test.pass();
});
