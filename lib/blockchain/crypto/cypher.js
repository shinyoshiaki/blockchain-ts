"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _bitcoreMnemonic = _interopRequireDefault(require("bitcore-mnemonic"));

var _buffer = require("./buffer");

var _sign = require("./sign");

var _keys = require("./keys");

var _encrypt = require("./encrypt");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Cypher =
/*#__PURE__*/
function () {
  function Cypher(phrase) {
    _classCallCheck(this, Cypher);

    _defineProperty(this, "mnemonic", void 0);

    _defineProperty(this, "secKey", void 0);

    _defineProperty(this, "pubKey", void 0);

    _defineProperty(this, "phrase", void 0);

    if (phrase) {
      this.mnemonic = new _bitcoreMnemonic.default(phrase);
      this.phrase = phrase;
    } else {
      this.mnemonic = new _bitcoreMnemonic.default();
      this.phrase = this.mnemonic.toString();
    }

    var _getPrivateAndPublicK = (0, _keys.getPrivateAndPublicKeyBytesFromPassphrase)(this.phrase),
        privateKeyBytes = _getPrivateAndPublicK.privateKeyBytes,
        publicKeyBytes = _getPrivateAndPublicK.publicKeyBytes;

    this.pubKey = (0, _buffer.bufferToHex)(publicKeyBytes);
    this.secKey = (0, _buffer.bufferToHex)(privateKeyBytes);
  }

  _createClass(Cypher, [{
    key: "encrypt",
    value: function encrypt(raw, recipientPublicKey) {
      var result = (0, _encrypt.encryptMessageWithPassphrase)(raw, this.phrase, recipientPublicKey);
      return JSON.stringify(result);
    }
  }, {
    key: "decrypt",
    value: function decrypt(encrypted) {
      var json = JSON.parse(encrypted);
      console.log({
        json: json
      });
      var result = (0, _encrypt.decryptMessageWithPassphrase)(json.encryptedMessage, json.nonce, this.phrase, json.senderPublickey);
      return result;
    }
  }, {
    key: "signMessage",
    value: function signMessage(raw) {
      return (0, _sign.signMessageWithPassphrase)(raw, this.phrase);
    }
  }]);

  return Cypher;
}();

