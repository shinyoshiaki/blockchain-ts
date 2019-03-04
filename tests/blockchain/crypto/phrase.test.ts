import Cypher from "../../../src/blockchain/crypto/cypher";
import { isValidPassphrase } from "../../../src/blockchain/crypto/keys";

const cypher = new Cypher();

test("blockchain/crypto/phrase", () => {
  console.log(cypher.phrase);
  expect(isValidPassphrase(cypher.phrase)).toBe(true);
  expect(isValidPassphrase("")).not.toBe(true);
});
