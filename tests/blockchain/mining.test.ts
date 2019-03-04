import BlockChainApp from "../../src/blockchain/blockchainApp";
import { validChain } from "../../src/blockchain/blockchain";

const bc = new BlockChainApp();

test("blockchain/sign", async () => {
  await bc.mine().catch(console.log);
  expect(validChain(bc.chain)).toBe(true);
  await bc.mine();
  expect(validChain(bc.chain)).toBe(true);
});
