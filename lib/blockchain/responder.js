"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.typeRPC = void 0;

var _blockchain = require("./blockchain");

var _util = require("../util");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var typeRPC;
exports.typeRPC = typeRPC;

(function (typeRPC) {
  typeRPC["NEWBLOCK"] = "NEWBLOCK";
  typeRPC["TRANSACRION"] = "TRANSACRION";
  typeRPC["CONFLICT"] = "CONFLICT";
  typeRPC["RESOLVE_CONFLICT"] = "RESOLVE_CONFLICT";
})(typeRPC || (exports.typeRPC = typeRPC = {}));

var Responder =
/*#__PURE__*/
function () {
  function Responder(_bc, callback) {
    var _this = this;

    _classCallCheck(this, Responder);

    _defineProperty(this, "callback", void 0);

    _defineProperty(this, "onResolveConflict", void 0);

    _defineProperty(this, "onTransaction", {});

    _defineProperty(this, "events", {
      transaction: this.onTransaction
    });

    _defineProperty(this, "bc", void 0);

    _defineProperty(this, "RPC", {});

    this.bc = _bc;
    this.callback = callback;

    this.RPC[typeRPC.NEWBLOCK] =
    /*#__PURE__*/
    function () {
      var _ref = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(block) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                console.log("blockchainApp", "new block"); //受け取ったブロックのインデックスが自分のチェーンより2長いか
                //現時点のチェーンの長さが1ならブロックチェーンの分岐を疑う

                if (!(block.index > _this.bc.chain.length + 1 || _this.bc.chain.length === 1)) {
                  _context.next = 6;
                  break;
                }

                _context.next = 4;
                return _this.checkConflicts().catch(console.log);

              case 4:
                _context.next = 7;
                break;

              case 6:
                //新しいブロックを受け入れる
                _this.bc.addBlock(block);

              case 7:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }(); //トランザクションに対する処理


    this.RPC[typeRPC.TRANSACRION] = function (body) {
      console.log("blockchainApp transaction", body);

      if ( //トランザクションプールに受け取ったトランザクションがあるか簡易的に調べる
      (0, _blockchain.jsonStr)(_this.bc.currentTransactions).includes((0, _blockchain.jsonStr)(body))) {
        //トランザクションをトランザクションプールに加える
        _this.bc.addTransaction(body);

        _this.bc.multisig.responder(body);

        _this.bc.contract.responder(body);

        (0, _util.excuteEvent)(_this.events.transaction, body);
      }
    };

    this.RPC[typeRPC.CONFLICT] = function (body) {
      console.log("blockchain app check conflict"); //自分のチェーンが質問者より長ければ、自分のチェーンを返す

      if (_this.bc.chain.length > body.size) {
        console.log("blockchain app check is conflict", _this.bc.chain.length, body.size);
        var onConflict = {
          chain: _this.bc.chain,
          listenrAddress: body.address
        };
        var rpc = {
          type: typeRPC.RESOLVE_CONFLICT,
          body: onConflict
        };
        if (_this.callback) _this.callback.answerConflict(rpc);
      }
    };

    this.RPC[typeRPC.RESOLVE_CONFLICT] = function (body) {
      if (_this.onResolveConflict) _this.onResolveConflict(body.chain);
    };
  }

  _createClass(Responder, [{
    key: "runRPC",
    value: function runRPC(rpc) {
      if (Object.keys(this.RPC).includes(rpc.type)) this.RPC[rpc.type](rpc.body);
    }
  }, {
    key: "checkConflicts",
    value: function checkConflicts() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        console.log("checkConflicts"); //タイムアウト

        var timeout = setTimeout(function () {
          reject("checkconflicts timeout");
        }, 4 * 1000);
        var conflict = {
          size: _this2.bc.chain.length,
          address: _this2.bc.address
        };
        var rpc = {
          type: typeRPC.CONFLICT,
          body: conflict
        }; //他のノードにブロックチェーンの状況を聞く

        if (_this2.callback) _this2.callback.listenConflict(rpc); //他のノードからの回答を調べる

        _this2.onResolveConflict = function (chain) {
          console.log("onResolveConflict", _this2.bc.chain.length, chain.length);

          if (_this2.bc.chain.length < chain.length) {
            if ((0, _blockchain.validChain)(chain)) {
              console.log("swap chain");
              _this2.bc.chain = chain;
            } else {
              console.log("conflict wrong chain");
            }
          } else {
            console.log("my chain is longer");
          }

          clearTimeout(timeout);
          resolve(true);
        };
      });
    }
  }]);

  return Responder;
}();

