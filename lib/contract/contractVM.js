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

var word = ["reducer", "initialState", "prevState", "action", "type", "data", "state"];
var whitelist = ["console", "log", "JSON", "parse", "parseInt", "isOwner", "pubkey"];
var name = [];

for (var i = 0; i < 1000; i++) {
  name.push("v" + i);
  name.push("a" + i);
  name.push("f" + i);
}

function checkcode(code) {
  var token = (0, _esprima.tokenize)(code);
  var illigals = token.map(function (item) {
    if (item.type === "Identifier" && !word.includes(item.value) && !whitelist.includes(item.value) && !name.includes(item.value)) return item.value;
  }).filter(function (v) {
    return v;
  });

  if (illigals.length > 0) {
    console.log({
      illigals: illigals
    });
    return false;
  }

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
  function ContractVM(address, code, _pubkey, sign) {
    _classCallCheck(this, ContractVM);

    _defineProperty(this, "address", void 0);

    _defineProperty(this, "code", void 0);

    _defineProperty(this, "state", {});

    this.address = address;
    this.code = code;

    if (checkcode(code)) {
      var isOwner = function isOwner() {
        var json = JSON.parse(sign);
        return (0, _sign.verifyMessageWithPublicKey)({
          message: json.message,
          publicKey: pubkey,
          signature: json.signature
        });
      };

      var state = {};
      var pubkey = _pubkey;
      console.log("isowner", isOwner());
      eval(code + "reducer()");
      this.state = state;
    }
  }

  _createClass(ContractVM, [{
    key: "messageCall",
    value: function messageCall(type) {
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (this.code) {
        var state = this.state;
        var func = "reducer(state,{type:\"".concat(type, "\",data:").concat(JSON.stringify(data), "})");
        var code = this.code + func;

        if (checkcode(code)) {
          eval(code);
          console.log("msgcall", {
            state: state
          });
          this.state = state;
        }
      }
    }
  }]);

  return ContractVM;
}();

