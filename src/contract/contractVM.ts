import { tokenize } from "esprima";
import { verifyMessageWithPublicKey } from "../blockchain/crypto/sign";

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
let name: string[] = [];
for (let i = 0; i < 1000; i++) {
  name.push("v" + i);
  name.push("a" + i);
  name.push("f" + i);
}

function checkcode(code: string): boolean {
  const token = tokenize(code);

  const illigals = token
    .map(item => {
      if (
        item.type === "Identifier" &&
        !word.includes(item.value) &&
        !whitelist.includes(item.value) &&
        !name.includes(item.value)
      )
        return item.value;
    })
    .filter(v => v);
  if (illigals.length > 0) {
    console.log({ illigals });
    return false;
  }

  const identifiers = token
    .map(item => {
      if (item.type === "Identifier") return item.value;
    })
    .filter(v => v);

  //@ts-ignore
  if (!identifiers.includes(...word)) {
    console.log("not enough");
    return false;
  }

  return true;
}

export default class ContractVM {
  address: string;
  code?: any;
  state: any = {};
  constructor(address: string, code: string, pubkey: string, sign: string) {
    this.address = address;
    this.code = code;
    if (checkcode(code)) {
      let state = {};
      function isOwner() {
        const json: { message: string; signature: string } = JSON.parse(sign);
        return verifyMessageWithPublicKey({
          message: json.message,
          publicKey: pubkey,
          signature: json.signature
        });
      }
      console.log("isowner", isOwner());
      eval(code + `reducer()`);
      this.state = state;
    }
  }

  messageCall(type: string, data = {}) {
    if (this.code) {
      let state = this.state;
      const func = `reducer(state,{type:"${type}",data:${JSON.stringify(
        data
      )}})`;
      const code = this.code + func;
      if (checkcode(code)) {
        eval(code);
        console.log("msgcall", { state });
        this.state = state;
      }
    }
  }
}
