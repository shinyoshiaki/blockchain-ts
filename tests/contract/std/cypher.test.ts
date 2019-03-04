import Account from "../../../src/blockchain/account";
import Cypher from "../../../src/contract/std/cypher";

const c = [...Array(2)].map(() => new Cypher(new Account()));

test("cypher", () => {
  const raw = "test";
  {
    const enc = c[0].encrypt(raw, c[1].accout.pubKey);
    const dec = c[1].decrypt(enc);
    expect(raw).not.toBe(enc);
    expect(raw).toBe(dec);
  }
  {
    const enc = c[0].signMessage(raw);
    const dec = c[1].verifyMessage(
      enc.message,
      c[0].accout.pubKey,
      enc.signature
    );
    expect(dec).toBe(true);
  }
});
