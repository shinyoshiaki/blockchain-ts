"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _sha = _interopRequireDefault(require("sha256"));

var _decimal = require("decimal.js");

var _cypher = _interopRequireDefault(require("./crypto/cypher"));

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

      block.sign = this.cypher.signMessage(this.hash(block)).signature; //ブロックチェーンに追加

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
      tran.sign = cypher.signMessage(this.hash(tran)).signature; //トランザクションを追加

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

      if (this.cypher.verifyMessage({
        message: this.hash(block),
        publicKey: publicKey,
        signature: sign
      })) {
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
        if (this.cypher.verifyMessage({
          message: this.hash(transaction),
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL2Jsb2NrY2hhaW4udHMiXSwibmFtZXMiOlsiZGlmZiIsIkJsb2NrQ2hhaW4iLCJwaHJhc2UiLCJvbkFkZEJsb2NrIiwidiIsIm9uVHJhbnNhY3Rpb24iLCJjeXBoZXIiLCJDeXBoZXIiLCJhZGRyZXNzIiwicHViS2V5IiwibmV3QmxvY2siLCJvYmoiLCJvYmpTdHJpbmciLCJKU09OIiwic3RyaW5naWZ5IiwiT2JqZWN0Iiwia2V5cyIsInNvcnQiLCJwcm9vZiIsInByZXZpb3VzSGFzaCIsIm5ld1RyYW5zYWN0aW9uIiwidHlwZSIsIlNZU1RFTSIsIkVUcmFuc2FjdGlvblR5cGUiLCJ0cmFuc2FjdGlvbiIsInBheWxvYWQiLCJibG9jayIsImluZGV4IiwiY2hhaW4iLCJsZW5ndGgiLCJ0aW1lc3RhbXAiLCJEYXRlIiwibm93IiwidHJhbnNhY3Rpb25zIiwiY3VycmVudFRyYW5zYWN0aW9ucyIsImhhc2giLCJsYXN0QmxvY2siLCJvd25lciIsInB1YmxpY0tleSIsInNpZ24iLCJzaWduTWVzc2FnZSIsInNpZ25hdHVyZSIsInB1c2giLCJjb25zb2xlIiwibG9nIiwic2VuZGVyIiwicmVjaXBpZW50IiwiYW1vdW50IiwiZGF0YSIsInRyYW4iLCJub25jZSIsImdldE5vbmNlIiwiYmxvY2tjaGFpbiIsInZhbGlkQmxvY2siLCJjYWxsYmFjayIsImV4Y3V0ZUV2ZW50IiwiZXZlbnRzIiwiZXYiLCJmb3JFYWNoIiwia2V5IiwibGFzdFByb29mIiwibGFzdEhhc2giLCJ2ZXJpZnlNZXNzYWdlIiwibWVzc2FnZSIsInZhbGlkUHJvb2YiLCJndWVzcyIsImd1ZXNzSGFzaCIsInRlc3QiLCJwcmV2aW91c0Jsb2NrIiwicmVzdWx0IiwiZmluZCIsInByZXYiLCJiYWxhbmNlIiwibm93QW1vdW50IiwidmFsaWRUcmFuc2FjdGlvbiIsInRva2VuTnVtIiwiRGVjaW1hbCIsInBsdXMiLCJwYXJzZUZsb2F0IiwibWludXMiLCJ0b051bWJl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QVQsRUFBUDtBQUNEOzs7K0JBRWdDO0FBQUEsVUFBeEJ4RSxPQUF3Qix1RUFBZCxLQUFLQSxPQUFTO0FBQy9CLFVBQUkwQyxLQUFLLEdBQUcsQ0FBWjtBQUNBLFdBQUt0QixLQUFMLENBQVc4QixPQUFYLENBQW1CLFVBQUFoQyxLQUFLLEVBQUk7QUFDMUJBLFFBQUFBLEtBQUssQ0FBQ08sWUFBTixDQUFtQnlCLE9BQW5CLENBQTJCLFVBQUNsQyxXQUFELEVBQStCO0FBQ3hELGNBQUlBLFdBQVcsQ0FBQ3FCLE1BQVosS0FBdUJyQyxPQUEzQixFQUFvQztBQUNsQzBDLFlBQUFBLEtBQUs7QUFDTjtBQUNGLFNBSkQ7QUFLRCxPQU5EO0FBT0EsV0FBS2hCLG1CQUFMLENBQXlCd0IsT0FBekIsQ0FBaUMsVUFBQWxDLFdBQVcsRUFBSTtBQUM5QyxZQUFJQSxXQUFXLENBQUNzQixTQUFaLEtBQTBCdEMsT0FBOUIsRUFBdUM7QUFDckMwQyxVQUFBQSxLQUFLO0FBQ047QUFDRixPQUpEO0FBS0EsYUFBT0EsS0FBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHNoYTI1NiBmcm9tIFwic2hhMjU2XCI7XG5pbXBvcnQgeyBEZWNpbWFsIH0gZnJvbSBcImRlY2ltYWwuanNcIjtcbmltcG9ydCBDeXBoZXIgZnJvbSBcIi4vY3J5cHRvL2N5cGhlclwiO1xuaW1wb3J0IHR5cGUgZnJvbSBcIi4vdHlwZVwiO1xuaW1wb3J0IHsgRVRyYW5zYWN0aW9uVHlwZSB9IGZyb20gXCIuL2ludGVyZmFjZVwiO1xuXG5jb25zdCBkaWZmID0gL14wMDAvO1xuXG5leHBvcnQgaW50ZXJmYWNlIElUcmFuc2FjdGlvbkRhdGEge1xuICB0eXBlOiBFVHJhbnNhY3Rpb25UeXBlO1xuICBwYXlsb2FkOiBhbnk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVRyYW5zYWN0aW9uIHtcbiAgc2VuZGVyOiBzdHJpbmc7XG4gIHJlY2lwaWVudDogc3RyaW5nO1xuICBhbW91bnQ6IG51bWJlcjtcbiAgZGF0YTogSVRyYW5zYWN0aW9uRGF0YTtcbiAgbm93OiBhbnk7XG4gIHB1YmxpY0tleTogc3RyaW5nO1xuICBub25jZTogbnVtYmVyO1xuICBzaWduOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJsb2NrQ2hhaW4ge1xuICBjaGFpbjogQXJyYXk8YW55PiA9IFtdO1xuICBjdXJyZW50VHJhbnNhY3Rpb25zOiBBcnJheTxhbnk+ID0gW107XG4gIGN5cGhlcjogQ3lwaGVyO1xuICBhZGRyZXNzOiBzdHJpbmc7XG5cbiAgY2FsbGJhY2sgPSB7XG4gICAgb25BZGRCbG9jazogKHY/OiBhbnkpID0+IHt9XG4gIH07XG5cbiAgcHJpdmF0ZSBvbkFkZEJsb2NrOiB7IFtrZXk6IHN0cmluZ106ICgpID0+IHZvaWQgfSA9IHt9O1xuICBwcml2YXRlIG9uVHJhbnNhY3Rpb246IHsgW2tleTogc3RyaW5nXTogKCkgPT4gdm9pZCB9ID0ge307XG4gIGV2ZW50cyA9IHtcbiAgICBvbkFkZEJsb2NrOiB0aGlzLm9uQWRkQmxvY2ssXG4gICAgb25UcmFuc2FjdGlvbjogdGhpcy5vblRyYW5zYWN0aW9uXG4gIH07XG5cbiAgY29uc3RydWN0b3IocGhyYXNlPzogc3RyaW5nKSB7XG4gICAgdGhpcy5jeXBoZXIgPSBuZXcgQ3lwaGVyKHBocmFzZSk7XG4gICAgdGhpcy5hZGRyZXNzID0gc2hhMjU2KHRoaXMuY3lwaGVyLnB1YktleSk7XG4gICAgdGhpcy5uZXdCbG9jaygwLCBcImdlbmVzaXNcIik7XG4gIH1cblxuICBoYXNoKG9iajogYW55KSB7XG4gICAgY29uc3Qgb2JqU3RyaW5nID0gSlNPTi5zdHJpbmdpZnkob2JqLCBPYmplY3Qua2V5cyhvYmopLnNvcnQoKSk7XG4gICAgcmV0dXJuIHNoYTI1NihvYmpTdHJpbmcpO1xuICB9XG5cbiAganNvblN0cihvYmo6IGFueSkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShvYmosIE9iamVjdC5rZXlzKG9iaikuc29ydCgpKTtcbiAgfVxuXG4gIG5ld0Jsb2NrKHByb29mOiBhbnksIHByZXZpb3VzSGFzaDogc3RyaW5nKSB7XG4gICAgLy/mjqHmjpjloLHphaxcbiAgICB0aGlzLm5ld1RyYW5zYWN0aW9uKHR5cGUuU1lTVEVNLCB0aGlzLmFkZHJlc3MsIDEsIHtcbiAgICAgIHR5cGU6IEVUcmFuc2FjdGlvblR5cGUudHJhbnNhY3Rpb24sXG4gICAgICBwYXlsb2FkOiBcInJld2FyZFwiXG4gICAgfSk7XG5cbiAgICBjb25zdCBibG9jayA9IHtcbiAgICAgIGluZGV4OiB0aGlzLmNoYWluLmxlbmd0aCArIDEsIC8v44OW44Ot44OD44Kv44Gu55Wq5Y+3XG4gICAgICB0aW1lc3RhbXA6IERhdGUubm93KCksIC8v44K/44Kk44Og44K544K/44Oz44OXXG4gICAgICB0cmFuc2FjdGlvbnM6IHRoaXMuY3VycmVudFRyYW5zYWN0aW9ucywgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7Pjga7loYpcbiAgICAgIHByb29mOiBwcm9vZiwgLy/jg4rjg7PjgrlcbiAgICAgIHByZXZpb3VzSGFzaDogcHJldmlvdXNIYXNoIHx8IHRoaXMuaGFzaCh0aGlzLmxhc3RCbG9jaygpKSwgLy/liY3jga7jg5bjg63jg4Pjgq/jga7jg4/jg4Pjgrfjg6XlgKRcbiAgICAgIG93bmVyOiB0aGlzLmFkZHJlc3MsIC8v44GT44Gu44OW44Ot44OD44Kv44KS5L2c44Gj44Gf5Lq6XG4gICAgICBwdWJsaWNLZXk6IHRoaXMuY3lwaGVyLnB1YktleSwgLy/jgZPjga7jg5bjg63jg4Pjgq/jgpLkvZzjgaPjgZ/kurrjga7lhazplovpjbVcbiAgICAgIHNpZ246IFwiXCIgLy/jgZPjga7jg5bjg63jg4Pjgq/jgpLkvZzjgaPjgZ/kurrjga7nvbLlkI1cbiAgICB9O1xuICAgIC8v572y5ZCN44KS55Sf5oiQXG4gICAgYmxvY2suc2lnbiA9IHRoaXMuY3lwaGVyLnNpZ25NZXNzYWdlKHRoaXMuaGFzaChibG9jaykpLnNpZ25hdHVyZTtcbiAgICAvL+ODluODreODg+OCr+ODgeOCp+ODvOODs+OBq+i/veWKoFxuICAgIHRoaXMuY2hhaW4ucHVzaChibG9jayk7XG5cbiAgICAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+ODl+ODvOODq+OCkuODquOCu+ODg+ODiFxuICAgIHRoaXMuY3VycmVudFRyYW5zYWN0aW9ucyA9IFtdO1xuICAgIGNvbnNvbGUubG9nKFwibmV3IGJsb2NrIGRvbmVcIiwgdGhpcy5jaGFpbik7XG4gICAgcmV0dXJuIGJsb2NrO1xuICB9XG5cbiAgbmV3VHJhbnNhY3Rpb24oXG4gICAgc2VuZGVyOiBzdHJpbmcsXG4gICAgcmVjaXBpZW50OiBzdHJpbmcsXG4gICAgYW1vdW50OiBudW1iZXIsXG4gICAgZGF0YTogeyB0eXBlOiBFVHJhbnNhY3Rpb25UeXBlOyBwYXlsb2FkOiBhbnkgfSxcbiAgICBjeXBoZXIgPSB0aGlzLmN5cGhlclxuICApIHtcbiAgICBjb25zdCB0cmFuOiBJVHJhbnNhY3Rpb24gPSB7XG4gICAgICBzZW5kZXI6IHNlbmRlciwgLy/pgIHkv6HjgqLjg4njg6zjgrlcbiAgICAgIHJlY2lwaWVudDogcmVjaXBpZW50LCAvL+WPl+WPluOCouODieODrOOCuVxuICAgICAgYW1vdW50OiBhbW91bnQsIC8v6YePXG4gICAgICBkYXRhOiBkYXRhLCAvL+S7u+aEj+OBruODoeODg+OCu+ODvOOCuFxuICAgICAgbm93OiBEYXRlLm5vdygpLCAvL+OCv+OCpOODoOOCueOCv+ODs+ODl1xuICAgICAgcHVibGljS2V5OiBjeXBoZXIucHViS2V5LCAvL+WFrOmWi+mNtSxcbiAgICAgIG5vbmNlOiB0aGlzLmdldE5vbmNlKCksXG4gICAgICBzaWduOiBcIlwiIC8v572y5ZCNXG4gICAgfTtcbiAgICB0cmFuLnNpZ24gPSBjeXBoZXIuc2lnbk1lc3NhZ2UodGhpcy5oYXNoKHRyYW4pKS5zaWduYXR1cmU7XG4gICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgpLov73liqBcbiAgICB0aGlzLmN1cnJlbnRUcmFuc2FjdGlvbnMucHVzaCh0cmFuKTtcblxuICAgIHJldHVybiB0cmFuO1xuICB9XG5cbiAgbGFzdEJsb2NrKGJsb2NrY2hhaW4gPSB0aGlzLmNoYWluKSB7XG4gICAgcmV0dXJuIGJsb2NrY2hhaW5bYmxvY2tjaGFpbi5sZW5ndGggLSAxXTtcbiAgfVxuXG4gIGFkZEJsb2NrKGJsb2NrOiBhbnkpIHtcbiAgICBpZiAodGhpcy52YWxpZEJsb2NrKGJsb2NrKSkge1xuICAgICAgY29uc29sZS5sb2coXCJ2YWxpZEJsb2NrXCIpO1xuICAgICAgdGhpcy5jdXJyZW50VHJhbnNhY3Rpb25zID0gW107XG4gICAgICB0aGlzLmNoYWluLnB1c2goYmxvY2spO1xuXG4gICAgICB0aGlzLmNhbGxiYWNrLm9uQWRkQmxvY2soKTtcbiAgICAgIHRoaXMuZXhjdXRlRXZlbnQodGhpcy5ldmVudHMub25BZGRCbG9jayk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBleGN1dGVFdmVudChldjogYW55LCB2PzogYW55KSB7XG4gICAgY29uc29sZS5sb2coXCJleGN1dGVFdmVudFwiLCBldik7XG4gICAgT2JqZWN0LmtleXMoZXYpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGV2W2tleV0odik7XG4gICAgfSk7XG4gIH1cblxuICB2YWxpZEJsb2NrKGJsb2NrOiBhbnkpIHtcbiAgICBjb25zdCBsYXN0QmxvY2sgPSB0aGlzLmxhc3RCbG9jaygpO1xuICAgIGNvbnN0IGxhc3RQcm9vZiA9IGxhc3RCbG9jay5wcm9vZjtcbiAgICBjb25zdCBsYXN0SGFzaCA9IHRoaXMuaGFzaChsYXN0QmxvY2spO1xuICAgIGNvbnN0IG93bmVyID0gYmxvY2sub3duZXI7XG4gICAgY29uc3Qgc2lnbiA9IGJsb2NrLnNpZ247XG4gICAgY29uc3QgcHVibGljS2V5ID0gYmxvY2sucHVibGljS2V5O1xuICAgIGJsb2NrLnNpZ24gPSBcIlwiO1xuXG4gICAgLy/nvbLlkI3jgYzmraPjgZfjgYTjgYvjganjgYbjgYtcbiAgICBpZiAoXG4gICAgICB0aGlzLmN5cGhlci52ZXJpZnlNZXNzYWdlKHtcbiAgICAgICAgbWVzc2FnZTogdGhpcy5oYXNoKGJsb2NrKSxcbiAgICAgICAgcHVibGljS2V5LFxuICAgICAgICBzaWduYXR1cmU6IHNpZ25cbiAgICAgIH0pXG4gICAgKSB7XG4gICAgICBibG9jay5zaWduID0gc2lnbjtcbiAgICAgIC8v44OK44Oz44K544GM5q2j44GX44GE44GL44Gp44GG44GLXG4gICAgICBpZiAodGhpcy52YWxpZFByb29mKGxhc3RQcm9vZiwgYmxvY2sucHJvb2YsIGxhc3RIYXNoLCBvd25lcikpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcImJsb2NrIG5vbmNlIGVycm9yXCIsIHRoaXMuYWRkcmVzcywgdGhpcy5jaGFpbik7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXCJibG9jayBzaWduIGVycm9yXCIsIHRoaXMuYWRkcmVzcyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgdmFsaWRQcm9vZihcbiAgICBsYXN0UHJvb2Y6IHN0cmluZyxcbiAgICBwcm9vZjogbnVtYmVyLFxuICAgIGxhc3RIYXNoOiBzdHJpbmcsXG4gICAgYWRkcmVzczogc3RyaW5nXG4gICkge1xuICAgIGNvbnN0IGd1ZXNzID0gYCR7bGFzdFByb29mfSR7cHJvb2Z9JHtsYXN0SGFzaH0ke2FkZHJlc3N9YDtcbiAgICBjb25zdCBndWVzc0hhc2ggPSBzaGEyNTYoZ3Vlc3MpO1xuICAgIC8v5YWI6aCt44GL44KJ77yU5paH5a2X44GM77yQ44Gq44KJ5oiQ5YqfXG4gICAgcmV0dXJuIGRpZmYudGVzdChndWVzc0hhc2gpO1xuICB9XG5cbiAgdmFsaWRDaGFpbihjaGFpbjogQXJyYXk8YW55Pikge1xuICAgIGxldCBpbmRleCA9IDI7XG4gICAgd2hpbGUgKGluZGV4IDwgY2hhaW4ubGVuZ3RoKSB7XG4gICAgICBjb25zdCBwcmV2aW91c0Jsb2NrID0gY2hhaW5baW5kZXggLSAxXTtcbiAgICAgIGNvbnN0IGJsb2NrID0gY2hhaW5baW5kZXhdO1xuXG4gICAgICAvL+ODluODreODg+OCr+OBruaMgeOBpOWJjeOBruODluODreODg+OCr+OBruODj+ODg+OCt+ODpeWApOOBqOWun+mam+OBruWJjeOBrlxuICAgICAgLy/jg5bjg63jg4Pjgq/jga7jg4/jg4Pjgrfjg6XlgKTjgpLmr5TovINcbiAgICAgIGlmIChibG9jay5wcmV2aW91c0hhc2ggIT09IHRoaXMuaGFzaChwcmV2aW91c0Jsb2NrKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICAvL+ODiuODs+OCueOBruWApOOBruaknOiovFxuICAgICAgaWYgKFxuICAgICAgICAhdGhpcy52YWxpZFByb29mKFxuICAgICAgICAgIHByZXZpb3VzQmxvY2sucHJvb2YsXG4gICAgICAgICAgYmxvY2sucHJvb2YsXG4gICAgICAgICAgdGhpcy5oYXNoKGJsb2NrKSxcbiAgICAgICAgICBibG9jay5vd25lclxuICAgICAgICApXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaW5kZXgrKztcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICB2YWxpZFRyYW5zYWN0aW9uKHRyYW5zYWN0aW9uOiBJVHJhbnNhY3Rpb24pIHtcbiAgICBjb25zdCBhbW91bnQgPSB0cmFuc2FjdGlvbi5hbW91bnQ7XG4gICAgY29uc3Qgc2lnbiA9IHRyYW5zYWN0aW9uLnNpZ247XG5cbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLmN1cnJlbnRUcmFuc2FjdGlvbnMuZmluZChwcmV2ID0+IHtcbiAgICAgIHJldHVybiBwcmV2LnNpZ24gPT09IHNpZ247XG4gICAgfSk7XG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgY29uc29sZS5sb2coXCJkdXBsaWNhdGUgZXJyb3JcIiwgeyByZXN1bHQgfSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgcHVibGljS2V5ID0gdHJhbnNhY3Rpb24ucHVibGljS2V5O1xuICAgIGNvbnN0IGFkZHJlc3MgPSB0cmFuc2FjdGlvbi5zZW5kZXI7XG4gICAgdHJhbnNhY3Rpb24uc2lnbiA9IFwiXCI7XG5cbiAgICAvL+WFrOmWi+mNteOBjOmAgemHkeiAheOBruOCguOBruOBi+OBqeOBhuOBi1xuICAgIGlmIChzaGEyNTYocHVibGljS2V5KSA9PT0gYWRkcmVzcykge1xuICAgICAgLy/nvbLlkI3jgYzmraPjgZfjgYTjgYvjganjgYbjgYtcbiAgICAgIC8v5YWs6ZaL6Y2144Gn572y5ZCN44KS6Kej6Kqt44GX44OI44Op44Oz44K244Kv44K344On44Oz44Gu44OP44OD44K344Ol5YCk44Go5LiA6Ie044GZ44KL44GT44Go44KS56K66KqN44GZ44KL44CCXG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMuY3lwaGVyLnZlcmlmeU1lc3NhZ2Uoe1xuICAgICAgICAgIG1lc3NhZ2U6IHRoaXMuaGFzaCh0cmFuc2FjdGlvbiksXG4gICAgICAgICAgcHVibGljS2V5LFxuICAgICAgICAgIHNpZ25hdHVyZTogc2lnblxuICAgICAgICB9KVxuICAgICAgKSB7XG4gICAgICAgIGNvbnN0IGJhbGFuY2UgPSB0aGlzLm5vd0Ftb3VudChhZGRyZXNzKTtcbiAgICAgICAgLy/pgIHph5Hlj6/og73jgarph5HpoY3jgpLotoXjgYjjgabjgYTjgovjgYvjganjgYbjgYtcbiAgICAgICAgaWYgKGJhbGFuY2UgPj0gYW1vdW50KSB7XG4gICAgICAgICAgLy/mtojjgZfjgZ/nvbLlkI3jgpLmiLvjgZlcbiAgICAgICAgICB0cmFuc2FjdGlvbi5zaWduID0gc2lnbjtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImJhbGFuY2UgZXJyb3JcIiwgYW1vdW50LCBiYWxhbmNlKTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic2lnbiBlcnJvclwiKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcInB1YmtleSBlcnJvclwiKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBhZGRUcmFuc2FjdGlvbih0cmFuOiBJVHJhbnNhY3Rpb24pIHtcbiAgICBpZiAodGhpcy52YWxpZFRyYW5zYWN0aW9uKHRyYW4pKSB7XG4gICAgICBjb25zb2xlLmxvZyhcInZhbGlkVHJhbnNhY3Rpb25cIiwgeyB0cmFuIH0pO1xuICAgICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgpLov73liqBcbiAgICAgIHRoaXMuY3VycmVudFRyYW5zYWN0aW9ucy5wdXNoKHRyYW4pO1xuICAgICAgdGhpcy5leGN1dGVFdmVudCh0aGlzLmV2ZW50cy5vblRyYW5zYWN0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXCJlcnJvciBUcmFuc2FjdGlvblwiKTtcbiAgICB9XG4gIH1cblxuICBwcm9vZk9mV29yaygpIHtcbiAgICBjb25zdCBsYXN0QmxvY2sgPSB0aGlzLmxhc3RCbG9jaygpO1xuICAgIGNvbnN0IGxhc3RQcm9vZiA9IGxhc3RCbG9jay5wcm9vZjtcbiAgICBjb25zdCBsYXN0SGFzaCA9IHRoaXMuaGFzaChsYXN0QmxvY2spO1xuXG4gICAgbGV0IHByb29mID0gMDtcblxuICAgIHdoaWxlICghdGhpcy52YWxpZFByb29mKGxhc3RQcm9vZiwgcHJvb2YsIGxhc3RIYXNoLCB0aGlzLmFkZHJlc3MpKSB7XG4gICAgICAvL+ODiuODs+OCueOBruWApOOCkuippuihjOmMr+iqpOeahOOBq+aOouOBmVxuICAgICAgcHJvb2YrKztcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvb2Y7XG4gIH1cblxuICBub3dBbW91bnQoYWRkcmVzcyA9IHRoaXMuYWRkcmVzcykge1xuICAgIGxldCB0b2tlbk51bSA9IG5ldyBEZWNpbWFsKDAuMCk7XG4gICAgdGhpcy5jaGFpbi5mb3JFYWNoKGJsb2NrID0+IHtcbiAgICAgIGJsb2NrLnRyYW5zYWN0aW9ucy5mb3JFYWNoKCh0cmFuc2FjdGlvbjogYW55KSA9PiB7XG4gICAgICAgIGlmICh0cmFuc2FjdGlvbi5yZWNpcGllbnQgPT09IGFkZHJlc3MpIHtcbiAgICAgICAgICB0b2tlbk51bSA9IHRva2VuTnVtLnBsdXMobmV3IERlY2ltYWwocGFyc2VGbG9hdCh0cmFuc2FjdGlvbi5hbW91bnQpKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRyYW5zYWN0aW9uLnNlbmRlciA9PT0gYWRkcmVzcykge1xuICAgICAgICAgIHRva2VuTnVtID0gdG9rZW5OdW0ubWludXMoXG4gICAgICAgICAgICBuZXcgRGVjaW1hbChwYXJzZUZsb2F0KHRyYW5zYWN0aW9uLmFtb3VudCkpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgdGhpcy5jdXJyZW50VHJhbnNhY3Rpb25zLmZvckVhY2godHJhbnNhY3Rpb24gPT4ge1xuICAgICAgaWYgKHRyYW5zYWN0aW9uLnJlY2lwaWVudCA9PT0gYWRkcmVzcykge1xuICAgICAgICB0b2tlbk51bSA9IHRva2VuTnVtLnBsdXMobmV3IERlY2ltYWwocGFyc2VGbG9hdCh0cmFuc2FjdGlvbi5hbW91bnQpKSk7XG4gICAgICB9XG4gICAgICBpZiAodHJhbnNhY3Rpb24uc2VuZGVyID09PSBhZGRyZXNzKSB7XG4gICAgICAgIHRva2VuTnVtID0gdG9rZW5OdW0ubWludXMobmV3IERlY2ltYWwocGFyc2VGbG9hdCh0cmFuc2FjdGlvbi5hbW91bnQpKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHRva2VuTnVtLnRvTnVtYmVyKCk7XG4gIH1cblxuICBnZXROb25jZShhZGRyZXNzID0gdGhpcy5hZGRyZXNzKSB7XG4gICAgbGV0IG5vbmNlID0gMDtcbiAgICB0aGlzLmNoYWluLmZvckVhY2goYmxvY2sgPT4ge1xuICAgICAgYmxvY2sudHJhbnNhY3Rpb25zLmZvckVhY2goKHRyYW5zYWN0aW9uOiBJVHJhbnNhY3Rpb24pID0+IHtcbiAgICAgICAgaWYgKHRyYW5zYWN0aW9uLnNlbmRlciA9PT0gYWRkcmVzcykge1xuICAgICAgICAgIG5vbmNlKys7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHRoaXMuY3VycmVudFRyYW5zYWN0aW9ucy5mb3JFYWNoKHRyYW5zYWN0aW9uID0+IHtcbiAgICAgIGlmICh0cmFuc2FjdGlvbi5yZWNpcGllbnQgPT09IGFkZHJlc3MpIHtcbiAgICAgICAgbm9uY2UrKztcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbm9uY2U7XG4gIH1cbn1cbiJdfQ==