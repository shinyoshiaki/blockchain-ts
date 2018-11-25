//v0:sharekeys,v1:target
const initialState = {sign:"", v0: [], v1: "" };

//a0:sharekeys,a1:target
function reducer(prevState = initialState, action = { type: "", data: "{}" }) {
  console.log({ action });
  console.log("contract", { state });
  const data = action.data;
  switch (action.type) {
    case "setkeys":
      if (isOwner()) prevState.v0 = data.a0;
      state = prevState;
      break;
    case "make":
      if (isOwner()) prevState.v1 = data.a1;
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
