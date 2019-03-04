"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _esprima = require("esprima");

var _id = _interopRequireDefault(require("./std/id"));

var _sss = _interopRequireDefault(require("./std/sss"));

var _cypher = _interopRequireDefault(require("./std/cypher"));

var _blockchain = _interopRequireDefault(require("./std/blockchain"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var word = ["reducer", "initialState", "prev", "action", "type", "data", "$state"];
var whitelist = ["console", "log", "JSON", "parse", "parseInt", "parseFloat", "length", "map", "isOwner", "pubkey", "sssSplit", "sssCombine", "makeTransaction", "encrypt"];

var name = _toConsumableArray(Array(1000)).map(function (_, i) {
  return "id" + i;
});

function translate(contract) {
  var template = "\nconst initialState = @state;\n\nfunction reducer(prev = initialState, action = { type: \"\", data: \"{}\" }) {\n  const data = action.data;\n  switch (action.type) {\n    @reducer\n    default:\n      $state = prev;\n  }\n  $state = prev;\n}\n";
  var code = template;
  code = code.replace(new RegExp("@state", "g"), JSON.stringify(contract.state));
  var reducer = "";
  Object.keys(contract.reducers).forEach(function (key) {
    var func = contract.reducers[key];
    reducer += "\n      case \"".concat(key, "\":\n      {\n          ").concat(func, "\n      }\n      break;\n      ");
  });
  code = code.replace(new RegExp("@reducer", "g"), reducer);
  var token = (0, _esprima.tokenize)(code);
  var identifiers = token.map(function (item) {
    if (item.type === "Identifier" && !word.includes(item.value) && !whitelist.includes(item.value)) return item.value;
  }).filter(function (v) {
    return v;
  }).filter(function (x, i, self) {
    return self.indexOf(x) === i;
  });
  console.log({
    identifiers: identifiers
  });
  var hash = {};
  identifiers.forEach(function (id, i) {
    if (id) {
      hash[id] = "id" + i;
      code = code.replace(new RegExp(id, "g"), "id" + i);
    }
  });
  console.log("code", code, {
    hash: hash
  });
  return {
    code: code,
    hash: hash
  };
}

function checkcode(code) {
  var token = (0, _esprima.tokenize)(code);
  var illigals = token.map(function (item) {
    if (item.type === "Identifier" && !word.includes(item.value) && !whitelist.includes(item.value) && !name.includes(item.value)) return item.value;
  }).filter(function (v) {
    return v;
  });

  if (illigals.length > 0) {
    console.log("contain illigals");
    return false;
  }

  var identifiers = token.map(function (item) {
    if (item.type === "Identifier") return item.value;
  }).filter(function (v) {
    return v;
  }); //必要単語の検査

  if (word.map(function (v) {
    return identifiers.includes(v);
  }).includes(false)) {
    console.log("not enough");
    return false;
  }

  return true;
}

var ContractVM =
/*#__PURE__*/
function () {
  function ContractVM(contract, blockchain, sign, address) {
    _classCallCheck(this, ContractVM);

    _defineProperty(this, "address", void 0);

    _defineProperty(this, "code", void 0);

    _defineProperty(this, "state", {});

    _defineProperty(this, "sign", void 0);

    _defineProperty(this, "cypher", void 0);

    _defineProperty(this, "contractBlockchain", void 0);

    _defineProperty(this, "idHash", void 0);

    this.address = address;
    var result = translate(contract);
    this.code = result.code;
    this.idHash = result.hash;
    this.sign = sign;
    this.cypher = new _cypher.default(blockchain.accout);
    this.contractBlockchain = new _blockchain.default(blockchain);
    var code = this.code + "reducer()";

    if (checkcode(code)) {
      this.runEval(code, {});
    }
  }

  _createClass(ContractVM, [{
    key: "messageCall",
    value: function messageCall(type) {
      var _this = this;

      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var str = JSON.stringify(data);
      Object.keys(this.idHash).forEach(function (key) {
        str = str.replace(new RegExp(key, "g"), _this.idHash[key]);
      });
      data = JSON.parse(str);
      var func = "reducer($state,{type:\"".concat(type, "\",data:").concat(JSON.stringify(data), "})");
      var code = this.code + func;

      if (checkcode(code)) {
        this.runEval(code, this.state);
      }
    }
  }, {
    key: "runEval",
    value: function runEval(code, state) {
      var _this2 = this;

      var $state = state;
      var pubkey = this.sign.publicKey;

      var isOwner = function isOwner() {
        return _id.default.isOwner(_this2.sign);
      };

      var sssSplit = _sss.default.sssSplit,
          sssCombine = _sss.default.sssCombine;
      var _this$cypher = this.cypher,
          encrypt = _this$cypher.encrypt,
          decrypt = _this$cypher.decrypt,
          signMessage = _this$cypher.signMessage,
          verifyMessage = _this$cypher.verifyMessage;
      var _this$contractBlockch = this.contractBlockchain,
          makeTransaction = _this$contractBlockch.makeTransaction,
          transfer = _this$contractBlockch.transfer;

      try {
        eval(code);
      } catch (error) {
        console.log(error);
      }

      this.state = $state;
    }
  }, {
    key: "getState",
    value: function getState(key) {
      var id = this.idHash[key];
      return this.state[id];
    }
  }]);

  return ContractVM;
}();

exports.default = ContractVM;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250cmFjdC9jb250cmFjdFZNLnRzIl0sIm5hbWVzIjpbIndvcmQiLCJ3aGl0ZWxpc3QiLCJuYW1lIiwiQXJyYXkiLCJtYXAiLCJfIiwiaSIsInRyYW5zbGF0ZSIsImNvbnRyYWN0IiwidGVtcGxhdGUiLCJjb2RlIiwicmVwbGFjZSIsIlJlZ0V4cCIsIkpTT04iLCJzdHJpbmdpZnkiLCJzdGF0ZSIsInJlZHVjZXIiLCJPYmplY3QiLCJrZXlzIiwicmVkdWNlcnMiLCJmb3JFYWNoIiwia2V5IiwiZnVuYyIsInRva2VuIiwiaWRlbnRpZmllcnMiLCJpdGVtIiwidHlwZSIsImluY2x1ZGVzIiwidmFsdWUiLCJmaWx0ZXIiLCJ2IiwieCIsInNlbGYiLCJpbmRleE9mIiwiY29uc29sZSIsImxvZyIsImhhc2giLCJpZCIsImNoZWNrY29kZSIsImlsbGlnYWxzIiwibGVuZ3RoIiwiQ29udHJhY3RWTSIsImJsb2NrY2hhaW4iLCJzaWduIiwiYWRkcmVzcyIsInJlc3VsdCIsImlkSGFzaCIsImN5cGhlciIsIkN5cGhlciIsImFjY291dCIsImNvbnRyYWN0QmxvY2tjaGFpbiIsIkNvbnRyYWN0QmxvY2tjaGFpbiIsInJ1bkV2YWwiLCJkYXRhIiwic3RyIiwicGFyc2UiLCIkc3RhdGUiLCJwdWJrZXkiLCJwdWJsaWNLZXkiLCJpc093bmVyIiwic3NzU3BsaXQiLCJzc3MiLCJzc3NDb21iaW5lIiwiZW5jcnlwdCIsImRlY3J5cHQiLCJzaWduTWVzc2FnZSIsInZlcmlmeU1lc3NhZ2UiLCJtYWtlVHJhbnNhY3Rpb24iLCJ0cmFuc2ZlciIsImV2YWwiLCJlcnJvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOztBQUdBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQU9BLElBQU1BLElBQUksR0FBRyxDQUNYLFNBRFcsRUFFWCxjQUZXLEVBR1gsTUFIVyxFQUlYLFFBSlcsRUFLWCxNQUxXLEVBTVgsTUFOVyxFQU9YLFFBUFcsQ0FB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eUJBTXhCQSxlQU53QjtBQUFBLFVBTVBDLFFBTk8seUJBTVBBLFFBTk87O0FBT2hDLFVBQUk7QUFDRkMsUUFBQUEsSUFBSSxDQUFDM0QsSUFBRCxDQUFKO0FBQ0QsT0FGRCxDQUVFLE9BQU80RCxLQUFQLEVBQWM7QUFDZHBDLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZbUMsS0FBWjtBQUNEOztBQUNELFdBQUt2RCxLQUFMLEdBQWF5QyxNQUFiO0FBQ0Q7Ozs2QkFFUW5DLEcsRUFBYTtBQUNwQixVQUFNZ0IsRUFBRSxHQUFHLEtBQUtTLE1BQUwsQ0FBWXpCLEdBQVosQ0FBWDtBQUNBLGFBQU8sS0FBS04sS0FBTCxDQUFXc0IsRUFBWCxDQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB0b2tlbml6ZSB9IGZyb20gXCJlc3ByaW1hXCI7XG5pbXBvcnQgaWQgZnJvbSBcIi4vc3RkL2lkXCI7XG5pbXBvcnQgc3NzIGZyb20gXCIuL3N0ZC9zc3NcIjtcbmltcG9ydCBDeXBoZXIgZnJvbSBcIi4vc3RkL2N5cGhlclwiO1xuaW1wb3J0IHsgU2lnbmVkTWVzc2FnZVdpdGhPbmVQYXNzcGhyYXNlIH0gZnJvbSBcIi4uL2Jsb2NrY2hhaW4vY3J5cHRvL3NpZ25cIjtcbmltcG9ydCBCbG9ja0NoYWluQXBwIGZyb20gXCIuLi9ibG9ja2NoYWluL2Jsb2NrY2hhaW5BcHBcIjtcbmltcG9ydCBDb250cmFjdEJsb2NrY2hhaW4gZnJvbSBcIi4vc3RkL2Jsb2NrY2hhaW5cIjtcblxuZXhwb3J0IGludGVyZmFjZSBJY29udHJhY3Qge1xuICBzdGF0ZToge307XG4gIHJlZHVjZXJzOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xufVxuXG5jb25zdCB3b3JkID0gW1xuICBcInJlZHVjZXJcIixcbiAgXCJpbml0aWFsU3RhdGVcIixcbiAgXCJwcmV2XCIsXG4gIFwiYWN0aW9uXCIsXG4gIFwidHlwZVwiLFxuICBcImRhdGFcIixcbiAgXCIkc3RhdGVcIlxuXTtcbmNvbnN0IHdoaXRlbGlzdCA9IFtcbiAgXCJjb25zb2xlXCIsXG4gIFwibG9nXCIsXG4gIFwiSlNPTlwiLFxuICBcInBhcnNlXCIsXG4gIFwicGFyc2VJbnRcIixcbiAgXCJwYXJzZUZsb2F0XCIsXG4gIFwibGVuZ3RoXCIsXG4gIFwibWFwXCIsXG4gIFwiaXNPd25lclwiLFxuICBcInB1YmtleVwiLFxuICBcInNzc1NwbGl0XCIsXG4gIFwic3NzQ29tYmluZVwiLFxuICBcIm1ha2VUcmFuc2FjdGlvblwiLFxuICBcImVuY3J5cHRcIlxuXTtcblxuY29uc3QgbmFtZSA9IFsuLi5BcnJheSgxMDAwKV0ubWFwKChfLCBpKSA9PiBcImlkXCIgKyBpKTtcblxuZnVuY3Rpb24gdHJhbnNsYXRlKGNvbnRyYWN0OiBJY29udHJhY3QpIHtcbiAgY29uc3QgdGVtcGxhdGUgPSBgXG5jb25zdCBpbml0aWFsU3RhdGUgPSBAc3RhdGU7XG5cbmZ1bmN0aW9uIHJlZHVjZXIocHJldiA9IGluaXRpYWxTdGF0ZSwgYWN0aW9uID0geyB0eXBlOiBcIlwiLCBkYXRhOiBcInt9XCIgfSkge1xuICBjb25zdCBkYXRhID0gYWN0aW9uLmRhdGE7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICBAcmVkdWNlclxuICAgIGRlZmF1bHQ6XG4gICAgICAkc3RhdGUgPSBwcmV2O1xuICB9XG4gICRzdGF0ZSA9IHByZXY7XG59XG5gO1xuXG4gIGxldCBjb2RlID0gdGVtcGxhdGU7XG4gIGNvZGUgPSBjb2RlLnJlcGxhY2UoXG4gICAgbmV3IFJlZ0V4cChcIkBzdGF0ZVwiLCBcImdcIiksXG4gICAgSlNPTi5zdHJpbmdpZnkoY29udHJhY3Quc3RhdGUpXG4gICk7XG4gIGxldCByZWR1Y2VyID0gXCJcIjtcblxuICBPYmplY3Qua2V5cyhjb250cmFjdC5yZWR1Y2VycykuZm9yRWFjaChrZXkgPT4ge1xuICAgIGNvbnN0IGZ1bmMgPSBjb250cmFjdC5yZWR1Y2Vyc1trZXldO1xuICAgIHJlZHVjZXIgKz0gYFxuICAgICAgY2FzZSBcIiR7a2V5fVwiOlxuICAgICAge1xuICAgICAgICAgICR7ZnVuY31cbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgICAgYDtcbiAgfSk7XG4gIGNvZGUgPSBjb2RlLnJlcGxhY2UobmV3IFJlZ0V4cChcIkByZWR1Y2VyXCIsIFwiZ1wiKSwgcmVkdWNlcik7XG5cbiAgY29uc3QgdG9rZW4gPSB0b2tlbml6ZShjb2RlKTtcbiAgY29uc3QgaWRlbnRpZmllcnMgPSB0b2tlblxuICAgIC5tYXAoaXRlbSA9PiB7XG4gICAgICBpZiAoXG4gICAgICAgIGl0ZW0udHlwZSA9PT0gXCJJZGVudGlmaWVyXCIgJiZcbiAgICAgICAgIXdvcmQuaW5jbHVkZXMoaXRlbS52YWx1ZSkgJiZcbiAgICAgICAgIXdoaXRlbGlzdC5pbmNsdWRlcyhpdGVtLnZhbHVlKVxuICAgICAgKVxuICAgICAgICByZXR1cm4gaXRlbS52YWx1ZTtcbiAgICB9KVxuICAgIC5maWx0ZXIodiA9PiB2KVxuICAgIC5maWx0ZXIoZnVuY3Rpb24oeCwgaSwgc2VsZikge1xuICAgICAgcmV0dXJuIHNlbGYuaW5kZXhPZih4KSA9PT0gaTtcbiAgICB9KTtcblxuICBjb25zb2xlLmxvZyh7IGlkZW50aWZpZXJzIH0pO1xuXG4gIGNvbnN0IGhhc2g6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7fTtcbiAgaWRlbnRpZmllcnMuZm9yRWFjaCgoaWQsIGkpID0+IHtcbiAgICBpZiAoaWQpIHtcbiAgICAgIGhhc2hbaWRdID0gXCJpZFwiICsgaTtcbiAgICAgIGNvZGUgPSBjb2RlLnJlcGxhY2UobmV3IFJlZ0V4cChpZCwgXCJnXCIpLCBcImlkXCIgKyBpKTtcbiAgICB9XG4gIH0pO1xuICBjb25zb2xlLmxvZyhcImNvZGVcIiwgY29kZSwgeyBoYXNoIH0pO1xuICByZXR1cm4geyBjb2RlLCBoYXNoIH07XG59XG5cbmZ1bmN0aW9uIGNoZWNrY29kZShjb2RlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgY29uc3QgdG9rZW4gPSB0b2tlbml6ZShjb2RlKTtcblxuICBjb25zdCBpbGxpZ2FscyA9IHRva2VuXG4gICAgLm1hcChpdGVtID0+IHtcbiAgICAgIGlmIChcbiAgICAgICAgaXRlbS50eXBlID09PSBcIklkZW50aWZpZXJcIiAmJlxuICAgICAgICAhd29yZC5pbmNsdWRlcyhpdGVtLnZhbHVlKSAmJlxuICAgICAgICAhd2hpdGVsaXN0LmluY2x1ZGVzKGl0ZW0udmFsdWUpICYmXG4gICAgICAgICFuYW1lLmluY2x1ZGVzKGl0ZW0udmFsdWUpXG4gICAgICApXG4gICAgICAgIHJldHVybiBpdGVtLnZhbHVlO1xuICAgIH0pXG4gICAgLmZpbHRlcih2ID0+IHYpO1xuXG4gIGlmIChpbGxpZ2Fscy5sZW5ndGggPiAwKSB7XG4gICAgY29uc29sZS5sb2coXCJjb250YWluIGlsbGlnYWxzXCIpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IGlkZW50aWZpZXJzID0gdG9rZW5cbiAgICAubWFwKGl0ZW0gPT4ge1xuICAgICAgaWYgKGl0ZW0udHlwZSA9PT0gXCJJZGVudGlmaWVyXCIpIHJldHVybiBpdGVtLnZhbHVlO1xuICAgIH0pXG4gICAgLmZpbHRlcih2ID0+IHYpO1xuXG4gIC8v5b+F6KaB5Y2Y6Kqe44Gu5qSc5p+7XG4gIGlmICh3b3JkLm1hcCh2ID0+IGlkZW50aWZpZXJzLmluY2x1ZGVzKHYpKS5pbmNsdWRlcyhmYWxzZSkpIHtcbiAgICBjb25zb2xlLmxvZyhcIm5vdCBlbm91Z2hcIik7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbnRyYWN0Vk0ge1xuICBhZGRyZXNzOiBzdHJpbmc7XG4gIGNvZGU6IGFueTtcbiAgc3RhdGU6IGFueSA9IHt9O1xuICBzaWduOiBTaWduZWRNZXNzYWdlV2l0aE9uZVBhc3NwaHJhc2U7XG4gIGN5cGhlcjogQ3lwaGVyO1xuXG4gIHByaXZhdGUgY29udHJhY3RCbG9ja2NoYWluOiBDb250cmFjdEJsb2NrY2hhaW47XG4gIHByaXZhdGUgaWRIYXNoOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGNvbnRyYWN0OiBJY29udHJhY3QsXG4gICAgYmxvY2tjaGFpbjogQmxvY2tDaGFpbkFwcCxcbiAgICBzaWduOiBTaWduZWRNZXNzYWdlV2l0aE9uZVBhc3NwaHJhc2UsXG4gICAgYWRkcmVzczogc3RyaW5nXG4gICkge1xuICAgIHRoaXMuYWRkcmVzcyA9IGFkZHJlc3M7XG4gICAgY29uc3QgcmVzdWx0ID0gdHJhbnNsYXRlKGNvbnRyYWN0KTtcbiAgICB0aGlzLmNvZGUgPSByZXN1bHQuY29kZTtcbiAgICB0aGlzLmlkSGFzaCA9IHJlc3VsdC5oYXNoO1xuICAgIHRoaXMuc2lnbiA9IHNpZ247XG4gICAgdGhpcy5jeXBoZXIgPSBuZXcgQ3lwaGVyKGJsb2NrY2hhaW4uYWNjb3V0KTtcbiAgICB0aGlzLmNvbnRyYWN0QmxvY2tjaGFpbiA9IG5ldyBDb250cmFjdEJsb2NrY2hhaW4oYmxvY2tjaGFpbik7XG5cbiAgICBjb25zdCBjb2RlID0gdGhpcy5jb2RlICsgYHJlZHVjZXIoKWA7XG4gICAgaWYgKGNoZWNrY29kZShjb2RlKSkge1xuICAgICAgdGhpcy5ydW5FdmFsKGNvZGUsIHt9KTtcbiAgICB9XG4gIH1cblxuICBtZXNzYWdlQ2FsbCh0eXBlOiBzdHJpbmcsIGRhdGEgPSB7fSkge1xuICAgIGxldCBzdHIgPSBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICBPYmplY3Qua2V5cyh0aGlzLmlkSGFzaCkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgc3RyID0gc3RyLnJlcGxhY2UobmV3IFJlZ0V4cChrZXksIFwiZ1wiKSwgdGhpcy5pZEhhc2hba2V5XSk7XG4gICAgfSk7XG4gICAgZGF0YSA9IEpTT04ucGFyc2Uoc3RyKTtcblxuICAgIGNvbnN0IGZ1bmMgPSBgcmVkdWNlcigkc3RhdGUse3R5cGU6XCIke3R5cGV9XCIsZGF0YToke0pTT04uc3RyaW5naWZ5KFxuICAgICAgZGF0YVxuICAgICl9fSlgO1xuICAgIGNvbnN0IGNvZGUgPSB0aGlzLmNvZGUgKyBmdW5jO1xuICAgIGlmIChjaGVja2NvZGUoY29kZSkpIHtcbiAgICAgIHRoaXMucnVuRXZhbChjb2RlLCB0aGlzLnN0YXRlKTtcbiAgICB9XG4gIH1cblxuICBydW5FdmFsKGNvZGU6IHN0cmluZywgc3RhdGU6IGFueSkge1xuICAgIGxldCAkc3RhdGUgPSBzdGF0ZTtcbiAgICBjb25zdCBwdWJrZXkgPSB0aGlzLnNpZ24ucHVibGljS2V5O1xuICAgIGNvbnN0IGlzT3duZXIgPSAoKSA9PiBpZC5pc093bmVyKHRoaXMuc2lnbik7XG4gICAgY29uc3QgeyBzc3NTcGxpdCwgc3NzQ29tYmluZSB9ID0gc3NzO1xuICAgIGNvbnN0IHsgZW5jcnlwdCwgZGVjcnlwdCwgc2lnbk1lc3NhZ2UsIHZlcmlmeU1lc3NhZ2UgfSA9IHRoaXMuY3lwaGVyO1xuICAgIGNvbnN0IHsgbWFrZVRyYW5zYWN0aW9uLCB0cmFuc2ZlciB9ID0gdGhpcy5jb250cmFjdEJsb2NrY2hhaW47XG4gICAgdHJ5IHtcbiAgICAgIGV2YWwoY29kZSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICB9XG4gICAgdGhpcy5zdGF0ZSA9ICRzdGF0ZTtcbiAgfVxuXG4gIGdldFN0YXRlKGtleTogc3RyaW5nKSB7XG4gICAgY29uc3QgaWQgPSB0aGlzLmlkSGFzaFtrZXldO1xuICAgIHJldHVybiB0aGlzLnN0YXRlW2lkXTtcbiAgfVxufVxuIl19