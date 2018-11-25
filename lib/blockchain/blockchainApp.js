"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _blockchain = _interopRequireDefault(require("./blockchain"));

var _multisig = _interopRequireDefault(require("./multisig"));

var _responder = _interopRequireWildcard(require("./responder"));

var _contract = _interopRequireDefault(require("../contract/contract"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

  function BlockChainApp(phrase) {
    var _this;

    _classCallCheck(this, BlockChainApp);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(BlockChainApp).call(this, phrase));

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "multisig", void 0);

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "contract", void 0);

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "responder", void 0);

    _this.multisig = new _multisig.default(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.contract = new _contract.default(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.responder = new _responder.default(_assertThisInitialized(_assertThisInitialized(_this)));
    return _this;
  }

  _createClass(BlockChainApp, [{
    key: "mine",
    value: function mine() {
      var _this2 = this;

      //非同期処理
      return new Promise(function (resolve) {
        //プルーフオブワーク(ナンスの探索)
        var proof = _this2.proofOfWork(); //最後のブロックのハッシュ値


        var previousHash = _this2.hash(_this2.lastBlock()); //新しいブロック


        var block = _this2.newBlock(proof, previousHash); //完了


        resolve(block);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL2Jsb2NrY2hhaW5BcHAudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsIkJsb2NrQ2hhaW5BcHAiLCJwaHJhc2UiLCJtdWx0aXNpZyIsIk11bHRpc2lnIiwiY29udHJhY3QiLCJDb250cmFjdCIsInJlc3BvbmRlciIsIlJlc3BvbmRlciIsIlByb21pc2UiLCJyZXNvbHZlIiwicHJvb2YiLCJwcm9vZk9mV29yayIsInByZXZpb3VzSGFzaCIsImhhc2giLCJsYXN0QmxvY2siLCJibG9jayIsIm5ld0Jsb2NrIiwicmVjaXBpZW50IiwiYW1vdW50IiwiZGF0YSIsIm5vd0Ftb3VudCIsImNvbnNvbGUiLCJsb2ciLCJ0cmFuIiwibmV3VHJhbnNhY3Rpb24iLCJhZGRyZXNzIiwicnBjIiwidHlwZSIsInR5cGVSUEMiLCJUUkFOU0FDUklPTiIsImJvZHkiLCJCbG9ja0NoYWluIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSkFBLE9BQU8sQ0FBQyxnQkFBRCxDQUFQOztJQU1xQkMsYTs7Ozs7QUFJbkIseUJBQVlDLE1BQVosRUFBNkI7QUFBQTs7QUFBQTs7QUFDM0IsdUZBQU1BLE1BQU47O0FBRDJCOztBQUFBOztBQUFBOztBQUUzQixVQUFLQyxRQUFMLEdBQWdCLElBQUlDLGlCQUFKLHVEQUFoQjtBQUNBLFVBQUtDLFFBQUwsR0FBZ0IsSUFBSUMsaUJBQUosdURBQWhCO0FBQ0EsVUFBS0MsU0FBTCxHQUFpQixJQUFJQyxrQkFBSix1REFBakI7QUFKMkI7QUFLNUI7Ozs7MkJBRU07QUFBQTs7QUFDTDtBQUNBLGFBQU8sSUFBSUMsT0FBSixDQUFZLFVBQUFDLE9BQU8sRUFBSTtBQUM1QjtBQUNBLFlBQU1DLEtBQUssR0FBRyxNQUFJLENBQUNDLFdBQUwsRUFBZCxDQUY0QixDQUc1Qjs7O0FBQ0EsWUFBTUMsWUFBWSxHQUFHLE1BQUksQ0FBQ0MsSUFBTCxDQUFVLE1BQUksQ0FBQ0MsU0FBTCxFQUFWLENBQXJCLENBSjRCLENBSzVCOzs7QUFDQSxZQUFNQyxLQUFLLEdBQUcsTUFBSSxDQUFDQyxRQUFMLENBQWNOLEtBQWQsRUFBcUJFLFlBQXJCLENBQWQsQ0FONEIsQ0FPNUI7OztBQUNBSCxRQUFBQSxPQUFPLENBQUNNLEtBQUQsQ0FBUDtBQUNELE9BVE0sQ0FBUDtBQVVEOzs7b0NBRWVFLFMsRUFBbUJDLE0sRUFBZ0JDLEksRUFBd0I7QUFDekU7QUFDQSxVQUFJRCxNQUFNLEdBQUcsS0FBS0UsU0FBTCxFQUFiLEVBQStCO0FBQzdCQyxRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxhQUFaO0FBQ0E7QUFDRCxPQUx3RSxDQU16RTs7O0FBQ0EsVUFBTUMsSUFBSSxHQUFHLEtBQUtDLGNBQUwsQ0FBb0IsS0FBS0MsT0FBekIsRUFBa0NSLFNBQWxDLEVBQTZDQyxNQUE3QyxFQUFxREMsSUFBckQsQ0FBYjtBQUNBLGFBQU9JLElBQVA7QUFDRDs7O21DQUVjQSxJLEVBQW9CO0FBQ2pDLFVBQU1HLEdBQVEsR0FBRztBQUFFQyxRQUFBQSxJQUFJLEVBQUVDLG1CQUFRQyxXQUFoQjtBQUE2QkMsUUFBQUEsSUFBSSxFQUFFUDtBQUFuQyxPQUFqQjtBQUNBLGFBQU9HLEdBQVA7QUFDRDs7OztFQXZDd0NLLG1CIiwic291cmNlc0NvbnRlbnQiOlsicmVxdWlyZShcImJhYmVsLXBvbHlmaWxsXCIpO1xuaW1wb3J0IEJsb2NrQ2hhaW4sIHsgSVRyYW5zYWN0aW9uLCBJVHJhbnNhY3Rpb25EYXRhIH0gZnJvbSBcIi4vYmxvY2tjaGFpblwiO1xuaW1wb3J0IE11bHRpc2lnIGZyb20gXCIuL211bHRpc2lnXCI7XG5pbXBvcnQgUmVzcG9uZGVyLCB7IFJQQywgdHlwZVJQQyB9IGZyb20gXCIuL3Jlc3BvbmRlclwiO1xuaW1wb3J0IENvbnRyYWN0IGZyb20gXCIuLi9jb250cmFjdC9jb250cmFjdFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCbG9ja0NoYWluQXBwIGV4dGVuZHMgQmxvY2tDaGFpbiB7XG4gIG11bHRpc2lnOiBNdWx0aXNpZztcbiAgY29udHJhY3Q6IENvbnRyYWN0O1xuICByZXNwb25kZXI6IFJlc3BvbmRlcjtcbiAgY29uc3RydWN0b3IocGhyYXNlPzogc3RyaW5nKSB7XG4gICAgc3VwZXIocGhyYXNlKTtcbiAgICB0aGlzLm11bHRpc2lnID0gbmV3IE11bHRpc2lnKHRoaXMpO1xuICAgIHRoaXMuY29udHJhY3QgPSBuZXcgQ29udHJhY3QodGhpcyk7XG4gICAgdGhpcy5yZXNwb25kZXIgPSBuZXcgUmVzcG9uZGVyKHRoaXMpO1xuICB9XG5cbiAgbWluZSgpIHtcbiAgICAvL+mdnuWQjOacn+WHpueQhlxuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIC8v44OX44Or44O844OV44Kq44OW44Ov44O844KvKOODiuODs+OCueOBruaOoue0oilcbiAgICAgIGNvbnN0IHByb29mID0gdGhpcy5wcm9vZk9mV29yaygpO1xuICAgICAgLy/mnIDlvozjga7jg5bjg63jg4Pjgq/jga7jg4/jg4Pjgrfjg6XlgKRcbiAgICAgIGNvbnN0IHByZXZpb3VzSGFzaCA9IHRoaXMuaGFzaCh0aGlzLmxhc3RCbG9jaygpKTtcbiAgICAgIC8v5paw44GX44GE44OW44Ot44OD44KvXG4gICAgICBjb25zdCBibG9jayA9IHRoaXMubmV3QmxvY2socHJvb2YsIHByZXZpb3VzSGFzaCk7ICAgICAgICAgICAgXG4gICAgICAvL+WujOS6hlxuICAgICAgcmVzb2x2ZShibG9jayk7XG4gICAgfSk7XG4gIH1cblxuICBtYWtlVHJhbnNhY3Rpb24ocmVjaXBpZW50OiBzdHJpbmcsIGFtb3VudDogbnVtYmVyLCBkYXRhOiBJVHJhbnNhY3Rpb25EYXRhKSB7ICBcbiAgICAvL+aui+mrmOOBjOi2s+OCiuOBpuOBhOOCi+OBi1xuICAgIGlmIChhbW91bnQgPiB0aGlzLm5vd0Ftb3VudCgpKSB7XG4gICAgICBjb25zb2xlLmxvZyhcImlucHV0IGVycm9yXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OBrueUn+aIkFxuICAgIGNvbnN0IHRyYW4gPSB0aGlzLm5ld1RyYW5zYWN0aW9uKHRoaXMuYWRkcmVzcywgcmVjaXBpZW50LCBhbW91bnQsIGRhdGEpOyAgICBcbiAgICByZXR1cm4gdHJhbjtcbiAgfVxuXG4gIHRyYW5zYWN0aW9uUlBDKHRyYW46IElUcmFuc2FjdGlvbikge1xuICAgIGNvbnN0IHJwYzogUlBDID0geyB0eXBlOiB0eXBlUlBDLlRSQU5TQUNSSU9OLCBib2R5OiB0cmFuIH07XG4gICAgcmV0dXJuIHJwYztcbiAgfVxufVxuIl19