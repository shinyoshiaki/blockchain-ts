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

    _defineProperty(this, "callback", {
      onAddBlock: function onAddBlock(v) {}
    });

    _defineProperty(this, "onAddBlock", {});

    _defineProperty(this, "onTransaction", {});

    _defineProperty(this, "events", {
      onAddBlock: this.onAddBlock,
      onTransaction: this.onTransaction
    });

    this.cypher = new _cypher.default(phrase);
    this.address = (0, _sha.default)(this.cypher.pubKey);
    this.newBlock(0, "genesis");
  }

  _createClass(BlockChain, [{
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL2Jsb2NrY2hhaW4udHMiXSwibmFtZXMiOlsiZGlmZiIsImhhc2giLCJvYmoiLCJvYmpTdHJpbmciLCJKU09OIiwic3RyaW5naWZ5IiwiT2JqZWN0Iiwia2V5cyIsInNvcnQiLCJqc29uU3RyIiwidmFsaWRQcm9vZiIsImxhc3RQcm9vZiIsInByb29mIiwibGFzdEhhc2giLCJhZGRyZXNzIiwiZ3Vlc3MiLCJndWVzc0hhc2giLCJ0ZXN0IiwidmFsaWRDaGFpbiIsImNoYWluIiwiaW5kZXgiLCJyZXN1bHQiLCJsZW5ndGgiLCJsYXN0QmxvY2siLCJibG9jayIsIm93bmVyIiwicHJldmlvdXNIYXNoIiwiY29uc29sZSIsImxvZyIsInZhbGlkQmxvY2siLCJzaWduIiwicHVibGljS2V5IiwibWVzc2FnZSIsInNpZ25hdHVyZSIsIkJsb2NrQ2hhaW4iLCJwaHJhc2UiLCJvbkFkZEJsb2NrIiwidiIsIm9uVHJhbnNhY3Rpb24iLCJjeXBoZXIiLCJDeXBoZXIiLCJwdWJLZXkiLCJuZXdCbG9jayIsIm5ld1RyYW5zYWN0aW9uIiwidHlwZSIsIlNZU1RFTSIsIkVUcmFuc2FjdGlvblR5cGUiLCJ0cmFuc2FjdGlvbiIsInBheWxvYWQiLCJ0aW1lc3RhbXAiLCJEYXRlIiwibm93IiwidHJhbnNhY3Rpb25zIiwiY3VycmVudFRyYW5zYWN0aW9ucyIsInNpZ25NZXNzYWdlIiwidW5kZWZpbmVkIiwicHVzaCIsInNlbmRlciIsInJlY2lwaWVudCIsImFtb3VudCIsImRhdGEiLCJ0cmFuIiwibm9uY2UiLCJnZXROb25jZSIsImJsb2NrY2hhaW4iLCJjYWxsYmFjayIsImV2ZW50cyIsImZpbmQiLCJwcmV2IiwiYmFsYW5jZSIsIm5vd0Ftb3VudCIsInZhbGlkVHJhbnNhY3Rpb24iLCJ0b2tlbk51bSIsIkRlY2ltYWwiLCJmb3JFYWNoIiwicGx1cyIsInBhcnNlRmxvYXQiLCJtaW51cyIsInRvTnVtYmVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7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O0FBQ0Q7OzsrQkFFZ0M7QUFBQSxVQUF4QmhFLE9BQXdCLHVFQUFkLEtBQUtBLE9BQVM7QUFDL0IsVUFBSWdELEtBQUssR0FBRyxDQUFaO0FBQ0EsV0FBSzNDLEtBQUwsQ0FBV3VELE9BQVgsQ0FBbUIsVUFBQWxELEtBQUssRUFBSTtBQUMxQkEsUUFBQUEsS0FBSyxDQUFDNEIsWUFBTixDQUFtQnNCLE9BQW5CLENBQTJCLFVBQUMzQixXQUFELEVBQStCO0FBQ3hELGNBQUlBLFdBQVcsQ0FBQ1UsTUFBWixLQUF1QjNDLE9BQTNCLEVBQW9DO0FBQ2xDZ0QsWUFBQUEsS0FBSztBQUNOO0FBQ0YsU0FKRDtBQUtELE9BTkQ7QUFPQSxXQUFLVCxtQkFBTCxDQUF5QnFCLE9BQXpCLENBQWlDLFVBQUEzQixXQUFXLEVBQUk7QUFDOUMsWUFBSUEsV0FBVyxDQUFDVyxTQUFaLEtBQTBCNUMsT0FBOUIsRUFBdUM7QUFDckNnRCxVQUFBQSxLQUFLO0FBQ047QUFDRixPQUpEO0FBS0EsYUFBT0EsS0FBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHNoYTI1NiBmcm9tIFwic2hhMjU2XCI7XG5pbXBvcnQgeyBEZWNpbWFsIH0gZnJvbSBcImRlY2ltYWwuanNcIjtcbmltcG9ydCBDeXBoZXIgZnJvbSBcIi4vY3J5cHRvL2N5cGhlclwiO1xuaW1wb3J0IHR5cGUgZnJvbSBcIi4vdHlwZVwiO1xuaW1wb3J0IHsgRVRyYW5zYWN0aW9uVHlwZSB9IGZyb20gXCIuL2ludGVyZmFjZVwiO1xuaW1wb3J0IHsgZXhjdXRlRXZlbnQgfSBmcm9tIFwiLi4vdXRpbFwiO1xuaW1wb3J0IHsgdmVyaWZ5TWVzc2FnZVdpdGhQdWJsaWNLZXkgfSBmcm9tIFwiLi9jcnlwdG8vc2lnblwiO1xuXG5jb25zdCBkaWZmID0gL14wMDAvO1xuXG5leHBvcnQgaW50ZXJmYWNlIElCbG9jayB7XG4gIGluZGV4OiBudW1iZXI7XG4gIHRpbWVzdGFtcDogYW55O1xuICB0cmFuc2FjdGlvbnM6IElUcmFuc2FjdGlvbltdO1xuICBwcm9vZjogbnVtYmVyO1xuICBwcmV2aW91c0hhc2g6IHN0cmluZztcbiAgb3duZXI6IHN0cmluZztcbiAgcHVibGljS2V5OiBzdHJpbmc7XG4gIHNpZ246IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJVHJhbnNhY3Rpb25EYXRhIHtcbiAgdHlwZTogRVRyYW5zYWN0aW9uVHlwZTtcbiAgcGF5bG9hZDogYW55O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElUcmFuc2FjdGlvbiB7XG4gIHNlbmRlcjogc3RyaW5nO1xuICByZWNpcGllbnQ6IHN0cmluZztcbiAgYW1vdW50OiBudW1iZXI7XG4gIGRhdGE6IElUcmFuc2FjdGlvbkRhdGE7XG4gIG5vdzogYW55O1xuICBwdWJsaWNLZXk6IHN0cmluZztcbiAgbm9uY2U6IG51bWJlcjtcbiAgc2lnbjogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzaChvYmo6IG9iamVjdCkge1xuICBjb25zdCBvYmpTdHJpbmcgPSBKU09OLnN0cmluZ2lmeShvYmosIE9iamVjdC5rZXlzKG9iaikuc29ydCgpKTtcbiAgcmV0dXJuIHNoYTI1NihvYmpTdHJpbmcpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24ganNvblN0cihvYmo6IG9iamVjdCkge1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkob2JqLCBPYmplY3Qua2V5cyhvYmopLnNvcnQoKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZFByb29mKFxuICBsYXN0UHJvb2Y6IG51bWJlcixcbiAgcHJvb2Y6IG51bWJlcixcbiAgbGFzdEhhc2g6IHN0cmluZyxcbiAgYWRkcmVzczogc3RyaW5nXG4pIHtcbiAgY29uc3QgZ3Vlc3MgPSBgJHtsYXN0UHJvb2Z9JHtwcm9vZn0ke2xhc3RIYXNofSR7YWRkcmVzc31gO1xuICBjb25zdCBndWVzc0hhc2ggPSBzaGEyNTYoZ3Vlc3MpO1xuICByZXR1cm4gZGlmZi50ZXN0KGd1ZXNzSGFzaCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZENoYWluKGNoYWluOiBJQmxvY2tbXSkge1xuICBsZXQgaW5kZXggPSAyO1xuICBsZXQgcmVzdWx0ID0gdHJ1ZTtcbiAgd2hpbGUgKGluZGV4IDwgY2hhaW4ubGVuZ3RoKSB7XG4gICAgY29uc3QgbGFzdEJsb2NrID0gY2hhaW5baW5kZXggLSAxXTtcbiAgICBjb25zdCBsYXN0UHJvb2YgPSBsYXN0QmxvY2sucHJvb2Y7XG4gICAgY29uc3QgbGFzdEhhc2ggPSBoYXNoKGxhc3RCbG9jayk7XG4gICAgY29uc3QgYmxvY2sgPSBjaGFpbltpbmRleF07XG4gICAgY29uc3Qgb3duZXIgPSBibG9jay5vd25lcjtcblxuICAgIC8v44OW44Ot44OD44Kv44Gu5oyB44Gk5YmN44Gu44OW44Ot44OD44Kv44Gu44OP44OD44K344Ol5YCk44Go5a6f6Zqb44Gu5YmN44GuXG4gICAgLy/jg5bjg63jg4Pjgq/jga7jg4/jg4Pjgrfjg6XlgKTjgpLmr5TovINcbiAgICBpZiAoYmxvY2sucHJldmlvdXNIYXNoICE9PSBsYXN0SGFzaCkge1xuICAgICAgY29uc29sZS5sb2coXCJibG9ja2NoYWluIGhhc2ggZXJyb3JcIiwgeyBibG9jayB9KTtcbiAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIC8v44OK44Oz44K544Gu5YCk44Gu5qSc6Ki8XG4gICAgaWYgKCF2YWxpZFByb29mKGxhc3RQcm9vZiwgYmxvY2sucHJvb2YsIGxhc3RIYXNoLCBvd25lcikpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiYmxvY2tjaGFpbiBub25jZSBlcnJvclwiLCB7IGJsb2NrIH0pO1xuICAgICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgaW5kZXgrKztcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRCbG9jayhsYXN0QmxvY2s6IElCbG9jaywgYmxvY2s6IElCbG9jayk6IGJvb2xlYW4ge1xuICBjb25zdCBsYXN0UHJvb2YgPSBsYXN0QmxvY2sucHJvb2Y7XG4gIGNvbnN0IGxhc3RIYXNoID0gaGFzaChsYXN0QmxvY2spO1xuICBjb25zdCBvd25lciA9IGJsb2NrLm93bmVyO1xuICBjb25zdCBzaWduID0gYmxvY2suc2lnbjtcbiAgY29uc3QgcHVibGljS2V5ID0gYmxvY2sucHVibGljS2V5O1xuICBibG9jay5zaWduID0gXCJcIjtcblxuICAvL+e9suWQjeOBjOato+OBl+OBhOOBi+OBqeOBhuOBi1xuICBpZiAoXG4gICAgdmVyaWZ5TWVzc2FnZVdpdGhQdWJsaWNLZXkoe1xuICAgICAgbWVzc2FnZTogaGFzaChibG9jayksXG4gICAgICBwdWJsaWNLZXksXG4gICAgICBzaWduYXR1cmU6IHNpZ25cbiAgICB9KVxuICApIHtcbiAgICBibG9jay5zaWduID0gc2lnbjtcbiAgICAvL+ODiuODs+OCueOBjOato+OBl+OBhOOBi+OBqeOBhuOBi1xuICAgIGlmICh2YWxpZFByb29mKGxhc3RQcm9vZiwgYmxvY2sucHJvb2YsIGxhc3RIYXNoLCBvd25lcikpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcImJsb2NrIG5vbmNlIGVycm9yXCIpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmxvZyhcImJsb2NrIHNpZ24gZXJyb3JcIik7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJsb2NrQ2hhaW4ge1xuICBjaGFpbjogSUJsb2NrW10gPSBbXTtcbiAgY3VycmVudFRyYW5zYWN0aW9uczogQXJyYXk8YW55PiA9IFtdO1xuICBjeXBoZXI6IEN5cGhlcjtcbiAgYWRkcmVzczogc3RyaW5nO1xuXG4gIGNhbGxiYWNrID0ge1xuICAgIG9uQWRkQmxvY2s6ICh2PzogYW55KSA9PiB7fVxuICB9O1xuXG4gIHByaXZhdGUgb25BZGRCbG9jazogeyBba2V5OiBzdHJpbmddOiAoKSA9PiB2b2lkIH0gPSB7fTtcbiAgcHJpdmF0ZSBvblRyYW5zYWN0aW9uOiB7IFtrZXk6IHN0cmluZ106ICgpID0+IHZvaWQgfSA9IHt9O1xuICBldmVudHMgPSB7XG4gICAgb25BZGRCbG9jazogdGhpcy5vbkFkZEJsb2NrLFxuICAgIG9uVHJhbnNhY3Rpb246IHRoaXMub25UcmFuc2FjdGlvblxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHBocmFzZT86IHN0cmluZykge1xuICAgIHRoaXMuY3lwaGVyID0gbmV3IEN5cGhlcihwaHJhc2UpO1xuICAgIHRoaXMuYWRkcmVzcyA9IHNoYTI1Nih0aGlzLmN5cGhlci5wdWJLZXkpO1xuICAgIHRoaXMubmV3QmxvY2soMCwgXCJnZW5lc2lzXCIpO1xuICB9XG5cbiAgbmV3QmxvY2socHJvb2Y6IGFueSwgcHJldmlvdXNIYXNoOiBzdHJpbmcpIHtcbiAgICAvL+aOoeaOmOWgsemFrFxuICAgIHRoaXMubmV3VHJhbnNhY3Rpb24odHlwZS5TWVNURU0sIHRoaXMuYWRkcmVzcywgMSwge1xuICAgICAgdHlwZTogRVRyYW5zYWN0aW9uVHlwZS50cmFuc2FjdGlvbixcbiAgICAgIHBheWxvYWQ6IFwicmV3YXJkXCJcbiAgICB9KTtcblxuICAgIGNvbnN0IGJsb2NrOiBJQmxvY2sgPSB7XG4gICAgICBpbmRleDogdGhpcy5jaGFpbi5sZW5ndGggKyAxLCAvL+ODluODreODg+OCr+OBrueVquWPt1xuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLCAvL+OCv+OCpOODoOOCueOCv+ODs+ODl1xuICAgICAgdHJhbnNhY3Rpb25zOiB0aGlzLmN1cnJlbnRUcmFuc2FjdGlvbnMsIC8v44OI44Op44Oz44K244Kv44K344On44Oz44Gu5aGKXG4gICAgICBwcm9vZjogcHJvb2YsIC8v44OK44Oz44K5XG4gICAgICBwcmV2aW91c0hhc2g6IHByZXZpb3VzSGFzaCB8fCBoYXNoKHRoaXMubGFzdEJsb2NrKCkpLCAvL+WJjeOBruODluODreODg+OCr+OBruODj+ODg+OCt+ODpeWApFxuICAgICAgb3duZXI6IHRoaXMuYWRkcmVzcywgLy/jgZPjga7jg5bjg63jg4Pjgq/jgpLkvZzjgaPjgZ/kurpcbiAgICAgIHB1YmxpY0tleTogdGhpcy5jeXBoZXIucHViS2V5LCAvL+OBk+OBruODluODreODg+OCr+OCkuS9nOOBo+OBn+S6uuOBruWFrOmWi+mNtVxuICAgICAgc2lnbjogXCJcIiAvL+OBk+OBruODluODreODg+OCr+OCkuS9nOOBo+OBn+S6uuOBrue9suWQjVxuICAgIH07XG4gICAgLy/nvbLlkI3jgpLnlJ/miJBcbiAgICBibG9jay5zaWduID0gdGhpcy5jeXBoZXIuc2lnbk1lc3NhZ2UoaGFzaChibG9jaykpLnNpZ25hdHVyZTtcbiAgICAvL+ODluODreODg+OCr+ODgeOCp+ODvOODs+OBq+i/veWKoFxuICAgIGlmIChcbiAgICAgIHRoaXMuY2hhaW4ubGVuZ3RoID4gMCAmJlxuICAgICAgIXZhbGlkQmxvY2sodGhpcy5jaGFpblt0aGlzLmNoYWluLmxlbmd0aCAtIDFdLCBibG9jaylcbiAgICApIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHRoaXMuY2hhaW4ucHVzaChibG9jayk7XG5cbiAgICAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+ODl+ODvOODq+OCkuODquOCu+ODg+ODiFxuICAgIHRoaXMuY3VycmVudFRyYW5zYWN0aW9ucyA9IFtdO1xuICAgIHJldHVybiBibG9jaztcbiAgfVxuXG4gIG5ld1RyYW5zYWN0aW9uKFxuICAgIHNlbmRlcjogc3RyaW5nLFxuICAgIHJlY2lwaWVudDogc3RyaW5nLFxuICAgIGFtb3VudDogbnVtYmVyLFxuICAgIGRhdGE6IHsgdHlwZTogRVRyYW5zYWN0aW9uVHlwZTsgcGF5bG9hZDogYW55IH0sXG4gICAgY3lwaGVyID0gdGhpcy5jeXBoZXJcbiAgKSB7XG4gICAgY29uc3QgdHJhbjogSVRyYW5zYWN0aW9uID0ge1xuICAgICAgc2VuZGVyOiBzZW5kZXIsIC8v6YCB5L+h44Ki44OJ44Os44K5XG4gICAgICByZWNpcGllbnQ6IHJlY2lwaWVudCwgLy/lj5flj5bjgqLjg4njg6zjgrlcbiAgICAgIGFtb3VudDogYW1vdW50LCAvL+mHj1xuICAgICAgZGF0YTogZGF0YSwgLy/ku7vmhI/jga7jg6Hjg4Pjgrvjg7zjgrhcbiAgICAgIG5vdzogRGF0ZS5ub3coKSwgLy/jgr/jgqTjg6Djgrnjgr/jg7Pjg5dcbiAgICAgIHB1YmxpY0tleTogY3lwaGVyLnB1YktleSwgLy/lhazplovpjbUsXG4gICAgICBub25jZTogdGhpcy5nZXROb25jZSgpLFxuICAgICAgc2lnbjogXCJcIiAvL+e9suWQjVxuICAgIH07XG4gICAgdHJhbi5zaWduID0gY3lwaGVyLnNpZ25NZXNzYWdlKGhhc2godHJhbikpLnNpZ25hdHVyZTtcbiAgICAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OCkui/veWKoFxuICAgIHRoaXMuY3VycmVudFRyYW5zYWN0aW9ucy5wdXNoKHRyYW4pO1xuXG4gICAgcmV0dXJuIHRyYW47XG4gIH1cblxuICBsYXN0QmxvY2soYmxvY2tjaGFpbiA9IHRoaXMuY2hhaW4pOiBJQmxvY2sge1xuICAgIHJldHVybiBibG9ja2NoYWluW2Jsb2NrY2hhaW4ubGVuZ3RoIC0gMV07XG4gIH1cblxuICBhZGRCbG9jayhibG9jazogSUJsb2NrKSB7XG4gICAgaWYgKHZhbGlkQmxvY2sodGhpcy5jaGFpblt0aGlzLmNoYWluLmxlbmd0aCAtIDFdLCBibG9jaykpIHtcbiAgICAgIHRoaXMuY3VycmVudFRyYW5zYWN0aW9ucyA9IFtdO1xuICAgICAgdGhpcy5jaGFpbi5wdXNoKGJsb2NrKTtcbiAgICAgIHRoaXMuY2FsbGJhY2sub25BZGRCbG9jaygpO1xuICAgICAgZXhjdXRlRXZlbnQodGhpcy5ldmVudHMub25BZGRCbG9jayk7XG4gICAgfVxuICB9XG5cbiAgdmFsaWRUcmFuc2FjdGlvbih0cmFuc2FjdGlvbjogSVRyYW5zYWN0aW9uKSB7XG4gICAgY29uc3QgYW1vdW50ID0gdHJhbnNhY3Rpb24uYW1vdW50O1xuICAgIGNvbnN0IHNpZ24gPSB0cmFuc2FjdGlvbi5zaWduO1xuXG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5jdXJyZW50VHJhbnNhY3Rpb25zLmZpbmQocHJldiA9PiB7XG4gICAgICByZXR1cm4gcHJldi5zaWduID09PSBzaWduO1xuICAgIH0pO1xuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZHVwbGljYXRlIGVycm9yXCIsIHsgcmVzdWx0IH0pO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IHB1YmxpY0tleSA9IHRyYW5zYWN0aW9uLnB1YmxpY0tleTtcbiAgICBjb25zdCBhZGRyZXNzID0gdHJhbnNhY3Rpb24uc2VuZGVyO1xuICAgIHRyYW5zYWN0aW9uLnNpZ24gPSBcIlwiO1xuXG4gICAgLy/lhazplovpjbXjgYzpgIHph5HogIXjga7jgoLjga7jgYvjganjgYbjgYtcbiAgICBpZiAoc2hhMjU2KHB1YmxpY0tleSkgPT09IGFkZHJlc3MpIHtcbiAgICAgIC8v572y5ZCN44GM5q2j44GX44GE44GL44Gp44GG44GLXG4gICAgICAvL+WFrOmWi+mNteOBp+e9suWQjeOCkuino+iqreOBl+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OBruODj+ODg+OCt+ODpeWApOOBqOS4gOiHtOOBmeOCi+OBk+OBqOOCkueiuuiqjeOBmeOCi+OAglxuICAgICAgaWYgKFxuICAgICAgICB2ZXJpZnlNZXNzYWdlV2l0aFB1YmxpY0tleSh7XG4gICAgICAgICAgbWVzc2FnZTogaGFzaCh0cmFuc2FjdGlvbiksXG4gICAgICAgICAgcHVibGljS2V5LFxuICAgICAgICAgIHNpZ25hdHVyZTogc2lnblxuICAgICAgICB9KVxuICAgICAgKSB7XG4gICAgICAgIGNvbnN0IGJhbGFuY2UgPSB0aGlzLm5vd0Ftb3VudChhZGRyZXNzKTtcbiAgICAgICAgLy/pgIHph5Hlj6/og73jgarph5HpoY3jgpLotoXjgYjjgabjgYTjgovjgYvjganjgYbjgYtcbiAgICAgICAgaWYgKGJhbGFuY2UgPj0gYW1vdW50KSB7XG4gICAgICAgICAgLy/mtojjgZfjgZ/nvbLlkI3jgpLmiLvjgZlcbiAgICAgICAgICB0cmFuc2FjdGlvbi5zaWduID0gc2lnbjtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImJhbGFuY2UgZXJyb3JcIiwgYW1vdW50LCBiYWxhbmNlKTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic2lnbiBlcnJvclwiKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcInB1YmtleSBlcnJvclwiKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBhZGRUcmFuc2FjdGlvbih0cmFuOiBJVHJhbnNhY3Rpb24pIHtcbiAgICBpZiAodGhpcy52YWxpZFRyYW5zYWN0aW9uKHRyYW4pKSB7XG4gICAgICAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OCkui/veWKoFxuICAgICAgdGhpcy5jdXJyZW50VHJhbnNhY3Rpb25zLnB1c2godHJhbik7XG4gICAgICBleGN1dGVFdmVudCh0aGlzLmV2ZW50cy5vblRyYW5zYWN0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXCJlcnJvciBUcmFuc2FjdGlvblwiLCB7IHRyYW4gfSk7XG4gICAgfVxuICB9XG5cbiAgcHJvb2ZPZldvcmsoKSB7XG4gICAgY29uc3QgbGFzdEJsb2NrID0gdGhpcy5sYXN0QmxvY2soKTtcbiAgICBjb25zdCBsYXN0UHJvb2YgPSBsYXN0QmxvY2sucHJvb2Y7XG4gICAgY29uc3QgbGFzdEhhc2ggPSBoYXNoKGxhc3RCbG9jayk7XG5cbiAgICBsZXQgcHJvb2YgPSAwO1xuXG4gICAgd2hpbGUgKCF2YWxpZFByb29mKGxhc3RQcm9vZiwgcHJvb2YsIGxhc3RIYXNoLCB0aGlzLmFkZHJlc3MpKSB7XG4gICAgICAvL+ODiuODs+OCueOBruWApOOCkuippuihjOmMr+iqpOeahOOBq+aOouOBmVxuICAgICAgcHJvb2YrKztcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvb2Y7XG4gIH1cblxuICBub3dBbW91bnQoYWRkcmVzcyA9IHRoaXMuYWRkcmVzcykge1xuICAgIGxldCB0b2tlbk51bSA9IG5ldyBEZWNpbWFsKDAuMCk7XG4gICAgdGhpcy5jaGFpbi5mb3JFYWNoKGJsb2NrID0+IHtcbiAgICAgIGJsb2NrLnRyYW5zYWN0aW9ucy5mb3JFYWNoKCh0cmFuc2FjdGlvbjogYW55KSA9PiB7XG4gICAgICAgIGlmICh0cmFuc2FjdGlvbi5yZWNpcGllbnQgPT09IGFkZHJlc3MpIHtcbiAgICAgICAgICB0b2tlbk51bSA9IHRva2VuTnVtLnBsdXMobmV3IERlY2ltYWwocGFyc2VGbG9hdCh0cmFuc2FjdGlvbi5hbW91bnQpKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRyYW5zYWN0aW9uLnNlbmRlciA9PT0gYWRkcmVzcykge1xuICAgICAgICAgIHRva2VuTnVtID0gdG9rZW5OdW0ubWludXMoXG4gICAgICAgICAgICBuZXcgRGVjaW1hbChwYXJzZUZsb2F0KHRyYW5zYWN0aW9uLmFtb3VudCkpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgdGhpcy5jdXJyZW50VHJhbnNhY3Rpb25zLmZvckVhY2godHJhbnNhY3Rpb24gPT4ge1xuICAgICAgaWYgKHRyYW5zYWN0aW9uLnJlY2lwaWVudCA9PT0gYWRkcmVzcykge1xuICAgICAgICB0b2tlbk51bSA9IHRva2VuTnVtLnBsdXMobmV3IERlY2ltYWwocGFyc2VGbG9hdCh0cmFuc2FjdGlvbi5hbW91bnQpKSk7XG4gICAgICB9XG4gICAgICBpZiAodHJhbnNhY3Rpb24uc2VuZGVyID09PSBhZGRyZXNzKSB7XG4gICAgICAgIHRva2VuTnVtID0gdG9rZW5OdW0ubWludXMobmV3IERlY2ltYWwocGFyc2VGbG9hdCh0cmFuc2FjdGlvbi5hbW91bnQpKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHRva2VuTnVtLnRvTnVtYmVyKCk7XG4gIH1cblxuICBnZXROb25jZShhZGRyZXNzID0gdGhpcy5hZGRyZXNzKSB7XG4gICAgbGV0IG5vbmNlID0gMDtcbiAgICB0aGlzLmNoYWluLmZvckVhY2goYmxvY2sgPT4ge1xuICAgICAgYmxvY2sudHJhbnNhY3Rpb25zLmZvckVhY2goKHRyYW5zYWN0aW9uOiBJVHJhbnNhY3Rpb24pID0+IHtcbiAgICAgICAgaWYgKHRyYW5zYWN0aW9uLnNlbmRlciA9PT0gYWRkcmVzcykge1xuICAgICAgICAgIG5vbmNlKys7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHRoaXMuY3VycmVudFRyYW5zYWN0aW9ucy5mb3JFYWNoKHRyYW5zYWN0aW9uID0+IHtcbiAgICAgIGlmICh0cmFuc2FjdGlvbi5yZWNpcGllbnQgPT09IGFkZHJlc3MpIHtcbiAgICAgICAgbm9uY2UrKztcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbm9uY2U7XG4gIH1cbn1cbiJdfQ==