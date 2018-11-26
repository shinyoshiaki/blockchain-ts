require("babel-polyfill");
import BlockChain, {
  ITransaction,
  ITransactionData,
  hash,
  IBlock
} from "./blockchain";
import Multisig from "./multisig";
import Responder, { RPC, typeRPC, IcallbackResponder } from "./responder";
import Contract from "../contract/contract";

interface IcallbackBlockchain extends IcallbackResponder {}

export default class BlockChainApp extends BlockChain {
  multisig: Multisig;
  contract: Contract;
  responder: Responder;
  constructor(opt?: { phrase?: string; callback?: IcallbackBlockchain }) {
    if (!opt) opt = {};
    super(opt.phrase);
    this.multisig = new Multisig(this);
    this.contract = new Contract(this);
    this.responder = new Responder(this, opt.callback);
  }

  mine() {
    //非同期処理
    return new Promise<IBlock>((resolve, reject) => {
      //プルーフオブワーク(ナンスの探索)
      const proof = this.proofOfWork();
      //最後のブロックのハッシュ値

      const previousHash = hash(this.lastBlock());
      //新しいブロック
      const block = this.newBlock(proof, previousHash);
      //完了
      if (block) resolve(block);
      else reject("block error");
    });
  }

  makeTransaction(recipient: string, amount: number, data: ITransactionData) {
    //残高が足りているか
    if (amount > this.nowAmount()) {
      console.log("input error");
      return;
    }
    //トランザクションの生成
    const tran = this.newTransaction(this.address, recipient, amount, data);
    return tran;
  }

  transactionRPC(tran: ITransaction) {
    const rpc: RPC = { type: typeRPC.TRANSACRION, body: tran };
    return rpc;
  }
}
