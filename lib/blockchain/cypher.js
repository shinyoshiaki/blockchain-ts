"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _keypair = _interopRequireDefault(require("keypair"));

var _crypto = _interopRequireDefault(require("crypto"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Buffer = require("buffer/").Buffer;

var Cypher =
/*#__PURE__*/
function () {
  function Cypher(secKey, pubKey) {
    _classCallCheck(this, Cypher);

    _defineProperty(this, "secKey", void 0);

    _defineProperty(this, "pubKey", void 0);

    if (secKey && pubKey) {
      this.secKey = secKey;
      this.pubKey = pubKey;
    } else {
      var pair = (0, _keypair.default)();
      this.secKey = pair.private;
      this.pubKey = pair.public;
    }
  }

  _createClass(Cypher, [{
    key: "encrypt",
    value: function encrypt(raw) {
      var encrypted = _crypto.default.privateEncrypt(this.secKey, new Buffer.from(raw));

      return encrypted.toString("base64");
    }
  }, {
    key: "decrypt",
    value: function decrypt(encrypted, publicKey) {
      var decrypted = _crypto.default.publicDecrypt(publicKey, new Buffer.from(encrypted, "base64"));

      return decrypted.toString("utf8");
    }
  }]);

  return Cypher;
}();

exports.default = Cypher;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL2N5cGhlci50cyJdLCJuYW1lcyI6WyJCdWZmZXIiLCJyZXF1aXJlIiwiQ3lwaGVyIiwic2VjS2V5IiwicHViS2V5IiwicGFpciIsInByaXZhdGUiLCJwdWJsaWMiLCJyYXciLCJlbmNyeXB0ZWQiLCJjcnlwdG8iLCJwcml2YXRlRW5jcnlwdCIsImZyb20iLCJ0b1N0cmluZyIsInB1YmxpY0tleSIsImRlY3J5cHRlZCIsInB1YmxpY0RlY3J5cHQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7Ozs7Ozs7Ozs7O0FBQ0EsSUFBTUEsTUFBTSxHQUFHQyxPQUFPLENBQUMsU0FBRCxDQUFQLENBQW1CRCxNQUFsQzs7SUFFcUJFLE07OztBQUduQixrQkFBWUMsTUFBWixFQUE2QkMsTUFBN0IsRUFBOEM7QUFBQTs7QUFBQTs7QUFBQTs7QUFDNUMsUUFBSUQsTUFBTSxJQUFJQyxNQUFkLEVBQXNCO0FBQ3BCLFdBQUtELE1BQUwsR0FBY0EsTUFBZDtBQUNBLFdBQUtDLE1BQUwsR0FBY0EsTUFBZDtBQUNELEtBSEQsTUFHTztBQUNMLFVBQU1DLElBQUksR0FBRyx1QkFBYjtBQUNBLFdBQUtGLE1BQUwsR0FBY0UsSUFBSSxDQUFDQyxPQUFuQjtBQUNBLFdBQUtGLE1BQUwsR0FBY0MsSUFBSSxDQUFDRSxNQUFuQjtBQUNEO0FBQ0Y7Ozs7NEJBRU9DLEcsRUFBYTtBQUNuQixVQUFNQyxTQUFTLEdBQUdDLGdCQUFPQyxjQUFQLENBQXNCLEtBQUtSLE1BQTNCLEVBQW1DLElBQUlILE1BQU0sQ0FBQ1ksSUFBWCxDQUFnQkosR0FBaEIsQ0FBbkMsQ0FBbEI7O0FBQ0EsYUFBT0MsU0FBUyxDQUFDSSxRQUFWLENBQW1CLFFBQW5CLENBQVA7QUFDRDs7OzRCQUVPSixTLEVBQW1CSyxTLEVBQW1CO0FBQzVDLFVBQU1DLFNBQVMsR0FBR0wsZ0JBQU9NLGFBQVAsQ0FDaEJGLFNBRGdCLEVBRWhCLElBQUlkLE1BQU0sQ0FBQ1ksSUFBWCxDQUFnQkgsU0FBaEIsRUFBMkIsUUFBM0IsQ0FGZ0IsQ0FBbEI7O0FBSUEsYUFBT00sU0FBUyxDQUFDRixRQUFWLENBQW1CLE1BQW5CLENBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBrZXlwYWlyIGZyb20gXCJrZXlwYWlyXCI7XG5pbXBvcnQgY3J5cHRvIGZyb20gXCJjcnlwdG9cIjtcbmNvbnN0IEJ1ZmZlciA9IHJlcXVpcmUoXCJidWZmZXIvXCIpLkJ1ZmZlcjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ3lwaGVyIHtcbiAgc2VjS2V5OiBzdHJpbmc7XG4gIHB1YktleTogc3RyaW5nO1xuICBjb25zdHJ1Y3RvcihzZWNLZXk/OiBzdHJpbmcsIHB1YktleT86IHN0cmluZykge1xuICAgIGlmIChzZWNLZXkgJiYgcHViS2V5KSB7XG4gICAgICB0aGlzLnNlY0tleSA9IHNlY0tleTtcbiAgICAgIHRoaXMucHViS2V5ID0gcHViS2V5O1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBwYWlyID0ga2V5cGFpcigpO1xuICAgICAgdGhpcy5zZWNLZXkgPSBwYWlyLnByaXZhdGU7XG4gICAgICB0aGlzLnB1YktleSA9IHBhaXIucHVibGljO1xuICAgIH1cbiAgfVxuXG4gIGVuY3J5cHQocmF3OiBzdHJpbmcpIHtcbiAgICBjb25zdCBlbmNyeXB0ZWQgPSBjcnlwdG8ucHJpdmF0ZUVuY3J5cHQodGhpcy5zZWNLZXksIG5ldyBCdWZmZXIuZnJvbShyYXcpKTtcbiAgICByZXR1cm4gZW5jcnlwdGVkLnRvU3RyaW5nKFwiYmFzZTY0XCIpO1xuICB9XG5cbiAgZGVjcnlwdChlbmNyeXB0ZWQ6IHN0cmluZywgcHVibGljS2V5OiBzdHJpbmcpIHtcbiAgICBjb25zdCBkZWNyeXB0ZWQgPSBjcnlwdG8ucHVibGljRGVjcnlwdChcbiAgICAgIHB1YmxpY0tleSxcbiAgICAgIG5ldyBCdWZmZXIuZnJvbShlbmNyeXB0ZWQsIFwiYmFzZTY0XCIpXG4gICAgKTtcbiAgICByZXR1cm4gZGVjcnlwdGVkLnRvU3RyaW5nKFwidXRmOFwiKTtcbiAgfVxufVxuIl19