import { ITransaction } from "./blockchain";
import { multisigInfo } from "./interface";
import BlockChainApp from "./blockchainApp";
import { IEvents } from "../util";
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
export default class Multisig {
    multiSig: {
        [key: string]: multisigData;
    };
    address: string;
    b: BlockChainApp;
    private onMultisigTran;
    private onMultisigTranDone;
    events: {
        onMultisigTran: IEvents;
        onMultisigTranDone: IEvents;
    };
    constructor(blockchain: BlockChainApp);
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
