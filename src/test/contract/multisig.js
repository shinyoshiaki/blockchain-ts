const initialState = { shares: [] };

function reducer(prev = initialState, action = { type: "", data: "{}" }) {
  const data = action.data;
  switch (action.type) {
    case "init":
      {
        if (!isOwner()) return;
        const { friends } = data;
        console.log("multisig");
        const tran = makeTransaction(contractAddress, 1);
        const shares = sssSplit(tran, friends.length, 2);
        prev.shares = shares.map((share, i) => {
          encrypt(share, friends[i]);
        });
      }
      break;
    default:
      $state = prev;
  }
  $state = prev;
}
