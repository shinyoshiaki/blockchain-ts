"use strict";

var _cypher = _interopRequireDefault(require("../../../blockchain/crypto/cypher"));

var _ava = _interopRequireDefault(require("ava"));

var _keys = require("../../../blockchain/crypto/keys");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cypher = new _cypher.default();
(0, _ava.default)("phrase", function (test) {
  test.is((0, _keys.isValidPassphrase)(cypher.phrase), true);
  test.is((0, _keys.isValidPassphrase)(""), false);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy90ZXN0L2Jsb2NrY2hhaW4vY3J5cHRvL3BocmFzZS50ZXN0LnRzIl0sIm5hbWVzIjpbImN5cGhlciIsIkN5cGhlciIsInRlc3QiLCJpcyIsInBocmFzZSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7QUFDQTs7QUFDQTs7OztBQUVBLElBQU1BLE1BQU0sR0FBRyxJQUFJQyxlQUFKLEVBQWY7QUFFQSxrQkFBSyxRQUFMLEVBQWUsVUFBQUMsSUFBSSxFQUFJO0FBQ3JCQSxFQUFBQSxJQUFJLENBQUNDLEVBQUwsQ0FBUSw2QkFBa0JILE1BQU0sQ0FBQ0ksTUFBekIsQ0FBUixFQUEwQyxJQUExQztBQUNBRixFQUFBQSxJQUFJLENBQUNDLEVBQUwsQ0FBUSw2QkFBa0IsRUFBbEIsQ0FBUixFQUErQixLQUEvQjtBQUNELENBSEQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQ3lwaGVyIGZyb20gXCIuLi8uLi8uLi9ibG9ja2NoYWluL2NyeXB0by9jeXBoZXJcIjtcbmltcG9ydCB0ZXN0IGZyb20gXCJhdmFcIjtcbmltcG9ydCB7IGlzVmFsaWRQYXNzcGhyYXNlIH0gZnJvbSBcIi4uLy4uLy4uL2Jsb2NrY2hhaW4vY3J5cHRvL2tleXNcIjtcblxuY29uc3QgY3lwaGVyID0gbmV3IEN5cGhlcigpO1xuXG50ZXN0KFwicGhyYXNlXCIsIHRlc3QgPT4ge1xuICB0ZXN0LmlzKGlzVmFsaWRQYXNzcGhyYXNlKGN5cGhlci5waHJhc2UpLCB0cnVlKTtcbiAgdGVzdC5pcyhpc1ZhbGlkUGFzc3BocmFzZShcIlwiKSwgZmFsc2UpO1xufSk7XG4iXX0=