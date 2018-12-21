import Cypher from "./std/cypher";
import { SignedMessageWithOnePassphrase } from "../blockchain/crypto/sign";
import BlockChainApp from "../blockchain/blockchainApp";
import ContractBlockchain from "./std/blockchain";
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
    idHash: {
        [key: string]: string;
    };
    sign: SignedMessageWithOnePassphrase;
    cypher: Cypher;
    contractBlockchain: ContractBlockchain;
    constructor(contract: Icontract, blockchain: BlockChainApp, sign: SignedMessageWithOnePassphrase, address: string);
    messageCall(type: string, data?: {}): void;
    runEval(code: string, state: any): void;
    getState(key: string): any;
}
