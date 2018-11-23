"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _blockchain = _interopRequireDefault(require("./blockchain"));

var _sha = _interopRequireDefault(require("sha1"));

var _multisig = _interopRequireDefault(require("./multisig"));

var _responder = _interopRequireDefault(require("./responder"));

var _contract = _interopRequireDefault(require("../contract/contract"));

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL2Jsb2NrY2hhaW5BcHAudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsIkJsb2NrQ2hhaW5BcHAiLCJzZWNLZXkiLCJwdWJLZXkiLCJtdWx0aXNpZyIsIk11bHRpc2lnIiwiY29udHJhY3QiLCJDb250cmFjdCIsInJlc3BvbmRlciIsIlJlc3BvbmRlciIsIlByb21pc2UiLCJyZXNvbHZlIiwicHJvb2YiLCJwcm9vZk9mV29yayIsInByZXZpb3VzSGFzaCIsImhhc2giLCJsYXN0QmxvY2siLCJibG9jayIsIm5ld0Jsb2NrIiwiY29uc29sZSIsImxvZyIsInJlY2lwaWVudCIsImFtb3VudCIsImRhdGEiLCJub3dBbW91bnQiLCJ0cmFuIiwibmV3VHJhbnNhY3Rpb24iLCJhZGRyZXNzIiwic2F2ZUNoYWluIiwiY2hhaW4iLCJsb2NhbFN0b3JhZ2UiLCJzZXRJdGVtIiwiSlNPTiIsInN0cmluZ2lmeSIsImtleXdvcmQiLCJjeXBoZXIiLCJwdWJsaWNLZXkiLCJzZWNyZXRLZXkiLCJnZXRJdGVtIiwicGFyc2UiLCJCbG9ja0NoYWluIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQU5BQSxPQUFPLENBQUMsZ0JBQUQsQ0FBUDs7SUFRcUJDLGE7Ozs7O0FBSW5CLHlCQUFZQyxNQUFaLEVBQTZCQyxNQUE3QixFQUE4QztBQUFBOztBQUFBOztBQUM1Qyx1RkFBTUQsTUFBTixFQUFjQyxNQUFkOztBQUQ0Qzs7QUFBQTs7QUFBQTs7QUFFNUMsVUFBS0MsUUFBTCxHQUFnQixJQUFJQyxpQkFBSix1REFBaEI7QUFDQSxVQUFLQyxRQUFMLEdBQWdCLElBQUlDLGlCQUFKLHVEQUFoQjtBQUNBLFVBQUtDLFNBQUwsR0FBaUIsSUFBSUMsa0JBQUosdURBQWpCO0FBSjRDO0FBSzdDOzs7OzJCQUVNO0FBQUE7O0FBQ0w7QUFDQSxhQUFPLElBQUlDLE9BQUosQ0FBWSxVQUFBQyxPQUFPLEVBQUk7QUFDNUI7QUFDQSxZQUFNQyxLQUFLLEdBQUcsTUFBSSxDQUFDQyxXQUFMLEVBQWQsQ0FGNEIsQ0FHNUI7OztBQUNBLFlBQU1DLFlBQVksR0FBRyxNQUFJLENBQUNDLElBQUwsQ0FBVSxNQUFJLENBQUNDLFNBQUwsRUFBVixDQUFyQixDQUo0QixDQUs1Qjs7O0FBQ0EsWUFBTUMsS0FBSyxHQUFHLE1BQUksQ0FBQ0MsUUFBTCxDQUFjTixLQUFkLEVBQXFCRSxZQUFyQixDQUFkOztBQUNBSyxRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxrQkFBWixFQUFnQztBQUFFSCxVQUFBQSxLQUFLLEVBQUxBO0FBQUYsU0FBaEMsRUFQNEIsQ0FRNUI7QUFDQTs7QUFDQU4sUUFBQUEsT0FBTyxDQUFDTSxLQUFELENBQVA7QUFDRCxPQVhNLENBQVA7QUFZRDs7O29DQUVlSSxTLEVBQW1CQyxNLEVBQWdCQyxJLEVBQVc7QUFDNUQ7QUFDQSxVQUFJLEVBQUVGLFNBQVMsSUFBSUMsTUFBZixDQUFKLEVBQTRCO0FBQzFCSCxRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxhQUFaO0FBQ0E7QUFDRCxPQUwyRCxDQU01RDs7O0FBQ0EsVUFBSUUsTUFBTSxHQUFHLEtBQUtFLFNBQUwsRUFBYixFQUErQjtBQUM3QkwsUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksYUFBWjtBQUNBO0FBQ0QsT0FWMkQsQ0FXNUQ7OztBQUNBLFVBQU1LLElBQUksR0FBRyxLQUFLQyxjQUFMLENBQW9CLEtBQUtDLE9BQXpCLEVBQWtDTixTQUFsQyxFQUE2Q0MsTUFBN0MsRUFBcURDLElBQXJELENBQWI7QUFDQUosTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksaUJBQVosRUFBK0JLLElBQS9CO0FBQ0EsV0FBS0csU0FBTDtBQUVBLGFBQU9ILElBQVA7QUFDRDs7OytCQUVVO0FBQ1QsYUFBTyxLQUFLSSxLQUFaO0FBQ0Q7OztnQ0FFVztBQUNWQyxNQUFBQSxZQUFZLENBQUNDLE9BQWIsQ0FBcUIsWUFBckIsRUFBbUNDLElBQUksQ0FBQ0MsU0FBTCxDQUFlLEtBQUtKLEtBQXBCLENBQW5DO0FBQ0Q7OztnQ0FFVztBQUNWLFVBQU1LLE9BQU8sR0FBRyxrQkFBSyxLQUFLQyxNQUFMLENBQVloQyxNQUFaLEdBQXFCLEtBQUtnQyxNQUFMLENBQVlqQyxNQUF0QyxDQUFoQjtBQUNBNEIsTUFBQUEsWUFBWSxDQUFDQyxPQUFiLENBQ0VHLE9BREYsRUFFRUYsSUFBSSxDQUFDQyxTQUFMLENBQWU7QUFDYkcsUUFBQUEsU0FBUyxFQUFFLEtBQUtELE1BQUwsQ0FBWWhDLE1BRFY7QUFFYmtDLFFBQUFBLFNBQVMsRUFBRSxLQUFLRixNQUFMLENBQVlqQztBQUZWLE9BQWYsQ0FGRjtBQU9BLFVBQU0yQixLQUFLLEdBQUdDLFlBQVksQ0FBQ1EsT0FBYixDQUFxQixZQUFyQixDQUFkOztBQUNBLFVBQUlULEtBQUosRUFBVztBQUNULGFBQUtBLEtBQUwsR0FBYUcsSUFBSSxDQUFDTyxLQUFMLENBQVdWLEtBQVgsQ0FBYjtBQUNEO0FBQ0Y7Ozs7RUFuRXdDVyxtQiIsInNvdXJjZXNDb250ZW50IjpbInJlcXVpcmUoXCJiYWJlbC1wb2x5ZmlsbFwiKTtcbmltcG9ydCBCbG9ja0NoYWluLCB7IElUcmFuc2FjdGlvbiB9IGZyb20gXCIuL2Jsb2NrY2hhaW5cIjtcbmltcG9ydCBzaGExIGZyb20gXCJzaGExXCI7XG5pbXBvcnQgTXVsdGlzaWcgZnJvbSBcIi4vbXVsdGlzaWdcIjtcbmltcG9ydCBSZXNwb25kZXIgZnJvbSBcIi4vcmVzcG9uZGVyXCI7XG5pbXBvcnQgQ29udHJhY3RWTSBmcm9tIFwiLi4vY29udHJhY3QvY29udHJhY3RWTVwiO1xuaW1wb3J0IENvbnRyYWN0IGZyb20gXCIuLi9jb250cmFjdC9jb250cmFjdFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCbG9ja0NoYWluQXBwIGV4dGVuZHMgQmxvY2tDaGFpbiB7XG4gIG11bHRpc2lnOiBNdWx0aXNpZztcbiAgY29udHJhY3Q6IENvbnRyYWN0O1xuICByZXNwb25kZXI6IFJlc3BvbmRlcjtcbiAgY29uc3RydWN0b3Ioc2VjS2V5Pzogc3RyaW5nLCBwdWJLZXk/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihzZWNLZXksIHB1YktleSk7XG4gICAgdGhpcy5tdWx0aXNpZyA9IG5ldyBNdWx0aXNpZyh0aGlzKTtcbiAgICB0aGlzLmNvbnRyYWN0ID0gbmV3IENvbnRyYWN0KHRoaXMpO1xuICAgIHRoaXMucmVzcG9uZGVyID0gbmV3IFJlc3BvbmRlcih0aGlzKTtcbiAgfVxuXG4gIG1pbmUoKSB7XG4gICAgLy/pnZ7lkIzmnJ/lh6bnkIZcbiAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAvL+ODl+ODq+ODvOODleOCquODluODr+ODvOOCryjjg4rjg7Pjgrnjga7mjqLntKIpXG4gICAgICBjb25zdCBwcm9vZiA9IHRoaXMucHJvb2ZPZldvcmsoKTtcbiAgICAgIC8v5pyA5b6M44Gu44OW44Ot44OD44Kv44Gu44OP44OD44K344Ol5YCkXG4gICAgICBjb25zdCBwcmV2aW91c0hhc2ggPSB0aGlzLmhhc2godGhpcy5sYXN0QmxvY2soKSk7XG4gICAgICAvL+aWsOOBl+OBhOODluODreODg+OCr1xuICAgICAgY29uc3QgYmxvY2sgPSB0aGlzLm5ld0Jsb2NrKHByb29mLCBwcmV2aW91c0hhc2gpO1xuICAgICAgY29uc29sZS5sb2coXCJuZXcgYmxvY2sgZm9yZ2VkXCIsIHsgYmxvY2sgfSk7XG4gICAgICAvLyB0aGlzLnNhdmVDaGFpbigpO1xuICAgICAgLy/lrozkuoZcbiAgICAgIHJlc29sdmUoYmxvY2spO1xuICAgIH0pO1xuICB9XG5cbiAgbWFrZVRyYW5zYWN0aW9uKHJlY2lwaWVudDogc3RyaW5nLCBhbW91bnQ6IG51bWJlciwgZGF0YTogYW55KSB7XG4gICAgLy/lhaXlipvmg4XloLHjgYzotrPjgorjgabjgYTjgovjgYtcbiAgICBpZiAoIShyZWNpcGllbnQgJiYgYW1vdW50KSkge1xuICAgICAgY29uc29sZS5sb2coXCJpbnB1dCBlcnJvclwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy/mrovpq5jjgYzotrPjgorjgabjgYTjgovjgYtcbiAgICBpZiAoYW1vdW50ID4gdGhpcy5ub3dBbW91bnQoKSkge1xuICAgICAgY29uc29sZS5sb2coXCJpbnB1dCBlcnJvclwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7Pjga7nlJ/miJBcbiAgICBjb25zdCB0cmFuID0gdGhpcy5uZXdUcmFuc2FjdGlvbih0aGlzLmFkZHJlc3MsIHJlY2lwaWVudCwgYW1vdW50LCBkYXRhKTtcbiAgICBjb25zb2xlLmxvZyhcIm1ha2VUcmFuc2FjdGlvblwiLCB0cmFuKTtcbiAgICB0aGlzLnNhdmVDaGFpbigpO1xuXG4gICAgcmV0dXJuIHRyYW47XG4gIH1cblxuICBnZXRDaGFpbigpIHtcbiAgICByZXR1cm4gdGhpcy5jaGFpbjtcbiAgfVxuXG4gIHNhdmVDaGFpbigpIHtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImJsb2NrY2hhaW5cIiwgSlNPTi5zdHJpbmdpZnkodGhpcy5jaGFpbikpO1xuICB9XG5cbiAgbG9hZENoYWluKCkge1xuICAgIGNvbnN0IGtleXdvcmQgPSBzaGExKHRoaXMuY3lwaGVyLnB1YktleSArIHRoaXMuY3lwaGVyLnNlY0tleSk7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXG4gICAgICBrZXl3b3JkLFxuICAgICAgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBwdWJsaWNLZXk6IHRoaXMuY3lwaGVyLnB1YktleSxcbiAgICAgICAgc2VjcmV0S2V5OiB0aGlzLmN5cGhlci5zZWNLZXlcbiAgICAgIH0pXG4gICAgKTtcbiAgICBjb25zdCBjaGFpbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiYmxvY2tjaGFpblwiKTtcbiAgICBpZiAoY2hhaW4pIHtcbiAgICAgIHRoaXMuY2hhaW4gPSBKU09OLnBhcnNlKGNoYWluKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==