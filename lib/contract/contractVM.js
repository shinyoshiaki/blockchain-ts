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

var word = ["reducer", "initialState", "prev", "action", "type", "data", "$state"];
var whitelist = ["console", "log", "JSON", "parse", "parseInt", "parseFloat", "length", "map", "isOwner", "pubkey", "sssSplit", "sssCombine", "makeTransaction", "encrypt"];
var name = [];

for (var i = 0; i < 1000; i++) {
  name.push("id" + i);
}

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

    _defineProperty(this, "idHash", void 0);

    _defineProperty(this, "sign", void 0);

    _defineProperty(this, "cypher", void 0);

    _defineProperty(this, "contractBlockchain", void 0);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250cmFjdC9jb250cmFjdFZNLnRzIl0sIm5hbWVzIjpbIndvcmQiLCJ3aGl0ZWxpc3QiLCJuYW1lIiwiaSIsInB1c2giLCJ0cmFuc2xhdGUiLCJjb250cmFjdCIsInRlbXBsYXRlIiwiY29kZSIsInJlcGxhY2UiLCJSZWdFeHAiLCJKU09OIiwic3RyaW5naWZ5Iiwic3RhdGUiLCJyZWR1Y2VyIiwiT2JqZWN0Iiwia2V5cyIsInJlZHVjZXJzIiwiZm9yRWFjaCIsImtleSIsImZ1bmMiLCJ0b2tlbiIsImlkZW50aWZpZXJzIiwibWFwIiwiaXRlbSIsInR5cGUiLCJpbmNsdWRlcyIsInZhbHVlIiwiZmlsdGVyIiwidiIsIngiLCJzZWxmIiwiaW5kZXhPZiIsImNvbnNvbGUiLCJsb2ciLCJoYXNoIiwiaWQiLCJjaGVja2NvZGUiLCJpbGxpZ2FscyIsImxlbmd0aCIsIkNvbnRyYWN0Vk0iLCJibG9ja2NoYWluIiwic2lnbiIsImFkZHJlc3MiLCJyZXN1bHQiLCJpZEhhc2giLCJjeXBoZXIiLCJDeXBoZXIiLCJhY2NvdXQiLCJjb250cmFjdEJsb2NrY2hhaW4iLCJDb250cmFjdEJsb2NrY2hhaW4iLCJydW5FdmFsIiwiZGF0YSIsInN0ciIsInBhcnNlIiwiJHN0YXRlIiwicHVia2V5IiwicHVibGljS2V5IiwiaXNPd25lciIsInNzc1NwbGl0Iiwic3NzIiwic3NzQ29tYmluZSIsImVuY3J5cHQiLCJkZWNyeXB0Iiwic2lnbk1lc3NhZ2UiLCJ2ZXJpZnlNZXNzYWdlIiwibWFrZVRyYW5zYWN0aW9uIiwidHJhbnNmZXIiLCJldmFsIiwiZXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFHQTs7Ozs7Ozs7Ozs7O0FBT0EsSUFBTUEsSUFBSSxHQUFHLENBQ1gsU0FEVyxFQUVYLGNBRlcsRUFHWCxNQUhXLEVBSVgsUUFKVyxFQUtYLE1BTFcsRUFNWCxNQU5XLEVBT1gsUUFQVyxDQUFiO0FBU0EsSUFBTUMs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QmlCLGVBTndCLHlCQU14QkEsZUFOd0I7QUFBQSxVQU1QQyxRQU5PLHlCQU1QQSxRQU5POztBQU9oQyxVQUFJO0FBQ0ZDLFFBQUFBLElBQUksQ0FBQzVELElBQUQsQ0FBSjtBQUNELE9BRkQsQ0FFRSxPQUFPNkQsS0FBUCxFQUFjO0FBQ2RwQyxRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWW1DLEtBQVo7QUFDRDs7QUFDRCxXQUFLeEQsS0FBTCxHQUFhMEMsTUFBYjtBQUNEOzs7NkJBRVFwQyxHLEVBQWE7QUFDcEIsVUFBTWlCLEVBQUUsR0FBRyxLQUFLUyxNQUFMLENBQVkxQixHQUFaLENBQVg7QUFDQSxhQUFPLEtBQUtOLEtBQUwsQ0FBV3VCLEVBQVgsQ0FBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdG9rZW5pemUgfSBmcm9tIFwiZXNwcmltYVwiO1xuaW1wb3J0IGlkIGZyb20gXCIuL3N0ZC9pZFwiO1xuaW1wb3J0IHNzcyBmcm9tIFwiLi9zdGQvc3NzXCI7XG5pbXBvcnQgQ3lwaGVyIGZyb20gXCIuL3N0ZC9jeXBoZXJcIjtcbmltcG9ydCB7IFNpZ25lZE1lc3NhZ2VXaXRoT25lUGFzc3BocmFzZSB9IGZyb20gXCIuLi9ibG9ja2NoYWluL2NyeXB0by9zaWduXCI7XG5pbXBvcnQgQmxvY2tDaGFpbkFwcCBmcm9tIFwiLi4vYmxvY2tjaGFpbi9ibG9ja2NoYWluQXBwXCI7XG5pbXBvcnQgQ29udHJhY3RCbG9ja2NoYWluIGZyb20gXCIuL3N0ZC9ibG9ja2NoYWluXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSWNvbnRyYWN0IHtcbiAgc3RhdGU6IHt9O1xuICByZWR1Y2VyczogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcbn1cblxuY29uc3Qgd29yZCA9IFtcbiAgXCJyZWR1Y2VyXCIsXG4gIFwiaW5pdGlhbFN0YXRlXCIsXG4gIFwicHJldlwiLFxuICBcImFjdGlvblwiLFxuICBcInR5cGVcIixcbiAgXCJkYXRhXCIsXG4gIFwiJHN0YXRlXCJcbl07XG5jb25zdCB3aGl0ZWxpc3QgPSBbXG4gIFwiY29uc29sZVwiLFxuICBcImxvZ1wiLFxuICBcIkpTT05cIixcbiAgXCJwYXJzZVwiLFxuICBcInBhcnNlSW50XCIsXG4gIFwicGFyc2VGbG9hdFwiLFxuICBcImxlbmd0aFwiLFxuICBcIm1hcFwiLFxuICBcImlzT3duZXJcIixcbiAgXCJwdWJrZXlcIixcbiAgXCJzc3NTcGxpdFwiLFxuICBcInNzc0NvbWJpbmVcIixcbiAgXCJtYWtlVHJhbnNhY3Rpb25cIixcbiAgXCJlbmNyeXB0XCJcbl07XG5jb25zdCBuYW1lOiBzdHJpbmdbXSA9IFtdO1xuZm9yIChsZXQgaSA9IDA7IGkgPCAxMDAwOyBpKyspIHtcbiAgbmFtZS5wdXNoKFwiaWRcIiArIGkpO1xufVxuXG5mdW5jdGlvbiB0cmFuc2xhdGUoY29udHJhY3Q6IEljb250cmFjdCkge1xuICBjb25zdCB0ZW1wbGF0ZSA9IGBcbmNvbnN0IGluaXRpYWxTdGF0ZSA9IEBzdGF0ZTtcblxuZnVuY3Rpb24gcmVkdWNlcihwcmV2ID0gaW5pdGlhbFN0YXRlLCBhY3Rpb24gPSB7IHR5cGU6IFwiXCIsIGRhdGE6IFwie31cIiB9KSB7XG4gIGNvbnN0IGRhdGEgPSBhY3Rpb24uZGF0YTtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIEByZWR1Y2VyXG4gICAgZGVmYXVsdDpcbiAgICAgICRzdGF0ZSA9IHByZXY7XG4gIH1cbiAgJHN0YXRlID0gcHJldjtcbn1cbmA7XG5cbiAgbGV0IGNvZGUgPSB0ZW1wbGF0ZTtcbiAgY29kZSA9IGNvZGUucmVwbGFjZShcbiAgICBuZXcgUmVnRXhwKFwiQHN0YXRlXCIsIFwiZ1wiKSxcbiAgICBKU09OLnN0cmluZ2lmeShjb250cmFjdC5zdGF0ZSlcbiAgKTtcbiAgbGV0IHJlZHVjZXIgPSBcIlwiO1xuXG4gIE9iamVjdC5rZXlzKGNvbnRyYWN0LnJlZHVjZXJzKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgY29uc3QgZnVuYyA9IGNvbnRyYWN0LnJlZHVjZXJzW2tleV07XG4gICAgcmVkdWNlciArPSBgXG4gICAgICBjYXNlIFwiJHtrZXl9XCI6XG4gICAgICB7XG4gICAgICAgICAgJHtmdW5jfVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgICBgO1xuICB9KTtcbiAgY29kZSA9IGNvZGUucmVwbGFjZShuZXcgUmVnRXhwKFwiQHJlZHVjZXJcIiwgXCJnXCIpLCByZWR1Y2VyKTtcblxuICBjb25zdCB0b2tlbiA9IHRva2VuaXplKGNvZGUpO1xuICBjb25zdCBpZGVudGlmaWVycyA9IHRva2VuXG4gICAgLm1hcChpdGVtID0+IHtcbiAgICAgIGlmIChcbiAgICAgICAgaXRlbS50eXBlID09PSBcIklkZW50aWZpZXJcIiAmJlxuICAgICAgICAhd29yZC5pbmNsdWRlcyhpdGVtLnZhbHVlKSAmJlxuICAgICAgICAhd2hpdGVsaXN0LmluY2x1ZGVzKGl0ZW0udmFsdWUpXG4gICAgICApXG4gICAgICAgIHJldHVybiBpdGVtLnZhbHVlO1xuICAgIH0pXG4gICAgLmZpbHRlcih2ID0+IHYpXG4gICAgLmZpbHRlcihmdW5jdGlvbih4LCBpLCBzZWxmKSB7XG4gICAgICByZXR1cm4gc2VsZi5pbmRleE9mKHgpID09PSBpO1xuICAgIH0pO1xuXG4gIGNvbnNvbGUubG9nKHsgaWRlbnRpZmllcnMgfSk7XG5cbiAgY29uc3QgaGFzaDogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSA9IHt9O1xuICBpZGVudGlmaWVycy5mb3JFYWNoKChpZCwgaSkgPT4ge1xuICAgIGlmIChpZCkge1xuICAgICAgaGFzaFtpZF0gPSBcImlkXCIgKyBpO1xuICAgICAgY29kZSA9IGNvZGUucmVwbGFjZShuZXcgUmVnRXhwKGlkLCBcImdcIiksIFwiaWRcIiArIGkpO1xuICAgIH1cbiAgfSk7XG4gIGNvbnNvbGUubG9nKFwiY29kZVwiLCBjb2RlLCB7IGhhc2ggfSk7XG4gIHJldHVybiB7IGNvZGUsIGhhc2ggfTtcbn1cblxuZnVuY3Rpb24gY2hlY2tjb2RlKGNvZGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCB0b2tlbiA9IHRva2VuaXplKGNvZGUpO1xuXG4gIGNvbnN0IGlsbGlnYWxzID0gdG9rZW5cbiAgICAubWFwKGl0ZW0gPT4ge1xuICAgICAgaWYgKFxuICAgICAgICBpdGVtLnR5cGUgPT09IFwiSWRlbnRpZmllclwiICYmXG4gICAgICAgICF3b3JkLmluY2x1ZGVzKGl0ZW0udmFsdWUpICYmXG4gICAgICAgICF3aGl0ZWxpc3QuaW5jbHVkZXMoaXRlbS52YWx1ZSkgJiZcbiAgICAgICAgIW5hbWUuaW5jbHVkZXMoaXRlbS52YWx1ZSlcbiAgICAgIClcbiAgICAgICAgcmV0dXJuIGl0ZW0udmFsdWU7XG4gICAgfSlcbiAgICAuZmlsdGVyKHYgPT4gdik7XG5cbiAgaWYgKGlsbGlnYWxzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zb2xlLmxvZyhcImNvbnRhaW4gaWxsaWdhbHNcIik7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29uc3QgaWRlbnRpZmllcnMgPSB0b2tlblxuICAgIC5tYXAoaXRlbSA9PiB7XG4gICAgICBpZiAoaXRlbS50eXBlID09PSBcIklkZW50aWZpZXJcIikgcmV0dXJuIGl0ZW0udmFsdWU7XG4gICAgfSlcbiAgICAuZmlsdGVyKHYgPT4gdik7XG5cbiAgLy/lv4XopoHljZjoqp7jga7mpJzmn7tcbiAgaWYgKHdvcmQubWFwKHYgPT4gaWRlbnRpZmllcnMuaW5jbHVkZXModikpLmluY2x1ZGVzKGZhbHNlKSkge1xuICAgIGNvbnNvbGUubG9nKFwibm90IGVub3VnaFwiKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29udHJhY3RWTSB7XG4gIGFkZHJlc3M6IHN0cmluZztcbiAgY29kZTogYW55O1xuICBzdGF0ZTogYW55ID0ge307XG4gIGlkSGFzaDogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcbiAgc2lnbjogU2lnbmVkTWVzc2FnZVdpdGhPbmVQYXNzcGhyYXNlO1xuICBjeXBoZXI6IEN5cGhlcjtcbiAgY29udHJhY3RCbG9ja2NoYWluOiBDb250cmFjdEJsb2NrY2hhaW47XG4gIGNvbnN0cnVjdG9yKFxuICAgIGNvbnRyYWN0OiBJY29udHJhY3QsXG4gICAgYmxvY2tjaGFpbjogQmxvY2tDaGFpbkFwcCxcbiAgICBzaWduOiBTaWduZWRNZXNzYWdlV2l0aE9uZVBhc3NwaHJhc2UsXG4gICAgYWRkcmVzczogc3RyaW5nXG4gICkge1xuICAgIHRoaXMuYWRkcmVzcyA9IGFkZHJlc3M7XG4gICAgY29uc3QgcmVzdWx0ID0gdHJhbnNsYXRlKGNvbnRyYWN0KTtcbiAgICB0aGlzLmNvZGUgPSByZXN1bHQuY29kZTtcbiAgICB0aGlzLmlkSGFzaCA9IHJlc3VsdC5oYXNoO1xuICAgIHRoaXMuc2lnbiA9IHNpZ247XG4gICAgdGhpcy5jeXBoZXIgPSBuZXcgQ3lwaGVyKGJsb2NrY2hhaW4uYWNjb3V0KTtcbiAgICB0aGlzLmNvbnRyYWN0QmxvY2tjaGFpbiA9IG5ldyBDb250cmFjdEJsb2NrY2hhaW4oYmxvY2tjaGFpbik7XG5cbiAgICBjb25zdCBjb2RlID0gdGhpcy5jb2RlICsgYHJlZHVjZXIoKWA7XG4gICAgaWYgKGNoZWNrY29kZShjb2RlKSkge1xuICAgICAgdGhpcy5ydW5FdmFsKGNvZGUsIHt9KTtcbiAgICB9XG4gIH1cblxuICBtZXNzYWdlQ2FsbCh0eXBlOiBzdHJpbmcsIGRhdGEgPSB7fSkge1xuICAgIGxldCBzdHIgPSBKU09OLnN0cmluZ2lmeShkYXRhKTtcbiAgICBPYmplY3Qua2V5cyh0aGlzLmlkSGFzaCkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgc3RyID0gc3RyLnJlcGxhY2UobmV3IFJlZ0V4cChrZXksIFwiZ1wiKSwgdGhpcy5pZEhhc2hba2V5XSk7XG4gICAgfSk7XG4gICAgZGF0YSA9IEpTT04ucGFyc2Uoc3RyKTtcblxuICAgIGNvbnN0IGZ1bmMgPSBgcmVkdWNlcigkc3RhdGUse3R5cGU6XCIke3R5cGV9XCIsZGF0YToke0pTT04uc3RyaW5naWZ5KFxuICAgICAgZGF0YVxuICAgICl9fSlgO1xuICAgIGNvbnN0IGNvZGUgPSB0aGlzLmNvZGUgKyBmdW5jO1xuICAgIGlmIChjaGVja2NvZGUoY29kZSkpIHtcbiAgICAgIHRoaXMucnVuRXZhbChjb2RlLCB0aGlzLnN0YXRlKTtcbiAgICB9XG4gIH1cblxuICBydW5FdmFsKGNvZGU6IHN0cmluZywgc3RhdGU6IGFueSkge1xuICAgIGxldCAkc3RhdGUgPSBzdGF0ZTtcbiAgICBjb25zdCBwdWJrZXkgPSB0aGlzLnNpZ24ucHVibGljS2V5O1xuICAgIGNvbnN0IGlzT3duZXIgPSAoKSA9PiBpZC5pc093bmVyKHRoaXMuc2lnbik7XG4gICAgY29uc3QgeyBzc3NTcGxpdCwgc3NzQ29tYmluZSB9ID0gc3NzO1xuICAgIGNvbnN0IHsgZW5jcnlwdCwgZGVjcnlwdCwgc2lnbk1lc3NhZ2UsIHZlcmlmeU1lc3NhZ2UgfSA9IHRoaXMuY3lwaGVyO1xuICAgIGNvbnN0IHsgbWFrZVRyYW5zYWN0aW9uLCB0cmFuc2ZlciB9ID0gdGhpcy5jb250cmFjdEJsb2NrY2hhaW47XG4gICAgdHJ5IHtcbiAgICAgIGV2YWwoY29kZSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICB9XG4gICAgdGhpcy5zdGF0ZSA9ICRzdGF0ZTtcbiAgfVxuXG4gIGdldFN0YXRlKGtleTogc3RyaW5nKSB7XG4gICAgY29uc3QgaWQgPSB0aGlzLmlkSGFzaFtrZXldO1xuICAgIHJldHVybiB0aGlzLnN0YXRlW2lkXTtcbiAgfVxufVxuIl19