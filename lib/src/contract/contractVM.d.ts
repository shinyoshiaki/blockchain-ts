import Cypher from "./std/cypher";
import { SignedMessageWithOnePassphrase } from "../blockchain/crypto/sign";
import BlockChainApp from "../blockchain/blockchainApp";
export interface Icontract {
    state: {};
    reducers: {
        [key: string]: string;
    };
}
export default class ContractVM {
    address: string;
    code: any;
    state: any;
    sign: SignedMessageWithOnePassphrase;
    cypher: Cypher;
    private contractBlockchain;
    private idHash;
    constructor(contract: Icontract, blockchain: BlockChainApp, sign: SignedMessageWithOnePassphrase, address: string);
    messageCall(type: string, data?: {}): void;
    runEval(code: string, state: any): void;
    getState(key: string): any;
}