exports.default = Responder;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL3Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJ0eXBlUlBDIiwiUmVzcG9uZGVyIiwiX2JjIiwiY2FsbGJhY2siLCJ0cmFuc2FjdGlvbiIsIm9uVHJhbnNhY3Rpb24iLCJiYyIsIlJQQyIsIk5FV0JMT0NLIiwiYmxvY2siLCJjb25zb2xlIiwibG9nIiwiaW5kZXgiLCJjaGFpbiIsImxlbmd0aCIsImNoZWNrQ29uZmxpY3RzIiwiY2F0Y2giLCJhZGRCbG9jayIsIlRSQU5TQUNSSU9OIiwiYm9keSIsImN1cnJlbnRUcmFuc2FjdGlvbnMiLCJpbmNsdWRlcyIsImFkZFRyYW5zYWN0aW9uIiwibXVsdGlzaWciLCJyZXNwb25kZXIiLCJjb250cmFjdCIsImV2ZW50cyIsIkNPTkZMSUNUIiwic2l6ZSIsIm9uQ29uZmxpY3QiLCJsaXN0ZW5yQWRkcmVzcyIsImFkZHJlc3MiLCJycGMiLCJ0eXBlIiwiUkVTT0xWRV9DT05GTElDVCIsImFuc3dlckNvbmZsaWN0Iiwib25SZXNvbHZlQ29uZmxpY3QiLCJPYmplY3QiLCJrZXlzIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJ0aW1lb3V0Iiwic2V0VGltZW91dCIsImNvbmZsaWN0IiwibGlzdGVuQ29uZmxpY3QiLCJjbGVhclRpbWVvdXQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7SUF1QllBLE87OztXQUFBQSxPO0FBQUFBLEVBQUFBLE87QUFBQUEsRUFBQUEsTztBQUFBQSxFQUFBQSxPO0FBQUFBLEVBQUFBLE87R0FBQUEsTyx1QkFBQUEsTzs7SUFPU0MsUzs7O0FBT25CLHFCQUFZQyxHQUFaLEVBQWdDQyxRQUFoQyxFQUErRDtBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBLDJDQUo5QixFQUk4Qjs7QUFBQSxvQ0FIdEQ7QUFBRUMsTUFBQUEsV0FBVyxFQUFFLEtBQUtDO0FBQXBCLEtBR3NEOztBQUFBOztBQUFBLGlDQURwRCxFQUNv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LG1CQUFaLEVBQWlDLE1BQUksQ0FBQ0wsRUFBTCxDQUFRTyxLQUFSLENBQWNDLE1BQS9DLEVBQXVERCxLQUFLLENBQUNDLE1BQTdEOztBQUNBLGNBQUksTUFBSSxDQUFDUixFQUFMLENBQVFPLEtBQVIsQ0FBY0MsTUFBZCxHQUF1QkQsS0FBSyxDQUFDQyxNQUFqQyxFQUF5QztBQUN2QyxnQkFBSSw0QkFBV0QsS0FBWCxDQUFKLEVBQXVCO0FBQ3JCSCxjQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxZQUFaO0FBQ0EsY0FBQSxNQUFJLENBQUNMLEVBQUwsQ0FBUU8sS0FBUixHQUFnQkEsS0FBaEI7QUFDRCxhQUhELE1BR087QUFDTEgsY0FBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksc0JBQVo7QUFDRDtBQUNGLFdBUEQsTUFPTztBQUNMRCxZQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxvQkFBWjtBQUNEOztBQUNEbUMsVUFBQUEsWUFBWSxDQUFDSixPQUFELENBQVo7QUFDQUYsVUFBQUEsT0FBTyxDQUFDLElBQUQsQ0FBUDtBQUNELFNBZEQ7QUFlRCxPQS9CTSxDQUFQO0FBZ0NEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSVRyYW5zYWN0aW9uLCBJQmxvY2ssIHZhbGlkQ2hhaW4sIGpzb25TdHIgfSBmcm9tIFwiLi9ibG9ja2NoYWluXCI7XG5pbXBvcnQgQmxvY2tDaGFpbkFwcCBmcm9tIFwiLi9ibG9ja2NoYWluQXBwXCI7XG5pbXBvcnQgeyBJRXZlbnRzLCBleGN1dGVFdmVudCB9IGZyb20gXCIuLi91dGlsXCI7XG5cbi8v44Kz44O844Or44OQ44OD44Kv44Gv5by35Yi244CB44Kk44OZ44Oz44OI44Gv5Lu75oSP44Gr44GX44KI44GG44Go44GX44Gm44GE44KLXG5leHBvcnQgaW50ZXJmYWNlIEljYWxsYmFja1Jlc3BvbmRlciB7XG4gIGxpc3RlbkNvbmZsaWN0OiAocnBjOiBSUEMpID0+IHZvaWQ7XG4gIGFuc3dlckNvbmZsaWN0OiAocnBjOiBSUEMpID0+IHZvaWQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUlBDIHtcbiAgdHlwZTogdHlwZVJQQztcbiAgYm9keTogYW55O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElDb25mbGljdCB7XG4gIHNpemU6IG51bWJlcjtcbiAgYWRkcmVzczogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElPbkNvbmZsaWN0IHtcbiAgY2hhaW46IElCbG9ja1tdO1xuICBsaXN0ZW5yQWRkcmVzczogc3RyaW5nO1xufVxuXG5leHBvcnQgZW51bSB0eXBlUlBDIHtcbiAgTkVXQkxPQ0sgPSBcIk5FV0JMT0NLXCIsXG4gIFRSQU5TQUNSSU9OID0gXCJUUkFOU0FDUklPTlwiLFxuICBDT05GTElDVCA9IFwiQ09ORkxJQ1RcIixcbiAgUkVTT0xWRV9DT05GTElDVCA9IFwiUkVTT0xWRV9DT05GTElDVFwiXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc3BvbmRlciB7XG4gIGNhbGxiYWNrOiBJY2FsbGJhY2tSZXNwb25kZXIgfCB1bmRlZmluZWQ7XG4gIHByaXZhdGUgb25SZXNvbHZlQ29uZmxpY3Q/OiAoY2hhaW46IElCbG9ja1tdKSA9PiB2b2lkO1xuICBwcml2YXRlIG9uVHJhbnNhY3Rpb246IElFdmVudHMgPSB7fTtcbiAgZXZlbnRzID0geyB0cmFuc2FjdGlvbjogdGhpcy5vblRyYW5zYWN0aW9uIH07XG4gIGJjOiBCbG9ja0NoYWluQXBwO1xuICBSUEM6IGFueSA9IHt9O1xuICBjb25zdHJ1Y3RvcihfYmM6IEJsb2NrQ2hhaW5BcHAsIGNhbGxiYWNrPzogSWNhbGxiYWNrUmVzcG9uZGVyKSB7XG4gICAgdGhpcy5iYyA9IF9iYztcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG5cbiAgICB0aGlzLlJQQ1t0eXBlUlBDLk5FV0JMT0NLXSA9IGFzeW5jIChibG9jazogSUJsb2NrKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImJsb2NrY2hhaW5BcHBcIiwgXCJuZXcgYmxvY2tcIik7XG4gICAgICAvL+WPl+OBkeWPluOBo+OBn+ODluODreODg+OCr+OBruOCpOODs+ODh+ODg+OCr+OCueOBjOiHquWIhuOBruODgeOCp+ODvOODs+OCiOOCijLplbfjgYTjgYtcbiAgICAgIC8v54++5pmC54K544Gu44OB44Kn44O844Oz44Gu6ZW344GV44GMMeOBquOCieODluODreODg+OCr+ODgeOCp+ODvOODs+OBruWIhuWykOOCkueWkeOBhlxuICAgICAgaWYgKFxuICAgICAgICBibG9jay5pbmRleCA+IHRoaXMuYmMuY2hhaW4ubGVuZ3RoICsgMSB8fFxuICAgICAgICB0aGlzLmJjLmNoYWluLmxlbmd0aCA9PT0gMVxuICAgICAgKSB7XG4gICAgICAgIC8v44OW44Ot44OD44Kv44OB44Kn44O844Oz44Gu5YiG5bKQ44KS6Kq/44G544KLXG4gICAgICAgIGF3YWl0IHRoaXMuY2hlY2tDb25mbGljdHMoKS5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvL+aWsOOBl+OBhOODluODreODg+OCr+OCkuWPl+OBkeWFpeOCjOOCi1xuICAgICAgICB0aGlzLmJjLmFkZEJsb2NrKGJsb2NrKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7Pjgavlr77jgZnjgovlh6bnkIZcbiAgICB0aGlzLlJQQ1t0eXBlUlBDLlRSQU5TQUNSSU9OXSA9IChib2R5OiBJVHJhbnNhY3Rpb24pID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiYmxvY2tjaGFpbkFwcCB0cmFuc2FjdGlvblwiLCBib2R5KTtcbiAgICAgIGlmIChcbiAgICAgICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7Pjg5fjg7zjg6vjgavlj5fjgZHlj5bjgaPjgZ/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgYzjgYLjgovjgYvnsKHmmJPnmoTjgavoqr/jgbnjgotcbiAgICAgICAganNvblN0cih0aGlzLmJjLmN1cnJlbnRUcmFuc2FjdGlvbnMpLmluY2x1ZGVzKGpzb25TdHIoYm9keSkpXG4gICAgICApIHtcbiAgICAgICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgpLjg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7Pjg5fjg7zjg6vjgavliqDjgYjjgotcbiAgICAgICAgdGhpcy5iYy5hZGRUcmFuc2FjdGlvbihib2R5KTtcbiAgICAgICAgdGhpcy5iYy5tdWx0aXNpZy5yZXNwb25kZXIoYm9keSk7XG4gICAgICAgIHRoaXMuYmMuY29udHJhY3QucmVzcG9uZGVyKGJvZHkpO1xuICAgICAgICBleGN1dGVFdmVudCh0aGlzLmV2ZW50cy50cmFuc2FjdGlvbiwgYm9keSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuUlBDW3R5cGVSUEMuQ09ORkxJQ1RdID0gKGJvZHk6IElDb25mbGljdCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJibG9ja2NoYWluIGFwcCBjaGVjayBjb25mbGljdFwiKTtcbiAgICAgIC8v6Ieq5YiG44Gu44OB44Kn44O844Oz44GM6LOq5ZWP6ICF44KI44KK6ZW344GR44KM44Gw44CB6Ieq5YiG44Gu44OB44Kn44O844Oz44KS6L+U44GZXG4gICAgICBpZiAodGhpcy5iYy5jaGFpbi5sZW5ndGggPiBib2R5LnNpemUpIHtcbiAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgXCJibG9ja2NoYWluIGFwcCBjaGVjayBpcyBjb25mbGljdFwiLFxuICAgICAgICAgIHRoaXMuYmMuY2hhaW4ubGVuZ3RoLFxuICAgICAgICAgIGJvZHkuc2l6ZVxuICAgICAgICApO1xuICAgICAgICBjb25zdCBvbkNvbmZsaWN0OiBJT25Db25mbGljdCA9IHtcbiAgICAgICAgICBjaGFpbjogdGhpcy5iYy5jaGFpbixcbiAgICAgICAgICBsaXN0ZW5yQWRkcmVzczogYm9keS5hZGRyZXNzXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHJwYzogUlBDID0geyB0eXBlOiB0eXBlUlBDLlJFU09MVkVfQ09ORkxJQ1QsIGJvZHk6IG9uQ29uZmxpY3QgfTtcbiAgICAgICAgaWYgKHRoaXMuY2FsbGJhY2spIHRoaXMuY2FsbGJhY2suYW5zd2VyQ29uZmxpY3QocnBjKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5SUENbdHlwZVJQQy5SRVNPTFZFX0NPTkZMSUNUXSA9IChib2R5OiBJT25Db25mbGljdCkgPT4ge1xuICAgICAgaWYgKHRoaXMub25SZXNvbHZlQ29uZmxpY3QpIHRoaXMub25SZXNvbHZlQ29uZmxpY3QoYm9keS5jaGFpbik7XG4gICAgfTtcbiAgfVxuXG4gIHJ1blJQQyhycGM6IFJQQykge1xuICAgIGlmIChPYmplY3Qua2V5cyh0aGlzLlJQQykuaW5jbHVkZXMocnBjLnR5cGUpKSB0aGlzLlJQQ1tycGMudHlwZV0ocnBjLmJvZHkpO1xuICB9XG5cbiAgcHJpdmF0ZSBjaGVja0NvbmZsaWN0cygpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJjaGVja0NvbmZsaWN0c1wiKTtcbiAgICAgIC8v44K/44Kk44Og44Ki44Km44OIXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcImNoZWNrY29uZmxpY3RzIHRpbWVvdXRcIik7XG4gICAgICB9LCA0ICogMTAwMCk7XG5cbiAgICAgIGNvbnN0IGNvbmZsaWN0OiBJQ29uZmxpY3QgPSB7XG4gICAgICAgIHNpemU6IHRoaXMuYmMuY2hhaW4ubGVuZ3RoLFxuICAgICAgICBhZGRyZXNzOiB0aGlzLmJjLmFkZHJlc3NcbiAgICAgIH07XG4gICAgICBjb25zdCBycGM6IFJQQyA9IHsgdHlwZTogdHlwZVJQQy5DT05GTElDVCwgYm9keTogY29uZmxpY3QgfTtcbiAgICAgIC8v5LuW44Gu44OO44O844OJ44Gr44OW44Ot44OD44Kv44OB44Kn44O844Oz44Gu54q25rOB44KS6IGe44GPXG4gICAgICBpZiAodGhpcy5jYWxsYmFjaykgdGhpcy5jYWxsYmFjay5saXN0ZW5Db25mbGljdChycGMpO1xuXG4gICAgICAvL+S7luOBruODjuODvOODieOBi+OCieOBruWbnuetlOOCkuiqv+OBueOCi1xuICAgICAgdGhpcy5vblJlc29sdmVDb25mbGljdCA9IChjaGFpbjogSUJsb2NrW10pID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJvblJlc29sdmVDb25mbGljdFwiLCB0aGlzLmJjLmNoYWluLmxlbmd0aCwgY2hhaW4ubGVuZ3RoKTtcbiAgICAgICAgaWYgKHRoaXMuYmMuY2hhaW4ubGVuZ3RoIDwgY2hhaW4ubGVuZ3RoKSB7XG4gICAgICAgICAgaWYgKHZhbGlkQ2hhaW4oY2hhaW4pKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInN3YXAgY2hhaW5cIik7XG4gICAgICAgICAgICB0aGlzLmJjLmNoYWluID0gY2hhaW47XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiY29uZmxpY3Qgd3JvbmcgY2hhaW5cIik7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwibXkgY2hhaW4gaXMgbG9uZ2VyXCIpO1xuICAgICAgICB9XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==