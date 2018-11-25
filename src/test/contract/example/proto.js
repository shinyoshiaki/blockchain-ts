const initialState = { v0: 0 };

function reducer(prevState = initialState, action = { type: "", data: "{}" }) {
  console.log({ action });
  console.log("contract", { state });
  const data = action.data;
  switch (action.type) {
    case "increment":
      prevState.v0++;
      state = prevState;
      break;
    case "add":
      prevState.v0 += parseInt(data.v1, 10);
      state = prevState;
      break;
    default:
      state = prevState;
  }
  console.log("contract", { state });
}

let state = initialState;
reducer(state, { type: "add", data: JSON.stringify({ v1: "4" }) });
reducer(state, { type: "increment", data: JSON.stringify({}) });
