"use strict";

var _ava = _interopRequireDefault(require("ava"));

var _blockchainApp = _interopRequireDefault(require("../../blockchain/blockchainApp"));

var _responder = require("../../blockchain/responder");

var _cypher = _interopRequireDefault(require("../../blockchain/crypto/cypher"));

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
    var bc1, friends, cypher, bc2, cypher2, bc3, tran, multisigAddress;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            //マルチシグトランザクションを作る役(作成役とする)
            bc1 = new _blockchainApp.default(); //シェアキー共有者

            friends = [];
            cypher = new _cypher.default();
            friends.push(aes256.encrypt("format", cypher.pubKey)); //承認者１

            bc2 = new _blockchainApp.default({
              phrase: cypher.phrase
            });
            cypher2 = new _cypher.default();
            friends.push(aes256.encrypt("format", cypher2.pubKey)); //承認者２

            bc3 = new _blockchainApp.default({
              phrase: cypher2.phrase
            }); //作成役がマイニングしてトークンを稼ぐ

            _context.next = 10;
            return bc1.mine();

          case 10:
            //作成役と承認者のブロックチェーンのフォークを解決
            bc2.chain = bc1.chain;
            bc3.chain = bc1.chain;

            bc1.multisig.events.onMultisigTranDone["test multisig"] = function () {
              (0, _ava.default)("multisig", function (test) {
                test.pass();
              });
            }; //承認者が承認するためのコールバックを用意


            bc2.multisig.events.onMultisigTran["test approve"] = function (info) {
              var tran = bc2.multisig.approveMultiSig(info); //マルチシグの承認

              if (tran) bc1.responder.runRPC({
                type: _responder.typeRPC.TRANSACRION,
                body: tran
              });
            };

            bc3.multisig.events.onMultisigTran["test approve"] = function (info) {
              var tran = bc3.multisig.approveMultiSig(info);
              if (tran) bc1.responder.runRPC({
                type: _responder.typeRPC.TRANSACRION,
                body: tran
              });
            }; //作成役がマルチシグアドレスを生成


            tran = bc1.multisig.makeNewMultiSigAddress(friends, "format", 3, 1); //承認者がマルチシグアドレスのトランザクションをresponderに渡す

            bc2.responder.runRPC({
              type: _responder.typeRPC.TRANSACRION,
              body: tran
            });
            bc3.responder.runRPC({
              type: _responder.typeRPC.TRANSACRION,
              body: tran
            });
            multisigAddress = Object.keys(bc1.multisig.multiSig)[0]; //マルチシグトランザクションを作成

            tran = bc1.multisig.makeMultiSigTransaction(multisigAddress); //マルチシグトランザクションをresponderに渡す。

            if (tran) bc2.responder.runRPC({
              type: _responder.typeRPC.TRANSACRION,
              body: tran
            });
            if (tran) bc3.responder.runRPC({
              type: _responder.typeRPC.TRANSACRION,
              body: tran
            });

          case 22:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
  return _main.apply(this, arguments);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90ZXN0L2Jsb2NrY2hhaW4vbXVsdGlzaWcudGVzdC50cyJdLCJuYW1lcyI6WyJhZXMyNTYiLCJyZXF1aXJlIiwibWFpbiIsImJjMSIsIkJsb2NrQ2hhaW4iLCJmcmllbmRzIiwiY3lwaGVyIiwiQ3lwaGVyIiwicHVzaCIsImVuY3J5cHQiLCJwdWJLZXkiLCJiYzIiLCJwaHJhc2UiLCJjeXBoZXIyIiwiYmMzIiwibWluZSIsImNoYWluIiwibXVsdGlzaWciLCJldmVudHMiLCJvbk11bHRpc2lnVHJhbkRvbmUiLCJ0ZXN0IiwicGFzcyIsIm9uTXVsdGlzaWdUcmFuIiwiaW5mbyIsInRyYW4iLCJhcHByb3ZlTXVsdGlTaWciLCJyZXNwb25kZXIiLCJydW5SUEMiLCJ0eXBlIiwidHlwZVJQQyIsIlRSQU5TQUNSSU9OIiwiYm9keSIsIm1ha2VOZXdNdWx0aVNpZ0FkZHJlc3MiLCJtdWx0aXNpZ0FkZHJlc3MiLCJPYmplY3QiLCJrZXlzIiwibXVsdGlTaWciLCJtYWtlTXVsdGlTaWdUcmFuc2FjdGlvbiJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7QUFDQTs7QUFFQTs7QUFDQTs7Ozs7Ozs7QUFDQSxJQUFJQSxNQUFNLEdBQUdDLE9BQU8sQ0FBQyxRQUFELENBQXBCOztBQUVBQyxJQUFJOztTQUVXQSxJOzs7Ozs7OzBCQUFmO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNFO0FBQ01DLFlBQUFBLEdBRlIsR0FFYyxJQUFJQyxzQkFBSixFQUZkLEVBSUU7O0FBQ01DLFlBQUFBLE9BTFIsR0FLa0IsRUFMbEI7QUFPUUMsWUFBQUEsTUFQUixHQU9pQixJQUFJQyxlQUFKLEVBUGpCO0FBUUVGLFlBQUFBLE9BQU8sQ0FBQ0csSUFBUixDQUFhUixNQUFNLENBQUNTLE9BQVAsQ0FBZSxRQUFmLEVBQXlCSCxNQUFNLENBQUNJLE1BQWhDLENBQWIsRUFSRixDQVNFOztBQUNNQyxZQUFBQSxHQVZSLEdBVWMsSUFBSVAsc0JBQUosQ0FBZTtBQUFFUSxjQUFB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QUFHLENBQUNlLFNBQUosQ0FBY0MsTUFBZCxDQUFxQjtBQUFFQyxjQUFBQSxJQUFJLEVBQUVDLG1CQUFRQyxXQUFoQjtBQUE2QkMsY0FBQUEsSUFBSSxFQUFFUDtBQUFuQyxhQUFyQjtBQUNWLGdCQUFJQSxJQUFKLEVBQVVWLEdBQUcsQ0FBQ1ksU0FBSixDQUFjQyxNQUFkLENBQXFCO0FBQUVDLGNBQUFBLElBQUksRUFBRUMsbUJBQVFDLFdBQWhCO0FBQTZCQyxjQUFBQSxJQUFJLEVBQUVQO0FBQW5DLGFBQXJCOztBQXREWjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHRlc3QgZnJvbSBcImF2YVwiO1xuaW1wb3J0IEJsb2NrQ2hhaW4gZnJvbSBcIi4uLy4uL2Jsb2NrY2hhaW4vYmxvY2tjaGFpbkFwcFwiO1xuaW1wb3J0IHsgbXVsdGlzaWdJbmZvIH0gZnJvbSBcIi4uLy4uL2Jsb2NrY2hhaW4vaW50ZXJmYWNlXCI7XG5pbXBvcnQgeyB0eXBlUlBDIH0gZnJvbSBcIi4uLy4uL2Jsb2NrY2hhaW4vcmVzcG9uZGVyXCI7XG5pbXBvcnQgQ3lwaGVyIGZyb20gXCIuLi8uLi9ibG9ja2NoYWluL2NyeXB0by9jeXBoZXJcIjtcbnZhciBhZXMyNTYgPSByZXF1aXJlKFwiYWVzMjU2XCIpO1xuXG5tYWluKCk7XG5cbmFzeW5jIGZ1bmN0aW9uIG1haW4oKSB7XG4gIC8v44Oe44Or44OB44K344Kw44OI44Op44Oz44K244Kv44K344On44Oz44KS5L2c44KL5b25KOS9nOaIkOW9ueOBqOOBmeOCiylcbiAgY29uc3QgYmMxID0gbmV3IEJsb2NrQ2hhaW4oKTtcblxuICAvL+OCt+OCp+OCouOCreODvOWFseacieiAhVxuICBjb25zdCBmcmllbmRzID0gW107XG5cbiAgY29uc3QgY3lwaGVyID0gbmV3IEN5cGhlcigpO1xuICBmcmllbmRzLnB1c2goYWVzMjU2LmVuY3J5cHQoXCJmb3JtYXRcIiwgY3lwaGVyLnB1YktleSkpO1xuICAvL+aJv+iqjeiAhe+8kVxuICBjb25zdCBiYzIgPSBuZXcgQmxvY2tDaGFpbih7IHBocmFzZTogY3lwaGVyLnBocmFzZSB9KTtcblxuICBjb25zdCBjeXBoZXIyID0gbmV3IEN5cGhlcigpO1xuICBmcmllbmRzLnB1c2goYWVzMjU2LmVuY3J5cHQoXCJmb3JtYXRcIiwgY3lwaGVyMi5wdWJLZXkpKTtcbiAgLy/mib/oqo3ogIXvvJJcbiAgY29uc3QgYmMzID0gbmV3IEJsb2NrQ2hhaW4oeyBwaHJhc2U6IGN5cGhlcjIucGhyYXNlIH0pO1xuXG4gIC8v5L2c5oiQ5b2544GM44Oe44Kk44OL44Oz44Kw44GX44Gm44OI44O844Kv44Oz44KS56i844GQXG4gIGF3YWl0IGJjMS5taW5lKCk7XG5cbiAgLy/kvZzmiJDlvbnjgajmib/oqo3ogIXjga7jg5bjg63jg4Pjgq/jg4Hjgqfjg7zjg7Pjga7jg5Xjgqnjg7zjgq/jgpLop6PmsbpcbiAgYmMyLmNoYWluID0gYmMxLmNoYWluO1xuICBiYzMuY2hhaW4gPSBiYzEuY2hhaW47XG5cbiAgYmMxLm11bHRpc2lnLmV2ZW50cy5vbk11bHRpc2lnVHJhbkRvbmVbXCJ0ZXN0IG11bHRpc2lnXCJdID0gKCkgPT4ge1xuICAgIHRlc3QoXCJtdWx0aXNpZ1wiLCB0ZXN0ID0+IHtcbiAgICAgIHRlc3QucGFzcygpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8v5om/6KqN6ICF44GM5om/6KqN44GZ44KL44Gf44KB44Gu44Kz44O844Or44OQ44OD44Kv44KS55So5oSPXG4gIGJjMi5tdWx0aXNpZy5ldmVudHMub25NdWx0aXNpZ1RyYW5bXCJ0ZXN0IGFwcHJvdmVcIl0gPSAoaW5mbzogbXVsdGlzaWdJbmZvKSA9PiB7XG4gICAgY29uc3QgdHJhbiA9IGJjMi5tdWx0aXNpZy5hcHByb3ZlTXVsdGlTaWcoaW5mbyk7XG4gICAgLy/jg57jg6vjg4HjgrfjgrDjga7mib/oqo1cbiAgICBpZiAodHJhbikgYmMxLnJlc3BvbmRlci5ydW5SUEMoeyB0eXBlOiB0eXBlUlBDLlRSQU5TQUNSSU9OLCBib2R5OiB0cmFuIH0pO1xuICB9O1xuICBiYzMubXVsdGlzaWcuZXZlbnRzLm9uTXVsdGlzaWdUcmFuW1widGVzdCBhcHByb3ZlXCJdID0gKGluZm86IG11bHRpc2lnSW5mbykgPT4ge1xuICAgIGNvbnN0IHRyYW4gPSBiYzMubXVsdGlzaWcuYXBwcm92ZU11bHRpU2lnKGluZm8pO1xuICAgIGlmICh0cmFuKSBiYzEucmVzcG9uZGVyLnJ1blJQQyh7IHR5cGU6IHR5cGVSUEMuVFJBTlNBQ1JJT04sIGJvZHk6IHRyYW4gfSk7XG4gIH07XG5cbiAgLy/kvZzmiJDlvbnjgYzjg57jg6vjg4HjgrfjgrDjgqLjg4njg6zjgrnjgpLnlJ/miJBcbiAgbGV0IHRyYW46IGFueSA9IGJjMS5tdWx0aXNpZy5tYWtlTmV3TXVsdGlTaWdBZGRyZXNzKGZyaWVuZHMsIFwiZm9ybWF0XCIsIDMsIDEpO1xuXG4gIC8v5om/6KqN6ICF44GM44Oe44Or44OB44K344Kw44Ki44OJ44Os44K544Gu44OI44Op44Oz44K244Kv44K344On44Oz44KScmVzcG9uZGVy44Gr5rih44GZXG4gIGJjMi5yZXNwb25kZXIucnVuUlBDKHsgdHlwZTogdHlwZVJQQy5UUkFOU0FDUklPTiwgYm9keTogdHJhbiB9KTtcbiAgYmMzLnJlc3BvbmRlci5ydW5SUEMoeyB0eXBlOiB0eXBlUlBDLlRSQU5TQUNSSU9OLCBib2R5OiB0cmFuIH0pO1xuXG4gIGNvbnN0IG11bHRpc2lnQWRkcmVzcyA9IE9iamVjdC5rZXlzKGJjMS5tdWx0aXNpZy5tdWx0aVNpZylbMF07XG4gIC8v44Oe44Or44OB44K344Kw44OI44Op44Oz44K244Kv44K344On44Oz44KS5L2c5oiQXG4gIHRyYW4gPSBiYzEubXVsdGlzaWcubWFrZU11bHRpU2lnVHJhbnNhY3Rpb24obXVsdGlzaWdBZGRyZXNzKTtcblxuICAvL+ODnuODq+ODgeOCt+OCsOODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OCknJlc3BvbmRlcuOBq+a4oeOBmeOAglxuICBpZiAodHJhbikgYmMyLnJlc3BvbmRlci5ydW5SUEMoeyB0eXBlOiB0eXBlUlBDLlRSQU5TQUNSSU9OLCBib2R5OiB0cmFuIH0pO1xuICBpZiAodHJhbikgYmMzLnJlc3BvbmRlci5ydW5SUEMoeyB0eXBlOiB0eXBlUlBDLlRSQU5TQUNSSU9OLCBib2R5OiB0cmFuIH0pO1xufVxuIl19