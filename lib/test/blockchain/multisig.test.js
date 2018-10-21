"use strict";

var _blockchainApp = _interopRequireDefault(require("../../blockchain/blockchainApp"));

var _keypair = _interopRequireDefault(require("keypair"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var aes256 = require("aes256");

main();

function main() {
  return _main.apply(this, arguments);
}

function _main() {
  _main = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee() {
    var bc1, friends, cypher, bc2, cypher2, bc3, block, tran, multisigAddress;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            bc1 = new _blockchainApp.default();
            friends = [];
            cypher = (0, _keypair.default)();
            friends.push(aes256.encrypt("format", cypher.public));
            bc2 = new _blockchainApp.default(cypher.private, cypher.public);
            cypher2 = (0, _keypair.default)();
            friends.push(aes256.encrypt("format", cypher2.public));
            bc3 = new _blockchainApp.default(cypher2.private, cypher2.public);
            _context.next = 10;
            return bc1.mine();

          case 10:
            block = _context.sent;
            console.log({
              block: block
            });
            console.log("amount", bc1.address, bc1.nowAmount(bc1.address));
            bc2.chain = bc1.chain;
            bc3.chain = bc1.chain;
            tran = bc1.multisig.makeNewMultiSigAddress(friends, 2, 1);
            bc2.multisig.responder(tran);
            bc3.multisig.responder(tran);
            multisigAddress = Object.keys(bc1.multisig.multiSig)[0];
            tran = bc1.multisig.makeMultiSigTransaction(multisigAddress);

            bc2.multisig.events.onMultisigTran["test"] = function (info) {
              bc1.multisig.responder(bc2.multisig.approveMultiSig(info));
            };

            bc3.multisig.events.onMultisigTran["test"] = function (info) {
              bc1.multisig.responder(bc3.multisig.approveMultiSig(info));
            };

            if (tran) bc2.multisig.responder(tran);
            if (tran) bc3.multisig.responder(tran);

          case 24:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
  return _main.apply(this, arguments);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90ZXN0L2Jsb2NrY2hhaW4vbXVsdGlzaWcudGVzdC50cyJdLCJuYW1lcyI6WyJhZXMyNTYiLCJyZXF1aXJlIiwibWFpbiIsImJjMSIsIkJsb2NrQ2hhaW4iLCJmcmllbmRzIiwiY3lwaGVyIiwicHVzaCIsImVuY3J5cHQiLCJwdWJsaWMiLCJiYzIiLCJwcml2YXRlIiwiY3lwaGVyMiIsImJjMyIsIm1pbmUiLCJibG9jayIsImNvbnNvbGUiLCJsb2ciLCJhZGRyZXNzIiwibm93QW1vdW50IiwiY2hhaW4iLCJ0cmFuIiwibXVsdGlzaWciLCJtYWtlTmV3TXVsdGlTaWdBZGRyZXNzIiwicmVzcG9uZGVyIiwibXVsdGlzaWdBZGRyZXNzIiwiT2JqZWN0Iiwia2V5cyIsIm11bHRpU2lnIiwibWFrZU11bHRpU2lnVHJhbnNhY3Rpb24iLCJldmVudHMiLCJvbk11bHRpc2lnVHJhbiIsImluZm8iLCJhcHByb3ZlTXVsdGlTaWciXSwibWFwcGluZ3MiOiI7O0FBQUE7O0FBQ0E7Ozs7Ozs7O0FBRUEsSUFBSUEsTUFBTSxHQUFHQyxPQUFPLENBQUMsUUFBRCxDQUFwQjs7QUFFQUMsSUFBSTs7U0FFV0EsSTs7Ozs7OzswQkFBZjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDUUMsWUFBQUEsR0FEUixHQUNjLElBQUlDLHNCQUFKLEVBRGQ7QUFHUUMsWUFBQUEsT0FIUixHQUdrQixFQUhsQjtBQUtRQyxZQUFBQSxNQUxSLEdBS2lCLHVCQUxqQjtBQU1FRCxZQUFBQSxPQUFPLENBQUNFLElBQVIsQ0FBYVAsTUFBTSxDQUFDUSxPQUFQLENBQWUsUUFBZixFQUF5QkYsTUFBTSxDQUFDRyxNQUFoQyxDQUFiO0FBQ01DLFlBQUFBLEdBUFIsR0FPYyxJQUFJTixzQkFBSixDQUFlRSxNQUFNLENBQUNLLE9BQXRCLEVBQStCTCxNQUFNLENBQUNHLE1BQXRDLENBUGQ7QUFTUUcsWUFBQUEsT0FUUixHQVNrQix1QkFUbEI7QUFVRVAsWUFBQUEsT0FBTyxDQUFDRSxJQUFSLENBQWFQLE1BQU0sQ0FBQ1EsT0FBUCxDQUFlLFFBQWYsRUFBeUJJLE9BQU8sQ0FBQ0gsTUFBakMsQ0FBYjtBQUNNSSxZQUFBQSxHQVhSLEdBV2MsSUFBSVQsc0JBQUosQ0FBZVEsT0FBTyxDQUFDRCxPQUF2QixFQUFnQ0MsT0FBTyxDQUFDSCxNQUF4QyxDQVhkO0FBQUE7QUFBQSxtQkFhc0JOLEdBQUcsQ0FBQ1csSUFBSixFQWJ0Qjs7QUFBQTtBQWFRQyxZQUFBQSxLQWJSO0FBY0VDLFlBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZO0FBQUVGLGNBQUFBLEtBQUssRUFBTEE7QUFBRixhQUFaO0FBQ0FDLFlBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLFFBQVosRUFBc0JkLEdBQUcsQ0FBQ2UsT0FBMUIsRUFBbUNmLEdBQUcsQ0FBQ2dCLFNBQUosQ0FBY2hCLEdBQUcsQ0FBQ2UsT0FBbEIsQ0FBbkM7QUFFQVIsWUFBQUEsR0FBRyxDQUFDVSxLQUFKLEdBQVlqQixHQUFHLENBQUNpQixLQUFoQjtBQUNBUCxZQUFBQSxHQUFHLENBQUNPLEtBQUosR0FBWWpCLEdBQUcsQ0FBQ2lCLEtBQWhCO0FBRUlDLFlBQUFBLElBcEJOLEdBb0JrQmxCLEdBQUcsQ0FBQ21CLFFBQUosQ0FBYUMsc0JBQWIsQ0FBb0NsQixPQUFwQyxFQUE2QyxDQUE3QyxFQUFnRCxDQUFoRCxDQXBCbEI7QUFzQkVLLFlBQUFBLEdBQUcsQ0FBQ1ksUUFBSixDQUFhRSxTQUFiLENBQXVCSCxJQUF2QjtBQUNBUixZQUFBQSxHQUFHLENBQUNTLFFBQUosQ0FBYUUsU0FBYixDQUF1QkgsSUFBdkI7QUFFTUksWUFBQUEsZUF6QlIsR0F5QjBCQyxNQUFNLENBQUNDLElBQVAsQ0FBWXhCLEdBQUcsQ0FBQ21CLFFBQUosQ0FBYU0sUUFBekIsRUFBbUMsQ0FBbkMsQ0F6QjFCO0FBMEJFUCxZQUFBQSxJQUFJLEdBQUdsQixHQUFHLENBQUNtQixRQUFKLENBQWFPLHVCQUFiLENBQXFDSixlQUFyQyxDQUFQOztBQUVBZixZQUFBQSxHQUFHLENBQUNZLFFBQUosQ0FBYVEsTUFBYixDQUFvQkMsY0FBcEIsQ0FBbUMsTUFBbkMsSUFBNkMsVUFBQ0MsSUFBRCxFQUF3QjtBQUNuRTdCLGNBQUFBLEdBQUcsQ0FBQ21CLFFBQUosQ0FBYUUsU0FBYixDQUF1QmQsR0FBRyxDQUFDWSxRQUFKLENBQWFXLGVBQWIsQ0FBNkJELElBQTdCLENBQXZCO0FBQ0QsYUFGRDs7QUFHQW5CLFlBQUFBLEdBQUcsQ0FBQ1MsUUFBSixDQUFhUSxNQUFiLENBQW9CQyxjQUFwQixDQUFtQyxNQUFuQyxJQUE2QyxVQUFDQyxJQUFELEVBQXdCO0FBQ25FN0IsY0FBQUEsR0FBRyxDQUFDbUIsUUFBSixDQUFhRSxTQUFiLENBQXVCWCxHQUFHLENBQUNTLFFBQUosQ0FBYVcsZUFBYixDQUE2QkQsSUFBN0IsQ0FBdkI7QUFDRCxhQUZEOztBQUdBLGdCQUFJWCxJQUFKLEVBQVVYLEdBQUcsQ0FBQ1ksUUFBSixDQUFhRSxTQUFiLENBQXVCSCxJQUF2QjtBQUNWLGdCQUFJQSxJQUFKLEVBQVVSLEdBQUcsQ0FBQ1MsUUFBSixDQUFhRSxTQUFiLENBQXVCSCxJQUF2Qjs7QUFuQ1o7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBCbG9ja0NoYWluIGZyb20gXCIuLi8uLi9ibG9ja2NoYWluL2Jsb2NrY2hhaW5BcHBcIjtcbmltcG9ydCBrZXlwYWlyIGZyb20gXCJrZXlwYWlyXCI7XG5pbXBvcnQgeyBtdWx0aXNpZ0luZm8gfSBmcm9tIFwiLi4vLi4vYmxvY2tjaGFpbi9pbnRlcmZhY2VcIjtcbnZhciBhZXMyNTYgPSByZXF1aXJlKFwiYWVzMjU2XCIpO1xuXG5tYWluKCk7XG5cbmFzeW5jIGZ1bmN0aW9uIG1haW4oKSB7XG4gIGNvbnN0IGJjMSA9IG5ldyBCbG9ja0NoYWluKCk7XG5cbiAgY29uc3QgZnJpZW5kcyA9IFtdO1xuXG4gIGNvbnN0IGN5cGhlciA9IGtleXBhaXIoKTtcbiAgZnJpZW5kcy5wdXNoKGFlczI1Ni5lbmNyeXB0KFwiZm9ybWF0XCIsIGN5cGhlci5wdWJsaWMpKTtcbiAgY29uc3QgYmMyID0gbmV3IEJsb2NrQ2hhaW4oY3lwaGVyLnByaXZhdGUsIGN5cGhlci5wdWJsaWMpO1xuXG4gIGNvbnN0IGN5cGhlcjIgPSBrZXlwYWlyKCk7XG4gIGZyaWVuZHMucHVzaChhZXMyNTYuZW5jcnlwdChcImZvcm1hdFwiLCBjeXBoZXIyLnB1YmxpYykpO1xuICBjb25zdCBiYzMgPSBuZXcgQmxvY2tDaGFpbihjeXBoZXIyLnByaXZhdGUsIGN5cGhlcjIucHVibGljKTtcblxuICBjb25zdCBibG9jayA9IGF3YWl0IGJjMS5taW5lKCk7XG4gIGNvbnNvbGUubG9nKHsgYmxvY2sgfSk7XG4gIGNvbnNvbGUubG9nKFwiYW1vdW50XCIsIGJjMS5hZGRyZXNzLCBiYzEubm93QW1vdW50KGJjMS5hZGRyZXNzKSk7XG5cbiAgYmMyLmNoYWluID0gYmMxLmNoYWluO1xuICBiYzMuY2hhaW4gPSBiYzEuY2hhaW47XG5cbiAgbGV0IHRyYW46IGFueSA9IGJjMS5tdWx0aXNpZy5tYWtlTmV3TXVsdGlTaWdBZGRyZXNzKGZyaWVuZHMsIDIsIDEpO1xuXG4gIGJjMi5tdWx0aXNpZy5yZXNwb25kZXIodHJhbik7XG4gIGJjMy5tdWx0aXNpZy5yZXNwb25kZXIodHJhbik7XG5cbiAgY29uc3QgbXVsdGlzaWdBZGRyZXNzID0gT2JqZWN0LmtleXMoYmMxLm11bHRpc2lnLm11bHRpU2lnKVswXTtcbiAgdHJhbiA9IGJjMS5tdWx0aXNpZy5tYWtlTXVsdGlTaWdUcmFuc2FjdGlvbihtdWx0aXNpZ0FkZHJlc3MpO1xuXG4gIGJjMi5tdWx0aXNpZy5ldmVudHMub25NdWx0aXNpZ1RyYW5bXCJ0ZXN0XCJdID0gKGluZm86IG11bHRpc2lnSW5mbykgPT4ge1xuICAgIGJjMS5tdWx0aXNpZy5yZXNwb25kZXIoYmMyLm11bHRpc2lnLmFwcHJvdmVNdWx0aVNpZyhpbmZvKSk7XG4gIH07XG4gIGJjMy5tdWx0aXNpZy5ldmVudHMub25NdWx0aXNpZ1RyYW5bXCJ0ZXN0XCJdID0gKGluZm86IG11bHRpc2lnSW5mbykgPT4ge1xuICAgIGJjMS5tdWx0aXNpZy5yZXNwb25kZXIoYmMzLm11bHRpc2lnLmFwcHJvdmVNdWx0aVNpZyhpbmZvKSk7XG4gIH07XG4gIGlmICh0cmFuKSBiYzIubXVsdGlzaWcucmVzcG9uZGVyKHRyYW4pO1xuICBpZiAodHJhbikgYmMzLm11bHRpc2lnLnJlc3BvbmRlcih0cmFuKTtcbn1cbiJdfQ==