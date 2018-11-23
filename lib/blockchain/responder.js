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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL3Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJ0eXBlUlBDIiwiUmVzcG9uZGVyIiwiX2JjIiwiY2hlY2tDb25mbGljdCIsIm9uQ29uZmxpY3QiLCJvblRyYW5zYWN0aW9uIiwiYmMiLCJSUEMiLCJORVdCTE9DSyIsImJsb2NrIiwiY29uc29sZSIsImxvZyIsImluZGV4IiwiY2hhaW4iLCJsZW5ndGgiLCJjaGVja0NvbmZsaWN0cyIsImNhdGNoIiwiYWRkQmxvY2siLCJUUkFOU0FDUklPTiIsImJvZHkiLCJqc29uU3RyIiwiY3VycmVudFRyYW5zYWN0aW9ucyIsImluY2x1ZGVzIiwiYWRkVHJhbnNhY3Rpb24iLCJtdWx0aXNpZyIsInJlc3BvbmRlciIsImNvbnRyYWN0IiwiQ09ORkxJQ1QiLCJzaXplIiwiY2FsbGJhY2siLCJub2RlSWQiLCJSRVNPTFZFX0NPTkZMSUNUIiwib25SZXNvbHZlQ29uZmxpY3QiLCJycGMiLCJPYmplY3QiLCJrZXlzIiwidHlwZSIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwidGltZW91dCIsInNldFRpbWVvdXQiLCJ2YWxpZENoYWluIiwiY2xlYXJUaW1lb3V0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBRUE7Ozs7Ozs7Ozs7Ozs7O0lBYVlBLE87OztXQUFBQSxPO0FBQUFBLEVBQUFBLE87QUFBQUEsRUFBQUEsTztBQUFBQSxFQUFBQSxPO0FBQUFBLEVBQUFBLE87R0FBQUEsTyx1QkFBQUEsTzs7SUFPU0MsUzs7O0FBVW5CLHFCQUFZQyxHQUFaLEVBQWdDO0FBQUE7O0FBQUE7O0FBQUEsc0NBVFg7QUFDbkJDLE1BQUFBLGFBQWEsRUFBRSx5QkFBTSxDQUFFLENBREo7QUFFbkJDLE1BQUFBLFVBQVUsRUFBRSxzQkFBTSxDQUFFO0FBRkQsS0FTVzs7QUFBQTs7QUFBQSwyQ0FKQyxFQUlEOztBQUFBLG9DQUh2QjtBQUFFQyxNQUFBQSxhQUFhLEVBQUUsS0FBS0E7QUFBdEIsS0FHdUI7O0FBQUE7O0FBQUEsaUNBRHJCLEVBQ3FCOztBQUM5QixTQUFLQyxFQUFMLEdBQVVKLEdBQVY7O0FBRUEsU0FBS0ssR0FBTCxDQUFTUCxPQUFPLENBQUNRLFFBQWpCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSw4QkFBNkIsaUJBQU9DLEtBQVA7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUMzQkMsZ0JBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGVBQVosRUFBNkIsV0FBN0IsRUFEMkIsQ0FFM0I7QUFDQTs7QUFIMkIsc0JBS3pCRixLQUFLLENBQUNHLEtBQU4sR0FBYyxLQUFJLENBQUNOLEVBQUwsQ0FBUU8sS0FBUixDQUFjQyxNQUFkLEdBQXVCLENBQXJDLElBQ0EsS0FBSSxDQUFDUixFQUFMLENBQVFPLEtBQVIsQ0FBY0MsTUFBZCxLQUF5QixDQU5BO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsdUJBU25CLEtBQUksQ0FBQ0MsY0FBTCxHQUFzQkMsS0FBdEIsQ0FBNEJOLE9BQU8sQ0FBQ0MsR0FBcEMsQ0FUbUI7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBV3pCO0FBQ0EsZ0JBQUEsS0FBSSxDQUFDTCxFQUFMLENBQVFXLFFBQVIsQ0FBaUJSLEtBQWpCOztBQVp5QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQUE3Qjs7QUFBQTtBQUFBO0FBQUE7QUFBQSxRQUg4QixDQW1COUI7OztBQUNBLFNBQUtGLEdBQUwsQ0FBU1AsT0FBTyxDQUFDa0IsV0FBakIsSUFBZ0MsVUFBQ0MsSUFBRCxFQUF3QjtBQUN0RFQsTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksMkJBQVosRUFBeUNRLElBQXpDOztBQUNBLFdBQ0U7QUFDQSxPQUFDLEtBQUksQ0FBQ2IsRUFBTCxDQUNFYyxPQURGLENBQ1UsS0FBSSxDQUFDZCxFQUFMLENBQVFlLG1CQURsQixFQUVFQyxRQUZGLENBRVcsS0FBSSxDQUFDaEIsRUFBTCxDQUFRYyxPQUFSLENBQWdCRCxJQUFoQixDQUZYLENBRkgsRUFLRTtBQUNBO0FBQ0EsUUFBQSxLQUFJLENBQUNiLEVBQUwsQ0FBUWlCLGNBQVIsQ0FBdUJKLElBQXZCOztBQUNBLFFBQUEsS0FBSSxDQUFDYixFQUFMLENBQVFrQixRQUFSLENBQWlCQyxTQUFqQixDQUEyQk4sSUFBM0I7O0FBQ0EsUUFBQSxLQUFJLENBQUNiLEVBQUwsQ0FBUW9CLFFBQVIsQ0FBaUJELFNBQWpCLENBQTJCTixJQUEzQjs7QUFDQSwrQkFBWSxLQUFJLENBQUNkLGFBQWpCLEVBQWdDYyxJQUFoQztBQUNEO0FBQ0YsS0FkRDs7QUFnQkEsU0FBS1osR0FBTCxDQUFTUCxPQUFPLENBQUMyQixRQUFqQixJQUE2QixVQUFDUixJQUFELEVBQWU7QUFDMUNULE1BQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLCtCQUFaLEVBRDBDLENBRTFDOztBQUNBLFVBQUksS0FBSSxDQUFDTCxFQUFMLENBQVFPLEtBQVIsQ0FBY0MsTUFBZCxHQUF1QkssSUFBSSxDQUFDUyxJQUFoQyxFQUFzQztBQUNwQ2xCLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGtDQUFaOztBQUNBLFFBQUEsS0FBSSxDQUFDa0IsUUFBTCxDQUFjekIsVUFBZCxDQUF5QixLQUFJLENBQUNFLEVBQUwsQ0FBUU8sS0FBakMsRUFBd0NNLElBQUksQ0FBQ1csTUFBN0M7QUFDRDtBQUNGLEtBUEQ7O0FBU0EsU0FBS3ZCLEdBQUwsQ0FBU1AsT0FBTyxDQUFDK0IsZ0JBQWpCLElBQXFDLFVBQUNsQixLQUFELEVBQXVCO0FBQzFELFVBQUksS0FBSSxDQUFDbUIsaUJBQVQsRUFBNEIsS0FBSSxDQUFDQSxpQkFBTCxDQUF1Qm5CLEtBQXZCO0FBQzdCLEtBRkQ7QUFHRDs7OzsyQkFFTW9CLEcsRUFBVTtBQUNmLFVBQUlDLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZLEtBQUs1QixHQUFqQixFQUFzQmUsUUFBdEIsQ0FBK0JXLEdBQUcsQ0FBQ0csSUFBbkMsQ0FBSixFQUE4QyxLQUFLN0IsR0FBTCxDQUFTMEIsR0FBRyxDQUFDRyxJQUFiLEVBQW1CSCxHQUFHLENBQUNkLElBQXZCO0FBQy9DOzs7cUNBRXdCO0FBQUE7O0FBQ3ZCLGFBQU8sSUFBSWtCLE9BQUosQ0FBWSxVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDdEM3QixRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxnQkFBWixFQURzQyxDQUV0Qzs7QUFDQSxZQUFNNkIsT0FBTyxHQUFHQyxVQUFVLENBQUMsWUFBTTtBQUMvQkYsVUFBQUEsTUFBTSxDQUFDLHdCQUFELENBQU47QUFDRCxTQUZ5QixFQUV2QixJQUFJLElBRm1CLENBQTFCLENBSHNDLENBT3RDOztBQUNBLFFBQUEsTUFBSSxDQUFDVixRQUFMLENBQWMxQixhQUFkLEdBUnNDLENBVXRDOzs7QUFDQSxRQUFBLE1BQUksQ0FBQzZCLGlCQUFMLEdBQXlCLFVBQUNuQixLQUFELEVBQXVCO0FBQzlDSCxVQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxtQkFBWjs7QUFDQSxjQUFJLE1BQUksQ0FBQ0wsRUFBTCxDQUFRTyxLQUFSLENBQWNDLE1BQWQsR0FBdUJELEtBQUssQ0FBQ0MsTUFBakMsRUFBeUM7QUFDdkMsZ0JBQUksTUFBSSxDQUFDUixFQUFMLENBQVFvQyxVQUFSLENBQW1CN0IsS0FBbkIsQ0FBSixFQUErQjtBQUM3QixjQUFBLE1BQUksQ0FBQ1AsRUFBTCxDQUFRTyxLQUFSLEdBQWdCQSxLQUFoQjtBQUNELGFBRkQsTUFFTztBQUNMSCxjQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxzQkFBWjtBQUNEO0FBQ0Y7O0FBQ0RnQyxVQUFBQSxZQUFZLENBQUNILE9BQUQsQ0FBWjtBQUNBRixVQUFBQSxPQUFPLENBQUMsSUFBRCxDQUFQO0FBQ0QsU0FYRDtBQVlELE9BdkJNLENBQVA7QUF3QkQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQmxvY2tDaGFpbiwgeyBJVHJhbnNhY3Rpb24gfSBmcm9tIFwiLi9ibG9ja2NoYWluXCI7XG5pbXBvcnQgQmxvY2tDaGFpbkFwcCBmcm9tIFwiLi9ibG9ja2NoYWluQXBwXCI7XG5pbXBvcnQgeyBJRXZlbnRzLCBleGN1dGVFdmVudCB9IGZyb20gXCIuLi91dGlsXCI7XG5cbi8v44Kz44O844Or44OQ44OD44Kv44Gv5by35Yi244CB44Kk44OZ44Oz44OI44Gv5Lu75oSP44Gr44GX44KI44GG44Go44GX44Gm44GE44KLXG5pbnRlcmZhY2UgY2FsbGJhY2sge1xuICBjaGVja0NvbmZsaWN0OiAodj86IGFueSkgPT4gdm9pZDtcbiAgb25Db25mbGljdDogKGNoYWluOiBhbnksIG5vZGVJZDogYW55KSA9PiB2b2lkO1xufVxuXG5pbnRlcmZhY2UgUlBDIHtcbiAgdHlwZTogdHlwZVJQQztcbiAgYm9keTogYW55O1xufVxuXG5leHBvcnQgZW51bSB0eXBlUlBDIHtcbiAgTkVXQkxPQ0sgPSBcIk5FV0JMT0NLXCIsXG4gIFRSQU5TQUNSSU9OID0gXCJUUkFOU0FDUklPTlwiLFxuICBDT05GTElDVCA9IFwiQ09ORkxJQ1RcIixcbiAgUkVTT0xWRV9DT05GTElDVCA9IFwiUkVTT0xWRV9DT05GTElDVFwiXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc3BvbmRlciB7XG4gIGNhbGxiYWNrOiBjYWxsYmFjayA9IHtcbiAgICBjaGVja0NvbmZsaWN0OiAoKSA9PiB7fSxcbiAgICBvbkNvbmZsaWN0OiAoKSA9PiB7fVxuICB9O1xuICBvblJlc29sdmVDb25mbGljdD86IChjaGFpbjogQXJyYXk8YW55PikgPT4gdm9pZDtcbiAgcHJpdmF0ZSBvblRyYW5zYWN0aW9uOiBJRXZlbnRzID0ge307XG4gIGV2ZW50cyA9IHsgb25UcmFuc2FjdGlvbjogdGhpcy5vblRyYW5zYWN0aW9uIH07XG4gIGJjOiBCbG9ja0NoYWluQXBwO1xuICBSUEM6IGFueSA9IHt9O1xuICBjb25zdHJ1Y3RvcihfYmM6IEJsb2NrQ2hhaW5BcHApIHtcbiAgICB0aGlzLmJjID0gX2JjO1xuXG4gICAgdGhpcy5SUENbdHlwZVJQQy5ORVdCTE9DS10gPSBhc3luYyAoYmxvY2s6IGFueSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJibG9ja2NoYWluQXBwXCIsIFwibmV3IGJsb2NrXCIpO1xuICAgICAgLy/lj5fjgZHlj5bjgaPjgZ/jg5bjg63jg4Pjgq/jga7jgqTjg7Pjg4fjg4Pjgq/jgrnjgYzoh6rliIbjga7jg4Hjgqfjg7zjg7Pjgojjgooy6ZW344GE44GLXG4gICAgICAvL+ePvuaZgueCueOBruODgeOCp+ODvOODs+OBrumVt+OBleOBjDHjgarjgonjg5bjg63jg4Pjgq/jg4Hjgqfjg7zjg7Pjga7liIblspDjgpLnlpHjgYZcbiAgICAgIGlmIChcbiAgICAgICAgYmxvY2suaW5kZXggPiB0aGlzLmJjLmNoYWluLmxlbmd0aCArIDEgfHxcbiAgICAgICAgdGhpcy5iYy5jaGFpbi5sZW5ndGggPT09IDFcbiAgICAgICkge1xuICAgICAgICAvL+ODluODreODg+OCr+ODgeOCp+ODvOODs+OBruWIhuWykOOCkuiqv+OBueOCi1xuICAgICAgICBhd2FpdCB0aGlzLmNoZWNrQ29uZmxpY3RzKCkuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy/mlrDjgZfjgYTjg5bjg63jg4Pjgq/jgpLlj5fjgZHlhaXjgozjgotcbiAgICAgICAgdGhpcy5iYy5hZGRCbG9jayhibG9jayk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8v44OI44Op44Oz44K244Kv44K344On44Oz44Gr5a++44GZ44KL5Yem55CGXG4gICAgdGhpcy5SUENbdHlwZVJQQy5UUkFOU0FDUklPTl0gPSAoYm9keTogSVRyYW5zYWN0aW9uKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImJsb2NrY2hhaW5BcHAgdHJhbnNhY3Rpb25cIiwgYm9keSk7XG4gICAgICBpZiAoXG4gICAgICAgIC8v44OI44Op44Oz44K244Kv44K344On44Oz44OX44O844Or44Gr5Y+X44GR5Y+W44Gj44Gf44OI44Op44Oz44K244Kv44K344On44Oz44GM44GC44KL44GL57Ch5piT55qE44Gr6Kq/44G544KLXG4gICAgICAgICF0aGlzLmJjXG4gICAgICAgICAgLmpzb25TdHIodGhpcy5iYy5jdXJyZW50VHJhbnNhY3Rpb25zKVxuICAgICAgICAgIC5pbmNsdWRlcyh0aGlzLmJjLmpzb25TdHIoYm9keSkpXG4gICAgICApIHtcbiAgICAgICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgpLjg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7Pjg5fjg7zjg6vjgavliqDjgYjjgotcbiAgICAgICAgdGhpcy5iYy5hZGRUcmFuc2FjdGlvbihib2R5KTtcbiAgICAgICAgdGhpcy5iYy5tdWx0aXNpZy5yZXNwb25kZXIoYm9keSk7XG4gICAgICAgIHRoaXMuYmMuY29udHJhY3QucmVzcG9uZGVyKGJvZHkpO1xuICAgICAgICBleGN1dGVFdmVudCh0aGlzLm9uVHJhbnNhY3Rpb24sIGJvZHkpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLlJQQ1t0eXBlUlBDLkNPTkZMSUNUXSA9IChib2R5OiBhbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiYmxvY2tjaGFpbiBhcHAgY2hlY2sgY29uZmxpY3RcIik7XG4gICAgICAvL+iHquWIhuOBruODgeOCp+ODvOODs+OBjOizquWVj+iAheOCiOOCiumVt+OBkeOCjOOBsOOAgeiHquWIhuOBruODgeOCp+ODvOODs+OCkui/lOOBmVxuICAgICAgaWYgKHRoaXMuYmMuY2hhaW4ubGVuZ3RoID4gYm9keS5zaXplKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiYmxvY2tjaGFpbiBhcHAgY2hlY2sgaXMgY29uZmxpY3RcIik7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sub25Db25mbGljdCh0aGlzLmJjLmNoYWluLCBib2R5Lm5vZGVJZCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuUlBDW3R5cGVSUEMuUkVTT0xWRV9DT05GTElDVF0gPSAoY2hhaW46IEFycmF5PGFueT4pID0+IHtcbiAgICAgIGlmICh0aGlzLm9uUmVzb2x2ZUNvbmZsaWN0KSB0aGlzLm9uUmVzb2x2ZUNvbmZsaWN0KGNoYWluKTtcbiAgICB9O1xuICB9XG5cbiAgcnVuUlBDKHJwYzogUlBDKSB7XG4gICAgaWYgKE9iamVjdC5rZXlzKHRoaXMuUlBDKS5pbmNsdWRlcyhycGMudHlwZSkpIHRoaXMuUlBDW3JwYy50eXBlXShycGMuYm9keSk7XG4gIH1cblxuICBwcml2YXRlIGNoZWNrQ29uZmxpY3RzKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImNoZWNrQ29uZmxpY3RzXCIpO1xuICAgICAgLy/jgr/jgqTjg6DjgqLjgqbjg4hcbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVqZWN0KFwiY2hlY2tjb25mbGljdHMgdGltZW91dFwiKTtcbiAgICAgIH0sIDQgKiAxMDAwKTtcblxuICAgICAgLy/ku5bjga7jg47jg7zjg4njgavjg5bjg63jg4Pjgq/jg4Hjgqfjg7zjg7Pjga7nirbms4HjgpLogZ7jgY9cbiAgICAgIHRoaXMuY2FsbGJhY2suY2hlY2tDb25mbGljdCgpO1xuXG4gICAgICAvL+S7luOBruODjuODvOODieOBi+OCieOBruWbnuetlOOCkuiqv+OBueOCi1xuICAgICAgdGhpcy5vblJlc29sdmVDb25mbGljdCA9IChjaGFpbjogQXJyYXk8YW55PikgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm9uUmVzb2x2ZUNvbmZsaWN0XCIpO1xuICAgICAgICBpZiAodGhpcy5iYy5jaGFpbi5sZW5ndGggPCBjaGFpbi5sZW5ndGgpIHtcbiAgICAgICAgICBpZiAodGhpcy5iYy52YWxpZENoYWluKGNoYWluKSkge1xuICAgICAgICAgICAgdGhpcy5iYy5jaGFpbiA9IGNoYWluO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImNvbmZsaWN0IHdyb25nIGNoYWluXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG59XG4iXX0=