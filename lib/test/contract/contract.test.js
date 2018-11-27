"use strict";

var _blockchainApp = _interopRequireDefault(require("../../blockchain/blockchainApp"));

var _responder = require("../../blockchain/responder");

var _ava = _interopRequireDefault(require("ava"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var code = "\nconst initialState = { v0: 0 };\nfunction reducer(prevState = initialState, action = { type: \"\", data: {} }) {  \n  const data = action.data;\n  switch (action.type) {\n    case \"increment\":\n      prevState.v0++;\n      state = prevState;\n      break;\n    case \"add\":\n      prevState.v0 += parseInt(data.v1, 10);\n      state = prevState;\n      break;\n    default:\n      state = prevState;\n  }  \n}\n";
main();

function main() {
  return _main.apply(this, arguments);
}

function _main() {
  _main = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee() {
    var b, bs, i, tran, address;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            b = new _blockchainApp.default();
            _context.next = 3;
            return b.mine();

          case 3:
            bs = [];

            for (i = 0; i < 2; i++) {
              bs.push(new _blockchainApp.default());
            }

            bs.forEach(function (bc) {
              bc.chain = b.chain;
            });
            tran = b.contract.makeContract(0, code);

            if (tran) {
              _context.next = 9;
              break;
            }

            return _context.abrupt("return");

          case 9:
            address = tran.data.payload.address;
            bs.forEach(function (bc) {
              bc.responder.runRPC({
                type: _responder.typeRPC.TRANSACRION,
                body: tran
              });
              console.log("contracts", bc.contract.contracts);
            });
            tran = b.contract.makeMessageCall(address, 0, {
              type: "add",
              data: {
                v1: "4"
              }
            });
            bs.forEach(function (bc) {
              bc.responder.runRPC({
                type: _responder.typeRPC.TRANSACRION,
                body: tran
              });
            });
            (0, _ava.default)("blockchain-contract", function (test) {
              bs.forEach(function (bc) {
                test.is(bc.contract.contracts[address].state.v0, 4);
              });
            });

          case 14:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
  return _main.apply(this, arguments);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90ZXN0L2NvbnRyYWN0L2NvbnRyYWN0LnRlc3QudHMiXSwibmFtZXMiOlsiY29kZSIsIm1haW4iLCJiIiwiQmxvY2tDaGFpbkFwcCIsIm1pbmUiLCJicyIsImkiLCJwdXNoIiwiZm9yRWFjaCIsImJjIiwiY2hhaW4iLCJ0cmFuIiwiY29udHJhY3QiLCJtYWtlQ29udHJhY3QiLCJhZGRyZXNzIiwiZGF0YSIsInBheWxvYWQiLCJyZXNwb25kZXIiLCJydW5SUEMiLCJ0eXBlIiwidHlwZVJQQyIsIlRSQU5TQUNSSU9OIiwiYm9keSIsImNvbnNvbGUiLCJsb2ciLCJjb250cmFjdHMiLCJtYWtlTWVzc2FnZUNhbGwiLCJ2MSIsInRlc3QiLCJpcyIsInN0YXRlIiwidjAiXSwibWFwcGluZ3MiOiI7O0FBQUE7O0FBQ0E7O0FBQ0E7Ozs7Ozs7O0FBR0EsSUFBTUEsSUFBSSxxYUFBVjtBQW1CQUMsSUFBSTs7U0FFV0EsSTs7Ozs7OzswQkFBZjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDUUMsWUFBQUEsQ0FEUixHQUNZLElBQUlDLHNCQUFKLEVBRFo7QUFBQTtBQUFBLG1CQUVRRCxDQUFDLENBQUNFLElBQUYsRUFGUjs7QUFBQTtBQUlRQyxZQUFBQSxFQUpSLEdBSThCLEVBSjlCOztBQUtFLGlCQUFTQyxDQUFULEdBQWEsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHLENBQXBCLEVBQXVCQSxDQUFDLEVBQXhCLEVBQTRCO0FBQzFCRCxjQUFBQSxFQUFFLENBQUNFLElBQUgsQ0FBUSxJQUFJSixzQkFBSixFQUFSO0FBQ0Q7O0FBQ0RFLFlBQUFBLEVBQUUsQ0FBQ0csT0FBSCxDQUFXLFVBQUFDLEVBQUUsRUFBSTtBQUNmQSxjQUFBQSxFQUFFLENBQUNDLEtBQUgsR0FBV1IsQ0FBQyxDQUFDUSxLQUFiO0FBQ0QsYUFGRDtBQUlJQyxZQUFBQSxJQVpOLEdBWWFULENBQUMsQ0FBQ1UsUUFBRixDQUFXQyxZQUFYLENBQXdCLENBQXhCLEVBQTJCYixJQUEzQixDQVpiOztBQUFBLGdCQWFPVyxJQWJQO0FBQUE7QUFBQTtBQUFBOztBQUFBOztBQUFBO0FBY1FHLFlBQUFBLE9BZFIsR0Fja0JILElBQUksQ0FBQ0ksSUFBTCxDQUFVQyxPQUFWLENBQWtCRixPQWRwQztBQWdCRVQsWUFBQUEsRUFBRSxDQUFDRyxPQUFILENBQVcsVUFBQUMsRUFBRSxFQUFJO0FBQ2ZBLGNBQUFBLEVBQUUsQ0FBQ1EsU0FBSCxDQUFhQyxNQUFiLENBQW9CO0FBQUVDLGdCQUFBQSxJQUFJLEVBQUVDLG1CQUFRQyxXQUFoQjtBQUE2QkMsZ0JBQUFBLElBQUksRUFBRVg7QUFBbkMsZUFBcEI7QUFDQVksY0FBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksV0FBWixFQUF5QmYsRUFBRSxDQUFDRyxRQUFILENBQVlhLFNBQXJDO0FBQ0QsYUFIRDtBQUtBZCxZQUFBQSxJQUFJLEdBQUdULENBQUMsQ0FBQ1UsUUFBRixDQUFXYyxlQUFYLENBQTJCWixPQUEzQixFQUFvQyxDQUFwQyxFQUF1QztBQUM1Q0ssY0FBQUEsSUFBSSxFQUFFLEtBRHNDO0FBRTVDSixjQUFBQSxJQUFJLEVBQUU7QUFBRVksZ0JBQUFBLEVBQUUsRUFBRTtBQUFOO0FBRnNDLGFBQXZDLENBQVA7QUFJQXRCLFlBQUFBLEVBQUUsQ0FBQ0csT0FBSCxDQUFXLFVBQUFDLEVBQUUsRUFBSTtBQUNmQSxjQUFBQSxFQUFFLENBQUNRLFNBQUgsQ0FBYUMsTUFBYixDQUFvQjtBQUFFQyxnQkFBQUEsSUFBSSxFQUFFQyxtQkFBUUMsV0FBaEI7QUFBNkJDLGdCQUFBQSxJQUFJLEVBQUVYO0FBQW5DLGVBQXBCO0FBQ0QsYUFGRDtBQUlBLDhCQUFLLHFCQUFMLEVBQTRCLFVBQUFpQixJQUFJLEVBQUk7QUFDbEN2QixjQUFBQSxFQUFFLENBQUNHLE9BQUgsQ0FBVyxVQUFBQyxFQUFFLEVBQUk7QUFDZm1CLGdCQUFBQSxJQUFJLENBQUNDLEVBQUwsQ0FBUXBCLEVBQUUsQ0FBQ0csUUFBSCxDQUFZYSxTQUFaLENBQXNCWCxPQUF0QixFQUErQmdCLEtBQS9CLENBQXFDQyxFQUE3QyxFQUFpRCxDQUFqRDtBQUNELGVBRkQ7QUFHRCxhQUpEOztBQTdCRjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEJsb2NrQ2hhaW5BcHAgZnJvbSBcIi4uLy4uL2Jsb2NrY2hhaW4vYmxvY2tjaGFpbkFwcFwiO1xuaW1wb3J0IHsgdHlwZVJQQyB9IGZyb20gXCIuLi8uLi9ibG9ja2NoYWluL3Jlc3BvbmRlclwiO1xuaW1wb3J0IHRlc3QgZnJvbSBcImF2YVwiO1xuaW1wb3J0IHsgSVRyYW5zYWN0aW9uIH0gZnJvbSBcIi4uLy4uL2Jsb2NrY2hhaW4vYmxvY2tjaGFpblwiO1xuXG5jb25zdCBjb2RlID0gYFxuY29uc3QgaW5pdGlhbFN0YXRlID0geyB2MDogMCB9O1xuZnVuY3Rpb24gcmVkdWNlcihwcmV2U3RhdGUgPSBpbml0aWFsU3RhdGUsIGFjdGlvbiA9IHsgdHlwZTogXCJcIiwgZGF0YToge30gfSkgeyAgXG4gIGNvbnN0IGRhdGEgPSBhY3Rpb24uZGF0YTtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgXCJpbmNyZW1lbnRcIjpcbiAgICAgIHByZXZTdGF0ZS52MCsrO1xuICAgICAgc3RhdGUgPSBwcmV2U3RhdGU7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiYWRkXCI6XG4gICAgICBwcmV2U3RhdGUudjAgKz0gcGFyc2VJbnQoZGF0YS52MSwgMTApO1xuICAgICAgc3RhdGUgPSBwcmV2U3RhdGU7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgc3RhdGUgPSBwcmV2U3RhdGU7XG4gIH0gIFxufVxuYDtcblxubWFpbigpO1xuXG5hc3luYyBmdW5jdGlvbiBtYWluKCkge1xuICBjb25zdCBiID0gbmV3IEJsb2NrQ2hhaW5BcHAoKTtcbiAgYXdhaXQgYi5taW5lKCk7XG5cbiAgY29uc3QgYnM6IEJsb2NrQ2hhaW5BcHBbXSA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IDI7IGkrKykge1xuICAgIGJzLnB1c2gobmV3IEJsb2NrQ2hhaW5BcHAoKSk7XG4gIH0gIFxuICBicy5mb3JFYWNoKGJjID0+IHtcbiAgICBiYy5jaGFpbiA9IGIuY2hhaW47XG4gIH0pO1xuXG4gIGxldCB0cmFuID0gYi5jb250cmFjdC5tYWtlQ29udHJhY3QoMCwgY29kZSk7XG4gIGlmICghdHJhbikgcmV0dXJuO1xuICBjb25zdCBhZGRyZXNzID0gdHJhbi5kYXRhLnBheWxvYWQuYWRkcmVzcztcblxuICBicy5mb3JFYWNoKGJjID0+IHtcbiAgICBiYy5yZXNwb25kZXIucnVuUlBDKHsgdHlwZTogdHlwZVJQQy5UUkFOU0FDUklPTiwgYm9keTogdHJhbiB9KTtcbiAgICBjb25zb2xlLmxvZyhcImNvbnRyYWN0c1wiLCBiYy5jb250cmFjdC5jb250cmFjdHMpO1xuICB9KTtcblxuICB0cmFuID0gYi5jb250cmFjdC5tYWtlTWVzc2FnZUNhbGwoYWRkcmVzcywgMCwge1xuICAgIHR5cGU6IFwiYWRkXCIsXG4gICAgZGF0YTogeyB2MTogXCI0XCIgfVxuICB9KTtcbiAgYnMuZm9yRWFjaChiYyA9PiB7XG4gICAgYmMucmVzcG9uZGVyLnJ1blJQQyh7IHR5cGU6IHR5cGVSUEMuVFJBTlNBQ1JJT04sIGJvZHk6IHRyYW4gfSk7XG4gIH0pO1xuXG4gIHRlc3QoXCJibG9ja2NoYWluLWNvbnRyYWN0XCIsIHRlc3QgPT4ge1xuICAgIGJzLmZvckVhY2goYmMgPT4geyAgICAgIFxuICAgICAgdGVzdC5pcyhiYy5jb250cmFjdC5jb250cmFjdHNbYWRkcmVzc10uc3RhdGUudjAsIDQpO1xuICAgIH0pO1xuICB9KTtcbn1cbiJdfQ==