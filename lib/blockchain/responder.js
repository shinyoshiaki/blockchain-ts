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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL3Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJ0eXBlUlBDIiwiUmVzcG9uZGVyIiwiX2JjIiwiY2FsbGJhY2siLCJ0cmFuc2FjdGlvbiIsIm9uVHJhbnNhY3Rpb24iLCJiYyIsIlJQQyIsIk5FV0JMT0NLIiwiYmxvY2siLCJjb25zb2xlIiwibG9nIiwiaW5kZXgiLCJjaGFpbiIsImxlbmd0aCIsImNoZWNrQ29uZmxpY3RzIiwiY2F0Y2giLCJhZGRCbG9jayIsIlRSQU5TQUNSSU9OIiwiYm9keSIsImpzb25TdHIiLCJjdXJyZW50VHJhbnNhY3Rpb25zIiwiaW5jbHVkZXMiLCJhZGRUcmFuc2FjdGlvbiIsIm11bHRpc2lnIiwicmVzcG9uZGVyIiwiY29udHJhY3QiLCJldmVudHMiLCJDT05GTElDVCIsInNpemUiLCJvbkNvbmZsaWN0IiwibGlzdGVuckFkZHJlc3MiLCJhZGRyZXNzIiwicnBjIiwidHlwZSIsIlJFU09MVkVfQ09ORkxJQ1QiLCJhbnN3ZXJDb25mbGljdCIsIm9uUmVzb2x2ZUNvbmZsaWN0IiwiT2JqZWN0Iiwia2V5cyIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwidGltZW91dCIsInNldFRpbWVvdXQiLCJjb25mbGljdCIsImxpc3RlbkNvbmZsaWN0IiwidmFsaWRDaGFpbiIsImNsZWFyVGltZW91dCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUVBOzs7Ozs7Ozs7Ozs7OztJQXVCWUEsTzs7O1dBQUFBLE87QUFBQUEsRUFBQUEsTztBQUFBQSxFQUFBQSxPO0FBQUFBLEVBQUFBLE87QUFBQUEsRUFBQUEsTztHQUFBQSxPLHVCQUFBQSxPOztJQU9TQyxTOzs7QUFPbkIscUJBQVlDLEdBQVosRUFBZ0NDLFFBQWhDLEVBQStEO0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUEsMkNBSjlCLEVBSThCOztBQUFBLG9DQUh0RDtBQUFFQyxNQUFBQSxXQUFXLEVBQUUsS0FBS0M7QUFBcEIsS0FHc0Q7O0FBQUE7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SSxpQkFBTCxHQUF5QixVQUFDeEIsS0FBRCxFQUFxQjtBQUM1Q0gsVUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksbUJBQVosRUFBaUMsTUFBSSxDQUFDTCxFQUFMLENBQVFPLEtBQVIsQ0FBY0MsTUFBL0MsRUFBdURELEtBQUssQ0FBQ0MsTUFBN0Q7O0FBQ0EsY0FBSSxNQUFJLENBQUNSLEVBQUwsQ0FBUU8sS0FBUixDQUFjQyxNQUFkLEdBQXVCRCxLQUFLLENBQUNDLE1BQWpDLEVBQXlDO0FBQ3ZDLGdCQUFJLE1BQUksQ0FBQ1IsRUFBTCxDQUFReUMsVUFBUixDQUFtQmxDLEtBQW5CLENBQUosRUFBK0I7QUFDN0JILGNBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLFlBQVo7QUFDQSxjQUFBLE1BQUksQ0FBQ0wsRUFBTCxDQUFRTyxLQUFSLEdBQWdCQSxLQUFoQjtBQUNELGFBSEQsTUFHTztBQUNMSCxjQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxzQkFBWjtBQUNEO0FBQ0YsV0FQRCxNQU9PO0FBQ0xELFlBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLG9CQUFaO0FBQ0Q7O0FBQ0RxQyxVQUFBQSxZQUFZLENBQUNMLE9BQUQsQ0FBWjtBQUNBRixVQUFBQSxPQUFPLENBQUMsSUFBRCxDQUFQO0FBQ0QsU0FkRDtBQWVELE9BL0JNLENBQVA7QUFnQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJVHJhbnNhY3Rpb24sIElCbG9jayB9IGZyb20gXCIuL2Jsb2NrY2hhaW5cIjtcbmltcG9ydCBCbG9ja0NoYWluQXBwIGZyb20gXCIuL2Jsb2NrY2hhaW5BcHBcIjtcbmltcG9ydCB7IElFdmVudHMsIGV4Y3V0ZUV2ZW50IH0gZnJvbSBcIi4uL3V0aWxcIjtcblxuLy/jgrPjg7zjg6vjg5Djg4Pjgq/jga/lvLfliLbjgIHjgqTjg5njg7Pjg4jjga/ku7vmhI/jgavjgZfjgojjgYbjgajjgZfjgabjgYTjgotcbmV4cG9ydCBpbnRlcmZhY2UgSWNhbGxiYWNrUmVzcG9uZGVyIHtcbiAgbGlzdGVuQ29uZmxpY3Q6IChycGM6IFJQQykgPT4gdm9pZDtcbiAgYW5zd2VyQ29uZmxpY3Q6IChycGM6IFJQQykgPT4gdm9pZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBSUEMge1xuICB0eXBlOiB0eXBlUlBDO1xuICBib2R5OiBhbnk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUNvbmZsaWN0IHtcbiAgc2l6ZTogbnVtYmVyO1xuICBhZGRyZXNzOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSU9uQ29uZmxpY3Qge1xuICBjaGFpbjogSUJsb2NrW107XG4gIGxpc3RlbnJBZGRyZXNzOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBlbnVtIHR5cGVSUEMge1xuICBORVdCTE9DSyA9IFwiTkVXQkxPQ0tcIixcbiAgVFJBTlNBQ1JJT04gPSBcIlRSQU5TQUNSSU9OXCIsXG4gIENPTkZMSUNUID0gXCJDT05GTElDVFwiLFxuICBSRVNPTFZFX0NPTkZMSUNUID0gXCJSRVNPTFZFX0NPTkZMSUNUXCJcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVzcG9uZGVyIHtcbiAgY2FsbGJhY2s6IEljYWxsYmFja1Jlc3BvbmRlciB8IHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSBvblJlc29sdmVDb25mbGljdD86IChjaGFpbjogSUJsb2NrW10pID0+IHZvaWQ7XG4gIHByaXZhdGUgb25UcmFuc2FjdGlvbjogSUV2ZW50cyA9IHt9O1xuICBldmVudHMgPSB7IHRyYW5zYWN0aW9uOiB0aGlzLm9uVHJhbnNhY3Rpb24gfTtcbiAgYmM6IEJsb2NrQ2hhaW5BcHA7XG4gIFJQQzogYW55ID0ge307XG4gIGNvbnN0cnVjdG9yKF9iYzogQmxvY2tDaGFpbkFwcCwgY2FsbGJhY2s/OiBJY2FsbGJhY2tSZXNwb25kZXIpIHtcbiAgICB0aGlzLmJjID0gX2JjO1xuICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcblxuICAgIHRoaXMuUlBDW3R5cGVSUEMuTkVXQkxPQ0tdID0gYXN5bmMgKGJsb2NrOiBJQmxvY2spID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiYmxvY2tjaGFpbkFwcFwiLCBcIm5ldyBibG9ja1wiKTtcbiAgICAgIC8v5Y+X44GR5Y+W44Gj44Gf44OW44Ot44OD44Kv44Gu44Kk44Oz44OH44OD44Kv44K544GM6Ieq5YiG44Gu44OB44Kn44O844Oz44KI44KKMumVt+OBhOOBi1xuICAgICAgLy/nj77mmYLngrnjga7jg4Hjgqfjg7zjg7Pjga7plbfjgZXjgYwx44Gq44KJ44OW44Ot44OD44Kv44OB44Kn44O844Oz44Gu5YiG5bKQ44KS55aR44GGXG4gICAgICBpZiAoXG4gICAgICAgIGJsb2NrLmluZGV4ID4gdGhpcy5iYy5jaGFpbi5sZW5ndGggKyAxIHx8XG4gICAgICAgIHRoaXMuYmMuY2hhaW4ubGVuZ3RoID09PSAxXG4gICAgICApIHtcbiAgICAgICAgLy/jg5bjg63jg4Pjgq/jg4Hjgqfjg7zjg7Pjga7liIblspDjgpLoqr/jgbnjgotcbiAgICAgICAgYXdhaXQgdGhpcy5jaGVja0NvbmZsaWN0cygpLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8v5paw44GX44GE44OW44Ot44OD44Kv44KS5Y+X44GR5YWl44KM44KLXG4gICAgICAgIHRoaXMuYmMuYWRkQmxvY2soYmxvY2spO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OBq+WvvuOBmeOCi+WHpueQhlxuICAgIHRoaXMuUlBDW3R5cGVSUEMuVFJBTlNBQ1JJT05dID0gKGJvZHk6IElUcmFuc2FjdGlvbikgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJibG9ja2NoYWluQXBwIHRyYW5zYWN0aW9uXCIsIGJvZHkpO1xuICAgICAgaWYgKFxuICAgICAgICAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+ODl+ODvOODq+OBq+WPl+OBkeWPluOBo+OBn+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OBjOOBguOCi+OBi+ewoeaYk+eahOOBq+iqv+OBueOCi1xuICAgICAgICAhdGhpcy5iY1xuICAgICAgICAgIC5qc29uU3RyKHRoaXMuYmMuY3VycmVudFRyYW5zYWN0aW9ucylcbiAgICAgICAgICAuaW5jbHVkZXModGhpcy5iYy5qc29uU3RyKGJvZHkpKVxuICAgICAgKSB7XG4gICAgICAgIC8v44OI44Op44Oz44K244Kv44K344On44Oz44KS44OI44Op44Oz44K244Kv44K344On44Oz44OX44O844Or44Gr5Yqg44GI44KLXG4gICAgICAgIHRoaXMuYmMuYWRkVHJhbnNhY3Rpb24oYm9keSk7XG4gICAgICAgIHRoaXMuYmMubXVsdGlzaWcucmVzcG9uZGVyKGJvZHkpO1xuICAgICAgICB0aGlzLmJjLmNvbnRyYWN0LnJlc3BvbmRlcihib2R5KTtcbiAgICAgICAgZXhjdXRlRXZlbnQodGhpcy5ldmVudHMudHJhbnNhY3Rpb24sIGJvZHkpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLlJQQ1t0eXBlUlBDLkNPTkZMSUNUXSA9IChib2R5OiBJQ29uZmxpY3QpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiYmxvY2tjaGFpbiBhcHAgY2hlY2sgY29uZmxpY3RcIik7XG4gICAgICAvL+iHquWIhuOBruODgeOCp+ODvOODs+OBjOizquWVj+iAheOCiOOCiumVt+OBkeOCjOOBsOOAgeiHquWIhuOBruODgeOCp+ODvOODs+OCkui/lOOBmVxuICAgICAgaWYgKHRoaXMuYmMuY2hhaW4ubGVuZ3RoID4gYm9keS5zaXplKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgIFwiYmxvY2tjaGFpbiBhcHAgY2hlY2sgaXMgY29uZmxpY3RcIixcbiAgICAgICAgICB0aGlzLmJjLmNoYWluLmxlbmd0aCxcbiAgICAgICAgICBib2R5LnNpemVcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3Qgb25Db25mbGljdDogSU9uQ29uZmxpY3QgPSB7XG4gICAgICAgICAgY2hhaW46IHRoaXMuYmMuY2hhaW4sXG4gICAgICAgICAgbGlzdGVuckFkZHJlc3M6IGJvZHkuYWRkcmVzc1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBycGM6IFJQQyA9IHsgdHlwZTogdHlwZVJQQy5SRVNPTFZFX0NPTkZMSUNULCBib2R5OiBvbkNvbmZsaWN0IH07XG4gICAgICAgIGlmICh0aGlzLmNhbGxiYWNrKSB0aGlzLmNhbGxiYWNrLmFuc3dlckNvbmZsaWN0KHJwYyk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuUlBDW3R5cGVSUEMuUkVTT0xWRV9DT05GTElDVF0gPSAoY2hhaW46IElCbG9ja1tdKSA9PiB7XG4gICAgICBpZiAodGhpcy5vblJlc29sdmVDb25mbGljdCkgdGhpcy5vblJlc29sdmVDb25mbGljdChjaGFpbik7XG4gICAgfTtcbiAgfVxuXG4gIHJ1blJQQyhycGM6IFJQQykge1xuICAgIGlmIChPYmplY3Qua2V5cyh0aGlzLlJQQykuaW5jbHVkZXMocnBjLnR5cGUpKSB0aGlzLlJQQ1tycGMudHlwZV0ocnBjLmJvZHkpO1xuICB9XG5cbiAgcHJpdmF0ZSBjaGVja0NvbmZsaWN0cygpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJjaGVja0NvbmZsaWN0c1wiKTtcbiAgICAgIC8v44K/44Kk44Og44Ki44Km44OIXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcImNoZWNrY29uZmxpY3RzIHRpbWVvdXRcIik7XG4gICAgICB9LCA0ICogMTAwMCk7XG5cbiAgICAgIGNvbnN0IGNvbmZsaWN0OiBJQ29uZmxpY3QgPSB7XG4gICAgICAgIHNpemU6IHRoaXMuYmMuY2hhaW4ubGVuZ3RoLFxuICAgICAgICBhZGRyZXNzOiB0aGlzLmJjLmFkZHJlc3NcbiAgICAgIH07XG4gICAgICBjb25zdCBycGM6IFJQQyA9IHsgdHlwZTogdHlwZVJQQy5DT05GTElDVCwgYm9keTogY29uZmxpY3QgfTtcbiAgICAgIC8v5LuW44Gu44OO44O844OJ44Gr44OW44Ot44OD44Kv44OB44Kn44O844Oz44Gu54q25rOB44KS6IGe44GPXG4gICAgICBpZiAodGhpcy5jYWxsYmFjaykgdGhpcy5jYWxsYmFjay5saXN0ZW5Db25mbGljdChycGMpO1xuXG4gICAgICAvL+S7luOBruODjuODvOODieOBi+OCieOBruWbnuetlOOCkuiqv+OBueOCi1xuICAgICAgdGhpcy5vblJlc29sdmVDb25mbGljdCA9IChjaGFpbjogSUJsb2NrW10pID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJvblJlc29sdmVDb25mbGljdFwiLCB0aGlzLmJjLmNoYWluLmxlbmd0aCwgY2hhaW4ubGVuZ3RoKTtcbiAgICAgICAgaWYgKHRoaXMuYmMuY2hhaW4ubGVuZ3RoIDwgY2hhaW4ubGVuZ3RoKSB7XG4gICAgICAgICAgaWYgKHRoaXMuYmMudmFsaWRDaGFpbihjaGFpbikpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwic3dhcCBjaGFpblwiKTtcbiAgICAgICAgICAgIHRoaXMuYmMuY2hhaW4gPSBjaGFpbjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJjb25mbGljdCB3cm9uZyBjaGFpblwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJteSBjaGFpbiBpcyBsb25nZXJcIik7XG4gICAgICAgIH1cbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxufVxuIl19