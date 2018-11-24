"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const esprima_1 = require("esprima");
const word = [
    "reducer",
    "initialState",
    "prevState",
    "action",
    "type",
    "data",
    "state"
];
const whitelist = ["console", "log", "JSON", "parse", "parseInt"];
let name = [];
for (let i = 0; i < 1000; i++) {
    name.push("v" + i);
    name.push("f" + i);
}
function checkcode(code) {
    const token = esprima_1.tokenize(code);
    const illigals = token
        .map(item => {
        if (item.type === "Identifier" &&
            !word.includes(item.value) &&
            !whitelist.includes(item.value) &&
            !name.includes(item.value))
            return item.value;
    })
        .filter(v => v);
    if (illigals.length > 0) {
        console.log({ illigals });
        return false;
    }
    const identifiers = token
        .map(item => {
        if (item.type === "Identifier")
            return item.value;
    })
        .filter(v => v);
    //@ts-ignore
    if (!identifiers.includes(...word)) {
        console.log("not enough");
        return false;
    }
    return true;
}
class ContractVM {
    constructor(address, code) {
        this.state = {};
        this.address = address;
        this.code = code;
        if (checkcode(code)) {
            let state = {};
            eval(code + `reducer()`);
            this.state = state;
        }
    }
    messageCall(type, data = {}) {
        if (this.code) {
            let state = this.state;
            const func = `reducer(state,{type:"${type}",data:${JSON.stringify(data)}})`;
            const code = this.code + func;
            if (checkcode(code)) {
                eval(code);
                console.log("msgcall", { state });
                this.state = state;
            }
        }
    }
}
exports.default = ContractVM;
//# sourceMappingURL=contractVM.js.map