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
            bs = [];

            for (i = 0; i < 2; i++) {
              bs.push(new _blockchainApp.default());
            }

            _context.next = 5;
            return b.mine();

          case 5:
            bs.forEach(function (bc) {
              bc.chain = b.chain;
            });
            tran = b.contract.makeContract(0, code);
            address = tran.data.payload.address;
            bs.forEach(function (bc) {
              bc.responder.runRPC({
                type: _responder.typeRPC.TRANSACRION,
                body: tran
              });
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

          case 12:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
  return _main.apply(this, arguments);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90ZXN0L2NvbnRyYWN0L2NvbnRyYWN0LnRlc3QudHMiXSwibmFtZXMiOlsiY29kZSIsIm1haW4iLCJiIiwiQmxvY2tDaGFpbkFwcCIsImJzIiwiaSIsInB1c2giLCJtaW5lIiwiZm9yRWFjaCIsImJjIiwiY2hhaW4iLCJ0cmFuIiwiY29udHJhY3QiLCJtYWtlQ29udHJhY3QiLCJhZGRyZXNzIiwiZGF0YSIsInBheWxvYWQiLCJyZXNwb25kZXIiLCJydW5SUEMiLCJ0eXBlIiwidHlwZVJQQyIsIlRSQU5TQUNSSU9OIiwiYm9keSIsIm1ha2VNZXNzYWdlQ2FsbCIsInYxIiwidGVzdCIsImlzIiwiY29udHJhY3RzIiwic3RhdGUiLCJ2MCJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7QUFFQSxJQUFNQSxJQUFJLHFhQUFWO0FBbUJBQyxJQUFJOztTQUVXQSxJOzs7Ozs7OzBCQUFmO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNRQyxZQUFBQSxDQURSLEdBQ1ksSUFBSUMsc0JBQUosRUFEWjtBQUVRQyxZQUFBQSxFQUZSLEdBRThCLEVBRjlCOztBQUdFLGlCQUFTQyxDQUFULEdBQWEsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHLENBQXBCLEVBQXVCQSxDQUFDLEVBQXhCLEVBQTRCO0FBQzFCRCxjQUFBQSxFQUFFLENBQUNFLElBQUgsQ0FBUSxJQUFJSCxzQkFBSixFQUFSO0FBQ0Q7O0FBTEg7QUFBQSxtQkFNUUQsQ0FBQyxDQUFDSyxJQUFGLEVBTlI7O0FBQUE7QUFPRUgsWUFBQUEsRUFBRSxDQUFDSSxPQUFILENBQVcsVUFBQUMsRUFBRSxFQUFJO0FBQ2ZBLGNBQUFBLEVBQUUsQ0FBQ0MsS0FBSCxHQUFXUixDQUFDLENBQUNRLEtBQWI7QUFDRCxhQUZEO0FBSUlDLFlBQUFBLElBWE4sR0FXa0JULENBQUMsQ0FBQ1UsUUFBRixDQUFXQyxZQUFYLENBQXdCLENBQXhCLEVBQTJCYixJQUEzQixDQVhsQjtBQVlRYyxZQUFBQSxPQVpSLEdBWWtCSCxJQUFJLENBQUNJLElBQUwsQ0FBVUMsT0FBVixDQUFrQkYsT0FacEM7QUFhRVYsWUFBQUEsRUFBRSxDQUFDSSxPQUFILENBQVcsVUFBQUMsRUFBRSxFQUFJO0FBQ2ZBLGNBQUFBLEVBQUUsQ0FBQ1EsU0FBSCxDQUFhQyxNQUFiLENBQW9CO0FBQUVDLGdCQUFBQSxJQUFJLEVBQUVDLG1CQUFRQyxXQUFoQjtBQUE2QkMsZ0JBQUFBLElBQUksRUFBRVg7QUFBbkMsZUFBcEI7QUFDRCxhQUZEO0FBSUFBLFlBQUFBLElBQUksR0FBR1QsQ0FBQyxDQUFDVSxRQUFGLENBQVdXLGVBQVgsQ0FBMkJULE9BQTNCLEVBQW9DLENBQXBDLEVBQXVDO0FBQzVDSyxjQUFBQSxJQUFJLEVBQUUsS0FEc0M7QUFFNUNKLGNBQUFBLElBQUksRUFBRTtBQUFFUyxnQkFBQUEsRUFBRSxFQUFFO0FBQU47QUFGc0MsYUFBdkMsQ0FBUDtBQUlBcEIsWUFBQUEsRUFBRSxDQUFDSSxPQUFILENBQVcsVUFBQUMsRUFBRSxFQUFJO0FBQ2ZBLGNBQUFBLEVBQUUsQ0FBQ1EsU0FBSCxDQUFhQyxNQUFiLENBQW9CO0FBQUVDLGdCQUFBQSxJQUFJLEVBQUVDLG1CQUFRQyxXQUFoQjtBQUE2QkMsZ0JBQUFBLElBQUksRUFBRVg7QUFBbkMsZUFBcEI7QUFDRCxhQUZEO0FBSUEsOEJBQUsscUJBQUwsRUFBNEIsVUFBQWMsSUFBSSxFQUFJO0FBQ2xDckIsY0FBQUEsRUFBRSxDQUFDSSxPQUFILENBQVcsVUFBQUMsRUFBRSxFQUFJO0FBQ2ZnQixnQkFBQUEsSUFBSSxDQUFDQyxFQUFMLENBQVFqQixFQUFFLENBQUNHLFFBQUgsQ0FBWWUsU0FBWixDQUFzQmIsT0FBdEIsRUFBK0JjLEtBQS9CLENBQXFDQyxFQUE3QyxFQUFpRCxDQUFqRDtBQUNELGVBRkQ7QUFHRCxhQUpEOztBQXpCRjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEJsb2NrQ2hhaW5BcHAgZnJvbSBcIi4uLy4uL2Jsb2NrY2hhaW4vYmxvY2tjaGFpbkFwcFwiO1xuaW1wb3J0IHsgdHlwZVJQQyB9IGZyb20gXCIuLi8uLi9ibG9ja2NoYWluL3Jlc3BvbmRlclwiO1xuaW1wb3J0IHRlc3QgZnJvbSBcImF2YVwiO1xuXG5jb25zdCBjb2RlID0gYFxuY29uc3QgaW5pdGlhbFN0YXRlID0geyB2MDogMCB9O1xuZnVuY3Rpb24gcmVkdWNlcihwcmV2U3RhdGUgPSBpbml0aWFsU3RhdGUsIGFjdGlvbiA9IHsgdHlwZTogXCJcIiwgZGF0YToge30gfSkgeyAgXG4gIGNvbnN0IGRhdGEgPSBhY3Rpb24uZGF0YTtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgXCJpbmNyZW1lbnRcIjpcbiAgICAgIHByZXZTdGF0ZS52MCsrO1xuICAgICAgc3RhdGUgPSBwcmV2U3RhdGU7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiYWRkXCI6XG4gICAgICBwcmV2U3RhdGUudjAgKz0gcGFyc2VJbnQoZGF0YS52MSwgMTApO1xuICAgICAgc3RhdGUgPSBwcmV2U3RhdGU7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgc3RhdGUgPSBwcmV2U3RhdGU7XG4gIH0gIFxufVxuYDtcblxubWFpbigpO1xuXG5hc3luYyBmdW5jdGlvbiBtYWluKCkge1xuICBjb25zdCBiID0gbmV3IEJsb2NrQ2hhaW5BcHAoKTtcbiAgY29uc3QgYnM6IEJsb2NrQ2hhaW5BcHBbXSA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IDI7IGkrKykge1xuICAgIGJzLnB1c2gobmV3IEJsb2NrQ2hhaW5BcHAoKSk7XG4gIH1cbiAgYXdhaXQgYi5taW5lKCk7XG4gIGJzLmZvckVhY2goYmMgPT4ge1xuICAgIGJjLmNoYWluID0gYi5jaGFpbjtcbiAgfSk7XG5cbiAgbGV0IHRyYW46IGFueSA9IGIuY29udHJhY3QubWFrZUNvbnRyYWN0KDAsIGNvZGUpO1xuICBjb25zdCBhZGRyZXNzID0gdHJhbi5kYXRhLnBheWxvYWQuYWRkcmVzcztcbiAgYnMuZm9yRWFjaChiYyA9PiB7XG4gICAgYmMucmVzcG9uZGVyLnJ1blJQQyh7IHR5cGU6IHR5cGVSUEMuVFJBTlNBQ1JJT04sIGJvZHk6IHRyYW4gfSk7XG4gIH0pO1xuXG4gIHRyYW4gPSBiLmNvbnRyYWN0Lm1ha2VNZXNzYWdlQ2FsbChhZGRyZXNzLCAwLCB7XG4gICAgdHlwZTogXCJhZGRcIixcbiAgICBkYXRhOiB7IHYxOiBcIjRcIiB9XG4gIH0pO1xuICBicy5mb3JFYWNoKGJjID0+IHtcbiAgICBiYy5yZXNwb25kZXIucnVuUlBDKHsgdHlwZTogdHlwZVJQQy5UUkFOU0FDUklPTiwgYm9keTogdHJhbiB9KTtcbiAgfSk7XG5cbiAgdGVzdChcImJsb2NrY2hhaW4tY29udHJhY3RcIiwgdGVzdCA9PiB7XG4gICAgYnMuZm9yRWFjaChiYyA9PiB7XG4gICAgICB0ZXN0LmlzKGJjLmNvbnRyYWN0LmNvbnRyYWN0c1thZGRyZXNzXS5zdGF0ZS52MCwgNCk7XG4gICAgfSk7XG4gIH0pO1xufVxuIl19