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
        console.log("validTransaction", {
          tran: tran
        }); //トランザクションを追加

        this.currentTransactions.push(tran);
        (0, _util.excuteEvent)(this.events.onTransaction);
      } else {
        console.log("error Transaction");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL2Jsb2NrY2hhaW4udHMiXSwibmFtZXMiOlsiZGlmZiIsImhhc2giLCJvYmoiLCJvYmpTdHJpbmciLCJKU09OIiwic3RyaW5naWZ5IiwiT2JqZWN0Iiwia2V5cyIsInNvcnQiLCJqc29uU3RyIiwidmFsaWRQcm9vZiIsImxhc3RQcm9vZiIsInByb29mIiwibGFzdEhhc2giLCJhZGRyZXNzIiwiZ3Vlc3MiLCJndWVzc0hhc2giLCJ0ZXN0IiwidmFsaWRDaGFpbiIsImNoYWluIiwiaW5kZXgiLCJyZXN1bHQiLCJsZW5ndGgiLCJsYXN0QmxvY2siLCJibG9jayIsIm93bmVyIiwicHJldmlvdXNIYXNoIiwiY29uc29sZSIsImxvZyIsInZhbGlkQmxvY2siLCJzaWduIiwicHVibGljS2V5IiwibWVzc2FnZSIsInNpZ25hdHVyZSIsIkJsb2NrQ2hhaW4iLCJwaHJhc2UiLCJvbkFkZEJsb2NrIiwidiIsIm9uVHJhbnNhY3Rpb24iLCJjeXBoZXIiLCJDeXBoZXIiLCJwdWJLZXkiLCJuZXdCbG9jayIsIm5ld1RyYW5zYWN0aW9uIiwidHlwZSIsIlNZU1RFTSIsIkVUcmFuc2FjdGlvblR5cGUiLCJ0cmFuc2FjdGlvbiIsInBheWxvYWQiLCJ0aW1lc3RhbXAiLCJEYXRlIiwibm93IiwidHJhbnNhY3Rpb25zIiwiY3VycmVudFRyYW5zYWN0aW9ucyIsInNpZ25NZXNzYWdlIiwidW5kZWZpbmVkIiwicHVzaCIsInNlbmRlciIsInJlY2lwaWVudCIsImFtb3VudCIsImRhdGEiLCJ0cmFuIiwibm9uY2UiLCJnZXROb25jZSIsImJsb2NrY2hhaW4iLCJjYWxsYmFjayIsImV2ZW50cyIsImZpbmQiLCJwcmV2IiwiYmFsYW5jZSIsIm5vd0Ftb3VudCIsInZhbGlkVHJhbnNhY3Rpb24iLCJ0b2tlbk51bSIsIkRlY2ltYWwiLCJmb3JFYWNoIiwicGx1cyIsInBhcnNlRmxvYXQiLCJtaW51cyIsInRvTnVtYmVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7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SixnQkFBSixDQUFZRyxVQUFVLENBQUM3QixXQUFXLENBQUNZLE1BQWIsQ0FBdEIsQ0FBZixDQUFYO0FBQ0Q7QUFDRixPQVBEO0FBUUEsYUFBT2EsUUFBUSxDQUFDTSxRQUFULEVBQVA7QUFDRDs7OytCQUVnQztBQUFBLFVBQXhCaEUsT0FBd0IsdUVBQWQsS0FBS0EsT0FBUztBQUMvQixVQUFJZ0QsS0FBSyxHQUFHLENBQVo7QUFDQSxXQUFLM0MsS0FBTCxDQUFXdUQsT0FBWCxDQUFtQixVQUFBbEQsS0FBSyxFQUFJO0FBQzFCQSxRQUFBQSxLQUFLLENBQUM0QixZQUFOLENBQW1Cc0IsT0FBbkIsQ0FBMkIsVUFBQzNCLFdBQUQsRUFBK0I7QUFDeEQsY0FBSUEsV0FBVyxDQUFDVSxNQUFaLEtBQXVCM0MsT0FBM0IsRUFBb0M7QUFDbENnRCxZQUFBQSxLQUFLO0FBQ047QUFDRixTQUpEO0FBS0QsT0FORDtBQU9BLFdBQUtULG1CQUFMLENBQXlCcUIsT0FBekIsQ0FBaUMsVUFBQTNCLFdBQVcsRUFBSTtBQUM5QyxZQUFJQSxXQUFXLENBQUNXLFNBQVosS0FBMEI1QyxPQUE5QixFQUF1QztBQUNyQ2dELFVBQUFBLEtBQUs7QUFDTjtBQUNGLE9BSkQ7QUFLQSxhQUFPQSxLQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgc2hhMjU2IGZyb20gXCJzaGEyNTZcIjtcbmltcG9ydCB7IERlY2ltYWwgfSBmcm9tIFwiZGVjaW1hbC5qc1wiO1xuaW1wb3J0IEN5cGhlciBmcm9tIFwiLi9jcnlwdG8vY3lwaGVyXCI7XG5pbXBvcnQgdHlwZSBmcm9tIFwiLi90eXBlXCI7XG5pbXBvcnQgeyBFVHJhbnNhY3Rpb25UeXBlIH0gZnJvbSBcIi4vaW50ZXJmYWNlXCI7XG5pbXBvcnQgeyBleGN1dGVFdmVudCB9IGZyb20gXCIuLi91dGlsXCI7XG5pbXBvcnQgeyB2ZXJpZnlNZXNzYWdlV2l0aFB1YmxpY0tleSB9IGZyb20gXCIuL2NyeXB0by9zaWduXCI7XG5cbmNvbnN0IGRpZmYgPSAvXjAwMC87XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUJsb2NrIHtcbiAgaW5kZXg6IG51bWJlcjtcbiAgdGltZXN0YW1wOiBhbnk7XG4gIHRyYW5zYWN0aW9uczogSVRyYW5zYWN0aW9uW107XG4gIHByb29mOiBudW1iZXI7XG4gIHByZXZpb3VzSGFzaDogc3RyaW5nO1xuICBvd25lcjogc3RyaW5nO1xuICBwdWJsaWNLZXk6IHN0cmluZztcbiAgc2lnbjogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElUcmFuc2FjdGlvbkRhdGEge1xuICB0eXBlOiBFVHJhbnNhY3Rpb25UeXBlO1xuICBwYXlsb2FkOiBhbnk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVRyYW5zYWN0aW9uIHtcbiAgc2VuZGVyOiBzdHJpbmc7XG4gIHJlY2lwaWVudDogc3RyaW5nO1xuICBhbW91bnQ6IG51bWJlcjtcbiAgZGF0YTogSVRyYW5zYWN0aW9uRGF0YTtcbiAgbm93OiBhbnk7XG4gIHB1YmxpY0tleTogc3RyaW5nO1xuICBub25jZTogbnVtYmVyO1xuICBzaWduOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNoKG9iajogYW55KSB7XG4gIGNvbnN0IG9ialN0cmluZyA9IEpTT04uc3RyaW5naWZ5KG9iaiwgT2JqZWN0LmtleXMob2JqKS5zb3J0KCkpO1xuICByZXR1cm4gc2hhMjU2KG9ialN0cmluZyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBqc29uU3RyKG9iajogYW55KSB7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShvYmosIE9iamVjdC5rZXlzKG9iaikuc29ydCgpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkUHJvb2YoXG4gIGxhc3RQcm9vZjogbnVtYmVyLFxuICBwcm9vZjogbnVtYmVyLFxuICBsYXN0SGFzaDogc3RyaW5nLFxuICBhZGRyZXNzOiBzdHJpbmdcbikge1xuICBjb25zdCBndWVzcyA9IGAke2xhc3RQcm9vZn0ke3Byb29mfSR7bGFzdEhhc2h9JHthZGRyZXNzfWA7XG4gIGNvbnN0IGd1ZXNzSGFzaCA9IHNoYTI1NihndWVzcyk7XG4gIHJldHVybiBkaWZmLnRlc3QoZ3Vlc3NIYXNoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkQ2hhaW4oY2hhaW46IElCbG9ja1tdKSB7XG4gIGxldCBpbmRleCA9IDI7XG4gIGxldCByZXN1bHQgPSB0cnVlO1xuICB3aGlsZSAoaW5kZXggPCBjaGFpbi5sZW5ndGgpIHtcbiAgICBjb25zdCBsYXN0QmxvY2sgPSBjaGFpbltpbmRleCAtIDFdO1xuICAgIGNvbnN0IGxhc3RQcm9vZiA9IGxhc3RCbG9jay5wcm9vZjtcbiAgICBjb25zdCBsYXN0SGFzaCA9IGhhc2gobGFzdEJsb2NrKTtcbiAgICBjb25zdCBibG9jayA9IGNoYWluW2luZGV4XTtcbiAgICBjb25zdCBvd25lciA9IGJsb2NrLm93bmVyO1xuXG4gICAgLy/jg5bjg63jg4Pjgq/jga7mjIHjgaTliY3jga7jg5bjg63jg4Pjgq/jga7jg4/jg4Pjgrfjg6XlgKTjgajlrp/pmpvjga7liY3jga5cbiAgICAvL+ODluODreODg+OCr+OBruODj+ODg+OCt+ODpeWApOOCkuavlOi8g1xuICAgIGlmIChibG9jay5wcmV2aW91c0hhc2ggIT09IGxhc3RIYXNoKSB7XG4gICAgICBjb25zb2xlLmxvZyhcImJsb2NrY2hhaW4gaGFzaCBlcnJvclwiLCB7IGJsb2NrIH0pO1xuICAgICAgcmVzdWx0ID0gZmFsc2U7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgLy/jg4rjg7Pjgrnjga7lgKTjga7mpJzoqLxcbiAgICBpZiAoIXZhbGlkUHJvb2YobGFzdFByb29mLCBibG9jay5wcm9vZiwgbGFzdEhhc2gsIG93bmVyKSkge1xuICAgICAgY29uc29sZS5sb2coXCJibG9ja2NoYWluIG5vbmNlIGVycm9yXCIsIHsgYmxvY2sgfSk7XG4gICAgICByZXN1bHQgPSBmYWxzZTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpbmRleCsrO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZEJsb2NrKGxhc3RCbG9jazogSUJsb2NrLCBibG9jazogSUJsb2NrKTogYm9vbGVhbiB7XG4gIGNvbnN0IGxhc3RQcm9vZiA9IGxhc3RCbG9jay5wcm9vZjtcbiAgY29uc3QgbGFzdEhhc2ggPSBoYXNoKGxhc3RCbG9jayk7XG4gIGNvbnN0IG93bmVyID0gYmxvY2sub3duZXI7XG4gIGNvbnN0IHNpZ24gPSBibG9jay5zaWduO1xuICBjb25zdCBwdWJsaWNLZXkgPSBibG9jay5wdWJsaWNLZXk7XG4gIGJsb2NrLnNpZ24gPSBcIlwiO1xuXG4gIC8v572y5ZCN44GM5q2j44GX44GE44GL44Gp44GG44GLXG4gIGlmIChcbiAgICB2ZXJpZnlNZXNzYWdlV2l0aFB1YmxpY0tleSh7XG4gICAgICBtZXNzYWdlOiBoYXNoKGJsb2NrKSxcbiAgICAgIHB1YmxpY0tleSxcbiAgICAgIHNpZ25hdHVyZTogc2lnblxuICAgIH0pXG4gICkge1xuICAgIGJsb2NrLnNpZ24gPSBzaWduO1xuICAgIC8v44OK44Oz44K544GM5q2j44GX44GE44GL44Gp44GG44GLXG4gICAgaWYgKHZhbGlkUHJvb2YobGFzdFByb29mLCBibG9jay5wcm9vZiwgbGFzdEhhc2gsIG93bmVyKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiYmxvY2sgbm9uY2UgZXJyb3JcIik7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKFwiYmxvY2sgc2lnbiBlcnJvclwiKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmxvY2tDaGFpbiB7XG4gIGNoYWluOiBJQmxvY2tbXSA9IFtdO1xuICBjdXJyZW50VHJhbnNhY3Rpb25zOiBBcnJheTxhbnk+ID0gW107XG4gIGN5cGhlcjogQ3lwaGVyO1xuICBhZGRyZXNzOiBzdHJpbmc7XG5cbiAgY2FsbGJhY2sgPSB7XG4gICAgb25BZGRCbG9jazogKHY/OiBhbnkpID0+IHt9XG4gIH07XG5cbiAgcHJpdmF0ZSBvbkFkZEJsb2NrOiB7IFtrZXk6IHN0cmluZ106ICgpID0+IHZvaWQgfSA9IHt9O1xuICBwcml2YXRlIG9uVHJhbnNhY3Rpb246IHsgW2tleTogc3RyaW5nXTogKCkgPT4gdm9pZCB9ID0ge307XG4gIGV2ZW50cyA9IHtcbiAgICBvbkFkZEJsb2NrOiB0aGlzLm9uQWRkQmxvY2ssXG4gICAgb25UcmFuc2FjdGlvbjogdGhpcy5vblRyYW5zYWN0aW9uXG4gIH07XG5cbiAgY29uc3RydWN0b3IocGhyYXNlPzogc3RyaW5nKSB7XG4gICAgdGhpcy5jeXBoZXIgPSBuZXcgQ3lwaGVyKHBocmFzZSk7XG4gICAgdGhpcy5hZGRyZXNzID0gc2hhMjU2KHRoaXMuY3lwaGVyLnB1YktleSk7XG4gICAgdGhpcy5uZXdCbG9jaygwLCBcImdlbmVzaXNcIik7XG4gIH1cblxuICBuZXdCbG9jayhwcm9vZjogYW55LCBwcmV2aW91c0hhc2g6IHN0cmluZykge1xuICAgIC8v5o6h5o6Y5aCx6YWsXG4gICAgdGhpcy5uZXdUcmFuc2FjdGlvbih0eXBlLlNZU1RFTSwgdGhpcy5hZGRyZXNzLCAxLCB7XG4gICAgICB0eXBlOiBFVHJhbnNhY3Rpb25UeXBlLnRyYW5zYWN0aW9uLFxuICAgICAgcGF5bG9hZDogXCJyZXdhcmRcIlxuICAgIH0pO1xuXG4gICAgY29uc3QgYmxvY2s6IElCbG9jayA9IHtcbiAgICAgIGluZGV4OiB0aGlzLmNoYWluLmxlbmd0aCArIDEsIC8v44OW44Ot44OD44Kv44Gu55Wq5Y+3XG4gICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksIC8v44K/44Kk44Og44K544K/44Oz44OXXG4gICAgICB0cmFuc2FjdGlvbnM6IHRoaXMuY3VycmVudFRyYW5zYWN0aW9ucywgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7Pjga7loYpcbiAgICAgIHByb29mOiBwcm9vZiwgLy/jg4rjg7PjgrlcbiAgICAgIHByZXZpb3VzSGFzaDogcHJldmlvdXNIYXNoIHx8IGhhc2godGhpcy5sYXN0QmxvY2soKSksIC8v5YmN44Gu44OW44Ot44OD44Kv44Gu44OP44OD44K344Ol5YCkXG4gICAgICBvd25lcjogdGhpcy5hZGRyZXNzLCAvL+OBk+OBruODluODreODg+OCr+OCkuS9nOOBo+OBn+S6ulxuICAgICAgcHVibGljS2V5OiB0aGlzLmN5cGhlci5wdWJLZXksIC8v44GT44Gu44OW44Ot44OD44Kv44KS5L2c44Gj44Gf5Lq644Gu5YWs6ZaL6Y21XG4gICAgICBzaWduOiBcIlwiIC8v44GT44Gu44OW44Ot44OD44Kv44KS5L2c44Gj44Gf5Lq644Gu572y5ZCNXG4gICAgfTtcbiAgICAvL+e9suWQjeOCkueUn+aIkFxuICAgIGJsb2NrLnNpZ24gPSB0aGlzLmN5cGhlci5zaWduTWVzc2FnZShoYXNoKGJsb2NrKSkuc2lnbmF0dXJlO1xuICAgIC8v44OW44Ot44OD44Kv44OB44Kn44O844Oz44Gr6L+95YqgXG4gICAgaWYgKFxuICAgICAgdGhpcy5jaGFpbi5sZW5ndGggPiAwICYmXG4gICAgICAhdmFsaWRCbG9jayh0aGlzLmNoYWluW3RoaXMuY2hhaW4ubGVuZ3RoIC0gMV0sIGJsb2NrKVxuICAgICkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgdGhpcy5jaGFpbi5wdXNoKGJsb2NrKTtcblxuICAgIC8v44OI44Op44Oz44K244Kv44K344On44Oz44OX44O844Or44KS44Oq44K744OD44OIXG4gICAgdGhpcy5jdXJyZW50VHJhbnNhY3Rpb25zID0gW107XG4gICAgY29uc29sZS5sb2coXCJuZXcgYmxvY2sgZG9uZVwiLCB0aGlzLmNoYWluKTtcbiAgICByZXR1cm4gYmxvY2s7XG4gIH1cblxuICBuZXdUcmFuc2FjdGlvbihcbiAgICBzZW5kZXI6IHN0cmluZyxcbiAgICByZWNpcGllbnQ6IHN0cmluZyxcbiAgICBhbW91bnQ6IG51bWJlcixcbiAgICBkYXRhOiB7IHR5cGU6IEVUcmFuc2FjdGlvblR5cGU7IHBheWxvYWQ6IGFueSB9LFxuICAgIGN5cGhlciA9IHRoaXMuY3lwaGVyXG4gICkge1xuICAgIGNvbnN0IHRyYW46IElUcmFuc2FjdGlvbiA9IHtcbiAgICAgIHNlbmRlcjogc2VuZGVyLCAvL+mAgeS/oeOCouODieODrOOCuVxuICAgICAgcmVjaXBpZW50OiByZWNpcGllbnQsIC8v5Y+X5Y+W44Ki44OJ44Os44K5XG4gICAgICBhbW91bnQ6IGFtb3VudCwgLy/ph49cbiAgICAgIGRhdGE6IGRhdGEsIC8v5Lu75oSP44Gu44Oh44OD44K744O844K4XG4gICAgICBub3c6IERhdGUubm93KCksIC8v44K/44Kk44Og44K544K/44Oz44OXXG4gICAgICBwdWJsaWNLZXk6IGN5cGhlci5wdWJLZXksIC8v5YWs6ZaL6Y21LFxuICAgICAgbm9uY2U6IHRoaXMuZ2V0Tm9uY2UoKSxcbiAgICAgIHNpZ246IFwiXCIgLy/nvbLlkI1cbiAgICB9O1xuICAgIHRyYW4uc2lnbiA9IGN5cGhlci5zaWduTWVzc2FnZShoYXNoKHRyYW4pKS5zaWduYXR1cmU7XG4gICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgpLov73liqBcbiAgICB0aGlzLmN1cnJlbnRUcmFuc2FjdGlvbnMucHVzaCh0cmFuKTtcblxuICAgIHJldHVybiB0cmFuO1xuICB9XG5cbiAgbGFzdEJsb2NrKGJsb2NrY2hhaW4gPSB0aGlzLmNoYWluKTogSUJsb2NrIHtcbiAgICByZXR1cm4gYmxvY2tjaGFpbltibG9ja2NoYWluLmxlbmd0aCAtIDFdO1xuICB9XG5cbiAgYWRkQmxvY2soYmxvY2s6IElCbG9jaykge1xuICAgIGlmICh2YWxpZEJsb2NrKHRoaXMuY2hhaW5bdGhpcy5jaGFpbi5sZW5ndGggLSAxXSwgYmxvY2spKSB7XG4gICAgICB0aGlzLmN1cnJlbnRUcmFuc2FjdGlvbnMgPSBbXTtcbiAgICAgIHRoaXMuY2hhaW4ucHVzaChibG9jayk7XG4gICAgICB0aGlzLmNhbGxiYWNrLm9uQWRkQmxvY2soKTtcbiAgICAgIGV4Y3V0ZUV2ZW50KHRoaXMuZXZlbnRzLm9uQWRkQmxvY2spO1xuICAgIH1cbiAgfVxuXG4gIHZhbGlkVHJhbnNhY3Rpb24odHJhbnNhY3Rpb246IElUcmFuc2FjdGlvbikge1xuICAgIGNvbnN0IGFtb3VudCA9IHRyYW5zYWN0aW9uLmFtb3VudDtcbiAgICBjb25zdCBzaWduID0gdHJhbnNhY3Rpb24uc2lnbjtcblxuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuY3VycmVudFRyYW5zYWN0aW9ucy5maW5kKHByZXYgPT4ge1xuICAgICAgcmV0dXJuIHByZXYuc2lnbiA9PT0gc2lnbjtcbiAgICB9KTtcbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICBjb25zb2xlLmxvZyhcImR1cGxpY2F0ZSBlcnJvclwiLCB7IHJlc3VsdCB9KTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBwdWJsaWNLZXkgPSB0cmFuc2FjdGlvbi5wdWJsaWNLZXk7XG4gICAgY29uc3QgYWRkcmVzcyA9IHRyYW5zYWN0aW9uLnNlbmRlcjtcbiAgICB0cmFuc2FjdGlvbi5zaWduID0gXCJcIjtcblxuICAgIC8v5YWs6ZaL6Y2144GM6YCB6YeR6ICF44Gu44KC44Gu44GL44Gp44GG44GLXG4gICAgaWYgKHNoYTI1NihwdWJsaWNLZXkpID09PSBhZGRyZXNzKSB7XG4gICAgICAvL+e9suWQjeOBjOato+OBl+OBhOOBi+OBqeOBhuOBi1xuICAgICAgLy/lhazplovpjbXjgafnvbLlkI3jgpLop6Poqq3jgZfjg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7Pjga7jg4/jg4Pjgrfjg6XlgKTjgajkuIDoh7TjgZnjgovjgZPjgajjgpLnorroqo3jgZnjgovjgIJcbiAgICAgIGlmIChcbiAgICAgICAgdmVyaWZ5TWVzc2FnZVdpdGhQdWJsaWNLZXkoe1xuICAgICAgICAgIG1lc3NhZ2U6IGhhc2godHJhbnNhY3Rpb24pLFxuICAgICAgICAgIHB1YmxpY0tleSxcbiAgICAgICAgICBzaWduYXR1cmU6IHNpZ25cbiAgICAgICAgfSlcbiAgICAgICkge1xuICAgICAgICBjb25zdCBiYWxhbmNlID0gdGhpcy5ub3dBbW91bnQoYWRkcmVzcyk7XG4gICAgICAgIC8v6YCB6YeR5Y+v6IO944Gq6YeR6aGN44KS6LaF44GI44Gm44GE44KL44GL44Gp44GG44GLXG4gICAgICAgIGlmIChiYWxhbmNlID49IGFtb3VudCkge1xuICAgICAgICAgIC8v5raI44GX44Gf572y5ZCN44KS5oi744GZXG4gICAgICAgICAgdHJhbnNhY3Rpb24uc2lnbiA9IHNpZ247XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJiYWxhbmNlIGVycm9yXCIsIGFtb3VudCwgYmFsYW5jZSk7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcInNpZ24gZXJyb3JcIik7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXCJwdWJrZXkgZXJyb3JcIik7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgYWRkVHJhbnNhY3Rpb24odHJhbjogSVRyYW5zYWN0aW9uKSB7XG4gICAgaWYgKHRoaXMudmFsaWRUcmFuc2FjdGlvbih0cmFuKSkge1xuICAgICAgY29uc29sZS5sb2coXCJ2YWxpZFRyYW5zYWN0aW9uXCIsIHsgdHJhbiB9KTtcbiAgICAgIC8v44OI44Op44Oz44K244Kv44K344On44Oz44KS6L+95YqgXG4gICAgICB0aGlzLmN1cnJlbnRUcmFuc2FjdGlvbnMucHVzaCh0cmFuKTtcbiAgICAgIGV4Y3V0ZUV2ZW50KHRoaXMuZXZlbnRzLm9uVHJhbnNhY3Rpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcImVycm9yIFRyYW5zYWN0aW9uXCIpO1xuICAgIH1cbiAgfVxuXG4gIHByb29mT2ZXb3JrKCkge1xuICAgIGNvbnN0IGxhc3RCbG9jayA9IHRoaXMubGFzdEJsb2NrKCk7XG4gICAgY29uc3QgbGFzdFByb29mID0gbGFzdEJsb2NrLnByb29mO1xuICAgIGNvbnN0IGxhc3RIYXNoID0gaGFzaChsYXN0QmxvY2spO1xuXG4gICAgbGV0IHByb29mID0gMDtcblxuICAgIHdoaWxlICghdmFsaWRQcm9vZihsYXN0UHJvb2YsIHByb29mLCBsYXN0SGFzaCwgdGhpcy5hZGRyZXNzKSkge1xuICAgICAgLy/jg4rjg7Pjgrnjga7lgKTjgpLoqabooYzpjK/oqqTnmoTjgavmjqLjgZlcbiAgICAgIHByb29mKys7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb29mO1xuICB9XG5cbiAgbm93QW1vdW50KGFkZHJlc3MgPSB0aGlzLmFkZHJlc3MpIHtcbiAgICBsZXQgdG9rZW5OdW0gPSBuZXcgRGVjaW1hbCgwLjApO1xuICAgIHRoaXMuY2hhaW4uZm9yRWFjaChibG9jayA9PiB7XG4gICAgICBibG9jay50cmFuc2FjdGlvbnMuZm9yRWFjaCgodHJhbnNhY3Rpb246IGFueSkgPT4ge1xuICAgICAgICBpZiAodHJhbnNhY3Rpb24ucmVjaXBpZW50ID09PSBhZGRyZXNzKSB7XG4gICAgICAgICAgdG9rZW5OdW0gPSB0b2tlbk51bS5wbHVzKG5ldyBEZWNpbWFsKHBhcnNlRmxvYXQodHJhbnNhY3Rpb24uYW1vdW50KSkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0cmFuc2FjdGlvbi5zZW5kZXIgPT09IGFkZHJlc3MpIHtcbiAgICAgICAgICB0b2tlbk51bSA9IHRva2VuTnVtLm1pbnVzKFxuICAgICAgICAgICAgbmV3IERlY2ltYWwocGFyc2VGbG9hdCh0cmFuc2FjdGlvbi5hbW91bnQpKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHRoaXMuY3VycmVudFRyYW5zYWN0aW9ucy5mb3JFYWNoKHRyYW5zYWN0aW9uID0+IHtcbiAgICAgIGlmICh0cmFuc2FjdGlvbi5yZWNpcGllbnQgPT09IGFkZHJlc3MpIHtcbiAgICAgICAgdG9rZW5OdW0gPSB0b2tlbk51bS5wbHVzKG5ldyBEZWNpbWFsKHBhcnNlRmxvYXQodHJhbnNhY3Rpb24uYW1vdW50KSkpO1xuICAgICAgfVxuICAgICAgaWYgKHRyYW5zYWN0aW9uLnNlbmRlciA9PT0gYWRkcmVzcykge1xuICAgICAgICB0b2tlbk51bSA9IHRva2VuTnVtLm1pbnVzKG5ldyBEZWNpbWFsKHBhcnNlRmxvYXQodHJhbnNhY3Rpb24uYW1vdW50KSkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB0b2tlbk51bS50b051bWJlcigpO1xuICB9XG5cbiAgZ2V0Tm9uY2UoYWRkcmVzcyA9IHRoaXMuYWRkcmVzcykge1xuICAgIGxldCBub25jZSA9IDA7XG4gICAgdGhpcy5jaGFpbi5mb3JFYWNoKGJsb2NrID0+IHtcbiAgICAgIGJsb2NrLnRyYW5zYWN0aW9ucy5mb3JFYWNoKCh0cmFuc2FjdGlvbjogSVRyYW5zYWN0aW9uKSA9PiB7XG4gICAgICAgIGlmICh0cmFuc2FjdGlvbi5zZW5kZXIgPT09IGFkZHJlc3MpIHtcbiAgICAgICAgICBub25jZSsrO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICB0aGlzLmN1cnJlbnRUcmFuc2FjdGlvbnMuZm9yRWFjaCh0cmFuc2FjdGlvbiA9PiB7XG4gICAgICBpZiAodHJhbnNhY3Rpb24ucmVjaXBpZW50ID09PSBhZGRyZXNzKSB7XG4gICAgICAgIG5vbmNlKys7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG5vbmNlO1xuICB9XG59XG4iXX0=