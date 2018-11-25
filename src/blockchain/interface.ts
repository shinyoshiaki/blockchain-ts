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

export enum ETransactionType {
  transaction,
  multisig,
  deploy,
  messagecall
}
