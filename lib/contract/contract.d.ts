import { ITransaction } from "../blockchain/blockchain";
import ContractVM from "./contractVM";
import BlockChainApp from "../blockchain/blockchainApp";
interface MessageCall {
    type: string;
    data: object;
}
export default class Contract {
    contracts: {
        [key: string]: ContractVM;
    };
    bc: BlockChainApp;
    constructor(bc: BlockChainApp);
    private deploy;
    private messageCall;
    responder(tran: ITransaction): void;
    makeContract(amount: number, code: string): ITransaction | undefined;
    makeMessageCall(address: string, amount: number, payload: MessageCall): ITransaction | undefined;
}
export {};
