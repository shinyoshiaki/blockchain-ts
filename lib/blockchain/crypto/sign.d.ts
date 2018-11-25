/// <reference types="node" />
export interface SignedMessageWithOnePassphrase {
    readonly message: string;
    readonly publicKey: string;
    readonly signature: string;
}
export declare const digestMessage: (message: string) => Buffer;
export declare const signMessageWithPassphrase: (message: string, passphrase: string) => SignedMessageWithOnePassphrase;
export declare const verifyMessageWithPublicKey: ({ message, publicKey, signature, }: SignedMessageWithOnePassphrase) => boolean;
export declare const signDataWithPrivateKey: (data: Buffer, privateKey: Buffer) => string;
export declare const signDataWithPassphrase: (data: Buffer, passphrase: string) => string;
export declare const signData: (data: Buffer, passphrase: string) => string;
export declare const verifyData: (data: Buffer, signature: string, publicKey: string) => boolean;
