"use strict";

var _sss = require("./sss");

var _ava = _interopRequireDefault(require("ava"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var raw = "test";
var split = (0, _sss.sssSplit)(raw, 3, 3);
var dec = (0, _sss.sssCombine)(split);
(0, _ava.default)("multisig", function (test) {
  test.is(raw, dec);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cmFjdC9zdGQvc3NzLnRlc3QudHMiXSwibmFtZXMiOlsicmF3Iiwic3BsaXQiLCJkZWMiLCJ0ZXN0IiwiaXMiXSwibWFwcGluZ3MiOiI7O0FBQUE7O0FBQ0E7Ozs7QUFFQSxJQUFNQSxHQUFHLEdBQUcsTUFBWjtBQUNBLElBQU1DLEtBQUssR0FBRyxtQkFBU0QsR0FBVCxFQUFjLENBQWQsRUFBaUIsQ0FBakIsQ0FBZDtBQUNBLElBQU1FLEdBQUcsR0FBRyxxQkFBV0QsS0FBWCxDQUFaO0FBRUEsa0JBQUssVUFBTCxFQUFpQixVQUFBRSxJQUFJLEVBQUk7QUFDdkJBLEVBQUFBLElBQUksQ0FBQ0MsRUFBTCxDQUFRSixHQUFSLEVBQWFFLEdBQWI7QUFDRCxDQUZEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgc3NzU3BsaXQsIHNzc0NvbWJpbmUgfSBmcm9tIFwiLi9zc3NcIjtcbmltcG9ydCB0ZXN0IGZyb20gXCJhdmFcIjtcblxuY29uc3QgcmF3ID0gXCJ0ZXN0XCI7XG5jb25zdCBzcGxpdCA9IHNzc1NwbGl0KHJhdywgMywgMyk7XG5jb25zdCBkZWMgPSBzc3NDb21iaW5lKHNwbGl0KTtcblxudGVzdChcIm11bHRpc2lnXCIsIHRlc3QgPT4ge1xuICB0ZXN0LmlzKHJhdywgZGVjKTtcbn0pO1xuIl19