import BlockChain, { ITransaction } from "./blockchain";
import { multisigInfo } from "./interface";
export declare enum type {
    MAKE = "multisig-make",
    TRAN = "multisig-tran",
    APPROVE = "multisig-approve",
    MULTISIG = "multisig"
}
interface multisigData {
    myShare: string;
    shares: Array<string>;
    threshold: number;
    pubKey: string;
    encryptSecKey: string;
    isOwner?: boolean;
}
interface events {
    [key: string]: (v?: any) => void;
}
export default class Multisig {
    multiSig: {
        [key: string]: multisigData;
    };
    address: string;
    b: BlockChain;
    private onMultisigTran;
    private onMultisigTranDone;
    events: {
        onMultisigTran: events;
        onMultisigTranDone: events;
    };
    private excuteEvent;
    constructor(blockchain: BlockChain);
    responder(tran: ITransaction): void;
    makeNewMultiSigAddress(friendsPubKeyAes: Array<string>, //共有者の情報
    vote: number, //しきい値
    amount: number): ITransaction;
    private getMultiSigKey;
    makeMultiSigTransaction(multisigAddress: string): ITransaction | undefined;
    private onMultiSigTransaction;
    approveMultiSig(info: multisigInfo): ITransaction | undefined;
    private onApproveMultiSig;
    verifyMultiSig(info: multisigInfo, shares: Array<any>): ITransaction | undefined;
}
export {};
