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
var whitelist = ["console", "log", "JSON", "parse", "parseInt", "parseFloat", "length", "map", "isOwner", "pubkey", "sssSplit", "sssCombine", "makeTransaction", "encrypt", "contractAddress"];

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
      var contractAddress = this.address;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250cmFjdC9jb250cmFjdFZNLnRzIl0sIm5hbWVzIjpbIndvcmQiLCJ3aGl0ZWxpc3QiLCJuYW1lIiwiQXJyYXkiLCJtYXAiLCJfIiwiaSIsInRyYW5zbGF0ZSIsImNvbnRyYWN0IiwidGVtcGxhdGUiLCJjb2RlIiwicmVwbGFjZSIsIlJlZ0V4cCIsIkpTT04iLCJzdHJpbmdpZnkiLCJzdGF0ZSIsInJlZHVjZXIiLCJPYmplY3QiLCJrZXlzIiwicmVkdWNlcnMiLCJmb3JFYWNoIiwia2V5IiwiZnVuYyIsInRva2VuIiwiaWRlbnRpZmllcnMiLCJpdGVtIiwidHlwZSIsImluY2x1ZGVzIiwidmFsdWUiLCJmaWx0ZXIiLCJ2IiwieCIsInNlbGYiLCJpbmRleE9mIiwiY29uc29sZSIsImxvZyIsImhhc2giLCJpZCIsImNoZWNrY29kZSIsImlsbGlnYWxzIiwibGVuZ3RoIiwiQ29udHJhY3RWTSIsImJsb2NrY2hhaW4iLCJzaWduIiwiYWRkcmVzcyIsInJlc3VsdCIsImlkSGFzaCIsImN5cGhlciIsIkN5cGhlciIsImFjY291dCIsImNvbnRyYWN0QmxvY2tjaGFpbiIsIkNvbnRyYWN0QmxvY2tjaGFpbiIsInJ1bkV2YWwiLCJkYXRhIiwic3RyIiwicGFyc2UiLCIkc3RhdGUiLCJwdWJrZXkiLCJwdWJsaWNLZXkiLCJjb250cmFjdEFkZHJlc3MiLCJpc093bmVyIiwic3NzU3BsaXQiLCJzc3MiLCJzc3NDb21iaW5lIiwiZW5jcnlwdCIsImRlY3J5cHQiLCJzaWduTWVzc2FnZSIsInZlcmlmeU1lc3NhZ2UiLCJtYWtlVHJhbnNhY3Rpb24iLCJ0cmFuc2ZlciIsImV2YWwiLCJlcnJvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOztBQUdBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQU9BLElBQU1BLElBQUksR0FBRyxDQUNYLFNBRFcsRUFFWCxjQUZXLEVBR1gsTUFIVyxFQUlYLFFBSlcsRUFLWCxNQUxXLEVBTVgs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VUFNT0MsYUFOUCxnQkFNT0EsYUFOUDtBQUFBLGtDQU9NLEtBQUtqQixrQkFQWDtBQUFBLFVBT3hCa0IsZUFQd0IseUJBT3hCQSxlQVB3QjtBQUFBLFVBT1BDLFFBUE8seUJBT1BBLFFBUE87O0FBUWhDLFVBQUk7QUFDRkMsUUFBQUEsSUFBSSxDQUFDNUQsSUFBRCxDQUFKO0FBQ0QsT0FGRCxDQUVFLE9BQU82RCxLQUFQLEVBQWM7QUFDZHJDLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZb0MsS0FBWjtBQUNEOztBQUNELFdBQUt4RCxLQUFMLEdBQWF5QyxNQUFiO0FBQ0Q7Ozs2QkFFUW5DLEcsRUFBYTtBQUNwQixVQUFNZ0IsRUFBRSxHQUFHLEtBQUtTLE1BQUwsQ0FBWXpCLEdBQVosQ0FBWDtBQUNBLGFBQU8sS0FBS04sS0FBTCxDQUFXc0IsRUFBWCxDQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB0b2tlbml6ZSB9IGZyb20gXCJlc3ByaW1hXCI7XG5pbXBvcnQgaWQgZnJvbSBcIi4vc3RkL2lkXCI7XG5pbXBvcnQgc3NzIGZyb20gXCIuL3N0ZC9zc3NcIjtcbmltcG9ydCBDeXBoZXIgZnJvbSBcIi4vc3RkL2N5cGhlclwiO1xuaW1wb3J0IHsgU2lnbmVkTWVzc2FnZVdpdGhPbmVQYXNzcGhyYXNlIH0gZnJvbSBcIi4uL2Jsb2NrY2hhaW4vY3J5cHRvL3NpZ25cIjtcbmltcG9ydCBCbG9ja0NoYWluQXBwIGZyb20gXCIuLi9ibG9ja2NoYWluL2Jsb2NrY2hhaW5BcHBcIjtcbmltcG9ydCBDb250cmFjdEJsb2NrY2hhaW4gZnJvbSBcIi4vc3RkL2Jsb2NrY2hhaW5cIjtcblxuZXhwb3J0IGludGVyZmFjZSBJY29udHJhY3Qge1xuICBzdGF0ZToge307XG4gIHJlZHVjZXJzOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xufVxuXG5jb25zdCB3b3JkID0gW1xuICBcInJlZHVjZXJcIixcbiAgXCJpbml0aWFsU3RhdGVcIixcbiAgXCJwcmV2XCIsXG4gIFwiYWN0aW9uXCIsXG4gIFwidHlwZVwiLFxuICBcImRhdGFcIixcbiAgXCIkc3RhdGVcIlxuXTtcbmNvbnN0IHdoaXRlbGlzdCA9IFtcbiAgXCJjb25zb2xlXCIsXG4gIFwibG9nXCIsXG4gIFwiSlNPTlwiLFxuICBcInBhcnNlXCIsXG4gIFwicGFyc2VJbnRcIixcbiAgXCJwYXJzZUZsb2F0XCIsXG4gIFwibGVuZ3RoXCIsXG4gIFwibWFwXCIsXG4gIFwiaXNPd25lclwiLFxuICBcInB1YmtleVwiLFxuICBcInNzc1NwbGl0XCIsXG4gIFwic3NzQ29tYmluZVwiLFxuICBcIm1ha2VUcmFuc2FjdGlvblwiLFxuICBcImVuY3J5cHRcIixcbiAgXCJjb250cmFjdEFkZHJlc3NcIlxuXTtcblxuY29uc3QgbmFtZSA9IFsuLi5BcnJheSgxMDAwKV0ubWFwKChfLCBpKSA9PiBcImlkXCIgKyBpKTtcblxuZnVuY3Rpb24gdHJhbnNsYXRlKGNvbnRyYWN0OiBJY29udHJhY3QpIHtcbiAgY29uc3QgdGVtcGxhdGUgPSBgXG5jb25zdCBpbml0aWFsU3RhdGUgPSBAc3RhdGU7XG5cbmZ1bmN0aW9uIHJlZHVjZXIocHJldiA9IGluaXRpYWxTdGF0ZSwgYWN0aW9uID0geyB0eXBlOiBcIlwiLCBkYXRhOiBcInt9XCIgfSkge1xuICBjb25zdCBkYXRhID0gYWN0aW9uLmRhdGE7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICBAcmVkdWNlclxuICAgIGRlZmF1bHQ6XG4gICAgICAkc3RhdGUgPSBwcmV2O1xuICB9XG4gICRzdGF0ZSA9IHByZXY7XG59XG5gO1xuXG4gIGxldCBjb2RlID0gdGVtcGxhdGU7XG4gIGNvZGUgPSBjb2RlLnJlcGxhY2UoXG4gICAgbmV3IFJlZ0V4cChcIkBzdGF0ZVwiLCBcImdcIiksXG4gICAgSlNPTi5zdHJpbmdpZnkoY29udHJhY3Quc3RhdGUpXG4gICk7XG4gIGxldCByZWR1Y2VyID0gXCJcIjtcblxuICBPYmplY3Qua2V5cyhjb250cmFjdC5yZWR1Y2VycykuZm9yRWFjaChrZXkgPT4ge1xuICAgIGNvbnN0IGZ1bmMgPSBjb250cmFjdC5yZWR1Y2Vyc1trZXldO1xuICAgIHJlZHVjZXIgKz0gYFxuICAgICAgY2FzZSBcIiR7a2V5fVwiOlxuICAgICAge1xuICAgICAgICAgICR7ZnVuY31cbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgICAgYDtcbiAgfSk7XG4gIGNvZGUgPSBjb2RlLnJlcGxhY2UobmV3IFJlZ0V4cChcIkByZWR1Y2VyXCIsIFwiZ1wiKSwgcmVkdWNlcik7XG5cbiAgY29uc3QgdG9rZW4gPSB0b2tlbml6ZShjb2RlKTtcbiAgY29uc3QgaWRlbnRpZmllcnMgPSB0b2tlblxuICAgIC5tYXAoaXRlbSA9PiB7XG4gICAgICBpZiAoXG4gICAgICAgIGl0ZW0udHlwZSA9PT0gXCJJZGVudGlmaWVyXCIgJiZcbiAgICAgICAgIXdvcmQuaW5jbHVkZXMoaXRlbS52YWx1ZSkgJiZcbiAgICAgICAgIXdoaXRlbGlzdC5pbmNsdWRlcyhpdGVtLnZhbHVlKVxuICAgICAgKVxuICAgICAgICByZXR1cm4gaXRlbS52YWx1ZTtcbiAgICB9KVxuICAgIC5maWx0ZXIodiA9PiB2KVxuICAgIC5maWx0ZXIoZnVuY3Rpb24oeCwgaSwgc2VsZikge1xuICAgICAgcmV0dXJuIHNlbGYuaW5kZXhPZih4KSA9PT0gaTtcbiAgICB9KTtcblxuICBjb25zb2xlLmxvZyh7IGlkZW50aWZpZXJzIH0pO1xuXG4gIGNvbnN0IGhhc2g6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7fTtcbiAgaWRlbnRpZmllcnMuZm9yRWFjaCgoaWQsIGkpID0+IHtcbiAgICBpZiAoaWQpIHtcbiAgICAgIGhhc2hbaWRdID0gXCJpZFwiICsgaTtcbiAgICAgIGNvZGUgPSBjb2RlLnJlcGxhY2UobmV3IFJlZ0V4cChpZCwgXCJnXCIpLCBcImlkXCIgKyBpKTtcbiAgICB9XG4gIH0pO1xuICBjb25zb2xlLmxvZyhcImNvZGVcIiwgY29kZSwgeyBoYXNoIH0pO1xuICByZXR1cm4geyBjb2RlLCBoYXNoIH07XG59XG5cbmZ1bmN0aW9uIGNoZWNrY29kZShjb2RlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgY29uc3QgdG9rZW4gPSB0b2tlbml6ZShjb2RlKTtcblxuICBjb25zdCBpbGxpZ2FscyA9IHRva2VuXG4gICAgLm1hcChpdGVtID0+IHtcbiAgICAgIGlmIChcbiAgICAgICAgaXRlbS50eXBlID09PSBcIklkZW50aWZpZXJcIiAmJlxuICAgICAgICAhd29yZC5pbmNsdWRlcyhpdGVtLnZhbHVlKSAmJlxuICAgICAgICAhd2hpdGVsaXN0LmluY2x1ZGVzKGl0ZW0udmFsdWUpICYmXG4gICAgICAgICFuYW1lLmluY2x1ZGVzKGl0ZW0udmFsdWUpXG4gICAgICApXG4gICAgICAgIHJldHVybiBpdGVtLnZhbHVlO1xuICAgIH0pXG4gICAgLmZpbHRlcih2ID0+IHYpO1xuXG4gIGlmIChpbGxpZ2Fscy5sZW5ndGggPiAwKSB7XG4gICAgY29uc29sZS5sb2coXCJjb250YWluIGlsbGlnYWxzXCIpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IGlkZW50aWZpZXJzID0gdG9rZW5cbiAgICAubWFwKGl0ZW0gPT4ge1xuICAgICAgaWYgKGl0ZW0udHlwZSA9PT0gXCJJZGVudGlmaWVyXCIpIHJldHVybiBpdGVtLnZhbHVlO1xuICAgIH0pXG4gICAgLmZpbHRlcih2ID0+IHYpO1xuXG4gIC8v5b+F6KaB5Y2Y6Kqe44Gu5qSc5p+7XG4gIGlmICh3b3JkLm1hcCh2ID0+IGlkZW50aWZpZXJzLmluY2x1ZGVzKHYpKS5pbmNsdWRlcyhmYWxzZSkpIHtcbiAgICBjb25zb2xlLmxvZyhcIm5vdCBlbm91Z2hcIik7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbnRyYWN0Vk0ge1xuICBhZGRyZXNzOiBzdHJpbmc7XG4gIGNvZGU6IGFueTtcbiAgc3RhdGU6IGFueSA9IHt9O1xuICBzaWduOiBTaWduZWRNZXNzYWdlV2l0aE9uZVBhc3NwaHJhc2U7XG4gIGN5cGhlcjogQ3lwaGVyO1xuXG4gIHByaXZhdGUgY29udHJhY3RCbG9ja2NoYWluOiBDb250cmFjdEJsb2NrY2hhaW47XG4gIHByaXZhdGUgaWRIYXNoOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGNvbnRyYWN0OiBJY29udHJhY3QsXG4gICAgYmxvY2tjaGFpbjogQmxvY2tDaGFpbkFwcCxcbiAgICBzaWduOiBTaWduZWRNZXNzYWdlV2l0aE9uZVBhc3NwaHJhc2UsXG4gICAgYWRkcmVzczogc3RyaW5nXG4gICkge1xuICAgIHRoaXMuYWRkcmVzcyA9IGFkZHJlc3M7XG4gICAgY29uc3QgcmVzdWx0ID0gdHJhbnNsYXRlKGNvbnRyYWN0KTtcbiAgICB0aGlzLmNvZGUgPSByZXN1bHQuY29kZTtcbiAgICB0aGlzLmlkSGFzaCA9IHJlc3VsdC5oYXNoO1xuICAgIHRoaXMuc2lnbiA9IHNpZ247XG4gICAgdGhpcy5jeXBoZXIgPSBuZXcgQ3lwaGVyKGJsb2NrY2hhaW4uYWNjb3V0KTtcbiAgICB0aGlzLmNvbnRyYWN0QmxvY2tjaGFpbiA9IG5ldyBDb250cmFjdEJsb2NrY2hhaW4oYmxvY2tjaGFpbik7XG5cbiAgICBjb25zdCBjb2RlID0gdGhpcy5jb2RlICsgYHJlZHVjZXIoKWA7XG4gICAgaWYgKGNoZWNrY29kZShjb2RlKSkge1xuICAgICAgdGhpcy5ydW5FdmFsKGNvZGUsIHt9KTtcbiAgICB9XG4gIH1cblxuICBtZXNzYWdlQ2FsbCh0eXBlOiBzdHJpbmcsIGRhdGEgPSB7fSkge1xuICAgIGxldCBzdHIgPSBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICBPYmplY3Qua2V5cyh0aGlzLmlkSGFzaCkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgc3RyID0gc3RyLnJlcGxhY2UobmV3IFJlZ0V4cChrZXksIFwiZ1wiKSwgdGhpcy5pZEhhc2hba2V5XSk7XG4gICAgfSk7XG4gICAgZGF0YSA9IEpTT04ucGFyc2Uoc3RyKTtcblxuICAgIGNvbnN0IGZ1bmMgPSBgcmVkdWNlcigkc3RhdGUse3R5cGU6XCIke3R5cGV9XCIsZGF0YToke0pTT04uc3RyaW5naWZ5KFxuICAgICAgZGF0YVxuICAgICl9fSlgO1xuICAgIGNvbnN0IGNvZGUgPSB0aGlzLmNvZGUgKyBmdW5jO1xuICAgIGlmIChjaGVja2NvZGUoY29kZSkpIHtcbiAgICAgIHRoaXMucnVuRXZhbChjb2RlLCB0aGlzLnN0YXRlKTtcbiAgICB9XG4gIH1cblxuICBydW5FdmFsKGNvZGU6IHN0cmluZywgc3RhdGU6IGFueSkge1xuICAgIGxldCAkc3RhdGUgPSBzdGF0ZTtcbiAgICBjb25zdCBwdWJrZXkgPSB0aGlzLnNpZ24ucHVibGljS2V5O1xuICAgIGNvbnN0IGNvbnRyYWN0QWRkcmVzcyA9IHRoaXMuYWRkcmVzcztcbiAgICBjb25zdCBpc093bmVyID0gKCkgPT4gaWQuaXNPd25lcih0aGlzLnNpZ24pO1xuICAgIGNvbnN0IHsgc3NzU3BsaXQsIHNzc0NvbWJpbmUgfSA9IHNzcztcbiAgICBjb25zdCB7IGVuY3J5cHQsIGRlY3J5cHQsIHNpZ25NZXNzYWdlLCB2ZXJpZnlNZXNzYWdlIH0gPSB0aGlzLmN5cGhlcjtcbiAgICBjb25zdCB7IG1ha2VUcmFuc2FjdGlvbiwgdHJhbnNmZXIgfSA9IHRoaXMuY29udHJhY3RCbG9ja2NoYWluO1xuICAgIHRyeSB7XG4gICAgICBldmFsKGNvZGUpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgfVxuICAgIHRoaXMuc3RhdGUgPSAkc3RhdGU7XG4gIH1cblxuICBnZXRTdGF0ZShrZXk6IHN0cmluZykge1xuICAgIGNvbnN0IGlkID0gdGhpcy5pZEhhc2hba2V5XTtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZVtpZF07XG4gIH1cbn1cbiJdfQ==