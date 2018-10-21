"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _sha = _interopRequireDefault(require("sha256"));

var _decimal = require("decimal.js");

var _cypher = _interopRequireDefault(require("./cypher"));

var _type = _interopRequireDefault(require("./type"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var diff = /^0000/;

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
      this.newTransaction(_type.default.SYSTEM, this.address, 1, _type.default.REWARD);
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
        //公開鍵
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
        console.log("duplicate error");
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
      // try {
      // } catch (error) {
      //   console.log(error);
      //   console.log({ tran });
      // }
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
  }]);

  return BlockChain;
}();

exports.default = BlockChain;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL2Jsb2NrY2hhaW4udHMiXSwibmFtZXMiOlsiZGlmZiIsIkJsb2NrQ2hhaW4iLCJzZWNLZXkiLCJwdWJLZXkiLCJvbkFkZEJsb2NrIiwidiIsIm9uVHJhbnNhY3Rpb24iLCJjeXBoZXIiLCJDeXBoZXIiLCJhZGRyZXNzIiwibmV3QmxvY2siLCJvYmoiLCJvYmpTdHJpbmciLCJKU09OIiwic3RyaW5naWZ5IiwiT2JqZWN0Iiwia2V5cyIsInNvcnQiLCJwcm9vZiIsInByZXZpb3VzSGFzaCIsIm5ld1RyYW5zYWN0aW9uIiwidHlwZSIsIlNZU1RFTSIsIlJFV0FSRCIsImJsb2NrIiwiaW5kZXgiLCJjaGFpbiIsImxlbmd0aCIsInRpbWVzdGFtcCIsIkRhdGUiLCJub3ciLCJ0cmFuc2FjdGlvbnMiLCJjdXJyZW50VHJhbnNhY3Rpb25zIiwiaGFzaCIsImxhc3RCbG9jayIsIm93bmVyIiwicHVibGljS2V5Iiwic2lnbiIsImVuY3J5cHQiLCJwdXNoIiwiY29uc29sZSIsImxvZyIsInNlbmRlciIsInJlY2lwaWVudCIsImFtb3VudCIsImRhdGEiLCJ0cmFuIiwiYmxvY2tjaGFpbiIsInZhbGlkQmxvY2siLCJjYWxsYmFjayIsImV4Y3V0ZUV2ZW50IiwiZXZlbnRzIiwiZXYiLCJmb3JFYWNoIiwia2V5IiwibGFzdFByb29mIiwibGFzdEhhc2giLCJkZWNyeXB0IiwidmFsaWRQcm9vZiIsImd1ZXNzIiwiZ3Vlc3NIYXNoIiwidGVzdCIsInByZXZpb3VzQmxvY2siLCJ0cmFuc2FjdGlvbiIsInJlc3VsdCIsImZpbmQiLCJwcmV2IiwiYmFsYW5jZSIsIm5vd0Ftb3VudCIsInZhbGlkVHJhbnNhY3Rpb24iLCJ0b2tlbk51bSIsIkRlY2ltYWwiLCJwbHVzIiwicGFyc2VGbG9hdCIsIm1pbnVzIiwidG9OdW1iZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUEsSUFB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QUF1QmpDLE9BQTNCLEVBQW9DO0FBQ2xDNkQsWUFBQUEsUUFBUSxHQUFHQSxRQUFRLENBQUNJLEtBQVQsQ0FDVCxJQUFJSCxnQkFBSixDQUFZRSxVQUFVLENBQUNWLFdBQVcsQ0FBQ25CLE1BQWIsQ0FBdEIsQ0FEUyxDQUFYO0FBR0Q7QUFDRixTQVREO0FBVUQsT0FYRDtBQVlBLFdBQUtaLG1CQUFMLENBQXlCcUIsT0FBekIsQ0FBaUMsVUFBQVUsV0FBVyxFQUFJO0FBQzlDLFlBQUlBLFdBQVcsQ0FBQ3BCLFNBQVosS0FBMEJsQyxPQUE5QixFQUF1QztBQUNyQzZELFVBQUFBLFFBQVEsR0FBR0EsUUFBUSxDQUFDRSxJQUFULENBQWMsSUFBSUQsZ0JBQUosQ0FBWUUsVUFBVSxDQUFDVixXQUFXLENBQUNuQixNQUFiLENBQXRCLENBQWQsQ0FBWDtBQUNEOztBQUNELFlBQUltQixXQUFXLENBQUNyQixNQUFaLEtBQXVCakMsT0FBM0IsRUFBb0M7QUFDbEM2RCxVQUFBQSxRQUFRLEdBQUdBLFFBQVEsQ0FBQ0ksS0FBVCxDQUFlLElBQUlILGdCQUFKLENBQVlFLFVBQVUsQ0FBQ1YsV0FBVyxDQUFDbkIsTUFBYixDQUF0QixDQUFmLENBQVg7QUFDRDtBQUNGLE9BUEQ7QUFRQSxhQUFPMEIsUUFBUSxDQUFDSyxRQUFULEVBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBzaGEyNTYgZnJvbSBcInNoYTI1NlwiO1xuaW1wb3J0IHsgRGVjaW1hbCB9IGZyb20gXCJkZWNpbWFsLmpzXCI7XG5pbXBvcnQgQ3lwaGVyIGZyb20gXCIuL2N5cGhlclwiO1xuaW1wb3J0IHR5cGUgZnJvbSBcIi4vdHlwZVwiO1xuXG5jb25zdCBkaWZmID0gL14wMDAwLztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmxvY2tDaGFpbiB7XG4gIGNoYWluOiBBcnJheTxhbnk+ID0gW107XG4gIGN1cnJlbnRUcmFuc2FjdGlvbnM6IEFycmF5PGFueT4gPSBbXTtcbiAgY3lwaGVyOiBDeXBoZXI7XG4gIGFkZHJlc3M6IHN0cmluZztcblxuICBjYWxsYmFjayA9IHtcbiAgICBvbkFkZEJsb2NrOiAodj86IGFueSkgPT4ge31cbiAgfTtcblxuICBwcml2YXRlIG9uQWRkQmxvY2s6IHsgW2tleTogc3RyaW5nXTogKCkgPT4gdm9pZCB9ID0ge307XG4gIHByaXZhdGUgb25UcmFuc2FjdGlvbjogeyBba2V5OiBzdHJpbmddOiAoKSA9PiB2b2lkIH0gPSB7fTtcbiAgZXZlbnRzID0ge1xuICAgIG9uQWRkQmxvY2s6IHRoaXMub25BZGRCbG9jayxcbiAgICBvblRyYW5zYWN0aW9uOiB0aGlzLm9uVHJhbnNhY3Rpb25cbiAgfTtcblxuICBjb25zdHJ1Y3RvcihzZWNLZXk/OiBzdHJpbmcsIHB1YktleT86IHN0cmluZykge1xuICAgIHRoaXMuY3lwaGVyID0gbmV3IEN5cGhlcihzZWNLZXksIHB1YktleSk7XG4gICAgdGhpcy5hZGRyZXNzID0gc2hhMjU2KHRoaXMuY3lwaGVyLnB1YktleSk7XG4gICAgdGhpcy5uZXdCbG9jaygwLCBcImdlbmVzaXNcIik7XG4gIH1cblxuICBoYXNoKG9iajogYW55KSB7XG4gICAgY29uc3Qgb2JqU3RyaW5nID0gSlNPTi5zdHJpbmdpZnkob2JqLCBPYmplY3Qua2V5cyhvYmopLnNvcnQoKSk7XG4gICAgcmV0dXJuIHNoYTI1NihvYmpTdHJpbmcpO1xuICB9XG5cbiAganNvblN0cihvYmo6IGFueSkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShvYmosIE9iamVjdC5rZXlzKG9iaikuc29ydCgpKTtcbiAgfVxuXG4gIG5ld0Jsb2NrKHByb29mOiBhbnksIHByZXZpb3VzSGFzaDogc3RyaW5nKSB7XG4gICAgLy/mjqHmjpjloLHphaxcbiAgICB0aGlzLm5ld1RyYW5zYWN0aW9uKHR5cGUuU1lTVEVNLCB0aGlzLmFkZHJlc3MsIDEsIHR5cGUuUkVXQVJEKTtcblxuICAgIGNvbnN0IGJsb2NrID0ge1xuICAgICAgaW5kZXg6IHRoaXMuY2hhaW4ubGVuZ3RoICsgMSwgLy/jg5bjg63jg4Pjgq/jga7nlarlj7dcbiAgICAgIHRpbWVzdGFtcDogRGF0ZS5ub3coKSwgLy/jgr/jgqTjg6Djgrnjgr/jg7Pjg5dcbiAgICAgIHRyYW5zYWN0aW9uczogdGhpcy5jdXJyZW50VHJhbnNhY3Rpb25zLCAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OBruWhilxuICAgICAgcHJvb2Y6IHByb29mLCAvL+ODiuODs+OCuVxuICAgICAgcHJldmlvdXNIYXNoOiBwcmV2aW91c0hhc2ggfHwgdGhpcy5oYXNoKHRoaXMubGFzdEJsb2NrKCkpLCAvL+WJjeOBruODluODreODg+OCr+OBruODj+ODg+OCt+ODpeWApFxuICAgICAgb3duZXI6IHRoaXMuYWRkcmVzcywgLy/jgZPjga7jg5bjg63jg4Pjgq/jgpLkvZzjgaPjgZ/kurpcbiAgICAgIHB1YmxpY0tleTogdGhpcy5jeXBoZXIucHViS2V5LCAvL+OBk+OBruODluODreODg+OCr+OCkuS9nOOBo+OBn+S6uuOBruWFrOmWi+mNtVxuICAgICAgc2lnbjogXCJcIiAvL+OBk+OBruODluODreODg+OCr+OCkuS9nOOBo+OBn+S6uuOBrue9suWQjVxuICAgIH07XG4gICAgLy/nvbLlkI3jgpLnlJ/miJBcbiAgICBibG9jay5zaWduID0gdGhpcy5jeXBoZXIuZW5jcnlwdCh0aGlzLmhhc2goYmxvY2spKTtcbiAgICAvL+ODluODreODg+OCr+ODgeOCp+ODvOODs+OBq+i/veWKoFxuICAgIHRoaXMuY2hhaW4ucHVzaChibG9jayk7XG5cbiAgICAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+ODl+ODvOODq+OCkuODquOCu+ODg+ODiFxuICAgIHRoaXMuY3VycmVudFRyYW5zYWN0aW9ucyA9IFtdO1xuICAgIGNvbnNvbGUubG9nKFwibmV3IGJsb2NrIGRvbmVcIiwgdGhpcy5jaGFpbik7XG4gICAgcmV0dXJuIGJsb2NrO1xuICB9XG5cbiAgbmV3VHJhbnNhY3Rpb24oXG4gICAgc2VuZGVyOiBzdHJpbmcsXG4gICAgcmVjaXBpZW50OiBzdHJpbmcsXG4gICAgYW1vdW50OiBudW1iZXIsXG4gICAgZGF0YTogYW55LFxuICAgIGN5cGhlciA9IHRoaXMuY3lwaGVyXG4gICkge1xuICAgIGNvbnN0IHRyYW4gPSB7XG4gICAgICBzZW5kZXI6IHNlbmRlciwgLy/pgIHkv6HjgqLjg4njg6zjgrlcbiAgICAgIHJlY2lwaWVudDogcmVjaXBpZW50LCAvL+WPl+WPluOCouODieODrOOCuVxuICAgICAgYW1vdW50OiBhbW91bnQsIC8v6YePXG4gICAgICBkYXRhOiBkYXRhLCAvL+S7u+aEj+OBruODoeODg+OCu+ODvOOCuFxuICAgICAgbm93OiBEYXRlLm5vdygpLCAvL+OCv+OCpOODoOOCueOCv+ODs+ODl1xuICAgICAgcHVibGljS2V5OiBjeXBoZXIucHViS2V5LCAvL+WFrOmWi+mNtVxuICAgICAgc2lnbjogXCJcIiAvL+e9suWQjVxuICAgIH07XG4gICAgdHJhbi5zaWduID0gY3lwaGVyLmVuY3J5cHQodGhpcy5oYXNoKHRyYW4pKTtcbiAgICAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OCkui/veWKoFxuICAgIHRoaXMuY3VycmVudFRyYW5zYWN0aW9ucy5wdXNoKHRyYW4pO1xuXG4gICAgcmV0dXJuIHRyYW47XG4gIH1cblxuICBsYXN0QmxvY2soYmxvY2tjaGFpbiA9IHRoaXMuY2hhaW4pIHtcbiAgICByZXR1cm4gYmxvY2tjaGFpbltibG9ja2NoYWluLmxlbmd0aCAtIDFdO1xuICB9XG5cbiAgYWRkQmxvY2soYmxvY2s6IGFueSkge1xuICAgIGlmICh0aGlzLnZhbGlkQmxvY2soYmxvY2spKSB7XG4gICAgICBjb25zb2xlLmxvZyhcInZhbGlkQmxvY2tcIik7XG4gICAgICB0aGlzLmN1cnJlbnRUcmFuc2FjdGlvbnMgPSBbXTtcbiAgICAgIHRoaXMuY2hhaW4ucHVzaChibG9jayk7XG5cbiAgICAgIHRoaXMuY2FsbGJhY2sub25BZGRCbG9jaygpO1xuICAgICAgdGhpcy5leGN1dGVFdmVudCh0aGlzLmV2ZW50cy5vbkFkZEJsb2NrKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGV4Y3V0ZUV2ZW50KGV2OiBhbnksIHY/OiBhbnkpIHtcbiAgICBjb25zb2xlLmxvZyhcImV4Y3V0ZUV2ZW50XCIsIGV2KTtcbiAgICBPYmplY3Qua2V5cyhldikuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgZXZba2V5XSh2KTtcbiAgICB9KTtcbiAgfVxuXG4gIHZhbGlkQmxvY2soYmxvY2s6IGFueSkge1xuICAgIGNvbnN0IGxhc3RCbG9jayA9IHRoaXMubGFzdEJsb2NrKCk7XG4gICAgY29uc3QgbGFzdFByb29mID0gbGFzdEJsb2NrLnByb29mO1xuICAgIGNvbnN0IGxhc3RIYXNoID0gdGhpcy5oYXNoKGxhc3RCbG9jayk7XG4gICAgY29uc3Qgb3duZXIgPSBibG9jay5vd25lcjtcbiAgICBjb25zdCBzaWduID0gYmxvY2suc2lnbjtcbiAgICBjb25zdCBwdWJsaWNLZXkgPSBibG9jay5wdWJsaWNLZXk7XG4gICAgYmxvY2suc2lnbiA9IFwiXCI7XG5cbiAgICAvL+e9suWQjeOBjOato+OBl+OBhOOBi+OBqeOBhuOBi1xuICAgIGlmICh0aGlzLmN5cGhlci5kZWNyeXB0KHNpZ24sIHB1YmxpY0tleSkgPT09IHRoaXMuaGFzaChibG9jaykpIHtcbiAgICAgIGJsb2NrLnNpZ24gPSBzaWduO1xuICAgICAgLy/jg4rjg7PjgrnjgYzmraPjgZfjgYTjgYvjganjgYbjgYtcbiAgICAgIGlmICh0aGlzLnZhbGlkUHJvb2YobGFzdFByb29mLCBibG9jay5wcm9vZiwgbGFzdEhhc2gsIG93bmVyKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiYmxvY2sgbm9uY2UgZXJyb3JcIiwgdGhpcy5hZGRyZXNzLCB0aGlzLmNoYWluKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcImJsb2NrIHNpZ24gZXJyb3JcIiwgdGhpcy5hZGRyZXNzKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICB2YWxpZFByb29mKFxuICAgIGxhc3RQcm9vZjogc3RyaW5nLFxuICAgIHByb29mOiBudW1iZXIsXG4gICAgbGFzdEhhc2g6IHN0cmluZyxcbiAgICBhZGRyZXNzOiBzdHJpbmdcbiAgKSB7XG4gICAgY29uc3QgZ3Vlc3MgPSBgJHtsYXN0UHJvb2Z9JHtwcm9vZn0ke2xhc3RIYXNofSR7YWRkcmVzc31gO1xuICAgIGNvbnN0IGd1ZXNzSGFzaCA9IHNoYTI1NihndWVzcyk7XG4gICAgLy/lhYjpoK3jgYvjgonvvJTmloflrZfjgYzvvJDjgarjgonmiJDlip9cbiAgICByZXR1cm4gZGlmZi50ZXN0KGd1ZXNzSGFzaCk7XG4gIH1cblxuICB2YWxpZENoYWluKGNoYWluOiBBcnJheTxhbnk+KSB7XG4gICAgbGV0IGluZGV4ID0gMjtcbiAgICB3aGlsZSAoaW5kZXggPCBjaGFpbi5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHByZXZpb3VzQmxvY2sgPSBjaGFpbltpbmRleCAtIDFdO1xuICAgICAgY29uc3QgYmxvY2sgPSBjaGFpbltpbmRleF07XG5cbiAgICAgIC8v44OW44Ot44OD44Kv44Gu5oyB44Gk5YmN44Gu44OW44Ot44OD44Kv44Gu44OP44OD44K344Ol5YCk44Go5a6f6Zqb44Gu5YmN44GuXG4gICAgICAvL+ODluODreODg+OCr+OBruODj+ODg+OCt+ODpeWApOOCkuavlOi8g1xuICAgICAgaWYgKGJsb2NrLnByZXZpb3VzSGFzaCAhPT0gdGhpcy5oYXNoKHByZXZpb3VzQmxvY2spKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIC8v44OK44Oz44K544Gu5YCk44Gu5qSc6Ki8XG4gICAgICBpZiAoXG4gICAgICAgICF0aGlzLnZhbGlkUHJvb2YoXG4gICAgICAgICAgcHJldmlvdXNCbG9jay5wcm9vZixcbiAgICAgICAgICBibG9jay5wcm9vZixcbiAgICAgICAgICB0aGlzLmhhc2goYmxvY2spLFxuICAgICAgICAgIGJsb2NrLm93bmVyXG4gICAgICAgIClcbiAgICAgICkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpbmRleCsrO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHZhbGlkVHJhbnNhY3Rpb24odHJhbnNhY3Rpb246IGFueSkge1xuICAgIGNvbnN0IGFtb3VudCA9IHRyYW5zYWN0aW9uLmFtb3VudDtcbiAgICBjb25zdCBzaWduID0gdHJhbnNhY3Rpb24uc2lnbjtcblxuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuY3VycmVudFRyYW5zYWN0aW9ucy5maW5kKHByZXYgPT4ge1xuICAgICAgcmV0dXJuIHByZXYuc2lnbiA9PT0gc2lnbjtcbiAgICB9KTtcbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICBjb25zb2xlLmxvZyhcImR1cGxpY2F0ZSBlcnJvclwiKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBwdWJsaWNLZXkgPSB0cmFuc2FjdGlvbi5wdWJsaWNLZXk7XG4gICAgY29uc3QgYWRkcmVzcyA9IHRyYW5zYWN0aW9uLnNlbmRlcjtcbiAgICB0cmFuc2FjdGlvbi5zaWduID0gXCJcIjtcblxuICAgIC8v5YWs6ZaL6Y2144GM6YCB6YeR6ICF44Gu44KC44Gu44GL44Gp44GG44GLXG4gICAgaWYgKHNoYTI1NihwdWJsaWNLZXkpID09PSBhZGRyZXNzKSB7XG4gICAgICAvL+e9suWQjeOBjOato+OBl+OBhOOBi+OBqeOBhuOBi1xuICAgICAgLy/lhazplovpjbXjgafnvbLlkI3jgpLop6Poqq3jgZfjg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7Pjga7jg4/jg4Pjgrfjg6XlgKTjgajkuIDoh7TjgZnjgovjgZPjgajjgpLnorroqo3jgZnjgovjgIJcbiAgICAgIGlmICh0aGlzLmN5cGhlci5kZWNyeXB0KHNpZ24sIHB1YmxpY0tleSkgPT09IHRoaXMuaGFzaCh0cmFuc2FjdGlvbikpIHtcbiAgICAgICAgY29uc3QgYmFsYW5jZSA9IHRoaXMubm93QW1vdW50KGFkZHJlc3MpO1xuICAgICAgICAvL+mAgemHkeWPr+iDveOBqumHkemhjeOCkui2heOBiOOBpuOBhOOCi+OBi+OBqeOBhuOBi1xuICAgICAgICBpZiAoYmFsYW5jZSA+PSBhbW91bnQpIHtcbiAgICAgICAgICAvL+a2iOOBl+OBn+e9suWQjeOCkuaIu+OBmVxuICAgICAgICAgIHRyYW5zYWN0aW9uLnNpZ24gPSBzaWduO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiYmFsYW5jZSBlcnJvclwiLCBhbW91bnQsIGJhbGFuY2UpO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzaWduIGVycm9yXCIpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFwicHVia2V5IGVycm9yXCIpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGFkZFRyYW5zYWN0aW9uKHRyYW46IGFueSkge1xuICAgIC8vIHRyeSB7XG5cbiAgICAvLyB9IGNhdGNoIChlcnJvcikge1xuICAgIC8vICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgIC8vICAgY29uc29sZS5sb2coeyB0cmFuIH0pO1xuICAgIC8vIH1cbiAgICBpZiAodGhpcy52YWxpZFRyYW5zYWN0aW9uKHRyYW4pKSB7XG4gICAgICBjb25zb2xlLmxvZyhcInZhbGlkVHJhbnNhY3Rpb25cIiwgeyB0cmFuIH0pO1xuICAgICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgpLov73liqBcbiAgICAgIHRoaXMuY3VycmVudFRyYW5zYWN0aW9ucy5wdXNoKHRyYW4pO1xuICAgICAgdGhpcy5leGN1dGVFdmVudCh0aGlzLmV2ZW50cy5vblRyYW5zYWN0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXCJlcnJvciBUcmFuc2FjdGlvblwiKTtcbiAgICB9XG4gIH1cblxuICBwcm9vZk9mV29yaygpIHtcbiAgICBjb25zdCBsYXN0QmxvY2sgPSB0aGlzLmxhc3RCbG9jaygpO1xuICAgIGNvbnN0IGxhc3RQcm9vZiA9IGxhc3RCbG9jay5wcm9vZjtcbiAgICBjb25zdCBsYXN0SGFzaCA9IHRoaXMuaGFzaChsYXN0QmxvY2spO1xuXG4gICAgbGV0IHByb29mID0gMDtcblxuICAgIHdoaWxlICghdGhpcy52YWxpZFByb29mKGxhc3RQcm9vZiwgcHJvb2YsIGxhc3RIYXNoLCB0aGlzLmFkZHJlc3MpKSB7XG4gICAgICAvL+ODiuODs+OCueOBruWApOOCkuippuihjOmMr+iqpOeahOOBq+aOouOBmVxuICAgICAgcHJvb2YrKztcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvb2Y7XG4gIH1cblxuICBub3dBbW91bnQoYWRkcmVzcyA9IHRoaXMuYWRkcmVzcykge1xuICAgIGxldCB0b2tlbk51bSA9IG5ldyBEZWNpbWFsKDAuMCk7XG4gICAgdGhpcy5jaGFpbi5mb3JFYWNoKGJsb2NrID0+IHtcbiAgICAgIGJsb2NrLnRyYW5zYWN0aW9ucy5mb3JFYWNoKCh0cmFuc2FjdGlvbjogYW55KSA9PiB7XG4gICAgICAgIGlmICh0cmFuc2FjdGlvbi5yZWNpcGllbnQgPT09IGFkZHJlc3MpIHtcbiAgICAgICAgICB0b2tlbk51bSA9IHRva2VuTnVtLnBsdXMobmV3IERlY2ltYWwocGFyc2VGbG9hdCh0cmFuc2FjdGlvbi5hbW91bnQpKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRyYW5zYWN0aW9uLnNlbmRlciA9PT0gYWRkcmVzcykge1xuICAgICAgICAgIHRva2VuTnVtID0gdG9rZW5OdW0ubWludXMoXG4gICAgICAgICAgICBuZXcgRGVjaW1hbChwYXJzZUZsb2F0KHRyYW5zYWN0aW9uLmFtb3VudCkpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgdGhpcy5jdXJyZW50VHJhbnNhY3Rpb25zLmZvckVhY2godHJhbnNhY3Rpb24gPT4ge1xuICAgICAgaWYgKHRyYW5zYWN0aW9uLnJlY2lwaWVudCA9PT0gYWRkcmVzcykge1xuICAgICAgICB0b2tlbk51bSA9IHRva2VuTnVtLnBsdXMobmV3IERlY2ltYWwocGFyc2VGbG9hdCh0cmFuc2FjdGlvbi5hbW91bnQpKSk7XG4gICAgICB9XG4gICAgICBpZiAodHJhbnNhY3Rpb24uc2VuZGVyID09PSBhZGRyZXNzKSB7XG4gICAgICAgIHRva2VuTnVtID0gdG9rZW5OdW0ubWludXMobmV3IERlY2ltYWwocGFyc2VGbG9hdCh0cmFuc2FjdGlvbi5hbW91bnQpKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHRva2VuTnVtLnRvTnVtYmVyKCk7XG4gIH1cbn1cbiJdfQ==