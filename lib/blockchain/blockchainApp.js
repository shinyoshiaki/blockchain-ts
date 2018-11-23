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

  function BlockChainApp(secKey, pubKey) {
    var _this;

    _classCallCheck(this, BlockChainApp);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(BlockChainApp).call(this, secKey, pubKey));

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


        var block = _this2.newBlock(proof, previousHash);

        console.log("new block forged", {
          block: block
        }); // this.saveChain();
        //完了

        resolve(block);
      });
    }
  }, {
    key: "makeTransaction",
    value: function makeTransaction(recipient, amount, data) {
      //入力情報が足りているか
      if (!(recipient && amount)) {
        console.log("input error");
        return;
      } //残高が足りているか


      if (amount > this.nowAmount()) {
        console.log("input error");
        return;
      } //トランザクションの生成


      var tran = this.newTransaction(this.address, recipient, amount, data);
      console.log("makeTransaction", tran);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL2Jsb2NrY2hhaW5BcHAudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsIkJsb2NrQ2hhaW5BcHAiLCJzZWNLZXkiLCJwdWJLZXkiLCJtdWx0aXNpZyIsIk11bHRpc2lnIiwiY29udHJhY3QiLCJDb250cmFjdCIsInJlc3BvbmRlciIsIlJlc3BvbmRlciIsIlByb21pc2UiLCJyZXNvbHZlIiwicHJvb2YiLCJwcm9vZk9mV29yayIsInByZXZpb3VzSGFzaCIsImhhc2giLCJsYXN0QmxvY2siLCJibG9jayIsIm5ld0Jsb2NrIiwiY29uc29sZSIsImxvZyIsInJlY2lwaWVudCIsImFtb3VudCIsImRhdGEiLCJub3dBbW91bnQiLCJ0cmFuIiwibmV3VHJhbnNhY3Rpb24iLCJhZGRyZXNzIiwicnBjIiwidHlwZSIsInR5cGVSUEMiLCJUUkFOU0FDUklPTiIsImJvZHkiLCJCbG9ja0NoYWluIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBTkFBLE9BQU8sQ0FBQyxnQkFBRCxDQUFQOztJQVFxQkMsYTs7Ozs7QUFJbkIseUJBQVlDLE1BQVosRUFBNkJDLE1BQTdCLEVBQThDO0FBQUE7O0FBQUE7O0FBQzVDLHVGQUFNRCxNQUFOLEVBQWNDLE1BQWQ7O0FBRDRDOztBQUFBOztBQUFBOztBQUU1QyxVQUFLQyxRQUFMLEdBQWdCLElBQUlDLGlCQUFKLHVEQUFoQjtBQUNBLFVBQUtDLFFBQUwsR0FBZ0IsSUFBSUMsaUJBQUosdURBQWhCO0FBQ0EsVUFBS0MsU0FBTCxHQUFpQixJQUFJQyxrQkFBSix1REFBakI7QUFKNEM7QUFLN0M7Ozs7MkJBRU07QUFBQTs7QUFDTDtBQUNBLGFBQU8sSUFBSUMsT0FBSixDQUFZLFVBQUFDLE9BQU8sRUFBSTtBQUM1QjtBQUNBLFlBQU1DLEtBQUssR0FBRyxNQUFJLENBQUNDLFdBQUwsRUFBZCxDQUY0QixDQUc1Qjs7O0FBQ0EsWUFBTUMsWUFBWSxHQUFHLE1BQUksQ0FBQ0MsSUFBTCxDQUFVLE1BQUksQ0FBQ0MsU0FBTCxFQUFWLENBQXJCLENBSjRCLENBSzVCOzs7QUFDQSxZQUFNQyxLQUFLLEdBQUcsTUFBSSxDQUFDQyxRQUFMLENBQWNOLEtBQWQsRUFBcUJFLFlBQXJCLENBQWQ7O0FBQ0FLLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGtCQUFaLEVBQWdDO0FBQUVILFVBQUFBLEtBQUssRUFBTEE7QUFBRixTQUFoQyxFQVA0QixDQVE1QjtBQUNBOztBQUNBTixRQUFBQSxPQUFPLENBQUNNLEtBQUQsQ0FBUDtBQUNELE9BWE0sQ0FBUDtBQVlEOzs7b0NBRWVJLFMsRUFBbUJDLE0sRUFBZ0JDLEksRUFBVztBQUM1RDtBQUNBLFVBQUksRUFBRUYsU0FBUyxJQUFJQyxNQUFmLENBQUosRUFBNEI7QUFDMUJILFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGFBQVo7QUFDQTtBQUNELE9BTDJELENBTTVEOzs7QUFDQSxVQUFJRSxNQUFNLEdBQUcsS0FBS0UsU0FBTCxFQUFiLEVBQStCO0FBQzdCTCxRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxhQUFaO0FBQ0E7QUFDRCxPQVYyRCxDQVc1RDs7O0FBQ0EsVUFBTUssSUFBSSxHQUFHLEtBQUtDLGNBQUwsQ0FBb0IsS0FBS0MsT0FBekIsRUFBa0NOLFNBQWxDLEVBQTZDQyxNQUE3QyxFQUFxREMsSUFBckQsQ0FBYjtBQUNBSixNQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxpQkFBWixFQUErQkssSUFBL0I7QUFDQSxhQUFPQSxJQUFQO0FBQ0Q7OzttQ0FFY0EsSSxFQUFvQjtBQUNqQyxVQUFNRyxHQUFRLEdBQUc7QUFBRUMsUUFBQUEsSUFBSSxFQUFFQyxtQkFBUUMsV0FBaEI7QUFBNkJDLFFBQUFBLElBQUksRUFBRVA7QUFBbkMsT0FBakI7QUFDQSxhQUFPRyxHQUFQO0FBQ0Q7Ozs7RUEvQ3dDSyxtQiIsInNvdXJjZXNDb250ZW50IjpbInJlcXVpcmUoXCJiYWJlbC1wb2x5ZmlsbFwiKTtcbmltcG9ydCBCbG9ja0NoYWluLCB7IElUcmFuc2FjdGlvbiB9IGZyb20gXCIuL2Jsb2NrY2hhaW5cIjtcbmltcG9ydCBzaGExIGZyb20gXCJzaGExXCI7XG5pbXBvcnQgTXVsdGlzaWcgZnJvbSBcIi4vbXVsdGlzaWdcIjtcbmltcG9ydCBSZXNwb25kZXIsIHsgUlBDLCB0eXBlUlBDIH0gZnJvbSBcIi4vcmVzcG9uZGVyXCI7XG5pbXBvcnQgQ29udHJhY3RWTSBmcm9tIFwiLi4vY29udHJhY3QvY29udHJhY3RWTVwiO1xuaW1wb3J0IENvbnRyYWN0IGZyb20gXCIuLi9jb250cmFjdC9jb250cmFjdFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCbG9ja0NoYWluQXBwIGV4dGVuZHMgQmxvY2tDaGFpbiB7XG4gIG11bHRpc2lnOiBNdWx0aXNpZztcbiAgY29udHJhY3Q6IENvbnRyYWN0O1xuICByZXNwb25kZXI6IFJlc3BvbmRlcjtcbiAgY29uc3RydWN0b3Ioc2VjS2V5Pzogc3RyaW5nLCBwdWJLZXk/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihzZWNLZXksIHB1YktleSk7XG4gICAgdGhpcy5tdWx0aXNpZyA9IG5ldyBNdWx0aXNpZyh0aGlzKTtcbiAgICB0aGlzLmNvbnRyYWN0ID0gbmV3IENvbnRyYWN0KHRoaXMpO1xuICAgIHRoaXMucmVzcG9uZGVyID0gbmV3IFJlc3BvbmRlcih0aGlzKTtcbiAgfVxuXG4gIG1pbmUoKSB7XG4gICAgLy/pnZ7lkIzmnJ/lh6bnkIZcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAvL+ODl+ODq+ODvOODleOCquODluODr+ODvOOCryjjg4rjg7Pjgrnjga7mjqLntKIpXG4gICAgICBjb25zdCBwcm9vZiA9IHRoaXMucHJvb2ZPZldvcmsoKTtcbiAgICAgIC8v5pyA5b6M44Gu44OW44Ot44OD44Kv44Gu44OP44OD44K344Ol5YCkXG4gICAgICBjb25zdCBwcmV2aW91c0hhc2ggPSB0aGlzLmhhc2godGhpcy5sYXN0QmxvY2soKSk7XG4gICAgICAvL+aWsOOBl+OBhOODluODreODg+OCr1xuICAgICAgY29uc3QgYmxvY2sgPSB0aGlzLm5ld0Jsb2NrKHByb29mLCBwcmV2aW91c0hhc2gpO1xuICAgICAgY29uc29sZS5sb2coXCJuZXcgYmxvY2sgZm9yZ2VkXCIsIHsgYmxvY2sgfSk7XG4gICAgICAvLyB0aGlzLnNhdmVDaGFpbigpO1xuICAgICAgLy/lrozkuoZcbiAgICAgIHJlc29sdmUoYmxvY2spO1xuICAgIH0pO1xuICB9XG5cbiAgbWFrZVRyYW5zYWN0aW9uKHJlY2lwaWVudDogc3RyaW5nLCBhbW91bnQ6IG51bWJlciwgZGF0YTogYW55KSB7XG4gICAgLy/lhaXlipvmg4XloLHjgYzotrPjgorjgabjgYTjgovjgYtcbiAgICBpZiAoIShyZWNpcGllbnQgJiYgYW1vdW50KSkge1xuICAgICAgY29uc29sZS5sb2coXCJpbnB1dCBlcnJvclwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy/mrovpq5jjgYzotrPjgorjgabjgYTjgovjgYtcbiAgICBpZiAoYW1vdW50ID4gdGhpcy5ub3dBbW91bnQoKSkge1xuICAgICAgY29uc29sZS5sb2coXCJpbnB1dCBlcnJvclwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7Pjga7nlJ/miJBcbiAgICBjb25zdCB0cmFuID0gdGhpcy5uZXdUcmFuc2FjdGlvbih0aGlzLmFkZHJlc3MsIHJlY2lwaWVudCwgYW1vdW50LCBkYXRhKTtcbiAgICBjb25zb2xlLmxvZyhcIm1ha2VUcmFuc2FjdGlvblwiLCB0cmFuKTtcbiAgICByZXR1cm4gdHJhbjtcbiAgfVxuXG4gIHRyYW5zYWN0aW9uUlBDKHRyYW46IElUcmFuc2FjdGlvbikge1xuICAgIGNvbnN0IHJwYzogUlBDID0geyB0eXBlOiB0eXBlUlBDLlRSQU5TQUNSSU9OLCBib2R5OiB0cmFuIH07XG4gICAgcmV0dXJuIHJwYztcbiAgfVxufVxuIl19