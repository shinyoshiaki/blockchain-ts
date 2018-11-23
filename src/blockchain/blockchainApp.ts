require("babel-polyfill");
import BlockChain, { ITransaction } from "./blockchain";
import sha1 from "sha1";
import Multisig from "./multisig";
import Responder, { RPC, typeRPC } from "./responder";
import ContractVM from "../contract/contractVM";
import Contract from "../contract/contract";

export default class BlockChainApp extends BlockChain {
  multisig: Multisig;
  contract: Contract;
  responder: Responder;
  constructor(secKey?: string, pubKey?: string) {
    super(secKey, pubKey);
    this.multisig = new Multisig(this);
    this.contract = new Contract(this);
    this.responder = new Responder(this);
  }

  mine() {
    //非同期処理
    return new Promise(resolve => {
      //プルーフオブワーク(ナンスの探索)
      const proof = this.proofOfWork();
      //最後のブロックのハッシュ値
      const previousHash = this.hash(this.lastBlock());
      //新しいブロック
      const block = this.newBlock(proof, previousHash);
      console.log("new block forged", { block });
      // this.saveChain();
      //完了
      resolve(block);
    });
  }

  makeTransaction(recipient: string, amount: number, data: any) {
    //入力情報が足りているか
    if (!(recipient && amount)) {
      console.log("input error");
      return;
    }
    //残高が足りているか
    if (amount > this.nowAmount()) {
      console.log("input error");
      return;
    }
    //トランザクションの生成
    const tran = this.newTransaction(this.address, recipient, amount, data);
    console.log("makeTransaction", tran);
    return tran;
  }

  transactionRPC(tran: ITransaction) {
    const rpc: RPC = { type: typeRPC.TRANSACRION, body: tran };
    return rpc;
  }
}
