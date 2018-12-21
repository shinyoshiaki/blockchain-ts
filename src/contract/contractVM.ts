import { tokenize } from "esprima";
import id from "./std/id";
import sss from "./std/sss";
import Cypher from "./std/cypher";
import { SignedMessageWithOnePassphrase } from "../blockchain/crypto/sign";
import BlockChainApp from "../blockchain/blockchainApp";
import ContractBlockchain from "./std/blockchain";

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
  "length",
  "map",
  "isOwner",
  "pubkey",
  "sssSplit",
  "sssCombine",
  "makeTransaction",
  "encrypt"
];
const name: string[] = [];
for (let i = 0; i < 1000; i++) {
  name.push("id" + i);
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
  identifiers.forEach((id, i) => {
    if (id) {
      hash[id] = "id" + i;
      code = code.replace(new RegExp(id, "g"), "id" + i);
    }
  });
  console.log("code", code, { hash });
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

  if (illigals.length > 0) {
    console.log("contain illigals");
    return false;
  }

  const identifiers = token
    .map(item => {
      if (item.type === "Identifier") return item.value;
    })
    .filter(v => v);

  //必要単語の検査
  if (word.map(v => identifiers.includes(v)).includes(false)) {
    console.log("not enough");
    return false;
  }

  return true;
}

export default class ContractVM {
  address: string;
  code: any;
  state: any = {};
  idHash: { [key: string]: string };
  sign: SignedMessageWithOnePassphrase;
  cypher: Cypher;
  contractBlockchain: ContractBlockchain;
  constructor(
    contract: Icontract,
    blockchain: BlockChainApp,
    sign: SignedMessageWithOnePassphrase,
    address: string
  ) {
    this.address = address;
    const result = translate(contract);
    this.code = result.code;
    this.idHash = result.hash;
    this.sign = sign;
    this.cypher = new Cypher(blockchain.accout);
    this.contractBlockchain = new ContractBlockchain(blockchain);

    const code = this.code + `reducer()`;
    if (checkcode(code)) {
      this.runEval(code, {});
    }
  }

  messageCall(type: string, data = {}) {
    let str = JSON.stringify(data);
    Object.keys(this.idHash).forEach(key => {
      str = str.replace(new RegExp(key, "g"), this.idHash[key]);
    });
    data = JSON.parse(str);

    const func = `reducer($state,{type:"${type}",data:${JSON.stringify(
      data
    )}})`;
    const code = this.code + func;
    if (checkcode(code)) {
      this.runEval(code, this.state);
    }
  }

  runEval(code: string, state: any) {
    let $state = state;
    const pubkey = this.sign.publicKey;
    const isOwner = () => id.isOwner(this.sign);
    const { sssSplit, sssCombine } = sss;
    const { encrypt, decrypt, signMessage, verifyMessage } = this.cypher;
    const { makeTransaction, transfer } = this.contractBlockchain;
    try {
      eval(code);
    } catch (error) {
      console.log(error);
    }
    this.state = $state;
  }

  getState(key: string) {
    const id = this.idHash[key];
    return this.state[id];
  }
}
