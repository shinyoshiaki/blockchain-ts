import Mnemonic from "bitcore-mnemonic";
export default class Account {
    mnemonic: Mnemonic;
    secKey: string;
    pubKey: string;
    phrase: string;
    constructor(phrase?: string);
}
