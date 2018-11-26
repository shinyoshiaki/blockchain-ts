"use strict";

var _ava = _interopRequireDefault(require("ava"));

var _blockchainApp = _interopRequireDefault(require("../../blockchain/blockchainApp"));

var _blockchain = require("../../blockchain/blockchain");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var bc = new _blockchainApp.default();
(0, _ava.default)("sign",
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(test) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return bc.mine().catch(console.log);

          case 2:
            test.is((0, _blockchain.validChain)(bc.chain), true);
            _context.next = 5;
            return bc.mine();

          case 5:
            test.is((0, _blockchain.validChain)(bc.chain), true);
            _context.next = 8;
            return bc.mine();

          case 8:
            test.is((0, _blockchain.validChain)(bc.chain), true);
            _context.next = 11;
            return bc.mine();

          case 11:
            test.is((0, _blockchain.validChain)(bc.chain), true);

          case 12:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90ZXN0L2Jsb2NrY2hhaW4vbWluaW5nLnRlc3QudHMiXSwibmFtZXMiOlsiYmMiLCJCbG9ja0NoYWluQXBwIiwidGVzdCIsIm1pbmUiLCJjYXRjaCIsImNvbnNvbGUiLCJsb2ciLCJpcyIsImNoYWluIl0sIm1hcHBpbmdzIjoiOztBQUFBOztBQUNBOztBQUNBOzs7Ozs7OztBQUVBLElBQU1BLEVBQUUsR0FBRyxJQUFJQyxzQkFBSixFQUFYO0FBRUEsa0JBQUssTUFBTDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsMEJBQWEsaUJBQU1DLElBQU47QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsbUJBQ0xGLEVBQUUsQ0FBQ0csSUFBSCxHQUFVQyxLQUFWLENBQWdCQyxPQUFPLENBQUNDLEdBQXhCLENBREs7O0FBQUE7QUFFWEosWUFBQUEsSUFBSSxDQUFDSyxFQUFMLENBQVEsNEJBQVdQLEVBQUUsQ0FBQ1EsS0FBZCxDQUFSLEVBQThCLElBQTlCO0FBRlc7QUFBQSxtQkFHTFIsRUFBRSxDQUFDRyxJQUFILEVBSEs7O0FBQUE7QUFJWEQsWUFBQUEsSUFBSSxDQUFDSyxFQUFMLENBQVEsNEJBQVdQLEVBQUUsQ0FBQ1EsS0FBZCxDQUFSLEVBQThCLElBQTlCO0FBSlc7QUFBQSxtQkFLTFIsRUFBRSxDQUFDRyxJQUFILEVBTEs7O0FBQUE7QUFNWEQsWUFBQUEsSUFBSSxDQUFDSyxFQUFMLENBQVEsNEJBQVdQLEVBQUUsQ0FBQ1EsS0FBZCxDQUFSLEVBQThCLElBQTlCO0FBTlc7QUFBQSxtQkFPTFIsRUFBRSxDQUFDRyxJQUFILEVBUEs7O0FBQUE7QUFRWEQsWUFBQUEsSUFBSSxDQUFDSyxFQUFMLENBQVEsNEJBQVdQLEVBQUUsQ0FBQ1EsS0FBZCxDQUFSLEVBQThCLElBQTlCOztBQVJXO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEdBQWI7O0FBQUE7QUFBQTtBQUFBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdGVzdCBmcm9tIFwiYXZhXCI7XG5pbXBvcnQgQmxvY2tDaGFpbkFwcCBmcm9tIFwiLi4vLi4vYmxvY2tjaGFpbi9ibG9ja2NoYWluQXBwXCI7XG5pbXBvcnQgeyB2YWxpZENoYWluIH0gZnJvbSBcIi4uLy4uL2Jsb2NrY2hhaW4vYmxvY2tjaGFpblwiO1xuXG5jb25zdCBiYyA9IG5ldyBCbG9ja0NoYWluQXBwKCk7XG5cbnRlc3QoXCJzaWduXCIsIGFzeW5jIHRlc3QgPT4ge1xuICBhd2FpdCBiYy5taW5lKCkuY2F0Y2goY29uc29sZS5sb2cpO1xuICB0ZXN0LmlzKHZhbGlkQ2hhaW4oYmMuY2hhaW4pLCB0cnVlKTtcbiAgYXdhaXQgYmMubWluZSgpO1xuICB0ZXN0LmlzKHZhbGlkQ2hhaW4oYmMuY2hhaW4pLCB0cnVlKTtcbiAgYXdhaXQgYmMubWluZSgpO1xuICB0ZXN0LmlzKHZhbGlkQ2hhaW4oYmMuY2hhaW4pLCB0cnVlKTtcbiAgYXdhaXQgYmMubWluZSgpO1xuICB0ZXN0LmlzKHZhbGlkQ2hhaW4oYmMuY2hhaW4pLCB0cnVlKTtcbn0pO1xuIl19