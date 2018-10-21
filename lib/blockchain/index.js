"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.y = exports.x = exports.C = void 0;

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var C = function C() {
  var _this = this;

  _classCallCheck(this, C);

  _defineProperty(this, "x", 10);

  _defineProperty(this, "getX", function () {
    return _this.x;
  });

  _defineProperty(this, "setX", function (newVal) {
    _this.x = newVal;
  });
};

exports.C = C;
var x = new C();
exports.x = x;

var y = _objectSpread({}, {
  some: "value"
});

exports.y = y;
console.log("test");
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL2luZGV4LnRzIl0sIm5hbWVzIjpbIkMiLCJ4IiwibmV3VmFsIiwieSIsInNvbWUiLCJjb25zb2xlIiwibG9nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBQWFBLEM7Ozs7OzZCQUNDLEU7O2dDQUNMO0FBQUEsV0FBTSxLQUFJLENBQUNDLENBQVg7QUFBQSxHOztnQ0FDQSxVQUFDQyxNQUFELEVBQW9CO0FBQ3pCLElBQUEsS0FBSSxDQUFDRCxDQUFMLEdBQVNDLE1BQVQ7QUFDRCxHOzs7O0FBR0ksSUFBSUQsQ0FBQyxHQUFHLElBQUlELENBQUosRUFBUjs7O0FBQ0EsSUFBSUcsQ0FBQyxxQkFBUTtBQUFFQyxFQUFBQSxJQUFJLEVBQUU7QUFBUixDQUFSLENBQUw7OztBQUVQQyxPQUFPLENBQUNDLEdBQVIsQ0FBWSxNQUFaIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIEMge1xuICBwcml2YXRlIHggPSAxMDtcbiAgZ2V0WCA9ICgpID0+IHRoaXMueDtcbiAgc2V0WCA9IChuZXdWYWw6IG51bWJlcikgPT4ge1xuICAgIHRoaXMueCA9IG5ld1ZhbDtcbiAgfTtcbn1cblxuZXhwb3J0IGxldCB4ID0gbmV3IEMoKTtcbmV4cG9ydCBsZXQgeSA9IHsgLi4ueyBzb21lOiBcInZhbHVlXCIgfSB9O1xuXG5jb25zb2xlLmxvZyhcInRlc3RcIik7XG4iXX0=