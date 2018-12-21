"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hash = hash;
exports.jsonStr = jsonStr;
exports.validProof = validProof;
exports.validChain = validChain;
exports.validBlock = validBlock;
exports.default = void 0;

var _sha = _interopRequireDefault(require("sha256"));

var _decimal = require("decimal.js");

var _cypher = _interopRequireDefault(require("./crypto/cypher"));

var _type = _interopRequireDefault(require("./type"));

var _interface = require("./interface");

var _util = require("../util");

var _sign = require("./crypto/sign");

var _account = _interopRequireDefault(require("./account"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var diff = /^000/;

function hash(obj) {
  var objString = JSON.stringify(obj, Object.keys(obj).sort());
  return (0, _sha.default)(objString);
}

function jsonStr(obj) {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

function validProof(lastProof, proof, lastHash, address) {
  var guess = "".concat(lastProof).concat(proof).concat(lastHash).concat(address);
  var guessHash = (0, _sha.default)(guess);
  return diff.test(guessHash);
}

function validChain(chain) {
  var index = 2;
  var result = true;

  while (index < chain.length) {
    var lastBlock = chain[index - 1];
    var lastProof = lastBlock.proof;
    var lastHash = hash(lastBlock);
    var block = chain[index];
    var _owner = block.owner; //ブロックの持つ前のブロックのハッシュ値と実際の前の
    //ブロックのハッシュ値を比較

    if (block.previousHash !== lastHash) {
      console.log("blockchain hash error", {
        block: block
      });
      result = false;
      break;
    } //ナンスの値の検証


    if (!validProof(lastProof, block.proof, lastHash, _owner)) {
      console.log("blockchain nonce error", {
        block: block
      });
      result = false;
      break;
    }

    index++;
  }

  return result;
}

function validBlock(lastBlock, block) {
  var lastProof = lastBlock.proof;
  var lastHash = hash(lastBlock);
  var owner = block.owner;
  var sign = block.sign;
  var publicKey = block.publicKey;
  block.sign = ""; //署名が正しいかどうか

  if ((0, _sign.verifyMessageWithPublicKey)({
    message: hash(block),
    publicKey: publicKey,
    signature: sign
  })) {
    block.sign = sign; //ナンスが正しいかどうか

    if (validProof(lastProof, block.proof, lastHash, owner)) {
      return true;
    } else {
      console.log("block nonce error");
      return false;
    }
  } else {
    console.log("block sign error");
    return false;
  }
}

var BlockChain =
/*#__PURE__*/
function () {
  function BlockChain(phrase) {
    _classCallCheck(this, BlockChain);

    _defineProperty(this, "chain", []);

    _defineProperty(this, "currentTransactions", []);

    _defineProperty(this, "cypher", void 0);

    _defineProperty(this, "address", void 0);

    _defineProperty(this, "accout", void 0);

    _defineProperty(this, "callback", {
      onAddBlock: function onAddBlock(v) {}
    });

    _defineProperty(this, "onAddBlock", {});

    _defineProperty(this, "onTransaction", {});

    _defineProperty(this, "onMadeTransaction", {});

    _defineProperty(this, "events", {
      onAddBlock: this.onAddBlock,
      onTransaction: this.onTransaction,
      onMadeTransaction: this.onMadeTransaction
    });

    this.cypher = new _cypher.default(phrase);
    this.accout = new _account.default(phrase);
    this.address = (0, _sha.default)(this.cypher.pubKey);
    this.newBlock(0, "genesis");
  }

  _createClass(BlockChain, [{
    key: "newBlock",
    value: function newBlock(proof, previousHash) {
      //採掘報酬
      var tran = this.newTransaction(_type.default.SYSTEM, this.address, 1, {
        type: _interface.ETransactionType.transaction,
        payload: "reward"
      });
      this.currentTransactions.push(tran);
      var block = {
        index: this.chain.length + 1,
        //ブロックの番号
        timestamp: Date.now(),
        //タイムスタンプ
        transactions: this.currentTransactions,
        //トランザクションの塊
        proof: proof,
        //ナンス
        previousHash: previousHash || hash(this.lastBlock()),
        //前のブロックのハッシュ値
        owner: this.address,
        //このブロックを作った人
        publicKey: this.cypher.pubKey,
        //このブロックを作った人の公開鍵
        sign: "" //このブロックを作った人の署名

      }; //署名を生成

      block.sign = this.cypher.signMessage(hash(block)).signature; //ブロックチェーンに追加

      if (this.chain.length > 0 && !validBlock(this.chain[this.chain.length - 1], block)) {
        return undefined;
      }

      this.chain.push(block); //トランザクションプールをリセット

      this.currentTransactions = [];
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
      tran.sign = cypher.signMessage(hash(tran)).signature; //トランザクションを追加
      //this.currentTransactions.push(tran);

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
      if (validBlock(this.chain[this.chain.length - 1], block)) {
        this.currentTransactions = [];
        this.chain.push(block);
        this.callback.onAddBlock();
        (0, _util.excuteEvent)(this.events.onAddBlock);
      }
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
        if ((0, _sign.verifyMessageWithPublicKey)({
          message: hash(transaction),
          publicKey: publicKey,
          signature: sign
        })) {
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
        //トランザクションを追加
        this.currentTransactions.push(tran);
        (0, _util.excuteEvent)(this.events.onTransaction);
      } else {
        console.log("error Transaction", {
          tran: tran
        });
      }
    }
  }, {
    key: "proofOfWork",
    value: function proofOfWork() {
      var lastBlock = this.lastBlock();
      var lastProof = lastBlock.proof;
      var lastHash = hash(lastBlock);
      var proof = 0;

      while (!validProof(lastProof, proof, lastHash, this.address)) {
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
    key: "getAllTransactions",
    value: function getAllTransactions() {
      var transactions = [];
      this.chain.forEach(function (block) {
        block.transactions.forEach(function (transaction) {
          transactions.push(transaction);
        });
      });
      this.currentTransactions.forEach(function (transaction) {
        transactions.push(transaction);
      });
      return transactions;
    }
  }, {
    key: "getNonce",
    value: function getNonce() {
      var address = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.address;
      var nonce = 0;
      var transactions = this.getAllTransactions();
      transactions.forEach(function (transaction) {
        if (transaction.sender === address) {
          nonce++;
        }
      });
      return nonce;
    }
  }]);

  return BlockChain;
}();

exports.default = BlockChain;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL2Jsb2NrY2hhaW4udHMiXSwibmFtZXMiOlsiZGlmZiIsImhhc2giLCJvYmoiLCJvYmpTdHJpbmciLCJKU09OIiwic3RyaW5naWZ5IiwiT2JqZWN0Iiwia2V5cyIsInNvcnQiLCJqc29uU3RyIiwidmFsaWRQcm9vZiIsImxhc3RQcm9vZiIsInByb29mIiwibGFzdEhhc2giLCJhZGRyZXNzIiwiZ3Vlc3MiLCJndWVzc0hhc2giLCJ0ZXN0IiwidmFsaWRDaGFpbiIsImNoYWluIiwiaW5kZXgiLCJyZXN1bHQiLCJsZW5ndGgiLCJsYXN0QmxvY2siLCJibG9jayIsIm93bmVyIiwicHJldmlvdXNIYXNoIiwiY29uc29sZSIsImxvZyIsInZhbGlkQmxvY2siLCJzaWduIiwicHVibGljS2V5IiwibWVzc2FnZSIsInNpZ25hdHVyZSIsIkJsb2NrQ2hhaW4iLCJwaHJhc2UiLCJvbkFkZEJsb2NrIiwidiIsIm9uVHJhbnNhY3Rpb24iLCJvbk1hZGVUcmFuc2FjdGlvbiIsImN5cGhlciIsIkN5cGhlciIsImFjY291dCIsIkFjY291bnQiLCJwdWJLZXkiLCJuZXdCbG9jayIsInRyYW4iLCJuZXdUcmFuc2FjdGlvbiIsInR5cGUiLCJTWVNURU0iLCJFVHJhbnNhY3Rpb25UeXBlIiwidHJhbnNhY3Rpb24iLCJwYXlsb2FkIiwiY3VycmVudFRyYW5zYWN0aW9ucyIsInB1c2giLCJ0aW1lc3RhbXAiLCJEYXRlIiwibm93IiwidHJhbnNhY3Rpb25zIiwic2lnbk1lc3NhZ2UiLCJ1bmRlZmluZWQiLCJzZW5kZXIiLCJyZWNpcGllbnQiLCJhbW91bnQiLCJkYXRhIiwibm9uY2UiLCJnZXROb25jZSIsImJsb2NrY2hhaW4iLCJjYWxsYmFjayIsImV2ZW50cyIsImZpbmQiLCJwcmV2IiwiYmFsYW5jZSIsIm5vd0Ftb3VudCIsInZhbGlkVHJhbnNhY3Rpb24iLCJ0b2tlbk51bSIsIkRlY2ltYWwiLCJmb3JFYWNoIiwicGx1cyIsInBhcnNlRmxvYXQiLCJtaW51cyIsInRvTnVtYmVyIiwiZ2V0QWxsVHJhbnNhY3Rpb25zIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUEsSUFBSSxHQUFHLE1BQWI7O0FBNkJPLFNBQVNDLElBQVQsQ0FBY0MsR0FBZCxFQUEyQjtBQUNoQyxNQUFNQyxTQUFTLEdBQUdDLElBQUksQ0FBQ0MsU0FBTCxDQUFlSCxHQUFmLEVBQW9CSSxNQUFNLENBQUNDLElBQVAsQ0FBWUwsR0FBWixFQUFpQk0sSUFBakIsRUFBcEIsQ0FBbEI7QUFDQSxTQUFPLGtCQUFPTCxTQUFQLENBQVA7QUFDRDs7QUFFTSxTQUFTTSxPQUFULENBQWlCUCxHQUFqQixFQUE4QjtBQUNuQyxTQUFPRSxJQUFJLENBQUNDLFNBQUwsQ0FBZUgsR0FBZixFQUFvQkksTUFBTSxDQUFDQyxJQUFQLENBQVlMLEdBQVosRUFBaUJNLElBQWpCLEVBQXBCLENBQVA7QUFDRDs7QUFFTSxTQUFTRSxVQUFULENBQ0xDLFNBREssRUFFTEMsS0FGSyxFQUdMQyxRQUhLLEVBSUxDLE9BSkssRUFLTDtBQUNBLE1BQU1DLEtBQUssYUFBTUosU0FBTixTQUFrQkMsS0FBbEIsU0FBMEJDLFFBQTFCLFNBQXFDQyxPQUFyQyxDQUFYO0FBQ0EsTUFBTUUsU0FBUyxHQUFHLGtCQUFPRCxLQUFQLENBQWxCO0FBQ0EsU0FBT2YsSUFBSSxDQUFDaUIsSUFBTCxDQUFVRCxTQUFWLENBQVA7QUFDRDs7QUFFTSxTQUFTRSxVQUFULENBQW9CQyxLQUFwQixFQUFxQztBQUMxQyxNQUFJQyxLQUFLLEdBQUcsQ0FBWjtBQUNBLE1BQUlDLE1BQU0sR0FBRyxJQUFiOztBQUNBLFNBQU9ELEtBQUssR0FBR0QsS0FBSyxDQUFDRyxNQUFyQixFQUE2QjtBQUMzQixRQUFNQyxTQUFTLEdBQUdKLEtBQUssQ0FBQ0MsS0FBSyxHQUFHLENBQVQsQ0FBdkI7QUFDQSxRQUFNVCxTQUFTLEdBQUdZLFNBQVMsQ0FBQ1gsS0FBNUI7QUFDQSxRQUFNQyxRQUFRLEdBQUdaLElBQUksQ0FBQ3NCLFNBQUQsQ0FBckI7QUFDQSxRQUFNQyxLQUFLLEdBQUdMLEtBQUssQ0FBQ0MsS0FBRCxDQUFuQjtBQUNBLFFBQU1LLE1BQUssR0FBR0QsS0FBSyxDQUFDQyxLQUFwQixDQUwyQixDQU8zQjtBQUNBOztBQUNBLFFBQUlELEtBQUssQ0FBQ0UsWUFBTixLQUF1QmIsUUFBM0IsRUFBcUM7QUFDbkNjLE1BQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLHVCQUFaLEVBQXFDO0FBQUVKLFFBQUFBLEtBQUssRUFBTEE7QUFBRixPQUFyQztBQUNBSCxNQUFBQSxNQUFNLEdBQUcsS0FBVDtBQUNBO0FBQ0QsS0FiMEIsQ0FjM0I7OztBQUNBLFFBQUksQ0FBQ1gsVUFBVSxDQUFDQyxTQUFELEVBQVlhLEtBQUssQ0FBQ1osS0FBbEIsRUFBeUJDLFFBQXpCLEVBQW1DWSxNQUFuQyxDQUFmLEVBQTBEO0FBQ3hERSxNQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSx3QkFBWixFQUFzQztBQUFFSixRQUFBQSxLQUFLLEVBQUxBO0FBQUYsT0FBdEM7QUFDQUgsTUFBQUEsTUFBTSxHQUFHLEtBQVQ7QUFDQTtBQUNEOztBQUNERCxJQUFBQSxLQUFLO0FBQ047O0FBQ0QsU0FBT0MsTUFBUDtBQUNEOztBQUVNLFNBQVNRLFVBQVQsQ0FBb0JOLFNBQXBCLEVBQXVDQyxLQUF2QyxFQUErRDtBQUNwRSxNQUFNYixTQUFTLEdBQUdZLFNBQVMsQ0FBQ1gsS0FBNUI7QUFDQSxNQUFNQyxRQUFRLEdBQUdaLElBQUksQ0FBQ3NCLFNBQUQsQ0FBckI7QUFDQSxNQUFNRSxLQUFLLEdBQUdELEtBQUssQ0FBQ0MsS0FBcEI7QUFDQSxNQUFNSyxJQUFJLEdBQUdOLEtBQUssQ0FBQ00sSUFBbkI7QUFDQSxNQUFNQyxTQUFTLEdBQUdQLEtBQUssQ0FBQ08sU0FBeEI7QUFDQVAsRUFBQUEsS0FBSyxDQUFDTSxJQUFOLEdBQWEsRUFBYixDQU5vRSxDQVFwRTs7QUFDQSxNQUNFLHNDQUEyQjtBQUN6QkUsSUFBQUEsT0FBTyxFQUFFL0IsSUFBSSxDQUFDdUIsS0FBRCxDQURZO0FBRXpCTyxJQUFBQSxTQUFTLEVBQVRBLFNBRnlCO0FBR3pCRSxJQUFBQSxTQUFTLEVBQUVIO0FBSGMsR0FBM0IsQ0FERixFQU1FO0FBQ0FOLElBQUFBLEtBQUssQ0FBQ00sSUFBTixHQUFhQSxJQUFiLENBREEsQ0FFQTs7QUFDQSxRQUFJcEIsVUFBVSxDQUFDQyxTQUFELEVBQVlhLEtBQUssQ0FBQ1osS0FBbEIsRUFBeUJDLFFBQXpCLEVBQW1DWSxLQUFuQyxDQUFkLEVBQXlEO0FBQ3ZELGFBQU8sSUFBUDtBQUNELEtBRkQsTUFFTztBQUNMRSxNQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxtQkFBWjtBQUNBLGFBQU8sS0FBUDtBQUNEO0FBQ0YsR0FmRCxNQWVPO0FBQ0xELElBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGtCQUFaO0FBQ0EsV0FBTyxLQUFQO0FBQ0Q7QUFDRjs7SUFFb0JNLFU7OztBQXNCbkIsc0JBQVlDLE1BQVosRUFBNkI7QUFBQTs7QUFBQSxtQ0FyQlgsRUFxQlc7O0FBQUEsaURBcEJLLEVBb0JMOztBQUFBOztBQUFBOztBQUFBOztBQUFBLHNDQWZsQjtBQUNUQyxNQUFBQSxVQUFVLEVBQUUsb0JBQUNDLENBQUQsRUFBYSxDQUFFO0FBRGxCLEtBZWtCOztBQUFBLHdDQVh1QixFQVd2Qjs7QUFBQSwyQ0FWMEIsRUFVMUI7O0FBQUEsK0NBUHpCLEVBT3lCOztBQUFBLG9DQU5wQjtBQUNQRCxNQUFBQSxVQUFVLEVBQUUsS0FBS0EsVUFEVjtBQUVQRSxNQUFBQSxhQUFhLEVBQUUsS0FBS0EsYUFGYjtBQUdQQyxNQUFBQSxpQkFBaUIsRUFBRSxLQUFLQTtBQUhqQixLQU1vQjs7QUFDM0IsU0FBS0MsTUFBTCxHQUFjLElBQUlDLGVBQUosQ0FBV04sTUFBWCxDQUFkO0FBQ0EsU0FBS08sTUFBTCxHQUFjLElBQUlDLGdCQUFKLENBQVlSLE1BQVosQ0FBZDtBQUNBLFNBQUtyQixPQUFMLEdBQWUsa0JBQU8sS0FBSzBCLE1BQUwsQ0FBWUksTUFBbkIsQ0FBZjtBQUNBLFNBQUtDLFFBQUwsQ0FBYyxDQUFkLEVBQWlCLFNBQWpCO0FBQ0Q7Ozs7NkJBRVFqQyxLLEVBQVljLFksRUFBc0I7QUFDekM7QUFDQSxVQUFNb0IsSUFBSSxHQUFHLEtBQUtDLGNBQUwsQ0FBb0JDLGNBQUtDLE1BQXpCLEVBQWlDLEtBQUtuQyxPQUF0QyxFQUErQyxDQUEvQyxFQUFrRDtBQUM3RGtDLFFBQUFBLElBQUksRUFBRUUsNEJBQWlCQyxXQURzQztBQUU3REMsUUFBQUEsT0FBTyxFQUFFO0FBRm9ELE9BQWxELENBQWI7QUFJQSxXQUFLQyxtQkFBTCxDQUF5QkMsSUFBekIsQ0FBOEJSLElBQTlCO0FBRUEsVUFBTXRCLEtBQWEsR0FBRztBQUNwQkosUUFBQUEsS0FBSyxFQUFFLEtBQUtELEtBQUwsQ0FBV0csTUFBWCxHQUFvQixDQURQO0FBQ1U7QUFDOUJpQyxRQUFBQSxTQUFTLEVBQUVDLElBQUksQ0FBQ0MsR0FBTCxFQUZTO0FBRUc7QUFDdkJDLFFBQUFBLFlBQVksRUFBRSxLQUFLTCxtQkFIQztBQUdvQjtBQUN4Q3pDLFFBQUFBLEtBQUssRUFBRUEsS0FKYTtBQUlOO0FBQ2RjLFFBQUFBLFlBQVksRUFBRUEsWUFBWSxJQUFJekIsSUFBSSxDQUFDLEtBQUtzQixTQUFMLEVBQUQsQ0FMZDtBQUtrQztBQUN0REUsUUFBQUEsS0FBSyxFQUFFLEtBQUtYLE9BTlE7QUFNQztBQUNyQmlCLFFBQUFBLFNBQVMsRUFBRSxLQUFLUyxNQUFMLENBQVlJLE1BUEg7QUFPVztBQUMvQmQsUUFBQUEsSUFBSSxFQUFFLEVBUmMsQ0FRWDs7QUFSVyxPQUF0QixDQVJ5QyxDQWtCekM7O0FBQ0FOLE1BQUFBLEtBQUssQ0FBQ00sSUFBTixHQUFhLEtBQUtVLE1BQUwsQ0FBWW1CLFdBQVosQ0FBd0IxRCxJQUFJLENBQUN1QixLQUFELENBQTVCLEVBQXFDUyxTQUFsRCxDQW5CeUMsQ0FvQnpDOztBQUNBLFVBQ0UsS0FBS2QsS0FBTCxDQUFXRyxNQUFYLEdBQW9CLENBQXBCLElBQ0EsQ0FBQ08sVUFBVSxDQUFDLEtBQUtWLEtBQUwsQ0FBVyxLQUFLQSxLQUFMLENBQVdHLE1BQVgsR0FBb0IsQ0FBL0IsQ0FBRCxFQUFvQ0UsS0FBcEMsQ0FGYixFQUdFO0FBQ0EsZUFBT29DLFNBQVA7QUFDRDs7QUFDRCxXQUFLekMsS0FBTCxDQUFXbUMsSUFBWCxDQUFnQjlCLEtBQWhCLEVBM0J5QyxDQTZCekM7O0FBQ0EsV0FBSzZCLG1CQUFMLEdBQTJCLEVBQTNCO0FBQ0EsYUFBTzdCLEtBQVA7QUFDRDs7O21DQUdDcUMsTSxFQUNBQyxTLEVBQ0FDLE0sRUFDQUMsSSxFQUVjO0FBQUEsVUFEZHhCLE1BQ2MsdUVBREwsS0FBS0EsTUFDQTtBQUNkLFVBQU1NLElBQWtCLEdBQUc7QUFDekJlLFFBQUFBLE1BQU0sRUFBRUEsTUFEaUI7QUFDVDtBQUNoQkMsUUFBQUEsU0FBUyxFQUFFQSxTQUZjO0FBRUg7QUFDdEJDLFFBQUFBLE1BQU0sRUFBRUEsTUFIaUI7QUFHVDtBQUNoQkMsUUFBQUEsSUFBSSxFQUFKQSxJQUp5QjtBQUluQjtBQUNOUCxRQUFBQSxHQUFHLEVBQUVELElBQUksQ0FBQ0MsR0FBTCxFQUxvQjtBQUtSO0FBQ2pCMUIsUUFBQUEsU0FBUyxFQUFFUyxNQUFNLENBQUNJLE1BTk87QUFNQztBQUMxQnFCLFFBQUFBLEtBQUssRUFBRSxLQUFLQyxRQUFMLEVBUGtCO0FBUXpCcEMsUUFBQUEsSUFBSSxFQUFFLEVBUm1CLENBUWhCOztBQVJnQixPQUEzQjtBQVVBZ0IsTUFBQUEsSUFBSSxDQUFDaEIsSUFBTCxHQUFZVSxNQUFNLENBQUNtQixXQUFQLENBQW1CMUQsSUFBSSxDQUFDNkMsSUFBRCxDQUF2QixFQUErQmIsU0FBM0MsQ0FYYyxDQVlkO0FBQ0E7O0FBRUEsYUFBT2EsSUFBUDtBQUNEOzs7Z0NBRTBDO0FBQUEsVUFBakNxQixVQUFpQyx1RUFBcEIsS0FBS2hELEtBQWU7QUFDekMsYUFBT2dELFVBQVUsQ0FBQ0EsVUFBVSxDQUFDN0MsTUFBWCxHQUFvQixDQUFyQixDQUFqQjtBQUNEOzs7NkJBRVFFLEssRUFBZTtBQUN0QixVQUFJSyxVQUFVLENBQUMsS0FBS1YsS0FBTCxDQUFXLEtBQUtBLEtBQUwsQ0FBV0csTUFBWCxHQUFvQixDQUEvQixDQUFELEVBQW9DRSxLQUFwQyxDQUFkLEVBQTBEO0FBQ3hELGFBQUs2QixtQkFBTCxHQUEyQixFQUEzQjtBQUNBLGFBQUtsQyxLQUFMLENBQVdtQyxJQUFYLENBQWdCOUIsS0FBaEI7QUFDQSxhQUFLNEMsUUFBTCxDQUFjaEMsVUFBZDtBQUNBLCtCQUFZLEtBQUtpQyxNQUFMLENBQVlqQyxVQUF4QjtBQUNEO0FBQ0Y7OztxQ0FFZ0JlLFcsRUFBMkI7QUFDMUMsVUFBTVksTUFBTSxHQUFHWixXQUFXLENBQUNZLE1BQTNCO0FBQ0EsVUFBTWpDLElBQUksR0FBR3FCLFdBQVcsQ0FBQ3JCLElBQXpCO0FBRUEsVUFBTVQsTUFBTSxHQUFHLEtBQUtnQyxtQkFBTCxDQUF5QmlCLElBQXpCLENBQThCLFVBQUFDLElBQUksRUFBSTtBQUNuRCxlQUFPQSxJQUFJLENBQUN6QyxJQUFMLEtBQWNBLElBQXJCO0FBQ0QsT0FGYyxDQUFmOztBQUdBLFVBQUlULE1BQUosRUFBWTtBQUNWTSxRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxpQkFBWixFQUErQjtBQUFFUCxVQUFBQSxNQUFNLEVBQU5BO0FBQUYsU0FBL0I7QUFDQSxlQUFPLEtBQVA7QUFDRDs7QUFFRCxVQUFNVSxTQUFTLEdBQUdvQixXQUFXLENBQUNwQixTQUE5QjtBQUNBLFVBQU1qQixPQUFPLEdBQUdxQyxXQUFXLENBQUNVLE1BQTVCO0FBQ0FWLE1BQUFBLFdBQVcsQ0FBQ3JCLElBQVosR0FBbUIsRUFBbkIsQ0FkMEMsQ0FnQjFDOztBQUNBLFVBQUksa0JBQU9DLFNBQVAsTUFBc0JqQixPQUExQixFQUFtQztBQUNqQztBQUNBO0FBQ0EsWUFDRSxzQ0FBMkI7QUFDekJrQixVQUFBQSxPQUFPLEVBQUUvQixJQUFJLENBQUNrRCxXQUFELENBRFk7QUFFekJwQixVQUFBQSxTQUFTLEVBQVRBLFNBRnlCO0FBR3pCRSxVQUFBQSxTQUFTLEVBQUVIO0FBSGMsU0FBM0IsQ0FERixFQU1FO0FBQ0EsY0FBTTBDLE9BQU8sR0FBRyxLQUFLQyxTQUFMLENBQWUzRCxPQUFmLENBQWhCLENBREEsQ0FFQTs7QUFDQSxjQUFJMEQsT0FBTyxJQUFJVCxNQUFmLEVBQXVCO0FBQ3JCO0FBQ0FaLFlBQUFBLFdBQVcsQ0FBQ3JCLElBQVosR0FBbUJBLElBQW5CO0FBQ0EsbUJBQU8sSUFBUDtBQUNELFdBSkQsTUFJTztBQUNMSCxZQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxlQUFaLEVBQTZCbUMsTUFBN0IsRUFBcUNTLE9BQXJDO0FBQ0EsbUJBQU8sS0FBUDtBQUNEO0FBQ0YsU0FqQkQsTUFpQk87QUFDTDdDLFVBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLFlBQVo7QUFDQSxpQkFBTyxLQUFQO0FBQ0Q7QUFDRixPQXhCRCxNQXdCTztBQUNMRCxRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxjQUFaO0FBQ0EsZUFBTyxLQUFQO0FBQ0Q7QUFDRjs7O21DQUVja0IsSSxFQUFvQjtBQUNqQyxVQUFJLEtBQUs0QixnQkFBTCxDQUFzQjVCLElBQXRCLENBQUosRUFBaUM7QUFDL0I7QUFDQSxhQUFLTyxtQkFBTCxDQUF5QkMsSUFBekIsQ0FBOEJSLElBQTlCO0FBQ0EsK0JBQVksS0FBS3VCLE1BQUwsQ0FBWS9CLGFBQXhCO0FBQ0QsT0FKRCxNQUlPO0FBQ0xYLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLG1CQUFaLEVBQWlDO0FBQUVrQixVQUFBQSxJQUFJLEVBQUpBO0FBQUYsU0FBakM7QUFDRDtBQUNGOzs7a0NBRWE7QUFDWixVQUFNdkIsU0FBUyxHQUFHLEtBQUtBLFNBQUwsRUFBbEI7QUFDQSxVQUFNWixTQUFTLEdBQUdZLFNBQVMsQ0FBQ1gsS0FBNUI7QUFDQSxVQUFNQyxRQUFRLEdBQUdaLElBQUksQ0FBQ3NCLFNBQUQsQ0FBckI7QUFFQSxVQUFJWCxLQUFLLEdBQUcsQ0FBWjs7QUFFQSxhQUFPLENBQUNGLFVBQVUsQ0FBQ0MsU0FBRCxFQUFZQyxLQUFaLEVBQW1CQyxRQUFuQixFQUE2QixLQUFLQyxPQUFsQyxDQUFsQixFQUE4RDtBQUM1RDtBQUNBRixRQUFBQSxLQUFLO0FBQ047O0FBRUQsYUFBT0EsS0FBUDtBQUNEOzs7Z0NBRWlDO0FBQUEsVUFBeEJFLE9BQXdCLHVFQUFkLEtBQUtBLE9BQVM7QUFDaEMsVUFBSTZELFFBQVEsR0FBRyxJQUFJQyxnQkFBSixDQUFZLEdBQVosQ0FBZjtBQUNBLFdBQUt6RCxLQUFMLENBQVcwRCxPQUFYLENBQW1CLFVBQUFyRCxLQUFLLEVBQUk7QUFDMUJBLFFBQUFBLEtBQUssQ0FBQ2tDLFlBQU4sQ0FBbUJtQixPQUFuQixDQUEyQixVQUFDMUIsV0FBRCxFQUFzQjtBQUMvQyxjQUFJQSxXQUFXLENBQUNXLFNBQVosS0FBMEJoRCxPQUE5QixFQUF1QztBQUNyQzZELFlBQUFBLFFBQVEsR0FBR0EsUUFBUSxDQUFDRyxJQUFULENBQWMsSUFBSUYsZ0JBQUosQ0FBWUcsVUFBVSxDQUFDNUIsV0FBVyxDQUFDWSxNQUFiLENBQXRCLENBQWQsQ0FBWDtBQUNEOztBQUNELGNBQUlaLFdBQVcsQ0FBQ1UsTUFBWixLQUF1Qi9DLE9BQTNCLEVBQW9DO0FBQ2xDNkQsWUFBQUEsUUFBUSxHQUFHQSxRQUFRLENBQUNLLEtBQVQsQ0FDVCxJQUFJSixnQkFBSixDQUFZRyxVQUFVLENBQUM1QixXQUFXLENBQUNZLE1BQWIsQ0FBdEIsQ0FEUyxDQUFYO0FBR0Q7QUFDRixTQVREO0FBVUQsT0FYRDtBQVlBLFdBQUtWLG1CQUFMLENBQXlCd0IsT0FBekIsQ0FBaUMsVUFBQTFCLFdBQVcsRUFBSTtBQUM5QyxZQUFJQSxXQUFXLENBQUNXLFNBQVosS0FBMEJoRCxPQUE5QixFQUF1QztBQUNyQzZELFVBQUFBLFFBQVEsR0FBR0EsUUFBUSxDQUFDRyxJQUFULENBQWMsSUFBSUYsZ0JBQUosQ0FBWUcsVUFBVSxDQUFDNUIsV0FBVyxDQUFDWSxNQUFiLENBQXRCLENBQWQsQ0FBWDtBQUNEOztBQUNELFlBQUlaLFdBQVcsQ0FBQ1UsTUFBWixLQUF1Qi9DLE9BQTNCLEVBQW9DO0FBQ2xDNkQsVUFBQUEsUUFBUSxHQUFHQSxRQUFRLENBQUNLLEtBQVQsQ0FBZSxJQUFJSixnQkFBSixDQUFZRyxVQUFVLENBQUM1QixXQUFXLENBQUNZLE1BQWIsQ0FBdEIsQ0FBZixDQUFYO0FBQ0Q7QUFDRixPQVBEO0FBUUEsYUFBT1ksUUFBUSxDQUFDTSxRQUFULEVBQVA7QUFDRDs7O3lDQUVvQjtBQUNuQixVQUFNdkIsWUFBNEIsR0FBRyxFQUFyQztBQUNBLFdBQUt2QyxLQUFMLENBQVcwRCxPQUFYLENBQW1CLFVBQUFyRCxLQUFLLEVBQUk7QUFDMUJBLFFBQUFBLEtBQUssQ0FBQ2tDLFlBQU4sQ0FBbUJtQixPQUFuQixDQUEyQixVQUFDMUIsV0FBRCxFQUErQjtBQUN4RE8sVUFBQUEsWUFBWSxDQUFDSixJQUFiLENBQWtCSCxXQUFsQjtBQUNELFNBRkQ7QUFHRCxPQUpEO0FBS0EsV0FBS0UsbUJBQUwsQ0FBeUJ3QixPQUF6QixDQUFpQyxVQUFBMUIsV0FBVyxFQUFJO0FBQzlDTyxRQUFBQSxZQUFZLENBQUNKLElBQWIsQ0FBa0JILFdBQWxCO0FBQ0QsT0FGRDtBQUdBLGFBQU9PLFlBQVA7QUFDRDs7OytCQUVnQztBQUFBLFVBQXhCNUMsT0FBd0IsdUVBQWQsS0FBS0EsT0FBUztBQUMvQixVQUFJbUQsS0FBSyxHQUFHLENBQVo7QUFDQSxVQUFNUCxZQUFZLEdBQUcsS0FBS3dCLGtCQUFMLEVBQXJCO0FBQ0F4QixNQUFBQSxZQUFZLENBQUNtQixPQUFiLENBQXFCLFVBQUExQixXQUFXLEVBQUk7QUFDbEMsWUFBSUEsV0FBVyxDQUFDVSxNQUFaLEtBQXVCL0MsT0FBM0IsRUFBb0M7QUFDbENtRCxVQUFBQSxLQUFLO0FBQ047QUFDRixPQUpEO0FBS0EsYUFBT0EsS0FBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHNoYTI1NiBmcm9tIFwic2hhMjU2XCI7XG5pbXBvcnQgeyBEZWNpbWFsIH0gZnJvbSBcImRlY2ltYWwuanNcIjtcbmltcG9ydCBDeXBoZXIgZnJvbSBcIi4vY3J5cHRvL2N5cGhlclwiO1xuaW1wb3J0IHR5cGUgZnJvbSBcIi4vdHlwZVwiO1xuaW1wb3J0IHsgRVRyYW5zYWN0aW9uVHlwZSB9IGZyb20gXCIuL2ludGVyZmFjZVwiO1xuaW1wb3J0IHsgZXhjdXRlRXZlbnQgfSBmcm9tIFwiLi4vdXRpbFwiO1xuaW1wb3J0IHsgdmVyaWZ5TWVzc2FnZVdpdGhQdWJsaWNLZXkgfSBmcm9tIFwiLi9jcnlwdG8vc2lnblwiO1xuaW1wb3J0IEFjY291bnQgZnJvbSBcIi4vYWNjb3VudFwiO1xuXG5jb25zdCBkaWZmID0gL14wMDAvO1xuXG5leHBvcnQgaW50ZXJmYWNlIElCbG9jayB7XG4gIGluZGV4OiBudW1iZXI7XG4gIHRpbWVzdGFtcDogYW55O1xuICB0cmFuc2FjdGlvbnM6IElUcmFuc2FjdGlvbltdO1xuICBwcm9vZjogbnVtYmVyO1xuICBwcmV2aW91c0hhc2g6IHN0cmluZztcbiAgb3duZXI6IHN0cmluZztcbiAgcHVibGljS2V5OiBzdHJpbmc7XG4gIHNpZ246IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJVHJhbnNhY3Rpb25EYXRhIHtcbiAgdHlwZTogRVRyYW5zYWN0aW9uVHlwZTtcbiAgcGF5bG9hZDogYW55O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElUcmFuc2FjdGlvbiB7XG4gIHNlbmRlcjogc3RyaW5nO1xuICByZWNpcGllbnQ6IHN0cmluZztcbiAgYW1vdW50OiBudW1iZXI7XG4gIGRhdGE6IElUcmFuc2FjdGlvbkRhdGE7XG4gIG5vdzogYW55O1xuICBwdWJsaWNLZXk6IHN0cmluZztcbiAgbm9uY2U6IG51bWJlcjtcbiAgc2lnbjogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzaChvYmo6IG9iamVjdCkge1xuICBjb25zdCBvYmpTdHJpbmcgPSBKU09OLnN0cmluZ2lmeShvYmosIE9iamVjdC5rZXlzKG9iaikuc29ydCgpKTtcbiAgcmV0dXJuIHNoYTI1NihvYmpTdHJpbmcpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24ganNvblN0cihvYmo6IG9iamVjdCkge1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkob2JqLCBPYmplY3Qua2V5cyhvYmopLnNvcnQoKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZFByb29mKFxuICBsYXN0UHJvb2Y6IG51bWJlcixcbiAgcHJvb2Y6IG51bWJlcixcbiAgbGFzdEhhc2g6IHN0cmluZyxcbiAgYWRkcmVzczogc3RyaW5nXG4pIHtcbiAgY29uc3QgZ3Vlc3MgPSBgJHtsYXN0UHJvb2Z9JHtwcm9vZn0ke2xhc3RIYXNofSR7YWRkcmVzc31gO1xuICBjb25zdCBndWVzc0hhc2ggPSBzaGEyNTYoZ3Vlc3MpO1xuICByZXR1cm4gZGlmZi50ZXN0KGd1ZXNzSGFzaCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZENoYWluKGNoYWluOiBJQmxvY2tbXSkge1xuICBsZXQgaW5kZXggPSAyO1xuICBsZXQgcmVzdWx0ID0gdHJ1ZTtcbiAgd2hpbGUgKGluZGV4IDwgY2hhaW4ubGVuZ3RoKSB7XG4gICAgY29uc3QgbGFzdEJsb2NrID0gY2hhaW5baW5kZXggLSAxXTtcbiAgICBjb25zdCBsYXN0UHJvb2YgPSBsYXN0QmxvY2sucHJvb2Y7XG4gICAgY29uc3QgbGFzdEhhc2ggPSBoYXNoKGxhc3RCbG9jayk7XG4gICAgY29uc3QgYmxvY2sgPSBjaGFpbltpbmRleF07XG4gICAgY29uc3Qgb3duZXIgPSBibG9jay5vd25lcjtcblxuICAgIC8v44OW44Ot44OD44Kv44Gu5oyB44Gk5YmN44Gu44OW44Ot44OD44Kv44Gu44OP44OD44K344Ol5YCk44Go5a6f6Zqb44Gu5YmN44GuXG4gICAgLy/jg5bjg63jg4Pjgq/jga7jg4/jg4Pjgrfjg6XlgKTjgpLmr5TovINcbiAgICBpZiAoYmxvY2sucHJldmlvdXNIYXNoICE9PSBsYXN0SGFzaCkge1xuICAgICAgY29uc29sZS5sb2coXCJibG9ja2NoYWluIGhhc2ggZXJyb3JcIiwgeyBibG9jayB9KTtcbiAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIC8v44OK44Oz44K544Gu5YCk44Gu5qSc6Ki8XG4gICAgaWYgKCF2YWxpZFByb29mKGxhc3RQcm9vZiwgYmxvY2sucHJvb2YsIGxhc3RIYXNoLCBvd25lcikpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiYmxvY2tjaGFpbiBub25jZSBlcnJvclwiLCB7IGJsb2NrIH0pO1xuICAgICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgaW5kZXgrKztcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRCbG9jayhsYXN0QmxvY2s6IElCbG9jaywgYmxvY2s6IElCbG9jayk6IGJvb2xlYW4ge1xuICBjb25zdCBsYXN0UHJvb2YgPSBsYXN0QmxvY2sucHJvb2Y7XG4gIGNvbnN0IGxhc3RIYXNoID0gaGFzaChsYXN0QmxvY2spO1xuICBjb25zdCBvd25lciA9IGJsb2NrLm93bmVyO1xuICBjb25zdCBzaWduID0gYmxvY2suc2lnbjtcbiAgY29uc3QgcHVibGljS2V5ID0gYmxvY2sucHVibGljS2V5O1xuICBibG9jay5zaWduID0gXCJcIjtcblxuICAvL+e9suWQjeOBjOato+OBl+OBhOOBi+OBqeOBhuOBi1xuICBpZiAoXG4gICAgdmVyaWZ5TWVzc2FnZVdpdGhQdWJsaWNLZXkoe1xuICAgICAgbWVzc2FnZTogaGFzaChibG9jayksXG4gICAgICBwdWJsaWNLZXksXG4gICAgICBzaWduYXR1cmU6IHNpZ25cbiAgICB9KVxuICApIHtcbiAgICBibG9jay5zaWduID0gc2lnbjtcbiAgICAvL+ODiuODs+OCueOBjOato+OBl+OBhOOBi+OBqeOBhuOBi1xuICAgIGlmICh2YWxpZFByb29mKGxhc3RQcm9vZiwgYmxvY2sucHJvb2YsIGxhc3RIYXNoLCBvd25lcikpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcImJsb2NrIG5vbmNlIGVycm9yXCIpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmxvZyhcImJsb2NrIHNpZ24gZXJyb3JcIik7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJsb2NrQ2hhaW4ge1xuICBjaGFpbjogSUJsb2NrW10gPSBbXTtcbiAgY3VycmVudFRyYW5zYWN0aW9uczogQXJyYXk8YW55PiA9IFtdO1xuICBjeXBoZXI6IEN5cGhlcjtcbiAgYWRkcmVzczogc3RyaW5nO1xuICBhY2NvdXQ6IEFjY291bnQ7XG5cbiAgY2FsbGJhY2sgPSB7XG4gICAgb25BZGRCbG9jazogKHY/OiBhbnkpID0+IHt9XG4gIH07XG5cbiAgcHJpdmF0ZSBvbkFkZEJsb2NrOiB7IFtrZXk6IHN0cmluZ106ICgpID0+IHZvaWQgfSA9IHt9O1xuICBwcml2YXRlIG9uVHJhbnNhY3Rpb246IHsgW2tleTogc3RyaW5nXTogKCkgPT4gdm9pZCB9ID0ge307XG4gIHByaXZhdGUgb25NYWRlVHJhbnNhY3Rpb246IHtcbiAgICBba2V5OiBzdHJpbmddOiAodHJhbjogSVRyYW5zYWN0aW9uKSA9PiB2b2lkO1xuICB9ID0ge307XG4gIGV2ZW50cyA9IHtcbiAgICBvbkFkZEJsb2NrOiB0aGlzLm9uQWRkQmxvY2ssXG4gICAgb25UcmFuc2FjdGlvbjogdGhpcy5vblRyYW5zYWN0aW9uLFxuICAgIG9uTWFkZVRyYW5zYWN0aW9uOiB0aGlzLm9uTWFkZVRyYW5zYWN0aW9uXG4gIH07XG5cbiAgY29uc3RydWN0b3IocGhyYXNlPzogc3RyaW5nKSB7XG4gICAgdGhpcy5jeXBoZXIgPSBuZXcgQ3lwaGVyKHBocmFzZSk7XG4gICAgdGhpcy5hY2NvdXQgPSBuZXcgQWNjb3VudChwaHJhc2UpO1xuICAgIHRoaXMuYWRkcmVzcyA9IHNoYTI1Nih0aGlzLmN5cGhlci5wdWJLZXkpO1xuICAgIHRoaXMubmV3QmxvY2soMCwgXCJnZW5lc2lzXCIpO1xuICB9XG5cbiAgbmV3QmxvY2socHJvb2Y6IGFueSwgcHJldmlvdXNIYXNoOiBzdHJpbmcpIHtcbiAgICAvL+aOoeaOmOWgsemFrFxuICAgIGNvbnN0IHRyYW4gPSB0aGlzLm5ld1RyYW5zYWN0aW9uKHR5cGUuU1lTVEVNLCB0aGlzLmFkZHJlc3MsIDEsIHtcbiAgICAgIHR5cGU6IEVUcmFuc2FjdGlvblR5cGUudHJhbnNhY3Rpb24sXG4gICAgICBwYXlsb2FkOiBcInJld2FyZFwiXG4gICAgfSk7XG4gICAgdGhpcy5jdXJyZW50VHJhbnNhY3Rpb25zLnB1c2godHJhbik7XG5cbiAgICBjb25zdCBibG9jazogSUJsb2NrID0ge1xuICAgICAgaW5kZXg6IHRoaXMuY2hhaW4ubGVuZ3RoICsgMSwgLy/jg5bjg63jg4Pjgq/jga7nlarlj7dcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSwgLy/jgr/jgqTjg6Djgrnjgr/jg7Pjg5dcbiAgICAgIHRyYW5zYWN0aW9uczogdGhpcy5jdXJyZW50VHJhbnNhY3Rpb25zLCAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OBruWhilxuICAgICAgcHJvb2Y6IHByb29mLCAvL+ODiuODs+OCuVxuICAgICAgcHJldmlvdXNIYXNoOiBwcmV2aW91c0hhc2ggfHwgaGFzaCh0aGlzLmxhc3RCbG9jaygpKSwgLy/liY3jga7jg5bjg63jg4Pjgq/jga7jg4/jg4Pjgrfjg6XlgKRcbiAgICAgIG93bmVyOiB0aGlzLmFkZHJlc3MsIC8v44GT44Gu44OW44Ot44OD44Kv44KS5L2c44Gj44Gf5Lq6XG4gICAgICBwdWJsaWNLZXk6IHRoaXMuY3lwaGVyLnB1YktleSwgLy/jgZPjga7jg5bjg63jg4Pjgq/jgpLkvZzjgaPjgZ/kurrjga7lhazplovpjbVcbiAgICAgIHNpZ246IFwiXCIgLy/jgZPjga7jg5bjg63jg4Pjgq/jgpLkvZzjgaPjgZ/kurrjga7nvbLlkI1cbiAgICB9O1xuICAgIC8v572y5ZCN44KS55Sf5oiQXG4gICAgYmxvY2suc2lnbiA9IHRoaXMuY3lwaGVyLnNpZ25NZXNzYWdlKGhhc2goYmxvY2spKS5zaWduYXR1cmU7XG4gICAgLy/jg5bjg63jg4Pjgq/jg4Hjgqfjg7zjg7Pjgavov73liqBcbiAgICBpZiAoXG4gICAgICB0aGlzLmNoYWluLmxlbmd0aCA+IDAgJiZcbiAgICAgICF2YWxpZEJsb2NrKHRoaXMuY2hhaW5bdGhpcy5jaGFpbi5sZW5ndGggLSAxXSwgYmxvY2spXG4gICAgKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICB0aGlzLmNoYWluLnB1c2goYmxvY2spO1xuXG4gICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7Pjg5fjg7zjg6vjgpLjg6rjgrvjg4Pjg4hcbiAgICB0aGlzLmN1cnJlbnRUcmFuc2FjdGlvbnMgPSBbXTtcbiAgICByZXR1cm4gYmxvY2s7XG4gIH1cblxuICBuZXdUcmFuc2FjdGlvbihcbiAgICBzZW5kZXI6IHN0cmluZyxcbiAgICByZWNpcGllbnQ6IHN0cmluZyxcbiAgICBhbW91bnQ6IG51bWJlcixcbiAgICBkYXRhOiB7IHR5cGU6IEVUcmFuc2FjdGlvblR5cGU7IHBheWxvYWQ6IGFueSB9LFxuICAgIGN5cGhlciA9IHRoaXMuY3lwaGVyXG4gICk6IElUcmFuc2FjdGlvbiB7XG4gICAgY29uc3QgdHJhbjogSVRyYW5zYWN0aW9uID0ge1xuICAgICAgc2VuZGVyOiBzZW5kZXIsIC8v6YCB5L+h44Ki44OJ44Os44K5XG4gICAgICByZWNpcGllbnQ6IHJlY2lwaWVudCwgLy/lj5flj5bjgqLjg4njg6zjgrlcbiAgICAgIGFtb3VudDogYW1vdW50LCAvL+mHj1xuICAgICAgZGF0YSwgLy/ku7vmhI/jga7jg6Hjg4Pjgrvjg7zjgrhcbiAgICAgIG5vdzogRGF0ZS5ub3coKSwgLy/jgr/jgqTjg6Djgrnjgr/jg7Pjg5dcbiAgICAgIHB1YmxpY0tleTogY3lwaGVyLnB1YktleSwgLy/lhazplovpjbUsXG4gICAgICBub25jZTogdGhpcy5nZXROb25jZSgpLFxuICAgICAgc2lnbjogXCJcIiAvL+e9suWQjVxuICAgIH07XG4gICAgdHJhbi5zaWduID0gY3lwaGVyLnNpZ25NZXNzYWdlKGhhc2godHJhbikpLnNpZ25hdHVyZTtcbiAgICAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OCkui/veWKoFxuICAgIC8vdGhpcy5jdXJyZW50VHJhbnNhY3Rpb25zLnB1c2godHJhbik7XG5cbiAgICByZXR1cm4gdHJhbjtcbiAgfVxuXG4gIGxhc3RCbG9jayhibG9ja2NoYWluID0gdGhpcy5jaGFpbik6IElCbG9jayB7XG4gICAgcmV0dXJuIGJsb2NrY2hhaW5bYmxvY2tjaGFpbi5sZW5ndGggLSAxXTtcbiAgfVxuXG4gIGFkZEJsb2NrKGJsb2NrOiBJQmxvY2spIHtcbiAgICBpZiAodmFsaWRCbG9jayh0aGlzLmNoYWluW3RoaXMuY2hhaW4ubGVuZ3RoIC0gMV0sIGJsb2NrKSkge1xuICAgICAgdGhpcy5jdXJyZW50VHJhbnNhY3Rpb25zID0gW107XG4gICAgICB0aGlzLmNoYWluLnB1c2goYmxvY2spO1xuICAgICAgdGhpcy5jYWxsYmFjay5vbkFkZEJsb2NrKCk7XG4gICAgICBleGN1dGVFdmVudCh0aGlzLmV2ZW50cy5vbkFkZEJsb2NrKTtcbiAgICB9XG4gIH1cblxuICB2YWxpZFRyYW5zYWN0aW9uKHRyYW5zYWN0aW9uOiBJVHJhbnNhY3Rpb24pIHtcbiAgICBjb25zdCBhbW91bnQgPSB0cmFuc2FjdGlvbi5hbW91bnQ7XG4gICAgY29uc3Qgc2lnbiA9IHRyYW5zYWN0aW9uLnNpZ247XG5cbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLmN1cnJlbnRUcmFuc2FjdGlvbnMuZmluZChwcmV2ID0+IHtcbiAgICAgIHJldHVybiBwcmV2LnNpZ24gPT09IHNpZ247XG4gICAgfSk7XG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgY29uc29sZS5sb2coXCJkdXBsaWNhdGUgZXJyb3JcIiwgeyByZXN1bHQgfSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgcHVibGljS2V5ID0gdHJhbnNhY3Rpb24ucHVibGljS2V5O1xuICAgIGNvbnN0IGFkZHJlc3MgPSB0cmFuc2FjdGlvbi5zZW5kZXI7XG4gICAgdHJhbnNhY3Rpb24uc2lnbiA9IFwiXCI7XG5cbiAgICAvL+WFrOmWi+mNteOBjOmAgemHkeiAheOBruOCguOBruOBi+OBqeOBhuOBi1xuICAgIGlmIChzaGEyNTYocHVibGljS2V5KSA9PT0gYWRkcmVzcykge1xuICAgICAgLy/nvbLlkI3jgYzmraPjgZfjgYTjgYvjganjgYbjgYtcbiAgICAgIC8v5YWs6ZaL6Y2144Gn572y5ZCN44KS6Kej6Kqt44GX44OI44Op44Oz44K244Kv44K344On44Oz44Gu44OP44OD44K344Ol5YCk44Go5LiA6Ie044GZ44KL44GT44Go44KS56K66KqN44GZ44KL44CCXG4gICAgICBpZiAoXG4gICAgICAgIHZlcmlmeU1lc3NhZ2VXaXRoUHVibGljS2V5KHtcbiAgICAgICAgICBtZXNzYWdlOiBoYXNoKHRyYW5zYWN0aW9uKSxcbiAgICAgICAgICBwdWJsaWNLZXksXG4gICAgICAgICAgc2lnbmF0dXJlOiBzaWduXG4gICAgICAgIH0pXG4gICAgICApIHtcbiAgICAgICAgY29uc3QgYmFsYW5jZSA9IHRoaXMubm93QW1vdW50KGFkZHJlc3MpO1xuICAgICAgICAvL+mAgemHkeWPr+iDveOBqumHkemhjeOCkui2heOBiOOBpuOBhOOCi+OBi+OBqeOBhuOBi1xuICAgICAgICBpZiAoYmFsYW5jZSA+PSBhbW91bnQpIHtcbiAgICAgICAgICAvL+a2iOOBl+OBn+e9suWQjeOCkuaIu+OBmVxuICAgICAgICAgIHRyYW5zYWN0aW9uLnNpZ24gPSBzaWduO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiYmFsYW5jZSBlcnJvclwiLCBhbW91bnQsIGJhbGFuY2UpO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzaWduIGVycm9yXCIpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFwicHVia2V5IGVycm9yXCIpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGFkZFRyYW5zYWN0aW9uKHRyYW46IElUcmFuc2FjdGlvbikge1xuICAgIGlmICh0aGlzLnZhbGlkVHJhbnNhY3Rpb24odHJhbikpIHtcbiAgICAgIC8v44OI44Op44Oz44K244Kv44K344On44Oz44KS6L+95YqgXG4gICAgICB0aGlzLmN1cnJlbnRUcmFuc2FjdGlvbnMucHVzaCh0cmFuKTtcbiAgICAgIGV4Y3V0ZUV2ZW50KHRoaXMuZXZlbnRzLm9uVHJhbnNhY3Rpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcImVycm9yIFRyYW5zYWN0aW9uXCIsIHsgdHJhbiB9KTtcbiAgICB9XG4gIH1cblxuICBwcm9vZk9mV29yaygpIHtcbiAgICBjb25zdCBsYXN0QmxvY2sgPSB0aGlzLmxhc3RCbG9jaygpO1xuICAgIGNvbnN0IGxhc3RQcm9vZiA9IGxhc3RCbG9jay5wcm9vZjtcbiAgICBjb25zdCBsYXN0SGFzaCA9IGhhc2gobGFzdEJsb2NrKTtcblxuICAgIGxldCBwcm9vZiA9IDA7XG5cbiAgICB3aGlsZSAoIXZhbGlkUHJvb2YobGFzdFByb29mLCBwcm9vZiwgbGFzdEhhc2gsIHRoaXMuYWRkcmVzcykpIHtcbiAgICAgIC8v44OK44Oz44K544Gu5YCk44KS6Kmm6KGM6Yyv6Kqk55qE44Gr5o6i44GZXG4gICAgICBwcm9vZisrO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9vZjtcbiAgfVxuXG4gIG5vd0Ftb3VudChhZGRyZXNzID0gdGhpcy5hZGRyZXNzKSB7XG4gICAgbGV0IHRva2VuTnVtID0gbmV3IERlY2ltYWwoMC4wKTtcbiAgICB0aGlzLmNoYWluLmZvckVhY2goYmxvY2sgPT4ge1xuICAgICAgYmxvY2sudHJhbnNhY3Rpb25zLmZvckVhY2goKHRyYW5zYWN0aW9uOiBhbnkpID0+IHtcbiAgICAgICAgaWYgKHRyYW5zYWN0aW9uLnJlY2lwaWVudCA9PT0gYWRkcmVzcykge1xuICAgICAgICAgIHRva2VuTnVtID0gdG9rZW5OdW0ucGx1cyhuZXcgRGVjaW1hbChwYXJzZUZsb2F0KHRyYW5zYWN0aW9uLmFtb3VudCkpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHJhbnNhY3Rpb24uc2VuZGVyID09PSBhZGRyZXNzKSB7XG4gICAgICAgICAgdG9rZW5OdW0gPSB0b2tlbk51bS5taW51cyhcbiAgICAgICAgICAgIG5ldyBEZWNpbWFsKHBhcnNlRmxvYXQodHJhbnNhY3Rpb24uYW1vdW50KSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICB0aGlzLmN1cnJlbnRUcmFuc2FjdGlvbnMuZm9yRWFjaCh0cmFuc2FjdGlvbiA9PiB7XG4gICAgICBpZiAodHJhbnNhY3Rpb24ucmVjaXBpZW50ID09PSBhZGRyZXNzKSB7XG4gICAgICAgIHRva2VuTnVtID0gdG9rZW5OdW0ucGx1cyhuZXcgRGVjaW1hbChwYXJzZUZsb2F0KHRyYW5zYWN0aW9uLmFtb3VudCkpKTtcbiAgICAgIH1cbiAgICAgIGlmICh0cmFuc2FjdGlvbi5zZW5kZXIgPT09IGFkZHJlc3MpIHtcbiAgICAgICAgdG9rZW5OdW0gPSB0b2tlbk51bS5taW51cyhuZXcgRGVjaW1hbChwYXJzZUZsb2F0KHRyYW5zYWN0aW9uLmFtb3VudCkpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gdG9rZW5OdW0udG9OdW1iZXIoKTtcbiAgfVxuXG4gIGdldEFsbFRyYW5zYWN0aW9ucygpIHtcbiAgICBjb25zdCB0cmFuc2FjdGlvbnM6IElUcmFuc2FjdGlvbltdID0gW107XG4gICAgdGhpcy5jaGFpbi5mb3JFYWNoKGJsb2NrID0+IHtcbiAgICAgIGJsb2NrLnRyYW5zYWN0aW9ucy5mb3JFYWNoKCh0cmFuc2FjdGlvbjogSVRyYW5zYWN0aW9uKSA9PiB7XG4gICAgICAgIHRyYW5zYWN0aW9ucy5wdXNoKHRyYW5zYWN0aW9uKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHRoaXMuY3VycmVudFRyYW5zYWN0aW9ucy5mb3JFYWNoKHRyYW5zYWN0aW9uID0+IHtcbiAgICAgIHRyYW5zYWN0aW9ucy5wdXNoKHRyYW5zYWN0aW9uKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdHJhbnNhY3Rpb25zO1xuICB9XG5cbiAgZ2V0Tm9uY2UoYWRkcmVzcyA9IHRoaXMuYWRkcmVzcykge1xuICAgIGxldCBub25jZSA9IDA7XG4gICAgY29uc3QgdHJhbnNhY3Rpb25zID0gdGhpcy5nZXRBbGxUcmFuc2FjdGlvbnMoKTtcbiAgICB0cmFuc2FjdGlvbnMuZm9yRWFjaCh0cmFuc2FjdGlvbiA9PiB7XG4gICAgICBpZiAodHJhbnNhY3Rpb24uc2VuZGVyID09PSBhZGRyZXNzKSB7XG4gICAgICAgIG5vbmNlKys7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG5vbmNlO1xuICB9XG59XG4iXX0=