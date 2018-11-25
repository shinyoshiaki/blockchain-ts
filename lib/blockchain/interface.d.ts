export interface multisigInfo {
    ownerPubKey?: string;
    multisigPubKey: string;
    multisigAddress: string;
    sharePubKeyRsa?: string;
    threshold: number;
}
export interface Network {
    broadCast: (v: any) => void;
    nodeId: string;
    send: (nodeId: string, data: any) => void;
}
export declare enum ETransactionType {
    transaction = 0,
    multisig = 1,
    deploy = 2,
    messagecall = 3
}