exports.default = Cypher;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ibG9ja2NoYWluL2NyeXB0by9jeXBoZXIudHMiXSwibmFtZXMiOlsiQ3lwaGVyIiwicGhyYXNlIiwibW5lbW9uaWMiLCJNbmVtb25pYyIsInRvU3RyaW5nIiwicHJpdmF0ZUtleUJ5dGVzIiwicHVibGljS2V5Qnl0ZXMiLCJwdWJLZXkiLCJzZWNLZXkiLCJyYXciLCJyZWNpcGllbnRQdWJsaWNLZXkiLCJyZXN1bHQiLCJKU09OIiwic3RyaW5naWZ5IiwiZW5jcnlwdGVkIiwianNvbiIsInBhcnNlIiwiY29uc29sZSIsImxvZyIsImVuY3J5cHRlZE1lc3NhZ2UiLCJub25jZSIsInNlbmRlclB1YmxpY2tleSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7SUFNcUJBLE07OztBQUtuQixrQkFBWUMsTUFBWixFQUE2QjtBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUMzQixRQUFJQSxNQUFKLEVBQVk7QUFDVixXQUFLQyxRQUFMLEdBQWdCLElBQUlDLHdCQUFKLENBQWFGLE1BQWIsQ0FBaEI7QUFDQSxXQUFLQSxNQUFMLEdBQWNBLE1BQWQ7QUFDRCxLQUhELE1BR087QUFDTCxXQUFLQyxRQUFMLEdBQWdCLElBQUlDLHdCQUFKLEVBQWhCO0FBQ0EsV0FBS0YsTUFBTCxHQUFjLEtBQUtDLFFBQUwsQ0FBY0UsUUFBZCxFQUFkO0FBQ0Q7O0FBUDBCLGdDQVd2QixxREFBMEMsS0FBS0gsTUFBL0MsQ0FYdUI7QUFBQSxRQVN6QkksZUFUeUIseUJBU3pCQSxlQVR5QjtBQUFBLFFBVXpCQyxjQVZ5Qix5QkFVekJBLGNBVnlCOztBQVkzQixTQUFLQyxNQUFMLEdBQWMseUJBQVlELGNBQVosQ0FBZDtBQUNBLFNBQUtFLE1BQUwsR0FBYyx5QkFBWUgsZUFBWixDQUFkO0FBQ0Q7Ozs7NEJBRU9JLEcsRUFBYUMsa0IsRUFBNEI7QUFDL0MsVUFBTUMsTUFBTSxHQUFHLDJDQUNiRixHQURhLEVBRWIsS0FBS1IsTUFGUSxFQUdiUyxrQkFIYSxDQUFmO0FBS0EsYUFBT0UsSUFBSSxDQUFDQyxTQUFMLENBQWVGLE1BQWYsQ0FBUDtBQUNEOzs7NEJBRU9HLFMsRUFBbUI7QUFDekIsVUFBTUMsSUFBK0IsR0FBR0gsSUFBSSxDQUFDSSxLQUFMLENBQVdGLFNBQVgsQ0FBeEM7QUFDQUcsTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVk7QUFBRUgsUUFBQUEsSUFBSSxFQUFKQTtBQUFGLE9BQVo7QUFDQSxVQUFNSixNQUFNLEdBQUcsMkNBQ2JJLElBQUksQ0FBQ0ksZ0JBRFEsRUFFYkosSUFBSSxDQUFDSyxLQUZRLEVBR2IsS0FBS25CLE1BSFEsRUFJYmMsSUFBSSxDQUFDTSxlQUpRLENBQWY7QUFNQSxhQUFPVixNQUFQO0FBQ0Q7OztnQ0FFV0YsRyxFQUFhO0FBQ3ZCLGFBQU8scUNBQTBCQSxHQUExQixFQUErQixLQUFLUixNQUFwQyxDQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTW5lbW9uaWMgZnJvbSBcImJpdGNvcmUtbW5lbW9uaWNcIjtcbmltcG9ydCB7IGJ1ZmZlclRvSGV4IH0gZnJvbSBcIi4vYnVmZmVyXCI7XG5pbXBvcnQgeyBzaWduTWVzc2FnZVdpdGhQYXNzcGhyYXNlIH0gZnJvbSBcIi4vc2lnblwiO1xuaW1wb3J0IHsgZ2V0UHJpdmF0ZUFuZFB1YmxpY0tleUJ5dGVzRnJvbVBhc3NwaHJhc2UgfSBmcm9tIFwiLi9rZXlzXCI7XG5pbXBvcnQge1xuICBlbmNyeXB0TWVzc2FnZVdpdGhQYXNzcGhyYXNlLFxuICBkZWNyeXB0TWVzc2FnZVdpdGhQYXNzcGhyYXNlLFxuICBFbmNyeXB0ZWRNZXNzYWdlV2l0aE5vbmNlXG59IGZyb20gXCIuL2VuY3J5cHRcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ3lwaGVyIHtcbiAgbW5lbW9uaWM6IE1uZW1vbmljO1xuICBzZWNLZXk6IHN0cmluZztcbiAgcHViS2V5OiBzdHJpbmc7XG4gIHBocmFzZTogc3RyaW5nO1xuICBjb25zdHJ1Y3RvcihwaHJhc2U/OiBzdHJpbmcpIHtcbiAgICBpZiAocGhyYXNlKSB7XG4gICAgICB0aGlzLm1uZW1vbmljID0gbmV3IE1uZW1vbmljKHBocmFzZSk7XG4gICAgICB0aGlzLnBocmFzZSA9IHBocmFzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5tbmVtb25pYyA9IG5ldyBNbmVtb25pYygpO1xuICAgICAgdGhpcy5waHJhc2UgPSB0aGlzLm1uZW1vbmljLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGNvbnN0IHtcbiAgICAgIHByaXZhdGVLZXlCeXRlcyxcbiAgICAgIHB1YmxpY0tleUJ5dGVzXG4gICAgfSA9IGdldFByaXZhdGVBbmRQdWJsaWNLZXlCeXRlc0Zyb21QYXNzcGhyYXNlKHRoaXMucGhyYXNlKTtcbiAgICB0aGlzLnB1YktleSA9IGJ1ZmZlclRvSGV4KHB1YmxpY0tleUJ5dGVzKTtcbiAgICB0aGlzLnNlY0tleSA9IGJ1ZmZlclRvSGV4KHByaXZhdGVLZXlCeXRlcyk7XG4gIH1cblxuICBlbmNyeXB0KHJhdzogc3RyaW5nLCByZWNpcGllbnRQdWJsaWNLZXk6IHN0cmluZykge1xuICAgIGNvbnN0IHJlc3VsdCA9IGVuY3J5cHRNZXNzYWdlV2l0aFBhc3NwaHJhc2UoXG4gICAgICByYXcsXG4gICAgICB0aGlzLnBocmFzZSxcbiAgICAgIHJlY2lwaWVudFB1YmxpY0tleVxuICAgICk7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHJlc3VsdCk7XG4gIH1cblxuICBkZWNyeXB0KGVuY3J5cHRlZDogc3RyaW5nKSB7XG4gICAgY29uc3QganNvbjogRW5jcnlwdGVkTWVzc2FnZVdpdGhOb25jZSA9IEpTT04ucGFyc2UoZW5jcnlwdGVkKTtcbiAgICBjb25zb2xlLmxvZyh7IGpzb24gfSk7XG4gICAgY29uc3QgcmVzdWx0ID0gZGVjcnlwdE1lc3NhZ2VXaXRoUGFzc3BocmFzZShcbiAgICAgIGpzb24uZW5jcnlwdGVkTWVzc2FnZSxcbiAgICAgIGpzb24ubm9uY2UsXG4gICAgICB0aGlzLnBocmFzZSxcbiAgICAgIGpzb24uc2VuZGVyUHVibGlja2V5XG4gICAgKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgc2lnbk1lc3NhZ2UocmF3OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gc2lnbk1lc3NhZ2VXaXRoUGFzc3BocmFzZShyYXcsIHRoaXMucGhyYXNlKTtcbiAgfVxufVxuIl19