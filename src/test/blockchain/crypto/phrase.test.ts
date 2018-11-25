import Cypher from "../../../blockchain/crypto/cypher";
import test from "ava";
import { isValidPassphrase } from "../../../blockchain/crypto/keys";

const cypher = new Cypher();

test("phrase", test => {
  test.is(isValidPassphrase(cypher.phrase), true);
  test.is(isValidPassphrase(""), false);
});
