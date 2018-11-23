import BlockChain, { ITransaction } from "./blockchain";
import Multisig from "./multisig";
import Responder from "./responder";
import Contract from "../contract/contract";
export default class BlockChainApp extends BlockChain {
    multisig: Multisig;
    contract: Contract;
    responder: Responder;
    constructor(secKey?: string, pubKey?: string);
    mine(): Promise<{}>;
    makeTransaction(recipient: string, amount: number, data: any): ITransaction | undefined;
    getChain(): any[];
    saveChain(): void;
    loadChain(): void;
}
