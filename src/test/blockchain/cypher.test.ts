import test from "ava";
import Cypher from "../../blockchain/cypher";

const cypher = new Cypher();

const encrypt = cypher.encrypt("test");
const raw = cypher.decrypt(encrypt, cypher.pubKey);

test("cypher", test => {
  test.is("test", raw);
});
