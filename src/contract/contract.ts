import { ITransaction, ITransactionData } from "../blockchain/blockchain";
import { ETransactionType } from "../blockchain/interface";
import ContractVM from "./contractVM";
import BlockChainApp from "../blockchain/blockchainApp";
import sha256 from "sha256";

interface Deploy {
  code: string;
  address: string;
}

interface MessageCall {
  type: string;
  data: object;
}

export default class Contract {
  contracts: { [key: string]: ContractVM } = {};
  bc: BlockChainApp;
  constructor(bc: BlockChainApp) {
    this.bc = bc;
  }

  private deploy(tran: ITransaction) {
    console.log("deploy", { tran });
    const sign = this.bc.cypher.signMessage(Math.random().toString());
    const payload: Deploy = tran.data.payload;
    const contract = new ContractVM(
      JSON.parse(payload.code),
      this.bc,
      sign,
      tran.recipient
    );
    this.contracts[contract.address] = contract;
  }

  private messageCall(tran: ITransaction) {
    const payload: MessageCall = tran.data.payload;
    const contract = this.contracts[tran.recipient];
    contract.messageCall(payload.type, payload.data);
  }

  responder(tran: ITransaction) {
    console.log("contracts res", { tran });
    if (tran.data.type === ETransactionType.deploy) {
      this.deploy(tran);
    } else if (tran.data.type === ETransactionType.messagecall) {
      this.messageCall(tran);
    }
  }

  makeContract(amount: number, code: string): ITransaction | undefined {
    const address = sha256(this.bc.address + this.bc.getNonce());
    const payload: Deploy = { code, address };
    const data: ITransactionData = { type: ETransactionType.deploy, payload };
    return this.bc.makeTransaction(address, amount, data);
  }

  makeMessageCall(address: string, amount: number, payload: MessageCall) {
    const data: ITransactionData = {
      type: ETransactionType.messagecall,
      payload
    };
    return this.bc.makeTransaction(address, amount, data);
  }
}
