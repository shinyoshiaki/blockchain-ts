"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isValidPassphrase = exports.getPrivateAndPublicKeyBytesFromPassphrase = void 0;

var _hash = require("./hash");

var _nacl = require("./nacl");

var _bitcoreMnemonic = _interopRequireDefault(require("bitcore-mnemonic"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * Copyright © 2018 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */
var getPrivateAndPublicKeyBytesFromPassphrase = function getPrivateAndPublicKeyBytesFromPassphrase(passphrase) {
  var hashed = (0, _hash.hash)(passphrase, "utf8");

  var _getKeyPair = (0, _nacl.getKeyPair)(hashed),
      publicKeyBytes = _getKeyPair.publicKeyBytes,
      privateKeyBytes = _getKeyPair.privateKeyBytes;

  return {
    privateKeyBytes: privateKeyBytes,
    publicKeyBytes: publicKeyBytes
  };
};

exports.getPrivateAndPublicKeyBytesFromPassphrase = getPrivateAndPublicKeyBytesFromPassphrase;

var isValidPassphrase = function isValidPassphrase(passphrase) {
  var normalizedValue = passphrase.replace(/ +/g, " ").trim();
  var isValid;

  try {
    isValid = normalizedValue.split(" ").length >= 12 && _bitcoreMnemonic.default.isValid(normalizedValue);
  } catch (e) {
    // If the mnemonic check throws an error, we assume that the
    // passphrase being entered isn't valid
    isValid = false;
  }

  return isValid;
};

exports.isValidPassphrase = isValidPassphrase;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ibG9ja2NoYWluL2NyeXB0by9rZXlzLnRzIl0sIm5hbWVzIjpbImdldFByaXZhdGVBbmRQdWJsaWNLZXlCeXRlc0Zyb21QYXNzcGhyYXNlIiwicGFzc3BocmFzZSIsImhhc2hlZCIsInB1YmxpY0tleUJ5dGVzIiwicHJpdmF0ZUtleUJ5dGVzIiwiaXNWYWxpZFBhc3NwaHJhc2UiLCJub3JtYWxpemVkVmFsdWUiLCJyZXBsYWNlIiwidHJpbSIsImlzVmFsaWQiLCJzcGxpdCIsImxlbmd0aCIsIm1uZW1vbmljIiwiZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQWVBOztBQUNBOztBQUNBOzs7O0FBakJBOzs7Ozs7Ozs7Ozs7OztBQXdCTyxJQUFNQSx5Q0FBeUMsR0FBRyxTQUE1Q0EseUNBQTRDLENBQ3ZEQyxVQUR1RCxFQUV0QztBQUNqQixNQUFNQyxNQUFNLEdBQUcsZ0JBQUtELFVBQUwsRUFBaUIsTUFBakIsQ0FBZjs7QUFEaUIsb0JBRTJCLHNCQUFXQyxNQUFYLENBRjNCO0FBQUEsTUFFVEMsY0FGUyxlQUVUQSxjQUZTO0FBQUEsTUFFT0MsZUFGUCxlQUVPQSxlQUZQOztBQUlqQixTQUFPO0FBQ0xBLElBQUFBLGVBQWUsRUFBZkEsZUFESztBQUVMRCxJQUFBQSxjQUFjLEVBQWRBO0FBRkssR0FBUDtBQUlELENBVk07Ozs7QUFZQSxJQUFNRSxpQkFBaUIsR0FBRyxTQUFwQkEsaUJBQW9CLENBQUNKLFVBQUQsRUFBd0I7QUFDdkQsTUFBTUssZUFBZSxHQUFHTCxVQUFVLENBQUNNLE9BQVgsQ0FBbUIsS0FBbkIsRUFBMEIsR0FBMUIsRUFBK0JDLElBQS9CLEVBQXhCO0FBQ0EsTUFBSUMsT0FBSjs7QUFDQSxNQUFJO0FBQ0ZBLElBQUFBLE9BQU8sR0FDTEgsZUFBZSxDQUFDSSxLQUFoQixDQUFzQixHQUF0QixFQUEyQkMsTUFBM0IsSUFBcUMsRUFBckMsSUFDQUMseUJBQVNILE9BQVQsQ0FBaUJILGVBQWpCLENBRkY7QUFHRCxHQUpELENBSUUsT0FBT08sQ0FBUCxFQUFVO0FBQ1Y7QUFDQTtBQUNBSixJQUFBQSxPQUFPLEdBQUcsS0FBVjtBQUNEOztBQUNELFNBQU9BLE9BQVA7QUFDRCxDQWJNIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIENvcHlyaWdodCDCqSAyMDE4IExpc2sgRm91bmRhdGlvblxuICpcbiAqIFNlZSB0aGUgTElDRU5TRSBmaWxlIGF0IHRoZSB0b3AtbGV2ZWwgZGlyZWN0b3J5IG9mIHRoaXMgZGlzdHJpYnV0aW9uXG4gKiBmb3IgbGljZW5zaW5nIGluZm9ybWF0aW9uLlxuICpcbiAqIFVubGVzcyBvdGhlcndpc2UgYWdyZWVkIGluIGEgY3VzdG9tIGxpY2Vuc2luZyBhZ3JlZW1lbnQgd2l0aCB0aGUgTGlzayBGb3VuZGF0aW9uLFxuICogbm8gcGFydCBvZiB0aGlzIHNvZnR3YXJlLCBpbmNsdWRpbmcgdGhpcyBmaWxlLCBtYXkgYmUgY29waWVkLCBtb2RpZmllZCxcbiAqIHByb3BhZ2F0ZWQsIG9yIGRpc3RyaWJ1dGVkIGV4Y2VwdCBhY2NvcmRpbmcgdG8gdGhlIHRlcm1zIGNvbnRhaW5lZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZS5cbiAqXG4gKiBSZW1vdmFsIG9yIG1vZGlmaWNhdGlvbiBvZiB0aGlzIGNvcHlyaWdodCBub3RpY2UgaXMgcHJvaGliaXRlZC5cbiAqXG4gKi9cblxuaW1wb3J0IHsgaGFzaCB9IGZyb20gXCIuL2hhc2hcIjtcbmltcG9ydCB7IGdldEtleVBhaXIgfSBmcm9tIFwiLi9uYWNsXCI7XG5pbXBvcnQgbW5lbW9uaWMgZnJvbSBcImJpdGNvcmUtbW5lbW9uaWNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBLZXlwYWlyQnl0ZXMge1xuICByZWFkb25seSBwcml2YXRlS2V5Qnl0ZXM6IEJ1ZmZlcjtcbiAgcmVhZG9ubHkgcHVibGljS2V5Qnl0ZXM6IEJ1ZmZlcjtcbn1cblxuZXhwb3J0IGNvbnN0IGdldFByaXZhdGVBbmRQdWJsaWNLZXlCeXRlc0Zyb21QYXNzcGhyYXNlID0gKFxuICBwYXNzcGhyYXNlOiBzdHJpbmdcbik6IEtleXBhaXJCeXRlcyA9PiB7XG4gIGNvbnN0IGhhc2hlZCA9IGhhc2gocGFzc3BocmFzZSwgXCJ1dGY4XCIpO1xuICBjb25zdCB7IHB1YmxpY0tleUJ5dGVzLCBwcml2YXRlS2V5Qnl0ZXMgfSA9IGdldEtleVBhaXIoaGFzaGVkKTtcblxuICByZXR1cm4ge1xuICAgIHByaXZhdGVLZXlCeXRlcyxcbiAgICBwdWJsaWNLZXlCeXRlc1xuICB9O1xufTtcblxuZXhwb3J0IGNvbnN0IGlzVmFsaWRQYXNzcGhyYXNlID0gKHBhc3NwaHJhc2U6IHN0cmluZykgPT4ge1xuICBjb25zdCBub3JtYWxpemVkVmFsdWUgPSBwYXNzcGhyYXNlLnJlcGxhY2UoLyArL2csIFwiIFwiKS50cmltKCk7XG4gIGxldCBpc1ZhbGlkO1xuICB0cnkge1xuICAgIGlzVmFsaWQgPVxuICAgICAgbm9ybWFsaXplZFZhbHVlLnNwbGl0KFwiIFwiKS5sZW5ndGggPj0gMTIgJiZcbiAgICAgIG1uZW1vbmljLmlzVmFsaWQobm9ybWFsaXplZFZhbHVlKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIElmIHRoZSBtbmVtb25pYyBjaGVjayB0aHJvd3MgYW4gZXJyb3IsIHdlIGFzc3VtZSB0aGF0IHRoZVxuICAgIC8vIHBhc3NwaHJhc2UgYmVpbmcgZW50ZXJlZCBpc24ndCB2YWxpZFxuICAgIGlzVmFsaWQgPSBmYWxzZTtcbiAgfVxuICByZXR1cm4gaXNWYWxpZDtcbn07XG4iXX0=