import Cypher from "./crypto/cypher";
import { ETransactionType } from "./interface";
export interface IBlock {
    index: number;
    timestamp: any;
    transactions: ITransaction[];
    proof: number;
    previousHash: string;
    owner: string;
    publicKey: string;
    sign: string;
}
export interface ITransactionData {
    type: ETransactionType;
    payload: any;
}
export interface ITransaction {
    sender: string;
    recipient: string;
    amount: number;
    data: ITransactionData;
    now: any;
    publicKey: string;
    nonce: number;
    sign: string;
}
export declare function hash(obj: any): string;
export declare function jsonStr(obj: any): string;
export declare function validProof(lastProof: number, proof: number, lastHash: string, address: string): boolean;
export declare function validChain(chain: IBlock[]): boolean;
export declare function validBlock(lastBlock: IBlock, block: IBlock): boolean;
export default class BlockChain {
    chain: IBlock[];
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
    constructor(phrase?: string);
    newBlock(proof: any, previousHash: string): IBlock | undefined;
    newTransaction(sender: string, recipient: string, amount: number, data: {
        type: ETransactionType;
        payload: any;
    }, cypher?: Cypher): ITransaction;
    lastBlock(blockchain?: IBlock[]): IBlock;
    addBlock(block: IBlock): void;
    validTransaction(transaction: ITransaction): boolean;
    addTransaction(tran: ITransaction): void;
    proofOfWork(): number;
    nowAmount(address?: string): number;
    getNonce(address?: string): number;
}
