"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.typeRPC = void 0;

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
      !_this.bc.jsonStr(_this.bc.currentTransactions).includes(_this.bc.jsonStr(body))) {
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
        console.log("blockchain app check is conflict");
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

    this.RPC[typeRPC.RESOLVE_CONFLICT] = function (chain) {
      if (_this.onResolveConflict) _this.onResolveConflict(chain);
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

        if (_this2.callback) _this2.callback.listenConfilict(rpc); //他のノードからの回答を調べる

        _this2.onResolveConflict = function (chain) {
          console.log("onResolveConflict");

          if (_this2.bc.chain.length < chain.length) {
            if (_this2.bc.validChain(chain)) {
              _this2.bc.chain = chain;
            } else {
              console.log("conflict wrong chain");
            }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL3Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJ0eXBlUlBDIiwiUmVzcG9uZGVyIiwiX2JjIiwiY2FsbGJhY2siLCJ0cmFuc2FjdGlvbiIsIm9uVHJhbnNhY3Rpb24iLCJiYyIsIlJQQyIsIk5FV0JMT0NLIiwiYmxvY2siLCJjb25zb2xlIiwibG9nIiwiaW5kZXgiLCJjaGFpbiIsImxlbmd0aCIsImNoZWNrQ29uZmxpY3RzIiwiY2F0Y2giLCJhZGRCbG9jayIsIlRSQU5TQUNSSU9OIiwiYm9keSIsImpzb25TdHIiLCJjdXJyZW50VHJhbnNhY3Rpb25zIiwiaW5jbHVkZXMiLCJhZGRUcmFuc2FjdGlvbiIsIm11bHRpc2lnIiwicmVzcG9uZGVyIiwiY29udHJhY3QiLCJldmVudHMiLCJDT05GTElDVCIsInNpemUiLCJvbkNvbmZsaWN0IiwibGlzdGVuckFkZHJlc3MiLCJhZGRyZXNzIiwicnBjIiwidHlwZSIsIlJFU09MVkVfQ09ORkxJQ1QiLCJhbnN3ZXJDb25mbGljdCIsIm9uUmVzb2x2ZUNvbmZsaWN0IiwiT2JqZWN0Iiwia2V5cyIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwidGltZW91dCIsInNldFRpbWVvdXQiLCJjb25mbGljdCIsImxpc3RlbkNvbmZpbGljdCIsInZhbGlkQ2hhaW4iLCJjbGVhclRpbWVvdXQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7SUF1QllBLE87OztXQUFBQSxPO0FBQUFBLEVBQUFBLE87QUFBQUEsRUFBQUEsTztBQUFBQSxFQUFBQSxPO0FBQUFBLEVBQUFBLE87R0FBQUEsTyx1QkFBQUEsTzs7SUFPU0MsUzs7O0FBT25CLHFCQUFZQyxHQUFaLEVBQWdDQyxRQUFoQyxFQUErRDtBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBLDJDQUo5QixFQUk4Qjs7QUFBQSxvQ0FIdEQ7QUFBRUMsTUFBQUEsV0FBVyxFQUFFLEtBQUtDO0FBQXBCLEtBR3NEOztBQUFB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bUJBQVo7O0FBQ0EsY0FBSSxNQUFJLENBQUNMLEVBQUwsQ0FBUU8sS0FBUixDQUFjQyxNQUFkLEdBQXVCRCxLQUFLLENBQUNDLE1BQWpDLEVBQXlDO0FBQ3ZDLGdCQUFJLE1BQUksQ0FBQ1IsRUFBTCxDQUFReUMsVUFBUixDQUFtQmxDLEtBQW5CLENBQUosRUFBK0I7QUFDN0IsY0FBQSxNQUFJLENBQUNQLEVBQUwsQ0FBUU8sS0FBUixHQUFnQkEsS0FBaEI7QUFDRCxhQUZELE1BRU87QUFDTEgsY0FBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksc0JBQVo7QUFDRDtBQUNGOztBQUNEcUMsVUFBQUEsWUFBWSxDQUFDTCxPQUFELENBQVo7QUFDQUYsVUFBQUEsT0FBTyxDQUFDLElBQUQsQ0FBUDtBQUNELFNBWEQ7QUFZRCxPQTVCTSxDQUFQO0FBNkJEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSVRyYW5zYWN0aW9uLCBJQmxvY2sgfSBmcm9tIFwiLi9ibG9ja2NoYWluXCI7XG5pbXBvcnQgQmxvY2tDaGFpbkFwcCBmcm9tIFwiLi9ibG9ja2NoYWluQXBwXCI7XG5pbXBvcnQgeyBJRXZlbnRzLCBleGN1dGVFdmVudCB9IGZyb20gXCIuLi91dGlsXCI7XG5cbi8v44Kz44O844Or44OQ44OD44Kv44Gv5by35Yi244CB44Kk44OZ44Oz44OI44Gv5Lu75oSP44Gr44GX44KI44GG44Go44GX44Gm44GE44KLXG5leHBvcnQgaW50ZXJmYWNlIEljYWxsYmFja1Jlc3BvbmRlciB7XG4gIGxpc3RlbkNvbmZpbGljdDogKHJwYzogUlBDKSA9PiB2b2lkO1xuICBhbnN3ZXJDb25mbGljdDogKHJwYzogUlBDKSA9PiB2b2lkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJQQyB7XG4gIHR5cGU6IHR5cGVSUEM7XG4gIGJvZHk6IGFueTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJQ29uZmxpY3Qge1xuICBzaXplOiBudW1iZXI7XG4gIGFkZHJlc3M6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJT25Db25mbGljdCB7XG4gIGNoYWluOiBJQmxvY2tbXTtcbiAgbGlzdGVuckFkZHJlc3M6IHN0cmluZztcbn1cblxuZXhwb3J0IGVudW0gdHlwZVJQQyB7XG4gIE5FV0JMT0NLID0gXCJORVdCTE9DS1wiLFxuICBUUkFOU0FDUklPTiA9IFwiVFJBTlNBQ1JJT05cIixcbiAgQ09ORkxJQ1QgPSBcIkNPTkZMSUNUXCIsXG4gIFJFU09MVkVfQ09ORkxJQ1QgPSBcIlJFU09MVkVfQ09ORkxJQ1RcIlxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXNwb25kZXIge1xuICBjYWxsYmFjazogSWNhbGxiYWNrUmVzcG9uZGVyIHwgdW5kZWZpbmVkO1xuICBwcml2YXRlIG9uUmVzb2x2ZUNvbmZsaWN0PzogKGNoYWluOiBJQmxvY2tbXSkgPT4gdm9pZDtcbiAgcHJpdmF0ZSBvblRyYW5zYWN0aW9uOiBJRXZlbnRzID0ge307XG4gIGV2ZW50cyA9IHsgdHJhbnNhY3Rpb246IHRoaXMub25UcmFuc2FjdGlvbiB9O1xuICBiYzogQmxvY2tDaGFpbkFwcDtcbiAgUlBDOiBhbnkgPSB7fTtcbiAgY29uc3RydWN0b3IoX2JjOiBCbG9ja0NoYWluQXBwLCBjYWxsYmFjaz86IEljYWxsYmFja1Jlc3BvbmRlcikge1xuICAgIHRoaXMuYmMgPSBfYmM7XG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgdGhpcy5SUENbdHlwZVJQQy5ORVdCTE9DS10gPSBhc3luYyAoYmxvY2s6IElCbG9jaykgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJibG9ja2NoYWluQXBwXCIsIFwibmV3IGJsb2NrXCIpO1xuICAgICAgLy/lj5fjgZHlj5bjgaPjgZ/jg5bjg63jg4Pjgq/jga7jgqTjg7Pjg4fjg4Pjgq/jgrnjgYzoh6rliIbjga7jg4Hjgqfjg7zjg7Pjgojjgooy6ZW344GE44GLXG4gICAgICAvL+ePvuaZgueCueOBruODgeOCp+ODvOODs+OBrumVt+OBleOBjDHjgarjgonjg5bjg63jg4Pjgq/jg4Hjgqfjg7zjg7Pjga7liIblspDjgpLnlpHjgYZcbiAgICAgIGlmIChcbiAgICAgICAgYmxvY2suaW5kZXggPiB0aGlzLmJjLmNoYWluLmxlbmd0aCArIDEgfHxcbiAgICAgICAgdGhpcy5iYy5jaGFpbi5sZW5ndGggPT09IDFcbiAgICAgICkge1xuICAgICAgICAvL+ODluODreODg+OCr+ODgeOCp+ODvOODs+OBruWIhuWykOOCkuiqv+OBueOCi1xuICAgICAgICBhd2FpdCB0aGlzLmNoZWNrQ29uZmxpY3RzKCkuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy/mlrDjgZfjgYTjg5bjg63jg4Pjgq/jgpLlj5fjgZHlhaXjgozjgotcbiAgICAgICAgdGhpcy5iYy5hZGRCbG9jayhibG9jayk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8v44OI44Op44Oz44K244Kv44K344On44Oz44Gr5a++44GZ44KL5Yem55CGXG4gICAgdGhpcy5SUENbdHlwZVJQQy5UUkFOU0FDUklPTl0gPSAoYm9keTogSVRyYW5zYWN0aW9uKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImJsb2NrY2hhaW5BcHAgdHJhbnNhY3Rpb25cIiwgYm9keSk7XG4gICAgICBpZiAoXG4gICAgICAgIC8v44OI44Op44Oz44K244Kv44K344On44Oz44OX44O844Or44Gr5Y+X44GR5Y+W44Gj44Gf44OI44Op44Oz44K244Kv44K344On44Oz44GM44GC44KL44GL57Ch5piT55qE44Gr6Kq/44G544KLXG4gICAgICAgICF0aGlzLmJjXG4gICAgICAgICAgLmpzb25TdHIodGhpcy5iYy5jdXJyZW50VHJhbnNhY3Rpb25zKVxuICAgICAgICAgIC5pbmNsdWRlcyh0aGlzLmJjLmpzb25TdHIoYm9keSkpXG4gICAgICApIHtcbiAgICAgICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgpLjg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7Pjg5fjg7zjg6vjgavliqDjgYjjgotcbiAgICAgICAgdGhpcy5iYy5hZGRUcmFuc2FjdGlvbihib2R5KTtcbiAgICAgICAgdGhpcy5iYy5tdWx0aXNpZy5yZXNwb25kZXIoYm9keSk7XG4gICAgICAgIHRoaXMuYmMuY29udHJhY3QucmVzcG9uZGVyKGJvZHkpO1xuICAgICAgICBleGN1dGVFdmVudCh0aGlzLmV2ZW50cy50cmFuc2FjdGlvbiwgYm9keSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuUlBDW3R5cGVSUEMuQ09ORkxJQ1RdID0gKGJvZHk6IElDb25mbGljdCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJibG9ja2NoYWluIGFwcCBjaGVjayBjb25mbGljdFwiKTtcbiAgICAgIC8v6Ieq5YiG44Gu44OB44Kn44O844Oz44GM6LOq5ZWP6ICF44KI44KK6ZW344GR44KM44Gw44CB6Ieq5YiG44Gu44OB44Kn44O844Oz44KS6L+U44GZXG4gICAgICBpZiAodGhpcy5iYy5jaGFpbi5sZW5ndGggPiBib2R5LnNpemUpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJibG9ja2NoYWluIGFwcCBjaGVjayBpcyBjb25mbGljdFwiKTtcbiAgICAgICAgY29uc3Qgb25Db25mbGljdDogSU9uQ29uZmxpY3QgPSB7XG4gICAgICAgICAgY2hhaW46IHRoaXMuYmMuY2hhaW4sXG4gICAgICAgICAgbGlzdGVuckFkZHJlc3M6IGJvZHkuYWRkcmVzc1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBycGM6IFJQQyA9IHsgdHlwZTogdHlwZVJQQy5SRVNPTFZFX0NPTkZMSUNULCBib2R5OiBvbkNvbmZsaWN0IH07XG4gICAgICAgIGlmICh0aGlzLmNhbGxiYWNrKSB0aGlzLmNhbGxiYWNrLmFuc3dlckNvbmZsaWN0KHJwYyk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuUlBDW3R5cGVSUEMuUkVTT0xWRV9DT05GTElDVF0gPSAoY2hhaW46IElCbG9ja1tdKSA9PiB7XG4gICAgICBpZiAodGhpcy5vblJlc29sdmVDb25mbGljdCkgdGhpcy5vblJlc29sdmVDb25mbGljdChjaGFpbik7XG4gICAgfTtcbiAgfVxuXG4gIHJ1blJQQyhycGM6IFJQQykge1xuICAgIGlmIChPYmplY3Qua2V5cyh0aGlzLlJQQykuaW5jbHVkZXMocnBjLnR5cGUpKSB0aGlzLlJQQ1tycGMudHlwZV0ocnBjLmJvZHkpO1xuICB9XG5cbiAgcHJpdmF0ZSBjaGVja0NvbmZsaWN0cygpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJjaGVja0NvbmZsaWN0c1wiKTtcbiAgICAgIC8v44K/44Kk44Og44Ki44Km44OIXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcImNoZWNrY29uZmxpY3RzIHRpbWVvdXRcIik7XG4gICAgICB9LCA0ICogMTAwMCk7XG5cbiAgICAgIGNvbnN0IGNvbmZsaWN0OiBJQ29uZmxpY3QgPSB7XG4gICAgICAgIHNpemU6IHRoaXMuYmMuY2hhaW4ubGVuZ3RoLFxuICAgICAgICBhZGRyZXNzOiB0aGlzLmJjLmFkZHJlc3NcbiAgICAgIH07XG4gICAgICBjb25zdCBycGM6IFJQQyA9IHsgdHlwZTogdHlwZVJQQy5DT05GTElDVCwgYm9keTogY29uZmxpY3QgfTtcbiAgICAgIC8v5LuW44Gu44OO44O844OJ44Gr44OW44Ot44OD44Kv44OB44Kn44O844Oz44Gu54q25rOB44KS6IGe44GPXG4gICAgICBpZiAodGhpcy5jYWxsYmFjaykgdGhpcy5jYWxsYmFjay5saXN0ZW5Db25maWxpY3QocnBjKTtcblxuICAgICAgLy/ku5bjga7jg47jg7zjg4njgYvjgonjga7lm57nrZTjgpLoqr/jgbnjgotcbiAgICAgIHRoaXMub25SZXNvbHZlQ29uZmxpY3QgPSAoY2hhaW46IEFycmF5PGFueT4pID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJvblJlc29sdmVDb25mbGljdFwiKTtcbiAgICAgICAgaWYgKHRoaXMuYmMuY2hhaW4ubGVuZ3RoIDwgY2hhaW4ubGVuZ3RoKSB7XG4gICAgICAgICAgaWYgKHRoaXMuYmMudmFsaWRDaGFpbihjaGFpbikpIHtcbiAgICAgICAgICAgIHRoaXMuYmMuY2hhaW4gPSBjaGFpbjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJjb25mbGljdCB3cm9uZyBjaGFpblwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxufVxuIl19