import { tokenize } from "esprima";

let code = `
const initialState = { num: 0 };

function reducer(prevState = initialState, action = { type: "", data: "{}" }) {
  console.log({ action });
  console.log("contract", { state });
  const data = action.data;
  switch (action.type) {
    case "increment":
      prevState.num++;
      state = prevState;
      break;
    case "add":
      prevState.num += parseInt(data.num, 10);
      state = prevState;
      break;
    default:
      state = prevState;
  }
  console.log("contract", { state });
}

let state = initialState;
`;

const template = `
const initialState = @state;

function reducer(prevState = initialState, action = { type: "", data: "{}" }) {
  const data = action.data;
  switch (action.type) {
    @reducer
    default:
      state = prevState;
  }
  state = prevState;  
}

let state = initialState;
`;

const word = [
  "reducer",
  "initialState",
  "prev",
  "action",
  "type",
  "data",
  "state"
];
const whitelist = [
  "console",
  "log",
  "JSON",
  "parse",
  "parseInt",
  "isOwner",
  "pubkey"
];

code = translate(
  { num: 0 },
  {
    increment: "prevState.num++;",
    decrement: "prevState.num--;"
  }
);

const token = tokenize(code);
const illigals = token
  .map(item => {
    if (
      item.type === "Identifier" &&
      !word.includes(item.value) &&
      !whitelist.includes(item.value)
    )
      return item.value;
  })
  .filter(v => v);

console.log({ illigals });

illigals.forEach((word, i) => {
  if (word) {
    code = code.replace(new RegExp(word, "g"), "Identifier" + i);
  }
});

console.log(code);

function translate(state: {}, reducers: { [key: string]: string }) {
  let code = template;
  code = code.replace(new RegExp("@state", "g"), JSON.stringify(state));
  let reducer = "";

  Object.keys(reducers).forEach(key => {
    const func = reducers[key];
    reducer += `
    case "${key}":
    {
        ${func}
    }
    break;
    `;
  });

  code = code.replace(new RegExp("@reducer", "g"), reducer);
  return code;
}
