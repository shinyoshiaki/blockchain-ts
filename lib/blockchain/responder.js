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
            if (_this2.bc.validChain(chain)) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL3Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJ0eXBlUlBDIiwiUmVzcG9uZGVyIiwiX2JjIiwiY2FsbGJhY2siLCJ0cmFuc2FjdGlvbiIsIm9uVHJhbnNhY3Rpb24iLCJiYyIsIlJQQyIsIk5FV0JMT0NLIiwiYmxvY2siLCJjb25zb2xlIiwibG9nIiwiaW5kZXgiLCJjaGFpbiIsImxlbmd0aCIsImNoZWNrQ29uZmxpY3RzIiwiY2F0Y2giLCJhZGRCbG9jayIsIlRSQU5TQUNSSU9OIiwiYm9keSIsImpzb25TdHIiLCJjdXJyZW50VHJhbnNhY3Rpb25zIiwiaW5jbHVkZXMiLCJhZGRUcmFuc2FjdGlvbiIsIm11bHRpc2lnIiwicmVzcG9uZGVyIiwiY29udHJhY3QiLCJldmVudHMiLCJDT05GTElDVCIsInNpemUiLCJvbkNvbmZsaWN0IiwibGlzdGVuckFkZHJlc3MiLCJhZGRyZXNzIiwicnBjIiwidHlwZSIsIlJFU09MVkVfQ09ORkxJQ1QiLCJhbnN3ZXJDb25mbGljdCIsIm9uUmVzb2x2ZUNvbmZsaWN0IiwiT2JqZWN0Iiwia2V5cyIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwidGltZW91dCIsInNldFRpbWVvdXQiLCJjb25mbGljdCIsImxpc3RlbkNvbmZsaWN0IiwidmFsaWRDaGFpbiIsImNsZWFyVGltZW91dCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUVBOzs7Ozs7Ozs7Ozs7OztJQXVCWUEsTzs7O1dBQUFBLE87QUFBQUEsRUFBQUEsTztBQUFBQSxFQUFBQSxPO0FBQUFBLEVBQUFBLE87QUFBQUEsRUFBQUEsTztHQUFBQSxPLHVCQUFBQSxPOztJQU9TQyxTOzs7QUFPbkIscUJBQVlDLEdBQVosRUFBZ0NDLFFBQWhDLEVBQStEO0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUEsMkNBSjlCLEVBSThCOztBQUFBLG9DQUh0RDtBQUFFQyxNQUFBQSxXQUFXLEVBQUUsS0FBS0M7QUFBcEIsS0FHc0Q7O0FBQUE7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QSxNQUFJLENBQUNJLGlCQUFMLEdBQXlCLFVBQUN4QixLQUFELEVBQXFCO0FBQzVDSCxVQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxtQkFBWixFQUFpQyxNQUFJLENBQUNMLEVBQUwsQ0FBUU8sS0FBUixDQUFjQyxNQUEvQyxFQUF1REQsS0FBSyxDQUFDQyxNQUE3RDs7QUFDQSxjQUFJLE1BQUksQ0FBQ1IsRUFBTCxDQUFRTyxLQUFSLENBQWNDLE1BQWQsR0FBdUJELEtBQUssQ0FBQ0MsTUFBakMsRUFBeUM7QUFDdkMsZ0JBQUksTUFBSSxDQUFDUixFQUFMLENBQVF5QyxVQUFSLENBQW1CbEMsS0FBbkIsQ0FBSixFQUErQjtBQUM3QkgsY0FBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksWUFBWjtBQUNBLGNBQUEsTUFBSSxDQUFDTCxFQUFMLENBQVFPLEtBQVIsR0FBZ0JBLEtBQWhCO0FBQ0QsYUFIRCxNQUdPO0FBQ0xILGNBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLHNCQUFaO0FBQ0Q7QUFDRixXQVBELE1BT087QUFDTEQsWUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksb0JBQVo7QUFDRDs7QUFDRHFDLFVBQUFBLFlBQVksQ0FBQ0wsT0FBRCxDQUFaO0FBQ0FGLFVBQUFBLE9BQU8sQ0FBQyxJQUFELENBQVA7QUFDRCxTQWREO0FBZUQsT0EvQk0sQ0FBUDtBQWdDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElUcmFuc2FjdGlvbiwgSUJsb2NrIH0gZnJvbSBcIi4vYmxvY2tjaGFpblwiO1xuaW1wb3J0IEJsb2NrQ2hhaW5BcHAgZnJvbSBcIi4vYmxvY2tjaGFpbkFwcFwiO1xuaW1wb3J0IHsgSUV2ZW50cywgZXhjdXRlRXZlbnQgfSBmcm9tIFwiLi4vdXRpbFwiO1xuXG4vL+OCs+ODvOODq+ODkOODg+OCr+OBr+W8t+WItuOAgeOCpOODmeODs+ODiOOBr+S7u+aEj+OBq+OBl+OCiOOBhuOBqOOBl+OBpuOBhOOCi1xuZXhwb3J0IGludGVyZmFjZSBJY2FsbGJhY2tSZXNwb25kZXIge1xuICBsaXN0ZW5Db25mbGljdDogKHJwYzogUlBDKSA9PiB2b2lkO1xuICBhbnN3ZXJDb25mbGljdDogKHJwYzogUlBDKSA9PiB2b2lkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJQQyB7XG4gIHR5cGU6IHR5cGVSUEM7XG4gIGJvZHk6IGFueTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJQ29uZmxpY3Qge1xuICBzaXplOiBudW1iZXI7XG4gIGFkZHJlc3M6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJT25Db25mbGljdCB7XG4gIGNoYWluOiBJQmxvY2tbXTtcbiAgbGlzdGVuckFkZHJlc3M6IHN0cmluZztcbn1cblxuZXhwb3J0IGVudW0gdHlwZVJQQyB7XG4gIE5FV0JMT0NLID0gXCJORVdCTE9DS1wiLFxuICBUUkFOU0FDUklPTiA9IFwiVFJBTlNBQ1JJT05cIixcbiAgQ09ORkxJQ1QgPSBcIkNPTkZMSUNUXCIsXG4gIFJFU09MVkVfQ09ORkxJQ1QgPSBcIlJFU09MVkVfQ09ORkxJQ1RcIlxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXNwb25kZXIge1xuICBjYWxsYmFjazogSWNhbGxiYWNrUmVzcG9uZGVyIHwgdW5kZWZpbmVkO1xuICBwcml2YXRlIG9uUmVzb2x2ZUNvbmZsaWN0PzogKGNoYWluOiBJQmxvY2tbXSkgPT4gdm9pZDtcbiAgcHJpdmF0ZSBvblRyYW5zYWN0aW9uOiBJRXZlbnRzID0ge307XG4gIGV2ZW50cyA9IHsgdHJhbnNhY3Rpb246IHRoaXMub25UcmFuc2FjdGlvbiB9O1xuICBiYzogQmxvY2tDaGFpbkFwcDtcbiAgUlBDOiBhbnkgPSB7fTtcbiAgY29uc3RydWN0b3IoX2JjOiBCbG9ja0NoYWluQXBwLCBjYWxsYmFjaz86IEljYWxsYmFja1Jlc3BvbmRlcikge1xuICAgIHRoaXMuYmMgPSBfYmM7XG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgdGhpcy5SUENbdHlwZVJQQy5ORVdCTE9DS10gPSBhc3luYyAoYmxvY2s6IElCbG9jaykgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJibG9ja2NoYWluQXBwXCIsIFwibmV3IGJsb2NrXCIpO1xuICAgICAgLy/lj5fjgZHlj5bjgaPjgZ/jg5bjg63jg4Pjgq/jga7jgqTjg7Pjg4fjg4Pjgq/jgrnjgYzoh6rliIbjga7jg4Hjgqfjg7zjg7Pjgojjgooy6ZW344GE44GLXG4gICAgICAvL+ePvuaZgueCueOBruODgeOCp+ODvOODs+OBrumVt+OBleOBjDHjgarjgonjg5bjg63jg4Pjgq/jg4Hjgqfjg7zjg7Pjga7liIblspDjgpLnlpHjgYZcbiAgICAgIGlmIChcbiAgICAgICAgYmxvY2suaW5kZXggPiB0aGlzLmJjLmNoYWluLmxlbmd0aCArIDEgfHxcbiAgICAgICAgdGhpcy5iYy5jaGFpbi5sZW5ndGggPT09IDFcbiAgICAgICkge1xuICAgICAgICAvL+ODluODreODg+OCr+ODgeOCp+ODvOODs+OBruWIhuWykOOCkuiqv+OBueOCi1xuICAgICAgICBhd2FpdCB0aGlzLmNoZWNrQ29uZmxpY3RzKCkuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy/mlrDjgZfjgYTjg5bjg63jg4Pjgq/jgpLlj5fjgZHlhaXjgozjgotcbiAgICAgICAgdGhpcy5iYy5hZGRCbG9jayhibG9jayk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8v44OI44Op44Oz44K244Kv44K344On44Oz44Gr5a++44GZ44KL5Yem55CGXG4gICAgdGhpcy5SUENbdHlwZVJQQy5UUkFOU0FDUklPTl0gPSAoYm9keTogSVRyYW5zYWN0aW9uKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImJsb2NrY2hhaW5BcHAgdHJhbnNhY3Rpb25cIiwgYm9keSk7XG4gICAgICBpZiAoXG4gICAgICAgIC8v44OI44Op44Oz44K244Kv44K344On44Oz44OX44O844Or44Gr5Y+X44GR5Y+W44Gj44Gf44OI44Op44Oz44K244Kv44K344On44Oz44GM44GC44KL44GL57Ch5piT55qE44Gr6Kq/44G544KLXG4gICAgICAgICF0aGlzLmJjXG4gICAgICAgICAgLmpzb25TdHIodGhpcy5iYy5jdXJyZW50VHJhbnNhY3Rpb25zKVxuICAgICAgICAgIC5pbmNsdWRlcyh0aGlzLmJjLmpzb25TdHIoYm9keSkpXG4gICAgICApIHtcbiAgICAgICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgpLjg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7Pjg5fjg7zjg6vjgavliqDjgYjjgotcbiAgICAgICAgdGhpcy5iYy5hZGRUcmFuc2FjdGlvbihib2R5KTtcbiAgICAgICAgdGhpcy5iYy5tdWx0aXNpZy5yZXNwb25kZXIoYm9keSk7XG4gICAgICAgIHRoaXMuYmMuY29udHJhY3QucmVzcG9uZGVyKGJvZHkpO1xuICAgICAgICBleGN1dGVFdmVudCh0aGlzLmV2ZW50cy50cmFuc2FjdGlvbiwgYm9keSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuUlBDW3R5cGVSUEMuQ09ORkxJQ1RdID0gKGJvZHk6IElDb25mbGljdCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJibG9ja2NoYWluIGFwcCBjaGVjayBjb25mbGljdFwiKTtcbiAgICAgIC8v6Ieq5YiG44Gu44OB44Kn44O844Oz44GM6LOq5ZWP6ICF44KI44KK6ZW344GR44KM44Gw44CB6Ieq5YiG44Gu44OB44Kn44O844Oz44KS6L+U44GZXG4gICAgICBpZiAodGhpcy5iYy5jaGFpbi5sZW5ndGggPiBib2R5LnNpemUpIHtcbiAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgXCJibG9ja2NoYWluIGFwcCBjaGVjayBpcyBjb25mbGljdFwiLFxuICAgICAgICAgIHRoaXMuYmMuY2hhaW4ubGVuZ3RoLFxuICAgICAgICAgIGJvZHkuc2l6ZVxuICAgICAgICApO1xuICAgICAgICBjb25zdCBvbkNvbmZsaWN0OiBJT25Db25mbGljdCA9IHtcbiAgICAgICAgICBjaGFpbjogdGhpcy5iYy5jaGFpbixcbiAgICAgICAgICBsaXN0ZW5yQWRkcmVzczogYm9keS5hZGRyZXNzXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHJwYzogUlBDID0geyB0eXBlOiB0eXBlUlBDLlJFU09MVkVfQ09ORkxJQ1QsIGJvZHk6IG9uQ29uZmxpY3QgfTtcbiAgICAgICAgaWYgKHRoaXMuY2FsbGJhY2spIHRoaXMuY2FsbGJhY2suYW5zd2VyQ29uZmxpY3QocnBjKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5SUENbdHlwZVJQQy5SRVNPTFZFX0NPTkZMSUNUXSA9IChib2R5OiBJT25Db25mbGljdCkgPT4ge1xuICAgICAgaWYgKHRoaXMub25SZXNvbHZlQ29uZmxpY3QpIHRoaXMub25SZXNvbHZlQ29uZmxpY3QoYm9keS5jaGFpbik7XG4gICAgfTtcbiAgfVxuXG4gIHJ1blJQQyhycGM6IFJQQykge1xuICAgIGlmIChPYmplY3Qua2V5cyh0aGlzLlJQQykuaW5jbHVkZXMocnBjLnR5cGUpKSB0aGlzLlJQQ1tycGMudHlwZV0ocnBjLmJvZHkpO1xuICB9XG5cbiAgcHJpdmF0ZSBjaGVja0NvbmZsaWN0cygpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJjaGVja0NvbmZsaWN0c1wiKTtcbiAgICAgIC8v44K/44Kk44Og44Ki44Km44OIXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcImNoZWNrY29uZmxpY3RzIHRpbWVvdXRcIik7XG4gICAgICB9LCA0ICogMTAwMCk7XG5cbiAgICAgIGNvbnN0IGNvbmZsaWN0OiBJQ29uZmxpY3QgPSB7XG4gICAgICAgIHNpemU6IHRoaXMuYmMuY2hhaW4ubGVuZ3RoLFxuICAgICAgICBhZGRyZXNzOiB0aGlzLmJjLmFkZHJlc3NcbiAgICAgIH07XG4gICAgICBjb25zdCBycGM6IFJQQyA9IHsgdHlwZTogdHlwZVJQQy5DT05GTElDVCwgYm9keTogY29uZmxpY3QgfTtcbiAgICAgIC8v5LuW44Gu44OO44O844OJ44Gr44OW44Ot44OD44Kv44OB44Kn44O844Oz44Gu54q25rOB44KS6IGe44GPXG4gICAgICBpZiAodGhpcy5jYWxsYmFjaykgdGhpcy5jYWxsYmFjay5saXN0ZW5Db25mbGljdChycGMpO1xuXG4gICAgICAvL+S7luOBruODjuODvOODieOBi+OCieOBruWbnuetlOOCkuiqv+OBueOCi1xuICAgICAgdGhpcy5vblJlc29sdmVDb25mbGljdCA9IChjaGFpbjogSUJsb2NrW10pID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJvblJlc29sdmVDb25mbGljdFwiLCB0aGlzLmJjLmNoYWluLmxlbmd0aCwgY2hhaW4ubGVuZ3RoKTtcbiAgICAgICAgaWYgKHRoaXMuYmMuY2hhaW4ubGVuZ3RoIDwgY2hhaW4ubGVuZ3RoKSB7XG4gICAgICAgICAgaWYgKHRoaXMuYmMudmFsaWRDaGFpbihjaGFpbikpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwic3dhcCBjaGFpblwiKTtcbiAgICAgICAgICAgIHRoaXMuYmMuY2hhaW4gPSBjaGFpbjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJjb25mbGljdCB3cm9uZyBjaGFpblwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJteSBjaGFpbiBpcyBsb25nZXJcIik7XG4gICAgICAgIH1cbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxufVxuIl19