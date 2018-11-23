"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _sha = _interopRequireDefault(require("sha256"));

var _decimal = require("decimal.js");

var _cypher = _interopRequireDefault(require("./cypher"));

var _type = _interopRequireDefault(require("./type"));

var _interface = require("./interface");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var diff = /^000/;

var BlockChain =
/*#__PURE__*/
function () {
  function BlockChain(secKey, pubKey) {
    _classCallCheck(this, BlockChain);

    _defineProperty(this, "chain", []);

    _defineProperty(this, "currentTransactions", []);

    _defineProperty(this, "cypher", void 0);

    _defineProperty(this, "address", void 0);

    _defineProperty(this, "callback", {
      onAddBlock: function onAddBlock(v) {}
    });

    _defineProperty(this, "onAddBlock", {});

    _defineProperty(this, "onTransaction", {});

    _defineProperty(this, "events", {
      onAddBlock: this.onAddBlock,
      onTransaction: this.onTransaction
    });

    this.cypher = new _cypher.default(secKey, pubKey);
    this.address = (0, _sha.default)(this.cypher.pubKey);
    this.newBlock(0, "genesis");
  }

  _createClass(BlockChain, [{
    key: "hash",
    value: function hash(obj) {
      var objString = JSON.stringify(obj, Object.keys(obj).sort());
      return (0, _sha.default)(objString);
    }
  }, {
    key: "jsonStr",
    value: function jsonStr(obj) {
      return JSON.stringify(obj, Object.keys(obj).sort());
    }
  }, {
    key: "newBlock",
    value: function newBlock(proof, previousHash) {
      //採掘報酬
      this.newTransaction(_type.default.SYSTEM, this.address, 1, {
        type: _interface.ETransactionType.transaction,
        payload: "reward"
      });
      var block = {
        index: this.chain.length + 1,
        //ブロックの番号
        timestamp: Date.now(),
        //タイムスタンプ
        transactions: this.currentTransactions,
        //トランザクションの塊
        proof: proof,
        //ナンス
        previousHash: previousHash || this.hash(this.lastBlock()),
        //前のブロックのハッシュ値
        owner: this.address,
        //このブロックを作った人
        publicKey: this.cypher.pubKey,
        //このブロックを作った人の公開鍵
        sign: "" //このブロックを作った人の署名

      }; //署名を生成

      block.sign = this.cypher.encrypt(this.hash(block)); //ブロックチェーンに追加

      this.chain.push(block); //トランザクションプールをリセット

      this.currentTransactions = [];
      console.log("new block done", this.chain);
      return block;
    }
  }, {
    key: "newTransaction",
    value: function newTransaction(sender, recipient, amount, data) {
      var cypher = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : this.cypher;
      var tran = {
        sender: sender,
        //送信アドレス
        recipient: recipient,
        //受取アドレス
        amount: amount,
        //量
        data: data,
        //任意のメッセージ
        now: Date.now(),
        //タイムスタンプ
        publicKey: cypher.pubKey,
        //公開鍵,
        nonce: this.getNonce(),
        sign: "" //署名

      };
      tran.sign = cypher.encrypt(this.hash(tran)); //トランザクションを追加

      this.currentTransactions.push(tran);
      return tran;
    }
  }, {
    key: "lastBlock",
    value: function lastBlock() {
      var blockchain = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.chain;
      return blockchain[blockchain.length - 1];
    }
  }, {
    key: "addBlock",
    value: function addBlock(block) {
      if (this.validBlock(block)) {
        console.log("validBlock");
        this.currentTransactions = [];
        this.chain.push(block);
        this.callback.onAddBlock();
        this.excuteEvent(this.events.onAddBlock);
      }
    }
  }, {
    key: "excuteEvent",
    value: function excuteEvent(ev, v) {
      console.log("excuteEvent", ev);
      Object.keys(ev).forEach(function (key) {
        ev[key](v);
      });
    }
  }, {
    key: "validBlock",
    value: function validBlock(block) {
      var lastBlock = this.lastBlock();
      var lastProof = lastBlock.proof;
      var lastHash = this.hash(lastBlock);
      var owner = block.owner;
      var sign = block.sign;
      var publicKey = block.publicKey;
      block.sign = ""; //署名が正しいかどうか

      if (this.cypher.decrypt(sign, publicKey) === this.hash(block)) {
        block.sign = sign; //ナンスが正しいかどうか

        if (this.validProof(lastProof, block.proof, lastHash, owner)) {
          return true;
        } else {
          console.log("block nonce error", this.address, this.chain);
          return false;
        }
      } else {
        console.log("block sign error", this.address);
        return false;
      }
    }
  }, {
    key: "validProof",
    value: function validProof(lastProof, proof, lastHash, address) {
      var guess = "".concat(lastProof).concat(proof).concat(lastHash).concat(address);
      var guessHash = (0, _sha.default)(guess); //先頭から４文字が０なら成功

      return diff.test(guessHash);
    }
  }, {
    key: "validChain",
    value: function validChain(chain) {
      var index = 2;

      while (index < chain.length) {
        var previousBlock = chain[index - 1];
        var block = chain[index]; //ブロックの持つ前のブロックのハッシュ値と実際の前の
        //ブロックのハッシュ値を比較

        if (block.previousHash !== this.hash(previousBlock)) {
          return false;
        } //ナンスの値の検証


        if (!this.validProof(previousBlock.proof, block.proof, this.hash(block), block.owner)) {
          return false;
        }

        index++;
      }

      return true;
    }
  }, {
    key: "validTransaction",
    value: function validTransaction(transaction) {
      var amount = transaction.amount;
      var sign = transaction.sign;
      var result = this.currentTransactions.find(function (prev) {
        return prev.sign === sign;
      });

      if (result) {
        console.log("duplicate error", {
          result: result
        });
        return false;
      }

      var publicKey = transaction.publicKey;
      var address = transaction.sender;
      transaction.sign = ""; //公開鍵が送金者のものかどうか

      if ((0, _sha.default)(publicKey) === address) {
        //署名が正しいかどうか
        //公開鍵で署名を解読しトランザクションのハッシュ値と一致することを確認する。
        if (this.cypher.decrypt(sign, publicKey) === this.hash(transaction)) {
          var balance = this.nowAmount(address); //送金可能な金額を超えているかどうか

          if (balance >= amount) {
            //消した署名を戻す
            transaction.sign = sign;
            return true;
          } else {
            console.log("balance error", amount, balance);
            return false;
          }
        } else {
          console.log("sign error");
          return false;
        }
      } else {
        console.log("pubkey error");
        return false;
      }
    }
  }, {
    key: "addTransaction",
    value: function addTransaction(tran) {
      if (this.validTransaction(tran)) {
        console.log("validTransaction", {
          tran: tran
        }); //トランザクションを追加

        this.currentTransactions.push(tran);
        this.excuteEvent(this.events.onTransaction);
      } else {
        console.log("error Transaction");
      }
    }
  }, {
    key: "proofOfWork",
    value: function proofOfWork() {
      var lastBlock = this.lastBlock();
      var lastProof = lastBlock.proof;
      var lastHash = this.hash(lastBlock);
      var proof = 0;

      while (!this.validProof(lastProof, proof, lastHash, this.address)) {
        //ナンスの値を試行錯誤的に探す
        proof++;
      }

      return proof;
    }
  }, {
    key: "nowAmount",
    value: function nowAmount() {
      var address = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.address;
      var tokenNum = new _decimal.Decimal(0.0);
      this.chain.forEach(function (block) {
        block.transactions.forEach(function (transaction) {
          if (transaction.recipient === address) {
            tokenNum = tokenNum.plus(new _decimal.Decimal(parseFloat(transaction.amount)));
          }

          if (transaction.sender === address) {
            tokenNum = tokenNum.minus(new _decimal.Decimal(parseFloat(transaction.amount)));
          }
        });
      });
      this.currentTransactions.forEach(function (transaction) {
        if (transaction.recipient === address) {
          tokenNum = tokenNum.plus(new _decimal.Decimal(parseFloat(transaction.amount)));
        }

        if (transaction.sender === address) {
          tokenNum = tokenNum.minus(new _decimal.Decimal(parseFloat(transaction.amount)));
        }
      });
      return tokenNum.toNumber();
    }
  }, {
    key: "getNonce",
    value: function getNonce() {
      var address = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.address;
      var nonce = 0;
      this.chain.forEach(function (block) {
        block.transactions.forEach(function (transaction) {
          if (transaction.sender === address) {
            nonce++;
          }
        });
      });
      this.currentTransactions.forEach(function (transaction) {
        if (transaction.recipient === address) {
          nonce++;
        }
      });
      return nonce;
    }
  }]);

  return BlockChain;
}();

