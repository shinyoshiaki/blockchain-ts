import test from "ava";
import BlockChainApp from "../../blockchain/blockchainApp";
import { validChain } from "../../blockchain/blockchain";

const bc = new BlockChainApp();

test("sign", async test => {
  await bc.mine().catch(console.log);
  test.is(validChain(bc.chain), true);
  await bc.mine();
  test.is(validChain(bc.chain), true);
  await bc.mine();
  test.is(validChain(bc.chain), true);
  await bc.mine();
  test.is(validChain(bc.chain), true);
});
