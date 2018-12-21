import Account from "../../blockchain/account";
import Cypher from "./cypher";
import test from "ava";

const c = [...Array(2)].map(() => new Cypher(new Account()));

test("cypher", test => {
  const raw = "test";
  {
    const enc = c[0].encrypt(raw, c[1].accout.pubKey);
    const dec = c[1].decrypt(enc);
    test.not(raw, enc);
    test.is(raw, dec);
  }
  {
    const enc = c[0].signMessage(raw);
    const dec = c[1].verifyMessage(
      enc.message,
      c[0].accout.pubKey,
      enc.signature
    );
    test.is(dec, true);
  }
});
