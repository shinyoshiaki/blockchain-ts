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
const tweetnacl_1 = __importDefault(require("tweetnacl"));
exports.box = (messageInBytes, nonceInBytes, convertedPublicKey, convertedPrivateKey) => Buffer.from(tweetnacl_1.default.box(messageInBytes, nonceInBytes, convertedPublicKey, convertedPrivateKey));
exports.openBox = (cipherBytes, nonceBytes, convertedPublicKey, convertedPrivateKey) => {
    const originalMessage = tweetnacl_1.default.box.open(cipherBytes, nonceBytes, convertedPublicKey, convertedPrivateKey);
    // Returns null if decryption fails
    if (originalMessage === null) {
        throw new Error('Failed to decrypt message');
    }
    return Buffer.from(originalMessage);
};
exports.signDetached = (messageBytes, privateKeyBytes) => Buffer.from(tweetnacl_1.default.sign.detached(messageBytes, privateKeyBytes));
exports.verifyDetached = tweetnacl_1.default.sign.detached.verify;
exports.getRandomBytes = length => Buffer.from(tweetnacl_1.default.randomBytes(length));
exports.getKeyPair = hashedSeed => {
    const { publicKey, secretKey } = tweetnacl_1.default.sign.keyPair.fromSeed(hashedSeed);
    return {
        privateKeyBytes: Buffer.from(secretKey),
        publicKeyBytes: Buffer.from(publicKey),
    };
};
//# sourceMappingURL=slow.js.map