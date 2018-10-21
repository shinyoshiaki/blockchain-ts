import BlockChain from "../../blockchain/blockchain";

const blockchain = new BlockChain();

console.log(blockchain.chain);

blockchain.events.onAddBlock["test"] = () => {
  console.log("event test");
};

blockchain.addBlock({});