exports.default = BlockChain;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL2Jsb2NrY2hhaW4udHMiXSwibmFtZXMiOlsiZGlmZiIsIkJsb2NrQ2hhaW4iLCJzZWNLZXkiLCJwdWJLZXkiLCJvbkFkZEJsb2NrIiwidiIsIm9uVHJhbnNhY3Rpb24iLCJjeXBoZXIiLCJDeXBoZXIiLCJhZGRyZXNzIiwibmV3QmxvY2siLCJvYmoiLCJvYmpTdHJpbmciLCJKU09OIiwic3RyaW5naWZ5IiwiT2JqZWN0Iiwia2V5cyIsInNvcnQiLCJwcm9vZiIsInByZXZpb3VzSGFzaCIsIm5ld1RyYW5zYWN0aW9uIiwidHlwZSIsIlNZU1RFTSIsIkVUcmFuc2FjdGlvblR5cGUiLCJ0cmFuc2FjdGlvbiIsInBheWxvYWQiLCJibG9jayIsImluZGV4IiwiY2hhaW4iLCJsZW5ndGgiLCJ0aW1lc3RhbXAiLCJEYXRlIiwibm93IiwidHJhbnNhY3Rpb25zIiwiY3VycmVudFRyYW5zYWN0aW9ucyIsImhhc2giLCJsYXN0QmxvY2siLCJvd25lciIsInB1YmxpY0tleSIsInNpZ24iLCJlbmNyeXB0IiwicHVzaCIsImNvbnNvbGUiLCJsb2ciLCJzZW5kZXIiLCJyZWNpcGllbnQiLCJhbW91bnQiLCJkYXRhIiwidHJhbiIsIm5vbmNlIiwiZ2V0Tm9uY2UiLCJibG9ja2NoYWluIiwidmFsaWRCbG9jayIsImNhbGxiYWNrIiwiZXhjdXRlRXZlbnQiLCJldmVudHMiLCJldiIsImZvckVhY2giLCJrZXkiLCJsYXN0UHJvb2YiLCJsYXN0SGFzaCIsImRlY3J5cHQiLCJ2YWxpZFByb29mIiwiZ3Vlc3MiLCJndWVzc0hhc2giLCJ0ZXN0IiwicHJldmlvdXNCbG9jayIsInJlc3VsdCIsImZpbmQiLCJwcmV2IiwiYmFsYW5jZSIsIm5vd0Ftb3VudCIsInZhbGlkVHJhbnNhY3Rpb24iLCJ0b2tlbk51bSIsIkRlY2ltYWwiLCJwbHVzIiwicGFyc2VGbG9hdCIsIm1pbnVzIiwidG9OdW1iZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUEsSUFBSSxHQUFHLE1BQWI7O0lBa0JxQkMsVTs7O0FBaUJuQixzQkFBWUMsTUFBWixFQUE2QkMsTUFBN0IsRUFBOEM7QUFBQTs7QUFBQSxtQ0FoQjFCLEVBZ0IwQjs7QUFBQSxpREFmWixFQWVZOztBQUFBOztBQUFBOztBQUFBLHNDQVhuQztBQUNUQyxNQUFBQSxVQUFVLEVBQUUsb0JBQUNDLENBQUQsRUFBYSxDQUFFO0FBRGxCLEtBV21DOztBQUFBLHdDQVBNLEVBT047O0FBQUEsMkNBTlMsRUFNVDs7QUFBQSxvQ0FMckM7QUFDUEQsTUFBQUEsVUFBVSxFQUFFLEtBQUtBLFVBRFY7QUFFUEUsTUFBQUEsYUFBYSxFQUFFLEtBQUtBO0FBRmIsS0FLcUM7O0FBQzVDLFNBQUtDLE1BQUwsR0FBYyxJQUFJQyxlQUFKLENBQVdOLE1BQVgsRUFBbUJDLE1BQW5CLENBQWQ7QUFDQSxTQUFLTSxPQUFMLEdBQWUsa0JBQU8sS0FBS0YsTUFBTCxDQUFZSixNQUFuQixDQUFmO0FBQ0EsU0FBS08sUUFBTCxDQUFjLENBQWQsRUFBaUIsU0FBakI7QUFDRDs7Ozt5QkFFSUMsRyxFQUFVO0FBQ2IsVUFBTUMsU0FBUyxHQUFHQyxJQUFJLENBQUNDLFNBQUwsQ0FBZUgsR0FBZixFQUFvQkksTUFBTSxDQUFDQyxJQUFQLENBQVlMLEdBQVosRUFBaUJNLElBQWpCLEVBQXBCLENBQWxCO0FBQ0EsYUFBTyxrQkFBT0wsU0FBUCxDQUFQO0FBQ0Q7Ozs0QkFFT0QsRyxFQUFVO0FBQ2hCLGFBQU9FLElBQUksQ0FBQ0MsU0FBTCxDQUFlSCxHQUFmLEVBQW9CSSxNQUFNLENBQUNDLElBQVAsQ0FBWUwsR0FBWixFQUFpQk0sSUFBakIsRUFBcEIsQ0FBUDtBQUNEOzs7NkJBRVFDLEssRUFBWUMsWSxFQUFzQjtBQUN6QztBQUNBLFdBQUtDLGNBQUwsQ0FBb0JDLGNBQUtDLE1BQXpCLEVBQWlDLEtBQUtiLE9BQXRDLEVBQStDLENBQS9DLEVBQWtEO0FBQ2hEWSxRQUFBQSxJQUFJLEVBQUVFLDRCQUFpQkMsV0FEeUI7QUFFaERDLFFBQUFBLE9BQU8sRUFBRTtBQUZ1QyxPQUFsRDtBQUtBLFVBQU1DLEtBQUssR0FBRztBQUNaQyxRQUFBQSxLQUFLLEVBQUUsS0FBS0MsS0FBTCxDQUFXQyxNQUFYLEdBQW9CLENBRGY7QUFDa0I7QUFDOUJDLFFBQUFBLFNBQVMsRUFBRUMsSUFBSSxDQUFDQyxHQUFMLEVBRkM7QUFFVztBQUN2QkMsUUFBQUEsWUFBWSxFQUFFLEtBQUtDLG1CQUhQO0FBRzRCO0FBQ3hDaEIsUUFBQUEsS0FBSyxFQUFFQSxLQUpLO0FBSUU7QUFDZEMsUUFBQUEsWUFBWSxFQUFFQSxZQUFZLElBQUksS0FBS2dCLElBQUwsQ0FBVSxLQUFLQyxTQUFMLEVBQVYsQ0FMbEI7QUFLK0M7QUFDM0RDLFFBQUFBLEtBQUssRUFBRSxLQUFLNUIsT0FOQTtBQU1TO0FBQ3JCNkIsUUFBQUEsU0FBUyxFQUFFLEtBQUsvQixNQUFMLENBQVlKLE1BUFg7QUFPbUI7QUFDL0JvQyxRQUFBQSxJQUFJLEVBQUUsRUFSTSxDQVFIOztBQVJHLE9BQWQsQ0FQeUMsQ0FpQnpDOztBQUNBYixNQUFBQSxLQUFLLENBQUNhLElBQU4sR0FBYSxLQUFLaEMsTUFBTCxDQUFZaUMsT0FBWixDQUFvQixLQUFLTCxJQUFMLENBQVVULEtBQVYsQ0FBcEIsQ0FBYixDQWxCeUMsQ0FtQnpDOztBQUNBLFdBQUtFLEtBQUwsQ0FBV2EsSUFBWCxDQUFnQmYsS0FBaEIsRUFwQnlDLENBc0J6Qzs7QUFDQSxXQUFLUSxtQkFBTCxHQUEyQixFQUEzQjtBQUNBUSxNQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxnQkFBWixFQUE4QixLQUFLZixLQUFuQztBQUNBLGFBQU9GLEtBQVA7QUFDRDs7O21DQUdDa0IsTSxFQUNBQyxTLEVBQ0FDLE0sRUFDQUMsSSxFQUVBO0FBQUEsVUFEQXhDLE1BQ0EsdUVBRFMsS0FBS0EsTUFDZDtBQUNBLFVBQU15QyxJQUFrQixHQUFHO0FBQ3pCSixRQUFBQSxNQUFNLEVBQUVBLE1BRGlCO0FBQ1Q7QUFDaEJDLFFBQUFBLFNBQVMsRUFBRUEsU0FGYztBQUVIO0FBQ3RCQyxRQUFBQSxNQUFNLEVBQUVBLE1BSGlCO0FBR1Q7QUFDaEJDLFFBQUFBLElBQUksRUFBRUEsSUFKbUI7QUFJYjtBQUNaZixRQUFBQSxHQUFHLEVBQUVELElBQUksQ0FBQ0MsR0FBTCxFQUxvQjtBQUtSO0FBQ2pCTSxRQUFBQSxTQUFTLEVBQUUvQixNQUFNLENBQUNKLE1BTk87QUFNQztBQUMxQjhDLFFBQUFBLEtBQUssRUFBRSxLQUFLQyxRQUFMLEVBUGtCO0FBUXpCWCxRQUFBQSxJQUFJLEVBQUUsRUFSbUIsQ0FRaEI7O0FBUmdCLE9BQTNCO0FBVUFTLE1BQUFBLElBQUksQ0FBQ1QsSUFBTCxHQUFZaEMsTUFBTSxDQUFDaUMsT0FBUCxDQUFlLEtBQUtMLElBQUwsQ0FBVWEsSUFBVixDQUFmLENBQVosQ0FYQSxDQVlBOztBQUNBLFdBQUtkLG1CQUFMLENBQXlCTyxJQUF6QixDQUE4Qk8sSUFBOUI7QUFFQSxhQUFPQSxJQUFQO0FBQ0Q7OztnQ0FFa0M7QUFBQSxVQUF6QkcsVUFBeUIsdUVBQVosS0FBS3ZCLEtBQU87QUFDakMsYUFBT3VCLFVBQVUsQ0FBQ0EsVUFBVSxDQUFDdEIsTUFBWCxHQUFvQixDQUFyQixDQUFqQjtBQUNEOzs7NkJBRVFILEssRUFBWTtBQUNuQixVQUFJLEtBQUswQixVQUFMLENBQWdCMUIsS0FBaEIsQ0FBSixFQUE0QjtBQUMxQmdCLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLFlBQVo7QUFDQSxhQUFLVCxtQkFBTCxHQUEyQixFQUEzQjtBQUNBLGFBQUtOLEtBQUwsQ0FBV2EsSUFBWCxDQUFnQmYsS0FBaEI7QUFFQSxhQUFLMkIsUUFBTCxDQUFjakQsVUFBZDtBQUNBLGFBQUtrRCxXQUFMLENBQWlCLEtBQUtDLE1BQUwsQ0FBWW5ELFVBQTdCO0FBQ0Q7QUFDRjs7O2dDQUVtQm9ELEUsRUFBU25ELEMsRUFBUztBQUNwQ3FDLE1BQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGFBQVosRUFBMkJhLEVBQTNCO0FBQ0F6QyxNQUFBQSxNQUFNLENBQUNDLElBQVAsQ0FBWXdDLEVBQVosRUFBZ0JDLE9BQWhCLENBQXdCLFVBQUFDLEdBQUcsRUFBSTtBQUM3QkYsUUFBQUEsRUFBRSxDQUFDRSxHQUFELENBQUYsQ0FBUXJELENBQVI7QUFDRCxPQUZEO0FBR0Q7OzsrQkFFVXFCLEssRUFBWTtBQUNyQixVQUFNVSxTQUFTLEdBQUcsS0FBS0EsU0FBTCxFQUFsQjtBQUNBLFVBQU11QixTQUFTLEdBQUd2QixTQUFTLENBQUNsQixLQUE1QjtBQUNBLFVBQU0wQyxRQUFRLEdBQUcsS0FBS3pCLElBQUwsQ0FBVUMsU0FBVixDQUFqQjtBQUNBLFVBQU1DLEtBQUssR0FBR1gsS0FBSyxDQUFDVyxLQUFwQjtBQUNBLFVBQU1FLElBQUksR0FBR2IsS0FBSyxDQUFDYSxJQUFuQjtBQUNBLFVBQU1ELFNBQVMsR0FBR1osS0FBSyxDQUFDWSxTQUF4QjtBQUNBWixNQUFBQSxLQUFLLENBQUNhLElBQU4sR0FBYSxFQUFiLENBUHFCLENBU3JCOztBQUNBLFVBQUksS0FBS2hDLE1BQUwsQ0FBWXNELE9BQVosQ0FBb0J0QixJQUFwQixFQUEwQkQsU0FBMUIsTUFBeUMsS0FBS0gsSUFBTCxDQUFVVCxLQUFWLENBQTdDLEVBQStEO0FBQzdEQSxRQUFBQSxLQUFLLENBQUNhLElBQU4sR0FBYUEsSUFBYixDQUQ2RCxDQUU3RDs7QUFDQSxZQUFJLEtBQUt1QixVQUFMLENBQWdCSCxTQUFoQixFQUEyQmpDLEtBQUssQ0FBQ1IsS0FBakMsRUFBd0MwQyxRQUF4QyxFQUFrRHZCLEtBQWxELENBQUosRUFBOEQ7QUFDNUQsaUJBQU8sSUFBUDtBQUNELFNBRkQsTUFFTztBQUNMSyxVQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxtQkFBWixFQUFpQyxLQUFLbEMsT0FBdEMsRUFBK0MsS0FBS21CLEtBQXBEO0FBQ0EsaUJBQU8sS0FBUDtBQUNEO0FBQ0YsT0FURCxNQVNPO0FBQ0xjLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGtCQUFaLEVBQWdDLEtBQUtsQyxPQUFyQztBQUNBLGVBQU8sS0FBUDtBQUNEO0FBQ0Y7OzsrQkFHQ2tELFMsRUFDQXpDLEssRUFDQTBDLFEsRUFDQW5ELE8sRUFDQTtBQUNBLFVBQU1zRCxLQUFLLGFBQU1KLFNBQU4sU0FBa0J6QyxLQUFsQixTQUEwQjBDLFFBQTFCLFNBQXFDbkQsT0FBckMsQ0FBWDtBQUNBLFVBQU11RCxTQUFTLEdBQUcsa0JBQU9ELEtBQVAsQ0FBbEIsQ0FGQSxDQUdBOztBQUNBLGFBQU8vRCxJQUFJLENBQUNpRSxJQUFMLENBQVVELFNBQVYsQ0FBUDtBQUNEOzs7K0JBRVVwQyxLLEVBQW1CO0FBQzVCLFVBQUlELEtBQUssR0FBRyxDQUFaOztBQUNBLGFBQU9BLEtBQUssR0FBR0MsS0FBSyxDQUFDQyxNQUFyQixFQUE2QjtBQUMzQixZQUFNcUMsYUFBYSxHQUFHdEMsS0FBSyxDQUFDRCxLQUFLLEdBQUcsQ0FBVCxDQUEzQjtBQUNBLFlBQU1ELEtBQUssR0FBR0UsS0FBSyxDQUFDRCxLQUFELENBQW5CLENBRjJCLENBSTNCO0FBQ0E7O0FBQ0EsWUFBSUQsS0FBSyxDQUFDUCxZQUFOLEtBQXVCLEtBQUtnQixJQUFMLENBQVUrQixhQUFWLENBQTNCLEVBQXFEO0FBQ25ELGlCQUFPLEtBQVA7QUFDRCxTQVIwQixDQVMzQjs7O0FBQ0EsWUFDRSxDQUFDLEtBQUtKLFVBQUwsQ0FDQ0ksYUFBYSxDQUFDaEQsS0FEZixFQUVDUSxLQUFLLENBQUNSLEtBRlAsRUFHQyxLQUFLaUIsSUFBTCxDQUFVVCxLQUFWLENBSEQsRUFJQ0EsS0FBSyxDQUFDVyxLQUpQLENBREgsRUFPRTtBQUNBLGlCQUFPLEtBQVA7QUFDRDs7QUFDRFYsUUFBQUEsS0FBSztBQUNOOztBQUNELGFBQU8sSUFBUDtBQUNEOzs7cUNBRWdCSCxXLEVBQTJCO0FBQzFDLFVBQU1zQixNQUFNLEdBQUd0QixXQUFXLENBQUNzQixNQUEzQjtBQUNBLFVBQU1QLElBQUksR0FBR2YsV0FBVyxDQUFDZSxJQUF6QjtBQUVBLFVBQU00QixNQUFNLEdBQUcsS0FBS2pDLG1CQUFMLENBQXlCa0MsSUFBekIsQ0FBOEIsVUFBQUMsSUFBSSxFQUFJO0FBQ25ELGVBQU9BLElBQUksQ0FBQzlCLElBQUwsS0FBY0EsSUFBckI7QUFDRCxPQUZjLENBQWY7O0FBR0EsVUFBSTRCLE1BQUosRUFBWTtBQUNWekIsUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksaUJBQVosRUFBK0I7QUFBRXdCLFVBQUFBLE1BQU0sRUFBTkE7QUFBRixTQUEvQjtBQUNBLGVBQU8sS0FBUDtBQUNEOztBQUVELFVBQU03QixTQUFTLEdBQUdkLFdBQVcsQ0FBQ2MsU0FBOUI7QUFDQSxVQUFNN0IsT0FBTyxHQUFHZSxXQUFXLENBQUNvQixNQUE1QjtBQUNBcEIsTUFBQUEsV0FBVyxDQUFDZSxJQUFaLEdBQW1CLEVBQW5CLENBZDBDLENBZ0IxQzs7QUFDQSxVQUFJLGtCQUFPRCxTQUFQLE1BQXNCN0IsT0FBMUIsRUFBbUM7QUFDakM7QUFDQTtBQUNBLFlBQUksS0FBS0YsTUFBTCxDQUFZc0QsT0FBWixDQUFvQnRCLElBQXBCLEVBQTBCRCxTQUExQixNQUF5QyxLQUFLSCxJQUFMLENBQVVYLFdBQVYsQ0FBN0MsRUFBcUU7QUFDbkUsY0FBTThDLE9BQU8sR0FBRyxLQUFLQyxTQUFMLENBQWU5RCxPQUFmLENBQWhCLENBRG1FLENBRW5FOztBQUNBLGNBQUk2RCxPQUFPLElBQUl4QixNQUFmLEVBQXVCO0FBQ3JCO0FBQ0F0QixZQUFBQSxXQUFXLENBQUNlLElBQVosR0FBbUJBLElBQW5CO0FBQ0EsbUJBQU8sSUFBUDtBQUNELFdBSkQsTUFJTztBQUNMRyxZQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxlQUFaLEVBQTZCRyxNQUE3QixFQUFxQ3dCLE9BQXJDO0FBQ0EsbUJBQU8sS0FBUDtBQUNEO0FBQ0YsU0FYRCxNQVdPO0FBQ0w1QixVQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxZQUFaO0FBQ0EsaUJBQU8sS0FBUDtBQUNEO0FBQ0YsT0FsQkQsTUFrQk87QUFDTEQsUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksY0FBWjtBQUNBLGVBQU8sS0FBUDtBQUNEO0FBQ0Y7OzttQ0FFY0ssSSxFQUFvQjtBQUNqQyxVQUFJLEtBQUt3QixnQkFBTCxDQUFzQnhCLElBQXRCLENBQUosRUFBaUM7QUFDL0JOLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGtCQUFaLEVBQWdDO0FBQUVLLFVBQUFBLElBQUksRUFBSkE7QUFBRixTQUFoQyxFQUQrQixDQUUvQjs7QUFDQSxhQUFLZCxtQkFBTCxDQUF5Qk8sSUFBekIsQ0FBOEJPLElBQTlCO0FBQ0EsYUFBS00sV0FBTCxDQUFpQixLQUFLQyxNQUFMLENBQVlqRCxhQUE3QjtBQUNELE9BTEQsTUFLTztBQUNMb0MsUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksbUJBQVo7QUFDRDtBQUNGOzs7a0NBRWE7QUFDWixVQUFNUCxTQUFTLEdBQUcsS0FBS0EsU0FBTCxFQUFsQjtBQUNBLFVBQU11QixTQUFTLEdBQUd2QixTQUFTLENBQUNsQixLQUE1QjtBQUNBLFVBQU0wQyxRQUFRLEdBQUcsS0FBS3pCLElBQUwsQ0FBVUMsU0FBVixDQUFqQjtBQUVBLFVBQUlsQixLQUFLLEdBQUcsQ0FBWjs7QUFFQSxhQUFPLENBQUMsS0FBSzRDLFVBQUwsQ0FBZ0JILFNBQWhCLEVBQTJCekMsS0FBM0IsRUFBa0MwQyxRQUFsQyxFQUE0QyxLQUFLbkQsT0FBakQsQ0FBUixFQUFtRTtBQUNqRTtBQUNBUyxRQUFBQSxLQUFLO0FBQ047O0FBRUQsYUFBT0EsS0FBUDtBQUNEOzs7Z0NBRWlDO0FBQUEsVUFBeEJULE9BQXdCLHVFQUFkLEtBQUtBLE9BQVM7QUFDaEMsVUFBSWdFLFFBQVEsR0FBRyxJQUFJQyxnQkFBSixDQUFZLEdBQVosQ0FBZjtBQUNBLFdBQUs5QyxLQUFMLENBQVc2QixPQUFYLENBQW1CLFVBQUEvQixLQUFLLEVBQUk7QUFDMUJBLFFBQUFBLEtBQUssQ0FBQ08sWUFBTixDQUFtQndCLE9BQW5CLENBQTJCLFVBQUNqQyxXQUFELEVBQXNCO0FBQy9DLGNBQUlBLFdBQVcsQ0FBQ3FCLFNBQVosS0FBMEJwQyxPQUE5QixFQUF1QztBQUNyQ2dFLFlBQUFBLFFBQVEsR0FBR0EsUUFBUSxDQUFDRSxJQUFULENBQWMsSUFBSUQsZ0JBQUosQ0FBWUUsVUFBVSxDQUFDcEQsV0FBVyxDQUFDc0IsTUFBYixDQUF0QixDQUFkLENBQVg7QUFDRDs7QUFDRCxjQUFJdEIsV0FBVyxDQUFDb0IsTUFBWixLQUF1Qm5DLE9BQTNCLEVBQW9DO0FBQ2xDZ0UsWUFBQUEsUUFBUSxHQUFHQSxRQUFRLENBQUNJLEtBQVQsQ0FDVCxJQUFJSCxnQkFBSixDQUFZRSxVQUFVLENBQUNwRCxXQUFXLENBQUNzQixNQUFiLENBQXRCLENBRFMsQ0FBWDtBQUdEO0FBQ0YsU0FURDtBQVVELE9BWEQ7QUFZQSxXQUFLWixtQkFBTCxDQUF5QnVCLE9BQXpCLENBQWlDLFVBQUFqQyxXQUFXLEVBQUk7QUFDOUMsWUFBSUEsV0FBVyxDQUFDcUIsU0FBWixLQUEwQnBDLE9BQTlCLEVBQXVDO0FBQ3JDZ0UsVUFBQUEsUUFBUSxHQUFHQSxRQUFRLENBQUNFLElBQVQsQ0FBYyxJQUFJRCxnQkFBSixDQUFZRSxVQUFVLENBQUNwRCxXQUFXLENBQUNzQixNQUFiLENBQXRCLENBQWQsQ0FBWDtBQUNEOztBQUNELFlBQUl0QixXQUFXLENBQUNvQixNQUFaLEtBQXVCbkMsT0FBM0IsRUFBb0M7QUFDbENnRSxVQUFBQSxRQUFRLEdBQUdBLFFBQVEsQ0FBQ0ksS0FBVCxDQUFlLElBQUlILGdCQUFKLENBQVlFLFVBQVUsQ0FBQ3BELFdBQVcsQ0FBQ3NCLE1BQWIsQ0FBdEIsQ0FBZixDQUFYO0FBQ0Q7QUFDRixPQVBEO0FBUUEsYUFBTzJCLFFBQVEsQ0FBQ0ssUUFBVCxFQUFQO0FBQ0Q7OzsrQkFFZ0M7QUFBQSxVQUF4QnJFLE9BQXdCLHVFQUFkLEtBQUtBLE9BQVM7QUFDL0IsVUFBSXdDLEtBQUssR0FBRyxDQUFaO0FBQ0EsV0FBS3JCLEtBQUwsQ0FBVzZCLE9BQVgsQ0FBbUIsVUFBQS9CLEtBQUssRUFBSTtBQUMxQkEsUUFBQUEsS0FBSyxDQUFDTyxZQUFOLENBQW1Cd0IsT0FBbkIsQ0FBMkIsVUFBQ2pDLFdBQUQsRUFBK0I7QUFDeEQsY0FBSUEsV0FBVyxDQUFDb0IsTUFBWixLQUF1Qm5DLE9BQTNCLEVBQW9DO0FBQ2xDd0MsWUFBQUEsS0FBSztBQUNOO0FBQ0YsU0FKRDtBQUtELE9BTkQ7QUFPQSxXQUFLZixtQkFBTCxDQUF5QnVCLE9BQXpCLENBQWlDLFVBQUFqQyxXQUFXLEVBQUk7QUFDOUMsWUFBSUEsV0FBVyxDQUFDcUIsU0FBWixLQUEwQnBDLE9BQTlCLEVBQXVDO0FBQ3JDd0MsVUFBQUEsS0FBSztBQUNOO0FBQ0YsT0FKRDtBQUtBLGFBQU9BLEtBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBzaGEyNTYgZnJvbSBcInNoYTI1NlwiO1xuaW1wb3J0IHsgRGVjaW1hbCB9IGZyb20gXCJkZWNpbWFsLmpzXCI7XG5pbXBvcnQgQ3lwaGVyIGZyb20gXCIuL2N5cGhlclwiO1xuaW1wb3J0IHR5cGUgZnJvbSBcIi4vdHlwZVwiO1xuaW1wb3J0IHsgRVRyYW5zYWN0aW9uVHlwZSB9IGZyb20gXCIuL2ludGVyZmFjZVwiO1xuXG5jb25zdCBkaWZmID0gL14wMDAvO1xuXG5leHBvcnQgaW50ZXJmYWNlIElUcmFuc2FjdGlvbkRhdGEge1xuICB0eXBlOiBFVHJhbnNhY3Rpb25UeXBlO1xuICBwYXlsb2FkOiBhbnk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVRyYW5zYWN0aW9uIHtcbiAgc2VuZGVyOiBzdHJpbmc7XG4gIHJlY2lwaWVudDogc3RyaW5nO1xuICBhbW91bnQ6IG51bWJlcjtcbiAgZGF0YTogSVRyYW5zYWN0aW9uRGF0YTtcbiAgbm93OiBhbnk7XG4gIHB1YmxpY0tleTogc3RyaW5nO1xuICBub25jZTogbnVtYmVyO1xuICBzaWduOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJsb2NrQ2hhaW4ge1xuICBjaGFpbjogQXJyYXk8YW55PiA9IFtdO1xuICBjdXJyZW50VHJhbnNhY3Rpb25zOiBBcnJheTxhbnk+ID0gW107XG4gIGN5cGhlcjogQ3lwaGVyO1xuICBhZGRyZXNzOiBzdHJpbmc7XG5cbiAgY2FsbGJhY2sgPSB7XG4gICAgb25BZGRCbG9jazogKHY/OiBhbnkpID0+IHt9XG4gIH07XG5cbiAgcHJpdmF0ZSBvbkFkZEJsb2NrOiB7IFtrZXk6IHN0cmluZ106ICgpID0+IHZvaWQgfSA9IHt9O1xuICBwcml2YXRlIG9uVHJhbnNhY3Rpb246IHsgW2tleTogc3RyaW5nXTogKCkgPT4gdm9pZCB9ID0ge307XG4gIGV2ZW50cyA9IHtcbiAgICBvbkFkZEJsb2NrOiB0aGlzLm9uQWRkQmxvY2ssXG4gICAgb25UcmFuc2FjdGlvbjogdGhpcy5vblRyYW5zYWN0aW9uXG4gIH07XG5cbiAgY29uc3RydWN0b3Ioc2VjS2V5Pzogc3RyaW5nLCBwdWJLZXk/OiBzdHJpbmcpIHtcbiAgICB0aGlzLmN5cGhlciA9IG5ldyBDeXBoZXIoc2VjS2V5LCBwdWJLZXkpO1xuICAgIHRoaXMuYWRkcmVzcyA9IHNoYTI1Nih0aGlzLmN5cGhlci5wdWJLZXkpO1xuICAgIHRoaXMubmV3QmxvY2soMCwgXCJnZW5lc2lzXCIpO1xuICB9XG5cbiAgaGFzaChvYmo6IGFueSkge1xuICAgIGNvbnN0IG9ialN0cmluZyA9IEpTT04uc3RyaW5naWZ5KG9iaiwgT2JqZWN0LmtleXMob2JqKS5zb3J0KCkpO1xuICAgIHJldHVybiBzaGEyNTYob2JqU3RyaW5nKTtcbiAgfVxuXG4gIGpzb25TdHIob2JqOiBhbnkpIHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkob2JqLCBPYmplY3Qua2V5cyhvYmopLnNvcnQoKSk7XG4gIH1cblxuICBuZXdCbG9jayhwcm9vZjogYW55LCBwcmV2aW91c0hhc2g6IHN0cmluZykge1xuICAgIC8v5o6h5o6Y5aCx6YWsXG4gICAgdGhpcy5uZXdUcmFuc2FjdGlvbih0eXBlLlNZU1RFTSwgdGhpcy5hZGRyZXNzLCAxLCB7XG4gICAgICB0eXBlOiBFVHJhbnNhY3Rpb25UeXBlLnRyYW5zYWN0aW9uLFxuICAgICAgcGF5bG9hZDogXCJyZXdhcmRcIlxuICAgIH0pO1xuXG4gICAgY29uc3QgYmxvY2sgPSB7XG4gICAgICBpbmRleDogdGhpcy5jaGFpbi5sZW5ndGggKyAxLCAvL+ODluODreODg+OCr+OBrueVquWPt1xuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLCAvL+OCv+OCpOODoOOCueOCv+ODs+ODl1xuICAgICAgdHJhbnNhY3Rpb25zOiB0aGlzLmN1cnJlbnRUcmFuc2FjdGlvbnMsIC8v44OI44Op44Oz44K244Kv44K344On44Oz44Gu5aGKXG4gICAgICBwcm9vZjogcHJvb2YsIC8v44OK44Oz44K5XG4gICAgICBwcmV2aW91c0hhc2g6IHByZXZpb3VzSGFzaCB8fCB0aGlzLmhhc2godGhpcy5sYXN0QmxvY2soKSksIC8v5YmN44Gu44OW44Ot44OD44Kv44Gu44OP44OD44K344Ol5YCkXG4gICAgICBvd25lcjogdGhpcy5hZGRyZXNzLCAvL+OBk+OBruODluODreODg+OCr+OCkuS9nOOBo+OBn+S6ulxuICAgICAgcHVibGljS2V5OiB0aGlzLmN5cGhlci5wdWJLZXksIC8v44GT44Gu44OW44Ot44OD44Kv44KS5L2c44Gj44Gf5Lq644Gu5YWs6ZaL6Y21XG4gICAgICBzaWduOiBcIlwiIC8v44GT44Gu44OW44Ot44OD44Kv44KS5L2c44Gj44Gf5Lq644Gu572y5ZCNXG4gICAgfTtcbiAgICAvL+e9suWQjeOCkueUn+aIkFxuICAgIGJsb2NrLnNpZ24gPSB0aGlzLmN5cGhlci5lbmNyeXB0KHRoaXMuaGFzaChibG9jaykpO1xuICAgIC8v44OW44Ot44OD44Kv44OB44Kn44O844Oz44Gr6L+95YqgXG4gICAgdGhpcy5jaGFpbi5wdXNoKGJsb2NrKTtcblxuICAgIC8v44OI44Op44Oz44K244Kv44K344On44Oz44OX44O844Or44KS44Oq44K744OD44OIXG4gICAgdGhpcy5jdXJyZW50VHJhbnNhY3Rpb25zID0gW107XG4gICAgY29uc29sZS5sb2coXCJuZXcgYmxvY2sgZG9uZVwiLCB0aGlzLmNoYWluKTtcbiAgICByZXR1cm4gYmxvY2s7XG4gIH1cblxuICBuZXdUcmFuc2FjdGlvbihcbiAgICBzZW5kZXI6IHN0cmluZyxcbiAgICByZWNpcGllbnQ6IHN0cmluZyxcbiAgICBhbW91bnQ6IG51bWJlcixcbiAgICBkYXRhOiB7IHR5cGU6IEVUcmFuc2FjdGlvblR5cGU7IHBheWxvYWQ6IGFueSB9LFxuICAgIGN5cGhlciA9IHRoaXMuY3lwaGVyXG4gICkge1xuICAgIGNvbnN0IHRyYW46IElUcmFuc2FjdGlvbiA9IHtcbiAgICAgIHNlbmRlcjogc2VuZGVyLCAvL+mAgeS/oeOCouODieODrOOCuVxuICAgICAgcmVjaXBpZW50OiByZWNpcGllbnQsIC8v5Y+X5Y+W44Ki44OJ44Os44K5XG4gICAgICBhbW91bnQ6IGFtb3VudCwgLy/ph49cbiAgICAgIGRhdGE6IGRhdGEsIC8v5Lu75oSP44Gu44Oh44OD44K744O844K4XG4gICAgICBub3c6IERhdGUubm93KCksIC8v44K/44Kk44Og44K544K/44Oz44OXXG4gICAgICBwdWJsaWNLZXk6IGN5cGhlci5wdWJLZXksIC8v5YWs6ZaL6Y21LFxuICAgICAgbm9uY2U6IHRoaXMuZ2V0Tm9uY2UoKSxcbiAgICAgIHNpZ246IFwiXCIgLy/nvbLlkI1cbiAgICB9O1xuICAgIHRyYW4uc2lnbiA9IGN5cGhlci5lbmNyeXB0KHRoaXMuaGFzaCh0cmFuKSk7XG4gICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgpLov73liqBcbiAgICB0aGlzLmN1cnJlbnRUcmFuc2FjdGlvbnMucHVzaCh0cmFuKTtcblxuICAgIHJldHVybiB0cmFuO1xuICB9XG5cbiAgbGFzdEJsb2NrKGJsb2NrY2hhaW4gPSB0aGlzLmNoYWluKSB7XG4gICAgcmV0dXJuIGJsb2NrY2hhaW5bYmxvY2tjaGFpbi5sZW5ndGggLSAxXTtcbiAgfVxuXG4gIGFkZEJsb2NrKGJsb2NrOiBhbnkpIHtcbiAgICBpZiAodGhpcy52YWxpZEJsb2NrKGJsb2NrKSkge1xuICAgICAgY29uc29sZS5sb2coXCJ2YWxpZEJsb2NrXCIpO1xuICAgICAgdGhpcy5jdXJyZW50VHJhbnNhY3Rpb25zID0gW107XG4gICAgICB0aGlzLmNoYWluLnB1c2goYmxvY2spO1xuXG4gICAgICB0aGlzLmNhbGxiYWNrLm9uQWRkQmxvY2soKTtcbiAgICAgIHRoaXMuZXhjdXRlRXZlbnQodGhpcy5ldmVudHMub25BZGRCbG9jayk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBleGN1dGVFdmVudChldjogYW55LCB2PzogYW55KSB7XG4gICAgY29uc29sZS5sb2coXCJleGN1dGVFdmVudFwiLCBldik7XG4gICAgT2JqZWN0LmtleXMoZXYpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGV2W2tleV0odik7XG4gICAgfSk7XG4gIH1cblxuICB2YWxpZEJsb2NrKGJsb2NrOiBhbnkpIHtcbiAgICBjb25zdCBsYXN0QmxvY2sgPSB0aGlzLmxhc3RCbG9jaygpO1xuICAgIGNvbnN0IGxhc3RQcm9vZiA9IGxhc3RCbG9jay5wcm9vZjtcbiAgICBjb25zdCBsYXN0SGFzaCA9IHRoaXMuaGFzaChsYXN0QmxvY2spO1xuICAgIGNvbnN0IG93bmVyID0gYmxvY2sub3duZXI7XG4gICAgY29uc3Qgc2lnbiA9IGJsb2NrLnNpZ247XG4gICAgY29uc3QgcHVibGljS2V5ID0gYmxvY2sucHVibGljS2V5O1xuICAgIGJsb2NrLnNpZ24gPSBcIlwiO1xuXG4gICAgLy/nvbLlkI3jgYzmraPjgZfjgYTjgYvjganjgYbjgYtcbiAgICBpZiAodGhpcy5jeXBoZXIuZGVjcnlwdChzaWduLCBwdWJsaWNLZXkpID09PSB0aGlzLmhhc2goYmxvY2spKSB7XG4gICAgICBibG9jay5zaWduID0gc2lnbjtcbiAgICAgIC8v44OK44Oz44K544GM5q2j44GX44GE44GL44Gp44GG44GLXG4gICAgICBpZiAodGhpcy52YWxpZFByb29mKGxhc3RQcm9vZiwgYmxvY2sucHJvb2YsIGxhc3RIYXNoLCBvd25lcikpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcImJsb2NrIG5vbmNlIGVycm9yXCIsIHRoaXMuYWRkcmVzcywgdGhpcy5jaGFpbik7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXCJibG9jayBzaWduIGVycm9yXCIsIHRoaXMuYWRkcmVzcyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgdmFsaWRQcm9vZihcbiAgICBsYXN0UHJvb2Y6IHN0cmluZyxcbiAgICBwcm9vZjogbnVtYmVyLFxuICAgIGxhc3RIYXNoOiBzdHJpbmcsXG4gICAgYWRkcmVzczogc3RyaW5nXG4gICkge1xuICAgIGNvbnN0IGd1ZXNzID0gYCR7bGFzdFByb29mfSR7cHJvb2Z9JHtsYXN0SGFzaH0ke2FkZHJlc3N9YDtcbiAgICBjb25zdCBndWVzc0hhc2ggPSBzaGEyNTYoZ3Vlc3MpO1xuICAgIC8v5YWI6aCt44GL44KJ77yU5paH5a2X44GM77yQ44Gq44KJ5oiQ5YqfXG4gICAgcmV0dXJuIGRpZmYudGVzdChndWVzc0hhc2gpO1xuICB9XG5cbiAgdmFsaWRDaGFpbihjaGFpbjogQXJyYXk8YW55Pikge1xuICAgIGxldCBpbmRleCA9IDI7XG4gICAgd2hpbGUgKGluZGV4IDwgY2hhaW4ubGVuZ3RoKSB7XG4gICAgICBjb25zdCBwcmV2aW91c0Jsb2NrID0gY2hhaW5baW5kZXggLSAxXTtcbiAgICAgIGNvbnN0IGJsb2NrID0gY2hhaW5baW5kZXhdO1xuXG4gICAgICAvL+ODluODreODg+OCr+OBruaMgeOBpOWJjeOBruODluODreODg+OCr+OBruODj+ODg+OCt+ODpeWApOOBqOWun+mam+OBruWJjeOBrlxuICAgICAgLy/jg5bjg63jg4Pjgq/jga7jg4/jg4Pjgrfjg6XlgKTjgpLmr5TovINcbiAgICAgIGlmIChibG9jay5wcmV2aW91c0hhc2ggIT09IHRoaXMuaGFzaChwcmV2aW91c0Jsb2NrKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICAvL+ODiuODs+OCueOBruWApOOBruaknOiovFxuICAgICAgaWYgKFxuICAgICAgICAhdGhpcy52YWxpZFByb29mKFxuICAgICAgICAgIHByZXZpb3VzQmxvY2sucHJvb2YsXG4gICAgICAgICAgYmxvY2sucHJvb2YsXG4gICAgICAgICAgdGhpcy5oYXNoKGJsb2NrKSxcbiAgICAgICAgICBibG9jay5vd25lclxuICAgICAgICApXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaW5kZXgrKztcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICB2YWxpZFRyYW5zYWN0aW9uKHRyYW5zYWN0aW9uOiBJVHJhbnNhY3Rpb24pIHtcbiAgICBjb25zdCBhbW91bnQgPSB0cmFuc2FjdGlvbi5hbW91bnQ7XG4gICAgY29uc3Qgc2lnbiA9IHRyYW5zYWN0aW9uLnNpZ247XG5cbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLmN1cnJlbnRUcmFuc2FjdGlvbnMuZmluZChwcmV2ID0+IHtcbiAgICAgIHJldHVybiBwcmV2LnNpZ24gPT09IHNpZ247XG4gICAgfSk7XG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgY29uc29sZS5sb2coXCJkdXBsaWNhdGUgZXJyb3JcIiwgeyByZXN1bHQgfSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgcHVibGljS2V5ID0gdHJhbnNhY3Rpb24ucHVibGljS2V5O1xuICAgIGNvbnN0IGFkZHJlc3MgPSB0cmFuc2FjdGlvbi5zZW5kZXI7XG4gICAgdHJhbnNhY3Rpb24uc2lnbiA9IFwiXCI7XG5cbiAgICAvL+WFrOmWi+mNteOBjOmAgemHkeiAheOBruOCguOBruOBi+OBqeOBhuOBi1xuICAgIGlmIChzaGEyNTYocHVibGljS2V5KSA9PT0gYWRkcmVzcykge1xuICAgICAgLy/nvbLlkI3jgYzmraPjgZfjgYTjgYvjganjgYbjgYtcbiAgICAgIC8v5YWs6ZaL6Y2144Gn572y5ZCN44KS6Kej6Kqt44GX44OI44Op44Oz44K244Kv44K344On44Oz44Gu44OP44OD44K344Ol5YCk44Go5LiA6Ie044GZ44KL44GT44Go44KS56K66KqN44GZ44KL44CCXG4gICAgICBpZiAodGhpcy5jeXBoZXIuZGVjcnlwdChzaWduLCBwdWJsaWNLZXkpID09PSB0aGlzLmhhc2godHJhbnNhY3Rpb24pKSB7XG4gICAgICAgIGNvbnN0IGJhbGFuY2UgPSB0aGlzLm5vd0Ftb3VudChhZGRyZXNzKTtcbiAgICAgICAgLy/pgIHph5Hlj6/og73jgarph5HpoY3jgpLotoXjgYjjgabjgYTjgovjgYvjganjgYbjgYtcbiAgICAgICAgaWYgKGJhbGFuY2UgPj0gYW1vdW50KSB7XG4gICAgICAgICAgLy/mtojjgZfjgZ/nvbLlkI3jgpLmiLvjgZlcbiAgICAgICAgICB0cmFuc2FjdGlvbi5zaWduID0gc2lnbjtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImJhbGFuY2UgZXJyb3JcIiwgYW1vdW50LCBiYWxhbmNlKTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic2lnbiBlcnJvclwiKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcInB1YmtleSBlcnJvclwiKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBhZGRUcmFuc2FjdGlvbih0cmFuOiBJVHJhbnNhY3Rpb24pIHtcbiAgICBpZiAodGhpcy52YWxpZFRyYW5zYWN0aW9uKHRyYW4pKSB7XG4gICAgICBjb25zb2xlLmxvZyhcInZhbGlkVHJhbnNhY3Rpb25cIiwgeyB0cmFuIH0pO1xuICAgICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgpLov73liqBcbiAgICAgIHRoaXMuY3VycmVudFRyYW5zYWN0aW9ucy5wdXNoKHRyYW4pO1xuICAgICAgdGhpcy5leGN1dGVFdmVudCh0aGlzLmV2ZW50cy5vblRyYW5zYWN0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXCJlcnJvciBUcmFuc2FjdGlvblwiKTtcbiAgICB9XG4gIH1cblxuICBwcm9vZk9mV29yaygpIHtcbiAgICBjb25zdCBsYXN0QmxvY2sgPSB0aGlzLmxhc3RCbG9jaygpO1xuICAgIGNvbnN0IGxhc3RQcm9vZiA9IGxhc3RCbG9jay5wcm9vZjtcbiAgICBjb25zdCBsYXN0SGFzaCA9IHRoaXMuaGFzaChsYXN0QmxvY2spO1xuXG4gICAgbGV0IHByb29mID0gMDtcblxuICAgIHdoaWxlICghdGhpcy52YWxpZFByb29mKGxhc3RQcm9vZiwgcHJvb2YsIGxhc3RIYXNoLCB0aGlzLmFkZHJlc3MpKSB7XG4gICAgICAvL+ODiuODs+OCueOBruWApOOCkuippuihjOmMr+iqpOeahOOBq+aOouOBmVxuICAgICAgcHJvb2YrKztcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvb2Y7XG4gIH1cblxuICBub3dBbW91bnQoYWRkcmVzcyA9IHRoaXMuYWRkcmVzcykge1xuICAgIGxldCB0b2tlbk51bSA9IG5ldyBEZWNpbWFsKDAuMCk7XG4gICAgdGhpcy5jaGFpbi5mb3JFYWNoKGJsb2NrID0+IHtcbiAgICAgIGJsb2NrLnRyYW5zYWN0aW9ucy5mb3JFYWNoKCh0cmFuc2FjdGlvbjogYW55KSA9PiB7XG4gICAgICAgIGlmICh0cmFuc2FjdGlvbi5yZWNpcGllbnQgPT09IGFkZHJlc3MpIHtcbiAgICAgICAgICB0b2tlbk51bSA9IHRva2VuTnVtLnBsdXMobmV3IERlY2ltYWwocGFyc2VGbG9hdCh0cmFuc2FjdGlvbi5hbW91bnQpKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRyYW5zYWN0aW9uLnNlbmRlciA9PT0gYWRkcmVzcykge1xuICAgICAgICAgIHRva2VuTnVtID0gdG9rZW5OdW0ubWludXMoXG4gICAgICAgICAgICBuZXcgRGVjaW1hbChwYXJzZUZsb2F0KHRyYW5zYWN0aW9uLmFtb3VudCkpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgdGhpcy5jdXJyZW50VHJhbnNhY3Rpb25zLmZvckVhY2godHJhbnNhY3Rpb24gPT4ge1xuICAgICAgaWYgKHRyYW5zYWN0aW9uLnJlY2lwaWVudCA9PT0gYWRkcmVzcykge1xuICAgICAgICB0b2tlbk51bSA9IHRva2VuTnVtLnBsdXMobmV3IERlY2ltYWwocGFyc2VGbG9hdCh0cmFuc2FjdGlvbi5hbW91bnQpKSk7XG4gICAgICB9XG4gICAgICBpZiAodHJhbnNhY3Rpb24uc2VuZGVyID09PSBhZGRyZXNzKSB7XG4gICAgICAgIHRva2VuTnVtID0gdG9rZW5OdW0ubWludXMobmV3IERlY2ltYWwocGFyc2VGbG9hdCh0cmFuc2FjdGlvbi5hbW91bnQpKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHRva2VuTnVtLnRvTnVtYmVyKCk7XG4gIH1cblxuICBnZXROb25jZShhZGRyZXNzID0gdGhpcy5hZGRyZXNzKSB7XG4gICAgbGV0IG5vbmNlID0gMDtcbiAgICB0aGlzLmNoYWluLmZvckVhY2goYmxvY2sgPT4ge1xuICAgICAgYmxvY2sudHJhbnNhY3Rpb25zLmZvckVhY2goKHRyYW5zYWN0aW9uOiBJVHJhbnNhY3Rpb24pID0+IHtcbiAgICAgICAgaWYgKHRyYW5zYWN0aW9uLnNlbmRlciA9PT0gYWRkcmVzcykge1xuICAgICAgICAgIG5vbmNlKys7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHRoaXMuY3VycmVudFRyYW5zYWN0aW9ucy5mb3JFYWNoKHRyYW5zYWN0aW9uID0+IHtcbiAgICAgIGlmICh0cmFuc2FjdGlvbi5yZWNpcGllbnQgPT09IGFkZHJlc3MpIHtcbiAgICAgICAgbm9uY2UrKztcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbm9uY2U7XG4gIH1cbn1cbiJdfQ==