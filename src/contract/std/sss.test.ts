import { sssSplit, sssCombine } from "./sss";
import test from "ava";

const raw = "test";
const split = sssSplit(raw, 3, 3);
const dec = sssCombine(split);

test("multisig", test => {
  test.is(raw, dec);
});
