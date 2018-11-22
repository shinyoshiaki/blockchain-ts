const initialState = { val1: 0 };

function reducer(prevState = initialState, action = { type: "", data: "{}" }) {
  console.log({ action });
  console.log("contract", { state });
  const data = action.data;
  switch (action.type) {
    case "increment":
      prevState.val1++;
      state = prevState;
      break;
    case "add":
      prevState.val1 += parseInt(data.val2, 10);
      state = prevState;
      break;
    default:
      state = prevState;
  }
  console.log("contract", { state });
}

let state = initialState;
reducer(state, { type: "add", data: JSON.stringify({ val2: "4" }) });
reducer(state, { type: "increment", data: JSON.stringify({}) });
