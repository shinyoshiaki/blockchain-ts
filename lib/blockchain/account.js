"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _bitcoreMnemonic = _interopRequireDefault(require("bitcore-mnemonic"));

var _keys = require("./crypto/keys");

var _buffer = require("./crypto/buffer");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Account = function Account(phrase) {
  _classCallCheck(this, Account);

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
};

exports.default = Account;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL2FjY291bnQudHMiXSwibmFtZXMiOlsiQWNjb3VudCIsInBocmFzZSIsIm1uZW1vbmljIiwiTW5lbW9uaWMiLCJ0b1N0cmluZyIsInByaXZhdGVLZXlCeXRlcyIsInB1YmxpY0tleUJ5dGVzIiwicHViS2V5Iiwic2VjS2V5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7Ozs7Ozs7O0lBRXFCQSxPLEdBS25CLGlCQUFZQyxNQUFaLEVBQTZCO0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQzNCLE1BQUlBLE1BQUosRUFBWTtBQUNWLFNBQUtDLFFBQUwsR0FBZ0IsSUFBSUMsd0JBQUosQ0FBYUYsTUFBYixDQUFoQjtBQUNBLFNBQUtBLE1BQUwsR0FBY0EsTUFBZDtBQUNELEdBSEQsTUFHTztBQUNMLFNBQUtDLFFBQUwsR0FBZ0IsSUFBSUMsd0JBQUosRUFBaEI7QUFDQSxTQUFLRixNQUFMLEdBQWMsS0FBS0MsUUFBTCxDQUFjRSxRQUFkLEVBQWQ7QUFDRDs7QUFQMEIsOEJBV3ZCLHFEQUEwQyxLQUFLSCxNQUEvQyxDQVh1QjtBQUFBLE1BU3pCSSxlQVR5Qix5QkFTekJBLGVBVHlCO0FBQUEsTUFVekJDLGNBVnlCLHlCQVV6QkEsY0FWeUI7O0FBWTNCLE9BQUtDLE1BQUwsR0FBYyx5QkFBWUQsY0FBWixDQUFkO0FBQ0EsT0FBS0UsTUFBTCxHQUFjLHlCQUFZSCxlQUFaLENBQWQ7QUFDRCxDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE1uZW1vbmljIGZyb20gXCJiaXRjb3JlLW1uZW1vbmljXCI7XG5pbXBvcnQgeyBnZXRQcml2YXRlQW5kUHVibGljS2V5Qnl0ZXNGcm9tUGFzc3BocmFzZSB9IGZyb20gXCIuL2NyeXB0by9rZXlzXCI7XG5pbXBvcnQgeyBidWZmZXJUb0hleCB9IGZyb20gXCIuL2NyeXB0by9idWZmZXJcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWNjb3VudCB7XG4gIG1uZW1vbmljOiBNbmVtb25pYztcbiAgc2VjS2V5OiBzdHJpbmc7XG4gIHB1YktleTogc3RyaW5nO1xuICBwaHJhc2U6IHN0cmluZztcbiAgY29uc3RydWN0b3IocGhyYXNlPzogc3RyaW5nKSB7XG4gICAgaWYgKHBocmFzZSkge1xuICAgICAgdGhpcy5tbmVtb25pYyA9IG5ldyBNbmVtb25pYyhwaHJhc2UpO1xuICAgICAgdGhpcy5waHJhc2UgPSBwaHJhc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubW5lbW9uaWMgPSBuZXcgTW5lbW9uaWMoKTtcbiAgICAgIHRoaXMucGhyYXNlID0gdGhpcy5tbmVtb25pYy50b1N0cmluZygpO1xuICAgIH1cbiAgICBjb25zdCB7XG4gICAgICBwcml2YXRlS2V5Qnl0ZXMsXG4gICAgICBwdWJsaWNLZXlCeXRlc1xuICAgIH0gPSBnZXRQcml2YXRlQW5kUHVibGljS2V5Qnl0ZXNGcm9tUGFzc3BocmFzZSh0aGlzLnBocmFzZSk7XG4gICAgdGhpcy5wdWJLZXkgPSBidWZmZXJUb0hleChwdWJsaWNLZXlCeXRlcyk7XG4gICAgdGhpcy5zZWNLZXkgPSBidWZmZXJUb0hleChwcml2YXRlS2V5Qnl0ZXMpO1xuICB9XG59XG4iXX0=