import Cypher from "./cypher";
export default class BlockChain {
    chain: Array<any>;
    currentTransactions: Array<any>;
    cypher: Cypher;
    address: string;
    callback: {
        onAddBlock: (v?: any) => void;
    };
    private onAddBlock;
    private onTransaction;
    events: {
        onAddBlock: {
            [key: string]: () => void;
        };
        onTransaction: {
            [key: string]: () => void;
        };
    };
    constructor(secKey?: string, pubKey?: string);
    hash(obj: any): string;
    jsonStr(obj: any): string;
    newBlock(proof: any, previousHash: string): {
        index: number;
        timestamp: number;
        transactions: any[];
        proof: any;
        previousHash: string;
        owner: string;
        publicKey: string;
        sign: string;
    };
    newTransaction(sender: string, recipient: string, amount: number, data: any, cypher?: Cypher): {
        sender: string;
        recipient: string;
        amount: number;
        data: any;
        now: number;
        publicKey: string;
        sign: string;
    };
    lastBlock(blockchain?: any[]): any;
    addBlock(block: any): void;
    private excuteEvent;
    validBlock(block: any): boolean;
    validProof(lastProof: string, proof: number, lastHash: string, address: string): boolean;
    validChain(chain: Array<any>): boolean;
    validTransaction(transaction: any): boolean;
    addTransaction(tran: any): void;
    proofOfWork(): number;
    nowAmount(address?: string): number;
}
