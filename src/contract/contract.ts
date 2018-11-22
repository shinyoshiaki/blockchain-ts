import sha256 from "sha256";
import { tokenize } from "esprima";

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
  name.push("val" + i);
  name.push("func" + i);
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

interface Deploy {
  code: string;
}

interface MessageCall {
  type: string;
  data: object;
}

export default class Contract {
  address: string;
  code?: any;
  state: any = {};
  constructor(id: string, nonce: number) {
    this.address = sha256(id + nonce);
  }

  deploy(code: string) {
    this.code = code;
    if (checkcode(code)) {
      let state = {};
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
        console.log({ code });
        eval(code);
        console.log("msgcall", { state });
        this.state = state;
      }
    }
  }

  responder() {}
}
