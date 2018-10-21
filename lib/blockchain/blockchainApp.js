"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _blockchain = _interopRequireDefault(require("./blockchain"));

var _sha = _interopRequireDefault(require("sha1"));

var _multisig = _interopRequireDefault(require("./multisig"));

var _responder = _interopRequireDefault(require("./responder"));

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

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "responder", void 0);

    _this.multisig = new _multisig.default(_assertThisInitialized(_assertThisInitialized(_this)));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL2Jsb2NrY2hhaW5BcHAudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsIkJsb2NrQ2hhaW5BcHAiLCJzZWNLZXkiLCJwdWJLZXkiLCJtdWx0aXNpZyIsIk11bHRpc2lnIiwicmVzcG9uZGVyIiwiUmVzcG9uZGVyIiwiUHJvbWlzZSIsInJlc29sdmUiLCJwcm9vZiIsInByb29mT2ZXb3JrIiwicHJldmlvdXNIYXNoIiwiaGFzaCIsImxhc3RCbG9jayIsImJsb2NrIiwibmV3QmxvY2siLCJjb25zb2xlIiwibG9nIiwicmVjaXBpZW50IiwiYW1vdW50IiwiZGF0YSIsIm5vd0Ftb3VudCIsInRyYW4iLCJuZXdUcmFuc2FjdGlvbiIsImFkZHJlc3MiLCJzYXZlQ2hhaW4iLCJjaGFpbiIsImxvY2FsU3RvcmFnZSIsInNldEl0ZW0iLCJKU09OIiwic3RyaW5naWZ5Iiwia2V5d29yZCIsImN5cGhlciIsInB1YmxpY0tleSIsInNlY3JldEtleSIsImdldEl0ZW0iLCJwYXJzZSIsIkJsb2NrQ2hhaW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBSkFBLE9BQU8sQ0FBQyxnQkFBRCxDQUFQOztJQU1xQkMsYTs7Ozs7QUFHbkIseUJBQVlDLE1BQVosRUFBNkJDLE1BQTdCLEVBQThDO0FBQUE7O0FBQUE7O0FBQzVDLHVGQUFNRCxNQUFOLEVBQWNDLE1BQWQ7O0FBRDRDOztBQUFBOztBQUU1QyxVQUFLQyxRQUFMLEdBQWdCLElBQUlDLGlCQUFKLHVEQUFoQjtBQUNBLFVBQUtDLFNBQUwsR0FBaUIsSUFBSUMsa0JBQUosdURBQWpCO0FBSDRDO0FBSTdDOzs7OzJCQUVNO0FBQUE7O0FBQ0w7QUFDQSxhQUFPLElBQUlDLE9BQUosQ0FBWSxVQUFBQyxPQUFPLEVBQUk7QUFDNUI7QUFDQSxZQUFNQyxLQUFLLEdBQUcsTUFBSSxDQUFDQyxXQUFMLEVBQWQsQ0FGNEIsQ0FHNUI7OztBQUNBLFlBQU1DLFlBQVksR0FBRyxNQUFJLENBQUNDLElBQUwsQ0FBVSxNQUFJLENBQUNDLFNBQUwsRUFBVixDQUFyQixDQUo0QixDQUs1Qjs7O0FBQ0EsWUFBTUMsS0FBSyxHQUFHLE1BQUksQ0FBQ0MsUUFBTCxDQUFjTixLQUFkLEVBQXFCRSxZQUFyQixDQUFkOztBQUNBSyxRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxrQkFBWixFQUFnQztBQUFFSCxVQUFBQSxLQUFLLEVBQUxBO0FBQUYsU0FBaEMsRUFQNEIsQ0FRNUI7QUFDQTs7QUFDQU4sUUFBQUEsT0FBTyxDQUFDTSxLQUFELENBQVA7QUFDRCxPQVhNLENBQVA7QUFZRDs7O29DQUVlSSxTLEVBQW1CQyxNLEVBQWdCQyxJLEVBQVc7QUFDNUQ7QUFDQSxVQUFJLEVBQUVGLFNBQVMsSUFBSUMsTUFBZixDQUFKLEVBQTRCO0FBQzFCSCxRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxhQUFaO0FBQ0E7QUFDRCxPQUwyRCxDQU01RDs7O0FBQ0EsVUFBSUUsTUFBTSxHQUFHLEtBQUtFLFNBQUwsRUFBYixFQUErQjtBQUM3QkwsUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksYUFBWjtBQUNBO0FBQ0QsT0FWMkQsQ0FXNUQ7OztBQUNBLFVBQU1LLElBQUksR0FBRyxLQUFLQyxjQUFMLENBQW9CLEtBQUtDLE9BQXpCLEVBQWtDTixTQUFsQyxFQUE2Q0MsTUFBN0MsRUFBcURDLElBQXJELENBQWI7QUFDQUosTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksaUJBQVosRUFBK0JLLElBQS9CO0FBQ0EsV0FBS0csU0FBTDtBQUVBLGFBQU9ILElBQVA7QUFDRDs7OytCQUVVO0FBQ1QsYUFBTyxLQUFLSSxLQUFaO0FBQ0Q7OztnQ0FFVztBQUNWQyxNQUFBQSxZQUFZLENBQUNDLE9BQWIsQ0FBcUIsWUFBckIsRUFBbUNDLElBQUksQ0FBQ0MsU0FBTCxDQUFlLEtBQUtKLEtBQXBCLENBQW5DO0FBQ0Q7OztnQ0FFVztBQUNWLFVBQU1LLE9BQU8sR0FBRyxrQkFBSyxLQUFLQyxNQUFMLENBQVk5QixNQUFaLEdBQXFCLEtBQUs4QixNQUFMLENBQVkvQixNQUF0QyxDQUFoQjtBQUNBMEIsTUFBQUEsWUFBWSxDQUFDQyxPQUFiLENBQ0VHLE9BREYsRUFFRUYsSUFBSSxDQUFDQyxTQUFMLENBQWU7QUFDYkcsUUFBQUEsU0FBUyxFQUFFLEtBQUtELE1BQUwsQ0FBWTlCLE1BRFY7QUFFYmdDLFFBQUFBLFNBQVMsRUFBRSxLQUFLRixNQUFMLENBQVkvQjtBQUZWLE9BQWYsQ0FGRjtBQU9BLFVBQU15QixLQUFLLEdBQUdDLFlBQVksQ0FBQ1EsT0FBYixDQUFxQixZQUFyQixDQUFkOztBQUNBLFVBQUlULEtBQUosRUFBVztBQUNULGFBQUtBLEtBQUwsR0FBYUcsSUFBSSxDQUFDTyxLQUFMLENBQVdWLEtBQVgsQ0FBYjtBQUNEO0FBQ0Y7Ozs7RUFqRXdDVyxtQiIsInNvdXJjZXNDb250ZW50IjpbInJlcXVpcmUoXCJiYWJlbC1wb2x5ZmlsbFwiKTtcbmltcG9ydCBCbG9ja0NoYWluIGZyb20gXCIuL2Jsb2NrY2hhaW5cIjtcbmltcG9ydCBzaGExIGZyb20gXCJzaGExXCI7XG5pbXBvcnQgTXVsdGlzaWcgZnJvbSBcIi4vbXVsdGlzaWdcIjtcbmltcG9ydCBSZXNwb25kZXIgZnJvbSBcIi4vcmVzcG9uZGVyXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJsb2NrQ2hhaW5BcHAgZXh0ZW5kcyBCbG9ja0NoYWluIHtcbiAgbXVsdGlzaWc6IE11bHRpc2lnO1xuICByZXNwb25kZXI6IFJlc3BvbmRlcjtcbiAgY29uc3RydWN0b3Ioc2VjS2V5Pzogc3RyaW5nLCBwdWJLZXk/OiBzdHJpbmcpIHtcbiAgICBzdXBlcihzZWNLZXksIHB1YktleSk7XG4gICAgdGhpcy5tdWx0aXNpZyA9IG5ldyBNdWx0aXNpZyh0aGlzKTtcbiAgICB0aGlzLnJlc3BvbmRlciA9IG5ldyBSZXNwb25kZXIodGhpcyk7XG4gIH1cblxuICBtaW5lKCkge1xuICAgIC8v6Z2e5ZCM5pyf5Yem55CGXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgLy/jg5fjg6vjg7zjg5Xjgqrjg5bjg6/jg7zjgq8o44OK44Oz44K544Gu5o6i57SiKVxuICAgICAgY29uc3QgcHJvb2YgPSB0aGlzLnByb29mT2ZXb3JrKCk7XG4gICAgICAvL+acgOW+jOOBruODluODreODg+OCr+OBruODj+ODg+OCt+ODpeWApFxuICAgICAgY29uc3QgcHJldmlvdXNIYXNoID0gdGhpcy5oYXNoKHRoaXMubGFzdEJsb2NrKCkpO1xuICAgICAgLy/mlrDjgZfjgYTjg5bjg63jg4Pjgq9cbiAgICAgIGNvbnN0IGJsb2NrID0gdGhpcy5uZXdCbG9jayhwcm9vZiwgcHJldmlvdXNIYXNoKTtcbiAgICAgIGNvbnNvbGUubG9nKFwibmV3IGJsb2NrIGZvcmdlZFwiLCB7IGJsb2NrIH0pO1xuICAgICAgLy8gdGhpcy5zYXZlQ2hhaW4oKTtcbiAgICAgIC8v5a6M5LqGXG4gICAgICByZXNvbHZlKGJsb2NrKTtcbiAgICB9KTtcbiAgfVxuXG4gIG1ha2VUcmFuc2FjdGlvbihyZWNpcGllbnQ6IHN0cmluZywgYW1vdW50OiBudW1iZXIsIGRhdGE6IGFueSkge1xuICAgIC8v5YWl5Yqb5oOF5aCx44GM6Laz44KK44Gm44GE44KL44GLXG4gICAgaWYgKCEocmVjaXBpZW50ICYmIGFtb3VudCkpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiaW5wdXQgZXJyb3JcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8v5q6L6auY44GM6Laz44KK44Gm44GE44KL44GLXG4gICAgaWYgKGFtb3VudCA+IHRoaXMubm93QW1vdW50KCkpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiaW5wdXQgZXJyb3JcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8v44OI44Op44Oz44K244Kv44K344On44Oz44Gu55Sf5oiQXG4gICAgY29uc3QgdHJhbiA9IHRoaXMubmV3VHJhbnNhY3Rpb24odGhpcy5hZGRyZXNzLCByZWNpcGllbnQsIGFtb3VudCwgZGF0YSk7XG4gICAgY29uc29sZS5sb2coXCJtYWtlVHJhbnNhY3Rpb25cIiwgdHJhbik7XG4gICAgdGhpcy5zYXZlQ2hhaW4oKTtcblxuICAgIHJldHVybiB0cmFuO1xuICB9XG5cbiAgZ2V0Q2hhaW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuY2hhaW47XG4gIH1cblxuICBzYXZlQ2hhaW4oKSB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJibG9ja2NoYWluXCIsIEpTT04uc3RyaW5naWZ5KHRoaXMuY2hhaW4pKTtcbiAgfVxuXG4gIGxvYWRDaGFpbigpIHtcbiAgICBjb25zdCBrZXl3b3JkID0gc2hhMSh0aGlzLmN5cGhlci5wdWJLZXkgKyB0aGlzLmN5cGhlci5zZWNLZXkpO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFxuICAgICAga2V5d29yZCxcbiAgICAgIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgcHVibGljS2V5OiB0aGlzLmN5cGhlci5wdWJLZXksXG4gICAgICAgIHNlY3JldEtleTogdGhpcy5jeXBoZXIuc2VjS2V5XG4gICAgICB9KVxuICAgICk7XG4gICAgY29uc3QgY2hhaW4gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImJsb2NrY2hhaW5cIik7XG4gICAgaWYgKGNoYWluKSB7XG4gICAgICB0aGlzLmNoYWluID0gSlNPTi5wYXJzZShjaGFpbik7XG4gICAgfVxuICB9XG59XG4iXX0=