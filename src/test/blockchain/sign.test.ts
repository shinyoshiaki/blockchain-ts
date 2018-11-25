import test from "ava";
import Cypher from "../../blockchain/crypto/cypher";
import { verifyMessageWithPublicKey } from "../../blockchain/crypto/sign";

const cypher = new Cypher();

const sign = cypher.signMessage("test");
console.log({ sign });
const result = cypher.verifyMessage({
  message: sign.message,
  signature: sign.signature,
  publicKey: cypher.pubKey
});

console.log({ result });

const fail = new Cypher();
const sign1 = fail.signMessage("test");
const result1 = verifyMessageWithPublicKey({
  message: sign1.message,
  signature: sign1.signature,
  publicKey: cypher.pubKey
});

console.log({ result1 });

test("sign", test => {
  test.is(result, true);
  test.is(result1, false);
});
