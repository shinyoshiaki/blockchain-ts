import BlockChainApp from "../../blockchain/blockchainApp";
export default class ContractBlockchain {
    bc: BlockChainApp;
    constructor(bc: BlockChainApp);
    private isExistTransaction;
    makeTransaction: (recipent: string, amount: number, payload: any) => string | undefined;
    transfer: (tran: any) => void;
}
