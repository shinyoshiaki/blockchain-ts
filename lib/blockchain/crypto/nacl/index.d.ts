/// <reference types="node" />
export declare const NACL_SIGN_PUBLICKEY_LENGTH = 32;
export declare const NACL_SIGN_SIGNATURE_LENGTH = 64;
export declare const box: (messageInBytes: Buffer, nonceInBytes: Buffer, convertedPublicKey: Buffer, convertedPrivateKey: Buffer) => Buffer, openBox: (cipherBytes: Buffer, nonceBytes: Buffer, convertedPublicKey: Buffer, convertedPrivateKey: Buffer) => Buffer, signDetached: (messageBytes: Buffer, privateKeyBytes: Buffer) => Buffer, verifyDetached: (messageBytes: Buffer, signatureBytes: Buffer, publicKeyBytes: Buffer) => boolean, getRandomBytes: (length: number) => Buffer, getKeyPair: (hashedSeed: Buffer) => import("../keys").KeypairBytes;
