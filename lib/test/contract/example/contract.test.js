"use strict";

var _ava = _interopRequireDefault(require("ava"));

var _contractVM = _interopRequireDefault(require("../../../contract/contractVM"));

var _cypher = _interopRequireDefault(require("../../../blockchain/crypto/cypher"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var code = "\nconst initialState = { v0: 0 };\n\nfunction reducer(prevState = initialState, action = { type: \"\", data: {} }) {  \n  const data = action.data;\n  switch (action.type) {\n    case \"increment\":\n      prevState.v0++;\n      state = prevState;\n      break;\n    case \"add\":\n      prevState.v0 += parseInt(data.v1, 10);\n      state = prevState;\n      break;\n    default:\n      state = prevState;\n  }  \n}\n";
var cypher = new _cypher.default();
var sign = JSON.stringify(cypher.signMessage("test"));
var contract = new _contractVM.default("test", code, cypher.pubKey, sign);
contract.messageCall("add", {
  v1: "4"
});
contract.messageCall("add", {
  v1: "4"
});
contract.messageCall("increment");
contract.messageCall("increment");
var mcypher = new _cypher.default();
var mcontract = new _contractVM.default("test", code, mcypher.pubKey, sign);
mcontract.messageCall("increment");
(0, _ava.default)("contract", function (test) {
  test.is(10, contract.state.v0);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy90ZXN0L2NvbnRyYWN0L2V4YW1wbGUvY29udHJhY3QudGVzdC50cyJdLCJuYW1lcyI6WyJjb2RlIiwiY3lwaGVyIiwiQ3lwaGVyIiwic2lnbiIsIkpTT04iLCJzdHJpbmdpZnkiLCJzaWduTWVzc2FnZSIsImNvbnRyYWN0IiwiQ29udHJhY3RWTSIsInB1YktleSIsIm1lc3NhZ2VDYWxsIiwidjEiLCJtY3lwaGVyIiwibWNvbnRyYWN0IiwidGVzdCIsImlzIiwic3RhdGUiLCJ2MCJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7QUFDQTs7QUFDQTs7OztBQUVBLElBQU1BLElBQUksdWFBQVY7QUFvQkEsSUFBTUMsTUFBTSxHQUFHLElBQUlDLGVBQUosRUFBZjtBQUNBLElBQU1DLElBQUksR0FBR0MsSUFBSSxDQUFDQyxTQUFMLENBQWVKLE1BQU0sQ0FBQ0ssV0FBUCxDQUFtQixNQUFuQixDQUFmLENBQWI7QUFDQSxJQUFNQyxRQUFRLEdBQUcsSUFBSUMsbUJBQUosQ0FBZSxNQUFmLEVBQXVCUixJQUF2QixFQUE2QkMsTUFBTSxDQUFDUSxNQUFwQyxFQUE0Q04sSUFBNUMsQ0FBakI7QUFDQUksUUFBUSxDQUFDRyxXQUFULENBQXFCLEtBQXJCLEVBQTRCO0FBQUVDLEVBQUFBLEVBQUUsRUFBRTtBQUFOLENBQTVCO0FBQ0FKLFFBQVEsQ0FBQ0csV0FBVCxDQUFxQixLQUFyQixFQUE0QjtBQUFFQyxFQUFBQSxFQUFFLEVBQUU7QUFBTixDQUE1QjtBQUNBSixRQUFRLENBQUNHLFdBQVQsQ0FBcUIsV0FBckI7QUFDQUgsUUFBUSxDQUFDRyxXQUFULENBQXFCLFdBQXJCO0FBRUEsSUFBTUUsT0FBTyxHQUFHLElBQUlWLGVBQUosRUFBaEI7QUFDQSxJQUFNVyxTQUFTLEdBQUcsSUFBSUwsbUJBQUosQ0FBZSxNQUFmLEVBQXVCUixJQUF2QixFQUE2QlksT0FBTyxDQUFDSCxNQUFyQyxFQUE2Q04sSUFBN0MsQ0FBbEI7QUFDQVUsU0FBUyxDQUFDSCxXQUFWLENBQXNCLFdBQXRCO0FBRUEsa0JBQUssVUFBTCxFQUFpQixVQUFBSSxJQUFJLEVBQUk7QUFDdkJBLEVBQUFBLElBQUksQ0FBQ0MsRUFBTCxDQUFRLEVBQVIsRUFBWVIsUUFBUSxDQUFDUyxLQUFULENBQWVDLEVBQTNCO0FBQ0QsQ0FGRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0ZXN0IGZyb20gXCJhdmFcIjtcbmltcG9ydCBDb250cmFjdFZNIGZyb20gXCIuLi8uLi8uLi9jb250cmFjdC9jb250cmFjdFZNXCI7XG5pbXBvcnQgQ3lwaGVyIGZyb20gXCIuLi8uLi8uLi9ibG9ja2NoYWluL2NyeXB0by9jeXBoZXJcIjtcblxuY29uc3QgY29kZSA9IGBcbmNvbnN0IGluaXRpYWxTdGF0ZSA9IHsgdjA6IDAgfTtcblxuZnVuY3Rpb24gcmVkdWNlcihwcmV2U3RhdGUgPSBpbml0aWFsU3RhdGUsIGFjdGlvbiA9IHsgdHlwZTogXCJcIiwgZGF0YToge30gfSkgeyAgXG4gIGNvbnN0IGRhdGEgPSBhY3Rpb24uZGF0YTtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgXCJpbmNyZW1lbnRcIjpcbiAgICAgIHByZXZTdGF0ZS52MCsrO1xuICAgICAgc3RhdGUgPSBwcmV2U3RhdGU7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiYWRkXCI6XG4gICAgICBwcmV2U3RhdGUudjAgKz0gcGFyc2VJbnQoZGF0YS52MSwgMTApO1xuICAgICAgc3RhdGUgPSBwcmV2U3RhdGU7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgc3RhdGUgPSBwcmV2U3RhdGU7XG4gIH0gIFxufVxuYDtcblxuY29uc3QgY3lwaGVyID0gbmV3IEN5cGhlcigpO1xuY29uc3Qgc2lnbiA9IEpTT04uc3RyaW5naWZ5KGN5cGhlci5zaWduTWVzc2FnZShcInRlc3RcIikpO1xuY29uc3QgY29udHJhY3QgPSBuZXcgQ29udHJhY3RWTShcInRlc3RcIiwgY29kZSwgY3lwaGVyLnB1YktleSwgc2lnbik7XG5jb250cmFjdC5tZXNzYWdlQ2FsbChcImFkZFwiLCB7IHYxOiBcIjRcIiB9KTtcbmNvbnRyYWN0Lm1lc3NhZ2VDYWxsKFwiYWRkXCIsIHsgdjE6IFwiNFwiIH0pO1xuY29udHJhY3QubWVzc2FnZUNhbGwoXCJpbmNyZW1lbnRcIik7XG5jb250cmFjdC5tZXNzYWdlQ2FsbChcImluY3JlbWVudFwiKTtcblxuY29uc3QgbWN5cGhlciA9IG5ldyBDeXBoZXIoKTtcbmNvbnN0IG1jb250cmFjdCA9IG5ldyBDb250cmFjdFZNKFwidGVzdFwiLCBjb2RlLCBtY3lwaGVyLnB1YktleSwgc2lnbik7XG5tY29udHJhY3QubWVzc2FnZUNhbGwoXCJpbmNyZW1lbnRcIik7XG5cbnRlc3QoXCJjb250cmFjdFwiLCB0ZXN0ID0+IHtcbiAgdGVzdC5pcygxMCwgY29udHJhY3Quc3RhdGUudjApO1xufSk7XG4iXX0=