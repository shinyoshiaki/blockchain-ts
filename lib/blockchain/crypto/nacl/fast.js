"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright © 2018 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */
// tslint:disable-next-line no-implicit-dependencies
const sodium_native_1 = __importDefault(require("sodium-native"));
exports.box = (messageInBytes, nonceInBytes, convertedPublicKey, convertedPrivateKey) => {
    const cipherBytes = Buffer.alloc(messageInBytes.length + sodium_native_1.default.crypto_box_MACBYTES);
    sodium_native_1.default.crypto_box_easy(cipherBytes, messageInBytes, nonceInBytes, convertedPublicKey, convertedPrivateKey);
    return cipherBytes;
};
exports.openBox = (cipherBytes, nonceBytes, convertedPublicKey, convertedPrivateKey) => {
    const plainText = Buffer.alloc(cipherBytes.length - sodium_native_1.default.crypto_box_MACBYTES);
    // Returns false if decryption fails
    if (!sodium_native_1.default.crypto_box_open_easy(plainText, cipherBytes, nonceBytes, convertedPublicKey, convertedPrivateKey)) {
        throw new Error('Failed to decrypt message');
    }
    return plainText;
};
exports.signDetached = (messageBytes, privateKeyBytes) => {
    const signatureBytes = Buffer.alloc(sodium_native_1.default.crypto_sign_BYTES);
    sodium_native_1.default.crypto_sign_detached(signatureBytes, messageBytes, privateKeyBytes);
    return signatureBytes;
};
exports.verifyDetached = (messageBytes, signatureBytes, publicKeyBytes) => sodium_native_1.default.crypto_sign_verify_detached(signatureBytes, messageBytes, publicKeyBytes);
exports.getRandomBytes = length => {
    const nonce = Buffer.alloc(length);
    sodium_native_1.default.randombytes_buf(nonce);
    return nonce;
};
exports.getKeyPair = hashedSeed => {
    const publicKeyBytes = Buffer.alloc(sodium_native_1.default.crypto_sign_PUBLICKEYBYTES);
    const privateKeyBytes = Buffer.alloc(sodium_native_1.default.crypto_sign_SECRETKEYBYTES);
    sodium_native_1.default.crypto_sign_seed_keypair(publicKeyBytes, privateKeyBytes, hashedSeed);
    return {
        publicKeyBytes,
        privateKeyBytes,
    };
};
//# sourceMappingURL=fast.js.map