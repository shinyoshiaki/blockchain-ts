import Cypher from "./cypher";

const cypher = new Cypher();

const encrypt = cypher.encrypt("test");
const raw = cypher.decrypt(encrypt, cypher.pubKey);

console.log({ raw });
