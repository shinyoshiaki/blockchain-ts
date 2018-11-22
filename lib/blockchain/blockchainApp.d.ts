import BlockChain from "./blockchain";
import Multisig from "./multisig";
import Responder from "./responder";
export default class BlockChainApp extends BlockChain {
    multisig: Multisig;
    responder: Responder;
    constructor(secKey?: string, pubKey?: string);
    mine(): Promise<{}>;
    makeTransaction(recipient: string, amount: number, data: any): import("./blockchain").ITransaction | undefined;
    getChain(): any[];
    saveChain(): void;
    loadChain(): void;
}
