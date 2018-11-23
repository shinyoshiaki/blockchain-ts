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
            //マルチシグトランザクションを作る役(作成役とする)
            bc1 = new _blockchainApp.default(); //シェアキー共有者

            friends = [];
            cypher = (0, _keypair.default)();
            friends.push(aes256.encrypt("format", cypher.public)); //承認者１

            bc2 = new _blockchainApp.default(cypher.private, cypher.public);
            cypher2 = (0, _keypair.default)();
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
            bc3.chain = bc1.chain; //作成役がマルチシグアドレスを生成

            tran = bc1.multisig.makeNewMultiSigAddress(friends, 2, 1); //承認者がマルチシグアドレスのトランザクションをresponderに渡す

            bc2.multisig.responder(tran);
            bc3.multisig.responder(tran);
            multisigAddress = Object.keys(bc1.multisig.multiSig)[0]; //マルチシグトランザクションを作成

            tran = bc1.multisig.makeMultiSigTransaction(multisigAddress); //承認者が承認するためのコールバックを用意

            bc2.multisig.events.onMultisigTran["test"] = function (info) {
              var tran = bc2.multisig.approveMultiSig(info); //マルチシグの承認

              if (tran) bc1.multisig.responder(tran);
            };

            bc3.multisig.events.onMultisigTran["test"] = function (info) {
              var tran = bc3.multisig.approveMultiSig(info);
              if (tran) bc1.multisig.responder(tran);
            }; //マルチシグトランザクションをresponderに渡す。


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90ZXN0L2Jsb2NrY2hhaW4vbXVsdGlzaWcudHMiXSwibmFtZXMiOlsiYWVzMjU2IiwicmVxdWlyZSIsIm1haW4iLCJiYzEiLCJCbG9ja0NoYWluIiwiZnJpZW5kcyIsImN5cGhlciIsInB1c2giLCJlbmNyeXB0IiwicHVibGljIiwiYmMyIiwicHJpdmF0ZSIsImN5cGhlcjIiLCJiYzMiLCJtaW5lIiwiYmxvY2siLCJjb25zb2xlIiwibG9nIiwiYWRkcmVzcyIsIm5vd0Ftb3VudCIsImNoYWluIiwidHJhbiIsIm11bHRpc2lnIiwibWFrZU5ld011bHRpU2lnQWRkcmVzcyIsInJlc3BvbmRlciIsIm11bHRpc2lnQWRkcmVzcyIsIk9iamVjdCIsImtleXMiLCJtdWx0aVNpZyIsIm1ha2VNdWx0aVNpZ1RyYW5zYWN0aW9uIiwiZXZlbnRzIiwib25NdWx0aXNpZ1RyYW4iLCJpbmZvIiwiYXBwcm92ZU11bHRpU2lnIl0sIm1hcHBpbmdzIjoiOztBQUFBOztBQUNBOzs7Ozs7OztBQUVBLElBQUlBLE1BQU0sR0FBR0MsT0FBTyxDQUFDLFFBQUQsQ0FBcEI7O0FBRUFDLElBQUk7O1NBRVdBLEk7Ozs7Ozs7MEJBQWY7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ0U7QUFDTUMsWUFBQUEsR0FGUixHQUVjLElBQUlDLHNCQUFKLEVBRmQsRUFJRTs7QUFDTUMsWUFBQUEsT0FMUixHQUtrQixFQUxsQjtBQU9RQyxZQUFBQSxNQVBSLEdBT2lCLHVCQVBqQjtBQVFFRCxZQUFBQSxPQUFPLENBQUNFLElBQVIsQ0FBYVAsTUFBTSxDQUFDUSxPQUFQLENBQWUsUUFBZixFQUF5QkYsTUFBTSxDQUFDRyxNQUFoQyxDQUFiLEVBUkYsQ0FTRTs7QUFDTUMsWUFBQUEsR0FWUixHQVVjLElBQUlOLHNCQUFKLENBQWVFLE1BQU0sQ0FBQ0ssT0FBdEIsRUFBK0JMLE1BQU0sQ0FBQ0csTUFBdEMsQ0FWZDtBQVlRRyxZQUFBQSxPQVpSLEdBWWtCLHVCQVpsQjtBQWFFUCxZQUFBQSxPQUFPLENBQUNFLElBQVIsQ0FBYVAsTUFBTSxDQUFDUSxPQUFQLENBQWUsUUFBZixFQUF5QkksT0FBTyxDQUFDSCxNQUFqQyxDQUFiLEVBYkYsQ0FjRTs7QUFDTUksWUFBQUEsR0FmUixHQWVjLElBQUlULHNCQUFKLENBQWVRLE9BQU8sQ0FBQ0QsT0FBdkIsRUFBZ0NDLE9BQU8sQ0FBQ0gsTUFBeEMsQ0FmZCxFQWlCRTs7QUFqQkY7QUFBQSxtQkFrQnNCTixHQUFHLENBQUNXLElBQUosRUFsQnRCOztBQUFBO0FBa0JRQyxZQUFBQSxLQWxCUjtBQW1CRUMsWUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVk7QUFBRUYsY0FBQUEsS0FBSyxFQUFMQTtBQUFGLGFBQVo7QUFDQUMsWUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksUUFBWixFQUFzQmQsR0FBRyxDQUFDZSxPQUExQixFQUFtQ2YsR0FBRyxDQUFDZ0IsU0FBSixDQUFjaEIsR0FBRyxDQUFDZSxPQUFsQixDQUFuQyxFQXBCRixDQXNCRTs7QUFDQVIsWUFBQUEsR0FBRyxDQUFDVSxLQUFKLEdBQVlqQixHQUFHLENBQUNpQixLQUFoQjtBQUNBUCxZQUFBQSxHQUFHLENBQUNPLEtBQUosR0FBWWpCLEdBQUcsQ0FBQ2lCLEtBQWhCLENBeEJGLENBMEJFOztBQUNJQyxZQUFBQSxJQTNCTixHQTJCa0JsQixHQUFHLENBQUNtQixRQUFKLENBQWFDLHNCQUFiLENBQW9DbEIsT0FBcEMsRUFBNkMsQ0FBN0MsRUFBZ0QsQ0FBaEQsQ0EzQmxCLEVBNkJFOztBQUNBSyxZQUFBQSxHQUFHLENBQUNZLFFBQUosQ0FBYUUsU0FBYixDQUF1QkgsSUFBdkI7QUFDQVIsWUFBQUEsR0FBRyxDQUFDUyxRQUFKLENBQWFFLFNBQWIsQ0FBdUJILElBQXZCO0FBRU1JLFlBQUFBLGVBakNSLEdBaUMwQkMsTUFBTSxDQUFDQyxJQUFQLENBQVl4QixHQUFHLENBQUNtQixRQUFKLENBQWFNLFFBQXpCLEVBQW1DLENBQW5DLENBakMxQixFQWtDRTs7QUFDQVAsWUFBQUEsSUFBSSxHQUFHbEIsR0FBRyxDQUFDbUIsUUFBSixDQUFhTyx1QkFBYixDQUFxQ0osZUFBckMsQ0FBUCxDQW5DRixDQXFDRTs7QUFDQWYsWUFBQUEsR0FBRyxDQUFDWSxRQUFKLENBQWFRLE1BQWIsQ0FBb0JDLGNBQXBCLENBQW1DLE1BQW5DLElBQTZDLFVBQUNDLElBQUQsRUFBd0I7QUFDbkUsa0JBQU1YLElBQUksR0FBR1gsR0FBRyxDQUFDWSxRQUFKLENBQWFXLGVBQWIsQ0FBNkJELElBQTdCLENBQWIsQ0FEbUUsQ0FFbkU7O0FBQ0Esa0JBQUlYLElBQUosRUFBVWxCLEdBQUcsQ0FBQ21CLFFBQUosQ0FBYUUsU0FBYixDQUF1QkgsSUFBdkI7QUFDWCxhQUpEOztBQUtBUixZQUFBQSxHQUFHLENBQUNTLFFBQUosQ0FBYVEsTUFBYixDQUFvQkMsY0FBcEIsQ0FBbUMsTUFBbkMsSUFBNkMsVUFBQ0MsSUFBRCxFQUF3QjtBQUNuRSxrQkFBTVgsSUFBSSxHQUFHUixHQUFHLENBQUNTLFFBQUosQ0FBYVcsZUFBYixDQUE2QkQsSUFBN0IsQ0FBYjtBQUNBLGtCQUFJWCxJQUFKLEVBQVVsQixHQUFHLENBQUNtQixRQUFKLENBQWFFLFNBQWIsQ0FBdUJILElBQXZCO0FBQ1gsYUFIRCxDQTNDRixDQWdERTs7O0FBQ0EsZ0JBQUlBLElBQUosRUFBVVgsR0FBRyxDQUFDWSxRQUFKLENBQWFFLFNBQWIsQ0FBdUJILElBQXZCO0FBQ1YsZ0JBQUlBLElBQUosRUFBVVIsR0FBRyxDQUFDUyxRQUFKLENBQWFFLFNBQWIsQ0FBdUJILElBQXZCOztBQWxEWjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEJsb2NrQ2hhaW4gZnJvbSBcIi4uLy4uL2Jsb2NrY2hhaW4vYmxvY2tjaGFpbkFwcFwiO1xuaW1wb3J0IGtleXBhaXIgZnJvbSBcImtleXBhaXJcIjtcbmltcG9ydCB7IG11bHRpc2lnSW5mbyB9IGZyb20gXCIuLi8uLi9ibG9ja2NoYWluL2ludGVyZmFjZVwiO1xudmFyIGFlczI1NiA9IHJlcXVpcmUoXCJhZXMyNTZcIik7XG5cbm1haW4oKTtcblxuYXN5bmMgZnVuY3Rpb24gbWFpbigpIHtcbiAgLy/jg57jg6vjg4HjgrfjgrDjg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgpLkvZzjgovlvbko5L2c5oiQ5b2544Go44GZ44KLKVxuICBjb25zdCBiYzEgPSBuZXcgQmxvY2tDaGFpbigpO1xuXG4gIC8v44K344Kn44Ki44Kt44O85YWx5pyJ6ICFXG4gIGNvbnN0IGZyaWVuZHMgPSBbXTtcblxuICBjb25zdCBjeXBoZXIgPSBrZXlwYWlyKCk7XG4gIGZyaWVuZHMucHVzaChhZXMyNTYuZW5jcnlwdChcImZvcm1hdFwiLCBjeXBoZXIucHVibGljKSk7XG4gIC8v5om/6KqN6ICF77yRXG4gIGNvbnN0IGJjMiA9IG5ldyBCbG9ja0NoYWluKGN5cGhlci5wcml2YXRlLCBjeXBoZXIucHVibGljKTtcblxuICBjb25zdCBjeXBoZXIyID0ga2V5cGFpcigpO1xuICBmcmllbmRzLnB1c2goYWVzMjU2LmVuY3J5cHQoXCJmb3JtYXRcIiwgY3lwaGVyMi5wdWJsaWMpKTtcbiAgLy/mib/oqo3ogIXvvJJcbiAgY29uc3QgYmMzID0gbmV3IEJsb2NrQ2hhaW4oY3lwaGVyMi5wcml2YXRlLCBjeXBoZXIyLnB1YmxpYyk7XG5cbiAgLy/kvZzmiJDlvbnjgYzjg57jgqTjg4vjg7PjgrDjgZfjgabjg4jjg7zjgq/jg7PjgpLnqLzjgZBcbiAgY29uc3QgYmxvY2sgPSBhd2FpdCBiYzEubWluZSgpO1xuICBjb25zb2xlLmxvZyh7IGJsb2NrIH0pO1xuICBjb25zb2xlLmxvZyhcImFtb3VudFwiLCBiYzEuYWRkcmVzcywgYmMxLm5vd0Ftb3VudChiYzEuYWRkcmVzcykpO1xuXG4gIC8v5L2c5oiQ5b2544Go5om/6KqN6ICF44Gu44OW44Ot44OD44Kv44OB44Kn44O844Oz44Gu44OV44Kp44O844Kv44KS6Kej5rG6XG4gIGJjMi5jaGFpbiA9IGJjMS5jaGFpbjtcbiAgYmMzLmNoYWluID0gYmMxLmNoYWluO1xuXG4gIC8v5L2c5oiQ5b2544GM44Oe44Or44OB44K344Kw44Ki44OJ44Os44K544KS55Sf5oiQXG4gIGxldCB0cmFuOiBhbnkgPSBiYzEubXVsdGlzaWcubWFrZU5ld011bHRpU2lnQWRkcmVzcyhmcmllbmRzLCAyLCAxKTtcblxuICAvL+aJv+iqjeiAheOBjOODnuODq+ODgeOCt+OCsOOCouODieODrOOCueOBruODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OCknJlc3BvbmRlcuOBq+a4oeOBmVxuICBiYzIubXVsdGlzaWcucmVzcG9uZGVyKHRyYW4pO1xuICBiYzMubXVsdGlzaWcucmVzcG9uZGVyKHRyYW4pO1xuXG4gIGNvbnN0IG11bHRpc2lnQWRkcmVzcyA9IE9iamVjdC5rZXlzKGJjMS5tdWx0aXNpZy5tdWx0aVNpZylbMF07XG4gIC8v44Oe44Or44OB44K344Kw44OI44Op44Oz44K244Kv44K344On44Oz44KS5L2c5oiQXG4gIHRyYW4gPSBiYzEubXVsdGlzaWcubWFrZU11bHRpU2lnVHJhbnNhY3Rpb24obXVsdGlzaWdBZGRyZXNzKTtcblxuICAvL+aJv+iqjeiAheOBjOaJv+iqjeOBmeOCi+OBn+OCgeOBruOCs+ODvOODq+ODkOODg+OCr+OCkueUqOaEj1xuICBiYzIubXVsdGlzaWcuZXZlbnRzLm9uTXVsdGlzaWdUcmFuW1widGVzdFwiXSA9IChpbmZvOiBtdWx0aXNpZ0luZm8pID0+IHtcbiAgICBjb25zdCB0cmFuID0gYmMyLm11bHRpc2lnLmFwcHJvdmVNdWx0aVNpZyhpbmZvKTtcbiAgICAvL+ODnuODq+ODgeOCt+OCsOOBruaJv+iqjVxuICAgIGlmICh0cmFuKSBiYzEubXVsdGlzaWcucmVzcG9uZGVyKHRyYW4pO1xuICB9O1xuICBiYzMubXVsdGlzaWcuZXZlbnRzLm9uTXVsdGlzaWdUcmFuW1widGVzdFwiXSA9IChpbmZvOiBtdWx0aXNpZ0luZm8pID0+IHtcbiAgICBjb25zdCB0cmFuID0gYmMzLm11bHRpc2lnLmFwcHJvdmVNdWx0aVNpZyhpbmZvKTtcbiAgICBpZiAodHJhbikgYmMxLm11bHRpc2lnLnJlc3BvbmRlcih0cmFuKTtcbiAgfTtcblxuICAvL+ODnuODq+ODgeOCt+OCsOODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OCknJlc3BvbmRlcuOBq+a4oeOBmeOAglxuICBpZiAodHJhbikgYmMyLm11bHRpc2lnLnJlc3BvbmRlcih0cmFuKTtcbiAgaWYgKHRyYW4pIGJjMy5tdWx0aXNpZy5yZXNwb25kZXIodHJhbik7XG59XG4iXX0=