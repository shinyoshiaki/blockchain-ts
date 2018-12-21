import BlockChainApp from "../../blockchain/blockchainApp";
import {
  ITransactionData,
  ITransaction,
  jsonStr
} from "../../blockchain/blockchain";
import { ETransactionType } from "../../blockchain/interface";
import { excuteEvent } from "../../util";

export default class ContractBlockchain {
  bc: BlockChainApp;
  constructor(bc: BlockChainApp) {
    this.bc = bc;
  }

  private isExistTransaction(tran: ITransaction): boolean {
    const transactions = this.bc.getAllTransactions();
    const exist = transactions.filter(transaction => {
      if (transaction) {
        return transaction.sign === tran.sign;
      }
    });
    console.log(JSON.stringify(exist[0]));
    if (exist.length > 0) return true;
    else return false;
  }

  makeTransaction = (recipent: string, amount: number, payload: any) => {
    const data: ITransactionData = {
      type: ETransactionType.transaction,
      payload
    };
    const tran = this.bc.makeTransaction(recipent, amount, data);
    if (!tran) {
      console.log("unvalid transaction");
      return;
    }
    if (this.isExistTransaction(tran)) {
      console.log("transaction exist", tran);
      return;
    }
    return JSON.stringify(tran);
  };

  transfer = (tran: any) => {
    if (!tran) {
      console.log("unvalid transaction");
      return;
    }
    if (this.isExistTransaction(tran)) {
      console.log("transaction exist");
      return;
    }
    excuteEvent(this.bc.events.onMadeTransaction, tran);
  };
}
