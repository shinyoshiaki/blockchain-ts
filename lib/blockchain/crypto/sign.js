"use strict";
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
const varuint_bitcoin_1 = require("varuint-bitcoin");
const buffer_1 = require("./buffer");
const constants_1 = require("./constants");
const hash_1 = require("./hash");
const keys_1 = require("./keys");
const nacl_1 = require("./nacl");
const createHeader = (text) => `-----${text}-----`;
const signedMessageHeader = createHeader('BEGIN LISK SIGNED MESSAGE');
const messageHeader = createHeader('MESSAGE');
const publicKeyHeader = createHeader('PUBLIC KEY');
const secondPublicKeyHeader = createHeader('SECOND PUBLIC KEY');
const signatureHeader = createHeader('SIGNATURE');
const secondSignatureHeader = createHeader('SECOND SIGNATURE');
const signatureFooter = createHeader('END LISK SIGNED MESSAGE');
const SIGNED_MESSAGE_PREFIX_BYTES = Buffer.from(constants_1.SIGNED_MESSAGE_PREFIX, 'utf8');
const SIGNED_MESSAGE_PREFIX_LENGTH = varuint_bitcoin_1.encode(constants_1.SIGNED_MESSAGE_PREFIX.length);
exports.digestMessage = (message) => {
    const msgBytes = Buffer.from(message, 'utf8');
    const msgLenBytes = varuint_bitcoin_1.encode(message.length);
    const dataBytes = Buffer.concat([
        SIGNED_MESSAGE_PREFIX_LENGTH,
        SIGNED_MESSAGE_PREFIX_BYTES,
        msgLenBytes,
        msgBytes,
    ]);
    return hash_1.hash(hash_1.hash(dataBytes));
};
exports.signMessageWithPassphrase = (message, passphrase) => {
    const msgBytes = exports.digestMessage(message);
    const { privateKeyBytes, publicKeyBytes, } = keys_1.getPrivateAndPublicKeyBytesFromPassphrase(passphrase);
    const signature = nacl_1.signDetached(msgBytes, privateKeyBytes);
    return {
        message,
        publicKey: buffer_1.bufferToHex(publicKeyBytes),
        signature: buffer_1.bufferToHex(signature),
    };
};
exports.verifyMessageWithPublicKey = ({ message, publicKey, signature, }) => {
    const msgBytes = exports.digestMessage(message);
    const signatureBytes = buffer_1.hexToBuffer(signature);
    const publicKeyBytes = buffer_1.hexToBuffer(publicKey);
    if (publicKeyBytes.length !== nacl_1.NACL_SIGN_PUBLICKEY_LENGTH) {
        throw new Error(`Invalid publicKey, expected ${nacl_1.NACL_SIGN_PUBLICKEY_LENGTH}-byte publicKey`);
    }
    if (signatureBytes.length !== nacl_1.NACL_SIGN_SIGNATURE_LENGTH) {
        throw new Error(`Invalid signature length, expected ${nacl_1.NACL_SIGN_SIGNATURE_LENGTH}-byte signature`);
    }
    return nacl_1.verifyDetached(msgBytes, signatureBytes, publicKeyBytes);
};
exports.signDataWithPrivateKey = (data, privateKey) => {
    const signature = nacl_1.signDetached(data, privateKey);
    return buffer_1.bufferToHex(signature);
};
exports.signDataWithPassphrase = (data, passphrase) => {
    const { privateKeyBytes } = keys_1.getPrivateAndPublicKeyBytesFromPassphrase(passphrase);
    return exports.signDataWithPrivateKey(data, privateKeyBytes);
};
exports.signData = exports.signDataWithPassphrase;
exports.verifyData = (data, signature, publicKey) => nacl_1.verifyDetached(data, buffer_1.hexToBuffer(signature), buffer_1.hexToBuffer(publicKey));
//# sourceMappingURL=sign.js.map