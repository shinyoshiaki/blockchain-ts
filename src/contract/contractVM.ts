import { tokenize } from "esprima";
import { verifyMessageWithPublicKey } from "../blockchain/crypto/sign";

export interface Icontract {
  state: {};
  reducers: { [key: string]: string };
}

const word = [
  "reducer",
  "initialState",
  "prev",
  "action",
  "type",
  "data",
  "$state"
];
const whitelist = [
  "console",
  "log",
  "JSON",
  "parse",
  "parseInt",
  "parseFloat",
  "isOwner",
  "pubkey"
];
const name: string[] = [];
for (let i = 0; i < 1000; i++) {
  name.push("Identifier" + i);
}

function translate(contract: Icontract) {
  const template = `
const initialState = @state;

function reducer(prev = initialState, action = { type: "", data: "{}" }) {
  const data = action.data;
  switch (action.type) {
    @reducer
    default:
      $state = prev;
  }  
  $state = prev;  
}
`;

  let code = template;
  code = code.replace(
    new RegExp("@state", "g"),
    JSON.stringify(contract.state)
  );
  let reducer = "";

  Object.keys(contract.reducers).forEach(key => {
    const func = contract.reducers[key];
    reducer += `
      case "${key}":
      {
          ${func}          
      }
      break;
      `;
  });
  code = code.replace(new RegExp("@reducer", "g"), reducer);

  const token = tokenize(code);
  const identifiers = token
    .map(item => {
      if (
        item.type === "Identifier" &&
        !word.includes(item.value) &&
        !whitelist.includes(item.value)
      )
        return item.value;
    })
    .filter(v => v)
    .filter(function(x, i, self) {
      return self.indexOf(x) === i;
    });

  console.log({ identifiers });

  const hash: { [key: string]: string } = {};
  identifiers.forEach((word, i) => {
    if (word) {
      hash[word] = "Identifier" + i;
      code = code.replace(new RegExp(word, "g"), "Identifier" + i);
    }
  });
  return { code, hash };
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

  illigals.forEach((word, i) => {
    if (word) {
      code = code.replace(new RegExp(word, "g"), "Identifier" + i);
    }
  });

  const identifiers = token
    .map(item => {
      if (item.type === "Identifier") return item.value;
    })
    .filter(v => v);

  console.log({ identifiers, word });

  //必要単語の検査
  if (word.map(v => identifiers.includes(v)).includes(false)) {
    console.log("not enough");
    return false;
  }

  return true;
}

export default class ContractVM {
  address: string;
  code?: any;
  state: any = {};
  idHash: { [key: string]: string };
  constructor(
    address: string,
    contract: Icontract,
    _pubkey: string,
    sign: string
  ) {
    this.address = address;
    const result = translate(contract);
    this.code = result.code;
    this.idHash = result.hash;
    if (checkcode(this.code)) {
      let $state = {};
      function isOwner() {
        const json: { message: string; signature: string } = JSON.parse(sign);
        return verifyMessageWithPublicKey({
          message: json.message,
          publicKey: pubkey,
          signature: json.signature
        });
      }
      const pubkey = _pubkey;
      eval(this.code + `reducer()`);
      this.state = $state;
    }
  }

  messageCall(type: string, data = {}) {
    let str = JSON.stringify(data);
    Object.keys(this.idHash).forEach(key => {
      str = str.replace(new RegExp(key, "g"), this.idHash[key]);
    });
    data = JSON.parse(str);

    let $state = this.state;
    const func = `reducer($state,{type:"${type}",data:${JSON.stringify(
      data
    )}})`;
    const code = this.code + func;
    if (checkcode(code)) {
      eval(code);
      console.log("msgcall", type, { data }, { $state });
      this.state = $state;
    }
  }

  getState(key: string) {
    const id = this.idHash[key];
    return this.state[id];
  }
}
