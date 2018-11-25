import Mnemonic from "bitcore-mnemonic";
import { SignedMessageWithOnePassphrase } from "./sign";
export default class Cypher {
    mnemonic: Mnemonic;
    secKey: string;
    pubKey: string;
    phrase: string;
    constructor(phrase?: string);
    encrypt(raw: string, recipientPublicKey: string): string;
    decrypt(encrypted: string): string;
    signMessage(raw: string): {
        message: string;
        signature: string;
    };
    verifyMessage({ message, publicKey, signature }: SignedMessageWithOnePassphrase): boolean;
}
