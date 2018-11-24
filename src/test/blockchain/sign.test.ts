import test from "ava";
import Cypher from "../../blockchain/crypto/cypher";

const cypher = new Cypher();

const sign = cypher.signMessage("test");
console.log({ sign });
const result = cypher.verifyMessage(sign);

console.log({ result });

test("sign", test => {
  test.is(result, true);
});
