export interface Icontract {
    state: {};
    reducers: {
        [key: string]: string;
    };
}
export default class ContractVM {
    address: string;
    code?: any;
    state: any;
    idHash: {
        [key: string]: string;
    };
    constructor(address: string, contract: Icontract, _pubkey: string, sign: string);
    messageCall(type: string, data?: {}): void;
    getState(key: string): any;
}
