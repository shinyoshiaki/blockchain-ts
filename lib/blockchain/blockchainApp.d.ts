import BlockChain, { ITransaction, ITransactionData } from "./blockchain";
import Multisig from "./multisig";
import Responder, { RPC } from "./responder";
import Contract from "../contract/contract";
export default class BlockChainApp extends BlockChain {
    multisig: Multisig;
    contract: Contract;
    responder: Responder;
    constructor(phrase?: string);
    mine(): Promise<{}>;
    makeTransaction(recipient: string, amount: number, data: ITransactionData): ITransaction | undefined;
    transactionRPC(tran: ITransaction): RPC;
}
