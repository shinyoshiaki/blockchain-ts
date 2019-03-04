import Cypher from "../../src/blockchain/crypto/cypher";
import { verifyMessageWithPublicKey } from "../../src/blockchain/crypto/sign";

const cypher = new Cypher();

const sign = cypher.signMessage("test");
console.log({ sign });
const result = verifyMessageWithPublicKey({
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

test("blockchain/sign", () => {
  expect(result).toBe(true);
  expect(result1).not.toBe(true);
});
