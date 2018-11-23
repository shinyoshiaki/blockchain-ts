"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _esprima = require("esprima");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var word = ["reducer", "initialState", "prevState", "action", "type", "data", "state"];
var whitelist = ["console", "log", "JSON", "parse", "parseInt"];
var name = [];

for (var i = 0; i < 1000; i++) {
  name.push("v" + i);
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
  function ContractVM(address, code) {
    _classCallCheck(this, ContractVM);

    _defineProperty(this, "address", void 0);

    _defineProperty(this, "code", void 0);

    _defineProperty(this, "state", {});

    this.address = address;
    this.code = code;

    if (checkcode(code)) {
      var state = {};
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250cmFjdC9jb250cmFjdFZNLnRzIl0sIm5hbWVzIjpbIndvcmQiLCJ3aGl0ZWxpc3QiLCJuYW1lIiwiaSIsInB1c2giLCJjaGVja2NvZGUiLCJjb2RlIiwidG9rZW4iLCJpbGxpZ2FscyIsIm1hcCIsIml0ZW0iLCJ0eXBlIiwiaW5jbHVkZXMiLCJ2YWx1ZSIsImZpbHRlciIsInYiLCJsZW5ndGgiLCJjb25zb2xlIiwibG9nIiwiaWRlbnRpZmllcnMiLCJDb250cmFjdFZNIiwiYWRkcmVzcyIsInN0YXRlIiwiZXZhbCIsImRhdGEiLCJmdW5jIiwiSlNPTiIsInN0cmluZ2lmeSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNBOzs7Ozs7Ozs7O0FBSUEsSUFBTUEsSUFBSSxHQUFHLENBQ1gsU0FEVyxFQUVYLGNBRlcsRUFHWCxXQUhXLEVBSVgsUUFKVyxFQUtYLE1BTFcsRUFNWCxNQU5XLEVBT1gsT0FQVyxDQUFiO0FBU0EsSUFBTUMsU0FBUyxHQUFHLENBQUMsU0FBRCxFQUFZLEtBQVosRUFBbUIsTUFBbkIsRUFBMkIsT0FBM0IsRUFBb0MsVUFBcEMsQ0FBbEI7QUFDQSxJQUFJQyxJQUFjLEdBQUcsRUFBckI7O0FBQ0EsS0FBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHLElBQXBCLEVBQTBCQSxDQUFDLEVBQTNCLEVBQStCO0FBQzdCRCxFQUFBQSxJQUFJLENBQUNFLElBQUwsQ0FBVSxNQUFNRCxDQUFoQjtBQUNBRCxFQUFBQSxJQUFJLENBQUNFLElBQUwsQ0FBVSxNQUFNRCxDQUFoQjtBQUNEOztBQUVELFNBQVNFLFNBQVQsQ0FBbUJDLElBQW5CLEVBQTBDO0FBQ3hDLE1BQU1DLEtBQUssR0FBRyx1QkFBU0QsSUFBVCxDQUFkO0FBRUEsTUFBTUUsUUFBUSxHQUFHRCxLQUFLLENBQ25CRSxHQURjLENBQ1YsVUFBQUMsSUFBSSxFQUFJO0FBQ1gsUUFDRUEsSUFBSSxDQUFDQyxJQUFMLEtBQWMsWUFBZCxJQUNBLENBQUNYLElBQUksQ0FBQ1ksUUFBTCxDQUFjRixJQUFJLENBQUNHLEtBQW5CLENBREQsSUFFQSxDQUFDWixTQUFTLENBQUNXLFFBQVYsQ0FBbUJGLElBQUksQ0FBQ0csS0FBeEIsQ0FGRCxJQUdBLENBQUNYLElBQUksQ0FBQ1UsUUFBTCxDQUFjRixJQUFJLENBQUNHLEtBQW5CLENBSkgsRUFNRSxPQUFPSCxJQUFJLENBQUNHLEtBQVo7QUFDSCxHQVRjLEVBVWRDLE1BVmMsQ0FVUCxVQUFBQyxDQUFDO0FBQUEsV0FBSUEsQ0FBSjtBQUFBLEdBVk0sQ0FBakI7O0FBV0EsTUFBSVAsUUFBUSxDQUFDUSxNQUFULEdBQWtCLENBQXRCLEVBQXlCO0FBQ3ZCQyxJQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWTtBQUFFVixNQUFBQSxRQUFRLEVBQVJBO0FBQUYsS0FBWjtBQUNBLFdBQU8sS0FBUDtBQUNEOztBQUVELE1BQU1XLFdBQVcsR0FBR1osS0FBSyxDQUN0QkUsR0FEaUIsQ0FDYixVQUFBQyxJQUFJLEVBQUk7QUFDWCxRQUFJQSxJQUFJLENBQUNDLElBQUwsS0FBYyxZQUFsQixFQUFnQyxPQUFPRCxJQUFJLENBQUNHLEtBQVo7QUFDakMsR0FIaUIsRUFJakJDLE1BSmlCLENBSVYsVUFBQUMsQ0FBQztBQUFBLFdBQUlBLENBQUo7QUFBQSxHQUpTLENBQXBCLENBbkJ3QyxDQXlCeEM7O0FBQ0EsTUFBSSxDQUFDSSxXQUFXLENBQUNQLFFBQVosT0FBQU8sV0FBVyxFQUFhbkIsSUFBYixDQUFoQixFQUFvQztBQUNsQ2lCLElBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLFlBQVo7QUFDQSxXQUFPLEtBQVA7QUFDRDs7QUFFRCxTQUFPLElBQVA7QUFDRDs7SUFFb0JFLFU7OztBQUluQixzQkFBWUMsT0FBWixFQUE2QmYsSUFBN0IsRUFBMkM7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQSxtQ0FEOUIsRUFDOEI7O0FBQ3pDLFNBQUtlLE9BQUwsR0FBZUEsT0FBZjtBQUNBLFNBQUtmLElBQUwsR0FBWUEsSUFBWjs7QUFDQSxRQUFJRCxTQUFTLENBQUNDLElBQUQsQ0FBYixFQUFxQjtBQUNuQixVQUFJZ0IsS0FBSyxHQUFHLEVBQVo7QUFDQUMsTUFBQUEsSUFBSSxDQUFDakIsSUFBSSxjQUFMLENBQUo7QUFDQSxXQUFLZ0IsS0FBTCxHQUFhQSxLQUFiO0FBQ0Q7QUFDRjs7OztnQ0FFV1gsSSxFQUF5QjtBQUFBLFVBQVhhLElBQVcsdUVBQUosRUFBSTs7QUFDbkMsVUFBSSxLQUFLbEIsSUFBVCxFQUFlO0FBQ2IsWUFBSWdCLEtBQUssR0FBRyxLQUFLQSxLQUFqQjtBQUNBLFlBQU1HLElBQUksbUNBQTJCZCxJQUEzQixxQkFBeUNlLElBQUksQ0FBQ0MsU0FBTCxDQUNqREgsSUFEaUQsQ0FBekMsT0FBVjtBQUdBLFlBQU1sQixJQUFJLEdBQUcsS0FBS0EsSUFBTCxHQUFZbUIsSUFBekI7O0FBQ0EsWUFBSXBCLFNBQVMsQ0FBQ0MsSUFBRCxDQUFiLEVBQXFCO0FBQ25CaUIsVUFBQUEsSUFBSSxDQUFDakIsSUFBRCxDQUFKO0FBQ0FXLFVBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLFNBQVosRUFBdUI7QUFBRUksWUFBQUEsS0FBSyxFQUFMQTtBQUFGLFdBQXZCO0FBQ0EsZUFBS0EsS0FBTCxHQUFhQSxLQUFiO0FBQ0Q7QUFDRjtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHNoYTI1NiBmcm9tIFwic2hhMjU2XCI7XG5pbXBvcnQgeyB0b2tlbml6ZSB9IGZyb20gXCJlc3ByaW1hXCI7XG5pbXBvcnQgeyBJVHJhbnNhY3Rpb24gfSBmcm9tIFwiLi4vYmxvY2tjaGFpbi9ibG9ja2NoYWluXCI7XG5pbXBvcnQgeyBFVHJhbnNhY3Rpb25UeXBlIH0gZnJvbSBcIi4uL2Jsb2NrY2hhaW4vaW50ZXJmYWNlXCI7XG5cbmNvbnN0IHdvcmQgPSBbXG4gIFwicmVkdWNlclwiLFxuICBcImluaXRpYWxTdGF0ZVwiLFxuICBcInByZXZTdGF0ZVwiLFxuICBcImFjdGlvblwiLFxuICBcInR5cGVcIixcbiAgXCJkYXRhXCIsXG4gIFwic3RhdGVcIlxuXTtcbmNvbnN0IHdoaXRlbGlzdCA9IFtcImNvbnNvbGVcIiwgXCJsb2dcIiwgXCJKU09OXCIsIFwicGFyc2VcIiwgXCJwYXJzZUludFwiXTtcbmxldCBuYW1lOiBzdHJpbmdbXSA9IFtdO1xuZm9yIChsZXQgaSA9IDA7IGkgPCAxMDAwOyBpKyspIHtcbiAgbmFtZS5wdXNoKFwidlwiICsgaSk7XG4gIG5hbWUucHVzaChcImZcIiArIGkpO1xufVxuXG5mdW5jdGlvbiBjaGVja2NvZGUoY29kZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGNvbnN0IHRva2VuID0gdG9rZW5pemUoY29kZSk7XG5cbiAgY29uc3QgaWxsaWdhbHMgPSB0b2tlblxuICAgIC5tYXAoaXRlbSA9PiB7XG4gICAgICBpZiAoXG4gICAgICAgIGl0ZW0udHlwZSA9PT0gXCJJZGVudGlmaWVyXCIgJiZcbiAgICAgICAgIXdvcmQuaW5jbHVkZXMoaXRlbS52YWx1ZSkgJiZcbiAgICAgICAgIXdoaXRlbGlzdC5pbmNsdWRlcyhpdGVtLnZhbHVlKSAmJlxuICAgICAgICAhbmFtZS5pbmNsdWRlcyhpdGVtLnZhbHVlKVxuICAgICAgKVxuICAgICAgICByZXR1cm4gaXRlbS52YWx1ZTtcbiAgICB9KVxuICAgIC5maWx0ZXIodiA9PiB2KTtcbiAgaWYgKGlsbGlnYWxzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zb2xlLmxvZyh7IGlsbGlnYWxzIH0pO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IGlkZW50aWZpZXJzID0gdG9rZW5cbiAgICAubWFwKGl0ZW0gPT4ge1xuICAgICAgaWYgKGl0ZW0udHlwZSA9PT0gXCJJZGVudGlmaWVyXCIpIHJldHVybiBpdGVtLnZhbHVlO1xuICAgIH0pXG4gICAgLmZpbHRlcih2ID0+IHYpO1xuXG4gIC8vQHRzLWlnbm9yZVxuICBpZiAoIWlkZW50aWZpZXJzLmluY2x1ZGVzKC4uLndvcmQpKSB7XG4gICAgY29uc29sZS5sb2coXCJub3QgZW5vdWdoXCIpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb250cmFjdFZNIHtcbiAgYWRkcmVzczogc3RyaW5nO1xuICBjb2RlPzogYW55O1xuICBzdGF0ZTogYW55ID0ge307XG4gIGNvbnN0cnVjdG9yKGFkZHJlc3M6IHN0cmluZywgY29kZTogc3RyaW5nKSB7XG4gICAgdGhpcy5hZGRyZXNzID0gYWRkcmVzcztcbiAgICB0aGlzLmNvZGUgPSBjb2RlO1xuICAgIGlmIChjaGVja2NvZGUoY29kZSkpIHtcbiAgICAgIGxldCBzdGF0ZSA9IHt9O1xuICAgICAgZXZhbChjb2RlICsgYHJlZHVjZXIoKWApO1xuICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xuICAgIH1cbiAgfVxuXG4gIG1lc3NhZ2VDYWxsKHR5cGU6IHN0cmluZywgZGF0YSA9IHt9KSB7XG4gICAgaWYgKHRoaXMuY29kZSkge1xuICAgICAgbGV0IHN0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgIGNvbnN0IGZ1bmMgPSBgcmVkdWNlcihzdGF0ZSx7dHlwZTpcIiR7dHlwZX1cIixkYXRhOiR7SlNPTi5zdHJpbmdpZnkoXG4gICAgICAgIGRhdGFcbiAgICAgICl9fSlgO1xuICAgICAgY29uc3QgY29kZSA9IHRoaXMuY29kZSArIGZ1bmM7XG4gICAgICBpZiAoY2hlY2tjb2RlKGNvZGUpKSB7ICAgICAgICBcbiAgICAgICAgZXZhbChjb2RlKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJtc2djYWxsXCIsIHsgc3RhdGUgfSk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==