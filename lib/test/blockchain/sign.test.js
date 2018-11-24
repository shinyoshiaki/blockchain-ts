"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const cypher_1 = __importDefault(require("../../blockchain/crypto/cypher"));
const cypher = new cypher_1.default();
const sign = cypher.signMessage("test");
console.log({ sign });
const result = cypher.verifyMessage(sign);
console.log({ result });
ava_1.default("sign", test => {
    test.is(result, true);
});
//# sourceMappingURL=sign.test.js.map