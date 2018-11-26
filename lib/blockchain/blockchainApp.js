"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _blockchain = _interopRequireWildcard(require("./blockchain"));

var _multisig = _interopRequireDefault(require("./multisig"));

var _responder = _interopRequireWildcard(require("./responder"));

var _contract = _interopRequireDefault(require("../contract/contract"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

require("babel-polyfill");

var BlockChainApp =
/*#__PURE__*/
function (_BlockChain) {
  _inherits(BlockChainApp, _BlockChain);

  function BlockChainApp(opt) {
    var _this;

    _classCallCheck(this, BlockChainApp);

    if (!opt) opt = {};
    _this = _possibleConstructorReturn(this, _getPrototypeOf(BlockChainApp).call(this, opt.phrase));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "multisig", void 0);

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "contract", void 0);

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "responder", void 0);

    _this.multisig = new _multisig.default(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.contract = new _contract.default(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.responder = new _responder.default(_assertThisInitialized(_assertThisInitialized(_this)), opt.callback);
    return _this;
  }

  _createClass(BlockChainApp, [{
    key: "mine",
    value: function mine() {
      var _this2 = this;

      //非同期処理
      return new Promise(function (resolve, reject) {
        //プルーフオブワーク(ナンスの探索)
        var proof = _this2.proofOfWork(); //最後のブロックのハッシュ値


        var previousHash = (0, _blockchain.hash)(_this2.lastBlock()); //新しいブロック

        var block = _this2.newBlock(proof, previousHash); //完了


        if (block) resolve(block);else reject("block error");
      });
    }
  }, {
    key: "makeTransaction",
    value: function makeTransaction(recipient, amount, data) {
      //残高が足りているか
      if (amount > this.nowAmount()) {
        console.log("input error");
        return;
      } //トランザクションの生成


      var tran = this.newTransaction(this.address, recipient, amount, data);
      return tran;
    }
  }, {
    key: "transactionRPC",
    value: function transactionRPC(tran) {
      var rpc = {
        type: _responder.typeRPC.TRANSACRION,
        body: tran
      };
      return rpc;
    }
  }]);

  return BlockChainApp;
}(_blockchain.default);

exports.default = BlockChainApp;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL2Jsb2NrY2hhaW5BcHAudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsIkJsb2NrQ2hhaW5BcHAiLCJvcHQiLCJwaHJhc2UiLCJtdWx0aXNpZyIsIk11bHRpc2lnIiwiY29udHJhY3QiLCJDb250cmFjdCIsInJlc3BvbmRlciIsIlJlc3BvbmRlciIsImNhbGxiYWNrIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJwcm9vZiIsInByb29mT2ZXb3JrIiwicHJldmlvdXNIYXNoIiwibGFzdEJsb2NrIiwiYmxvY2siLCJuZXdCbG9jayIsInJlY2lwaWVudCIsImFtb3VudCIsImRhdGEiLCJub3dBbW91bnQiLCJjb25zb2xlIiwibG9nIiwidHJhbiIsIm5ld1RyYW5zYWN0aW9uIiwiYWRkcmVzcyIsInJwYyIsInR5cGUiLCJ0eXBlUlBDIiwiVFJBTlNBQ1JJT04iLCJib2R5IiwiQmxvY2tDaGFpbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNBOztBQU1BOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVRBQSxPQUFPLENBQUMsZ0JBQUQsQ0FBUDs7SUFhcUJDLGE7Ozs7O0FBSW5CLHlCQUFZQyxHQUFaLEVBQXVFO0FBQUE7O0FBQUE7O0FBQ3JFLFFBQUksQ0FBQ0EsR0FBTCxFQUFVQSxHQUFHLEdBQUcsRUFBTjtBQUNWLHVGQUFNQSxHQUFHLENBQUNDLE1BQVY7O0FBRnFFOztBQUFBOztBQUFBOztBQUdyRSxVQUFLQyxRQUFMLEdBQWdCLElBQUlDLGlCQUFKLHVEQUFoQjtBQUNBLFVBQUtDLFFBQUwsR0FBZ0IsSUFBSUMsaUJBQUosdURBQWhCO0FBQ0EsVUFBS0MsU0FBTCxHQUFpQixJQUFJQyxrQkFBSix3REFBb0JQLEdBQUcsQ0FBQ1EsUUFBeEIsQ0FBakI7QUFMcUU7QUFNdEU7Ozs7MkJBRU07QUFBQTs7QUFDTDtBQUNBLGFBQU8sSUFBSUMsT0FBSixDQUFvQixVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDOUM7QUFDQSxZQUFNQyxLQUFLLEdBQUcsTUFBSSxDQUFDQyxXQUFMLEVBQWQsQ0FGOEMsQ0FHOUM7OztBQUVBLFlBQU1DLFlBQVksR0FBRyxzQkFBSyxNQUFJLENBQUNDLFNBQUwsRUFBTCxDQUFyQixDQUw4QyxDQU05Qzs7QUFDQSxZQUFNQyxLQUFLLEdBQUcsTUFBSSxDQUFDQyxRQUFMLENBQWNMLEtBQWQsRUFBcUJFLFlBQXJCLENBQWQsQ0FQOEMsQ0FROUM7OztBQUNBLFlBQUlFLEtBQUosRUFBV04sT0FBTyxDQUFDTSxLQUFELENBQVAsQ0FBWCxLQUNLTCxNQUFNLENBQUMsYUFBRCxDQUFOO0FBQ04sT0FYTSxDQUFQO0FBWUQ7OztvQ0FFZU8sUyxFQUFtQkMsTSxFQUFnQkMsSSxFQUF3QjtBQUN6RTtBQUNBLFVBQUlELE1BQU0sR0FBRyxLQUFLRSxTQUFMLEVBQWIsRUFBK0I7QUFDN0JDLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGFBQVo7QUFDQTtBQUNELE9BTHdFLENBTXpFOzs7QUFDQSxVQUFNQyxJQUFJLEdBQUcsS0FBS0MsY0FBTCxDQUFvQixLQUFLQyxPQUF6QixFQUFrQ1IsU0FBbEMsRUFBNkNDLE1BQTdDLEVBQXFEQyxJQUFyRCxDQUFiO0FBQ0EsYUFBT0ksSUFBUDtBQUNEOzs7bUNBRWNBLEksRUFBb0I7QUFDakMsVUFBTUcsR0FBUSxHQUFHO0FBQUVDLFFBQUFBLElBQUksRUFBRUMsbUJBQVFDLFdBQWhCO0FBQTZCQyxRQUFBQSxJQUFJLEVBQUVQO0FBQW5DLE9BQWpCO0FBQ0EsYUFBT0csR0FBUDtBQUNEOzs7O0VBMUN3Q0ssbUIiLCJzb3VyY2VzQ29udGVudCI6WyJyZXF1aXJlKFwiYmFiZWwtcG9seWZpbGxcIik7XG5pbXBvcnQgQmxvY2tDaGFpbiwge1xuICBJVHJhbnNhY3Rpb24sXG4gIElUcmFuc2FjdGlvbkRhdGEsXG4gIGhhc2gsXG4gIElCbG9ja1xufSBmcm9tIFwiLi9ibG9ja2NoYWluXCI7XG5pbXBvcnQgTXVsdGlzaWcgZnJvbSBcIi4vbXVsdGlzaWdcIjtcbmltcG9ydCBSZXNwb25kZXIsIHsgUlBDLCB0eXBlUlBDLCBJY2FsbGJhY2tSZXNwb25kZXIgfSBmcm9tIFwiLi9yZXNwb25kZXJcIjtcbmltcG9ydCBDb250cmFjdCBmcm9tIFwiLi4vY29udHJhY3QvY29udHJhY3RcIjtcblxuaW50ZXJmYWNlIEljYWxsYmFja0Jsb2NrY2hhaW4gZXh0ZW5kcyBJY2FsbGJhY2tSZXNwb25kZXIge31cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmxvY2tDaGFpbkFwcCBleHRlbmRzIEJsb2NrQ2hhaW4ge1xuICBtdWx0aXNpZzogTXVsdGlzaWc7XG4gIGNvbnRyYWN0OiBDb250cmFjdDtcbiAgcmVzcG9uZGVyOiBSZXNwb25kZXI7XG4gIGNvbnN0cnVjdG9yKG9wdD86IHsgcGhyYXNlPzogc3RyaW5nOyBjYWxsYmFjaz86IEljYWxsYmFja0Jsb2NrY2hhaW4gfSkge1xuICAgIGlmICghb3B0KSBvcHQgPSB7fTtcbiAgICBzdXBlcihvcHQucGhyYXNlKTtcbiAgICB0aGlzLm11bHRpc2lnID0gbmV3IE11bHRpc2lnKHRoaXMpO1xuICAgIHRoaXMuY29udHJhY3QgPSBuZXcgQ29udHJhY3QodGhpcyk7XG4gICAgdGhpcy5yZXNwb25kZXIgPSBuZXcgUmVzcG9uZGVyKHRoaXMsIG9wdC5jYWxsYmFjayk7XG4gIH1cblxuICBtaW5lKCkge1xuICAgIC8v6Z2e5ZCM5pyf5Yem55CGXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPElCbG9jaz4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgLy/jg5fjg6vjg7zjg5Xjgqrjg5bjg6/jg7zjgq8o44OK44Oz44K544Gu5o6i57SiKVxuICAgICAgY29uc3QgcHJvb2YgPSB0aGlzLnByb29mT2ZXb3JrKCk7XG4gICAgICAvL+acgOW+jOOBruODluODreODg+OCr+OBruODj+ODg+OCt+ODpeWApFxuXG4gICAgICBjb25zdCBwcmV2aW91c0hhc2ggPSBoYXNoKHRoaXMubGFzdEJsb2NrKCkpO1xuICAgICAgLy/mlrDjgZfjgYTjg5bjg63jg4Pjgq9cbiAgICAgIGNvbnN0IGJsb2NrID0gdGhpcy5uZXdCbG9jayhwcm9vZiwgcHJldmlvdXNIYXNoKTtcbiAgICAgIC8v5a6M5LqGXG4gICAgICBpZiAoYmxvY2spIHJlc29sdmUoYmxvY2spO1xuICAgICAgZWxzZSByZWplY3QoXCJibG9jayBlcnJvclwiKTtcbiAgICB9KTtcbiAgfVxuXG4gIG1ha2VUcmFuc2FjdGlvbihyZWNpcGllbnQ6IHN0cmluZywgYW1vdW50OiBudW1iZXIsIGRhdGE6IElUcmFuc2FjdGlvbkRhdGEpIHtcbiAgICAvL+aui+mrmOOBjOi2s+OCiuOBpuOBhOOCi+OBi1xuICAgIGlmIChhbW91bnQgPiB0aGlzLm5vd0Ftb3VudCgpKSB7XG4gICAgICBjb25zb2xlLmxvZyhcImlucHV0IGVycm9yXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OBrueUn+aIkFxuICAgIGNvbnN0IHRyYW4gPSB0aGlzLm5ld1RyYW5zYWN0aW9uKHRoaXMuYWRkcmVzcywgcmVjaXBpZW50LCBhbW91bnQsIGRhdGEpO1xuICAgIHJldHVybiB0cmFuO1xuICB9XG5cbiAgdHJhbnNhY3Rpb25SUEModHJhbjogSVRyYW5zYWN0aW9uKSB7XG4gICAgY29uc3QgcnBjOiBSUEMgPSB7IHR5cGU6IHR5cGVSUEMuVFJBTlNBQ1JJT04sIGJvZHk6IHRyYW4gfTtcbiAgICByZXR1cm4gcnBjO1xuICB9XG59XG4iXX0=