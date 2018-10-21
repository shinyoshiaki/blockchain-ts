"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _type = _interopRequireDefault(require("./type"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var bc;
var onResolveConflict; //コールバックは強制、イベントは任意にしようとしている

var callback;

var Responder =
/*#__PURE__*/
function () {
  function Responder(_bc, _callback) {
    var _this = this;

    _classCallCheck(this, Responder);

    _defineProperty(this, "RPC", {});

    bc = _bc;
    callback = _callback;

    this.RPC[_type.default.NEWBLOCK] =
    /*#__PURE__*/
    function () {
      var _ref = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(body) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                console.log("blockchainApp", "new block"); //受け取ったブロックのインデックスが自分のチェーンより2長いか
                //現時点のチェーンの長さが1ならブロックチェーンの分岐を疑う

                if (!(body.index > bc.chain.length + 1 || bc.chain.length === 1)) {
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
                bc.addBlock(body);

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


    this.RPC[_type.default.TRANSACRION] = function (body) {
      console.log("blockchainApp transaction", body);

      if ( //トランザクションプールに受け取ったトランザクションがあるか簡易的に調べる
      !bc.jsonStr(bc.currentTransactions).includes(bc.jsonStr(body))) {
        //トランザクションをトランザクションプールに加える
        bc.addTransaction(body);
      }
    };

    this.RPC[_type.default.CONFLICT] = function (body) {
      console.log("blockchain app check conflict"); //自分のチェーンが質問者より長ければ、自分のチェーンを返す

      if (bc.chain.length > body.size) {
        console.log("blockchain app check is conflict");
        callback.onConflict(bc.chain, body.nodeId);
      }
    };

    this.RPC[_type.default.RESOLVE_CONFLICT] = function (body) {
      if (onResolveConflict) onResolveConflict(body);
    };
  }

  _createClass(Responder, [{
    key: "runRPC",
    value: function runRPC(type, body) {
      if (Object.keys(this.RPC).includes(type)) this.RPC[type](body);
    }
  }, {
    key: "checkConflicts",
    value: function checkConflicts() {
      return new Promise(function (resolve, reject) {
        console.log("this.checkConflicts"); //タイムアウト

        var timeout = setTimeout(function () {
          reject("checkconflicts timeout");
        }, 4 * 1000); //他のノードにブロックチェーンの状況を聞く

        callback.checkConflict(); //他のノードからの回答を調べる

        onResolveConflict = function onResolveConflict(body) {
          if (bc.chain.length < body.length) {
            if (bc.validChain(body)) {
              bc.chain = body;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL3Jlc3BvbmRlci50cyJdLCJuYW1lcyI6WyJiYyIsIm9uUmVzb2x2ZUNvbmZsaWN0IiwiY2FsbGJhY2siLCJSZXNwb25kZXIiLCJfYmMiLCJfY2FsbGJhY2siLCJSUEMiLCJ0eXBlIiwiTkVXQkxPQ0siLCJib2R5IiwiY29uc29sZSIsImxvZyIsImluZGV4IiwiY2hhaW4iLCJsZW5ndGgiLCJjaGVja0NvbmZsaWN0cyIsImNhdGNoIiwiYWRkQmxvY2siLCJUUkFOU0FDUklPTiIsImpzb25TdHIiLCJjdXJyZW50VHJhbnNhY3Rpb25zIiwiaW5jbHVkZXMiLCJhZGRUcmFuc2FjdGlvbiIsIkNPTkZMSUNUIiwic2l6ZSIsIm9uQ29uZmxpY3QiLCJub2RlSWQiLCJSRVNPTFZFX0NPTkZMSUNUIiwiT2JqZWN0Iiwia2V5cyIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwidGltZW91dCIsInNldFRpbWVvdXQiLCJjaGVja0NvbmZsaWN0IiwidmFsaWRDaGFpbiIsImNsZWFyVGltZW91dCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBSUEsRUFBSjtBQUNBLElBQUlDLGlCQUFKLEMsQ0FFQTs7QUFLQSxJQUFJQyxRQUFKOztJQUVxQkMsUzs7O0FBRW5CLHFCQUFZQyxHQUFaLEVBQTZCQyxTQUE3QixFQUFrRDtBQUFBOztBQUFBOztBQUFBLGlDQUR2QyxFQUN1Qzs7QUFDaERMLElBQUFBLEVBQUUsR0FBR0ksR0FBTDtBQUNBRixJQUFBQSxRQUFRLEdBQUdHLFNBQVg7O0FBRUEsU0FBS0MsR0FBTCxDQUFTQyxjQUFLQyxRQUFkO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSw4QkFBMEIsaUJBQU9DLElBQVA7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUN4QkMsZ0JBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGVBQVosRUFBNkIsV0FBN0IsRUFEd0IsQ0FFeEI7QUFDQTs7QUFId0Isc0JBSXBCRixJQUFJLENBQUNHLEtBQUwsR0FBYVosRUFBRSxDQUFDYSxLQUFILENBQVNDLE1BQVQsR0FBa0IsQ0FBL0IsSUFBb0NkLEVBQUUsQ0FBQ2EsS0FBSCxDQUFTQyxNQUFULEtBQW9CLENBSnBDO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsdUJBTWhCLEtBQUksQ0FBQ0MsY0FBTCxHQUFzQkMsS0FBdEIsQ0FBNEJOLE9BQU8sQ0FBQ0MsR0FBcEMsQ0FOZ0I7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBUXRCO0FBQ0FYLGdCQUFBQSxFQUFFLENBQUNpQixRQUFILENBQVlSLElBQVo7O0FBVHNCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE9BQTFCOztBQUFBO0FBQUE7QUFBQTtBQUFBLFFBSmdELENBaUJoRDs7O0FBQ0EsU0FBS0gsR0FBTCxDQUFTQyxjQUFLVyxXQUFkLElBQTZCLFVBQUNULElBQUQsRUFBZTtBQUMxQ0MsTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksMkJBQVosRUFBeUNGLElBQXpDOztBQUNBLFdBQ0U7QUFDQSxPQUFDVCxFQUFFLENBQUNtQixPQUFILENBQVduQixFQUFFLENBQUNvQixtQkFBZCxFQUFtQ0MsUUFBbkMsQ0FBNENyQixFQUFFLENBQUNtQixPQUFILENBQVdWLElBQVgsQ0FBNUMsQ0FGSCxFQUdFO0FBQ0E7QUFDQVQsUUFBQUEsRUFBRSxDQUFDc0IsY0FBSCxDQUFrQmIsSUFBbEI7QUFDRDtBQUNGLEtBVEQ7O0FBV0EsU0FBS0gsR0FBTCxDQUFTQyxjQUFLZ0IsUUFBZCxJQUEwQixVQUFDZCxJQUFELEVBQWU7QUFDdkNDLE1BQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLCtCQUFaLEVBRHVDLENBRXZDOztBQUNBLFVBQUlYLEVBQUUsQ0FBQ2EsS0FBSCxDQUFTQyxNQUFULEdBQWtCTCxJQUFJLENBQUNlLElBQTNCLEVBQWlDO0FBQy9CZCxRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxrQ0FBWjtBQUNBVCxRQUFBQSxRQUFRLENBQUN1QixVQUFULENBQW9CekIsRUFBRSxDQUFDYSxLQUF2QixFQUE4QkosSUFBSSxDQUFDaUIsTUFBbkM7QUFDRDtBQUNGLEtBUEQ7O0FBU0EsU0FBS3BCLEdBQUwsQ0FBU0MsY0FBS29CLGdCQUFkLElBQWtDLFVBQUNsQixJQUFELEVBQWU7QUFDL0MsVUFBSVIsaUJBQUosRUFBdUJBLGlCQUFpQixDQUFDUSxJQUFELENBQWpCO0FBQ3hCLEtBRkQ7QUFHRDs7OzsyQkFFTUYsSSxFQUFjRSxJLEVBQWM7QUFDakMsVUFBSW1CLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZLEtBQUt2QixHQUFqQixFQUFzQmUsUUFBdEIsQ0FBK0JkLElBQS9CLENBQUosRUFBMEMsS0FBS0QsR0FBTCxDQUFTQyxJQUFULEVBQWVFLElBQWY7QUFDM0M7OztxQ0FFd0I7QUFDdkIsYUFBTyxJQUFJcUIsT0FBSixDQUFZLFVBQUNDLE9BQUQsRUFBVUMsTUFBVixFQUFxQjtBQUN0Q3RCLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLHFCQUFaLEVBRHNDLENBRXRDOztBQUNBLFlBQU1zQixPQUFPLEdBQUdDLFVBQVUsQ0FBQyxZQUFNO0FBQy9CRixVQUFBQSxNQUFNLENBQUMsd0JBQUQsQ0FBTjtBQUNELFNBRnlCLEVBRXZCLElBQUksSUFGbUIsQ0FBMUIsQ0FIc0MsQ0FNdEM7O0FBQ0E5QixRQUFBQSxRQUFRLENBQUNpQyxhQUFULEdBUHNDLENBUXRDOztBQUNBbEMsUUFBQUEsaUJBQWlCLEdBQUcsMkJBQUNRLElBQUQsRUFBZTtBQUNqQyxjQUFJVCxFQUFFLENBQUNhLEtBQUgsQ0FBU0MsTUFBVCxHQUFrQkwsSUFBSSxDQUFDSyxNQUEzQixFQUFtQztBQUNqQyxnQkFBSWQsRUFBRSxDQUFDb0MsVUFBSCxDQUFjM0IsSUFBZCxDQUFKLEVBQXlCO0FBQ3ZCVCxjQUFBQSxFQUFFLENBQUNhLEtBQUgsR0FBV0osSUFBWDtBQUNELGFBRkQsTUFFTztBQUNMQyxjQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxzQkFBWjtBQUNEO0FBQ0Y7O0FBQ0QwQixVQUFBQSxZQUFZLENBQUNKLE9BQUQsQ0FBWjtBQUNBRixVQUFBQSxPQUFPLENBQUMsSUFBRCxDQUFQO0FBQ0QsU0FWRDtBQVdELE9BcEJNLENBQVA7QUFxQkQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQmxvY2tDaGFpbiBmcm9tIFwiLi9ibG9ja2NoYWluXCI7XG5pbXBvcnQgdHlwZSBmcm9tIFwiLi90eXBlXCI7XG5cbmxldCBiYzogQmxvY2tDaGFpbjtcbmxldCBvblJlc29sdmVDb25mbGljdDogKGJvZHk6IGFueSkgPT4gdm9pZDtcblxuLy/jgrPjg7zjg6vjg5Djg4Pjgq/jga/lvLfliLbjgIHjgqTjg5njg7Pjg4jjga/ku7vmhI/jgavjgZfjgojjgYbjgajjgZfjgabjgYTjgotcbmludGVyZmFjZSBjYWxsYmFjayB7XG4gIGNoZWNrQ29uZmxpY3Q6ICh2PzogYW55KSA9PiB2b2lkO1xuICBvbkNvbmZsaWN0OiAoY2hhaW46IGFueSwgbm9kZUlkOiBhbnkpID0+IHZvaWQ7XG59XG5sZXQgY2FsbGJhY2s6IGNhbGxiYWNrO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXNwb25kZXIge1xuICBSUEM6IGFueSA9IHt9O1xuICBjb25zdHJ1Y3RvcihfYmM6IEJsb2NrQ2hhaW4sIF9jYWxsYmFjazogY2FsbGJhY2spIHtcbiAgICBiYyA9IF9iYztcbiAgICBjYWxsYmFjayA9IF9jYWxsYmFjaztcblxuICAgIHRoaXMuUlBDW3R5cGUuTkVXQkxPQ0tdID0gYXN5bmMgKGJvZHk6IGFueSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJibG9ja2NoYWluQXBwXCIsIFwibmV3IGJsb2NrXCIpO1xuICAgICAgLy/lj5fjgZHlj5bjgaPjgZ/jg5bjg63jg4Pjgq/jga7jgqTjg7Pjg4fjg4Pjgq/jgrnjgYzoh6rliIbjga7jg4Hjgqfjg7zjg7Pjgojjgooy6ZW344GE44GLXG4gICAgICAvL+ePvuaZgueCueOBruODgeOCp+ODvOODs+OBrumVt+OBleOBjDHjgarjgonjg5bjg63jg4Pjgq/jg4Hjgqfjg7zjg7Pjga7liIblspDjgpLnlpHjgYZcbiAgICAgIGlmIChib2R5LmluZGV4ID4gYmMuY2hhaW4ubGVuZ3RoICsgMSB8fCBiYy5jaGFpbi5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgLy/jg5bjg63jg4Pjgq/jg4Hjgqfjg7zjg7Pjga7liIblspDjgpLoqr/jgbnjgotcbiAgICAgICAgYXdhaXQgdGhpcy5jaGVja0NvbmZsaWN0cygpLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8v5paw44GX44GE44OW44Ot44OD44Kv44KS5Y+X44GR5YWl44KM44KLXG4gICAgICAgIGJjLmFkZEJsb2NrKGJvZHkpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OBq+WvvuOBmeOCi+WHpueQhlxuICAgIHRoaXMuUlBDW3R5cGUuVFJBTlNBQ1JJT05dID0gKGJvZHk6IGFueSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJibG9ja2NoYWluQXBwIHRyYW5zYWN0aW9uXCIsIGJvZHkpO1xuICAgICAgaWYgKFxuICAgICAgICAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+ODl+ODvOODq+OBq+WPl+OBkeWPluOBo+OBn+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OBjOOBguOCi+OBi+ewoeaYk+eahOOBq+iqv+OBueOCi1xuICAgICAgICAhYmMuanNvblN0cihiYy5jdXJyZW50VHJhbnNhY3Rpb25zKS5pbmNsdWRlcyhiYy5qc29uU3RyKGJvZHkpKVxuICAgICAgKSB7XG4gICAgICAgIC8v44OI44Op44Oz44K244Kv44K344On44Oz44KS44OI44Op44Oz44K244Kv44K344On44Oz44OX44O844Or44Gr5Yqg44GI44KLXG4gICAgICAgIGJjLmFkZFRyYW5zYWN0aW9uKGJvZHkpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLlJQQ1t0eXBlLkNPTkZMSUNUXSA9IChib2R5OiBhbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiYmxvY2tjaGFpbiBhcHAgY2hlY2sgY29uZmxpY3RcIik7XG4gICAgICAvL+iHquWIhuOBruODgeOCp+ODvOODs+OBjOizquWVj+iAheOCiOOCiumVt+OBkeOCjOOBsOOAgeiHquWIhuOBruODgeOCp+ODvOODs+OCkui/lOOBmVxuICAgICAgaWYgKGJjLmNoYWluLmxlbmd0aCA+IGJvZHkuc2l6ZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImJsb2NrY2hhaW4gYXBwIGNoZWNrIGlzIGNvbmZsaWN0XCIpO1xuICAgICAgICBjYWxsYmFjay5vbkNvbmZsaWN0KGJjLmNoYWluLCBib2R5Lm5vZGVJZCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuUlBDW3R5cGUuUkVTT0xWRV9DT05GTElDVF0gPSAoYm9keTogYW55KSA9PiB7XG4gICAgICBpZiAob25SZXNvbHZlQ29uZmxpY3QpIG9uUmVzb2x2ZUNvbmZsaWN0KGJvZHkpO1xuICAgIH07XG4gIH1cblxuICBydW5SUEModHlwZTogc3RyaW5nLCBib2R5OiBzdHJpbmcpIHtcbiAgICBpZiAoT2JqZWN0LmtleXModGhpcy5SUEMpLmluY2x1ZGVzKHR5cGUpKSB0aGlzLlJQQ1t0eXBlXShib2R5KTtcbiAgfVxuXG4gIHByaXZhdGUgY2hlY2tDb25mbGljdHMoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwidGhpcy5jaGVja0NvbmZsaWN0c1wiKTtcbiAgICAgIC8v44K/44Kk44Og44Ki44Km44OIXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcImNoZWNrY29uZmxpY3RzIHRpbWVvdXRcIik7XG4gICAgICB9LCA0ICogMTAwMCk7XG4gICAgICAvL+S7luOBruODjuODvOODieOBq+ODluODreODg+OCr+ODgeOCp+ODvOODs+OBrueKtuazgeOCkuiBnuOBj1xuICAgICAgY2FsbGJhY2suY2hlY2tDb25mbGljdCgpO1xuICAgICAgLy/ku5bjga7jg47jg7zjg4njgYvjgonjga7lm57nrZTjgpLoqr/jgbnjgotcbiAgICAgIG9uUmVzb2x2ZUNvbmZsaWN0ID0gKGJvZHk6IGFueSkgPT4ge1xuICAgICAgICBpZiAoYmMuY2hhaW4ubGVuZ3RoIDwgYm9keS5sZW5ndGgpIHtcbiAgICAgICAgICBpZiAoYmMudmFsaWRDaGFpbihib2R5KSkge1xuICAgICAgICAgICAgYmMuY2hhaW4gPSBib2R5O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImNvbmZsaWN0IHdyb25nIGNoYWluXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG59XG4iXX0=