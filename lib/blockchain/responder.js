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
  function Responder(_bc) {
    var _this = this;

    _classCallCheck(this, Responder);

    _defineProperty(this, "callback", {
      checkConflict: function checkConflict() {},
      onConflict: function onConflict() {}
    });

    _defineProperty(this, "onResolveConflict", void 0);

    _defineProperty(this, "onTransaction", {});

    _defineProperty(this, "events", {
      onTransaction: this.onTransaction
    });

    _defineProperty(this, "bc", void 0);

    _defineProperty(this, "RPC", {});

    this.bc = _bc;

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

        (0, _util.excuteEvent)(_this.onTransaction, body);
      }
    };

    this.RPC[typeRPC.CONFLICT] = function (body) {
      console.log("blockchain app check conflict"); //自分のチェーンが質問者より長ければ、自分のチェーンを返す

      if (_this.bc.chain.length > body.size) {
        console.log("blockchain app check is conflict");

        _this.callback.onConflict(_this.bc.chain, body.nodeId);
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
        }, 4 * 1000); //他のノードにブロックチェーンの状況を聞く

        _this2.callback.checkConflict(); //他のノードからの回答を調べる


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL3Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJ0eXBlUlBDIiwiUmVzcG9uZGVyIiwiX2JjIiwiY2hlY2tDb25mbGljdCIsIm9uQ29uZmxpY3QiLCJvblRyYW5zYWN0aW9uIiwiYmMiLCJSUEMiLCJORVdCTE9DSyIsImJsb2NrIiwiY29uc29sZSIsImxvZyIsImluZGV4IiwiY2hhaW4iLCJsZW5ndGgiLCJjaGVja0NvbmZsaWN0cyIsImNhdGNoIiwiYWRkQmxvY2siLCJUUkFOU0FDUklPTiIsImJvZHkiLCJqc29uU3RyIiwiY3VycmVudFRyYW5zYWN0aW9ucyIsImluY2x1ZGVzIiwiYWRkVHJhbnNhY3Rpb24iLCJtdWx0aXNpZyIsInJlc3BvbmRlciIsImNvbnRyYWN0IiwiQ09ORkxJQ1QiLCJzaXplIiwiY2FsbGJhY2siLCJub2RlSWQiLCJSRVNPTFZFX0NPTkZMSUNUIiwib25SZXNvbHZlQ29uZmxpY3QiLCJycGMiLCJPYmplY3QiLCJrZXlzIiwidHlwZSIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwidGltZW91dCIsInNldFRpbWVvdXQiLCJ2YWxpZENoYWluIiwiY2xlYXJUaW1lb3V0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBRUE7Ozs7Ozs7Ozs7Ozs7O0lBYVlBLE87OztXQUFBQSxPO0FBQUFBLEVBQUFBLE87QUFBQUEsRUFBQUEsTztBQUFBQSxFQUFBQSxPO0FBQUFBLEVBQUFBLE87R0FBQUEsTyx1QkFBQUEsTzs7SUFPU0MsUzs7O0FBVW5CLHFCQUFZQyxHQUFaLEVBQWdDO0FBQUE7O0FBQUE7O0FBQUEsc0NBVFg7QUFDbkJDLE1BQUFBLGFBQWEsRUFBRSx5QkFBTSxDQUFFLENBREo7QUFFbkJDLE1BQUFBLFVBQVUsRUFBRSxzQkFBTSxDQUFFO0FBRkQsS0FTVzs7QUFBQTs7QUFBQSwyQ0FKQyxFQUlEOztBQUFBLG9DQUh2QjtBQUFFQyxNQUFBQSxhQUFhLEVBQUUsS0FBS0E7QUFBdEIsS0FHdUI7O0FBQUE7O0FBQUEsaUNBRHJCLEVBQ3FCOztBQUM5QixTQUFLQyxFQUFMLEdBQVVKLEdBQVY7O0FBRUEsU0FBS0ssR0FBTCxDQUFTUCxPQUFPLENBQUNRLFFBQWpCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSw4QkFBNkIsaUJBQU9DLEtBQVA7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUMzQkMsZ0JBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGVBQVosRUFBNkIsV0FBN0IsRUFEMkIsQ0FFM0I7QUFDQTs7QUFIMkIsc0JBS3pCRixLQUFLLENBQUNHLEtBQU4sR0FBYyxLQUFJLENBQUNOLEVBQUwsQ0FBUU8sS0FBUixDQUFjQyxNQUFkLEdBQXVCLENBQXJDLElBQ0EsS0FBSSxDQUFDUixFQUFMLENBQVFPLEtBQVIsQ0FBY0MsTUFBZCxLQUF5QixDQU5BO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsdUJBU25CLEtBQUksQ0FBQ0MsY0FBTCxHQUFzQkMsS0FBdEIsQ0FBNEJOLE9BQU8sQ0FBQ0MsR0FBcEMsQ0FUbUI7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBV3pCO0FBQ0EsZ0JBQUEsS0FBSSxDQUFDTCxFQUFMLENBQVFXLFFBQVIsQ0FBaUJSLEtBQWpCOztBQVp5QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQUE3Qjs7QUFBQTtBQUFBO0FBQUE7QUFBQSxRQUg4QixDQW1COUI7OztBQUNBLFNBQUtGLEdBQUwsQ0FBU1AsT0FBTyxDQUFDa0IsV0FBakIsSUFBZ0MsVUFBQ0MsSUFBRCxFQUF3QjtBQUN0RFQsTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksMkJBQVosRUFBeUNRLElBQXpDOztBQUNBLFdBQ0U7QUFDQSxPQUFDLEtBQUksQ0FBQ2IsRUFBTCxDQUNFYyxPQURGLENBQ1UsS0FBSSxDQUFDZCxFQUFMLENBQVFlLG1CQURsQixFQUVFQyxRQUZGLENBRVcsS0FBSSxDQUFDaEIsRUFBTCxDQUFRYyxPQUFSLENBQWdCRCxJQUFoQixDQUZYLENBRkgsRUFLRTtBQUNBO0FBQ0EsUUFBQSxLQUFJLENBQUNiLEVBQUwsQ0FBUWlCLGNBQVIsQ0FBdUJKLElBQXZCOztBQUNBLFFBQUEsS0FBSSxDQUFDYixFQUFMLENBQVFrQixRQUFSLENBQWlCQyxTQUFqQixDQUEyQk4sSUFBM0I7O0FBQ0EsUUFBQSxLQUFJLENBQUNiLEVBQUwsQ0FBUW9CLFFBQVIsQ0FBaUJELFNBQWpCLENBQTJCTixJQUEzQjs7QUFDQSwrQkFBWSxLQUFJLENBQUNkLGFBQWpCLEVBQWdDYyxJQUFoQztBQUNEO0FBQ0YsS0FkRDs7QUFnQkEsU0FBS1osR0FBTCxDQUFTUCxPQUFPLENBQUMyQixRQUFqQixJQUE2QixVQUFDUixJQUFELEVBQWU7QUFDMUNULE1BQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLCtCQUFaLEVBRDBDLENBRTFDOztBQUNBLFVBQUksS0FBSSxDQUFDTCxFQUFMLENBQVFPLEtBQVIsQ0FBY0MsTUFBZCxHQUF1QkssSUFBSSxDQUFDUyxJQUFoQyxFQUFzQztBQUNwQ2xCLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGtDQUFaOztBQUNBLFFBQUEsS0FBSSxDQUFDa0IsUUFBTCxDQUFjekIsVUFBZCxDQUF5QixLQUFJLENBQUNFLEVBQUwsQ0FBUU8sS0FBakMsRUFBd0NNLElBQUksQ0FBQ1csTUFBN0M7QUFDRDtBQUNGLEtBUEQ7O0FBU0EsU0FBS3ZCLEdBQUwsQ0FBU1AsT0FBTyxDQUFDK0IsZ0JBQWpCLElBQXFDLFVBQUNsQixLQUFELEVBQXVCO0FBQzFELFVBQUksS0FBSSxDQUFDbUIsaUJBQVQsRUFBNEIsS0FBSSxDQUFDQSxpQkFBTCxDQUF1Qm5CLEtBQXZCO0FBQzdCLEtBRkQ7QUFHRDs7OzsyQkFFTW9CLEcsRUFBVTtBQUNmLFVBQUlDLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZLEtBQUs1QixHQUFqQixFQUFzQmUsUUFBdEIsQ0FBK0JXLEdBQUcsQ0FBQ0csSUFBbkMsQ0FBSixFQUE4QyxLQUFLN0IsR0FBTCxDQUFTMEIsR0FBRyxDQUFDRyxJQUFiLEVBQW1CSCxHQUFHLENBQUNkLElBQXZCO0FBQy9DOzs7cUNBRXdCO0FBQUE7O0FBQ3ZCLGFBQU8sSUFBSWtCLE9BQUosQ0FBWSxVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDdEM3QixRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxnQkFBWixFQURzQyxDQUV0Qzs7QUFDQSxZQUFNNkIsT0FBTyxHQUFHQyxVQUFVLENBQUMsWUFBTTtBQUMvQkYsVUFBQUEsTUFBTSxDQUFDLHdCQUFELENBQU47QUFDRCxTQUZ5QixFQUV2QixJQUFJLElBRm1CLENBQTFCLENBSHNDLENBT3RDOztBQUNBLFFBQUEsTUFBSSxDQUFDVixRQUFMLENBQWMxQixhQUFkLEdBUnNDLENBVXRDOzs7QUFDQSxRQUFBLE1BQUksQ0FBQzZCLGlCQUFMLEdBQXlCLFVBQUNuQixLQUFELEVBQXVCO0FBQzlDSCxVQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxtQkFBWjs7QUFDQSxjQUFJLE1BQUksQ0FBQ0wsRUFBTCxDQUFRTyxLQUFSLENBQWNDLE1BQWQsR0FBdUJELEtBQUssQ0FBQ0MsTUFBakMsRUFBeUM7QUFDdkMsZ0JBQUksTUFBSSxDQUFDUixFQUFMLENBQVFvQyxVQUFSLENBQW1CN0IsS0FBbkIsQ0FBSixFQUErQjtBQUM3QixjQUFBLE1BQUksQ0FBQ1AsRUFBTCxDQUFRTyxLQUFSLEdBQWdCQSxLQUFoQjtBQUNELGFBRkQsTUFFTztBQUNMSCxjQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxzQkFBWjtBQUNEO0FBQ0Y7O0FBQ0RnQyxVQUFBQSxZQUFZLENBQUNILE9BQUQsQ0FBWjtBQUNBRixVQUFBQSxPQUFPLENBQUMsSUFBRCxDQUFQO0FBQ0QsU0FYRDtBQVlELE9BdkJNLENBQVA7QUF3QkQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQmxvY2tDaGFpbiwgeyBJVHJhbnNhY3Rpb24gfSBmcm9tIFwiLi9ibG9ja2NoYWluXCI7XG5pbXBvcnQgQmxvY2tDaGFpbkFwcCBmcm9tIFwiLi9ibG9ja2NoYWluQXBwXCI7XG5pbXBvcnQgeyBJRXZlbnRzLCBleGN1dGVFdmVudCB9IGZyb20gXCIuLi91dGlsXCI7XG5cbi8v44Kz44O844Or44OQ44OD44Kv44Gv5by35Yi244CB44Kk44OZ44Oz44OI44Gv5Lu75oSP44Gr44GX44KI44GG44Go44GX44Gm44GE44KLXG5pbnRlcmZhY2UgY2FsbGJhY2sge1xuICBjaGVja0NvbmZsaWN0OiAodj86IGFueSkgPT4gdm9pZDtcbiAgb25Db25mbGljdDogKGNoYWluOiBhbnksIG5vZGVJZDogYW55KSA9PiB2b2lkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJQQyB7XG4gIHR5cGU6IHR5cGVSUEM7XG4gIGJvZHk6IGFueTtcbn1cblxuZXhwb3J0IGVudW0gdHlwZVJQQyB7XG4gIE5FV0JMT0NLID0gXCJORVdCTE9DS1wiLFxuICBUUkFOU0FDUklPTiA9IFwiVFJBTlNBQ1JJT05cIixcbiAgQ09ORkxJQ1QgPSBcIkNPTkZMSUNUXCIsXG4gIFJFU09MVkVfQ09ORkxJQ1QgPSBcIlJFU09MVkVfQ09ORkxJQ1RcIlxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXNwb25kZXIge1xuICBjYWxsYmFjazogY2FsbGJhY2sgPSB7XG4gICAgY2hlY2tDb25mbGljdDogKCkgPT4ge30sXG4gICAgb25Db25mbGljdDogKCkgPT4ge31cbiAgfTtcbiAgb25SZXNvbHZlQ29uZmxpY3Q/OiAoY2hhaW46IEFycmF5PGFueT4pID0+IHZvaWQ7XG4gIHByaXZhdGUgb25UcmFuc2FjdGlvbjogSUV2ZW50cyA9IHt9O1xuICBldmVudHMgPSB7IG9uVHJhbnNhY3Rpb246IHRoaXMub25UcmFuc2FjdGlvbiB9O1xuICBiYzogQmxvY2tDaGFpbkFwcDtcbiAgUlBDOiBhbnkgPSB7fTtcbiAgY29uc3RydWN0b3IoX2JjOiBCbG9ja0NoYWluQXBwKSB7XG4gICAgdGhpcy5iYyA9IF9iYztcblxuICAgIHRoaXMuUlBDW3R5cGVSUEMuTkVXQkxPQ0tdID0gYXN5bmMgKGJsb2NrOiBhbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiYmxvY2tjaGFpbkFwcFwiLCBcIm5ldyBibG9ja1wiKTtcbiAgICAgIC8v5Y+X44GR5Y+W44Gj44Gf44OW44Ot44OD44Kv44Gu44Kk44Oz44OH44OD44Kv44K544GM6Ieq5YiG44Gu44OB44Kn44O844Oz44KI44KKMumVt+OBhOOBi1xuICAgICAgLy/nj77mmYLngrnjga7jg4Hjgqfjg7zjg7Pjga7plbfjgZXjgYwx44Gq44KJ44OW44Ot44OD44Kv44OB44Kn44O844Oz44Gu5YiG5bKQ44KS55aR44GGXG4gICAgICBpZiAoXG4gICAgICAgIGJsb2NrLmluZGV4ID4gdGhpcy5iYy5jaGFpbi5sZW5ndGggKyAxIHx8XG4gICAgICAgIHRoaXMuYmMuY2hhaW4ubGVuZ3RoID09PSAxXG4gICAgICApIHtcbiAgICAgICAgLy/jg5bjg63jg4Pjgq/jg4Hjgqfjg7zjg7Pjga7liIblspDjgpLoqr/jgbnjgotcbiAgICAgICAgYXdhaXQgdGhpcy5jaGVja0NvbmZsaWN0cygpLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8v5paw44GX44GE44OW44Ot44OD44Kv44KS5Y+X44GR5YWl44KM44KLXG4gICAgICAgIHRoaXMuYmMuYWRkQmxvY2soYmxvY2spO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OBq+WvvuOBmeOCi+WHpueQhlxuICAgIHRoaXMuUlBDW3R5cGVSUEMuVFJBTlNBQ1JJT05dID0gKGJvZHk6IElUcmFuc2FjdGlvbikgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJibG9ja2NoYWluQXBwIHRyYW5zYWN0aW9uXCIsIGJvZHkpO1xuICAgICAgaWYgKFxuICAgICAgICAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+ODl+ODvOODq+OBq+WPl+OBkeWPluOBo+OBn+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OBjOOBguOCi+OBi+ewoeaYk+eahOOBq+iqv+OBueOCi1xuICAgICAgICAhdGhpcy5iY1xuICAgICAgICAgIC5qc29uU3RyKHRoaXMuYmMuY3VycmVudFRyYW5zYWN0aW9ucylcbiAgICAgICAgICAuaW5jbHVkZXModGhpcy5iYy5qc29uU3RyKGJvZHkpKVxuICAgICAgKSB7XG4gICAgICAgIC8v44OI44Op44Oz44K244Kv44K344On44Oz44KS44OI44Op44Oz44K244Kv44K344On44Oz44OX44O844Or44Gr5Yqg44GI44KLXG4gICAgICAgIHRoaXMuYmMuYWRkVHJhbnNhY3Rpb24oYm9keSk7XG4gICAgICAgIHRoaXMuYmMubXVsdGlzaWcucmVzcG9uZGVyKGJvZHkpO1xuICAgICAgICB0aGlzLmJjLmNvbnRyYWN0LnJlc3BvbmRlcihib2R5KTtcbiAgICAgICAgZXhjdXRlRXZlbnQodGhpcy5vblRyYW5zYWN0aW9uLCBib2R5KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5SUENbdHlwZVJQQy5DT05GTElDVF0gPSAoYm9keTogYW55KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImJsb2NrY2hhaW4gYXBwIGNoZWNrIGNvbmZsaWN0XCIpO1xuICAgICAgLy/oh6rliIbjga7jg4Hjgqfjg7zjg7PjgYzos6rllY/ogIXjgojjgorplbfjgZHjgozjgbDjgIHoh6rliIbjga7jg4Hjgqfjg7zjg7PjgpLov5TjgZlcbiAgICAgIGlmICh0aGlzLmJjLmNoYWluLmxlbmd0aCA+IGJvZHkuc2l6ZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImJsb2NrY2hhaW4gYXBwIGNoZWNrIGlzIGNvbmZsaWN0XCIpO1xuICAgICAgICB0aGlzLmNhbGxiYWNrLm9uQ29uZmxpY3QodGhpcy5iYy5jaGFpbiwgYm9keS5ub2RlSWQpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLlJQQ1t0eXBlUlBDLlJFU09MVkVfQ09ORkxJQ1RdID0gKGNoYWluOiBBcnJheTxhbnk+KSA9PiB7XG4gICAgICBpZiAodGhpcy5vblJlc29sdmVDb25mbGljdCkgdGhpcy5vblJlc29sdmVDb25mbGljdChjaGFpbik7XG4gICAgfTtcbiAgfVxuXG4gIHJ1blJQQyhycGM6IFJQQykge1xuICAgIGlmIChPYmplY3Qua2V5cyh0aGlzLlJQQykuaW5jbHVkZXMocnBjLnR5cGUpKSB0aGlzLlJQQ1tycGMudHlwZV0ocnBjLmJvZHkpO1xuICB9XG5cbiAgcHJpdmF0ZSBjaGVja0NvbmZsaWN0cygpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJjaGVja0NvbmZsaWN0c1wiKTtcbiAgICAgIC8v44K/44Kk44Og44Ki44Km44OIXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcImNoZWNrY29uZmxpY3RzIHRpbWVvdXRcIik7XG4gICAgICB9LCA0ICogMTAwMCk7XG5cbiAgICAgIC8v5LuW44Gu44OO44O844OJ44Gr44OW44Ot44OD44Kv44OB44Kn44O844Oz44Gu54q25rOB44KS6IGe44GPXG4gICAgICB0aGlzLmNhbGxiYWNrLmNoZWNrQ29uZmxpY3QoKTtcblxuICAgICAgLy/ku5bjga7jg47jg7zjg4njgYvjgonjga7lm57nrZTjgpLoqr/jgbnjgotcbiAgICAgIHRoaXMub25SZXNvbHZlQ29uZmxpY3QgPSAoY2hhaW46IEFycmF5PGFueT4pID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJvblJlc29sdmVDb25mbGljdFwiKTtcbiAgICAgICAgaWYgKHRoaXMuYmMuY2hhaW4ubGVuZ3RoIDwgY2hhaW4ubGVuZ3RoKSB7XG4gICAgICAgICAgaWYgKHRoaXMuYmMudmFsaWRDaGFpbihjaGFpbikpIHtcbiAgICAgICAgICAgIHRoaXMuYmMuY2hhaW4gPSBjaGFpbjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJjb25mbGljdCB3cm9uZyBjaGFpblwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxufVxuIl19