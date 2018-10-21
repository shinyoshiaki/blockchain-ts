import BlockChain from "./blockchain";
import Multisig from "./multisig";
export default class BlockChainApp extends BlockChain {
    multisig: Multisig;
    constructor(secKey?: string, pubKey?: string);
    mine(): Promise<{}>;
    makeTransaction(recipient: string, amount: number, data: any): {
        sender: string;
        recipient: string;
        amount: number;
        data: any;
        now: number;
        publicKey: string;
        sign: string;
    } | undefined;
    getChain(): any[];
    saveChain(): void;
    loadChain(): void;
}
