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
      console.log("blockchain hash error", {
        block: block
      });
      return false;
    } //ナンスの値の検証


    if (!validProof(previousBlock.proof, block.proof, hash(block), block.owner)) {
      console.log("blockchain nonce error", {
        block: block
      });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL2Jsb2NrY2hhaW4udHMiXSwibmFtZXMiOlsiZGlmZiIsImhhc2giLCJvYmoiLCJvYmpTdHJpbmciLCJKU09OIiwic3RyaW5naWZ5IiwiT2JqZWN0Iiwia2V5cyIsInNvcnQiLCJqc29uU3RyIiwidmFsaWRQcm9vZiIsImxhc3RQcm9vZiIsInByb29mIiwibGFzdEhhc2giLCJhZGRyZXNzIiwiZ3Vlc3MiLCJndWVzc0hhc2giLCJ0ZXN0IiwidmFsaWRDaGFpbiIsImNoYWluIiwiaW5kZXgiLCJsZW5ndGgiLCJwcmV2aW91c0Jsb2NrIiwiYmxvY2siLCJwcmV2aW91c0hhc2giLCJjb25zb2xlIiwibG9nIiwib3duZXIiLCJCbG9ja0NoYWluIiwicGhyYXNlIiwib25BZGRCbG9jayIsInYiLCJvblRyYW5zYWN0aW9uIiwiY3lwaGVyIiwiQ3lwaGVyIiwicHViS2V5IiwibmV3QmxvY2siLCJuZXdUcmFuc2FjdGlvbiIsInR5cGUiLCJTWVNURU0iLCJFVHJhbnNhY3Rpb25UeXBlIiwidHJhbnNhY3Rpb24iLCJwYXlsb2FkIiwidGltZXN0YW1wIiwiRGF0ZSIsIm5vdyIsInRyYW5zYWN0aW9ucyIsImN1cnJlbnRUcmFuc2FjdGlvbnMiLCJsYXN0QmxvY2siLCJwdWJsaWNLZXkiLCJzaWduIiwic2lnbk1lc3NhZ2UiLCJzaWduYXR1cmUiLCJwdXNoIiwic2VuZGVyIiwicmVjaXBpZW50IiwiYW1vdW50IiwiZGF0YSIsInRyYW4iLCJub25jZSIsImdldE5vbmNlIiwiYmxvY2tjaGFpbiIsInZhbGlkQmxvY2siLCJjYWxsYmFjayIsImV2ZW50cyIsIm1lc3NhZ2UiLCJyZXN1bHQiLCJmaW5kIiwicHJldiIsImJhbGFuY2UiLCJub3dBbW91bnQiLCJ2YWxpZFRyYW5zYWN0aW9uIiwidG9rZW5OdW0iLCJEZWNpbWFsIiwiZm9yRWFjaCIsInBsdXMiLCJwYXJzZUZsb2F0IiwibWludXMiLCJ0b051bWJlciJdLCJtYXBwaW5ncyI6Ijs7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LENBQW1CLFVBQUFuRCxLQUFLLEVBQUk7QUFDMUJBLFFBQUFBLEtBQUssQ0FBQ3VCLFlBQU4sQ0FBbUI0QixPQUFuQixDQUEyQixVQUFDakMsV0FBRCxFQUErQjtBQUN4RCxjQUFJQSxXQUFXLENBQUNhLE1BQVosS0FBdUJ4QyxPQUEzQixFQUFvQztBQUNsQzZDLFlBQUFBLEtBQUs7QUFDTjtBQUNGLFNBSkQ7QUFLRCxPQU5EO0FBT0EsV0FBS1osbUJBQUwsQ0FBeUIyQixPQUF6QixDQUFpQyxVQUFBakMsV0FBVyxFQUFJO0FBQzlDLFlBQUlBLFdBQVcsQ0FBQ2MsU0FBWixLQUEwQnpDLE9BQTlCLEVBQXVDO0FBQ3JDNkMsVUFBQUEsS0FBSztBQUNOO0FBQ0YsT0FKRDtBQUtBLGFBQU9BLEtBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBzaGEyNTYgZnJvbSBcInNoYTI1NlwiO1xuaW1wb3J0IHsgRGVjaW1hbCB9IGZyb20gXCJkZWNpbWFsLmpzXCI7XG5pbXBvcnQgQ3lwaGVyIGZyb20gXCIuL2NyeXB0by9jeXBoZXJcIjtcbmltcG9ydCB0eXBlIGZyb20gXCIuL3R5cGVcIjtcbmltcG9ydCB7IEVUcmFuc2FjdGlvblR5cGUgfSBmcm9tIFwiLi9pbnRlcmZhY2VcIjtcbmltcG9ydCB7IGV4Y3V0ZUV2ZW50IH0gZnJvbSBcIi4uL3V0aWxcIjtcbmltcG9ydCB7IHZlcmlmeU1lc3NhZ2VXaXRoUHVibGljS2V5IH0gZnJvbSBcIi4vY3J5cHRvL3NpZ25cIjtcblxuY29uc3QgZGlmZiA9IC9eMDAwLztcblxuZXhwb3J0IGludGVyZmFjZSBJQmxvY2sge1xuICBpbmRleDogbnVtYmVyO1xuICB0aW1lc3RhbXA6IGFueTtcbiAgdHJhbnNhY3Rpb25zOiBJVHJhbnNhY3Rpb25bXTtcbiAgcHJvb2Y6IG51bWJlcjtcbiAgcHJldmlvdXNIYXNoOiBzdHJpbmc7XG4gIG93bmVyOiBzdHJpbmc7XG4gIHB1YmxpY0tleTogc3RyaW5nO1xuICBzaWduOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVRyYW5zYWN0aW9uRGF0YSB7XG4gIHR5cGU6IEVUcmFuc2FjdGlvblR5cGU7XG4gIHBheWxvYWQ6IGFueTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJVHJhbnNhY3Rpb24ge1xuICBzZW5kZXI6IHN0cmluZztcbiAgcmVjaXBpZW50OiBzdHJpbmc7XG4gIGFtb3VudDogbnVtYmVyO1xuICBkYXRhOiBJVHJhbnNhY3Rpb25EYXRhO1xuICBub3c6IGFueTtcbiAgcHVibGljS2V5OiBzdHJpbmc7XG4gIG5vbmNlOiBudW1iZXI7XG4gIHNpZ246IHN0cmluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc2gob2JqOiBhbnkpIHtcbiAgY29uc3Qgb2JqU3RyaW5nID0gSlNPTi5zdHJpbmdpZnkob2JqLCBPYmplY3Qua2V5cyhvYmopLnNvcnQoKSk7XG4gIHJldHVybiBzaGEyNTYob2JqU3RyaW5nKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGpzb25TdHIob2JqOiBhbnkpIHtcbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG9iaiwgT2JqZWN0LmtleXMob2JqKS5zb3J0KCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRQcm9vZihcbiAgbGFzdFByb29mOiBudW1iZXIsXG4gIHByb29mOiBudW1iZXIsXG4gIGxhc3RIYXNoOiBzdHJpbmcsXG4gIGFkZHJlc3M6IHN0cmluZ1xuKSB7XG4gIGNvbnN0IGd1ZXNzID0gYCR7bGFzdFByb29mfSR7cHJvb2Z9JHtsYXN0SGFzaH0ke2FkZHJlc3N9YDtcbiAgY29uc3QgZ3Vlc3NIYXNoID0gc2hhMjU2KGd1ZXNzKTtcbiAgLy/lhYjpoK3jgYvjgonvvJTmloflrZfjgYzvvJDjgarjgonmiJDlip9cbiAgcmV0dXJuIGRpZmYudGVzdChndWVzc0hhc2gpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRDaGFpbihjaGFpbjogSUJsb2NrW10pIHtcbiAgbGV0IGluZGV4ID0gMjtcbiAgd2hpbGUgKGluZGV4IDwgY2hhaW4ubGVuZ3RoKSB7XG4gICAgY29uc3QgcHJldmlvdXNCbG9jayA9IGNoYWluW2luZGV4IC0gMV07XG4gICAgY29uc3QgYmxvY2sgPSBjaGFpbltpbmRleF07XG5cbiAgICAvL+ODluODreODg+OCr+OBruaMgeOBpOWJjeOBruODluODreODg+OCr+OBruODj+ODg+OCt+ODpeWApOOBqOWun+mam+OBruWJjeOBrlxuICAgIC8v44OW44Ot44OD44Kv44Gu44OP44OD44K344Ol5YCk44KS5q+U6LyDXG4gICAgaWYgKGJsb2NrLnByZXZpb3VzSGFzaCAhPT0gaGFzaChwcmV2aW91c0Jsb2NrKSkge1xuICAgICAgY29uc29sZS5sb2coXCJibG9ja2NoYWluIGhhc2ggZXJyb3JcIiwgeyBibG9jayB9KTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy/jg4rjg7Pjgrnjga7lgKTjga7mpJzoqLxcbiAgICBpZiAoXG4gICAgICAhdmFsaWRQcm9vZihwcmV2aW91c0Jsb2NrLnByb29mLCBibG9jay5wcm9vZiwgaGFzaChibG9jayksIGJsb2NrLm93bmVyKVxuICAgICkge1xuICAgICAgY29uc29sZS5sb2coXCJibG9ja2NoYWluIG5vbmNlIGVycm9yXCIsIHsgYmxvY2sgfSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGluZGV4Kys7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJsb2NrQ2hhaW4ge1xuICBjaGFpbjogSUJsb2NrW10gPSBbXTtcbiAgY3VycmVudFRyYW5zYWN0aW9uczogQXJyYXk8YW55PiA9IFtdO1xuICBjeXBoZXI6IEN5cGhlcjtcbiAgYWRkcmVzczogc3RyaW5nO1xuXG4gIGNhbGxiYWNrID0ge1xuICAgIG9uQWRkQmxvY2s6ICh2PzogYW55KSA9PiB7fVxuICB9O1xuXG4gIHByaXZhdGUgb25BZGRCbG9jazogeyBba2V5OiBzdHJpbmddOiAoKSA9PiB2b2lkIH0gPSB7fTtcbiAgcHJpdmF0ZSBvblRyYW5zYWN0aW9uOiB7IFtrZXk6IHN0cmluZ106ICgpID0+IHZvaWQgfSA9IHt9O1xuICBldmVudHMgPSB7XG4gICAgb25BZGRCbG9jazogdGhpcy5vbkFkZEJsb2NrLFxuICAgIG9uVHJhbnNhY3Rpb246IHRoaXMub25UcmFuc2FjdGlvblxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHBocmFzZT86IHN0cmluZykge1xuICAgIHRoaXMuY3lwaGVyID0gbmV3IEN5cGhlcihwaHJhc2UpO1xuICAgIHRoaXMuYWRkcmVzcyA9IHNoYTI1Nih0aGlzLmN5cGhlci5wdWJLZXkpO1xuICAgIHRoaXMubmV3QmxvY2soMCwgXCJnZW5lc2lzXCIpO1xuICB9XG5cbiAgbmV3QmxvY2socHJvb2Y6IGFueSwgcHJldmlvdXNIYXNoOiBzdHJpbmcpIHtcbiAgICAvL+aOoeaOmOWgsemFrFxuICAgIHRoaXMubmV3VHJhbnNhY3Rpb24odHlwZS5TWVNURU0sIHRoaXMuYWRkcmVzcywgMSwge1xuICAgICAgdHlwZTogRVRyYW5zYWN0aW9uVHlwZS50cmFuc2FjdGlvbixcbiAgICAgIHBheWxvYWQ6IFwicmV3YXJkXCJcbiAgICB9KTtcblxuICAgIGNvbnN0IGJsb2NrOiBJQmxvY2sgPSB7XG4gICAgICBpbmRleDogdGhpcy5jaGFpbi5sZW5ndGggKyAxLCAvL+ODluODreODg+OCr+OBrueVquWPt1xuICAgICAgdGltZXN0YW1wOiBEYXRlLm5vdygpLCAvL+OCv+OCpOODoOOCueOCv+ODs+ODl1xuICAgICAgdHJhbnNhY3Rpb25zOiB0aGlzLmN1cnJlbnRUcmFuc2FjdGlvbnMsIC8v44OI44Op44Oz44K244Kv44K344On44Oz44Gu5aGKXG4gICAgICBwcm9vZjogcHJvb2YsIC8v44OK44Oz44K5XG4gICAgICBwcmV2aW91c0hhc2g6IHByZXZpb3VzSGFzaCB8fCBoYXNoKHRoaXMubGFzdEJsb2NrKCkpLCAvL+WJjeOBruODluODreODg+OCr+OBruODj+ODg+OCt+ODpeWApFxuICAgICAgb3duZXI6IHRoaXMuYWRkcmVzcywgLy/jgZPjga7jg5bjg63jg4Pjgq/jgpLkvZzjgaPjgZ/kurpcbiAgICAgIHB1YmxpY0tleTogdGhpcy5jeXBoZXIucHViS2V5LCAvL+OBk+OBruODluODreODg+OCr+OCkuS9nOOBo+OBn+S6uuOBruWFrOmWi+mNtVxuICAgICAgc2lnbjogXCJcIiAvL+OBk+OBruODluODreODg+OCr+OCkuS9nOOBo+OBn+S6uuOBrue9suWQjVxuICAgIH07XG4gICAgLy/nvbLlkI3jgpLnlJ/miJBcbiAgICBibG9jay5zaWduID0gdGhpcy5jeXBoZXIuc2lnbk1lc3NhZ2UoaGFzaChibG9jaykpLnNpZ25hdHVyZTtcbiAgICAvL+ODluODreODg+OCr+ODgeOCp+ODvOODs+OBq+i/veWKoFxuICAgIHRoaXMuY2hhaW4ucHVzaChibG9jayk7XG5cbiAgICAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+ODl+ODvOODq+OCkuODquOCu+ODg+ODiFxuICAgIHRoaXMuY3VycmVudFRyYW5zYWN0aW9ucyA9IFtdO1xuICAgIGNvbnNvbGUubG9nKFwibmV3IGJsb2NrIGRvbmVcIiwgdGhpcy5jaGFpbik7XG4gICAgcmV0dXJuIGJsb2NrO1xuICB9XG5cbiAgbmV3VHJhbnNhY3Rpb24oXG4gICAgc2VuZGVyOiBzdHJpbmcsXG4gICAgcmVjaXBpZW50OiBzdHJpbmcsXG4gICAgYW1vdW50OiBudW1iZXIsXG4gICAgZGF0YTogeyB0eXBlOiBFVHJhbnNhY3Rpb25UeXBlOyBwYXlsb2FkOiBhbnkgfSxcbiAgICBjeXBoZXIgPSB0aGlzLmN5cGhlclxuICApIHtcbiAgICBjb25zdCB0cmFuOiBJVHJhbnNhY3Rpb24gPSB7XG4gICAgICBzZW5kZXI6IHNlbmRlciwgLy/pgIHkv6HjgqLjg4njg6zjgrlcbiAgICAgIHJlY2lwaWVudDogcmVjaXBpZW50LCAvL+WPl+WPluOCouODieODrOOCuVxuICAgICAgYW1vdW50OiBhbW91bnQsIC8v6YePXG4gICAgICBkYXRhOiBkYXRhLCAvL+S7u+aEj+OBruODoeODg+OCu+ODvOOCuFxuICAgICAgbm93OiBEYXRlLm5vdygpLCAvL+OCv+OCpOODoOOCueOCv+ODs+ODl1xuICAgICAgcHVibGljS2V5OiBjeXBoZXIucHViS2V5LCAvL+WFrOmWi+mNtSxcbiAgICAgIG5vbmNlOiB0aGlzLmdldE5vbmNlKCksXG4gICAgICBzaWduOiBcIlwiIC8v572y5ZCNXG4gICAgfTtcbiAgICB0cmFuLnNpZ24gPSBjeXBoZXIuc2lnbk1lc3NhZ2UoaGFzaCh0cmFuKSkuc2lnbmF0dXJlO1xuICAgIC8v44OI44Op44Oz44K244Kv44K344On44Oz44KS6L+95YqgXG4gICAgdGhpcy5jdXJyZW50VHJhbnNhY3Rpb25zLnB1c2godHJhbik7XG5cbiAgICByZXR1cm4gdHJhbjtcbiAgfVxuXG4gIGxhc3RCbG9jayhibG9ja2NoYWluID0gdGhpcy5jaGFpbik6IElCbG9jayB7XG4gICAgcmV0dXJuIGJsb2NrY2hhaW5bYmxvY2tjaGFpbi5sZW5ndGggLSAxXTtcbiAgfVxuXG4gIGFkZEJsb2NrKGJsb2NrOiBJQmxvY2spIHtcbiAgICBpZiAodGhpcy52YWxpZEJsb2NrKGJsb2NrKSkge1xuICAgICAgY29uc29sZS5sb2coXCJ2YWxpZEJsb2NrXCIpO1xuICAgICAgdGhpcy5jdXJyZW50VHJhbnNhY3Rpb25zID0gW107XG4gICAgICB0aGlzLmNoYWluLnB1c2goYmxvY2spO1xuXG4gICAgICB0aGlzLmNhbGxiYWNrLm9uQWRkQmxvY2soKTtcbiAgICAgIGV4Y3V0ZUV2ZW50KHRoaXMuZXZlbnRzLm9uQWRkQmxvY2spO1xuICAgIH1cbiAgfVxuXG4gIHZhbGlkQmxvY2soYmxvY2s6IElCbG9jaykge1xuICAgIGNvbnN0IGxhc3RCbG9jayA9IHRoaXMubGFzdEJsb2NrKCk7XG4gICAgY29uc3QgbGFzdFByb29mID0gbGFzdEJsb2NrLnByb29mO1xuICAgIGNvbnN0IGxhc3RIYXNoID0gaGFzaChsYXN0QmxvY2spO1xuICAgIGNvbnN0IG93bmVyID0gYmxvY2sub3duZXI7XG4gICAgY29uc3Qgc2lnbiA9IGJsb2NrLnNpZ247XG4gICAgY29uc3QgcHVibGljS2V5ID0gYmxvY2sucHVibGljS2V5O1xuICAgIGJsb2NrLnNpZ24gPSBcIlwiO1xuXG4gICAgLy/nvbLlkI3jgYzmraPjgZfjgYTjgYvjganjgYbjgYtcbiAgICBpZiAoXG4gICAgICB2ZXJpZnlNZXNzYWdlV2l0aFB1YmxpY0tleSh7XG4gICAgICAgIG1lc3NhZ2U6IGhhc2goYmxvY2spLFxuICAgICAgICBwdWJsaWNLZXksXG4gICAgICAgIHNpZ25hdHVyZTogc2lnblxuICAgICAgfSlcbiAgICApIHtcbiAgICAgIGJsb2NrLnNpZ24gPSBzaWduO1xuICAgICAgLy/jg4rjg7PjgrnjgYzmraPjgZfjgYTjgYvjganjgYbjgYtcbiAgICAgIGlmICh2YWxpZFByb29mKGxhc3RQcm9vZiwgYmxvY2sucHJvb2YsIGxhc3RIYXNoLCBvd25lcikpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcImJsb2NrIG5vbmNlIGVycm9yXCIsIHRoaXMuYWRkcmVzcywgdGhpcy5jaGFpbik7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXCJibG9jayBzaWduIGVycm9yXCIsIHRoaXMuYWRkcmVzcyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgdmFsaWRUcmFuc2FjdGlvbih0cmFuc2FjdGlvbjogSVRyYW5zYWN0aW9uKSB7XG4gICAgY29uc3QgYW1vdW50ID0gdHJhbnNhY3Rpb24uYW1vdW50O1xuICAgIGNvbnN0IHNpZ24gPSB0cmFuc2FjdGlvbi5zaWduO1xuXG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5jdXJyZW50VHJhbnNhY3Rpb25zLmZpbmQocHJldiA9PiB7XG4gICAgICByZXR1cm4gcHJldi5zaWduID09PSBzaWduO1xuICAgIH0pO1xuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZHVwbGljYXRlIGVycm9yXCIsIHsgcmVzdWx0IH0pO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IHB1YmxpY0tleSA9IHRyYW5zYWN0aW9uLnB1YmxpY0tleTtcbiAgICBjb25zdCBhZGRyZXNzID0gdHJhbnNhY3Rpb24uc2VuZGVyO1xuICAgIHRyYW5zYWN0aW9uLnNpZ24gPSBcIlwiO1xuXG4gICAgLy/lhazplovpjbXjgYzpgIHph5HogIXjga7jgoLjga7jgYvjganjgYbjgYtcbiAgICBpZiAoc2hhMjU2KHB1YmxpY0tleSkgPT09IGFkZHJlc3MpIHtcbiAgICAgIC8v572y5ZCN44GM5q2j44GX44GE44GL44Gp44GG44GLXG4gICAgICAvL+WFrOmWi+mNteOBp+e9suWQjeOCkuino+iqreOBl+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OBruODj+ODg+OCt+ODpeWApOOBqOS4gOiHtOOBmeOCi+OBk+OBqOOCkueiuuiqjeOBmeOCi+OAglxuICAgICAgaWYgKFxuICAgICAgICB2ZXJpZnlNZXNzYWdlV2l0aFB1YmxpY0tleSh7XG4gICAgICAgICAgbWVzc2FnZTogaGFzaCh0cmFuc2FjdGlvbiksXG4gICAgICAgICAgcHVibGljS2V5LFxuICAgICAgICAgIHNpZ25hdHVyZTogc2lnblxuICAgICAgICB9KVxuICAgICAgKSB7XG4gICAgICAgIGNvbnN0IGJhbGFuY2UgPSB0aGlzLm5vd0Ftb3VudChhZGRyZXNzKTtcbiAgICAgICAgLy/pgIHph5Hlj6/og73jgarph5HpoY3jgpLotoXjgYjjgabjgYTjgovjgYvjganjgYbjgYtcbiAgICAgICAgaWYgKGJhbGFuY2UgPj0gYW1vdW50KSB7XG4gICAgICAgICAgLy/mtojjgZfjgZ/nvbLlkI3jgpLmiLvjgZlcbiAgICAgICAgICB0cmFuc2FjdGlvbi5zaWduID0gc2lnbjtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImJhbGFuY2UgZXJyb3JcIiwgYW1vdW50LCBiYWxhbmNlKTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic2lnbiBlcnJvclwiKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcInB1YmtleSBlcnJvclwiKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBhZGRUcmFuc2FjdGlvbih0cmFuOiBJVHJhbnNhY3Rpb24pIHtcbiAgICBpZiAodGhpcy52YWxpZFRyYW5zYWN0aW9uKHRyYW4pKSB7XG4gICAgICBjb25zb2xlLmxvZyhcInZhbGlkVHJhbnNhY3Rpb25cIiwgeyB0cmFuIH0pO1xuICAgICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgpLov73liqBcbiAgICAgIHRoaXMuY3VycmVudFRyYW5zYWN0aW9ucy5wdXNoKHRyYW4pO1xuICAgICAgZXhjdXRlRXZlbnQodGhpcy5ldmVudHMub25UcmFuc2FjdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZXJyb3IgVHJhbnNhY3Rpb25cIik7XG4gICAgfVxuICB9XG5cbiAgcHJvb2ZPZldvcmsoKSB7XG4gICAgY29uc3QgbGFzdEJsb2NrID0gdGhpcy5sYXN0QmxvY2soKTtcbiAgICBjb25zdCBsYXN0UHJvb2YgPSBsYXN0QmxvY2sucHJvb2Y7XG4gICAgY29uc3QgbGFzdEhhc2ggPSBoYXNoKGxhc3RCbG9jayk7XG5cbiAgICBsZXQgcHJvb2YgPSAwO1xuXG4gICAgd2hpbGUgKCF2YWxpZFByb29mKGxhc3RQcm9vZiwgcHJvb2YsIGxhc3RIYXNoLCB0aGlzLmFkZHJlc3MpKSB7XG4gICAgICAvL+ODiuODs+OCueOBruWApOOCkuippuihjOmMr+iqpOeahOOBq+aOouOBmVxuICAgICAgcHJvb2YrKztcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvb2Y7XG4gIH1cblxuICBub3dBbW91bnQoYWRkcmVzcyA9IHRoaXMuYWRkcmVzcykge1xuICAgIGxldCB0b2tlbk51bSA9IG5ldyBEZWNpbWFsKDAuMCk7XG4gICAgdGhpcy5jaGFpbi5mb3JFYWNoKGJsb2NrID0+IHtcbiAgICAgIGJsb2NrLnRyYW5zYWN0aW9ucy5mb3JFYWNoKCh0cmFuc2FjdGlvbjogYW55KSA9PiB7XG4gICAgICAgIGlmICh0cmFuc2FjdGlvbi5yZWNpcGllbnQgPT09IGFkZHJlc3MpIHtcbiAgICAgICAgICB0b2tlbk51bSA9IHRva2VuTnVtLnBsdXMobmV3IERlY2ltYWwocGFyc2VGbG9hdCh0cmFuc2FjdGlvbi5hbW91bnQpKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRyYW5zYWN0aW9uLnNlbmRlciA9PT0gYWRkcmVzcykge1xuICAgICAgICAgIHRva2VuTnVtID0gdG9rZW5OdW0ubWludXMoXG4gICAgICAgICAgICBuZXcgRGVjaW1hbChwYXJzZUZsb2F0KHRyYW5zYWN0aW9uLmFtb3VudCkpXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgdGhpcy5jdXJyZW50VHJhbnNhY3Rpb25zLmZvckVhY2godHJhbnNhY3Rpb24gPT4ge1xuICAgICAgaWYgKHRyYW5zYWN0aW9uLnJlY2lwaWVudCA9PT0gYWRkcmVzcykge1xuICAgICAgICB0b2tlbk51bSA9IHRva2VuTnVtLnBsdXMobmV3IERlY2ltYWwocGFyc2VGbG9hdCh0cmFuc2FjdGlvbi5hbW91bnQpKSk7XG4gICAgICB9XG4gICAgICBpZiAodHJhbnNhY3Rpb24uc2VuZGVyID09PSBhZGRyZXNzKSB7XG4gICAgICAgIHRva2VuTnVtID0gdG9rZW5OdW0ubWludXMobmV3IERlY2ltYWwocGFyc2VGbG9hdCh0cmFuc2FjdGlvbi5hbW91bnQpKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHRva2VuTnVtLnRvTnVtYmVyKCk7XG4gIH1cblxuICBnZXROb25jZShhZGRyZXNzID0gdGhpcy5hZGRyZXNzKSB7XG4gICAgbGV0IG5vbmNlID0gMDtcbiAgICB0aGlzLmNoYWluLmZvckVhY2goYmxvY2sgPT4ge1xuICAgICAgYmxvY2sudHJhbnNhY3Rpb25zLmZvckVhY2goKHRyYW5zYWN0aW9uOiBJVHJhbnNhY3Rpb24pID0+IHtcbiAgICAgICAgaWYgKHRyYW5zYWN0aW9uLnNlbmRlciA9PT0gYWRkcmVzcykge1xuICAgICAgICAgIG5vbmNlKys7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHRoaXMuY3VycmVudFRyYW5zYWN0aW9ucy5mb3JFYWNoKHRyYW5zYWN0aW9uID0+IHtcbiAgICAgIGlmICh0cmFuc2FjdGlvbi5yZWNpcGllbnQgPT09IGFkZHJlc3MpIHtcbiAgICAgICAgbm9uY2UrKztcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbm9uY2U7XG4gIH1cbn1cbiJdfQ==