exports.default = ContractVM;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250cmFjdC9jb250cmFjdFZNLnRzIl0sIm5hbWVzIjpbIndvcmQiLCJ3aGl0ZWxpc3QiLCJuYW1lIiwiaSIsInB1c2giLCJjaGVja2NvZGUiLCJjb2RlIiwidG9rZW4iLCJpbGxpZ2FscyIsIm1hcCIsIml0ZW0iLCJ0eXBlIiwiaW5jbHVkZXMiLCJ2YWx1ZSIsImZpbHRlciIsInYiLCJsZW5ndGgiLCJjb25zb2xlIiwibG9nIiwiaWRlbnRpZmllcnMiLCJDb250cmFjdFZNIiwiYWRkcmVzcyIsIl9wdWJrZXkiLCJzaWduIiwiaXNPd25lciIsImpzb24iLCJKU09OIiwicGFyc2UiLCJtZXNzYWdlIiwicHVibGljS2V5IiwicHVia2V5Iiwic2lnbmF0dXJlIiwic3RhdGUiLCJldmFsIiwiZGF0YSIsImZ1bmMiLCJzdHJpbmdpZnkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7Ozs7Ozs7OztBQUVBLElBQU1BLElBQUksR0FBRyxDQUNYLFNBRFcsRUFFWCxjQUZXLEVBR1gsV0FIVyxFQUlYLFFBSlcsRUFLWCxNQUxXLEVBTVgsTUFOVyxFQU9YLE9BUFcsQ0FBYjtBQVNBLElBQU1DLFNBQVMsR0FBRyxDQUNoQixTQURnQixFQUVoQixLQUZnQixFQUdoQixNQUhnQixFQUloQixPQUpnQixFQUtoQixVQUxnQixFQU1oQixTQU5nQixFQU9oQixRQVBnQixDQUFsQjtBQVNBLElBQUlDLElBQWMsR0FBRyxFQUFyQjs7QUFDQSxLQUFLLElBQUlDLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUcsSUFBcEIsRUFBMEJBLENBQUMsRUFBM0IsRUFBK0I7QUFDN0JELEVBQUFBLElBQUksQ0FBQ0UsSUFBTCxDQUFVLE1BQU1ELENBQWhCO0FBQ0FELEVBQUFBLElBQUksQ0FBQ0UsSUFBTCxDQUFVLE1BQU1ELENBQWhCO0FBQ0FELEVBQUFBLElBQUksQ0FBQ0UsSUFBTCxDQUFVLE1BQU1ELENBQWhCO0FBQ0Q7O0FBRUQsU0FBU0UsU0FB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WUFBSTlCLFNBQVMsQ0FBQ0MsSUFBRCxDQUFiLEVBQXFCO0FBQ25CMkIsVUFBQUEsSUFBSSxDQUFDM0IsSUFBRCxDQUFKO0FBQ0FXLFVBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLFNBQVosRUFBdUI7QUFBRWMsWUFBQUEsS0FBSyxFQUFMQTtBQUFGLFdBQXZCO0FBQ0EsZUFBS0EsS0FBTCxHQUFhQSxLQUFiO0FBQ0Q7QUFDRjtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdG9rZW5pemUgfSBmcm9tIFwiZXNwcmltYVwiO1xuaW1wb3J0IHsgdmVyaWZ5TWVzc2FnZVdpdGhQdWJsaWNLZXkgfSBmcm9tIFwiLi4vYmxvY2tjaGFpbi9jcnlwdG8vc2lnblwiO1xuXG5jb25zdCB3b3JkID0gW1xuICBcInJlZHVjZXJcIixcbiAgXCJpbml0aWFsU3RhdGVcIixcbiAgXCJwcmV2U3RhdGVcIixcbiAgXCJhY3Rpb25cIixcbiAgXCJ0eXBlXCIsXG4gIFwiZGF0YVwiLFxuICBcInN0YXRlXCJcbl07XG5jb25zdCB3aGl0ZWxpc3QgPSBbXG4gIFwiY29uc29sZVwiLFxuICBcImxvZ1wiLFxuICBcIkpTT05cIixcbiAgXCJwYXJzZVwiLFxuICBcInBhcnNlSW50XCIsXG4gIFwiaXNPd25lclwiLFxuICBcInB1YmtleVwiXG5dO1xubGV0IG5hbWU6IHN0cmluZ1tdID0gW107XG5mb3IgKGxldCBpID0gMDsgaSA8IDEwMDA7IGkrKykge1xuICBuYW1lLnB1c2goXCJ2XCIgKyBpKTtcbiAgbmFtZS5wdXNoKFwiYVwiICsgaSk7XG4gIG5hbWUucHVzaChcImZcIiArIGkpO1xufVxuXG5mdW5jdGlvbiBjaGVja2NvZGUoY29kZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGNvbnN0IHRva2VuID0gdG9rZW5pemUoY29kZSk7XG5cbiAgY29uc3QgaWxsaWdhbHMgPSB0b2tlblxuICAgIC5tYXAoaXRlbSA9PiB7XG4gICAgICBpZiAoXG4gICAgICAgIGl0ZW0udHlwZSA9PT0gXCJJZGVudGlmaWVyXCIgJiZcbiAgICAgICAgIXdvcmQuaW5jbHVkZXMoaXRlbS52YWx1ZSkgJiZcbiAgICAgICAgIXdoaXRlbGlzdC5pbmNsdWRlcyhpdGVtLnZhbHVlKSAmJlxuICAgICAgICAhbmFtZS5pbmNsdWRlcyhpdGVtLnZhbHVlKVxuICAgICAgKVxuICAgICAgICByZXR1cm4gaXRlbS52YWx1ZTtcbiAgICB9KVxuICAgIC5maWx0ZXIodiA9PiB2KTtcbiAgaWYgKGlsbGlnYWxzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zb2xlLmxvZyh7IGlsbGlnYWxzIH0pO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IGlkZW50aWZpZXJzID0gdG9rZW5cbiAgICAubWFwKGl0ZW0gPT4ge1xuICAgICAgaWYgKGl0ZW0udHlwZSA9PT0gXCJJZGVudGlmaWVyXCIpIHJldHVybiBpdGVtLnZhbHVlO1xuICAgIH0pXG4gICAgLmZpbHRlcih2ID0+IHYpO1xuXG4gIC8vQHRzLWlnbm9yZVxuICBpZiAoIWlkZW50aWZpZXJzLmluY2x1ZGVzKC4uLndvcmQpKSB7XG4gICAgY29uc29sZS5sb2coXCJub3QgZW5vdWdoXCIpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb250cmFjdFZNIHtcbiAgYWRkcmVzczogc3RyaW5nO1xuICBjb2RlPzogYW55O1xuICBzdGF0ZTogYW55ID0ge307XG4gIGNvbnN0cnVjdG9yKGFkZHJlc3M6IHN0cmluZywgY29kZTogc3RyaW5nLCBfcHVia2V5OiBzdHJpbmcsIHNpZ246IHN0cmluZykge1xuICAgIHRoaXMuYWRkcmVzcyA9IGFkZHJlc3M7XG4gICAgdGhpcy5jb2RlID0gY29kZTtcbiAgICBpZiAoY2hlY2tjb2RlKGNvZGUpKSB7XG4gICAgICBsZXQgc3RhdGUgPSB7fTtcbiAgICAgIGZ1bmN0aW9uIGlzT3duZXIoKSB7XG4gICAgICAgIGNvbnN0IGpzb246IHsgbWVzc2FnZTogc3RyaW5nOyBzaWduYXR1cmU6IHN0cmluZyB9ID0gSlNPTi5wYXJzZShzaWduKTtcbiAgICAgICAgcmV0dXJuIHZlcmlmeU1lc3NhZ2VXaXRoUHVibGljS2V5KHtcbiAgICAgICAgICBtZXNzYWdlOiBqc29uLm1lc3NhZ2UsXG4gICAgICAgICAgcHVibGljS2V5OiBwdWJrZXksXG4gICAgICAgICAgc2lnbmF0dXJlOiBqc29uLnNpZ25hdHVyZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHB1YmtleSA9IF9wdWJrZXk7XG4gICAgICBjb25zb2xlLmxvZyhcImlzb3duZXJcIiwgaXNPd25lcigpKTtcbiAgICAgIGV2YWwoY29kZSArIGByZWR1Y2VyKClgKTtcbiAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZTtcbiAgICB9XG4gIH1cblxuICBtZXNzYWdlQ2FsbCh0eXBlOiBzdHJpbmcsIGRhdGEgPSB7fSkge1xuICAgIGlmICh0aGlzLmNvZGUpIHtcbiAgICAgIGxldCBzdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICBjb25zdCBmdW5jID0gYHJlZHVjZXIoc3RhdGUse3R5cGU6XCIke3R5cGV9XCIsZGF0YToke0pTT04uc3RyaW5naWZ5KFxuICAgICAgICBkYXRhXG4gICAgICApfX0pYDtcbiAgICAgIGNvbnN0IGNvZGUgPSB0aGlzLmNvZGUgKyBmdW5jO1xuICAgICAgaWYgKGNoZWNrY29kZShjb2RlKSkge1xuICAgICAgICBldmFsKGNvZGUpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIm1zZ2NhbGxcIiwgeyBzdGF0ZSB9KTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19