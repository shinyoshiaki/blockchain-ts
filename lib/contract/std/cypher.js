"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _encrypt = require("../../blockchain/crypto/encrypt");

var _sign = require("../../blockchain/crypto/sign");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Cypher = function Cypher(accout) {
  var _this = this;

  _classCallCheck(this, Cypher);

  _defineProperty(this, "accout", void 0);

  _defineProperty(this, "phrase", void 0);

  _defineProperty(this, "encrypt", function (raw, recipientPublicKey) {
    var result = (0, _encrypt.encryptMessageWithPassphrase)(raw, _this.phrase, recipientPublicKey);
    return JSON.stringify(result);
  });

  _defineProperty(this, "decrypt", function (encrypted) {
    var json = JSON.parse(encrypted);
    var result = (0, _encrypt.decryptMessageWithPassphrase)(json.encryptedMessage, json.nonce, _this.phrase, json.senderPublickey);
    return result;
  });

  _defineProperty(this, "signMessage", function (seed) {
    return (0, _sign.signMessageWithPassphrase)(seed, _this.phrase);
  });

  _defineProperty(this, "verifyMessage", function (message, publicKey, signature) {
    return (0, _sign.verifyMessageWithPublicKey)({
      message: message,
      publicKey: publicKey,
      signature: signature
    });
  });

  this.phrase = accout.phrase;
  this.accout = accout;
};

