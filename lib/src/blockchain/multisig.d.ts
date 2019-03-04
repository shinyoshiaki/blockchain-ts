import { ITransaction } from "./blockchain";
import { multisigInfo } from "./interface";
import BlockChainApp from "./blockchainApp";
import { IEvents } from "../util";
declare namespace multisig {
    enum type {
        MAKE = "multisig-make",
        TRAN = "multisig-tran",
        APPROVE = "multisig-approve",
        MULTISIG = "multisig"
    }
    interface data {
        myShare: string;
        shares: string[];
        threshold: number;
        pubKey: string;
        isOwner?: boolean;
    }
    interface transaction {
        opt: type;
        shares: any;
        info: any;
    }
}
export default class Multisig {
    multiSig: {
        [key: string]: multisig.data;
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
    friendsPubkeyRsaPass: string, vote: number, //しきい値
    amount: number): ITransaction;
    private getMultiSigKey;
    makeMultiSigTransaction(multisigAddress: string): ITransaction | undefined;
    private onMultiSigTransaction;
    approveMultiSig(info: multisigInfo): ITransaction | undefined;
    private onApproveMultiSig;
    private verifyMultiSig;
}
export {};
