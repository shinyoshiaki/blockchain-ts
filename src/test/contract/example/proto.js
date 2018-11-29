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
      prevState.num += parseInt(data.add, 10);
      state = prevState;
      break;
    default:
      state = prevState;
  }
  console.log("contract", { state });
}

let state = initialState;

reducer(state, { type: "add", data: JSON.stringify({ add: "4" }) });
reducer(state, { type: "increment", data: JSON.stringify({}) });
