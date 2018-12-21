"use strict";

var _ava = _interopRequireDefault(require("ava"));

var _blockchainApp = _interopRequireDefault(require("../../blockchain/blockchainApp"));

var _responder = require("../../blockchain/responder");

var _cypher = _interopRequireDefault(require("../../blockchain/crypto/cypher"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var aes256 = require("aes256");

console.log("multisig test"); //マルチシグトランザクションを作る役(作成役とする)

var bc1 = new _blockchainApp.default(); //シェアキー共有者

var friends = [];
var cypher = new _cypher.default();
friends.push(aes256.encrypt("format", cypher.pubKey)); //承認者１

var bc2 = new _blockchainApp.default({
  phrase: cypher.phrase
});
var cypher2 = new _cypher.default();
friends.push(aes256.encrypt("format", cypher2.pubKey)); //承認者２

var bc3 = new _blockchainApp.default({
  phrase: cypher2.phrase
});

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
};

main();

function main() {
  return _main.apply(this, arguments);
}

function _main() {
  _main = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee() {
    var tran, multisigAddress;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return bc1.mine();

          case 2:
            //作成役と承認者のブロックチェーンのフォークを解決
            bc2.chain = bc1.chain;
            bc3.chain = bc1.chain; //作成役がマルチシグアドレスを生成

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

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
  return _main.apply(this, arguments);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90ZXN0L2Jsb2NrY2hhaW4vbXVsdGlzaWcudGVzdC50cyJdLCJuYW1lcyI6WyJhZXMyNTYiLCJyZXF1aXJlIiwiY29uc29sZSIsImxvZyIsImJjMSIsIkJsb2NrQ2hhaW4iLCJmcmllbmRzIiwiY3lwaGVyIiwiQ3lwaGVyIiwicHVzaCIsImVuY3J5cHQiLCJwdWJLZXkiLCJiYzIiLCJwaHJhc2UiLCJjeXBoZXIyIiwiYmMzIiwibXVsdGlzaWciLCJldmVudHMiLCJvbk11bHRpc2lnVHJhbkRvbmUiLCJ0ZXN0IiwicGFzcyIsIm9uTXVsdGlzaWdUcmFuIiwiaW5mbyIsInRyYW4iLCJhcHByb3ZlTXVsdGlTaWciLCJyZXNwb25kZXIiLCJydW5SUEMiLCJ0eXBlIiwidHlwZVJQQyIsIlRSQU5TQUNSSU9OIiwiYm9keSIsIm1haW4iLCJtaW5lIiwiY2hhaW4iLCJtYWtlTmV3TXVsdGlTaWdBZGRyZXNzIiwibXVsdGlzaWdBZGRyZXNzIiwiT2JqZWN0Iiwia2V5cyIsIm11bHRpU2lnIiwibWFrZU11bHRpU2lnVHJhbnNhY3Rpb24iXSwibWFwcGluZ3MiOiI7O0FBQUE7O0FBQ0E7O0FBRUE7O0FBQ0E7Ozs7Ozs7O0FBQ0EsSUFBTUEsTUFBTSxHQUFHQyxPQUFPLENBQUMsUUFBRCxDQUF0Qjs7QUFFQUMsT0FBTyxDQUFDQyxHQUFSLENBQVksZUFBWixFLENBQ0E7O0FBQ0EsSUFBTUMsR0FBRyxHQUFHLElBQUlDLHNCQUFKLEVBQVosQyxDQUVBOztBQUNBLElBQU1DLE9BQWMsR0FBRyxFQUF2QjtBQUVBLElBQU1DLE1BQU0sR0FBRyxJQUFJQyxlQUFKLEVBQWY7QUFDQUYsT0FBTyxDQUFDRyxJQUFSLENBQWFULE1BQU0sQ0FBQ1UsT0FBUCxDQUFlLFFBQWYsRUFBeUJILE1BQU0sQ0FBQ0ksTUFBaEMsQ0FBYixFLENBQ0E7O0FBQ0EsSUFBTUMsR0FBRyxHQUFHLElBQUlQLHNCQUFKLENBQWU7QUFBRVEsRUFBQUEsTUFBTSxFQUFFTixNQUFNLENB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QUFjQyxNQUFkLENBQXFCO0FBQUVDLGNBQUFBLElBQUksRUFBRUMsbUJBQVFDLFdBQWhCO0FBQTZCQyxjQUFBQSxJQUFJLEVBQUVQO0FBQW5DLGFBQXJCO0FBQ1YsZ0JBQUlBLElBQUosRUFBVVIsR0FBRyxDQUFDVSxTQUFKLENBQWNDLE1BQWQsQ0FBcUI7QUFBRUMsY0FBQUEsSUFBSSxFQUFFQyxtQkFBUUMsV0FBaEI7QUFBNkJDLGNBQUFBLElBQUksRUFBRVA7QUFBbkMsYUFBckI7O0FBckJaO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEciLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdGVzdCBmcm9tIFwiYXZhXCI7XG5pbXBvcnQgQmxvY2tDaGFpbiBmcm9tIFwiLi4vLi4vYmxvY2tjaGFpbi9ibG9ja2NoYWluQXBwXCI7XG5pbXBvcnQgeyBtdWx0aXNpZ0luZm8gfSBmcm9tIFwiLi4vLi4vYmxvY2tjaGFpbi9pbnRlcmZhY2VcIjtcbmltcG9ydCB7IHR5cGVSUEMgfSBmcm9tIFwiLi4vLi4vYmxvY2tjaGFpbi9yZXNwb25kZXJcIjtcbmltcG9ydCBDeXBoZXIgZnJvbSBcIi4uLy4uL2Jsb2NrY2hhaW4vY3J5cHRvL2N5cGhlclwiO1xuY29uc3QgYWVzMjU2ID0gcmVxdWlyZShcImFlczI1NlwiKTtcblxuY29uc29sZS5sb2coXCJtdWx0aXNpZyB0ZXN0XCIpO1xuLy/jg57jg6vjg4HjgrfjgrDjg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgpLkvZzjgovlvbko5L2c5oiQ5b2544Go44GZ44KLKVxuY29uc3QgYmMxID0gbmV3IEJsb2NrQ2hhaW4oKTtcblxuLy/jgrfjgqfjgqLjgq3jg7zlhbHmnInogIVcbmNvbnN0IGZyaWVuZHM6IGFueVtdID0gW107XG5cbmNvbnN0IGN5cGhlciA9IG5ldyBDeXBoZXIoKTtcbmZyaWVuZHMucHVzaChhZXMyNTYuZW5jcnlwdChcImZvcm1hdFwiLCBjeXBoZXIucHViS2V5KSk7XG4vL+aJv+iqjeiAhe+8kVxuY29uc3QgYmMyID0gbmV3IEJsb2NrQ2hhaW4oeyBwaHJhc2U6IGN5cGhlci5waHJhc2UgfSk7XG5cbmNvbnN0IGN5cGhlcjIgPSBuZXcgQ3lwaGVyKCk7XG5mcmllbmRzLnB1c2goYWVzMjU2LmVuY3J5cHQoXCJmb3JtYXRcIiwgY3lwaGVyMi5wdWJLZXkpKTtcbi8v5om/6KqN6ICF77ySXG5jb25zdCBiYzMgPSBuZXcgQmxvY2tDaGFpbih7IHBocmFzZTogY3lwaGVyMi5waHJhc2UgfSk7XG5cbmJjMS5tdWx0aXNpZy5ldmVudHMub25NdWx0aXNpZ1RyYW5Eb25lW1widGVzdCBtdWx0aXNpZ1wiXSA9ICgpID0+IHtcbiAgdGVzdChcIm11bHRpc2lnXCIsIHRlc3QgPT4ge1xuICAgIHRlc3QucGFzcygpO1xuICB9KTtcbn07XG5cbi8v5om/6KqN6ICF44GM5om/6KqN44GZ44KL44Gf44KB44Gu44Kz44O844Or44OQ44OD44Kv44KS55So5oSPXG5iYzIubXVsdGlzaWcuZXZlbnRzLm9uTXVsdGlzaWdUcmFuW1widGVzdCBhcHByb3ZlXCJdID0gKGluZm86IG11bHRpc2lnSW5mbykgPT4ge1xuICBjb25zdCB0cmFuID0gYmMyLm11bHRpc2lnLmFwcHJvdmVNdWx0aVNpZyhpbmZvKTtcbiAgLy/jg57jg6vjg4HjgrfjgrDjga7mib/oqo1cbiAgaWYgKHRyYW4pIGJjMS5yZXNwb25kZXIucnVuUlBDKHsgdHlwZTogdHlwZVJQQy5UUkFOU0FDUklPTiwgYm9keTogdHJhbiB9KTtcbn07XG5iYzMubXVsdGlzaWcuZXZlbnRzLm9uTXVsdGlzaWdUcmFuW1widGVzdCBhcHByb3ZlXCJdID0gKGluZm86IG11bHRpc2lnSW5mbykgPT4ge1xuICBjb25zdCB0cmFuID0gYmMzLm11bHRpc2lnLmFwcHJvdmVNdWx0aVNpZyhpbmZvKTtcbiAgaWYgKHRyYW4pIGJjMS5yZXNwb25kZXIucnVuUlBDKHsgdHlwZTogdHlwZVJQQy5UUkFOU0FDUklPTiwgYm9keTogdHJhbiB9KTtcbn07XG5cbm1haW4oKTtcblxuYXN5bmMgZnVuY3Rpb24gbWFpbigpIHtcbiAgLy/kvZzmiJDlvbnjgYzjg57jgqTjg4vjg7PjgrDjgZfjgabjg4jjg7zjgq/jg7PjgpLnqLzjgZBcbiAgYXdhaXQgYmMxLm1pbmUoKTtcblxuICAvL+S9nOaIkOW9ueOBqOaJv+iqjeiAheOBruODluODreODg+OCr+ODgeOCp+ODvOODs+OBruODleOCqeODvOOCr+OCkuino+axulxuICBiYzIuY2hhaW4gPSBiYzEuY2hhaW47XG4gIGJjMy5jaGFpbiA9IGJjMS5jaGFpbjtcblxuICAvL+S9nOaIkOW9ueOBjOODnuODq+ODgeOCt+OCsOOCouODieODrOOCueOCkueUn+aIkFxuICBsZXQgdHJhbjogYW55ID0gYmMxLm11bHRpc2lnLm1ha2VOZXdNdWx0aVNpZ0FkZHJlc3MoZnJpZW5kcywgXCJmb3JtYXRcIiwgMywgMSk7XG5cbiAgLy/mib/oqo3ogIXjgYzjg57jg6vjg4HjgrfjgrDjgqLjg4njg6zjgrnjga7jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgpJyZXNwb25kZXLjgavmuKHjgZlcbiAgYmMyLnJlc3BvbmRlci5ydW5SUEMoeyB0eXBlOiB0eXBlUlBDLlRSQU5TQUNSSU9OLCBib2R5OiB0cmFuIH0pO1xuICBiYzMucmVzcG9uZGVyLnJ1blJQQyh7IHR5cGU6IHR5cGVSUEMuVFJBTlNBQ1JJT04sIGJvZHk6IHRyYW4gfSk7XG5cbiAgY29uc3QgbXVsdGlzaWdBZGRyZXNzID0gT2JqZWN0LmtleXMoYmMxLm11bHRpc2lnLm11bHRpU2lnKVswXTtcbiAgLy/jg57jg6vjg4HjgrfjgrDjg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgpLkvZzmiJBcbiAgdHJhbiA9IGJjMS5tdWx0aXNpZy5tYWtlTXVsdGlTaWdUcmFuc2FjdGlvbihtdWx0aXNpZ0FkZHJlc3MpO1xuXG4gIC8v44Oe44Or44OB44K344Kw44OI44Op44Oz44K244Kv44K344On44Oz44KScmVzcG9uZGVy44Gr5rih44GZ44CCXG4gIGlmICh0cmFuKSBiYzIucmVzcG9uZGVyLnJ1blJQQyh7IHR5cGU6IHR5cGVSUEMuVFJBTlNBQ1JJT04sIGJvZHk6IHRyYW4gfSk7XG4gIGlmICh0cmFuKSBiYzMucmVzcG9uZGVyLnJ1blJQQyh7IHR5cGU6IHR5cGVSUEMuVFJBTlNBQ1JJT04sIGJvZHk6IHRyYW4gfSk7XG59XG4iXX0=