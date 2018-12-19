"use strict";

var _cypher = _interopRequireDefault(require("../../../blockchain/crypto/cypher"));

var _ava = _interopRequireDefault(require("ava"));

var _keys = require("../../../blockchain/crypto/keys");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cypher = new _cypher.default();
(0, _ava.default)("phrase", function (test) {
  console.log(cypher.phrase);
  test.is((0, _keys.isValidPassphrase)(cypher.phrase), true);
  test.is((0, _keys.isValidPassphrase)(""), false);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy90ZXN0L2Jsb2NrY2hhaW4vY3J5cHRvL3BocmFzZS50ZXN0LnRzIl0sIm5hbWVzIjpbImN5cGhlciIsIkN5cGhlciIsInRlc3QiLCJjb25zb2xlIiwibG9nIiwicGhyYXNlIiwiaXMiXSwibWFwcGluZ3MiOiI7O0FBQUE7O0FBQ0E7O0FBQ0E7Ozs7QUFFQSxJQUFNQSxNQUFNLEdBQUcsSUFBSUMsZUFBSixFQUFmO0FBRUEsa0JBQUssUUFBTCxFQUFlLFVBQUFDLElBQUksRUFBSTtBQUNyQkMsRUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVlKLE1BQU0sQ0FBQ0ssTUFBbkI7QUFDQUgsRUFBQUEsSUFBSSxDQUFDSSxFQUFMLENBQVEsNkJBQWtCTixNQUFNLENBQUNLLE1BQXpCLENBQVIsRUFBMEMsSUFBMUM7QUFDQUgsRUFBQUEsSUFBSSxDQUFDSSxFQUFMLENBQVEsNkJBQWtCLEVBQWxCLENBQVIsRUFBK0IsS0FBL0I7QUFDRCxDQUpEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEN5cGhlciBmcm9tIFwiLi4vLi4vLi4vYmxvY2tjaGFpbi9jcnlwdG8vY3lwaGVyXCI7XG5pbXBvcnQgdGVzdCBmcm9tIFwiYXZhXCI7XG5pbXBvcnQgeyBpc1ZhbGlkUGFzc3BocmFzZSB9IGZyb20gXCIuLi8uLi8uLi9ibG9ja2NoYWluL2NyeXB0by9rZXlzXCI7XG5cbmNvbnN0IGN5cGhlciA9IG5ldyBDeXBoZXIoKTtcblxudGVzdChcInBocmFzZVwiLCB0ZXN0ID0+IHtcbiAgY29uc29sZS5sb2coY3lwaGVyLnBocmFzZSk7XG4gIHRlc3QuaXMoaXNWYWxpZFBhc3NwaHJhc2UoY3lwaGVyLnBocmFzZSksIHRydWUpO1xuICB0ZXN0LmlzKGlzVmFsaWRQYXNzcGhyYXNlKFwiXCIpLCBmYWxzZSk7XG59KTtcbiJdfQ==