"use strict";

var _account = _interopRequireDefault(require("../../blockchain/account"));

var _cypher = _interopRequireDefault(require("./cypher"));

var _ava = _interopRequireDefault(require("ava"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var c = _toConsumableArray(Array(2)).map(function () {
  return new _cypher.default(new _account.default());
});

(0, _ava.default)("cypher", function (test) {
  var raw = "test";
  {
    var enc = c[0].encrypt(raw, c[1].accout.pubKey);
    var dec = c[1].decrypt(enc);
    test.not(raw, enc);
    test.is(raw, dec);
  }
  {
    var _enc = c[0].signMessage(raw);

    var _dec = c[1].verifyMessage(_enc.message, c[0].accout.pubKey, _enc.signature);

    test.is(_dec, true);
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cmFjdC9zdGQvY3lwaGVyLnRlc3QudHMiXSwibmFtZXMiOlsiYyIsIkFycmF5IiwibWFwIiwiQ3lwaGVyIiwiQWNjb3VudCIsInRlc3QiLCJyYXciLCJlbmMiLCJlbmNyeXB0IiwiYWNjb3V0IiwicHViS2V5IiwiZGVjIiwiZGVjcnlwdCIsIm5vdCIsImlzIiwic2lnbk1lc3NhZ2UiLCJ2ZXJpZnlNZXNzYWdlIiwibWVzc2FnZSIsInNpZ25hdHVyZSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUEsQ0FBQyxHQUFHLG1CQUFJQyxLQUFLLENBQUMsQ0FBRCxDQUFULEVBQWNDLEdBQWQsQ0FBa0I7QUFBQSxTQUFNLElBQUlDLGVBQUosQ0FBVyxJQUFJQyxnQkFBSixFQUFYLENBQU47QUFBQSxDQUFsQixDQUFWOztBQUVBLGtCQUFLLFFBQUwsRUFBZSxVQUFBQyxJQUFJLEVBQUk7QUFDckIsTUFBTUMsR0FBRyxHQUFHLE1BQVo7QUFDQTtBQUNFLFFBQU1DLEdBQUcsR0FBR1AsQ0FBQyxDQUFDLENBQUQsQ0FBRCxDQUFLUSxPQUFMLENBQWFGLEdBQWIsRUFBa0JOLENBQUMsQ0FBQyxDQUFELENBQUQsQ0FBS1MsTUFBTCxDQUFZQyxNQUE5QixDQUFaO0FBQ0EsUUFBTUMsR0FBRyxHQUFHWCxDQUFDLENBQUMsQ0FBRCxDQUFELENBQUtZLE9BQUwsQ0FBYUwsR0FBYixDQUFaO0FBQ0FGLElBQUFBLElBQUksQ0FBQ1EsR0FBTCxDQUFTUCxHQUFULEVBQWNDLEdBQWQ7QUFDQUYsSUFBQUEsSUFBSSxDQUFDUyxFQUFMLENBQVFSLEdBQVIsRUFBYUssR0FBYjtBQUNEO0FBQ0Q7QUFDRSxRQUFNSixJQUFHLEdBQUdQLENBQUMsQ0FBQyxDQUFELENBQUQsQ0FBS2UsV0FBTCxDQUFpQlQsR0FBakIsQ0FBWjs7QUFDQSxRQUFNSyxJQUFHLEdBQUdYLENBQUMsQ0FBQyxDQUFELENBQUQsQ0FBS2dCLGFBQUwsQ0FDVlQsSUFBRyxDQUFDVSxPQURNLEVBRVZqQixDQUFDLENBQUMsQ0FBRCxDQUFELENBQUtTLE1BQUwsQ0FBWUMsTUFGRixFQUdWSCxJQUFHLENBQUNXLFNBSE0sQ0FBWjs7QUFLQWIsSUFBQUEsSUFBSSxDQUFDUyxFQUFMLENBQVFILElBQVIsRUFBYSxJQUFiO0FBQ0Q7QUFDRixDQWpCRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBBY2NvdW50IGZyb20gXCIuLi8uLi9ibG9ja2NoYWluL2FjY291bnRcIjtcbmltcG9ydCBDeXBoZXIgZnJvbSBcIi4vY3lwaGVyXCI7XG5pbXBvcnQgdGVzdCBmcm9tIFwiYXZhXCI7XG5cbmNvbnN0IGMgPSBbLi4uQXJyYXkoMildLm1hcCgoKSA9PiBuZXcgQ3lwaGVyKG5ldyBBY2NvdW50KCkpKTtcblxudGVzdChcImN5cGhlclwiLCB0ZXN0ID0+IHtcbiAgY29uc3QgcmF3ID0gXCJ0ZXN0XCI7XG4gIHtcbiAgICBjb25zdCBlbmMgPSBjWzBdLmVuY3J5cHQocmF3LCBjWzFdLmFjY291dC5wdWJLZXkpO1xuICAgIGNvbnN0IGRlYyA9IGNbMV0uZGVjcnlwdChlbmMpO1xuICAgIHRlc3Qubm90KHJhdywgZW5jKTtcbiAgICB0ZXN0LmlzKHJhdywgZGVjKTtcbiAgfVxuICB7XG4gICAgY29uc3QgZW5jID0gY1swXS5zaWduTWVzc2FnZShyYXcpO1xuICAgIGNvbnN0IGRlYyA9IGNbMV0udmVyaWZ5TWVzc2FnZShcbiAgICAgIGVuYy5tZXNzYWdlLFxuICAgICAgY1swXS5hY2NvdXQucHViS2V5LFxuICAgICAgZW5jLnNpZ25hdHVyZVxuICAgICk7XG4gICAgdGVzdC5pcyhkZWMsIHRydWUpO1xuICB9XG59KTtcbiJdfQ==