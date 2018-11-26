import BlockChain, { ITransaction, ITransactionData, IBlock } from "./blockchain";
import Multisig from "./multisig";
import Responder, { RPC, IcallbackResponder } from "./responder";
import Contract from "../contract/contract";
interface IcallbackBlockchain extends IcallbackResponder {
}
export default class BlockChainApp extends BlockChain {
    multisig: Multisig;
    contract: Contract;
    responder: Responder;
    constructor(opt?: {
        phrase?: string;
        callback?: IcallbackBlockchain;
    });
    mine(): Promise<IBlock>;
    makeTransaction(recipient: string, amount: number, data: ITransactionData): ITransaction | undefined;
    transactionRPC(tran: ITransaction): RPC;
}
export {};
