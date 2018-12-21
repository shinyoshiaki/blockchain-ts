"use strict";

var _contractVM = _interopRequireDefault(require("../../contract/contractVM"));

var _cypher = _interopRequireDefault(require("../../contract/std/cypher"));

var _blockchainApp = _interopRequireDefault(require("../../blockchain/blockchainApp"));

var _sha = _interopRequireDefault(require("sha256"));

var _account = _interopRequireDefault(require("../../blockchain/account"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var target = (0, _sha.default)("target").toString();

var friends = _toConsumableArray(Array(3)).map(function () {
  return new _account.default().pubKey;
});

var contract = {
  state: {
    shares: []
  },
  reducers: {
    start: "\n        if (!isOwner()) return;\n        console.log(\"multisig\");\n        const tran = makeTransaction(\"".concat(target, "\", 1,\"smartcontract\");\n        if(!tran)return;\n        console.log(\"made\");\n        const friends = data.friends;\n        const shares = sssSplit(tran, friends.length, 2);\n        prev.shares = shares.map((share, index) => {\n         return encrypt(share, friends[index]);\n        });\n    ")
  }
};
console.log({
  contract: contract
});

function run() {
  return _run.apply(this, arguments);
}

function _run() {
  _run = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee() {
    var blockchain, account, cypher, sign, vm;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            blockchain = new _blockchainApp.default();
            _context.next = 3;
            return blockchain.mine();

          case 3:
            account = blockchain.accout;
            cypher = new _cypher.default(account);
            sign = cypher.signMessage(Math.random().toString());
            vm = new _contractVM.default(contract, blockchain, sign, "test");
            vm.messageCall("start", {
              friends: friends
            });
            console.log(vm.state);

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
  return _run.apply(this, arguments);
}

run();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90ZXN0L2NvbnRyYWN0L211bHRpc2lnLnRzIl0sIm5hbWVzIjpbInRhcmdldCIsInRvU3RyaW5nIiwiZnJpZW5kcyIsIkFycmF5IiwibWFwIiwiQWNjb3VudCIsInB1YktleSIsImNvbnRyYWN0Iiwic3RhdGUiLCJzaGFyZXMiLCJyZWR1Y2VycyIsInN0YXJ0IiwiY29uc29sZSIsImxvZyIsInJ1biIsImJsb2NrY2hhaW4iLCJCbG9ja0NoYWluQXBwIiwibWluZSIsImFjY291bnQiLCJhY2NvdXQiLCJjeXBoZXIiLCJDeXBoZXIiLCJzaWduIiwic2lnbk1lc3NhZ2UiLCJNYXRoIiwicmFuZG9tIiwidm0iLCJDb250cmFjdFZNIiwibWVzc2FnZUNhbGwiXSwibWFwcGluZ3MiOiI7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxJQUFNQSxNQUFNLEdBQUcsa0JBQU8sUUFBUCxFQUFpQkMsUUFBakIsRUFBZjs7QUFDQSxJQUFNQyxPQUFPLEdBQUcsbUJBQUlDLEtBQUssQ0FBQyxDQUFELENBQVQsRUFBY0MsR0FBZCxDQUFrQjtBQUFBLFNBQU0sSUFBSUMsZ0JBQUosR0FBY0MsTUFBcEI7QUFBQSxDQUFsQixDQUFoQjs7QUFFQSxJQUFNQyxRQUFtQixHQUFHO0FBQzFCQyxFQUFBQSxLQUFLLEVBQUU7QUFBRUMsSUFBQUEsTUFBTSxFQUFFO0FBQVYsR0FEbUI7QUFFMUJDLEVBQUFBLFFBQVEsRUFBRTtBQUNSQyxJQUFBQSxLQUFLLDBIQUcrQlgsTUFIL0I7QUFERztBQUZnQixDQUE1QjtBQWtCQVksT0FBTyxDQUFDQyxHQUFSLENBQVk7QUFBRU4sRUFBQUEsUUFBUSxFQUFSQTtBQUFGLENBQVo7O1NBRWVPLEc7Ozs7Ozs7MEJBQWY7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ1FDLFlBQUFBLFVBRFIsR0FDcUIsSUFBSUMsc0JBQUosRUFEckI7QUFBQTtBQUFBLG1CQUVRRCxVQUFVLENBQUNFLElBQVgsRUFGUjs7QUFBQTtBQUdRQyxZQUFBQSxPQUhSLEdBR2tCSCxVQUFVLENBQUNJLE1BSDdCO0FBSVFDLFlBQUFBLE1BSlIsR0FJaUIsSUFBSUMsZUFBSixDQUFXSCxPQUFYLENBSmpCO0FBS1FJLFlBQUFBLElBTFIsR0FLZUYsTUFBTSxDQUFDRyxXQUFQLENBQW1CQyxJQUFJLENBQUNDLE1BQUwsR0FBY3hCLFFBQWQsRUFBbkIsQ0FMZjtBQU1ReUIsWUFBQUEsRUFOUixHQU1hLElBQUlDLG1CQUFKLENBQWVwQixRQUFmLEVBQXlCUSxVQUF6QixFQUFxQ08sSUFBckMsRUFBMkMsTUFBM0MsQ0FOYjtBQU9FSSxZQUFBQSxFQUFFLENBQUNFLFdBQUgsQ0FBZSxPQUFmLEVBQXdCO0FBQUUxQixjQUFBQSxPQUFPLEVBQVBBO0FBQUYsYUFBeEI7QUFDQVUsWUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVlhLEVBQUUsQ0FBQ2xCLEtBQWY7O0FBUkY7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRzs7OztBQVdBTSxHQUFHIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IENvbnRyYWN0Vk0sIHsgSWNvbnRyYWN0IH0gZnJvbSBcIi4uLy4uL2NvbnRyYWN0L2NvbnRyYWN0Vk1cIjtcbmltcG9ydCBDeXBoZXIgZnJvbSBcIi4uLy4uL2NvbnRyYWN0L3N0ZC9jeXBoZXJcIjtcbmltcG9ydCBCbG9ja0NoYWluQXBwIGZyb20gXCIuLi8uLi9ibG9ja2NoYWluL2Jsb2NrY2hhaW5BcHBcIjtcbmltcG9ydCBzaGEyNTYgZnJvbSBcInNoYTI1NlwiO1xuaW1wb3J0IEFjY291bnQgZnJvbSBcIi4uLy4uL2Jsb2NrY2hhaW4vYWNjb3VudFwiO1xuXG5jb25zdCB0YXJnZXQgPSBzaGEyNTYoXCJ0YXJnZXRcIikudG9TdHJpbmcoKTtcbmNvbnN0IGZyaWVuZHMgPSBbLi4uQXJyYXkoMyldLm1hcCgoKSA9PiBuZXcgQWNjb3VudCgpLnB1YktleSk7XG5cbmNvbnN0IGNvbnRyYWN0OiBJY29udHJhY3QgPSB7XG4gIHN0YXRlOiB7IHNoYXJlczogW10gfSxcbiAgcmVkdWNlcnM6IHtcbiAgICBzdGFydDogYFxuICAgICAgICBpZiAoIWlzT3duZXIoKSkgcmV0dXJuO1xuICAgICAgICBjb25zb2xlLmxvZyhcIm11bHRpc2lnXCIpO1xuICAgICAgICBjb25zdCB0cmFuID0gbWFrZVRyYW5zYWN0aW9uKFwiJHt0YXJnZXR9XCIsIDEsXCJzbWFydGNvbnRyYWN0XCIpO1xuICAgICAgICBpZighdHJhbilyZXR1cm47XG4gICAgICAgIGNvbnNvbGUubG9nKFwibWFkZVwiKTtcbiAgICAgICAgY29uc3QgZnJpZW5kcyA9IGRhdGEuZnJpZW5kcztcbiAgICAgICAgY29uc3Qgc2hhcmVzID0gc3NzU3BsaXQodHJhbiwgZnJpZW5kcy5sZW5ndGgsIDIpO1xuICAgICAgICBwcmV2LnNoYXJlcyA9IHNoYXJlcy5tYXAoKHNoYXJlLCBpbmRleCkgPT4ge1xuICAgICAgICAgcmV0dXJuIGVuY3J5cHQoc2hhcmUsIGZyaWVuZHNbaW5kZXhdKTtcbiAgICAgICAgfSk7XG4gICAgYFxuICB9XG59O1xuXG5jb25zb2xlLmxvZyh7IGNvbnRyYWN0IH0pO1xuXG5hc3luYyBmdW5jdGlvbiBydW4oKSB7XG4gIGNvbnN0IGJsb2NrY2hhaW4gPSBuZXcgQmxvY2tDaGFpbkFwcCgpO1xuICBhd2FpdCBibG9ja2NoYWluLm1pbmUoKTtcbiAgY29uc3QgYWNjb3VudCA9IGJsb2NrY2hhaW4uYWNjb3V0O1xuICBjb25zdCBjeXBoZXIgPSBuZXcgQ3lwaGVyKGFjY291bnQpO1xuICBjb25zdCBzaWduID0gY3lwaGVyLnNpZ25NZXNzYWdlKE1hdGgucmFuZG9tKCkudG9TdHJpbmcoKSk7XG4gIGNvbnN0IHZtID0gbmV3IENvbnRyYWN0Vk0oY29udHJhY3QsIGJsb2NrY2hhaW4sIHNpZ24sIFwidGVzdFwiKTtcbiAgdm0ubWVzc2FnZUNhbGwoXCJzdGFydFwiLCB7IGZyaWVuZHMgfSk7XG4gIGNvbnNvbGUubG9nKHZtLnN0YXRlKTtcbn1cblxucnVuKCk7XG4iXX0=