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
        }, _callee);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }(); //トランザクションに対する処理


    this.RPC[typeRPC.TRANSACRION] = function (body) {
      if (!(0, _blockchain.jsonStr)(_this.bc.currentTransactions).includes((0, _blockchain.jsonStr)(body))) {
        //トランザクションをトランザクションプールに加える
        console.log("on transaction");

        _this.bc.addTransaction(body);

        _this.bc.multisig.responder(body);

        _this.bc.contract.responder(body);

        (0, _util.excuteEvent)(_this.events.transaction, body);
      }
    };

    this.RPC[typeRPC.CONFLICT] = function (body) {
      //自分のチェーンが質問者より長ければ、自分のチェーンを返す
      if (_this.bc.chain.length > body.size) {
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
        //タイムアウト
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL3Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJ0eXBlUlBDIiwiUmVzcG9uZGVyIiwiX2JjIiwiY2FsbGJhY2siLCJ0cmFuc2FjdGlvbiIsIm9uVHJhbnNhY3Rpb24iLCJiYyIsIlJQQyIsIk5FV0JMT0NLIiwiYmxvY2siLCJjb25zb2xlIiwibG9nIiwiaW5kZXgiLCJjaGFpbiIsImxlbmd0aCIsImNoZWNrQ29uZmxpY3RzIiwiY2F0Y2giLCJhZGRCbG9jayIsIlRSQU5TQUNSSU9OIiwiYm9keSIsImN1cnJlbnRUcmFuc2FjdGlvbnMiLCJpbmNsdWRlcyIsImFkZFRyYW5zYWN0aW9uIiwibXVsdGlzaWciLCJyZXNwb25kZXIiLCJjb250cmFjdCIsImV2ZW50cyIsIkNPTkZMSUNUIiwic2l6ZSIsIm9uQ29uZmxpY3QiLCJsaXN0ZW5yQWRkcmVzcyIsImFkZHJlc3MiLCJycGMiLCJ0eXBlIiwiUkVTT0xWRV9DT05GTElDVCIsImFuc3dlckNvbmZsaWN0Iiwib25SZXNvbHZlQ29uZmxpY3QiLCJPYmplY3QiLCJrZXlzIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJ0aW1lb3V0Iiwic2V0VGltZW91dCIsImNvbmZsaWN0IiwibGlzdGVuQ29uZmxpY3QiLCJjbGVhclRpbWVvdXQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7SUF1QllBLE87OztXQUFBQSxPO0FBQUFBLEVBQUFBLE87QUFBQUEsRUFBQUEsTztBQUFBQSxFQUFBQSxPO0FBQUFBLEVBQUFBLE87R0FBQUEsTyx1QkFBQUEsTzs7SUFPU0MsUzs7O0FBT25CLHFCQUFZQyxHQUFaLEVBQWdDQyxRQUFoQyxFQUErRDtBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBLDJDQUo5QixFQUk4Qjs7QUFBQSxvQ0FIdEQ7QUFBRUMsTUFBQUEsV0FBVyxFQUFFLEtBQUtDO0FBQXBCLEtBR3NEOztBQUFBOztBQUFBLGlDQURwRCxFQUNvRDs7QUFDN0QsU0FBS0MsRUFBTCxHQUFVSixHQUFWO0FBQ0EsU0FBS0MsUUFBTCxHQUFnQkEsUUFBaEI7O0FBRUEsU0FBS0ksR0FBTCxDQUFTUCxPQUFPLENBQUNRLFFBQWpCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSw4QkFBNkIsaUJBQU9DLEtBQVA7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUMzQkMsZ0JBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGVBQVosRUFBNkIsV0FBN0IsRUFEMkIsQ0FFM0I7QUFDQTs7QUFIMkIsc0JBS3pCRixLQUFLLENBQUNHLEtBQU4sR0FBYyxLQUFJLENBQUNOLEVBQUwsQ0FBUU8sS0FBUixDQUFjQyxNQUFkLEdBQXVCLENBQXJDLElBQ0EsS0FBSSxDQUFDUixFQUFMLENBQVFPLEtBQVIsQ0FBY0MsTUFBZCxLQUF5QixDQU5BO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsdUJBU25CLEtBQUksQ0FBQ0MsY0FBTCxHQUFzQkMsS0FBdEIsQ0FBNEJOLE9BQU8sQ0FBQ0MsR0FBcEMsQ0FUbUI7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBV3pCO0FBQ0EsZ0JBQUEsS0FBSSxDQUFDTCxFQUFMLENBQVFXLFFBQVIsQ0FBaUJSLEtBQWpCOztBQVp5QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQUE3Qjs7QUFBQTtBQUFBO0FBQUE7QUFBQSxRQUo2RCxDQW9CN0Q7OztBQUNBLFNBQUtGLEdBQUwsQ0FBU1AsT0FBTyxDQUFDa0IsV0FBakIsSUFBZ0MsVUFBQ0MsSUFBRCxFQUF3QjtBQUN0RCxVQUFJLENBQUMseUJBQVEsS0FBSSxDQUFDYixFQUFMLENBQVFjLG1CQUFoQixFQUFxQ0MsUUFBckMsQ0FBOEMseUJBQVFGLElBQVIsQ0FBOUMsQ0FBTCxFQUFtRTtBQUNqRTtBQUNBVCxRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxnQkFBWjs7QUFDQSxRQUFBLEtBQUksQ0FBQ0wsRUFBTCxDQUFRZ0IsY0FBUixDQUF1QkgsSUFBdkI7O0FBQ0EsUUFBQSxLQUFJLENBQUNiLEVBQUwsQ0FBUWlCLFFBQVIsQ0FBaUJDLFNBQWpCLENBQTJCTCxJQUEzQjs7QUFDQSxRQUFBLEtBQUksQ0FBQ2IsRUFBTCxDQUFRbUIsUUFBUixDQUFpQkQsU0FBakIsQ0FBMkJMLElBQTNCOztBQUNBLCtCQUFZLEtBQUksQ0FBQ08sTUFBTCxDQUFZdEIsV0FBeEIsRUFBcUNlLElBQXJDO0FBQ0Q7QUFDRixLQVREOztBQVdBLFNBQUtaLEdBQUwsQ0FBU1AsT0FBTyxDQUFDMkIsUUFBakIsSUFBNkIsVUFBQ1IsSUFBRCxFQUFxQjtBQUNoRDtBQUNBLFVBQUksS0FBSSxDQUFDYixFQUFMLENBQVFPLEtBQVIsQ0FBY0MsTUFBZCxHQUF1QkssSUFBSSxDQUFDUyxJQUFoQyxFQUFzQztBQUNwQyxZQUFNQyxVQUF1QixHQUFHO0FBQzlCaEIsVUFBQUEsS0FBSyxFQUFFLEtBQUksQ0FBQ1AsRUFBTCxDQUFRTyxLQURlO0FBRTlCaUIsVUFBQUEsY0FBYyxFQUFFWCxJQUFJLENBQUNZO0FBRlMsU0FBaEM7QUFJQSxZQUFNQyxHQUFRLEdBQUc7QUFBRUMsVUFBQUEsSUFBSSxFQUFFakMsT0FBTyxDQUFDa0MsZ0JBQWhCO0FBQWtDZixVQUFBQSxJQUFJLEVBQUVVO0FBQXhDLFNBQWpCO0FBQ0EsWUFBSSxLQUFJLENBQUMxQixRQUFULEVBQW1CLEtBQUksQ0FBQ0EsUUFBTCxDQUFjZ0MsY0FBZCxDQUE2QkgsR0FBN0I7QUFDcEI7QUFDRixLQVZEOztBQVlBLFNBQUt6QixHQUFMLENBQVNQLE9BQU8sQ0FBQ2tDLGdCQUFqQixJQUFxQyxVQUFDZixJQUFELEVBQXVCO0FBQzFELFVBQUksS0FBSSxDQUFDaUIsaUJBQVQsRUFBNEIsS0FBSSxDQUFDQSxpQkFBTCxDQUF1QmpCLElBQUksQ0FBQ04sS0FBNUI7QUFDN0IsS0FGRDtBQUdEOzs7OzJCQUVNbUIsRyxFQUFVO0FBQ2YsVUFBSUssTUFBTSxDQUFDQyxJQUFQLENBQVksS0FBSy9CLEdBQWpCLEVBQXNCYyxRQUF0QixDQUErQlcsR0FBRyxDQUFDQyxJQUFuQyxDQUFKLEVBQThDLEtBQUsxQixHQUFMLENBQVN5QixHQUFHLENBQUNDLElBQWIsRUFBbUJELEdBQUcsQ0FBQ2IsSUFBdkI7QUFDL0M7OztxQ0FFd0I7QUFBQTs7QUFDdkIsYUFBTyxJQUFJb0IsT0FBSixDQUFZLFVBQUNDLE9BQUQsRUFBVUMsTUFBVixFQUFxQjtBQUN0QztBQUNBLFlBQU1DLE9BQU8sR0FBR0MsVUFBVSxDQUFDLFlBQU07QUFDL0JGLFVBQUFBLE1BQU0sQ0FBQyx3QkFBRCxDQUFOO0FBQ0QsU0FGeUIsRUFFdkIsSUFBSSxJQUZtQixDQUExQjtBQUlBLFlBQU1HLFFBQW1CLEdBQUc7QUFDMUJoQixVQUFBQSxJQUFJLEVBQUUsTUFBSSxDQUFDdEIsRUFBTCxDQUFRTyxLQUFSLENBQWNDLE1BRE07QUFFMUJpQixVQUFBQSxPQUFPLEVBQUUsTUFBSSxDQUFDekIsRUFBTCxDQUFReUI7QUFGUyxTQUE1QjtBQUlBLFlBQU1DLEdBQVEsR0FBRztBQUFFQyxVQUFBQSxJQUFJLEVBQUVqQyxPQUFPLENBQUMyQixRQUFoQjtBQUEwQlIsVUFBQUEsSUFBSSxFQUFFeUI7QUFBaEMsU0FBakIsQ0FWc0MsQ0FXdEM7O0FBQ0EsWUFBSSxNQUFJLENBQUN6QyxRQUFULEVBQW1CLE1BQUksQ0FBQ0EsUUFBTCxDQUFjMEMsY0FBZCxDQUE2QmIsR0FBN0IsRUFabUIsQ0FjdEM7O0FBQ0EsUUFBQSxNQUFJLENBQUNJLGlCQUFMLEdBQXlCLFVBQUN2QixLQUFELEVBQXFCO0FBQzVDSCxVQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxtQkFBWixFQUFpQyxNQUFJLENBQUNMLEVBQUwsQ0FBUU8sS0FBUixDQUFjQyxNQUEvQyxFQUF1REQsS0FBSyxDQUFDQyxNQUE3RDs7QUFDQSxjQUFJLE1BQUksQ0FBQ1IsRUFBTCxDQUFRTyxLQUFSLENBQWNDLE1BQWQsR0FBdUJELEtBQUssQ0FBQ0MsTUFBakMsRUFBeUM7QUFDdkMsZ0JBQUksNEJBQVdELEtBQVgsQ0FBSixFQUF1QjtBQUNyQkgsY0FBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksWUFBWjtBQUNBLGNBQUEsTUFBSSxDQUFDTCxFQUFMLENBQVFPLEtBQVIsR0FBZ0JBLEtBQWhCO0FBQ0QsYUFIRCxNQUdPO0FBQ0xILGNBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLHNCQUFaO0FBQ0Q7QUFDRixXQVBELE1BT087QUFDTEQsWUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksb0JBQVo7QUFDRDs7QUFDRG1DLFVBQUFBLFlBQVksQ0FBQ0osT0FBRCxDQUFaO0FBQ0FGLFVBQUFBLE9BQU8sQ0FBQyxJQUFELENBQVA7QUFDRCxTQWREO0FBZUQsT0E5Qk0sQ0FBUDtBQStCRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElUcmFuc2FjdGlvbiwgSUJsb2NrLCB2YWxpZENoYWluLCBqc29uU3RyIH0gZnJvbSBcIi4vYmxvY2tjaGFpblwiO1xuaW1wb3J0IEJsb2NrQ2hhaW5BcHAgZnJvbSBcIi4vYmxvY2tjaGFpbkFwcFwiO1xuaW1wb3J0IHsgSUV2ZW50cywgZXhjdXRlRXZlbnQgfSBmcm9tIFwiLi4vdXRpbFwiO1xuXG4vL+OCs+ODvOODq+ODkOODg+OCr+OBr+W8t+WItuOAgeOCpOODmeODs+ODiOOBr+S7u+aEj+OBq+OBl+OCiOOBhuOBqOOBl+OBpuOBhOOCi1xuZXhwb3J0IGludGVyZmFjZSBJY2FsbGJhY2tSZXNwb25kZXIge1xuICBsaXN0ZW5Db25mbGljdDogKHJwYzogUlBDKSA9PiB2b2lkO1xuICBhbnN3ZXJDb25mbGljdDogKHJwYzogUlBDKSA9PiB2b2lkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJQQyB7XG4gIHR5cGU6IHR5cGVSUEM7XG4gIGJvZHk6IGFueTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJQ29uZmxpY3Qge1xuICBzaXplOiBudW1iZXI7XG4gIGFkZHJlc3M6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJT25Db25mbGljdCB7XG4gIGNoYWluOiBJQmxvY2tbXTtcbiAgbGlzdGVuckFkZHJlc3M6IHN0cmluZztcbn1cblxuZXhwb3J0IGVudW0gdHlwZVJQQyB7XG4gIE5FV0JMT0NLID0gXCJORVdCTE9DS1wiLFxuICBUUkFOU0FDUklPTiA9IFwiVFJBTlNBQ1JJT05cIixcbiAgQ09ORkxJQ1QgPSBcIkNPTkZMSUNUXCIsXG4gIFJFU09MVkVfQ09ORkxJQ1QgPSBcIlJFU09MVkVfQ09ORkxJQ1RcIlxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXNwb25kZXIge1xuICBjYWxsYmFjazogSWNhbGxiYWNrUmVzcG9uZGVyIHwgdW5kZWZpbmVkO1xuICBwcml2YXRlIG9uUmVzb2x2ZUNvbmZsaWN0PzogKGNoYWluOiBJQmxvY2tbXSkgPT4gdm9pZDtcbiAgcHJpdmF0ZSBvblRyYW5zYWN0aW9uOiBJRXZlbnRzID0ge307XG4gIGV2ZW50cyA9IHsgdHJhbnNhY3Rpb246IHRoaXMub25UcmFuc2FjdGlvbiB9O1xuICBiYzogQmxvY2tDaGFpbkFwcDtcbiAgUlBDOiBhbnkgPSB7fTtcbiAgY29uc3RydWN0b3IoX2JjOiBCbG9ja0NoYWluQXBwLCBjYWxsYmFjaz86IEljYWxsYmFja1Jlc3BvbmRlcikge1xuICAgIHRoaXMuYmMgPSBfYmM7XG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgdGhpcy5SUENbdHlwZVJQQy5ORVdCTE9DS10gPSBhc3luYyAoYmxvY2s6IElCbG9jaykgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJibG9ja2NoYWluQXBwXCIsIFwibmV3IGJsb2NrXCIpO1xuICAgICAgLy/lj5fjgZHlj5bjgaPjgZ/jg5bjg63jg4Pjgq/jga7jgqTjg7Pjg4fjg4Pjgq/jgrnjgYzoh6rliIbjga7jg4Hjgqfjg7zjg7Pjgojjgooy6ZW344GE44GLXG4gICAgICAvL+ePvuaZgueCueOBruODgeOCp+ODvOODs+OBrumVt+OBleOBjDHjgarjgonjg5bjg63jg4Pjgq/jg4Hjgqfjg7zjg7Pjga7liIblspDjgpLnlpHjgYZcbiAgICAgIGlmIChcbiAgICAgICAgYmxvY2suaW5kZXggPiB0aGlzLmJjLmNoYWluLmxlbmd0aCArIDEgfHxcbiAgICAgICAgdGhpcy5iYy5jaGFpbi5sZW5ndGggPT09IDFcbiAgICAgICkge1xuICAgICAgICAvL+ODluODreODg+OCr+ODgeOCp+ODvOODs+OBruWIhuWykOOCkuiqv+OBueOCi1xuICAgICAgICBhd2FpdCB0aGlzLmNoZWNrQ29uZmxpY3RzKCkuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy/mlrDjgZfjgYTjg5bjg63jg4Pjgq/jgpLlj5fjgZHlhaXjgozjgotcbiAgICAgICAgdGhpcy5iYy5hZGRCbG9jayhibG9jayk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8v44OI44Op44Oz44K244Kv44K344On44Oz44Gr5a++44GZ44KL5Yem55CGXG4gICAgdGhpcy5SUENbdHlwZVJQQy5UUkFOU0FDUklPTl0gPSAoYm9keTogSVRyYW5zYWN0aW9uKSA9PiB7XG4gICAgICBpZiAoIWpzb25TdHIodGhpcy5iYy5jdXJyZW50VHJhbnNhY3Rpb25zKS5pbmNsdWRlcyhqc29uU3RyKGJvZHkpKSkge1xuICAgICAgICAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OCkuODiOODqeODs+OCtuOCr+OCt+ODp+ODs+ODl+ODvOODq+OBq+WKoOOBiOOCi1xuICAgICAgICBjb25zb2xlLmxvZyhcIm9uIHRyYW5zYWN0aW9uXCIpO1xuICAgICAgICB0aGlzLmJjLmFkZFRyYW5zYWN0aW9uKGJvZHkpO1xuICAgICAgICB0aGlzLmJjLm11bHRpc2lnLnJlc3BvbmRlcihib2R5KTtcbiAgICAgICAgdGhpcy5iYy5jb250cmFjdC5yZXNwb25kZXIoYm9keSk7XG4gICAgICAgIGV4Y3V0ZUV2ZW50KHRoaXMuZXZlbnRzLnRyYW5zYWN0aW9uLCBib2R5KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5SUENbdHlwZVJQQy5DT05GTElDVF0gPSAoYm9keTogSUNvbmZsaWN0KSA9PiB7XG4gICAgICAvL+iHquWIhuOBruODgeOCp+ODvOODs+OBjOizquWVj+iAheOCiOOCiumVt+OBkeOCjOOBsOOAgeiHquWIhuOBruODgeOCp+ODvOODs+OCkui/lOOBmVxuICAgICAgaWYgKHRoaXMuYmMuY2hhaW4ubGVuZ3RoID4gYm9keS5zaXplKSB7XG4gICAgICAgIGNvbnN0IG9uQ29uZmxpY3Q6IElPbkNvbmZsaWN0ID0ge1xuICAgICAgICAgIGNoYWluOiB0aGlzLmJjLmNoYWluLFxuICAgICAgICAgIGxpc3RlbnJBZGRyZXNzOiBib2R5LmFkZHJlc3NcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcnBjOiBSUEMgPSB7IHR5cGU6IHR5cGVSUEMuUkVTT0xWRV9DT05GTElDVCwgYm9keTogb25Db25mbGljdCB9O1xuICAgICAgICBpZiAodGhpcy5jYWxsYmFjaykgdGhpcy5jYWxsYmFjay5hbnN3ZXJDb25mbGljdChycGMpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLlJQQ1t0eXBlUlBDLlJFU09MVkVfQ09ORkxJQ1RdID0gKGJvZHk6IElPbkNvbmZsaWN0KSA9PiB7XG4gICAgICBpZiAodGhpcy5vblJlc29sdmVDb25mbGljdCkgdGhpcy5vblJlc29sdmVDb25mbGljdChib2R5LmNoYWluKTtcbiAgICB9O1xuICB9XG5cbiAgcnVuUlBDKHJwYzogUlBDKSB7XG4gICAgaWYgKE9iamVjdC5rZXlzKHRoaXMuUlBDKS5pbmNsdWRlcyhycGMudHlwZSkpIHRoaXMuUlBDW3JwYy50eXBlXShycGMuYm9keSk7XG4gIH1cblxuICBwcml2YXRlIGNoZWNrQ29uZmxpY3RzKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAvL+OCv+OCpOODoOOCouOCpuODiFxuICAgICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZWplY3QoXCJjaGVja2NvbmZsaWN0cyB0aW1lb3V0XCIpO1xuICAgICAgfSwgNCAqIDEwMDApO1xuXG4gICAgICBjb25zdCBjb25mbGljdDogSUNvbmZsaWN0ID0ge1xuICAgICAgICBzaXplOiB0aGlzLmJjLmNoYWluLmxlbmd0aCxcbiAgICAgICAgYWRkcmVzczogdGhpcy5iYy5hZGRyZXNzXG4gICAgICB9O1xuICAgICAgY29uc3QgcnBjOiBSUEMgPSB7IHR5cGU6IHR5cGVSUEMuQ09ORkxJQ1QsIGJvZHk6IGNvbmZsaWN0IH07XG4gICAgICAvL+S7luOBruODjuODvOODieOBq+ODluODreODg+OCr+ODgeOCp+ODvOODs+OBrueKtuazgeOCkuiBnuOBj1xuICAgICAgaWYgKHRoaXMuY2FsbGJhY2spIHRoaXMuY2FsbGJhY2subGlzdGVuQ29uZmxpY3QocnBjKTtcblxuICAgICAgLy/ku5bjga7jg47jg7zjg4njgYvjgonjga7lm57nrZTjgpLoqr/jgbnjgotcbiAgICAgIHRoaXMub25SZXNvbHZlQ29uZmxpY3QgPSAoY2hhaW46IElCbG9ja1tdKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwib25SZXNvbHZlQ29uZmxpY3RcIiwgdGhpcy5iYy5jaGFpbi5sZW5ndGgsIGNoYWluLmxlbmd0aCk7XG4gICAgICAgIGlmICh0aGlzLmJjLmNoYWluLmxlbmd0aCA8IGNoYWluLmxlbmd0aCkge1xuICAgICAgICAgIGlmICh2YWxpZENoYWluKGNoYWluKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJzd2FwIGNoYWluXCIpO1xuICAgICAgICAgICAgdGhpcy5iYy5jaGFpbiA9IGNoYWluO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImNvbmZsaWN0IHdyb25nIGNoYWluXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIm15IGNoYWluIGlzIGxvbmdlclwiKTtcbiAgICAgICAgfVxuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG59XG4iXX0=