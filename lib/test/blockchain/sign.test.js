"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const cypher_1 = __importDefault(require("../../blockchain/crypto/cypher"));
const sign_1 = require("../../blockchain/crypto/sign");
const cypher = new cypher_1.default();
const sign = cypher.signMessage("test");
console.log({ sign });
const result = cypher.verifyMessage({
    message: sign.message,
    signature: sign.signature,
    publicKey: cypher.pubKey
});
console.log({ result });
const fail = new cypher_1.default();
const sign1 = fail.signMessage("test");
const result1 = sign_1.verifyMessageWithPublicKey({
    message: sign1.message,
    signature: sign1.signature,
    publicKey: cypher.pubKey
});
console.log({ result1 });
ava_1.default("sign", test => {
    test.is(result, true);
    test.is(result1, false);
});
//# sourceMappingURL=sign.test.js.map