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
              console.log("bc2.multisig.events.onMultisigTran[\"test\"] = (info: multisigInfo) => {");
              var tran = bc2.multisig.approveMultiSig(info); //   console.log({ tran });

              bc1.multisig.responder(tran);
            };

            if (tran) bc2.multisig.responder(tran);

            bc3.multisig.events.onMultisigTran["test"] = function (info) {
              console.log("bc3.multisig.events.onMultisigTran[\"test\"] = (info: multisigInfo) => {");
              var tran = bc3.multisig.approveMultiSig(info); //   console.log({ tran });

              bc1.multisig.responder(tran);
            };

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90ZXN0L2Jsb2NrY2hhaW4vbXVsdGlzaWcudGVzdC50cyJdLCJuYW1lcyI6WyJhZXMyNTYiLCJyZXF1aXJlIiwibWFpbiIsImJjMSIsIkJsb2NrQ2hhaW4iLCJmcmllbmRzIiwiY3lwaGVyIiwicHVzaCIsImVuY3J5cHQiLCJwdWJsaWMiLCJiYzIiLCJwcml2YXRlIiwiY3lwaGVyMiIsImJjMyIsIm1pbmUiLCJibG9jayIsImNvbnNvbGUiLCJsb2ciLCJhZGRyZXNzIiwibm93QW1vdW50IiwiY2hhaW4iLCJ0cmFuIiwibXVsdGlzaWciLCJtYWtlTmV3TXVsdGlTaWdBZGRyZXNzIiwicmVzcG9uZGVyIiwibXVsdGlzaWdBZGRyZXNzIiwiT2JqZWN0Iiwia2V5cyIsIm11bHRpU2lnIiwibWFrZU11bHRpU2lnVHJhbnNhY3Rpb24iLCJldmVudHMiLCJvbk11bHRpc2lnVHJhbiIsImluZm8iLCJhcHByb3ZlTXVsdGlTaWciXSwibWFwcGluZ3MiOiI7O0FBQUE7O0FBQ0E7Ozs7Ozs7O0FBR0EsSUFBSUEsTUFBTSxHQUFHQyxPQUFPLENBQUMsUUFBRCxDQUFwQjs7QUFFQUMsSUFBSTs7U0FFV0EsSTs7Ozs7OzswQkFBZjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDUUMsWUFBQUEsR0FEUixHQUNjLElBQUlDLHNCQUFKLEVBRGQ7QUFHUUMsWUFBQUEsT0FIUixHQUdrQixFQUhsQjtBQUtRQyxZQUFBQSxNQUxSLEdBS2lCLHVCQUxqQjtBQU1FRCxZQUFBQSxPQUFPLENBQUNFLElBQVIsQ0FBYVAsTUFBTSxDQUFDUSxPQUFQLENBQWUsUUFBZixFQUF5QkYsTUFBTSxDQUFDRyxNQUFoQyxDQUFiO0FBQ01DLFlBQUFBLEdBUFIsR0FPYyxJQUFJTixzQkFBSixDQUFlRSxNQUFNLENBQUNLLE9BQXRCLEVBQStCTCxNQUFNLENBQUNHLE1BQXRDLENBUGQ7QUFTUUcsWUFBQUEsT0FUUixHQVNrQix1QkFUbEI7QUFVRVAsWUFBQUEsT0FBTyxDQUFDRSxJQUFSLENBQWFQLE1BQU0sQ0FBQ1EsT0FBUCxDQUFlLFFBQWYsRUFBeUJJLE9BQU8sQ0FBQ0gsTUFBakMsQ0FBYjtBQUNNSSxZQUFBQSxHQVhSLEdBV2MsSUFBSVQsc0JBQUosQ0FBZVEsT0FBTyxDQUFDRCxPQUF2QixFQUFnQ0MsT0FBTyxDQUFDSCxNQUF4QyxDQVhkO0FBQUE7QUFBQSxtQkFhc0JOLEdBQUcsQ0FBQ1csSUFBSixFQWJ0Qjs7QUFBQTtBQWFRQyxZQUFBQSxLQWJSO0FBY0VDLFlBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZO0FBQUVGLGNBQUFBLEtBQUssRUFBTEE7QUFBRixhQUFaO0FBQ0FDLFlBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLFFBQVosRUFBc0JkLEdBQUcsQ0FBQ2UsT0FBMUIsRUFBbUNmLEdBQUcsQ0FBQ2dCLFNBQUosQ0FBY2hCLEdBQUcsQ0FBQ2UsT0FBbEIsQ0FBbkM7QUFFQVIsWUFBQUEsR0FBRyxDQUFDVSxLQUFKLEdBQVlqQixHQUFHLENBQUNpQixLQUFoQjtBQUNBUCxZQUFBQSxHQUFHLENBQUNPLEtBQUosR0FBWWpCLEdBQUcsQ0FBQ2lCLEtBQWhCO0FBRUlDLFlBQUFBLElBcEJOLEdBb0JrQmxCLEdBQUcsQ0FBQ21CLFFBQUosQ0FBYUMsc0JBQWIsQ0FBb0NsQixPQUFwQyxFQUE2QyxDQUE3QyxFQUFnRCxDQUFoRCxDQXBCbEI7QUFzQkVLLFlBQUFBLEdBQUcsQ0FBQ1ksUUFBSixDQUFhRSxTQUFiLENBQXVCSCxJQUF2QjtBQUNBUixZQUFBQSxHQUFHLENBQUNTLFFBQUosQ0FBYUUsU0FBYixDQUF1QkgsSUFBdkI7QUFFTUksWUFBQUEsZUF6QlIsR0F5QjBCQyxNQUFNLENBQUNDLElBQVAsQ0FBWXhCLEdBQUcsQ0FBQ21CLFFBQUosQ0FBYU0sUUFBekIsRUFBbUMsQ0FBbkMsQ0F6QjFCO0FBMEJFUCxZQUFBQSxJQUFJLEdBQUdsQixHQUFHLENBQUNtQixRQUFKLENBQWFPLHVCQUFiLENBQXFDSixlQUFyQyxDQUFQOztBQUVBZixZQUFBQSxHQUFHLENBQUNZLFFBQUosQ0FBYVEsTUFBYixDQUFvQkMsY0FBcEIsQ0FBbUMsTUFBbkMsSUFBNkMsVUFBQ0MsSUFBRCxFQUF3QjtBQUNuRWhCLGNBQUFBLE9BQU8sQ0FBQ0MsR0FBUjtBQUdBLGtCQUFNSSxJQUFTLEdBQUdYLEdBQUcsQ0FBQ1ksUUFBSixDQUFhVyxlQUFiLENBQTZCRCxJQUE3QixDQUFsQixDQUptRSxDQUtuRTs7QUFDQTdCLGNBQUFBLEdBQUcsQ0FBQ21CLFFBQUosQ0FBYUUsU0FBYixDQUF1QkgsSUFBdkI7QUFDRCxhQVBEOztBQVFBLGdCQUFJQSxJQUFKLEVBQVVYLEdBQUcsQ0FBQ1ksUUFBSixDQUFhRSxTQUFiLENBQXVCSCxJQUF2Qjs7QUFFVlIsWUFBQUEsR0FBRyxDQUFDUyxRQUFKLENBQWFRLE1BQWIsQ0FBb0JDLGNBQXBCLENBQW1DLE1BQW5DLElBQTZDLFVBQUNDLElBQUQsRUFBd0I7QUFDbkVoQixjQUFBQSxPQUFPLENBQUNDLEdBQVI7QUFHQSxrQkFBTUksSUFBUyxHQUFHUixHQUFHLENBQUNTLFFBQUosQ0FBYVcsZUFBYixDQUE2QkQsSUFBN0IsQ0FBbEIsQ0FKbUUsQ0FLbkU7O0FBQ0E3QixjQUFBQSxHQUFHLENBQUNtQixRQUFKLENBQWFFLFNBQWIsQ0FBdUJILElBQXZCO0FBQ0QsYUFQRDs7QUFRQSxnQkFBSUEsSUFBSixFQUFVUixHQUFHLENBQUNTLFFBQUosQ0FBYUUsU0FBYixDQUF1QkgsSUFBdkI7O0FBOUNaO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEciLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQmxvY2tDaGFpbiBmcm9tIFwiLi4vLi4vYmxvY2tjaGFpbi9ibG9ja2NoYWluQXBwXCI7XG5pbXBvcnQga2V5cGFpciBmcm9tIFwia2V5cGFpclwiO1xuaW1wb3J0IHsgbXVsdGlzaWdJbmZvIH0gZnJvbSBcIi4uLy4uL2Jsb2NrY2hhaW4vaW50ZXJmYWNlXCI7XG5pbXBvcnQgeyB0eXBlIH0gZnJvbSBcIi4uLy4uL2Jsb2NrY2hhaW4vcmVzcG9uZGVyXCI7XG52YXIgYWVzMjU2ID0gcmVxdWlyZShcImFlczI1NlwiKTtcblxubWFpbigpO1xuXG5hc3luYyBmdW5jdGlvbiBtYWluKCkge1xuICBjb25zdCBiYzEgPSBuZXcgQmxvY2tDaGFpbigpO1xuXG4gIGNvbnN0IGZyaWVuZHMgPSBbXTtcblxuICBjb25zdCBjeXBoZXIgPSBrZXlwYWlyKCk7XG4gIGZyaWVuZHMucHVzaChhZXMyNTYuZW5jcnlwdChcImZvcm1hdFwiLCBjeXBoZXIucHVibGljKSk7XG4gIGNvbnN0IGJjMiA9IG5ldyBCbG9ja0NoYWluKGN5cGhlci5wcml2YXRlLCBjeXBoZXIucHVibGljKTtcblxuICBjb25zdCBjeXBoZXIyID0ga2V5cGFpcigpO1xuICBmcmllbmRzLnB1c2goYWVzMjU2LmVuY3J5cHQoXCJmb3JtYXRcIiwgY3lwaGVyMi5wdWJsaWMpKTtcbiAgY29uc3QgYmMzID0gbmV3IEJsb2NrQ2hhaW4oY3lwaGVyMi5wcml2YXRlLCBjeXBoZXIyLnB1YmxpYyk7XG5cbiAgY29uc3QgYmxvY2sgPSBhd2FpdCBiYzEubWluZSgpO1xuICBjb25zb2xlLmxvZyh7IGJsb2NrIH0pO1xuICBjb25zb2xlLmxvZyhcImFtb3VudFwiLCBiYzEuYWRkcmVzcywgYmMxLm5vd0Ftb3VudChiYzEuYWRkcmVzcykpO1xuXG4gIGJjMi5jaGFpbiA9IGJjMS5jaGFpbjtcbiAgYmMzLmNoYWluID0gYmMxLmNoYWluO1xuXG4gIGxldCB0cmFuOiBhbnkgPSBiYzEubXVsdGlzaWcubWFrZU5ld011bHRpU2lnQWRkcmVzcyhmcmllbmRzLCAyLCAxKTtcblxuICBiYzIubXVsdGlzaWcucmVzcG9uZGVyKHRyYW4pO1xuICBiYzMubXVsdGlzaWcucmVzcG9uZGVyKHRyYW4pO1xuXG4gIGNvbnN0IG11bHRpc2lnQWRkcmVzcyA9IE9iamVjdC5rZXlzKGJjMS5tdWx0aXNpZy5tdWx0aVNpZylbMF07XG4gIHRyYW4gPSBiYzEubXVsdGlzaWcubWFrZU11bHRpU2lnVHJhbnNhY3Rpb24obXVsdGlzaWdBZGRyZXNzKTtcblxuICBiYzIubXVsdGlzaWcuZXZlbnRzLm9uTXVsdGlzaWdUcmFuW1widGVzdFwiXSA9IChpbmZvOiBtdWx0aXNpZ0luZm8pID0+IHtcbiAgICBjb25zb2xlLmxvZyhcbiAgICAgIGBiYzIubXVsdGlzaWcuZXZlbnRzLm9uTXVsdGlzaWdUcmFuW1widGVzdFwiXSA9IChpbmZvOiBtdWx0aXNpZ0luZm8pID0+IHtgXG4gICAgKTtcbiAgICBjb25zdCB0cmFuOiBhbnkgPSBiYzIubXVsdGlzaWcuYXBwcm92ZU11bHRpU2lnKGluZm8pO1xuICAgIC8vICAgY29uc29sZS5sb2coeyB0cmFuIH0pO1xuICAgIGJjMS5tdWx0aXNpZy5yZXNwb25kZXIodHJhbik7XG4gIH07XG4gIGlmICh0cmFuKSBiYzIubXVsdGlzaWcucmVzcG9uZGVyKHRyYW4pO1xuXG4gIGJjMy5tdWx0aXNpZy5ldmVudHMub25NdWx0aXNpZ1RyYW5bXCJ0ZXN0XCJdID0gKGluZm86IG11bHRpc2lnSW5mbykgPT4ge1xuICAgIGNvbnNvbGUubG9nKFxuICAgICAgYGJjMy5tdWx0aXNpZy5ldmVudHMub25NdWx0aXNpZ1RyYW5bXCJ0ZXN0XCJdID0gKGluZm86IG11bHRpc2lnSW5mbykgPT4ge2BcbiAgICApO1xuICAgIGNvbnN0IHRyYW46IGFueSA9IGJjMy5tdWx0aXNpZy5hcHByb3ZlTXVsdGlTaWcoaW5mbyk7XG4gICAgLy8gICBjb25zb2xlLmxvZyh7IHRyYW4gfSk7XG4gICAgYmMxLm11bHRpc2lnLnJlc3BvbmRlcih0cmFuKTtcbiAgfTtcbiAgaWYgKHRyYW4pIGJjMy5tdWx0aXNpZy5yZXNwb25kZXIodHJhbik7XG59XG4iXX0=