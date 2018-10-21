"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _blockchain = _interopRequireDefault(require("./blockchain"));

var _sha = _interopRequireDefault(require("sha1"));

var _multisig = _interopRequireDefault(require("./multisig"));

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

    _this.multisig = new _multisig.default(_assertThisInitialized(_assertThisInitialized(_this)));
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

        console.log("new block forged", JSON.stringify(block)); //ネットワークにブロードキャスト

        _this2.saveChain(); //完了


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
      this.saveChain();
      return tran;
    }
  }, {
    key: "getChain",
    value: function getChain() {
      return this.chain;
    }
  }, {
    key: "saveChain",
    value: function saveChain() {
      localStorage.setItem("blockchain", JSON.stringify(this.chain));
    }
  }, {
    key: "loadChain",
    value: function loadChain() {
      var keyword = (0, _sha.default)(this.cypher.pubKey + this.cypher.secKey);
      localStorage.setItem(keyword, JSON.stringify({
        publicKey: this.cypher.pubKey,
        secretKey: this.cypher.secKey
      }));
      var chain = localStorage.getItem("blockchain");

      if (chain) {
        this.chain = JSON.parse(chain);
      }
    }
  }]);

  return BlockChainApp;
}(_blockchain.default);

exports.default = BlockChainApp;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL2Jsb2NrY2hhaW5BcHAudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsIkJsb2NrQ2hhaW5BcHAiLCJzZWNLZXkiLCJwdWJLZXkiLCJtdWx0aXNpZyIsIk11bHRpc2lnIiwiUHJvbWlzZSIsInJlc29sdmUiLCJwcm9vZiIsInByb29mT2ZXb3JrIiwicHJldmlvdXNIYXNoIiwiaGFzaCIsImxhc3RCbG9jayIsImJsb2NrIiwibmV3QmxvY2siLCJjb25zb2xlIiwibG9nIiwiSlNPTiIsInN0cmluZ2lmeSIsInNhdmVDaGFpbiIsInJlY2lwaWVudCIsImFtb3VudCIsImRhdGEiLCJub3dBbW91bnQiLCJ0cmFuIiwibmV3VHJhbnNhY3Rpb24iLCJhZGRyZXNzIiwiY2hhaW4iLCJsb2NhbFN0b3JhZ2UiLCJzZXRJdGVtIiwia2V5d29yZCIsImN5cGhlciIsInB1YmxpY0tleSIsInNlY3JldEtleSIsImdldEl0ZW0iLCJwYXJzZSIsIkJsb2NrQ2hhaW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSEFBLE9BQU8sQ0FBQyxnQkFBRCxDQUFQOztJQUtxQkMsYTs7Ozs7QUFFbkIseUJBQVlDLE1BQVosRUFBNkJDLE1BQTdCLEVBQThDO0FBQUE7O0FBQUE7O0FBQzVDLHVGQUFNRCxNQUFOLEVBQWNDLE1BQWQ7O0FBRDRDOztBQUU1QyxVQUFLQyxRQUFMLEdBQWdCLElBQUlDLGlCQUFKLHVEQUFoQjtBQUY0QztBQUc3Qzs7OzsyQkFFTTtBQUFBOztBQUNMO0FBQ0EsYUFBTyxJQUFJQyxPQUFKLENBQVksVUFBQUMsT0FBTyxFQUFJO0FBQzVCO0FBQ0EsWUFBTUMsS0FBSyxHQUFHLE1BQUksQ0FBQ0MsV0FBTCxFQUFkLENBRjRCLENBRzVCOzs7QUFDQSxZQUFNQyxZQUFZLEdBQUcsTUFBSSxDQUFDQyxJQUFMLENBQVUsTUFBSSxDQUFDQyxTQUFMLEVBQVYsQ0FBckIsQ0FKNEIsQ0FLNUI7OztBQUNBLFlBQU1DLEtBQUssR0FBRyxNQUFJLENBQUNDLFFBQUwsQ0FBY04sS0FBZCxFQUFxQkUsWUFBckIsQ0FBZDs7QUFDQUssUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksa0JBQVosRUFBZ0NDLElBQUksQ0FBQ0MsU0FBTCxDQUFlTCxLQUFmLENBQWhDLEVBUDRCLENBUTVCOztBQUNBLFFBQUEsTUFBSSxDQUFDTSxTQUFMLEdBVDRCLENBVTVCOzs7QUFDQVosUUFBQUEsT0FBTyxDQUFDTSxLQUFELENBQVA7QUFDRCxPQVpNLENBQVA7QUFhRDs7O29DQUVlTyxTLEVBQW1CQyxNLEVBQWdCQyxJLEVBQVc7QUFDNUQ7QUFDQSxVQUFJLEVBQUVGLFNBQVMsSUFBSUMsTUFBZixDQUFKLEVBQTRCO0FBQzFCTixRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxhQUFaO0FBQ0E7QUFDRCxPQUwyRCxDQU01RDs7O0FBQ0EsVUFBSUssTUFBTSxHQUFHLEtBQUtFLFNBQUwsRUFBYixFQUErQjtBQUM3QlIsUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksYUFBWjtBQUNBO0FBQ0QsT0FWMkQsQ0FXNUQ7OztBQUNBLFVBQU1RLElBQUksR0FBRyxLQUFLQyxjQUFMLENBQW9CLEtBQUtDLE9BQXpCLEVBQWtDTixTQUFsQyxFQUE2Q0MsTUFBN0MsRUFBcURDLElBQXJELENBQWI7QUFDQVAsTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksaUJBQVosRUFBK0JRLElBQS9CO0FBQ0EsV0FBS0wsU0FBTDtBQUVBLGFBQU9LLElBQVA7QUFDRDs7OytCQUVVO0FBQ1QsYUFBTyxLQUFLRyxLQUFaO0FBQ0Q7OztnQ0FFVztBQUNWQyxNQUFBQSxZQUFZLENBQUNDLE9BQWIsQ0FBcUIsWUFBckIsRUFBbUNaLElBQUksQ0FBQ0MsU0FBTCxDQUFlLEtBQUtTLEtBQXBCLENBQW5DO0FBQ0Q7OztnQ0FFVztBQUNWLFVBQU1HLE9BQU8sR0FBRyxrQkFBSyxLQUFLQyxNQUFMLENBQVk1QixNQUFaLEdBQXFCLEtBQUs0QixNQUFMLENBQVk3QixNQUF0QyxDQUFoQjtBQUNBMEIsTUFBQUEsWUFBWSxDQUFDQyxPQUFiLENBQ0VDLE9BREYsRUFFRWIsSUFBSSxDQUFDQyxTQUFMLENBQWU7QUFDYmMsUUFBQUEsU0FBUyxFQUFFLEtBQUtELE1BQUwsQ0FBWTVCLE1BRFY7QUFFYjhCLFFBQUFBLFNBQVMsRUFBRSxLQUFLRixNQUFMLENBQVk3QjtBQUZWLE9BQWYsQ0FGRjtBQU9BLFVBQU15QixLQUFLLEdBQUdDLFlBQVksQ0FBQ00sT0FBYixDQUFxQixZQUFyQixDQUFkOztBQUNBLFVBQUlQLEtBQUosRUFBVztBQUNULGFBQUtBLEtBQUwsR0FBYVYsSUFBSSxDQUFDa0IsS0FBTCxDQUFXUixLQUFYLENBQWI7QUFDRDtBQUNGOzs7O0VBaEV3Q1MsbUIiLCJzb3VyY2VzQ29udGVudCI6WyJyZXF1aXJlKFwiYmFiZWwtcG9seWZpbGxcIik7XG5pbXBvcnQgQmxvY2tDaGFpbiBmcm9tIFwiLi9ibG9ja2NoYWluXCI7XG5pbXBvcnQgc2hhMSBmcm9tIFwic2hhMVwiO1xuaW1wb3J0IE11bHRpc2lnIGZyb20gXCIuL211bHRpc2lnXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJsb2NrQ2hhaW5BcHAgZXh0ZW5kcyBCbG9ja0NoYWluIHtcbiAgbXVsdGlzaWc6IE11bHRpc2lnO1xuICBjb25zdHJ1Y3RvcihzZWNLZXk/OiBzdHJpbmcsIHB1YktleT86IHN0cmluZykge1xuICAgIHN1cGVyKHNlY0tleSwgcHViS2V5KTtcbiAgICB0aGlzLm11bHRpc2lnID0gbmV3IE11bHRpc2lnKHRoaXMpO1xuICB9XG5cbiAgbWluZSgpIHtcbiAgICAvL+mdnuWQjOacn+WHpueQhlxuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIC8v44OX44Or44O844OV44Kq44OW44Ov44O844KvKOODiuODs+OCueOBruaOoue0oilcbiAgICAgIGNvbnN0IHByb29mID0gdGhpcy5wcm9vZk9mV29yaygpO1xuICAgICAgLy/mnIDlvozjga7jg5bjg63jg4Pjgq/jga7jg4/jg4Pjgrfjg6XlgKRcbiAgICAgIGNvbnN0IHByZXZpb3VzSGFzaCA9IHRoaXMuaGFzaCh0aGlzLmxhc3RCbG9jaygpKTtcbiAgICAgIC8v5paw44GX44GE44OW44Ot44OD44KvXG4gICAgICBjb25zdCBibG9jayA9IHRoaXMubmV3QmxvY2socHJvb2YsIHByZXZpb3VzSGFzaCk7XG4gICAgICBjb25zb2xlLmxvZyhcIm5ldyBibG9jayBmb3JnZWRcIiwgSlNPTi5zdHJpbmdpZnkoYmxvY2spKTtcbiAgICAgIC8v44ON44OD44OI44Ov44O844Kv44Gr44OW44Ot44O844OJ44Kt44Oj44K544OIXG4gICAgICB0aGlzLnNhdmVDaGFpbigpO1xuICAgICAgLy/lrozkuoZcbiAgICAgIHJlc29sdmUoYmxvY2spO1xuICAgIH0pO1xuICB9XG5cbiAgbWFrZVRyYW5zYWN0aW9uKHJlY2lwaWVudDogc3RyaW5nLCBhbW91bnQ6IG51bWJlciwgZGF0YTogYW55KSB7XG4gICAgLy/lhaXlipvmg4XloLHjgYzotrPjgorjgabjgYTjgovjgYtcbiAgICBpZiAoIShyZWNpcGllbnQgJiYgYW1vdW50KSkge1xuICAgICAgY29uc29sZS5sb2coXCJpbnB1dCBlcnJvclwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy/mrovpq5jjgYzotrPjgorjgabjgYTjgovjgYtcbiAgICBpZiAoYW1vdW50ID4gdGhpcy5ub3dBbW91bnQoKSkge1xuICAgICAgY29uc29sZS5sb2coXCJpbnB1dCBlcnJvclwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7Pjga7nlJ/miJBcbiAgICBjb25zdCB0cmFuID0gdGhpcy5uZXdUcmFuc2FjdGlvbih0aGlzLmFkZHJlc3MsIHJlY2lwaWVudCwgYW1vdW50LCBkYXRhKTtcbiAgICBjb25zb2xlLmxvZyhcIm1ha2VUcmFuc2FjdGlvblwiLCB0cmFuKTtcbiAgICB0aGlzLnNhdmVDaGFpbigpO1xuXG4gICAgcmV0dXJuIHRyYW47XG4gIH1cblxuICBnZXRDaGFpbigpIHtcbiAgICByZXR1cm4gdGhpcy5jaGFpbjtcbiAgfVxuXG4gIHNhdmVDaGFpbigpIHtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImJsb2NrY2hhaW5cIiwgSlNPTi5zdHJpbmdpZnkodGhpcy5jaGFpbikpO1xuICB9XG5cbiAgbG9hZENoYWluKCkge1xuICAgIGNvbnN0IGtleXdvcmQgPSBzaGExKHRoaXMuY3lwaGVyLnB1YktleSArIHRoaXMuY3lwaGVyLnNlY0tleSk7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXG4gICAgICBrZXl3b3JkLFxuICAgICAgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBwdWJsaWNLZXk6IHRoaXMuY3lwaGVyLnB1YktleSxcbiAgICAgICAgc2VjcmV0S2V5OiB0aGlzLmN5cGhlci5zZWNLZXlcbiAgICAgIH0pXG4gICAgKTtcbiAgICBjb25zdCBjaGFpbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiYmxvY2tjaGFpblwiKTtcbiAgICBpZiAoY2hhaW4pIHtcbiAgICAgIHRoaXMuY2hhaW4gPSBKU09OLnBhcnNlKGNoYWluKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==