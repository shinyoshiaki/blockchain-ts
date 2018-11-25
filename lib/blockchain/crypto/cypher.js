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
      var result = (0, _sign.signMessageWithPassphrase)(raw, this.phrase);
      return {
        message: result.message,
        signature: result.signature
      };
    }
  }, {
    key: "verifyMessage",
    value: function verifyMessage(_ref) {
      var message = _ref.message,
          publicKey = _ref.publicKey,
          signature = _ref.signature;
      return (0, _sign.verifyMessageWithPublicKey)({
        message: message,
        publicKey: publicKey,
        signature: signature
      });
    }
  }]);

  return Cypher;
}();

exports.default = Cypher;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ibG9ja2NoYWluL2NyeXB0by9jeXBoZXIudHMiXSwibmFtZXMiOlsiQ3lwaGVyIiwicGhyYXNlIiwibW5lbW9uaWMiLCJNbmVtb25pYyIsInRvU3RyaW5nIiwicHJpdmF0ZUtleUJ5dGVzIiwicHVibGljS2V5Qnl0ZXMiLCJwdWJLZXkiLCJzZWNLZXkiLCJyYXciLCJyZWNpcGllbnRQdWJsaWNLZXkiLCJyZXN1bHQiLCJKU09OIiwic3RyaW5naWZ5IiwiZW5jcnlwdGVkIiwianNvbiIsInBhcnNlIiwiY29uc29sZSIsImxvZyIsImVuY3J5cHRlZE1lc3NhZ2UiLCJub25jZSIsInNlbmRlclB1YmxpY2tleSIsIm1lc3NhZ2UiLCJzaWduYXR1cmUiLCJwdWJsaWNLZXkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFLQTs7QUFDQTs7Ozs7Ozs7Ozs7O0lBTXFCQSxNOzs7QUFLbkIsa0JBQVlDLE1BQVosRUFBNkI7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFDM0IsUUFBSUEsTUFBSixFQUFZO0FBQ1YsV0FBS0MsUUFBTCxHQUFnQixJQUFJQyx3QkFBSixDQUFhRixNQUFiLENBQWhCO0FBQ0EsV0FBS0EsTUFBTCxHQUFjQSxNQUFkO0FBQ0QsS0FIRCxNQUdPO0FBQ0wsV0FBS0MsUUFBTCxHQUFnQixJQUFJQyx3QkFBSixFQUFoQjtBQUNBLFdBQUtGLE1BQUwsR0FBYyxLQUFLQyxRQUFMLENBQWNFLFFBQWQsRUFBZDtBQUNEOztBQVAwQixnQ0FXdkIscURBQTBDLEtBQUtILE1BQS9DLENBWHVCO0FBQUEsUUFTekJJLGVBVHlCLHlCQVN6QkEsZUFUeUI7QUFBQSxRQVV6QkMsY0FWeUIseUJBVXpCQSxjQVZ5Qjs7QUFZM0IsU0FBS0MsTUFBTCxHQUFjLHlCQUFZRCxjQUFaLENBQWQ7QUFDQSxTQUFLRSxNQUFMLEdBQWMseUJBQVlILGVBQVosQ0FBZDtBQUNEOzs7OzRCQUVPSSxHLEVBQWFDLGtCLEVBQTRCO0FBQy9DLFVBQU1DLE1BQU0sR0FBRywyQ0FDYkYsR0FEYSxFQUViLEtBQUtSLE1BRlEsRUFHYlMsa0JBSGEsQ0FBZjtBQUtBLGFBQU9FLElBQUksQ0FBQ0MsU0FBTCxDQUFlRixNQUFmLENBQVA7QUFDRDs7OzRCQUVPRyxTLEVBQW1CO0FBQ3pCLFVBQU1DLElBQStCLEdBQUdILElBQUksQ0FBQ0ksS0FBTCxDQUFXRixTQUFYLENBQXhDO0FBQ0FHLE1BQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZO0FBQUVILFFBQUFBLElBQUksRUFBSkE7QUFBRixPQUFaO0FBQ0EsVUFBTUosTUFBTSxHQUFHLDJDQUNiSSxJQUFJLENBQUNJLGdCQURRLEVBRWJKLElBQUksQ0FBQ0ssS0FGUSxFQUdiLEtBQUtuQixNQUhRLEVBSWJjLElBQUksQ0FBQ00sZUFKUSxDQUFmO0FBTUEsYUFBT1YsTUFBUDtBQUNEOzs7Z0NBRVdGLEcsRUFBYTtBQUN2QixVQUFNRSxNQUFNLEdBQUcscUNBQTBCRixHQUExQixFQUErQixLQUFLUixNQUFwQyxDQUFmO0FBQ0EsYUFBTztBQUNMcUIsUUFBQUEsT0FBTyxFQUFFWCxNQUFNLENBQUNXLE9BRFg7QUFFTEMsUUFBQUEsU0FBUyxFQUFFWixNQUFNLENBQUNZO0FBRmIsT0FBUDtBQUlEOzs7d0NBTTJDO0FBQUEsVUFIMUNELE9BRzBDLFFBSDFDQSxPQUcwQztBQUFBLFVBRjFDRSxTQUUwQyxRQUYxQ0EsU0FFMEM7QUFBQSxVQUQxQ0QsU0FDMEMsUUFEMUNBLFNBQzBDO0FBQzFDLGFBQU8sc0NBQTJCO0FBQUVELFFBQUFBLE9BQU8sRUFBUEEsT0FBRjtBQUFXRSxRQUFBQSxTQUFTLEVBQVRBLFNBQVg7QUFBc0JELFFBQUFBLFNBQVMsRUFBVEE7QUFBdEIsT0FBM0IsQ0FBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE1uZW1vbmljIGZyb20gXCJiaXRjb3JlLW1uZW1vbmljXCI7XG5pbXBvcnQgeyBidWZmZXJUb0hleCB9IGZyb20gXCIuL2J1ZmZlclwiO1xuaW1wb3J0IHtcbiAgc2lnbk1lc3NhZ2VXaXRoUGFzc3BocmFzZSxcbiAgdmVyaWZ5TWVzc2FnZVdpdGhQdWJsaWNLZXksXG4gIFNpZ25lZE1lc3NhZ2VXaXRoT25lUGFzc3BocmFzZVxufSBmcm9tIFwiLi9zaWduXCI7XG5pbXBvcnQgeyBnZXRQcml2YXRlQW5kUHVibGljS2V5Qnl0ZXNGcm9tUGFzc3BocmFzZSB9IGZyb20gXCIuL2tleXNcIjtcbmltcG9ydCB7XG4gIGVuY3J5cHRNZXNzYWdlV2l0aFBhc3NwaHJhc2UsXG4gIGRlY3J5cHRNZXNzYWdlV2l0aFBhc3NwaHJhc2UsXG4gIEVuY3J5cHRlZE1lc3NhZ2VXaXRoTm9uY2Vcbn0gZnJvbSBcIi4vZW5jcnlwdFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDeXBoZXIge1xuICBtbmVtb25pYzogTW5lbW9uaWM7XG4gIHNlY0tleTogc3RyaW5nO1xuICBwdWJLZXk6IHN0cmluZztcbiAgcGhyYXNlOiBzdHJpbmc7XG4gIGNvbnN0cnVjdG9yKHBocmFzZT86IHN0cmluZykge1xuICAgIGlmIChwaHJhc2UpIHtcbiAgICAgIHRoaXMubW5lbW9uaWMgPSBuZXcgTW5lbW9uaWMocGhyYXNlKTtcbiAgICAgIHRoaXMucGhyYXNlID0gcGhyYXNlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm1uZW1vbmljID0gbmV3IE1uZW1vbmljKCk7XG4gICAgICB0aGlzLnBocmFzZSA9IHRoaXMubW5lbW9uaWMudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgY29uc3Qge1xuICAgICAgcHJpdmF0ZUtleUJ5dGVzLFxuICAgICAgcHVibGljS2V5Qnl0ZXNcbiAgICB9ID0gZ2V0UHJpdmF0ZUFuZFB1YmxpY0tleUJ5dGVzRnJvbVBhc3NwaHJhc2UodGhpcy5waHJhc2UpO1xuICAgIHRoaXMucHViS2V5ID0gYnVmZmVyVG9IZXgocHVibGljS2V5Qnl0ZXMpO1xuICAgIHRoaXMuc2VjS2V5ID0gYnVmZmVyVG9IZXgocHJpdmF0ZUtleUJ5dGVzKTtcbiAgfVxuXG4gIGVuY3J5cHQocmF3OiBzdHJpbmcsIHJlY2lwaWVudFB1YmxpY0tleTogc3RyaW5nKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gZW5jcnlwdE1lc3NhZ2VXaXRoUGFzc3BocmFzZShcbiAgICAgIHJhdyxcbiAgICAgIHRoaXMucGhyYXNlLFxuICAgICAgcmVjaXBpZW50UHVibGljS2V5XG4gICAgKTtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkocmVzdWx0KTtcbiAgfVxuXG4gIGRlY3J5cHQoZW5jcnlwdGVkOiBzdHJpbmcpIHtcbiAgICBjb25zdCBqc29uOiBFbmNyeXB0ZWRNZXNzYWdlV2l0aE5vbmNlID0gSlNPTi5wYXJzZShlbmNyeXB0ZWQpO1xuICAgIGNvbnNvbGUubG9nKHsganNvbiB9KTtcbiAgICBjb25zdCByZXN1bHQgPSBkZWNyeXB0TWVzc2FnZVdpdGhQYXNzcGhyYXNlKFxuICAgICAganNvbi5lbmNyeXB0ZWRNZXNzYWdlLFxuICAgICAganNvbi5ub25jZSxcbiAgICAgIHRoaXMucGhyYXNlLFxuICAgICAganNvbi5zZW5kZXJQdWJsaWNrZXlcbiAgICApO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBzaWduTWVzc2FnZShyYXc6IHN0cmluZykge1xuICAgIGNvbnN0IHJlc3VsdCA9IHNpZ25NZXNzYWdlV2l0aFBhc3NwaHJhc2UocmF3LCB0aGlzLnBocmFzZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1lc3NhZ2U6IHJlc3VsdC5tZXNzYWdlLFxuICAgICAgc2lnbmF0dXJlOiByZXN1bHQuc2lnbmF0dXJlXG4gICAgfTtcbiAgfVxuXG4gIHZlcmlmeU1lc3NhZ2Uoe1xuICAgIG1lc3NhZ2UsXG4gICAgcHVibGljS2V5LFxuICAgIHNpZ25hdHVyZVxuICB9OiBTaWduZWRNZXNzYWdlV2l0aE9uZVBhc3NwaHJhc2UpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdmVyaWZ5TWVzc2FnZVdpdGhQdWJsaWNLZXkoeyBtZXNzYWdlLCBwdWJsaWNLZXksIHNpZ25hdHVyZSB9KTtcbiAgfVxufVxuIl19