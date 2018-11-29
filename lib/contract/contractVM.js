"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _esprima = require("esprima");

var _sign = require("../blockchain/crypto/sign");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var word = ["reducer", "initialState", "prev", "action", "type", "data", "$state"];
var whitelist = ["console", "log", "JSON", "parse", "parseInt", "parseFloat", "isOwner", "pubkey"];
var name = [];

for (var i = 0; i < 1000; i++) {
  name.push("Identifier" + i);
}

function translate(contract) {
  var template = "\nconst initialState = @state;\n\nfunction reducer(prev = initialState, action = { type: \"\", data: \"{}\" }) {\n  const data = action.data;\n  switch (action.type) {\n    @reducer\n    default:\n      $state = prev;\n  }  \n  $state = prev;  \n}\n";
  var code = template;
  code = code.replace(new RegExp("@state", "g"), JSON.stringify(contract.state));
  var reducer = "";
  Object.keys(contract.reducers).forEach(function (key) {
    var func = contract.reducers[key];
    reducer += "\n      case \"".concat(key, "\":\n      {\n          ").concat(func, "          \n      }\n      break;\n      ");
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
  identifiers.forEach(function (word, i) {
    if (word) {
      hash[word] = "Identifier" + i;
      code = code.replace(new RegExp(word, "g"), "Identifier" + i);
    }
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
  illigals.forEach(function (word, i) {
    if (word) {
      code = code.replace(new RegExp(word, "g"), "Identifier" + i);
    }
  });
  var identifiers = token.map(function (item) {
    if (item.type === "Identifier") return item.value;
  }).filter(function (v) {
    return v;
  }); //@ts-ignore

  if (!identifiers.includes.apply(identifiers, word)) {
    console.log("not enough");
    return false;
  }

  return true;
}

var ContractVM =
/*#__PURE__*/
function () {
  function ContractVM(address, contract, _pubkey, sign) {
    _classCallCheck(this, ContractVM);

    _defineProperty(this, "address", void 0);

    _defineProperty(this, "code", void 0);

    _defineProperty(this, "state", {});

    _defineProperty(this, "idHash", void 0);

    this.address = address;
    var result = translate(contract);
    this.code = result.code;
    this.idHash = result.hash;

    if (checkcode(this.code)) {
      var isOwner = function isOwner() {
        var json = JSON.parse(sign);
        return (0, _sign.verifyMessageWithPublicKey)({
          message: json.message,
          publicKey: pubkey,
          signature: json.signature
        });
      };

      var $state = {};
      var pubkey = _pubkey;
      eval(this.code + "reducer()");
      this.state = $state;
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
      var $state = this.state;
      var func = "reducer($state,{type:\"".concat(type, "\",data:").concat(JSON.stringify(data), "})");
      var code = this.code + func;

      if (checkcode(code)) {
        eval(code);
        console.log("msgcall", type, {
          data: data
        }, {
          $state: $state
        });
        this.state = $state;
      }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250cmFjdC9jb250cmFjdFZNLnRzIl0sIm5hbWVzIjpbIndvcmQiLCJ3aGl0ZWxpc3QiLCJuYW1lIiwiaSIsInB1c2giLCJ0cmFuc2xhdGUiLCJjb250cmFjdCIsInRlbXBsYXRlIiwiY29kZSIsInJlcGxhY2UiLCJSZWdFeHAiLCJKU09OIiwic3RyaW5naWZ5Iiwic3RhdGUiLCJyZWR1Y2VyIiwiT2JqZWN0Iiwia2V5cyIsInJlZHVjZXJzIiwiZm9yRWFjaCIsImtleSIsImZ1bmMiLCJ0b2tlbiIsImlkZW50aWZpZXJzIiwibWFwIiwiaXRlbSIsInR5cGUiLCJpbmNsdWRlcyIsInZhbHVlIiwiZmlsdGVyIiwidiIsIngiLCJzZWxmIiwiaW5kZXhPZiIsImNvbnNvbGUiLCJsb2ciLCJoYXNoIiwiY2hlY2tjb2RlIiwiaWxsaWdhbHMiLCJDb250cmFjdFZNIiwiYWRkcmVzcyIsIl9wdWJrZXkiLCJzaWduIiwicmVzdWx0IiwiaWRIYXNoIiwiaXNPd25lciIsImpzb24iLCJwYXJzZSIsIm1lc3NhZ2UiLCJwdWJsaWNLZXkiLCJwdWJrZXkiLCJzaWduYXR1cmUiLCIkc3RhdGUiLCJldmFsIiwiZGF0YSIsInN0ciIsImlkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7Ozs7Ozs7Ozs7QUFPQSxJQUFNQSxJQUFJLEdBQUcsQ0FDWCxTQURXLEVBRVgsY0FGVyxFQUdYLE1BSFcsRUFJWCxRQUpXLEVBS1gsTUFMVyxFQU1YLE1BTlcsRUFPWCxRQVBXLENBQWI7QUFTQSxJQUFNQyxTQUFTLEdBQUcsQ0FDaEIsU0FEZ0IsRUFFaEIsS0FGZ0IsRUFHaEIsTUFIZ0IsRUFJaEIsT0FKZ0IsRUFLaEIsVUFMZ0IsRUFNaEIsWUFOZ0IsRUFPaEIsU0FQZ0IsRUFRaEIsUUFSZ0IsQ0FBbEI7QUFVQSxJQUFNQyxJQUFjLEdBQUcsRUFBdkI7O0FBQ0EsS0FBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHLElBQXBCLEVBQTBCQSxDQUFDLEVBQTNCLEVBQStCO0FBQzdCRCxFQUFBQSxJQUFJLENBQUNFLElBQUwsQ0FBVSxlQUFlRCxDQUF6QjtBQUNEOztBQUVELFNBQVNFLFNBQVQsQ0FBbUJDLFFBQW5CLEVBQXdDO0FBQ3RDLE1BQU1DLFFBQVEsOFBBQWQ7QUFjQSxNQUFJQyxJQUFJLEdBQUdELFFBQVg7QUFDQUMsRUFBQUEsSUFBSSxHQUFHQSxJQUFJLENBQUNDLE9BQUwsQ0FDTCxJQUFJQyxNQUFKLENBQVcsUUFBWCxFQUFxQixHQUFyQixDQURLLEVBRUxDLElBQUksQ0FBQ0MsU0FBTCxDQUFlTixRQUFRLENBQUNPLEtBQXhCLENBRkssQ0FBUDtBQUlBLE1BQUlDLE9BQU8sR0FBRyxFQUFkO0FBRUFDLEVBQUFBLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZVixRQUFRLENBQUNXLFFBQXJCLEVBQStCQyxPQUEvQixDQUF1QyxVQUFBQyxHQUFHLEVBQUk7QUFDNUMsUUFBTUMsSUFBSSxHQUFHZCxRQUFRLENBQUNXLFFBQVQsQ0FBa0JFLEdBQWxCLENBQWI7QUFDQUwsSUFBQUEsT0FBTyw2QkFDR0ssR0FESCxxQ0FHQ0MsSUFIRCw4Q0FBUDtBQU9ELEdBVEQ7QUFVQVosRUFBQUEsSUFBSSxHQUFHQSxJQUFJLENBQUNDLE9BQUwsQ0FBYSxJQUFJQyxNQUFKLENBQVcsVUFBWCxFQUF1QixHQUF2QixDQUFiLEVBQTBDSSxPQUExQyxDQUFQO0FBRUEsTUFBTU8sS0FBSyxHQUFHLHVCQUFTYixJQUFULENBQWQ7QUFDQSxNQUFNYyxXQUFXLEdBQUdELEtBQUssQ0FDdEJFLEdBRGlCLENBQ2IsVUFBQUMsSUFBSSxFQUFJO0FBQ1gsUUFDRUEsSUFBSSxDQUFDQyxJQUFMLEtBQWMsWUFBZCxJQUNBLENBQUN6QixJQUFJLENBQUMwQixRQUFMLENBQWNGLElBQUksQ0FBQ0csS0FBbkIsQ0FERCxJQUVBLENBQUMxQixTQUFTLENBQUN5QixRQUFWLENBQW1CRixJQUFJLENBQUNHLEtBQXhCLENBSEgsRUFLRSxPQUFPSCxJQUFJLENBQUNHLEtBQVo7QUFDSCxHQVJpQixFQVNqQkMsTUFUaUIsQ0FTVixVQUFBQyxDQUFDO0FBQUEsV0FBSUEsQ0FBSjtBQUFBLEdBVFMsRUFVakJELE1BVmlCLENBVVYsVUFBU0UsQ0FBVCxFQUFZM0IsQ0FBWixFQUFlNEIsSUFBZixFQUFxQjtBQUMzQixXQUFPQSxJQUFJLENBQUNDLE9BQUwsQ0FBYUYsQ0FBYixNQUFvQjNCLENBQTNCO0FBQ0QsR0FaaUIsQ0FBcEI7QUFjQThCLEVBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZO0FBQUVaLElBQUFBLFdBQVcsRUFBWEE7QUFBRixHQUFaO0FBRUEsTUFBTWEsSUFBK0IsR0FBRyxFQUF4QztBQUNBYixFQUFBQSxXQUFXLENBQUNKLE9BQVosQ0FBb0IsVUFBQ2xCLElBQUQsRUFBT0csQ0FBUCxFQUFhO0FBQy9CLFFBQUlILElBQUosRUFBVTtBQUNSbUMsTUFBQUEsSUFBSSxDQUFDbkMsSUFBRCxDQUFKLEdBQWEsZUFBZUcsQ0FBNUI7QUFDQUssTUFBQUEsSUFBSSxHQUFHQSxJQUFJLENBQUNDLE9BQUwsQ0FBYSxJQUFJQyxNQUFKLENBQVdWLElBQVgsRUFBaUIsR0FBakIsQ0FBYixFQUFvQyxlQUFlRyxDQUFuRCxDQUFQO0FBQ0Q7QUFDRixHQUxEO0FBTUEsU0FBTztBQUFFSyxJQUFBQSxJQUFJLEVBQUpBLElBQUY7QUFBUTJCLElBQUFBLElBQUksRUFBSkE7QUFBUixHQUFQO0FBQ0Q7O0FBRUQsU0FBU0MsU0FBVCxDQUFtQjVCLElBQW5CLEVBQTBDO0FBQ3hDLE1BQU1hLEtBQUssR0FBRyx1QkFBU2IsSUFBVCxDQUFkO0FBRUEsTUFBTTZCLFFBQVEsR0FBR2hCLEtBQUssQ0FDbkJFLEdBRGMsQ0FDVixVQUFBQyxJQUFJLEVBQUk7QUFDWCxRQUNFQSxJQUFJLENBQUNDLElBQUwsS0FBYyxZQUFkLElBQ0EsQ0FBQ3pCLElBQUksQ0FBQzBCLFFBQUwsQ0FBY0YsSUFBSSxDQUFDRyxLQUFuQixDQURELElBRUEsQ0FBQzFCLFNBQVMsQ0FBQ3lCLFFBQVYsQ0FBbUJGLElBQUksQ0FBQ0csS0FBeEIsQ0FGRCxJQUdBLENBQUN6QixJQUFJLENBQUN3QixRQUFMLENBQWNGLElBQUksQ0FBQ0csS0FBbkIsQ0FKSCxFQU1FLE9BQU9ILElBQUksQ0FBQ0csS0FBWjtBQUNILEdBVGMsRUFVZEMsTUFWYyxDQVVQLFVBQUFDLENBQUM7QUFBQSxXQUFJQSxDQUFKO0FBQUEsR0FWTSxDQUFqQjtBQVlBUSxFQUFBQSxRQUFRLENBQUNuQixPQUFULENBQWlCLFVBQUNsQixJQUFELEVBQU9HLENBQVAsRUFBYTtBQUM1QixRQUFJSCxJQUFKLEVBQVU7QUFDUlEsTUFBQUEsSUFBSSxHQUFHQSxJQUFJLENBQUNDLE9BQUwsQ0FBYSxJQUFJQyxNQUFKLENBQVdWLElBQVgsRUFBaUIsR0FBakIsQ0FBYixFQUFvQyxlQUFlRyxDQUFuRCxDQUFQO0FBQ0Q7QUFDRixHQUpEO0FBTUEsTUFBTW1CLFdBQVcsR0FBR0QsS0FBSyxDQUN0QkUsR0FEaUIsQ0FDYixVQUFBQyxJQUFJLEVBQUk7QUFDWCxRQUFJQSxJQUFJLENBQUNDLElBQUwsS0FBYyxZQUFsQixFQUFnQyxPQUFPRCxJQUFJLENBQUNHLEtBQVo7QUFDakMsR0FIaUIsRUFJakJDLE1BSmlCLENBSVYsVUFBQUMsQ0FBQztBQUFBLFdBQUlBLENBQUo7QUFBQSxHQUpTLENBQXBCLENBckJ3QyxDQTJCeEM7O0FBQ0EsTUFBSSxDQUFDUCxXQUFXLENBQUNJLFFBQVosT0FBQUosV0FBVyxFQUFhdEIsSUFBYixDQUFoQixFQUFvQztBQUNsQ2lDLElBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLFlBQVo7QUFDQSxXQUFPLEtBQVA7QUFDRDs7QUFFRCxTQUFPLElBQVA7QUFDRDs7SUFFb0JJLFU7OztBQUtuQixzQkFDRUMsT0FERixFQUVFakMsUUFGRixFQUdFa0MsT0FIRixFQUlFQyxJQUpGLEVBS0U7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQSxtQ0FQVyxFQU9YOztBQUFBOztBQUNBLFNBQUtGLE9BQUwsR0FBZUEsT0FBZjtBQUNBLFFBQU1HLE1BQU0sR0FBR3JDLFNBQVMsQ0FBQ0MsUUFBRCxDQUF4QjtBQUNBLFNBQUtFLElBQUwsR0FBWWtDLE1BQU0sQ0FBQ2xDLElBQW5CO0FBQ0EsU0FBS21DLE1BQUwsR0FBY0QsTUFBTSxDQUFDUCxJQUFyQjs7QUFDQSxRQUFJQyxTQUFTLENBQUMsS0FBSzVCLElBQU4sQ0FBYixFQUEwQjtBQUFBLFVBRWZvQyxPQUZlLEdBRXhCLFNBQVNBLE9BQVQsR0FBbUI7QUFDakIsWUFBTUMsSUFBNEMsR0FBR2xDLElBQUksQ0FBQ21DLEtBQUwsQ0FBV0wsSUFBWCxDQUFyRDtBQUNBLGVBQU8sc0NBQTJCO0FBQ2hDTSxVQUFBQSxPQUFPLEVBQUVGLElBQUksQ0FBQ0UsT0FEa0I7QUFFaENDLFVBQUFBLFNBQVMsRUFBRUMsTUFGcUI7QUFHaENDLFVBQUFBLFNBQVMsRUFBRUwsSUFBSSxDQUFDSztBQUhnQixTQUEzQixDQUFQO0FBS0QsT0FUdUI7O0FBQ3hCLFVBQUlDLE1BQU0sR0FBRyxFQUFiO0FBU0EsVUFBTUYsTUFBTSxHQUFHVCxPQUFmO0FBQ0FZLE1BQUFBLElBQUksQ0FBQyxLQUFLNUMsSUFBTCxjQUFELENBQUo7QUFDQSxXQUFLSyxLQUFMLEdBQWFzQyxNQUFiO0FBQ0Q7QUFDRjs7OztnQ0FFVzFCLEksRUFBeUI7QUFBQTs7QUFBQSxVQUFYNEIsSUFBVyx1RUFBSixFQUFJO0FBQ25DLFVBQUlDLEdBQUcsR0FBRzNDLElBQUksQ0FBQ0MsU0FBTCxDQUFleUMsSUFBZixDQUFWO0FBQ0F0QyxNQUFBQSxNQUFNLENBQUNDLElBQVAsQ0FBWSxLQUFLMkIsTUFBakIsRUFBeUJ6QixPQUF6QixDQUFpQyxVQUFBQyxHQUFHLEVBQUk7QUFDdENtQyxRQUFBQSxHQUFHLEdBQUdBLEdBQUcsQ0FBQzdDLE9BQUosQ0FBWSxJQUFJQyxNQUFKLENBQVdTLEdBQVgsRUFBZ0IsR0FBaEIsQ0FBWixFQUFrQyxLQUFJLENBQUN3QixNQUFMLENBQVl4QixHQUFaLENBQWxDLENBQU47QUFDRCxPQUZEO0FBR0FrQyxNQUFBQSxJQUFJLEdBQUcxQyxJQUFJLENBQUNtQyxLQUFMLENBQVdRLEdBQVgsQ0FBUDtBQUVBLFVBQUlILE1BQU0sR0FBRyxLQUFLdEMsS0FBbEI7QUFDQSxVQUFNTyxJQUFJLG9DQUE0QkssSUFBNUIscUJBQTBDZCxJQUFJLENBQUNDLFNBQUwsQ0FDbER5QyxJQURrRCxDQUExQyxPQUFWO0FBR0EsVUFBTTdDLElBQUksR0FBRyxLQUFLQSxJQUFMLEdBQVlZLElBQXpCOztBQUNBLFVBQUlnQixTQUFTLENBQUM1QixJQUFELENBQWIsRUFBcUI7QUFDbkI0QyxRQUFBQSxJQUFJLENBQUM1QyxJQUFELENBQUo7QUFDQXlCLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLFNBQVosRUFBdUJULElBQXZCLEVBQTZCO0FBQUU0QixVQUFBQSxJQUFJLEVBQUpBO0FBQUYsU0FBN0IsRUFBdUM7QUFBRUYsVUFBQUEsTUFBTSxFQUFOQTtBQUFGLFNBQXZDO0FBQ0EsYUFBS3RDLEtBQUwsR0FBYXNDLE1BQWI7QUFDRDtBQUNGOzs7NkJBRVFoQyxHLEVBQWE7QUFDcEIsVUFBTW9DLEVBQUUsR0FBRyxLQUFLWixNQUFMLENBQVl4QixHQUFaLENBQVg7QUFDQSxhQUFPLEtBQUtOLEtBQUwsQ0FBVzBDLEVBQVgsQ0FBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdG9rZW5pemUgfSBmcm9tIFwiZXNwcmltYVwiO1xuaW1wb3J0IHsgdmVyaWZ5TWVzc2FnZVdpdGhQdWJsaWNLZXkgfSBmcm9tIFwiLi4vYmxvY2tjaGFpbi9jcnlwdG8vc2lnblwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIEljb250cmFjdCB7XG4gIHN0YXRlOiB7fTtcbiAgcmVkdWNlcnM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH07XG59XG5cbmNvbnN0IHdvcmQgPSBbXG4gIFwicmVkdWNlclwiLFxuICBcImluaXRpYWxTdGF0ZVwiLFxuICBcInByZXZcIixcbiAgXCJhY3Rpb25cIixcbiAgXCJ0eXBlXCIsXG4gIFwiZGF0YVwiLFxuICBcIiRzdGF0ZVwiXG5dO1xuY29uc3Qgd2hpdGVsaXN0ID0gW1xuICBcImNvbnNvbGVcIixcbiAgXCJsb2dcIixcbiAgXCJKU09OXCIsXG4gIFwicGFyc2VcIixcbiAgXCJwYXJzZUludFwiLFxuICBcInBhcnNlRmxvYXRcIixcbiAgXCJpc093bmVyXCIsXG4gIFwicHVia2V5XCJcbl07XG5jb25zdCBuYW1lOiBzdHJpbmdbXSA9IFtdO1xuZm9yIChsZXQgaSA9IDA7IGkgPCAxMDAwOyBpKyspIHtcbiAgbmFtZS5wdXNoKFwiSWRlbnRpZmllclwiICsgaSk7XG59XG5cbmZ1bmN0aW9uIHRyYW5zbGF0ZShjb250cmFjdDogSWNvbnRyYWN0KSB7XG4gIGNvbnN0IHRlbXBsYXRlID0gYFxuY29uc3QgaW5pdGlhbFN0YXRlID0gQHN0YXRlO1xuXG5mdW5jdGlvbiByZWR1Y2VyKHByZXYgPSBpbml0aWFsU3RhdGUsIGFjdGlvbiA9IHsgdHlwZTogXCJcIiwgZGF0YTogXCJ7fVwiIH0pIHtcbiAgY29uc3QgZGF0YSA9IGFjdGlvbi5kYXRhO1xuICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgQHJlZHVjZXJcbiAgICBkZWZhdWx0OlxuICAgICAgJHN0YXRlID0gcHJldjtcbiAgfSAgXG4gICRzdGF0ZSA9IHByZXY7ICBcbn1cbmA7XG5cbiAgbGV0IGNvZGUgPSB0ZW1wbGF0ZTtcbiAgY29kZSA9IGNvZGUucmVwbGFjZShcbiAgICBuZXcgUmVnRXhwKFwiQHN0YXRlXCIsIFwiZ1wiKSxcbiAgICBKU09OLnN0cmluZ2lmeShjb250cmFjdC5zdGF0ZSlcbiAgKTtcbiAgbGV0IHJlZHVjZXIgPSBcIlwiO1xuXG4gIE9iamVjdC5rZXlzKGNvbnRyYWN0LnJlZHVjZXJzKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgY29uc3QgZnVuYyA9IGNvbnRyYWN0LnJlZHVjZXJzW2tleV07XG4gICAgcmVkdWNlciArPSBgXG4gICAgICBjYXNlIFwiJHtrZXl9XCI6XG4gICAgICB7XG4gICAgICAgICAgJHtmdW5jfSAgICAgICAgICBcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgICAgYDtcbiAgfSk7XG4gIGNvZGUgPSBjb2RlLnJlcGxhY2UobmV3IFJlZ0V4cChcIkByZWR1Y2VyXCIsIFwiZ1wiKSwgcmVkdWNlcik7XG5cbiAgY29uc3QgdG9rZW4gPSB0b2tlbml6ZShjb2RlKTtcbiAgY29uc3QgaWRlbnRpZmllcnMgPSB0b2tlblxuICAgIC5tYXAoaXRlbSA9PiB7XG4gICAgICBpZiAoXG4gICAgICAgIGl0ZW0udHlwZSA9PT0gXCJJZGVudGlmaWVyXCIgJiZcbiAgICAgICAgIXdvcmQuaW5jbHVkZXMoaXRlbS52YWx1ZSkgJiZcbiAgICAgICAgIXdoaXRlbGlzdC5pbmNsdWRlcyhpdGVtLnZhbHVlKVxuICAgICAgKVxuICAgICAgICByZXR1cm4gaXRlbS52YWx1ZTtcbiAgICB9KVxuICAgIC5maWx0ZXIodiA9PiB2KVxuICAgIC5maWx0ZXIoZnVuY3Rpb24oeCwgaSwgc2VsZikge1xuICAgICAgcmV0dXJuIHNlbGYuaW5kZXhPZih4KSA9PT0gaTtcbiAgICB9KTtcblxuICBjb25zb2xlLmxvZyh7IGlkZW50aWZpZXJzIH0pO1xuXG4gIGNvbnN0IGhhc2g6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7fTtcbiAgaWRlbnRpZmllcnMuZm9yRWFjaCgod29yZCwgaSkgPT4ge1xuICAgIGlmICh3b3JkKSB7XG4gICAgICBoYXNoW3dvcmRdID0gXCJJZGVudGlmaWVyXCIgKyBpO1xuICAgICAgY29kZSA9IGNvZGUucmVwbGFjZShuZXcgUmVnRXhwKHdvcmQsIFwiZ1wiKSwgXCJJZGVudGlmaWVyXCIgKyBpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4geyBjb2RlLCBoYXNoIH07XG59XG5cbmZ1bmN0aW9uIGNoZWNrY29kZShjb2RlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgY29uc3QgdG9rZW4gPSB0b2tlbml6ZShjb2RlKTtcblxuICBjb25zdCBpbGxpZ2FscyA9IHRva2VuXG4gICAgLm1hcChpdGVtID0+IHtcbiAgICAgIGlmIChcbiAgICAgICAgaXRlbS50eXBlID09PSBcIklkZW50aWZpZXJcIiAmJlxuICAgICAgICAhd29yZC5pbmNsdWRlcyhpdGVtLnZhbHVlKSAmJlxuICAgICAgICAhd2hpdGVsaXN0LmluY2x1ZGVzKGl0ZW0udmFsdWUpICYmXG4gICAgICAgICFuYW1lLmluY2x1ZGVzKGl0ZW0udmFsdWUpXG4gICAgICApXG4gICAgICAgIHJldHVybiBpdGVtLnZhbHVlO1xuICAgIH0pXG4gICAgLmZpbHRlcih2ID0+IHYpO1xuXG4gIGlsbGlnYWxzLmZvckVhY2goKHdvcmQsIGkpID0+IHtcbiAgICBpZiAod29yZCkge1xuICAgICAgY29kZSA9IGNvZGUucmVwbGFjZShuZXcgUmVnRXhwKHdvcmQsIFwiZ1wiKSwgXCJJZGVudGlmaWVyXCIgKyBpKTtcbiAgICB9XG4gIH0pO1xuXG4gIGNvbnN0IGlkZW50aWZpZXJzID0gdG9rZW5cbiAgICAubWFwKGl0ZW0gPT4ge1xuICAgICAgaWYgKGl0ZW0udHlwZSA9PT0gXCJJZGVudGlmaWVyXCIpIHJldHVybiBpdGVtLnZhbHVlO1xuICAgIH0pXG4gICAgLmZpbHRlcih2ID0+IHYpO1xuXG4gIC8vQHRzLWlnbm9yZVxuICBpZiAoIWlkZW50aWZpZXJzLmluY2x1ZGVzKC4uLndvcmQpKSB7XG4gICAgY29uc29sZS5sb2coXCJub3QgZW5vdWdoXCIpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb250cmFjdFZNIHtcbiAgYWRkcmVzczogc3RyaW5nO1xuICBjb2RlPzogYW55O1xuICBzdGF0ZTogYW55ID0ge307XG4gIGlkSGFzaDogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcbiAgY29uc3RydWN0b3IoXG4gICAgYWRkcmVzczogc3RyaW5nLFxuICAgIGNvbnRyYWN0OiBJY29udHJhY3QsXG4gICAgX3B1YmtleTogc3RyaW5nLFxuICAgIHNpZ246IHN0cmluZ1xuICApIHtcbiAgICB0aGlzLmFkZHJlc3MgPSBhZGRyZXNzO1xuICAgIGNvbnN0IHJlc3VsdCA9IHRyYW5zbGF0ZShjb250cmFjdCk7XG4gICAgdGhpcy5jb2RlID0gcmVzdWx0LmNvZGU7XG4gICAgdGhpcy5pZEhhc2ggPSByZXN1bHQuaGFzaDtcbiAgICBpZiAoY2hlY2tjb2RlKHRoaXMuY29kZSkpIHtcbiAgICAgIGxldCAkc3RhdGUgPSB7fTtcbiAgICAgIGZ1bmN0aW9uIGlzT3duZXIoKSB7XG4gICAgICAgIGNvbnN0IGpzb246IHsgbWVzc2FnZTogc3RyaW5nOyBzaWduYXR1cmU6IHN0cmluZyB9ID0gSlNPTi5wYXJzZShzaWduKTtcbiAgICAgICAgcmV0dXJuIHZlcmlmeU1lc3NhZ2VXaXRoUHVibGljS2V5KHtcbiAgICAgICAgICBtZXNzYWdlOiBqc29uLm1lc3NhZ2UsXG4gICAgICAgICAgcHVibGljS2V5OiBwdWJrZXksXG4gICAgICAgICAgc2lnbmF0dXJlOiBqc29uLnNpZ25hdHVyZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHB1YmtleSA9IF9wdWJrZXk7XG4gICAgICBldmFsKHRoaXMuY29kZSArIGByZWR1Y2VyKClgKTtcbiAgICAgIHRoaXMuc3RhdGUgPSAkc3RhdGU7XG4gICAgfVxuICB9XG5cbiAgbWVzc2FnZUNhbGwodHlwZTogc3RyaW5nLCBkYXRhID0ge30pIHtcbiAgICBsZXQgc3RyID0gSlNPTi5zdHJpbmdpZnkoZGF0YSk7XG4gICAgT2JqZWN0LmtleXModGhpcy5pZEhhc2gpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKG5ldyBSZWdFeHAoa2V5LCBcImdcIiksIHRoaXMuaWRIYXNoW2tleV0pO1xuICAgIH0pO1xuICAgIGRhdGEgPSBKU09OLnBhcnNlKHN0cik7XG5cbiAgICBsZXQgJHN0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCBmdW5jID0gYHJlZHVjZXIoJHN0YXRlLHt0eXBlOlwiJHt0eXBlfVwiLGRhdGE6JHtKU09OLnN0cmluZ2lmeShcbiAgICAgIGRhdGFcbiAgICApfX0pYDtcbiAgICBjb25zdCBjb2RlID0gdGhpcy5jb2RlICsgZnVuYztcbiAgICBpZiAoY2hlY2tjb2RlKGNvZGUpKSB7XG4gICAgICBldmFsKGNvZGUpO1xuICAgICAgY29uc29sZS5sb2coXCJtc2djYWxsXCIsIHR5cGUsIHsgZGF0YSB9LCB7ICRzdGF0ZSB9KTtcbiAgICAgIHRoaXMuc3RhdGUgPSAkc3RhdGU7XG4gICAgfVxuICB9XG5cbiAgZ2V0U3RhdGUoa2V5OiBzdHJpbmcpIHtcbiAgICBjb25zdCBpZCA9IHRoaXMuaWRIYXNoW2tleV07XG4gICAgcmV0dXJuIHRoaXMuc3RhdGVbaWRdO1xuICB9XG59XG4iXX0=