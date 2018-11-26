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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL2Jsb2NrY2hhaW4udHMiXSwibmFtZXMiOlsiZGlmZiIsIkJsb2NrQ2hhaW4iLCJwaHJhc2UiLCJvbkFkZEJsb2NrIiwidiIsIm9uVHJhbnNhY3Rpb24iLCJjeXBoZXIiLCJDeXBoZXIiLCJhZGRyZXNzIiwicHViS2V5IiwibmV3QmxvY2siLCJvYmoiLCJvYmpTdHJpbmciLCJKU09OIiwic3RyaW5naWZ5IiwiT2JqZWN0Iiwia2V5cyIsInNvcnQiLCJwcm9vZiIsInByZXZpb3VzSGFzaCIsIm5ld1RyYW5zYWN0aW9uIiwidHlwZSIsIlNZU1RFTSIsIkVUcmFuc2FjdGlvblR5cGUiLCJ0cmFuc2FjdGlvbiIsInBheWxvYWQiLCJibG9jayIsImluZGV4IiwiY2hhaW4iLCJsZW5ndGgiLCJ0aW1lc3RhbXAiLCJEYXRlIiwibm93IiwidHJhbnNhY3Rpb25zIiwiY3VycmVudFRyYW5zYWN0aW9ucyIsImhhc2giLCJsYXN0QmxvY2siLCJvd25lciIsInB1YmxpY0tleSIsInNpZ24iLCJzaWduTWVzc2FnZSIsInNpZ25hdHVyZSIsInB1c2giLCJjb25zb2xlIiwibG9nIiwic2VuZGVyIiwicmVjaXBpZW50IiwiYW1vdW50IiwiZGF0YSIsInRyYW4iLCJub25jZSIsImdldE5vbmNlIiwiYmxvY2tjaGFpbiIsInZhbGlkQmxvY2siLCJjYWxsYmFjayIsImV4Y3V0ZUV2ZW50IiwiZXZlbnRzIiwiZXYiLCJmb3JFYWNoIiwia2V5IiwibGFzdFByb29mIiwibGFzdEhhc2giLCJ2ZXJpZnlNZXNzYWdlIiwibWVzc2FnZSIsInZhbGlkUHJvb2YiLCJndWVzcyIsImd1ZXNzSGFzaCIsInRlc3QiLCJwcmV2aW91c0Jsb2NrIiwicmVzdWx0IiwiZmluZCIsInByZXYiLCJiYWxhbmNlIiwibm93QW1vdW50IiwidmFsaWRUcmFuc2FjdGlvbiIsInRva2VuTnVtIiwiRGVjaW1hbCIsInBsdXMiLCJwYXJzZUZsb2F0IiwibWludXMiLCJ0b051bWJl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QVQsRUFBUDtBQUNEOzs7K0JBRWdDO0FBQUEsVUFBeEJ4RSxPQUF3Qix1RUFBZCxLQUFLQSxPQUFTO0FBQy9CLFVBQUkwQyxLQUFLLEdBQUcsQ0FBWjtBQUNBLFdBQUt0QixLQUFMLENBQVc4QixPQUFYLENBQW1CLFVBQUFoQyxLQUFLLEVBQUk7QUFDMUJBLFFBQUFBLEtBQUssQ0FBQ08sWUFBTixDQUFtQnlCLE9BQW5CLENBQTJCLFVBQUNsQyxXQUFELEVBQStCO0FBQ3hELGNBQUlBLFdBQVcsQ0FBQ3FCLE1BQVosS0FBdUJyQyxPQUEzQixFQUFvQztBQUNsQzBDLFlBQUFBLEtBQUs7QUFDTjtBQUNGLFNBSkQ7QUFLRCxPQU5EO0FBT0EsV0FBS2hCLG1CQUFMLENBQXlCd0IsT0FBekIsQ0FBaUMsVUFBQWxDLFdBQVcsRUFBSTtBQUM5QyxZQUFJQSxXQUFXLENBQUNzQixTQUFaLEtBQTBCdEMsT0FBOUIsRUFBdUM7QUFDckMwQyxVQUFBQSxLQUFLO0FBQ047QUFDRixPQUpEO0FBS0EsYUFBT0EsS0FBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHNoYTI1NiBmcm9tIFwic2hhMjU2XCI7XG5pbXBvcnQgeyBEZWNpbWFsIH0gZnJvbSBcImRlY2ltYWwuanNcIjtcbmltcG9ydCBDeXBoZXIgZnJvbSBcIi4vY3J5cHRvL2N5cGhlclwiO1xuaW1wb3J0IHR5cGUgZnJvbSBcIi4vdHlwZVwiO1xuaW1wb3J0IHsgRVRyYW5zYWN0aW9uVHlwZSB9IGZyb20gXCIuL2ludGVyZmFjZVwiO1xuXG5jb25zdCBkaWZmID0gL14wMDAvO1xuXG5leHBvcnQgaW50ZXJmYWNlIElCbG9jayB7XG4gIGluZGV4OiBudW1iZXI7XG4gIHRpbWVzdGFtcDogYW55O1xuICB0cmFuc2FjdGlvbnM6IElUcmFuc2FjdGlvbltdO1xuICBwcm9vZjogbnVtYmVyO1xuICBwcmV2aW91c0hhc2g6IHN0cmluZztcbiAgb3duZXI6IHN0cmluZztcbiAgcHVibGljS2V5OiBzdHJpbmc7XG4gIHNpZ246IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJVHJhbnNhY3Rpb25EYXRhIHtcbiAgdHlwZTogRVRyYW5zYWN0aW9uVHlwZTtcbiAgcGF5bG9hZDogYW55O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElUcmFuc2FjdGlvbiB7XG4gIHNlbmRlcjogc3RyaW5nO1xuICByZWNpcGllbnQ6IHN0cmluZztcbiAgYW1vdW50OiBudW1iZXI7XG4gIGRhdGE6IElUcmFuc2FjdGlvbkRhdGE7XG4gIG5vdzogYW55O1xuICBwdWJsaWNLZXk6IHN0cmluZztcbiAgbm9uY2U6IG51bWJlcjtcbiAgc2lnbjogc3RyaW5nO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCbG9ja0NoYWluIHtcbiAgY2hhaW46IElCbG9ja1tdID0gW107XG4gIGN1cnJlbnRUcmFuc2FjdGlvbnM6IEFycmF5PGFueT4gPSBbXTtcbiAgY3lwaGVyOiBDeXBoZXI7XG4gIGFkZHJlc3M6IHN0cmluZztcblxuICBjYWxsYmFjayA9IHtcbiAgICBvbkFkZEJsb2NrOiAodj86IGFueSkgPT4ge31cbiAgfTtcblxuICBwcml2YXRlIG9uQWRkQmxvY2s6IHsgW2tleTogc3RyaW5nXTogKCkgPT4gdm9pZCB9ID0ge307XG4gIHByaXZhdGUgb25UcmFuc2FjdGlvbjogeyBba2V5OiBzdHJpbmddOiAoKSA9PiB2b2lkIH0gPSB7fTtcbiAgZXZlbnRzID0ge1xuICAgIG9uQWRkQmxvY2s6IHRoaXMub25BZGRCbG9jayxcbiAgICBvblRyYW5zYWN0aW9uOiB0aGlzLm9uVHJhbnNhY3Rpb25cbiAgfTtcblxuICBjb25zdHJ1Y3RvcihwaHJhc2U/OiBzdHJpbmcpIHtcbiAgICB0aGlzLmN5cGhlciA9IG5ldyBDeXBoZXIocGhyYXNlKTtcbiAgICB0aGlzLmFkZHJlc3MgPSBzaGEyNTYodGhpcy5jeXBoZXIucHViS2V5KTtcbiAgICB0aGlzLm5ld0Jsb2NrKDAsIFwiZ2VuZXNpc1wiKTtcbiAgfVxuXG4gIGhhc2gob2JqOiBhbnkpIHtcbiAgICBjb25zdCBvYmpTdHJpbmcgPSBKU09OLnN0cmluZ2lmeShvYmosIE9iamVjdC5rZXlzKG9iaikuc29ydCgpKTtcbiAgICByZXR1cm4gc2hhMjU2KG9ialN0cmluZyk7XG4gIH1cblxuICBqc29uU3RyKG9iajogYW55KSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG9iaiwgT2JqZWN0LmtleXMob2JqKS5zb3J0KCkpO1xuICB9XG5cbiAgbmV3QmxvY2socHJvb2Y6IGFueSwgcHJldmlvdXNIYXNoOiBzdHJpbmcpIHtcbiAgICAvL+aOoeaOmOWgsemFrFxuICAgIHRoaXMubmV3VHJhbnNhY3Rpb24odHlwZS5TWVNURU0sIHRoaXMuYWRkcmVzcywgMSwge1xuICAgICAgdHlwZTogRVRyYW5zYWN0aW9uVHlwZS50cmFuc2FjdGlvbixcbiAgICAgIHBheWxvYWQ6IFwicmV3YXJkXCJcbiAgICB9KTtcblxuICAgIGNvbnN0IGJsb2NrOiBJQmxvY2sgPSB7XG4gICAgICBpbmRleDogdGhpcy5jaGFpbi5sZW5ndGggKyAxLCAvL+ODluODreODg+OCr+OBrueVquWPt1xuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLCAvL+OCv+OCpOODoOOCueOCv+ODs+ODl1xuICAgICAgdHJhbnNhY3Rpb25zOiB0aGlzLmN1cnJlbnRUcmFuc2FjdGlvbnMsIC8v44OI44Op44Oz44K244Kv44K344On44Oz44Gu5aGKXG4gICAgICBwcm9vZjogcHJvb2YsIC8v44OK44Oz44K5XG4gICAgICBwcmV2aW91c0hhc2g6IHByZXZpb3VzSGFzaCB8fCB0aGlzLmhhc2godGhpcy5sYXN0QmxvY2soKSksIC8v5YmN44Gu44OW44Ot44OD44Kv44Gu44OP44OD44K344Ol5YCkXG4gICAgICBvd25lcjogdGhpcy5hZGRyZXNzLCAvL+OBk+OBruODluODreODg+OCr+OCkuS9nOOBo+OBn+S6ulxuICAgICAgcHVibGljS2V5OiB0aGlzLmN5cGhlci5wdWJLZXksIC8v44GT44Gu44OW44Ot44OD44Kv44KS5L2c44Gj44Gf5Lq644Gu5YWs6ZaL6Y21XG4gICAgICBzaWduOiBcIlwiIC8v44GT44Gu44OW44Ot44OD44Kv44KS5L2c44Gj44Gf5Lq644Gu572y5ZCNXG4gICAgfTtcbiAgICAvL+e9suWQjeOCkueUn+aIkFxuICAgIGJsb2NrLnNpZ24gPSB0aGlzLmN5cGhlci5zaWduTWVzc2FnZSh0aGlzLmhhc2goYmxvY2spKS5zaWduYXR1cmU7XG4gICAgLy/jg5bjg63jg4Pjgq/jg4Hjgqfjg7zjg7Pjgavov73liqBcbiAgICB0aGlzLmNoYWluLnB1c2goYmxvY2spO1xuXG4gICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7Pjg5fjg7zjg6vjgpLjg6rjgrvjg4Pjg4hcbiAgICB0aGlzLmN1cnJlbnRUcmFuc2FjdGlvbnMgPSBbXTtcbiAgICBjb25zb2xlLmxvZyhcIm5ldyBibG9jayBkb25lXCIsIHRoaXMuY2hhaW4pO1xuICAgIHJldHVybiBibG9jaztcbiAgfVxuXG4gIG5ld1RyYW5zYWN0aW9uKFxuICAgIHNlbmRlcjogc3RyaW5nLFxuICAgIHJlY2lwaWVudDogc3RyaW5nLFxuICAgIGFtb3VudDogbnVtYmVyLFxuICAgIGRhdGE6IHsgdHlwZTogRVRyYW5zYWN0aW9uVHlwZTsgcGF5bG9hZDogYW55IH0sXG4gICAgY3lwaGVyID0gdGhpcy5jeXBoZXJcbiAgKSB7XG4gICAgY29uc3QgdHJhbjogSVRyYW5zYWN0aW9uID0ge1xuICAgICAgc2VuZGVyOiBzZW5kZXIsIC8v6YCB5L+h44Ki44OJ44Os44K5XG4gICAgICByZWNpcGllbnQ6IHJlY2lwaWVudCwgLy/lj5flj5bjgqLjg4njg6zjgrlcbiAgICAgIGFtb3VudDogYW1vdW50LCAvL+mHj1xuICAgICAgZGF0YTogZGF0YSwgLy/ku7vmhI/jga7jg6Hjg4Pjgrvjg7zjgrhcbiAgICAgIG5vdzogRGF0ZS5ub3coKSwgLy/jgr/jgqTjg6Djgrnjgr/jg7Pjg5dcbiAgICAgIHB1YmxpY0tleTogY3lwaGVyLnB1YktleSwgLy/lhazplovpjbUsXG4gICAgICBub25jZTogdGhpcy5nZXROb25jZSgpLFxuICAgICAgc2lnbjogXCJcIiAvL+e9suWQjVxuICAgIH07XG4gICAgdHJhbi5zaWduID0gY3lwaGVyLnNpZ25NZXNzYWdlKHRoaXMuaGFzaCh0cmFuKSkuc2lnbmF0dXJlO1xuICAgIC8v44OI44Op44Oz44K244Kv44K344On44Oz44KS6L+95YqgXG4gICAgdGhpcy5jdXJyZW50VHJhbnNhY3Rpb25zLnB1c2godHJhbik7XG5cbiAgICByZXR1cm4gdHJhbjtcbiAgfVxuXG4gIGxhc3RCbG9jayhibG9ja2NoYWluID0gdGhpcy5jaGFpbik6IElCbG9jayB7XG4gICAgcmV0dXJuIGJsb2NrY2hhaW5bYmxvY2tjaGFpbi5sZW5ndGggLSAxXTtcbiAgfVxuXG4gIGFkZEJsb2NrKGJsb2NrOiBJQmxvY2spIHtcbiAgICBpZiAodGhpcy52YWxpZEJsb2NrKGJsb2NrKSkge1xuICAgICAgY29uc29sZS5sb2coXCJ2YWxpZEJsb2NrXCIpO1xuICAgICAgdGhpcy5jdXJyZW50VHJhbnNhY3Rpb25zID0gW107XG4gICAgICB0aGlzLmNoYWluLnB1c2goYmxvY2spO1xuXG4gICAgICB0aGlzLmNhbGxiYWNrLm9uQWRkQmxvY2soKTtcbiAgICAgIHRoaXMuZXhjdXRlRXZlbnQodGhpcy5ldmVudHMub25BZGRCbG9jayk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBleGN1dGVFdmVudChldjogYW55LCB2PzogYW55KSB7XG4gICAgY29uc29sZS5sb2coXCJleGN1dGVFdmVudFwiLCBldik7XG4gICAgT2JqZWN0LmtleXMoZXYpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGV2W2tleV0odik7XG4gICAgfSk7XG4gIH1cblxuICB2YWxpZEJsb2NrKGJsb2NrOiBJQmxvY2spIHtcbiAgICBjb25zdCBsYXN0QmxvY2sgPSB0aGlzLmxhc3RCbG9jaygpO1xuICAgIGNvbnN0IGxhc3RQcm9vZiA9IGxhc3RCbG9jay5wcm9vZjtcbiAgICBjb25zdCBsYXN0SGFzaCA9IHRoaXMuaGFzaChsYXN0QmxvY2spO1xuICAgIGNvbnN0IG93bmVyID0gYmxvY2sub3duZXI7XG4gICAgY29uc3Qgc2lnbiA9IGJsb2NrLnNpZ247XG4gICAgY29uc3QgcHVibGljS2V5ID0gYmxvY2sucHVibGljS2V5O1xuICAgIGJsb2NrLnNpZ24gPSBcIlwiO1xuXG4gICAgLy/nvbLlkI3jgYzmraPjgZfjgYTjgYvjganjgYbjgYtcbiAgICBpZiAoXG4gICAgICB0aGlzLmN5cGhlci52ZXJpZnlNZXNzYWdlKHtcbiAgICAgICAgbWVzc2FnZTogdGhpcy5oYXNoKGJsb2NrKSxcbiAgICAgICAgcHVibGljS2V5LFxuICAgICAgICBzaWduYXR1cmU6IHNpZ25cbiAgICAgIH0pXG4gICAgKSB7XG4gICAgICBibG9jay5zaWduID0gc2lnbjtcbiAgICAgIC8v44OK44Oz44K544GM5q2j44GX44GE44GL44Gp44GG44GLXG4gICAgICBpZiAodGhpcy52YWxpZFByb29mKGxhc3RQcm9vZiwgYmxvY2sucHJvb2YsIGxhc3RIYXNoLCBvd25lcikpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcImJsb2NrIG5vbmNlIGVycm9yXCIsIHRoaXMuYWRkcmVzcywgdGhpcy5jaGFpbik7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXCJibG9jayBzaWduIGVycm9yXCIsIHRoaXMuYWRkcmVzcyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgdmFsaWRQcm9vZihcbiAgICBsYXN0UHJvb2Y6IG51bWJlcixcbiAgICBwcm9vZjogbnVtYmVyLFxuICAgIGxhc3RIYXNoOiBzdHJpbmcsXG4gICAgYWRkcmVzczogc3RyaW5nXG4gICkge1xuICAgIGNvbnN0IGd1ZXNzID0gYCR7bGFzdFByb29mfSR7cHJvb2Z9JHtsYXN0SGFzaH0ke2FkZHJlc3N9YDtcbiAgICBjb25zdCBndWVzc0hhc2ggPSBzaGEyNTYoZ3Vlc3MpO1xuICAgIC8v5YWI6aCt44GL44KJ77yU5paH5a2X44GM77yQ44Gq44KJ5oiQ5YqfXG4gICAgcmV0dXJuIGRpZmYudGVzdChndWVzc0hhc2gpO1xuICB9XG5cbiAgdmFsaWRDaGFpbihjaGFpbjogSUJsb2NrW10pIHtcbiAgICBsZXQgaW5kZXggPSAyO1xuICAgIHdoaWxlIChpbmRleCA8IGNoYWluLmxlbmd0aCkge1xuICAgICAgY29uc3QgcHJldmlvdXNCbG9jayA9IGNoYWluW2luZGV4IC0gMV07XG4gICAgICBjb25zdCBibG9jayA9IGNoYWluW2luZGV4XTtcblxuICAgICAgLy/jg5bjg63jg4Pjgq/jga7mjIHjgaTliY3jga7jg5bjg63jg4Pjgq/jga7jg4/jg4Pjgrfjg6XlgKTjgajlrp/pmpvjga7liY3jga5cbiAgICAgIC8v44OW44Ot44OD44Kv44Gu44OP44OD44K344Ol5YCk44KS5q+U6LyDXG4gICAgICBpZiAoYmxvY2sucHJldmlvdXNIYXNoICE9PSB0aGlzLmhhc2gocHJldmlvdXNCbG9jaykpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgLy/jg4rjg7Pjgrnjga7lgKTjga7mpJzoqLxcbiAgICAgIGlmIChcbiAgICAgICAgIXRoaXMudmFsaWRQcm9vZihcbiAgICAgICAgICBwcmV2aW91c0Jsb2NrLnByb29mLFxuICAgICAgICAgIGJsb2NrLnByb29mLFxuICAgICAgICAgIHRoaXMuaGFzaChibG9jayksXG4gICAgICAgICAgYmxvY2sub3duZXJcbiAgICAgICAgKVxuICAgICAgKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGluZGV4Kys7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgdmFsaWRUcmFuc2FjdGlvbih0cmFuc2FjdGlvbjogSVRyYW5zYWN0aW9uKSB7XG4gICAgY29uc3QgYW1vdW50ID0gdHJhbnNhY3Rpb24uYW1vdW50O1xuICAgIGNvbnN0IHNpZ24gPSB0cmFuc2FjdGlvbi5zaWduO1xuXG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5jdXJyZW50VHJhbnNhY3Rpb25zLmZpbmQocHJldiA9PiB7XG4gICAgICByZXR1cm4gcHJldi5zaWduID09PSBzaWduO1xuICAgIH0pO1xuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZHVwbGljYXRlIGVycm9yXCIsIHsgcmVzdWx0IH0pO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IHB1YmxpY0tleSA9IHRyYW5zYWN0aW9uLnB1YmxpY0tleTtcbiAgICBjb25zdCBhZGRyZXNzID0gdHJhbnNhY3Rpb24uc2VuZGVyO1xuICAgIHRyYW5zYWN0aW9uLnNpZ24gPSBcIlwiO1xuXG4gICAgLy/lhazplovpjbXjgYzpgIHph5HogIXjga7jgoLjga7jgYvjganjgYbjgYtcbiAgICBpZiAoc2hhMjU2KHB1YmxpY0tleSkgPT09IGFkZHJlc3MpIHtcbiAgICAgIC8v572y5ZCN44GM5q2j44GX44GE44GL44Gp44GG44GLXG4gICAgICAvL+WFrOmWi+mNteOBp+e9suWQjeOCkuino+iqreOBl+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OBruODj+ODg+OCt+ODpeWApOOBqOS4gOiHtOOBmeOCi+OBk+OBqOOCkueiuuiqjeOBmeOCi+OAglxuICAgICAgaWYgKFxuICAgICAgICB0aGlzLmN5cGhlci52ZXJpZnlNZXNzYWdlKHtcbiAgICAgICAgICBtZXNzYWdlOiB0aGlzLmhhc2godHJhbnNhY3Rpb24pLFxuICAgICAgICAgIHB1YmxpY0tleSxcbiAgICAgICAgICBzaWduYXR1cmU6IHNpZ25cbiAgICAgICAgfSlcbiAgICAgICkge1xuICAgICAgICBjb25zdCBiYWxhbmNlID0gdGhpcy5ub3dBbW91bnQoYWRkcmVzcyk7XG4gICAgICAgIC8v6YCB6YeR5Y+v6IO944Gq6YeR6aGN44KS6LaF44GI44Gm44GE44KL44GL44Gp44GG44GLXG4gICAgICAgIGlmIChiYWxhbmNlID49IGFtb3VudCkge1xuICAgICAgICAgIC8v5raI44GX44Gf572y5ZCN44KS5oi744GZXG4gICAgICAgICAgdHJhbnNhY3Rpb24uc2lnbiA9IHNpZ247XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJiYWxhbmNlIGVycm9yXCIsIGFtb3VudCwgYmFsYW5jZSk7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcInNpZ24gZXJyb3JcIik7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXCJwdWJrZXkgZXJyb3JcIik7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgYWRkVHJhbnNhY3Rpb24odHJhbjogSVRyYW5zYWN0aW9uKSB7XG4gICAgaWYgKHRoaXMudmFsaWRUcmFuc2FjdGlvbih0cmFuKSkge1xuICAgICAgY29uc29sZS5sb2coXCJ2YWxpZFRyYW5zYWN0aW9uXCIsIHsgdHJhbiB9KTtcbiAgICAgIC8v44OI44Op44Oz44K244Kv44K344On44Oz44KS6L+95YqgXG4gICAgICB0aGlzLmN1cnJlbnRUcmFuc2FjdGlvbnMucHVzaCh0cmFuKTtcbiAgICAgIHRoaXMuZXhjdXRlRXZlbnQodGhpcy5ldmVudHMub25UcmFuc2FjdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZXJyb3IgVHJhbnNhY3Rpb25cIik7XG4gICAgfVxuICB9XG5cbiAgcHJvb2ZPZldvcmsoKSB7XG4gICAgY29uc3QgbGFzdEJsb2NrID0gdGhpcy5sYXN0QmxvY2soKTtcbiAgICBjb25zdCBsYXN0UHJvb2YgPSBsYXN0QmxvY2sucHJvb2Y7XG4gICAgY29uc3QgbGFzdEhhc2ggPSB0aGlzLmhhc2gobGFzdEJsb2NrKTtcblxuICAgIGxldCBwcm9vZiA9IDA7XG5cbiAgICB3aGlsZSAoIXRoaXMudmFsaWRQcm9vZihsYXN0UHJvb2YsIHByb29mLCBsYXN0SGFzaCwgdGhpcy5hZGRyZXNzKSkge1xuICAgICAgLy/jg4rjg7Pjgrnjga7lgKTjgpLoqabooYzpjK/oqqTnmoTjgavmjqLjgZlcbiAgICAgIHByb29mKys7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb29mO1xuICB9XG5cbiAgbm93QW1vdW50KGFkZHJlc3MgPSB0aGlzLmFkZHJlc3MpIHtcbiAgICBsZXQgdG9rZW5OdW0gPSBuZXcgRGVjaW1hbCgwLjApO1xuICAgIHRoaXMuY2hhaW4uZm9yRWFjaChibG9jayA9PiB7XG4gICAgICBibG9jay50cmFuc2FjdGlvbnMuZm9yRWFjaCgodHJhbnNhY3Rpb246IGFueSkgPT4ge1xuICAgICAgICBpZiAodHJhbnNhY3Rpb24ucmVjaXBpZW50ID09PSBhZGRyZXNzKSB7XG4gICAgICAgICAgdG9rZW5OdW0gPSB0b2tlbk51bS5wbHVzKG5ldyBEZWNpbWFsKHBhcnNlRmxvYXQodHJhbnNhY3Rpb24uYW1vdW50KSkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0cmFuc2FjdGlvbi5zZW5kZXIgPT09IGFkZHJlc3MpIHtcbiAgICAgICAgICB0b2tlbk51bSA9IHRva2VuTnVtLm1pbnVzKFxuICAgICAgICAgICAgbmV3IERlY2ltYWwocGFyc2VGbG9hdCh0cmFuc2FjdGlvbi5hbW91bnQpKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHRoaXMuY3VycmVudFRyYW5zYWN0aW9ucy5mb3JFYWNoKHRyYW5zYWN0aW9uID0+IHtcbiAgICAgIGlmICh0cmFuc2FjdGlvbi5yZWNpcGllbnQgPT09IGFkZHJlc3MpIHtcbiAgICAgICAgdG9rZW5OdW0gPSB0b2tlbk51bS5wbHVzKG5ldyBEZWNpbWFsKHBhcnNlRmxvYXQodHJhbnNhY3Rpb24uYW1vdW50KSkpO1xuICAgICAgfVxuICAgICAgaWYgKHRyYW5zYWN0aW9uLnNlbmRlciA9PT0gYWRkcmVzcykge1xuICAgICAgICB0b2tlbk51bSA9IHRva2VuTnVtLm1pbnVzKG5ldyBEZWNpbWFsKHBhcnNlRmxvYXQodHJhbnNhY3Rpb24uYW1vdW50KSkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB0b2tlbk51bS50b051bWJlcigpO1xuICB9XG5cbiAgZ2V0Tm9uY2UoYWRkcmVzcyA9IHRoaXMuYWRkcmVzcykge1xuICAgIGxldCBub25jZSA9IDA7XG4gICAgdGhpcy5jaGFpbi5mb3JFYWNoKGJsb2NrID0+IHtcbiAgICAgIGJsb2NrLnRyYW5zYWN0aW9ucy5mb3JFYWNoKCh0cmFuc2FjdGlvbjogSVRyYW5zYWN0aW9uKSA9PiB7XG4gICAgICAgIGlmICh0cmFuc2FjdGlvbi5zZW5kZXIgPT09IGFkZHJlc3MpIHtcbiAgICAgICAgICBub25jZSsrO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICB0aGlzLmN1cnJlbnRUcmFuc2FjdGlvbnMuZm9yRWFjaCh0cmFuc2FjdGlvbiA9PiB7XG4gICAgICBpZiAodHJhbnNhY3Rpb24ucmVjaXBpZW50ID09PSBhZGRyZXNzKSB7XG4gICAgICAgIG5vbmNlKys7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG5vbmNlO1xuICB9XG59XG4iXX0=