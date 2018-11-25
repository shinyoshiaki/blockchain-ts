export default class ContractVM {
    address: string;
    code?: any;
    state: any;
    constructor(address: string, code: string, pubkey: string, sign: string);
    messageCall(type: string, data?: {}): void;
}
