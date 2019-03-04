import { sssSplit, sssCombine } from "../../../src/contract/std/sss";

const raw = "test";
const split = sssSplit(raw, 3, 3);
const dec = sssCombine(split);

test("multisig", () => {
  expect(raw).toBe(dec);
});
