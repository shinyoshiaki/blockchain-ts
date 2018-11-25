"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bitcore_mnemonic_1 = __importDefault(require("bitcore-mnemonic"));
const buffer_1 = require("./buffer");
const sign_1 = require("./sign");
const keys_1 = require("./keys");
const encrypt_1 = require("./encrypt");
class Cypher {
    constructor(phrase) {
        if (phrase) {
            this.mnemonic = new bitcore_mnemonic_1.default(phrase);
            this.phrase = phrase;
        }
        else {
            this.mnemonic = new bitcore_mnemonic_1.default();
            this.phrase = this.mnemonic.toString();
        }
        const { privateKeyBytes, publicKeyBytes } = keys_1.getPrivateAndPublicKeyBytesFromPassphrase(this.phrase);
        this.pubKey = buffer_1.bufferToHex(publicKeyBytes);
        this.secKey = buffer_1.bufferToHex(privateKeyBytes);
    }
    encrypt(raw, recipientPublicKey) {
        const result = encrypt_1.encryptMessageWithPassphrase(raw, this.phrase, recipientPublicKey);
        return JSON.stringify(result);
    }
    decrypt(encrypted) {
        const json = JSON.parse(encrypted);
        console.log({ json });
        const result = encrypt_1.decryptMessageWithPassphrase(json.encryptedMessage, json.nonce, this.phrase, json.senderPublickey);
        return result;
    }
    signMessage(raw) {
        const result = sign_1.signMessageWithPassphrase(raw, this.phrase);
        return {
            message: result.message,
            signature: result.signature
        };
    }
    verifyMessage({ message, publicKey, signature }) {
        return sign_1.verifyMessageWithPublicKey({ message, publicKey, signature });
    }
}
exports.default = Cypher;
//# sourceMappingURL=cypher.js.map