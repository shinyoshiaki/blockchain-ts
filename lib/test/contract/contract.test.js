"use strict";

var _ava = _interopRequireDefault(require("ava"));

var _contractVM = _interopRequireDefault(require("../../contract/contractVM"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var code = "\nconst initialState = { v0: 0 };\n\nfunction reducer(prevState = initialState, action = { type: \"\", data: {} }) {  \n  const data = action.data;\n  switch (action.type) {\n    case \"increment\":\n      prevState.v0++;\n      state = prevState;\n      break;\n    case \"add\":\n      prevState.v0 += parseInt(data.v1, 10);\n      state = prevState;\n      break;\n    default:\n      state = prevState;\n  }  \n}\n";
var contract = new _contractVM.default("test", code);
contract.messageCall("add", {
  v1: "4"
});
contract.messageCall("add", {
  v1: "4"
});
contract.messageCall("increment");
contract.messageCall("increment");
(0, _ava.default)("contract", function (test) {
  test.is(10, contract.state.v0);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90ZXN0L2NvbnRyYWN0L2NvbnRyYWN0LnRlc3QudHMiXSwibmFtZXMiOlsiY29kZSIsImNvbnRyYWN0IiwiQ29udHJhY3RWTSIsIm1lc3NhZ2VDYWxsIiwidjEiLCJ0ZXN0IiwiaXMiLCJzdGF0ZSIsInYwIl0sIm1hcHBpbmdzIjoiOztBQUFBOztBQUNBOzs7O0FBRUEsSUFBTUEsSUFBSSx1YUFBVjtBQW9CQSxJQUFNQyxRQUFRLEdBQUcsSUFBSUMsbUJBQUosQ0FBZSxNQUFmLEVBQXVCRixJQUF2QixDQUFqQjtBQUNBQyxRQUFRLENBQUNFLFdBQVQsQ0FBcUIsS0FBckIsRUFBNEI7QUFBRUMsRUFBQUEsRUFBRSxFQUFFO0FBQU4sQ0FBNUI7QUFDQUgsUUFBUSxDQUFDRSxXQUFULENBQXFCLEtBQXJCLEVBQTRCO0FBQUVDLEVBQUFBLEVBQUUsRUFBRTtBQUFOLENBQTVCO0FBQ0FILFFBQVEsQ0FBQ0UsV0FBVCxDQUFxQixXQUFyQjtBQUNBRixRQUFRLENBQUNFLFdBQVQsQ0FBcUIsV0FBckI7QUFFQSxrQkFBSyxVQUFMLEVBQWlCLFVBQUFFLElBQUksRUFBSTtBQUN2QkEsRUFBQUEsSUFBSSxDQUFDQyxFQUFMLENBQVEsRUFBUixFQUFZTCxRQUFRLENBQUNNLEtBQVQsQ0FBZUMsRUFBM0I7QUFDRCxDQUZEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHRlc3QgZnJvbSBcImF2YVwiO1xuaW1wb3J0IENvbnRyYWN0Vk0gZnJvbSBcIi4uLy4uL2NvbnRyYWN0L2NvbnRyYWN0Vk1cIjtcblxuY29uc3QgY29kZSA9IGBcbmNvbnN0IGluaXRpYWxTdGF0ZSA9IHsgdjA6IDAgfTtcblxuZnVuY3Rpb24gcmVkdWNlcihwcmV2U3RhdGUgPSBpbml0aWFsU3RhdGUsIGFjdGlvbiA9IHsgdHlwZTogXCJcIiwgZGF0YToge30gfSkgeyAgXG4gIGNvbnN0IGRhdGEgPSBhY3Rpb24uZGF0YTtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgXCJpbmNyZW1lbnRcIjpcbiAgICAgIHByZXZTdGF0ZS52MCsrO1xuICAgICAgc3RhdGUgPSBwcmV2U3RhdGU7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiYWRkXCI6XG4gICAgICBwcmV2U3RhdGUudjAgKz0gcGFyc2VJbnQoZGF0YS52MSwgMTApO1xuICAgICAgc3RhdGUgPSBwcmV2U3RhdGU7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgc3RhdGUgPSBwcmV2U3RhdGU7XG4gIH0gIFxufVxuYDtcblxuY29uc3QgY29udHJhY3QgPSBuZXcgQ29udHJhY3RWTShcInRlc3RcIiwgY29kZSk7XG5jb250cmFjdC5tZXNzYWdlQ2FsbChcImFkZFwiLCB7IHYxOiBcIjRcIiB9KTtcbmNvbnRyYWN0Lm1lc3NhZ2VDYWxsKFwiYWRkXCIsIHsgdjE6IFwiNFwiIH0pO1xuY29udHJhY3QubWVzc2FnZUNhbGwoXCJpbmNyZW1lbnRcIik7XG5jb250cmFjdC5tZXNzYWdlQ2FsbChcImluY3JlbWVudFwiKTtcblxudGVzdChcImNvbnRyYWN0XCIsIHRlc3QgPT4ge1xuICB0ZXN0LmlzKDEwLCBjb250cmFjdC5zdGF0ZS52MCk7XG59KTtcbiJdfQ==