export interface EncryptedMessageWithNonce {
    readonly encryptedMessage: string;
    readonly nonce: string;
    readonly senderPublickey: string;
}
export declare const encryptMessageWithPassphrase: (message: string, passphrase: string, recipientPublicKey: string) => EncryptedMessageWithNonce;
export declare const decryptMessageWithPassphrase: (cipherHex: string, nonce: string, passphrase: string, senderPublicKey: string) => string;
export interface EncryptedPassphraseObject {
    readonly cipherText: string;
    readonly iterations?: number;
    readonly iv: string;
    readonly salt: string;
    readonly tag: string;
    readonly version: string;
}
export declare const encryptPassphraseWithPassword: (plainText: string, password: string, iterations?: number) => EncryptedPassphraseObject;
export declare const decryptPassphraseWithPassword: (encryptedPassphrase: EncryptedPassphraseObject, password: string) => string;
