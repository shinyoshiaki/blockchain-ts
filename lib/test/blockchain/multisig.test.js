"use strict";

var _ava = _interopRequireDefault(require("ava"));

var _blockchainApp = _interopRequireDefault(require("../../blockchain/blockchainApp"));

var _responder = require("../../blockchain/responder");

var _debug = require("../../util/debug");

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
            //マルチシグトランザクションを作る役(作成役とする)
            bc1 = new _blockchainApp.default(_debug.sec_c, _debug.pub_c); //シェアキー共有者

            friends = [];
            cypher = {
              public: _debug.pub_a,
              private: _debug.sec_a
            };
            friends.push(aes256.encrypt("format", cypher.public)); //承認者１

            bc2 = new _blockchainApp.default(cypher.private, cypher.public);
            cypher2 = {
              public: _debug.pub_b,
              private: _debug.sec_b
            };
            friends.push(aes256.encrypt("format", cypher2.public)); //承認者２

            bc3 = new _blockchainApp.default(cypher2.private, cypher2.public); //作成役がマイニングしてトークンを稼ぐ

            _context.next = 10;
            return bc1.mine();

          case 10:
            block = _context.sent;
            console.log({
              block: block
            });
            console.log("amount", bc1.address, bc1.nowAmount(bc1.address)); //作成役と承認者のブロックチェーンのフォークを解決

            bc2.chain = bc1.chain;
            bc3.chain = bc1.chain;

            bc1.multisig.events.onMultisigTranDone["test multisig"] = function () {
              console.log("multisig test done");
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


            tran = bc1.multisig.makeNewMultiSigAddress(friends, 3, 1); //承認者がマルチシグアドレスのトランザクションをresponderに渡す

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

          case 25:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
  return _main.apply(this, arguments);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90ZXN0L2Jsb2NrY2hhaW4vbXVsdGlzaWcudGVzdC50cyJdLCJuYW1lcyI6WyJhZXMyNTYiLCJyZXF1aXJlIiwibWFpbiIsImJjMSIsIkJsb2NrQ2hhaW4iLCJzZWNfYyIsInB1Yl9jIiwiZnJpZW5kcyIsImN5cGhlciIsInB1YmxpYyIsInB1Yl9hIiwicHJpdmF0ZSIsInNlY19hIiwicHVzaCIsImVuY3J5cHQiLCJiYzIiLCJjeXBoZXIyIiwicHViX2IiLCJzZWNfYiIsImJjMyIsIm1pbmUiLCJibG9jayIsImNvbnNvbGUiLCJsb2ciLCJhZGRyZXNzIiwibm93QW1vdW50IiwiY2hhaW4iLCJtdWx0aXNpZyIsImV2ZW50cyIsIm9uTXVsdGlzaWdUcmFuRG9uZSIsInRlc3QiLCJwYXNzIiwib25NdWx0aXNpZ1RyYW4iLCJpbmZvIiwidHJhbiIsImFwcHJvdmVNdWx0aVNpZyIsInJlc3BvbmRlciIsInJ1blJQQyIsInR5cGUiLCJ0eXBlUlBDIiwiVFJBTlNBQ1JJT04iLCJib2R5IiwibWFrZU5ld011bHRpU2lnQWRkcmVzcyIsIm11bHRpc2lnQWRkcmVzcyIsIk9iamVjdCIsImtleXMiLCJtdWx0aVNpZyIsIm1ha2VNdWx0aVNpZ1RyYW5zYWN0aW9uIl0sIm1hcHBpbmdzIjoiOztBQUFBOztBQUNBOztBQUVBOztBQUNBOzs7Ozs7OztBQUNBLElBQUlBLE1BQU0sR0FBR0MsT0FBTyxDQUFDLFFBQUQsQ0FBcEI7O0FBRUFDLElBQUk7O1NBRVdBLEk7Ozs7Ozs7MEJBQWY7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ0U7QUFDTUMsWUFBQUEsR0FGUixHQUVjLElBQUlDLHNCQUFKLENBQWVDLFlBQWYsRUFBc0JDLFlBQXRCLENBRmQsRUFJRTs7QUFDTUMsWUFBQUEsT0FMUixHQUtrQixFQUxsQjtBQU9RQyxZQUFBQSxNQVBSLEdBT2lCO0FBQUVDLGNBQUFBLE1BQU0sRUFBRUMsWUFBVjtBQUFpQkMsY0FBQUEsT0FBTyxFQUFFQztBQUEx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Q0U7O0FBQ0FRLFlBQUFBLEdBQUcsQ0FBQ3FCLFNBQUosQ0FBY0MsTUFBZCxDQUFxQjtBQUFFQyxjQUFBQSxJQUFJLEVBQUVDLG1CQUFRQyxXQUFoQjtBQUE2QkMsY0FBQUEsSUFBSSxFQUFFUDtBQUFuQyxhQUFyQjtBQUNBZixZQUFBQSxHQUFHLENBQUNpQixTQUFKLENBQWNDLE1BQWQsQ0FBcUI7QUFBRUMsY0FBQUEsSUFBSSxFQUFFQyxtQkFBUUMsV0FBaEI7QUFBNkJDLGNBQUFBLElBQUksRUFBRVA7QUFBbkMsYUFBckI7QUFFTVMsWUFBQUEsZUFuRFIsR0FtRDBCQyxNQUFNLENBQUNDLElBQVAsQ0FBWTFDLEdBQUcsQ0FBQ3dCLFFBQUosQ0FBYW1CLFFBQXpCLEVBQW1DLENBQW5DLENBbkQxQixFQW9ERTs7QUFDQVosWUFBQUEsSUFBSSxHQUFHL0IsR0FBRyxDQUFDd0IsUUFBSixDQUFhb0IsdUJBQWIsQ0FBcUNKLGVBQXJDLENBQVAsQ0FyREYsQ0F1REU7O0FBQ0EsZ0JBQUlULElBQUosRUFBVW5CLEdBQUcsQ0FBQ3FCLFNBQUosQ0FBY0MsTUFBZCxDQUFxQjtBQUFFQyxjQUFBQSxJQUFJLEVBQUVDLG1CQUFRQyxXQUFoQjtBQUE2QkMsY0FBQUEsSUFBSSxFQUFFUDtBQUFuQyxhQUFyQjtBQUNWLGdCQUFJQSxJQUFKLEVBQVVmLEdBQUcsQ0FBQ2lCLFNBQUosQ0FBY0MsTUFBZCxDQUFxQjtBQUFFQyxjQUFBQSxJQUFJLEVBQUVDLG1CQUFRQyxXQUFoQjtBQUE2QkMsY0FBQUEsSUFBSSxFQUFFUDtBQUFuQyxhQUFyQjs7QUF6RFo7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0ZXN0IGZyb20gXCJhdmFcIjtcbmltcG9ydCBCbG9ja0NoYWluIGZyb20gXCIuLi8uLi9ibG9ja2NoYWluL2Jsb2NrY2hhaW5BcHBcIjtcbmltcG9ydCB7IG11bHRpc2lnSW5mbyB9IGZyb20gXCIuLi8uLi9ibG9ja2NoYWluL2ludGVyZmFjZVwiO1xuaW1wb3J0IHsgdHlwZVJQQyB9IGZyb20gXCIuLi8uLi9ibG9ja2NoYWluL3Jlc3BvbmRlclwiO1xuaW1wb3J0IHsgcHViX2EsIHNlY19hLCBwdWJfYiwgc2VjX2IsIHNlY19jLCBwdWJfYyB9IGZyb20gXCIuLi8uLi91dGlsL2RlYnVnXCI7XG52YXIgYWVzMjU2ID0gcmVxdWlyZShcImFlczI1NlwiKTtcblxubWFpbigpO1xuXG5hc3luYyBmdW5jdGlvbiBtYWluKCkge1xuICAvL+ODnuODq+ODgeOCt+OCsOODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OCkuS9nOOCi+W9uSjkvZzmiJDlvbnjgajjgZnjgospXG4gIGNvbnN0IGJjMSA9IG5ldyBCbG9ja0NoYWluKHNlY19jLCBwdWJfYyk7XG5cbiAgLy/jgrfjgqfjgqLjgq3jg7zlhbHmnInogIVcbiAgY29uc3QgZnJpZW5kcyA9IFtdO1xuXG4gIGNvbnN0IGN5cGhlciA9IHsgcHVibGljOiBwdWJfYSwgcHJpdmF0ZTogc2VjX2EgfTtcbiAgZnJpZW5kcy5wdXNoKGFlczI1Ni5lbmNyeXB0KFwiZm9ybWF0XCIsIGN5cGhlci5wdWJsaWMpKTtcbiAgLy/mib/oqo3ogIXvvJFcbiAgY29uc3QgYmMyID0gbmV3IEJsb2NrQ2hhaW4oY3lwaGVyLnByaXZhdGUsIGN5cGhlci5wdWJsaWMpO1xuXG4gIGNvbnN0IGN5cGhlcjIgPSB7IHB1YmxpYzogcHViX2IsIHByaXZhdGU6IHNlY19iIH07XG4gIGZyaWVuZHMucHVzaChhZXMyNTYuZW5jcnlwdChcImZvcm1hdFwiLCBjeXBoZXIyLnB1YmxpYykpO1xuICAvL+aJv+iqjeiAhe+8klxuICBjb25zdCBiYzMgPSBuZXcgQmxvY2tDaGFpbihjeXBoZXIyLnByaXZhdGUsIGN5cGhlcjIucHVibGljKTtcblxuICAvL+S9nOaIkOW9ueOBjOODnuOCpOODi+ODs+OCsOOBl+OBpuODiOODvOOCr+ODs+OCkueovOOBkFxuICBjb25zdCBibG9jayA9IGF3YWl0IGJjMS5taW5lKCk7XG4gIGNvbnNvbGUubG9nKHsgYmxvY2sgfSk7XG4gIGNvbnNvbGUubG9nKFwiYW1vdW50XCIsIGJjMS5hZGRyZXNzLCBiYzEubm93QW1vdW50KGJjMS5hZGRyZXNzKSk7XG5cbiAgLy/kvZzmiJDlvbnjgajmib/oqo3ogIXjga7jg5bjg63jg4Pjgq/jg4Hjgqfjg7zjg7Pjga7jg5Xjgqnjg7zjgq/jgpLop6PmsbpcbiAgYmMyLmNoYWluID0gYmMxLmNoYWluO1xuICBiYzMuY2hhaW4gPSBiYzEuY2hhaW47XG5cbiAgYmMxLm11bHRpc2lnLmV2ZW50cy5vbk11bHRpc2lnVHJhbkRvbmVbXCJ0ZXN0IG11bHRpc2lnXCJdID0gKCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwibXVsdGlzaWcgdGVzdCBkb25lXCIpO1xuICAgIHRlc3QoXCJtdWx0aXNpZ1wiLCB0ZXN0ID0+IHtcbiAgICAgIHRlc3QucGFzcygpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8v5om/6KqN6ICF44GM5om/6KqN44GZ44KL44Gf44KB44Gu44Kz44O844Or44OQ44OD44Kv44KS55So5oSPXG4gIGJjMi5tdWx0aXNpZy5ldmVudHMub25NdWx0aXNpZ1RyYW5bXCJ0ZXN0IGFwcHJvdmVcIl0gPSAoaW5mbzogbXVsdGlzaWdJbmZvKSA9PiB7XG4gICAgY29uc3QgdHJhbiA9IGJjMi5tdWx0aXNpZy5hcHByb3ZlTXVsdGlTaWcoaW5mbyk7XG4gICAgLy/jg57jg6vjg4HjgrfjgrDjga7mib/oqo1cbiAgICBpZiAodHJhbikgYmMxLnJlc3BvbmRlci5ydW5SUEMoeyB0eXBlOiB0eXBlUlBDLlRSQU5TQUNSSU9OLCBib2R5OiB0cmFuIH0pO1xuICB9O1xuICBiYzMubXVsdGlzaWcuZXZlbnRzLm9uTXVsdGlzaWdUcmFuW1widGVzdCBhcHByb3ZlXCJdID0gKGluZm86IG11bHRpc2lnSW5mbykgPT4ge1xuICAgIGNvbnN0IHRyYW4gPSBiYzMubXVsdGlzaWcuYXBwcm92ZU11bHRpU2lnKGluZm8pO1xuICAgIGlmICh0cmFuKSBiYzEucmVzcG9uZGVyLnJ1blJQQyh7IHR5cGU6IHR5cGVSUEMuVFJBTlNBQ1JJT04sIGJvZHk6IHRyYW4gfSk7XG4gIH07XG5cbiAgLy/kvZzmiJDlvbnjgYzjg57jg6vjg4HjgrfjgrDjgqLjg4njg6zjgrnjgpLnlJ/miJBcbiAgbGV0IHRyYW46IGFueSA9IGJjMS5tdWx0aXNpZy5tYWtlTmV3TXVsdGlTaWdBZGRyZXNzKGZyaWVuZHMsIDMsIDEpO1xuXG4gIC8v5om/6KqN6ICF44GM44Oe44Or44OB44K344Kw44Ki44OJ44Os44K544Gu44OI44Op44Oz44K244Kv44K344On44Oz44KScmVzcG9uZGVy44Gr5rih44GZXG4gIGJjMi5yZXNwb25kZXIucnVuUlBDKHsgdHlwZTogdHlwZVJQQy5UUkFOU0FDUklPTiwgYm9keTogdHJhbiB9KTtcbiAgYmMzLnJlc3BvbmRlci5ydW5SUEMoeyB0eXBlOiB0eXBlUlBDLlRSQU5TQUNSSU9OLCBib2R5OiB0cmFuIH0pO1xuXG4gIGNvbnN0IG11bHRpc2lnQWRkcmVzcyA9IE9iamVjdC5rZXlzKGJjMS5tdWx0aXNpZy5tdWx0aVNpZylbMF07XG4gIC8v44Oe44Or44OB44K344Kw44OI44Op44Oz44K244Kv44K344On44Oz44KS5L2c5oiQXG4gIHRyYW4gPSBiYzEubXVsdGlzaWcubWFrZU11bHRpU2lnVHJhbnNhY3Rpb24obXVsdGlzaWdBZGRyZXNzKTtcblxuICAvL+ODnuODq+ODgeOCt+OCsOODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OCknJlc3BvbmRlcuOBq+a4oeOBmeOAglxuICBpZiAodHJhbikgYmMyLnJlc3BvbmRlci5ydW5SUEMoeyB0eXBlOiB0eXBlUlBDLlRSQU5TQUNSSU9OLCBib2R5OiB0cmFuIH0pO1xuICBpZiAodHJhbikgYmMzLnJlc3BvbmRlci5ydW5SUEMoeyB0eXBlOiB0eXBlUlBDLlRSQU5TQUNSSU9OLCBib2R5OiB0cmFuIH0pO1xufVxuIl19