exports.default = Cypher;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cmFjdC9zdGQvY3lwaGVyLnRzIl0sIm5hbWVzIjpbIkN5cGhlciIsImFjY291dCIsInJhdyIsInJlY2lwaWVudFB1YmxpY0tleSIsInJlc3VsdCIsInBocmFzZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJlbmNyeXB0ZWQiLCJqc29uIiwicGFyc2UiLCJlbmNyeXB0ZWRNZXNzYWdlIiwibm9uY2UiLCJzZW5kZXJQdWJsaWNrZXkiLCJzZWVkIiwibWVzc2FnZSIsInB1YmxpY0tleSIsInNpZ25hdHVyZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUtBOzs7Ozs7SUFNcUJBLE0sR0FJbkIsZ0JBQVlDLE1BQVosRUFBNkI7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQSxtQ0FLbkIsVUFBQ0MsR0FBRCxFQUFjQyxrQkFBZCxFQUE2QztBQUNyRCxRQUFNQyxNQUFNLEdBQUcsMkNBQ2JGLEdBRGEsRUFFYixLQUFJLENBQUNHLE1BRlEsRUFHYkYsa0JBSGEsQ0FBZjtBQUtBLFdBQU9HLElBQUksQ0FBQ0MsU0FBTCxDQUFlSCxNQUFmLENBQVA7QUFDRCxHQVo0Qjs7QUFBQSxtQ0FjbkIsVUFBQ0ksU0FBRCxFQUF1QjtBQUMvQixRQUFNQyxJQUErQixHQUFHSCxJQUFJLENBQUNJLEtBQUwsQ0FBV0YsU0FBWCxDQUF4QztBQUNBLFFBQU1KLE1BQU0sR0FBRywyQ0FDYkssSUFBSSxDQUFDRSxnQkFEUSxFQUViRixJQUFJLENBQUNHLEtBRlEsRUFHYixLQUFJLENBQUNQLE1BSFEsRUFJYkksSUFBSSxDQUFDSSxlQUpRLENBQWY7QUFNQSxXQUFPVCxNQUFQO0FBQ0QsR0F2QjRCOztBQUFBLHVDQXlCZixVQUFDVSxJQUFELEVBQWtCO0FBQzlCLFdBQU8scUNBQTBCQSxJQUExQixFQUFnQyxLQUFJLENBQUNULE1BQXJDLENBQVA7QUFDRCxHQTNCNEI7O0FBQUEseUNBNkJiLFVBQUNVLE9BQUQsRUFBa0JDLFNBQWxCLEVBQXFDQyxTQUFyQyxFQUEyRDtBQUN6RSxXQUFPLHNDQUEyQjtBQUFFRixNQUFBQSxPQUFPLEVBQVBBLE9BQUY7QUFBV0MsTUFBQUEsU0FBUyxFQUFUQSxTQUFYO0FBQXNCQyxNQUFBQSxTQUFTLEVBQVRBO0FBQXRCLEtBQTNCLENBQVA7QUFDRCxHQS9CNEI7O0FBQzNCLE9BQUtaLE1BQUwsR0FBY0osTUFBTSxDQUFDSSxNQUFyQjtBQUNBLE9BQUtKLE1BQUwsR0FBY0EsTUFBZDtBQUNELEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBlbmNyeXB0TWVzc2FnZVdpdGhQYXNzcGhyYXNlLFxuICBFbmNyeXB0ZWRNZXNzYWdlV2l0aE5vbmNlLFxuICBkZWNyeXB0TWVzc2FnZVdpdGhQYXNzcGhyYXNlXG59IGZyb20gXCIuLi8uLi9ibG9ja2NoYWluL2NyeXB0by9lbmNyeXB0XCI7XG5pbXBvcnQge1xuICBzaWduTWVzc2FnZVdpdGhQYXNzcGhyYXNlLFxuICB2ZXJpZnlNZXNzYWdlV2l0aFB1YmxpY0tleVxufSBmcm9tIFwiLi4vLi4vYmxvY2tjaGFpbi9jcnlwdG8vc2lnblwiO1xuaW1wb3J0IEFjY291bnQgZnJvbSBcIi4uLy4uL2Jsb2NrY2hhaW4vYWNjb3VudFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDeXBoZXIge1xuICBhY2NvdXQ6IEFjY291bnQ7XG4gIHBocmFzZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGFjY291dDogQWNjb3VudCkge1xuICAgIHRoaXMucGhyYXNlID0gYWNjb3V0LnBocmFzZTtcbiAgICB0aGlzLmFjY291dCA9IGFjY291dDtcbiAgfVxuXG4gIGVuY3J5cHQgPSAocmF3OiBzdHJpbmcsIHJlY2lwaWVudFB1YmxpY0tleTogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gZW5jcnlwdE1lc3NhZ2VXaXRoUGFzc3BocmFzZShcbiAgICAgIHJhdyxcbiAgICAgIHRoaXMucGhyYXNlLFxuICAgICAgcmVjaXBpZW50UHVibGljS2V5XG4gICAgKTtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocmVzdWx0KTtcbiAgfTtcblxuICBkZWNyeXB0ID0gKGVuY3J5cHRlZDogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QganNvbjogRW5jcnlwdGVkTWVzc2FnZVdpdGhOb25jZSA9IEpTT04ucGFyc2UoZW5jcnlwdGVkKTtcbiAgICBjb25zdCByZXN1bHQgPSBkZWNyeXB0TWVzc2FnZVdpdGhQYXNzcGhyYXNlKFxuICAgICAganNvbi5lbmNyeXB0ZWRNZXNzYWdlLFxuICAgICAganNvbi5ub25jZSxcbiAgICAgIHRoaXMucGhyYXNlLFxuICAgICAganNvbi5zZW5kZXJQdWJsaWNrZXlcbiAgICApO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgc2lnbk1lc3NhZ2UgPSAoc2VlZDogc3RyaW5nKSA9PiB7XG4gICAgcmV0dXJuIHNpZ25NZXNzYWdlV2l0aFBhc3NwaHJhc2Uoc2VlZCwgdGhpcy5waHJhc2UpO1xuICB9O1xuXG4gIHZlcmlmeU1lc3NhZ2UgPSAobWVzc2FnZTogc3RyaW5nLCBwdWJsaWNLZXk6IHN0cmluZywgc2lnbmF0dXJlOiBzdHJpbmcpID0+IHtcbiAgICByZXR1cm4gdmVyaWZ5TWVzc2FnZVdpdGhQdWJsaWNLZXkoeyBtZXNzYWdlLCBwdWJsaWNLZXksIHNpZ25hdHVyZSB9KTtcbiAgfTtcbn1cbiJdfQ==