"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.isOwner = void 0;

var _sign = require("../../blockchain/crypto/sign");

var isOwner = function isOwner(sign) {
  return (0, _sign.verifyMessageWithPublicKey)(sign);
};

exports.isOwner = isOwner;
var _default = {
  isOwner: isOwner
};
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cmFjdC9zdGQvaWQudHMiXSwibmFtZXMiOlsiaXNPd25lciIsInNpZ24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFLTyxJQUFNQSxPQUFPLEdBQUcsU0FBVkEsT0FBVSxDQUFDQyxJQUFELEVBQTBDO0FBQy9ELFNBQU8sc0NBQTJCQSxJQUEzQixDQUFQO0FBQ0QsQ0FGTTs7O2VBSVE7QUFBRUQsRUFBQUEsT0FBTyxFQUFQQTtBQUFGLEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICB2ZXJpZnlNZXNzYWdlV2l0aFB1YmxpY0tleSxcbiAgU2lnbmVkTWVzc2FnZVdpdGhPbmVQYXNzcGhyYXNlXG59IGZyb20gXCIuLi8uLi9ibG9ja2NoYWluL2NyeXB0by9zaWduXCI7XG5cbmV4cG9ydCBjb25zdCBpc093bmVyID0gKHNpZ246IFNpZ25lZE1lc3NhZ2VXaXRoT25lUGFzc3BocmFzZSkgPT4ge1xuICByZXR1cm4gdmVyaWZ5TWVzc2FnZVdpdGhQdWJsaWNLZXkoc2lnbik7XG59O1xuXG5leHBvcnQgZGVmYXVsdCB7IGlzT3duZXIgfTtcbiJdfQ==