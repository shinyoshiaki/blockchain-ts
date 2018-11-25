import test from "ava";
import Cypher from "../../blockchain/crypto/cypher";

const cypher = new Cypher();
const cypher1 = new Cypher();

const msg = "test";
const enc = cypher.encrypt(msg, cypher1.pubKey);
console.log({ enc });
const result = cypher1.decrypt(enc);
console.log({ result });

test("sign", test => {
  test.is(result, msg);
});
