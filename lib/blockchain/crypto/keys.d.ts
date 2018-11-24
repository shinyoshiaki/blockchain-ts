/// <reference types="node" />
export interface KeypairBytes {
    readonly privateKeyBytes: Buffer;
    readonly publicKeyBytes: Buffer;
}
export declare const getPrivateAndPublicKeyBytesFromPassphrase: (passphrase: string) => KeypairBytes;
