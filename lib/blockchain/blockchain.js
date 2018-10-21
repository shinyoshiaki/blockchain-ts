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
      tran.sign = cypher.encrypt(this.hash(tran));
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
        //console.log("blockchain", "addblock");
        this.currentTransactions = [];
        this.chain.push(block); //console.log("chain", this.chain);
      }

      this.callback.onAddBlock();
      this.excuteEvent(this.events.onAddBlock);
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
      block.sign = ""; //ナンスが正しいかどうか

      if (this.validProof(lastProof, block.proof, lastHash, owner)) {
        //署名が正しいかどうか
        if (this.cypher.decrypt(sign, publicKey) === this.hash(block)) {
          block.sign = sign;
          return true;
        } else {
          return false;
        }
      } else {
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
        console.log("duplicate", {
          transaction: transaction
        }, {
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
            return false;
          }
        } else {
          return false;
        }
      } else {
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
        console.log("validTransaction");
        this.currentTransactions.push(tran);
        this.excuteEvent(this.events.onTransaction);
      } else {
        console.log("erro Transaction");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL2Jsb2NrY2hhaW4udHMiXSwibmFtZXMiOlsiZGlmZiIsIkJsb2NrQ2hhaW4iLCJzZWNLZXkiLCJwdWJLZXkiLCJvbkFkZEJsb2NrIiwidiIsIm9uVHJhbnNhY3Rpb24iLCJjeXBoZXIiLCJDeXBoZXIiLCJhZGRyZXNzIiwibmV3QmxvY2siLCJvYmoiLCJvYmpTdHJpbmciLCJKU09OIiwic3RyaW5naWZ5IiwiT2JqZWN0Iiwia2V5cyIsInNvcnQiLCJwcm9vZiIsInByZXZpb3VzSGFzaCIsIm5ld1RyYW5zYWN0aW9uIiwidHlwZSIsIlNZU1RFTSIsIlJFV0FSRCIsImJsb2NrIiwiaW5kZXgiLCJjaGFpbiIsImxlbmd0aCIsInRpbWVzdGFtcCIsIkRhdGUiLCJub3ciLCJ0cmFuc2FjdGlvbnMiLCJjdXJyZW50VHJhbnNhY3Rpb25zIiwiaGFzaCIsImxhc3RCbG9jayIsIm93bmVyIiwicHVibGljS2V5Iiwic2lnbiIsImVuY3J5cHQiLCJwdXNoIiwic2VuZGVyIiwicmVjaXBpZW50IiwiYW1vdW50IiwiZGF0YSIsInRyYW4iLCJibG9ja2NoYWluIiwidmFsaWRCbG9jayIsImNhbGxiYWNrIiwiZXhjdXRlRXZlbnQiLCJldmVudHMiLCJldiIsImNvbnNvbGUiLCJsb2ciLCJmb3JFYWNoIiwia2V5IiwibGFzdFByb29mIiwibGFzdEhhc2giLCJ2YWxpZFByb29mIiwiZGVjcnlwdCIsImd1ZXNzIiwiZ3Vlc3NIYXNoIiwidGVzdCIsInByZXZpb3VzQmxvY2siLCJ0cmFuc2FjdGlvbiIsInJlc3VsdCIsImZpbmQiLCJwcmV2IiwiYmFsYW5jZSIsIm5vd0Ftb3VudCIsInZhbGlkVHJhbnNhY3Rpb24iLCJ0b2tlbk51bSIsIkRlY2ltYWwiLCJwbHVzIiwicGFyc2VGbG9hdCIsIm1pbnVzIiwidG9OdW1iZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUEsSUFB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Q0FBdEIsQ0FBZCxDQUFYO0FBQ0Q7O0FBQ0QsWUFBSXFCLFdBQVcsQ0FBQ3ZCLE1BQVosS0FBdUIvQixPQUEzQixFQUFvQztBQUNsQzZELFVBQUFBLFFBQVEsR0FBR0EsUUFBUSxDQUFDSSxLQUFULENBQWUsSUFBSUgsZ0JBQUosQ0FBWUUsVUFBVSxDQUFDVixXQUFXLENBQUNyQixNQUFiLENBQXRCLENBQWYsQ0FBWDtBQUNEO0FBQ0YsT0FQRDtBQVFBLGFBQU80QixRQUFRLENBQUNLLFFBQVQsRUFBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHNoYTI1NiBmcm9tIFwic2hhMjU2XCI7XG5pbXBvcnQgeyBEZWNpbWFsIH0gZnJvbSBcImRlY2ltYWwuanNcIjtcbmltcG9ydCBDeXBoZXIgZnJvbSBcIi4vY3lwaGVyXCI7XG5pbXBvcnQgdHlwZSBmcm9tIFwiLi90eXBlXCI7XG5cbmNvbnN0IGRpZmYgPSAvXjAwMDAvO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCbG9ja0NoYWluIHtcbiAgY2hhaW46IEFycmF5PGFueT4gPSBbXTtcbiAgY3VycmVudFRyYW5zYWN0aW9uczogQXJyYXk8YW55PiA9IFtdO1xuICBjeXBoZXI6IEN5cGhlcjtcbiAgYWRkcmVzczogc3RyaW5nO1xuXG4gIGNhbGxiYWNrID0ge1xuICAgIG9uQWRkQmxvY2s6ICh2PzogYW55KSA9PiB7fVxuICB9O1xuXG4gIHByaXZhdGUgb25BZGRCbG9jazogeyBba2V5OiBzdHJpbmddOiAoKSA9PiB2b2lkIH0gPSB7fTtcbiAgcHJpdmF0ZSBvblRyYW5zYWN0aW9uOiB7IFtrZXk6IHN0cmluZ106ICgpID0+IHZvaWQgfSA9IHt9O1xuICBldmVudHMgPSB7XG4gICAgb25BZGRCbG9jazogdGhpcy5vbkFkZEJsb2NrLFxuICAgIG9uVHJhbnNhY3Rpb246IHRoaXMub25UcmFuc2FjdGlvblxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHNlY0tleT86IHN0cmluZywgcHViS2V5Pzogc3RyaW5nKSB7XG4gICAgdGhpcy5jeXBoZXIgPSBuZXcgQ3lwaGVyKHNlY0tleSwgcHViS2V5KTtcbiAgICB0aGlzLmFkZHJlc3MgPSBzaGEyNTYodGhpcy5jeXBoZXIucHViS2V5KTtcbiAgICB0aGlzLm5ld0Jsb2NrKDAsIFwiZ2VuZXNpc1wiKTtcbiAgfVxuXG4gIGhhc2gob2JqOiBhbnkpIHtcbiAgICBjb25zdCBvYmpTdHJpbmcgPSBKU09OLnN0cmluZ2lmeShvYmosIE9iamVjdC5rZXlzKG9iaikuc29ydCgpKTtcbiAgICByZXR1cm4gc2hhMjU2KG9ialN0cmluZyk7XG4gIH1cblxuICBqc29uU3RyKG9iajogYW55KSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG9iaiwgT2JqZWN0LmtleXMob2JqKS5zb3J0KCkpO1xuICB9XG5cbiAgbmV3QmxvY2socHJvb2Y6IGFueSwgcHJldmlvdXNIYXNoOiBzdHJpbmcpIHtcbiAgICAvL+aOoeaOmOWgsemFrFxuICAgIHRoaXMubmV3VHJhbnNhY3Rpb24odHlwZS5TWVNURU0sIHRoaXMuYWRkcmVzcywgMSwgdHlwZS5SRVdBUkQpO1xuXG4gICAgY29uc3QgYmxvY2sgPSB7XG4gICAgICBpbmRleDogdGhpcy5jaGFpbi5sZW5ndGggKyAxLCAvL+ODluODreODg+OCr+OBrueVquWPt1xuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLCAvL+OCv+OCpOODoOOCueOCv+ODs+ODl1xuICAgICAgdHJhbnNhY3Rpb25zOiB0aGlzLmN1cnJlbnRUcmFuc2FjdGlvbnMsIC8v44OI44Op44Oz44K244Kv44K344On44Oz44Gu5aGKXG4gICAgICBwcm9vZjogcHJvb2YsIC8v44OK44Oz44K5XG4gICAgICBwcmV2aW91c0hhc2g6IHByZXZpb3VzSGFzaCB8fCB0aGlzLmhhc2godGhpcy5sYXN0QmxvY2soKSksIC8v5YmN44Gu44OW44Ot44OD44Kv44Gu44OP44OD44K344Ol5YCkXG4gICAgICBvd25lcjogdGhpcy5hZGRyZXNzLCAvL+OBk+OBruODluODreODg+OCr+OCkuS9nOOBo+OBn+S6ulxuICAgICAgcHVibGljS2V5OiB0aGlzLmN5cGhlci5wdWJLZXksIC8v44GT44Gu44OW44Ot44OD44Kv44KS5L2c44Gj44Gf5Lq644Gu5YWs6ZaL6Y21XG4gICAgICBzaWduOiBcIlwiIC8v44GT44Gu44OW44Ot44OD44Kv44KS5L2c44Gj44Gf5Lq644Gu572y5ZCNXG4gICAgfTtcbiAgICAvL+e9suWQjeOCkueUn+aIkFxuICAgIGJsb2NrLnNpZ24gPSB0aGlzLmN5cGhlci5lbmNyeXB0KHRoaXMuaGFzaChibG9jaykpO1xuICAgIC8v44OW44Ot44OD44Kv44OB44Kn44O844Oz44Gr6L+95YqgXG4gICAgdGhpcy5jaGFpbi5wdXNoKGJsb2NrKTtcblxuICAgIC8v44OI44Op44Oz44K244Kv44K344On44Oz44OX44O844Or44KS44Oq44K744OD44OIXG4gICAgdGhpcy5jdXJyZW50VHJhbnNhY3Rpb25zID0gW107XG5cbiAgICByZXR1cm4gYmxvY2s7XG4gIH1cblxuICBuZXdUcmFuc2FjdGlvbihcbiAgICBzZW5kZXI6IHN0cmluZyxcbiAgICByZWNpcGllbnQ6IHN0cmluZyxcbiAgICBhbW91bnQ6IG51bWJlcixcbiAgICBkYXRhOiBhbnksXG4gICAgY3lwaGVyID0gdGhpcy5jeXBoZXJcbiAgKSB7XG4gICAgY29uc3QgdHJhbiA9IHtcbiAgICAgIHNlbmRlcjogc2VuZGVyLCAvL+mAgeS/oeOCouODieODrOOCuVxuICAgICAgcmVjaXBpZW50OiByZWNpcGllbnQsIC8v5Y+X5Y+W44Ki44OJ44Os44K5XG4gICAgICBhbW91bnQ6IGFtb3VudCwgLy/ph49cbiAgICAgIGRhdGE6IGRhdGEsIC8v5Lu75oSP44Gu44Oh44OD44K744O844K4XG4gICAgICBub3c6IERhdGUubm93KCksIC8v44K/44Kk44Og44K544K/44Oz44OXXG4gICAgICBwdWJsaWNLZXk6IGN5cGhlci5wdWJLZXksIC8v5YWs6ZaL6Y21XG4gICAgICBzaWduOiBcIlwiIC8v572y5ZCNXG4gICAgfTtcbiAgICB0cmFuLnNpZ24gPSBjeXBoZXIuZW5jcnlwdCh0aGlzLmhhc2godHJhbikpO1xuICAgIHRoaXMuY3VycmVudFRyYW5zYWN0aW9ucy5wdXNoKHRyYW4pO1xuXG4gICAgcmV0dXJuIHRyYW47XG4gIH1cblxuICBsYXN0QmxvY2soYmxvY2tjaGFpbiA9IHRoaXMuY2hhaW4pIHtcbiAgICByZXR1cm4gYmxvY2tjaGFpbltibG9ja2NoYWluLmxlbmd0aCAtIDFdO1xuICB9XG5cbiAgYWRkQmxvY2soYmxvY2s6IGFueSkge1xuICAgIGlmICh0aGlzLnZhbGlkQmxvY2soYmxvY2spKSB7XG4gICAgICAvL2NvbnNvbGUubG9nKFwiYmxvY2tjaGFpblwiLCBcImFkZGJsb2NrXCIpO1xuICAgICAgdGhpcy5jdXJyZW50VHJhbnNhY3Rpb25zID0gW107XG4gICAgICB0aGlzLmNoYWluLnB1c2goYmxvY2spO1xuXG4gICAgICAvL2NvbnNvbGUubG9nKFwiY2hhaW5cIiwgdGhpcy5jaGFpbik7XG4gICAgfVxuICAgIHRoaXMuY2FsbGJhY2sub25BZGRCbG9jaygpO1xuICAgIHRoaXMuZXhjdXRlRXZlbnQodGhpcy5ldmVudHMub25BZGRCbG9jayk7XG4gIH1cblxuICBwcml2YXRlIGV4Y3V0ZUV2ZW50KGV2OiBhbnksIHY/OiBhbnkpIHtcbiAgICBjb25zb2xlLmxvZyhcImV4Y3V0ZUV2ZW50XCIsIGV2KTtcbiAgICBPYmplY3Qua2V5cyhldikuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgZXZba2V5XSh2KTtcbiAgICB9KTtcbiAgfVxuXG4gIHZhbGlkQmxvY2soYmxvY2s6IGFueSkge1xuICAgIGNvbnN0IGxhc3RCbG9jayA9IHRoaXMubGFzdEJsb2NrKCk7XG4gICAgY29uc3QgbGFzdFByb29mID0gbGFzdEJsb2NrLnByb29mO1xuICAgIGNvbnN0IGxhc3RIYXNoID0gdGhpcy5oYXNoKGxhc3RCbG9jayk7XG4gICAgY29uc3Qgb3duZXIgPSBibG9jay5vd25lcjtcbiAgICBjb25zdCBzaWduID0gYmxvY2suc2lnbjtcbiAgICBjb25zdCBwdWJsaWNLZXkgPSBibG9jay5wdWJsaWNLZXk7XG4gICAgYmxvY2suc2lnbiA9IFwiXCI7XG5cbiAgICAvL+ODiuODs+OCueOBjOato+OBl+OBhOOBi+OBqeOBhuOBi1xuICAgIGlmICh0aGlzLnZhbGlkUHJvb2YobGFzdFByb29mLCBibG9jay5wcm9vZiwgbGFzdEhhc2gsIG93bmVyKSkge1xuICAgICAgLy/nvbLlkI3jgYzmraPjgZfjgYTjgYvjganjgYbjgYtcbiAgICAgIGlmICh0aGlzLmN5cGhlci5kZWNyeXB0KHNpZ24sIHB1YmxpY0tleSkgPT09IHRoaXMuaGFzaChibG9jaykpIHtcbiAgICAgICAgYmxvY2suc2lnbiA9IHNpZ247XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgdmFsaWRQcm9vZihcbiAgICBsYXN0UHJvb2Y6IHN0cmluZyxcbiAgICBwcm9vZjogbnVtYmVyLFxuICAgIGxhc3RIYXNoOiBzdHJpbmcsXG4gICAgYWRkcmVzczogc3RyaW5nXG4gICkge1xuICAgIGNvbnN0IGd1ZXNzID0gYCR7bGFzdFByb29mfSR7cHJvb2Z9JHtsYXN0SGFzaH0ke2FkZHJlc3N9YDtcbiAgICBjb25zdCBndWVzc0hhc2ggPSBzaGEyNTYoZ3Vlc3MpO1xuICAgIC8v5YWI6aCt44GL44KJ77yU5paH5a2X44GM77yQ44Gq44KJ5oiQ5YqfXG4gICAgcmV0dXJuIGRpZmYudGVzdChndWVzc0hhc2gpO1xuICB9XG5cbiAgdmFsaWRDaGFpbihjaGFpbjogQXJyYXk8YW55Pikge1xuICAgIGxldCBpbmRleCA9IDI7XG4gICAgd2hpbGUgKGluZGV4IDwgY2hhaW4ubGVuZ3RoKSB7XG4gICAgICBjb25zdCBwcmV2aW91c0Jsb2NrID0gY2hhaW5baW5kZXggLSAxXTtcbiAgICAgIGNvbnN0IGJsb2NrID0gY2hhaW5baW5kZXhdO1xuXG4gICAgICAvL+ODluODreODg+OCr+OBruaMgeOBpOWJjeOBruODluODreODg+OCr+OBruODj+ODg+OCt+ODpeWApOOBqOWun+mam+OBruWJjeOBrlxuICAgICAgLy/jg5bjg63jg4Pjgq/jga7jg4/jg4Pjgrfjg6XlgKTjgpLmr5TovINcbiAgICAgIGlmIChibG9jay5wcmV2aW91c0hhc2ggIT09IHRoaXMuaGFzaChwcmV2aW91c0Jsb2NrKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICAvL+ODiuODs+OCueOBruWApOOBruaknOiovFxuICAgICAgaWYgKFxuICAgICAgICAhdGhpcy52YWxpZFByb29mKFxuICAgICAgICAgIHByZXZpb3VzQmxvY2sucHJvb2YsXG4gICAgICAgICAgYmxvY2sucHJvb2YsXG4gICAgICAgICAgdGhpcy5oYXNoKGJsb2NrKSxcbiAgICAgICAgICBibG9jay5vd25lclxuICAgICAgICApXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaW5kZXgrKztcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICB2YWxpZFRyYW5zYWN0aW9uKHRyYW5zYWN0aW9uOiBhbnkpIHtcbiAgICBjb25zdCBhbW91bnQgPSB0cmFuc2FjdGlvbi5hbW91bnQ7XG4gICAgY29uc3Qgc2lnbiA9IHRyYW5zYWN0aW9uLnNpZ247XG5cbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLmN1cnJlbnRUcmFuc2FjdGlvbnMuZmluZChwcmV2ID0+IHtcbiAgICAgIHJldHVybiBwcmV2LnNpZ24gPT09IHNpZ247XG4gICAgfSk7XG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgY29uc29sZS5sb2coXCJkdXBsaWNhdGVcIiwgeyB0cmFuc2FjdGlvbiB9LCB7IHJlc3VsdCB9KTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBwdWJsaWNLZXkgPSB0cmFuc2FjdGlvbi5wdWJsaWNLZXk7XG4gICAgY29uc3QgYWRkcmVzcyA9IHRyYW5zYWN0aW9uLnNlbmRlcjtcbiAgICB0cmFuc2FjdGlvbi5zaWduID0gXCJcIjtcblxuICAgIC8v5YWs6ZaL6Y2144GM6YCB6YeR6ICF44Gu44KC44Gu44GL44Gp44GG44GLXG4gICAgaWYgKHNoYTI1NihwdWJsaWNLZXkpID09PSBhZGRyZXNzKSB7XG4gICAgICAvL+e9suWQjeOBjOato+OBl+OBhOOBi+OBqeOBhuOBi1xuICAgICAgLy/lhazplovpjbXjgafnvbLlkI3jgpLop6Poqq3jgZfjg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7Pjga7jg4/jg4Pjgrfjg6XlgKTjgajkuIDoh7TjgZnjgovjgZPjgajjgpLnorroqo3jgZnjgovjgIJcbiAgICAgIGlmICh0aGlzLmN5cGhlci5kZWNyeXB0KHNpZ24sIHB1YmxpY0tleSkgPT09IHRoaXMuaGFzaCh0cmFuc2FjdGlvbikpIHtcbiAgICAgICAgY29uc3QgYmFsYW5jZSA9IHRoaXMubm93QW1vdW50KGFkZHJlc3MpO1xuICAgICAgICAvL+mAgemHkeWPr+iDveOBqumHkemhjeOCkui2heOBiOOBpuOBhOOCi+OBi+OBqeOBhuOBi1xuICAgICAgICBpZiAoYmFsYW5jZSA+PSBhbW91bnQpIHtcbiAgICAgICAgICAvL+a2iOOBl+OBn+e9suWQjeOCkuaIu+OBmVxuICAgICAgICAgIHRyYW5zYWN0aW9uLnNpZ24gPSBzaWduO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgYWRkVHJhbnNhY3Rpb24odHJhbjogYW55KSB7XG4gICAgLy8gdHJ5IHtcblxuICAgIC8vIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgLy8gICBjb25zb2xlLmxvZyh7IHRyYW4gfSk7XG4gICAgLy8gfVxuICAgIGlmICh0aGlzLnZhbGlkVHJhbnNhY3Rpb24odHJhbikpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwidmFsaWRUcmFuc2FjdGlvblwiKTtcbiAgICAgIHRoaXMuY3VycmVudFRyYW5zYWN0aW9ucy5wdXNoKHRyYW4pO1xuICAgICAgdGhpcy5leGN1dGVFdmVudCh0aGlzLmV2ZW50cy5vblRyYW5zYWN0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXCJlcnJvIFRyYW5zYWN0aW9uXCIpO1xuICAgIH1cbiAgfVxuXG4gIHByb29mT2ZXb3JrKCkge1xuICAgIGNvbnN0IGxhc3RCbG9jayA9IHRoaXMubGFzdEJsb2NrKCk7XG4gICAgY29uc3QgbGFzdFByb29mID0gbGFzdEJsb2NrLnByb29mO1xuICAgIGNvbnN0IGxhc3RIYXNoID0gdGhpcy5oYXNoKGxhc3RCbG9jayk7XG5cbiAgICBsZXQgcHJvb2YgPSAwO1xuXG4gICAgd2hpbGUgKCF0aGlzLnZhbGlkUHJvb2YobGFzdFByb29mLCBwcm9vZiwgbGFzdEhhc2gsIHRoaXMuYWRkcmVzcykpIHtcbiAgICAgIC8v44OK44Oz44K544Gu5YCk44KS6Kmm6KGM6Yyv6Kqk55qE44Gr5o6i44GZXG4gICAgICBwcm9vZisrO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9vZjtcbiAgfVxuXG4gIG5vd0Ftb3VudChhZGRyZXNzID0gdGhpcy5hZGRyZXNzKSB7XG4gICAgbGV0IHRva2VuTnVtID0gbmV3IERlY2ltYWwoMC4wKTtcbiAgICB0aGlzLmNoYWluLmZvckVhY2goYmxvY2sgPT4ge1xuICAgICAgYmxvY2sudHJhbnNhY3Rpb25zLmZvckVhY2goKHRyYW5zYWN0aW9uOiBhbnkpID0+IHtcbiAgICAgICAgaWYgKHRyYW5zYWN0aW9uLnJlY2lwaWVudCA9PT0gYWRkcmVzcykge1xuICAgICAgICAgIHRva2VuTnVtID0gdG9rZW5OdW0ucGx1cyhuZXcgRGVjaW1hbChwYXJzZUZsb2F0KHRyYW5zYWN0aW9uLmFtb3VudCkpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHJhbnNhY3Rpb24uc2VuZGVyID09PSBhZGRyZXNzKSB7XG4gICAgICAgICAgdG9rZW5OdW0gPSB0b2tlbk51bS5taW51cyhcbiAgICAgICAgICAgIG5ldyBEZWNpbWFsKHBhcnNlRmxvYXQodHJhbnNhY3Rpb24uYW1vdW50KSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICB0aGlzLmN1cnJlbnRUcmFuc2FjdGlvbnMuZm9yRWFjaCh0cmFuc2FjdGlvbiA9PiB7XG4gICAgICBpZiAodHJhbnNhY3Rpb24ucmVjaXBpZW50ID09PSBhZGRyZXNzKSB7XG4gICAgICAgIHRva2VuTnVtID0gdG9rZW5OdW0ucGx1cyhuZXcgRGVjaW1hbChwYXJzZUZsb2F0KHRyYW5zYWN0aW9uLmFtb3VudCkpKTtcbiAgICAgIH1cbiAgICAgIGlmICh0cmFuc2FjdGlvbi5zZW5kZXIgPT09IGFkZHJlc3MpIHtcbiAgICAgICAgdG9rZW5OdW0gPSB0b2tlbk51bS5taW51cyhuZXcgRGVjaW1hbChwYXJzZUZsb2F0KHRyYW5zYWN0aW9uLmFtb3VudCkpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gdG9rZW5OdW0udG9OdW1iZXIoKTtcbiAgfVxufVxuIl19