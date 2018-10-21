"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.type = void 0;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

//コールバックは強制、イベントは任意にしようとしている
var type;
exports.type = type;

(function (type) {
  type["NEWBLOCK"] = "NEWBLOCK";
  type["TRANSACRION"] = "TRANSACRION";
  type["CONFLICT"] = "CONFLICT";
  type["RESOLVE_CONFLICT"] = "RESOLVE_CONFLICT";
})(type || (exports.type = type = {}));

var Responder =
/*#__PURE__*/
function () {
  function Responder(_bc) {
    var _this = this;

    _classCallCheck(this, Responder);

    _defineProperty(this, "callback", void 0);

    _defineProperty(this, "onResolveConflict", void 0);

    _defineProperty(this, "bc", void 0);

    _defineProperty(this, "RPC", {});

    this.bc = _bc;

    this.RPC[type.NEWBLOCK] =
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


    this.RPC[type.TRANSACRION] = function (body) {
      console.log("blockchainApp transaction", body);

      if ( //トランザクションプールに受け取ったトランザクションがあるか簡易的に調べる
      !_this.bc.jsonStr(_this.bc.currentTransactions).includes(_this.bc.jsonStr(body))) {
        //トランザクションをトランザクションプールに加える
        _this.bc.addTransaction(body);
      }
    };

    this.RPC[type.CONFLICT] = function (body) {
      console.log("blockchain app check conflict"); //自分のチェーンが質問者より長ければ、自分のチェーンを返す

      if (_this.bc.chain.length > body.size) {
        console.log("blockchain app check is conflict");
        if (_this.callback) _this.callback.onConflict(_this.bc.chain, body.nodeId);
      }
    };

    this.RPC[type.RESOLVE_CONFLICT] = function (chain) {
      if (_this.onResolveConflict) _this.onResolveConflict(chain);
    };
  }

  _createClass(Responder, [{
    key: "runRPC",
    value: function runRPC(name, body) {
      if (Object.keys(this.RPC).includes(name)) this.RPC[name](body);
    }
  }, {
    key: "checkConflicts",
    value: function checkConflicts() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        console.log("checkConflicts"); //タイムアウト

        var timeout = setTimeout(function () {
          reject("checkconflicts timeout");
        }, 4 * 1000); //他のノードにブロックチェーンの状況を聞く

        if (_this2.callback) _this2.callback.checkConflict(); //他のノードからの回答を調べる

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL3Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJ0eXBlIiwiUmVzcG9uZGVyIiwiX2JjIiwiYmMiLCJSUEMiLCJORVdCTE9DSyIsImJsb2NrIiwiY29uc29sZSIsImxvZyIsImluZGV4IiwiY2hhaW4iLCJsZW5ndGgiLCJjaGVja0NvbmZsaWN0cyIsImNhdGNoIiwiYWRkQmxvY2siLCJUUkFOU0FDUklPTiIsImJvZHkiLCJqc29uU3RyIiwiY3VycmVudFRyYW5zYWN0aW9ucyIsImluY2x1ZGVzIiwiYWRkVHJhbnNhY3Rpb24iLCJDT05GTElDVCIsInNpemUiLCJjYWxsYmFjayIsIm9uQ29uZmxpY3QiLCJub2RlSWQiLCJSRVNPTFZFX0NPTkZMSUNUIiwib25SZXNvbHZlQ29uZmxpY3QiLCJuYW1lIiwiT2JqZWN0Iiwia2V5cyIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwidGltZW91dCIsInNldFRpbWVvdXQiLCJjaGVja0NvbmZsaWN0IiwidmFsaWRDaGFpbiIsImNsZWFyVGltZW91dCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBO0lBTVlBLEk7OztXQUFBQSxJO0FBQUFBLEVBQUFBLEk7QUFBQUEsRUFBQUEsSTtBQUFBQSxFQUFBQSxJO0FBQUFBLEVBQUFBLEk7R0FBQUEsSSxvQkFBQUEsSTs7SUFPU0MsUzs7O0FBS25CLHFCQUFZQyxHQUFaLEVBQTZCO0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUEsaUNBRGxCLEVBQ2tCOztBQUMzQixTQUFLQyxFQUFMLEdBQVVELEdBQVY7O0FBRUEsU0FBS0UsR0FBTCxDQUFTSixJQUFJLENBQUNLLFFBQWQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLDhCQUEwQixpQkFBT0MsS0FBUDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ3hCQyxnQkFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksZUFBWixFQUE2QixXQUE3QixFQUR3QixDQUV4QjtB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QVo7O0FBQ0EsY0FBSSxNQUFJLENBQUNMLEVBQUwsQ0FBUU8sS0FBUixDQUFjQyxNQUFkLEdBQXVCRCxLQUFLLENBQUNDLE1BQWpDLEVBQXlDO0FBQ3ZDLGdCQUFJLE1BQUksQ0FBQ1IsRUFBTCxDQUFRa0MsVUFBUixDQUFtQjNCLEtBQW5CLENBQUosRUFBK0I7QUFDN0IsY0FBQSxNQUFJLENBQUNQLEVBQUwsQ0FBUU8sS0FBUixHQUFnQkEsS0FBaEI7QUFDRCxhQUZELE1BRU87QUFDTEgsY0FBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksc0JBQVo7QUFDRDtBQUNGOztBQUNEOEIsVUFBQUEsWUFBWSxDQUFDSixPQUFELENBQVo7QUFDQUYsVUFBQUEsT0FBTyxDQUFDLElBQUQsQ0FBUDtBQUNELFNBWEQ7QUFZRCxPQXZCTSxDQUFQO0FBd0JEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEJsb2NrQ2hhaW4gZnJvbSBcIi4vYmxvY2tjaGFpblwiO1xuXG4vL+OCs+ODvOODq+ODkOODg+OCr+OBr+W8t+WItuOAgeOCpOODmeODs+ODiOOBr+S7u+aEj+OBq+OBl+OCiOOBhuOBqOOBl+OBpuOBhOOCi1xuaW50ZXJmYWNlIGNhbGxiYWNrIHtcbiAgY2hlY2tDb25mbGljdDogKHY/OiBhbnkpID0+IHZvaWQ7XG4gIG9uQ29uZmxpY3Q6IChjaGFpbjogYW55LCBub2RlSWQ6IGFueSkgPT4gdm9pZDtcbn1cblxuZXhwb3J0IGVudW0gdHlwZSB7XG4gIE5FV0JMT0NLID0gXCJORVdCTE9DS1wiLFxuICBUUkFOU0FDUklPTiA9IFwiVFJBTlNBQ1JJT05cIixcbiAgQ09ORkxJQ1QgPSBcIkNPTkZMSUNUXCIsXG4gIFJFU09MVkVfQ09ORkxJQ1QgPSBcIlJFU09MVkVfQ09ORkxJQ1RcIlxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXNwb25kZXIge1xuICBjYWxsYmFjaz86IGNhbGxiYWNrO1xuICBvblJlc29sdmVDb25mbGljdD86IChjaGFpbjogQXJyYXk8YW55PikgPT4gdm9pZDtcbiAgYmM6IEJsb2NrQ2hhaW47XG4gIFJQQzogYW55ID0ge307XG4gIGNvbnN0cnVjdG9yKF9iYzogQmxvY2tDaGFpbikge1xuICAgIHRoaXMuYmMgPSBfYmM7XG5cbiAgICB0aGlzLlJQQ1t0eXBlLk5FV0JMT0NLXSA9IGFzeW5jIChibG9jazogYW55KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImJsb2NrY2hhaW5BcHBcIiwgXCJuZXcgYmxvY2tcIik7XG4gICAgICAvL+WPl+OBkeWPluOBo+OBn+ODluODreODg+OCr+OBruOCpOODs+ODh+ODg+OCr+OCueOBjOiHquWIhuOBruODgeOCp+ODvOODs+OCiOOCijLplbfjgYTjgYtcbiAgICAgIC8v54++5pmC54K544Gu44OB44Kn44O844Oz44Gu6ZW344GV44GMMeOBquOCieODluODreODg+OCr+ODgeOCp+ODvOODs+OBruWIhuWykOOCkueWkeOBhlxuICAgICAgaWYgKFxuICAgICAgICBibG9jay5pbmRleCA+IHRoaXMuYmMuY2hhaW4ubGVuZ3RoICsgMSB8fFxuICAgICAgICB0aGlzLmJjLmNoYWluLmxlbmd0aCA9PT0gMVxuICAgICAgKSB7XG4gICAgICAgIC8v44OW44Ot44OD44Kv44OB44Kn44O844Oz44Gu5YiG5bKQ44KS6Kq/44G544KLXG4gICAgICAgIGF3YWl0IHRoaXMuY2hlY2tDb25mbGljdHMoKS5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvL+aWsOOBl+OBhOODluODreODg+OCr+OCkuWPl+OBkeWFpeOCjOOCi1xuICAgICAgICB0aGlzLmJjLmFkZEJsb2NrKGJsb2NrKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7Pjgavlr77jgZnjgovlh6bnkIZcbiAgICB0aGlzLlJQQ1t0eXBlLlRSQU5TQUNSSU9OXSA9IChib2R5OiBhbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiYmxvY2tjaGFpbkFwcCB0cmFuc2FjdGlvblwiLCBib2R5KTtcbiAgICAgIGlmIChcbiAgICAgICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7Pjg5fjg7zjg6vjgavlj5fjgZHlj5bjgaPjgZ/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgYzjgYLjgovjgYvnsKHmmJPnmoTjgavoqr/jgbnjgotcbiAgICAgICAgIXRoaXMuYmNcbiAgICAgICAgICAuanNvblN0cih0aGlzLmJjLmN1cnJlbnRUcmFuc2FjdGlvbnMpXG4gICAgICAgICAgLmluY2x1ZGVzKHRoaXMuYmMuanNvblN0cihib2R5KSlcbiAgICAgICkge1xuICAgICAgICAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OCkuODiOODqeODs+OCtuOCr+OCt+ODp+ODs+ODl+ODvOODq+OBq+WKoOOBiOOCi1xuICAgICAgICB0aGlzLmJjLmFkZFRyYW5zYWN0aW9uKGJvZHkpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLlJQQ1t0eXBlLkNPTkZMSUNUXSA9IChib2R5OiBhbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiYmxvY2tjaGFpbiBhcHAgY2hlY2sgY29uZmxpY3RcIik7XG4gICAgICAvL+iHquWIhuOBruODgeOCp+ODvOODs+OBjOizquWVj+iAheOCiOOCiumVt+OBkeOCjOOBsOOAgeiHquWIhuOBruODgeOCp+ODvOODs+OCkui/lOOBmVxuICAgICAgaWYgKHRoaXMuYmMuY2hhaW4ubGVuZ3RoID4gYm9keS5zaXplKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiYmxvY2tjaGFpbiBhcHAgY2hlY2sgaXMgY29uZmxpY3RcIik7XG4gICAgICAgIGlmICh0aGlzLmNhbGxiYWNrKSB0aGlzLmNhbGxiYWNrLm9uQ29uZmxpY3QodGhpcy5iYy5jaGFpbiwgYm9keS5ub2RlSWQpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLlJQQ1t0eXBlLlJFU09MVkVfQ09ORkxJQ1RdID0gKGNoYWluOiBBcnJheTxhbnk+KSA9PiB7XG4gICAgICBpZiAodGhpcy5vblJlc29sdmVDb25mbGljdCkgdGhpcy5vblJlc29sdmVDb25mbGljdChjaGFpbik7XG4gICAgfTtcbiAgfVxuXG4gIHJ1blJQQyhuYW1lOiB0eXBlLCBib2R5OiBhbnkpIHtcbiAgICBpZiAoT2JqZWN0LmtleXModGhpcy5SUEMpLmluY2x1ZGVzKG5hbWUpKSB0aGlzLlJQQ1tuYW1lXShib2R5KTtcbiAgfVxuXG4gIHByaXZhdGUgY2hlY2tDb25mbGljdHMoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiY2hlY2tDb25mbGljdHNcIik7XG4gICAgICAvL+OCv+OCpOODoOOCouOCpuODiFxuICAgICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZWplY3QoXCJjaGVja2NvbmZsaWN0cyB0aW1lb3V0XCIpO1xuICAgICAgfSwgNCAqIDEwMDApO1xuXG4gICAgICAvL+S7luOBruODjuODvOODieOBq+ODluODreODg+OCr+ODgeOCp+ODvOODs+OBrueKtuazgeOCkuiBnuOBj1xuICAgICAgaWYgKHRoaXMuY2FsbGJhY2spIHRoaXMuY2FsbGJhY2suY2hlY2tDb25mbGljdCgpO1xuXG4gICAgICAvL+S7luOBruODjuODvOODieOBi+OCieOBruWbnuetlOOCkuiqv+OBueOCi1xuICAgICAgdGhpcy5vblJlc29sdmVDb25mbGljdCA9IChjaGFpbjogQXJyYXk8YW55PikgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm9uUmVzb2x2ZUNvbmZsaWN0XCIpO1xuICAgICAgICBpZiAodGhpcy5iYy5jaGFpbi5sZW5ndGggPCBjaGFpbi5sZW5ndGgpIHtcbiAgICAgICAgICBpZiAodGhpcy5iYy52YWxpZENoYWluKGNoYWluKSkge1xuICAgICAgICAgICAgdGhpcy5iYy5jaGFpbiA9IGNoYWluO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImNvbmZsaWN0IHdyb25nIGNoYWluXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG59XG4iXX0=