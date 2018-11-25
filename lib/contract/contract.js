"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const interface_1 = require("../blockchain/interface");
const contractVM_1 = __importDefault(require("./contractVM"));
const sha256_1 = __importDefault(require("sha256"));
class Contract {
    constructor(bc) {
        this.contracts = {};
        this.bc = bc;
    }
    deploy(tran) {
        const sign = JSON.stringify(this.bc.cypher.signMessage(Math.random().toString()));
        const payload = tran.data.payload;
        const contract = new contractVM_1.default(tran.recipient, payload.code, this.bc.cypher.pubKey, sign);
        this.contracts[contract.address] = contract;
    }
    messageCall(tran) {
        const payload = tran.data.payload;
        const contract = this.contracts[tran.recipient];
        contract.messageCall(payload.type, payload.data);
    }
    responder(tran) {
        if (tran.data.type === interface_1.ETransactionType.deploy) {
            this.deploy(tran);
        }
        else if (tran.data.type === interface_1.ETransactionType.messagecall) {
            this.messageCall(tran);
        }
    }
    makeContract(amount, code) {
        const address = sha256_1.default(this.bc.address + this.bc.getNonce());
        const payload = { code };
        const data = { type: interface_1.ETransactionType.deploy, payload };
        return this.bc.makeTransaction(address, amount, data);
    }
    makeMessageCall(address, amount, payload) {
        const data = {
            type: interface_1.ETransactionType.messagecall,
            payload
        };
        return this.bc.makeTransaction(address, amount, data);
    }
}
exports.default = Contract;
//# sourceMappingURL=contract.js.map