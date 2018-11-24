"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const cypher_1 = __importDefault(require("../../blockchain/crypto/cypher"));
const cypher = new cypher_1.default();
const cypher1 = new cypher_1.default();
const msg = "test";
const enc = cypher.encrypt(msg, cypher1.pubKey);
console.log({ enc });
const result = cypher1.decrypt(enc);
console.log({ result });
ava_1.default("sign", test => {
    test.is(result, msg);
});
//# sourceMappingURL=encrypt.test.js.map