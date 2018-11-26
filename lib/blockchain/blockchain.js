"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hash = hash;
exports.jsonStr = jsonStr;
exports.validProof = validProof;
exports.validChain = validChain;
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
  var guessHash = (0, _sha.default)(guess); //先頭から４文字が０なら成功

  return diff.test(guessHash);
}

function validChain(chain) {
  var index = 2;

  while (index < chain.length) {
    var previousBlock = chain[index - 1];
    var block = chain[index]; //ブロックの持つ前のブロックのハッシュ値と実際の前の
    //ブロックのハッシュ値を比較

    if (block.previousHash !== hash(previousBlock)) {
      console.log("blockchain hash error");
      return false;
    } //ナンスの値の検証


    if (!validProof(previousBlock.proof, block.proof, hash(block), block.owner)) {
      console.log("blockchain nonce error");
      return false;
    }

    index++;
  }

  return true;
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
      if (this.validBlock(block)) {
        console.log("validBlock");
        this.currentTransactions = [];
        this.chain.push(block);
        this.callback.onAddBlock();
        (0, _util.excuteEvent)(this.events.onAddBlock);
      }
    }
  }, {
    key: "validBlock",
    value: function validBlock(block) {
      var lastBlock = this.lastBlock();
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
          console.log("block nonce error", this.address, this.chain);
          return false;
        }
      } else {
        console.log("block sign error", this.address);
        return false;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL2Jsb2NrY2hhaW4udHMiXSwibmFtZXMiOlsiZGlmZiIsImhhc2giLCJvYmoiLCJvYmpTdHJpbmciLCJKU09OIiwic3RyaW5naWZ5IiwiT2JqZWN0Iiwia2V5cyIsInNvcnQiLCJqc29uU3RyIiwidmFsaWRQcm9vZiIsImxhc3RQcm9vZiIsInByb29mIiwibGFzdEhhc2giLCJhZGRyZXNzIiwiZ3Vlc3MiLCJndWVzc0hhc2giLCJ0ZXN0IiwidmFsaWRDaGFpbiIsImNoYWluIiwiaW5kZXgiLCJsZW5ndGgiLCJwcmV2aW91c0Jsb2NrIiwiYmxvY2siLCJwcmV2aW91c0hhc2giLCJjb25zb2xlIiwibG9nIiwib3duZXIiLCJCbG9ja0NoYWluIiwicGhyYXNlIiwib25BZGRCbG9jayIsInYiLCJvblRyYW5zYWN0aW9uIiwiY3lwaGVyIiwiQ3lwaGVyIiwicHViS2V5IiwibmV3QmxvY2siLCJuZXdUcmFuc2FjdGlvbiIsInR5cGUiLCJTWVNURU0iLCJFVHJhbnNhY3Rpb25UeXBlIiwidHJhbnNhY3Rpb24iLCJwYXlsb2FkIiwidGltZXN0YW1wIiwiRGF0ZSIsIm5vdyIsInRyYW5zYWN0aW9ucyIsImN1cnJlbnRUcmFuc2FjdGlvbnMiLCJsYXN0QmxvY2siLCJwdWJsaWNLZXkiLCJzaWduIiwic2lnbk1lc3NhZ2UiLCJzaWduYXR1cmUiLCJwdXNoIiwic2VuZGVyIiwicmVjaXBpZW50IiwiYW1vdW50IiwiZGF0YSIsInRyYW4iLCJub25jZSIsImdldE5vbmNlIiwiYmxvY2tjaGFpbiIsInZhbGlkQmxvY2siLCJjYWxsYmFjayIsImV2ZW50cyIsIm1lc3NhZ2UiLCJyZXN1bHQiLCJmaW5kIiwicHJldiIsImJhbGFuY2UiLCJub3dBbW91bnQiLCJ2YWxpZFRyYW5zYWN0aW9uIiwidG9rZW5OdW0iLCJEZWNpbWFsIiwiZm9yRWFjaCIsInBsdXMiLCJwYXJzZUZsb2F0IiwibWludXMiLCJ0b051bWJlciJdLCJtYXBwaW5ncyI6Ijs7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QyxXQUFELEVBQStCO0FBQ3hELGNBQUlBLFdBQVcsQ0FBQ2EsTUFBWixLQUF1QnhDLE9BQTNCLEVBQW9DO0FBQ2xDNkMsWUFBQUEsS0FBSztBQUNOO0FBQ0YsU0FKRDtBQUtELE9BTkQ7QUFPQSxXQUFLWixtQkFBTCxDQUF5QjJCLE9BQXpCLENBQWlDLFVBQUFqQyxXQUFXLEVBQUk7QUFDOUMsWUFBSUEsV0FBVyxDQUFDYyxTQUFaLEtBQTBCekMsT0FBOUIsRUFBdUM7QUFDckM2QyxVQUFBQSxLQUFLO0FBQ047QUFDRixPQUpEO0FBS0EsYUFBT0EsS0FBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHNoYTI1NiBmcm9tIFwic2hhMjU2XCI7XG5pbXBvcnQgeyBEZWNpbWFsIH0gZnJvbSBcImRlY2ltYWwuanNcIjtcbmltcG9ydCBDeXBoZXIgZnJvbSBcIi4vY3J5cHRvL2N5cGhlclwiO1xuaW1wb3J0IHR5cGUgZnJvbSBcIi4vdHlwZVwiO1xuaW1wb3J0IHsgRVRyYW5zYWN0aW9uVHlwZSB9IGZyb20gXCIuL2ludGVyZmFjZVwiO1xuaW1wb3J0IHsgZXhjdXRlRXZlbnQgfSBmcm9tIFwiLi4vdXRpbFwiO1xuaW1wb3J0IHsgdmVyaWZ5TWVzc2FnZVdpdGhQdWJsaWNLZXkgfSBmcm9tIFwiLi9jcnlwdG8vc2lnblwiO1xuXG5jb25zdCBkaWZmID0gL14wMDAvO1xuXG5leHBvcnQgaW50ZXJmYWNlIElCbG9jayB7XG4gIGluZGV4OiBudW1iZXI7XG4gIHRpbWVzdGFtcDogYW55O1xuICB0cmFuc2FjdGlvbnM6IElUcmFuc2FjdGlvbltdO1xuICBwcm9vZjogbnVtYmVyO1xuICBwcmV2aW91c0hhc2g6IHN0cmluZztcbiAgb3duZXI6IHN0cmluZztcbiAgcHVibGljS2V5OiBzdHJpbmc7XG4gIHNpZ246IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJVHJhbnNhY3Rpb25EYXRhIHtcbiAgdHlwZTogRVRyYW5zYWN0aW9uVHlwZTtcbiAgcGF5bG9hZDogYW55O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElUcmFuc2FjdGlvbiB7XG4gIHNlbmRlcjogc3RyaW5nO1xuICByZWNpcGllbnQ6IHN0cmluZztcbiAgYW1vdW50OiBudW1iZXI7XG4gIGRhdGE6IElUcmFuc2FjdGlvbkRhdGE7XG4gIG5vdzogYW55O1xuICBwdWJsaWNLZXk6IHN0cmluZztcbiAgbm9uY2U6IG51bWJlcjtcbiAgc2lnbjogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzaChvYmo6IGFueSkge1xuICBjb25zdCBvYmpTdHJpbmcgPSBKU09OLnN0cmluZ2lmeShvYmosIE9iamVjdC5rZXlzKG9iaikuc29ydCgpKTtcbiAgcmV0dXJuIHNoYTI1NihvYmpTdHJpbmcpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24ganNvblN0cihvYmo6IGFueSkge1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkob2JqLCBPYmplY3Qua2V5cyhvYmopLnNvcnQoKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZFByb29mKFxuICBsYXN0UHJvb2Y6IG51bWJlcixcbiAgcHJvb2Y6IG51bWJlcixcbiAgbGFzdEhhc2g6IHN0cmluZyxcbiAgYWRkcmVzczogc3RyaW5nXG4pIHtcbiAgY29uc3QgZ3Vlc3MgPSBgJHtsYXN0UHJvb2Z9JHtwcm9vZn0ke2xhc3RIYXNofSR7YWRkcmVzc31gO1xuICBjb25zdCBndWVzc0hhc2ggPSBzaGEyNTYoZ3Vlc3MpO1xuICAvL+WFiOmgreOBi+OCie+8lOaWh+Wtl+OBjO+8kOOBquOCieaIkOWKn1xuICByZXR1cm4gZGlmZi50ZXN0KGd1ZXNzSGFzaCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZENoYWluKGNoYWluOiBJQmxvY2tbXSkge1xuICBsZXQgaW5kZXggPSAyO1xuICB3aGlsZSAoaW5kZXggPCBjaGFpbi5sZW5ndGgpIHtcbiAgICBjb25zdCBwcmV2aW91c0Jsb2NrID0gY2hhaW5baW5kZXggLSAxXTtcbiAgICBjb25zdCBibG9jayA9IGNoYWluW2luZGV4XTtcblxuICAgIC8v44OW44Ot44OD44Kv44Gu5oyB44Gk5YmN44Gu44OW44Ot44OD44Kv44Gu44OP44OD44K344Ol5YCk44Go5a6f6Zqb44Gu5YmN44GuXG4gICAgLy/jg5bjg63jg4Pjgq/jga7jg4/jg4Pjgrfjg6XlgKTjgpLmr5TovINcbiAgICBpZiAoYmxvY2sucHJldmlvdXNIYXNoICE9PSBoYXNoKHByZXZpb3VzQmxvY2spKSB7XG4gICAgICBjb25zb2xlLmxvZyhcImJsb2NrY2hhaW4gaGFzaCBlcnJvclwiKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy/jg4rjg7Pjgrnjga7lgKTjga7mpJzoqLxcbiAgICBpZiAoXG4gICAgICAhdmFsaWRQcm9vZihwcmV2aW91c0Jsb2NrLnByb29mLCBibG9jay5wcm9vZiwgaGFzaChibG9jayksIGJsb2NrLm93bmVyKVxuICAgICkge1xuICAgICAgY29uc29sZS5sb2coXCJibG9ja2NoYWluIG5vbmNlIGVycm9yXCIpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpbmRleCsrO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCbG9ja0NoYWluIHtcbiAgY2hhaW46IElCbG9ja1tdID0gW107XG4gIGN1cnJlbnRUcmFuc2FjdGlvbnM6IEFycmF5PGFueT4gPSBbXTtcbiAgY3lwaGVyOiBDeXBoZXI7XG4gIGFkZHJlc3M6IHN0cmluZztcblxuICBjYWxsYmFjayA9IHtcbiAgICBvbkFkZEJsb2NrOiAodj86IGFueSkgPT4ge31cbiAgfTtcblxuICBwcml2YXRlIG9uQWRkQmxvY2s6IHsgW2tleTogc3RyaW5nXTogKCkgPT4gdm9pZCB9ID0ge307XG4gIHByaXZhdGUgb25UcmFuc2FjdGlvbjogeyBba2V5OiBzdHJpbmddOiAoKSA9PiB2b2lkIH0gPSB7fTtcbiAgZXZlbnRzID0ge1xuICAgIG9uQWRkQmxvY2s6IHRoaXMub25BZGRCbG9jayxcbiAgICBvblRyYW5zYWN0aW9uOiB0aGlzLm9uVHJhbnNhY3Rpb25cbiAgfTtcblxuICBjb25zdHJ1Y3RvcihwaHJhc2U/OiBzdHJpbmcpIHtcbiAgICB0aGlzLmN5cGhlciA9IG5ldyBDeXBoZXIocGhyYXNlKTtcbiAgICB0aGlzLmFkZHJlc3MgPSBzaGEyNTYodGhpcy5jeXBoZXIucHViS2V5KTtcbiAgICB0aGlzLm5ld0Jsb2NrKDAsIFwiZ2VuZXNpc1wiKTtcbiAgfVxuXG4gIG5ld0Jsb2NrKHByb29mOiBhbnksIHByZXZpb3VzSGFzaDogc3RyaW5nKSB7XG4gICAgLy/mjqHmjpjloLHphaxcbiAgICB0aGlzLm5ld1RyYW5zYWN0aW9uKHR5cGUuU1lTVEVNLCB0aGlzLmFkZHJlc3MsIDEsIHtcbiAgICAgIHR5cGU6IEVUcmFuc2FjdGlvblR5cGUudHJhbnNhY3Rpb24sXG4gICAgICBwYXlsb2FkOiBcInJld2FyZFwiXG4gICAgfSk7XG5cbiAgICBjb25zdCBibG9jazogSUJsb2NrID0ge1xuICAgICAgaW5kZXg6IHRoaXMuY2hhaW4ubGVuZ3RoICsgMSwgLy/jg5bjg63jg4Pjgq/jga7nlarlj7dcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSwgLy/jgr/jgqTjg6Djgrnjgr/jg7Pjg5dcbiAgICAgIHRyYW5zYWN0aW9uczogdGhpcy5jdXJyZW50VHJhbnNhY3Rpb25zLCAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OBruWhilxuICAgICAgcHJvb2Y6IHByb29mLCAvL+ODiuODs+OCuVxuICAgICAgcHJldmlvdXNIYXNoOiBwcmV2aW91c0hhc2ggfHwgaGFzaCh0aGlzLmxhc3RCbG9jaygpKSwgLy/liY3jga7jg5bjg63jg4Pjgq/jga7jg4/jg4Pjgrfjg6XlgKRcbiAgICAgIG93bmVyOiB0aGlzLmFkZHJlc3MsIC8v44GT44Gu44OW44Ot44OD44Kv44KS5L2c44Gj44Gf5Lq6XG4gICAgICBwdWJsaWNLZXk6IHRoaXMuY3lwaGVyLnB1YktleSwgLy/jgZPjga7jg5bjg63jg4Pjgq/jgpLkvZzjgaPjgZ/kurrjga7lhazplovpjbVcbiAgICAgIHNpZ246IFwiXCIgLy/jgZPjga7jg5bjg63jg4Pjgq/jgpLkvZzjgaPjgZ/kurrjga7nvbLlkI1cbiAgICB9O1xuICAgIC8v572y5ZCN44KS55Sf5oiQXG4gICAgYmxvY2suc2lnbiA9IHRoaXMuY3lwaGVyLnNpZ25NZXNzYWdlKGhhc2goYmxvY2spKS5zaWduYXR1cmU7XG4gICAgLy/jg5bjg63jg4Pjgq/jg4Hjgqfjg7zjg7Pjgavov73liqBcbiAgICB0aGlzLmNoYWluLnB1c2goYmxvY2spO1xuXG4gICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7Pjg5fjg7zjg6vjgpLjg6rjgrvjg4Pjg4hcbiAgICB0aGlzLmN1cnJlbnRUcmFuc2FjdGlvbnMgPSBbXTtcbiAgICBjb25zb2xlLmxvZyhcIm5ldyBibG9jayBkb25lXCIsIHRoaXMuY2hhaW4pO1xuICAgIHJldHVybiBibG9jaztcbiAgfVxuXG4gIG5ld1RyYW5zYWN0aW9uKFxuICAgIHNlbmRlcjogc3RyaW5nLFxuICAgIHJlY2lwaWVudDogc3RyaW5nLFxuICAgIGFtb3VudDogbnVtYmVyLFxuICAgIGRhdGE6IHsgdHlwZTogRVRyYW5zYWN0aW9uVHlwZTsgcGF5bG9hZDogYW55IH0sXG4gICAgY3lwaGVyID0gdGhpcy5jeXBoZXJcbiAgKSB7XG4gICAgY29uc3QgdHJhbjogSVRyYW5zYWN0aW9uID0ge1xuICAgICAgc2VuZGVyOiBzZW5kZXIsIC8v6YCB5L+h44Ki44OJ44Os44K5XG4gICAgICByZWNpcGllbnQ6IHJlY2lwaWVudCwgLy/lj5flj5bjgqLjg4njg6zjgrlcbiAgICAgIGFtb3VudDogYW1vdW50LCAvL+mHj1xuICAgICAgZGF0YTogZGF0YSwgLy/ku7vmhI/jga7jg6Hjg4Pjgrvjg7zjgrhcbiAgICAgIG5vdzogRGF0ZS5ub3coKSwgLy/jgr/jgqTjg6Djgrnjgr/jg7Pjg5dcbiAgICAgIHB1YmxpY0tleTogY3lwaGVyLnB1YktleSwgLy/lhazplovpjbUsXG4gICAgICBub25jZTogdGhpcy5nZXROb25jZSgpLFxuICAgICAgc2lnbjogXCJcIiAvL+e9suWQjVxuICAgIH07XG4gICAgdHJhbi5zaWduID0gY3lwaGVyLnNpZ25NZXNzYWdlKGhhc2godHJhbikpLnNpZ25hdHVyZTtcbiAgICAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OCkui/veWKoFxuICAgIHRoaXMuY3VycmVudFRyYW5zYWN0aW9ucy5wdXNoKHRyYW4pO1xuXG4gICAgcmV0dXJuIHRyYW47XG4gIH1cblxuICBsYXN0QmxvY2soYmxvY2tjaGFpbiA9IHRoaXMuY2hhaW4pOiBJQmxvY2sge1xuICAgIHJldHVybiBibG9ja2NoYWluW2Jsb2NrY2hhaW4ubGVuZ3RoIC0gMV07XG4gIH1cblxuICBhZGRCbG9jayhibG9jazogSUJsb2NrKSB7XG4gICAgaWYgKHRoaXMudmFsaWRCbG9jayhibG9jaykpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwidmFsaWRCbG9ja1wiKTtcbiAgICAgIHRoaXMuY3VycmVudFRyYW5zYWN0aW9ucyA9IFtdO1xuICAgICAgdGhpcy5jaGFpbi5wdXNoKGJsb2NrKTtcblxuICAgICAgdGhpcy5jYWxsYmFjay5vbkFkZEJsb2NrKCk7XG4gICAgICBleGN1dGVFdmVudCh0aGlzLmV2ZW50cy5vbkFkZEJsb2NrKTtcbiAgICB9XG4gIH1cblxuICB2YWxpZEJsb2NrKGJsb2NrOiBJQmxvY2spIHtcbiAgICBjb25zdCBsYXN0QmxvY2sgPSB0aGlzLmxhc3RCbG9jaygpO1xuICAgIGNvbnN0IGxhc3RQcm9vZiA9IGxhc3RCbG9jay5wcm9vZjtcbiAgICBjb25zdCBsYXN0SGFzaCA9IGhhc2gobGFzdEJsb2NrKTtcbiAgICBjb25zdCBvd25lciA9IGJsb2NrLm93bmVyO1xuICAgIGNvbnN0IHNpZ24gPSBibG9jay5zaWduO1xuICAgIGNvbnN0IHB1YmxpY0tleSA9IGJsb2NrLnB1YmxpY0tleTtcbiAgICBibG9jay5zaWduID0gXCJcIjtcblxuICAgIC8v572y5ZCN44GM5q2j44GX44GE44GL44Gp44GG44GLXG4gICAgaWYgKFxuICAgICAgdmVyaWZ5TWVzc2FnZVdpdGhQdWJsaWNLZXkoe1xuICAgICAgICBtZXNzYWdlOiBoYXNoKGJsb2NrKSxcbiAgICAgICAgcHVibGljS2V5LFxuICAgICAgICBzaWduYXR1cmU6IHNpZ25cbiAgICAgIH0pXG4gICAgKSB7XG4gICAgICBibG9jay5zaWduID0gc2lnbjtcbiAgICAgIC8v44OK44Oz44K544GM5q2j44GX44GE44GL44Gp44GG44GLXG4gICAgICBpZiAodmFsaWRQcm9vZihsYXN0UHJvb2YsIGJsb2NrLnByb29mLCBsYXN0SGFzaCwgb3duZXIpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJibG9jayBub25jZSBlcnJvclwiLCB0aGlzLmFkZHJlc3MsIHRoaXMuY2hhaW4pO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiYmxvY2sgc2lnbiBlcnJvclwiLCB0aGlzLmFkZHJlc3MpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHZhbGlkVHJhbnNhY3Rpb24odHJhbnNhY3Rpb246IElUcmFuc2FjdGlvbikge1xuICAgIGNvbnN0IGFtb3VudCA9IHRyYW5zYWN0aW9uLmFtb3VudDtcbiAgICBjb25zdCBzaWduID0gdHJhbnNhY3Rpb24uc2lnbjtcblxuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuY3VycmVudFRyYW5zYWN0aW9ucy5maW5kKHByZXYgPT4ge1xuICAgICAgcmV0dXJuIHByZXYuc2lnbiA9PT0gc2lnbjtcbiAgICB9KTtcbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICBjb25zb2xlLmxvZyhcImR1cGxpY2F0ZSBlcnJvclwiLCB7IHJlc3VsdCB9KTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBwdWJsaWNLZXkgPSB0cmFuc2FjdGlvbi5wdWJsaWNLZXk7XG4gICAgY29uc3QgYWRkcmVzcyA9IHRyYW5zYWN0aW9uLnNlbmRlcjtcbiAgICB0cmFuc2FjdGlvbi5zaWduID0gXCJcIjtcblxuICAgIC8v5YWs6ZaL6Y2144GM6YCB6YeR6ICF44Gu44KC44Gu44GL44Gp44GG44GLXG4gICAgaWYgKHNoYTI1NihwdWJsaWNLZXkpID09PSBhZGRyZXNzKSB7XG4gICAgICAvL+e9suWQjeOBjOato+OBl+OBhOOBi+OBqeOBhuOBi1xuICAgICAgLy/lhazplovpjbXjgafnvbLlkI3jgpLop6Poqq3jgZfjg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7Pjga7jg4/jg4Pjgrfjg6XlgKTjgajkuIDoh7TjgZnjgovjgZPjgajjgpLnorroqo3jgZnjgovjgIJcbiAgICAgIGlmIChcbiAgICAgICAgdmVyaWZ5TWVzc2FnZVdpdGhQdWJsaWNLZXkoe1xuICAgICAgICAgIG1lc3NhZ2U6IGhhc2godHJhbnNhY3Rpb24pLFxuICAgICAgICAgIHB1YmxpY0tleSxcbiAgICAgICAgICBzaWduYXR1cmU6IHNpZ25cbiAgICAgICAgfSlcbiAgICAgICkge1xuICAgICAgICBjb25zdCBiYWxhbmNlID0gdGhpcy5ub3dBbW91bnQoYWRkcmVzcyk7XG4gICAgICAgIC8v6YCB6YeR5Y+v6IO944Gq6YeR6aGN44KS6LaF44GI44Gm44GE44KL44GL44Gp44GG44GLXG4gICAgICAgIGlmIChiYWxhbmNlID49IGFtb3VudCkge1xuICAgICAgICAgIC8v5raI44GX44Gf572y5ZCN44KS5oi744GZXG4gICAgICAgICAgdHJhbnNhY3Rpb24uc2lnbiA9IHNpZ247XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJiYWxhbmNlIGVycm9yXCIsIGFtb3VudCwgYmFsYW5jZSk7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcInNpZ24gZXJyb3JcIik7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXCJwdWJrZXkgZXJyb3JcIik7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgYWRkVHJhbnNhY3Rpb24odHJhbjogSVRyYW5zYWN0aW9uKSB7XG4gICAgaWYgKHRoaXMudmFsaWRUcmFuc2FjdGlvbih0cmFuKSkge1xuICAgICAgY29uc29sZS5sb2coXCJ2YWxpZFRyYW5zYWN0aW9uXCIsIHsgdHJhbiB9KTtcbiAgICAgIC8v44OI44Op44Oz44K244Kv44K344On44Oz44KS6L+95YqgXG4gICAgICB0aGlzLmN1cnJlbnRUcmFuc2FjdGlvbnMucHVzaCh0cmFuKTtcbiAgICAgIGV4Y3V0ZUV2ZW50KHRoaXMuZXZlbnRzLm9uVHJhbnNhY3Rpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcImVycm9yIFRyYW5zYWN0aW9uXCIpO1xuICAgIH1cbiAgfVxuXG4gIHByb29mT2ZXb3JrKCkge1xuICAgIGNvbnN0IGxhc3RCbG9jayA9IHRoaXMubGFzdEJsb2NrKCk7XG4gICAgY29uc3QgbGFzdFByb29mID0gbGFzdEJsb2NrLnByb29mO1xuICAgIGNvbnN0IGxhc3RIYXNoID0gaGFzaChsYXN0QmxvY2spO1xuXG4gICAgbGV0IHByb29mID0gMDtcblxuICAgIHdoaWxlICghdmFsaWRQcm9vZihsYXN0UHJvb2YsIHByb29mLCBsYXN0SGFzaCwgdGhpcy5hZGRyZXNzKSkge1xuICAgICAgLy/jg4rjg7Pjgrnjga7lgKTjgpLoqabooYzpjK/oqqTnmoTjgavmjqLjgZlcbiAgICAgIHByb29mKys7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb29mO1xuICB9XG5cbiAgbm93QW1vdW50KGFkZHJlc3MgPSB0aGlzLmFkZHJlc3MpIHtcbiAgICBsZXQgdG9rZW5OdW0gPSBuZXcgRGVjaW1hbCgwLjApO1xuICAgIHRoaXMuY2hhaW4uZm9yRWFjaChibG9jayA9PiB7XG4gICAgICBibG9jay50cmFuc2FjdGlvbnMuZm9yRWFjaCgodHJhbnNhY3Rpb246IGFueSkgPT4ge1xuICAgICAgICBpZiAodHJhbnNhY3Rpb24ucmVjaXBpZW50ID09PSBhZGRyZXNzKSB7XG4gICAgICAgICAgdG9rZW5OdW0gPSB0b2tlbk51bS5wbHVzKG5ldyBEZWNpbWFsKHBhcnNlRmxvYXQodHJhbnNhY3Rpb24uYW1vdW50KSkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0cmFuc2FjdGlvbi5zZW5kZXIgPT09IGFkZHJlc3MpIHtcbiAgICAgICAgICB0b2tlbk51bSA9IHRva2VuTnVtLm1pbnVzKFxuICAgICAgICAgICAgbmV3IERlY2ltYWwocGFyc2VGbG9hdCh0cmFuc2FjdGlvbi5hbW91bnQpKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHRoaXMuY3VycmVudFRyYW5zYWN0aW9ucy5mb3JFYWNoKHRyYW5zYWN0aW9uID0+IHtcbiAgICAgIGlmICh0cmFuc2FjdGlvbi5yZWNpcGllbnQgPT09IGFkZHJlc3MpIHtcbiAgICAgICAgdG9rZW5OdW0gPSB0b2tlbk51bS5wbHVzKG5ldyBEZWNpbWFsKHBhcnNlRmxvYXQodHJhbnNhY3Rpb24uYW1vdW50KSkpO1xuICAgICAgfVxuICAgICAgaWYgKHRyYW5zYWN0aW9uLnNlbmRlciA9PT0gYWRkcmVzcykge1xuICAgICAgICB0b2tlbk51bSA9IHRva2VuTnVtLm1pbnVzKG5ldyBEZWNpbWFsKHBhcnNlRmxvYXQodHJhbnNhY3Rpb24uYW1vdW50KSkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB0b2tlbk51bS50b051bWJlcigpO1xuICB9XG5cbiAgZ2V0Tm9uY2UoYWRkcmVzcyA9IHRoaXMuYWRkcmVzcykge1xuICAgIGxldCBub25jZSA9IDA7XG4gICAgdGhpcy5jaGFpbi5mb3JFYWNoKGJsb2NrID0+IHtcbiAgICAgIGJsb2NrLnRyYW5zYWN0aW9ucy5mb3JFYWNoKCh0cmFuc2FjdGlvbjogSVRyYW5zYWN0aW9uKSA9PiB7XG4gICAgICAgIGlmICh0cmFuc2FjdGlvbi5zZW5kZXIgPT09IGFkZHJlc3MpIHtcbiAgICAgICAgICBub25jZSsrO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICB0aGlzLmN1cnJlbnRUcmFuc2FjdGlvbnMuZm9yRWFjaCh0cmFuc2FjdGlvbiA9PiB7XG4gICAgICBpZiAodHJhbnNhY3Rpb24ucmVjaXBpZW50ID09PSBhZGRyZXNzKSB7XG4gICAgICAgIG5vbmNlKys7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG5vbmNlO1xuICB9XG59XG4iXX0=