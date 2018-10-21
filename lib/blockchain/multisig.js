"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.type = void 0;

var _sha = _interopRequireDefault(require("sha256"));

var _cypher = _interopRequireDefault(require("./cypher"));

var _cryptoBrowserify = _interopRequireDefault(require("crypto-browserify"));

var _sha2 = _interopRequireDefault(require("sha1"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Buffer = require("buffer/").Buffer;

var aes256 = require("aes256");

var sss = require("shamirs-secret-sharing");

var type;
exports.type = type;

(function (type) {
  type["MAKE"] = "multisig-make";
  type["TRAN"] = "multisig-tran";
  type["APPROVE"] = "multisig-approve";
  type["MULTISIG"] = "multisig";
})(type || (exports.type = type = {}));

//グローバルに置くと(ここ)staticになるかも
var Multisig =
/*#__PURE__*/
function () {
  _createClass(Multisig, [{
    key: "excuteEvent",
    value: function excuteEvent(ev, v) {
      console.log("excuteEvent", ev);
      Object.keys(ev).forEach(function (key) {
        ev[key](v);
      });
    }
  }]);

  function Multisig(blockchain) {
    _classCallCheck(this, Multisig);

    _defineProperty(this, "multiSig", {});

    _defineProperty(this, "address", void 0);

    _defineProperty(this, "b", void 0);

    _defineProperty(this, "onMultisigTran", {});

    _defineProperty(this, "onMultisigTranDone", {});

    _defineProperty(this, "events", {
      onMultisigTran: this.onMultisigTran
    });

    this.b = blockchain;
    console.log("address", this.b.address);
    this.address = this.b.address;
  }

  _createClass(Multisig, [{
    key: "responder",
    value: function responder(tran) {
      this.b.addTransaction(tran);
      var data = tran.data;

      try {
        console.log("responder", data.opt);

        switch (data.opt) {
          case type.MAKE:
            this.getMultiSigKey(data.shares, data.info);
            break;

          case type.TRAN:
            {
              var info = data.info;

              if (Object.keys(this.multiSig).includes(info.multisigAddress)) {
                console.log("onMultisigTran");
                this.excuteEvent(this.onMultisigTran, info);
              }
            }
            break;

          case type.APPROVE:
            {
              var _info = data.info;

              if (_info.sharePubKeyRsa && _info.ownerPubKey === this.b.cypher.pubKey && Object.keys(this.multiSig).includes(_info.multisigAddress)) {
                console.log("type.APPROVE");
                var _shares = this.multiSig[_info.multisigAddress].shares;
                console.log("progress", _shares.length, _info.threshold);

                var shareKey = _cryptoBrowserify.default.privateDecrypt(this.b.cypher.secKey, Buffer.from(_info.sharePubKeyRsa, "base64"));

                if (!_shares.includes(shareKey)) {
                  console.log("add sharekey", {
                    shareKey: shareKey
                  });

                  _shares.push(shareKey);
                }

                if (_shares.length >= _info.threshold) {
                  console.log("verify multisig", {
                    shares: _shares
                  });
                  this.verifyMultiSig(_info, _shares);
                  this.excuteEvent(this.onMultisigTranDone);
                }
              }
            }
            break;
        }
      } catch (error) {}
    }
  }, {
    key: "makeNewMultiSigAddress",
    value: function makeNewMultiSigAddress(friendsPubKeyAes, vote, amount) {
      console.log(this.makeNewMultiSigAddress);
      var cypher = new _cypher.default();
      var aesKey = (0, _sha2.default)(Math.random().toString()).toString();
      console.log({
        aesKey: aesKey
      });
      var encryptSecKey = aes256.encrypt(aesKey, cypher.secKey);
      var shareKeys = sss.split(Buffer.from(aesKey), {
        shares: friendsPubKeyAes.length + 1,
        threshold: vote
      });
      console.log({
        shareKeys: shareKeys
      });
      var address = (0, _sha.default)(cypher.pubKey);
      var shares = {};
      friendsPubKeyAes.forEach(function (aes, i) {
        var pubKey = aes256.decrypt("format", aes);
        var id = (0, _sha.default)(pubKey);
        console.log("makeNewMultiSigAddress sharekey", shareKeys[i]);
        shares[id] = _cryptoBrowserify.default.publicEncrypt(pubKey, Buffer.from(shareKeys[i])).toString("base64");
      });
      console.log({
        shares: shares
      });
      var myShare = shareKeys[shareKeys.length - 1];
      this.multiSig[address] = {
        myShare: myShare,
        threshold: vote,
        isOwner: false,
        pubKey: cypher.pubKey,
        encryptSecKey: encryptSecKey,
        shares: []
      };
      this.multiSig[address].shares.push(myShare); // console.log(this.multiSig[address]);

      var info = {
        multisigPubKey: cypher.pubKey,
        multisigAddress: address,
        encryptSecKey: encryptSecKey,
        threshold: vote
      };
      var tran = this.b.newTransaction(this.b.address, address, amount, {
        type: type.MULTISIG,
        opt: type.MAKE,
        shares: shares,
        info: info
      });
      console.log("makeNewMultiSigAddress done", {
        tran: tran
      });
      return tran;
    }
  }, {
    key: "makeMultiSigTransaction",
    value: function makeMultiSigTransaction(multisigAddress) {
      console.log("makeMultiSigTransaction start");
      var data = this.multiSig[multisigAddress];
      if (!data) return;
      var multisigPubKey = data.pubKey; // console.log(this.b.cypher.pubKey, data);

      var shareKeyRsa = _cryptoBrowserify.default.publicEncrypt(this.b.cypher.pubKey, Buffer.from(data.myShare, "base64")).toString("base64");

      var info = {
        ownerPubKey: this.b.cypher.pubKey,
        multisigPubKey: multisigPubKey,
        multisigAddress: multisigAddress,
        sharePubKeyRsa: shareKeyRsa,
        threshold: data.threshold
      };
      data.isOwner = true;
      var amount = this.b.nowAmount(multisigAddress);
      console.log("multisig tran", {
        amount: amount
      });
      var tran = this.b.newTransaction(this.b.address, multisigAddress, 0, {
        type: type.MULTISIG,
        opt: type.TRAN,
        amount: amount,
        info: info
      });
      console.log("makeMultiSigTransaction done", {
        tran: tran
      });
      return tran;
    }
  }, {
    key: "getMultiSigKey",
    value: function getMultiSigKey(shares, info) {
      console.log("getMultiSigKey");

      if (info.encryptSecKey && Object.keys(shares).includes(this.address)) {
        console.log("getMultiSigKey start");

        var _key = _cryptoBrowserify.default.privateDecrypt(this.b.cypher.secKey, Buffer.from(shares[this.address], "base64"));

        console.log("getMultiSigKey get my key", _key);
        this.multiSig[info.multisigAddress] = {
          myShare: _key.toString("base64"),
          isOwner: false,
          threshold: info.threshold,
          pubKey: info.multisigPubKey,
          encryptSecKey: info.encryptSecKey,
          shares: []
        };
      }
    }
  }, {
    key: "approveMultiSig",
    value: function approveMultiSig(info) {
      console.log("approveMultiSig");

      if (info.ownerPubKey) {
        if (Object.keys(this.multiSig).includes(info.multisigAddress)) {
          console.log("approveMultiSig start");
          var _key2 = this.multiSig[info.multisigAddress].myShare;

          var shareKeyRsa = _cryptoBrowserify.default.publicEncrypt(info.ownerPubKey, Buffer.from(_key2, "base64")).toString("base64");

          info.sharePubKeyRsa = shareKeyRsa;
          var tran = this.b.newTransaction(this.b.address, info.multisigAddress, 0, {
            type: type.MULTISIG,
            opt: type.APPROVE,
            info: info
          });
          console.log("approveMultiSig done", {
            tran: tran
          });
          return tran;
        }
      }
    }
  }, {
    key: "verifyMultiSig",
    value: function verifyMultiSig(info, shares) {
      console.log("verifyMultiSig start", {
        shares: shares
      });
      var recovered = sss.combine(shares).toString();
      console.log({
        recovered: recovered
      });
      var encryptedKey = this.multiSig[info.multisigAddress].encryptSecKey;
      var secKey = aes256.decrypt(recovered, encryptedKey);
      console.log({
        secKey: secKey
      });
      var cypher = new _cypher.default(secKey, info.multisigPubKey);
      var address = info.multisigAddress;
      var amount = this.b.nowAmount(address);
      var tran = this.b.newTransaction(address, this.b.address, amount, {
        comment: "verifyMultiSig"
      }, cypher);
      console.log("verifyMultiSig done", {
        tran: tran
      });
      return tran;
    }
  }]);

  return Multisig;
}();

exports.default = Multisig;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL211bHRpc2lnLnRzIl0sIm5hbWVzIjpbIkJ1ZmZlciIsInJlcXVpcmUiLCJhZXMyNTYiLCJzc3MiLCJ0eXBlIiwiTXVsdGlzaWciLCJldiIsInYiLCJjb25zb2xlIiwibG9nIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJibG9ja2NoYWluIiwib25NdWx0aXNpZ1RyYW4iLCJiIiwiYWRkcmVzcyIsInRyYW4iLCJhZGRUcmFuc2FjdGlvbiIsImRhdGEiLCJvcHQiLCJNQUtFIiwiZ2V0TXVsdGlTaWdLZXkiLCJzaGFyZXMiLCJpbmZvIiwiVFJBTiIsIm11bHRpU2lnIiwiaW5jbHVkZXMiLCJtdWx0aXNpZ0FkZHJlc3MiLCJleGN1dGVFdmVudCIsIkFQUFJPVkUiLCJzaGFyZVB1YktleVJzYSIsIm93bmVyUHViS2V5IiwiY3lwaGVyIiwicHViS2V5IiwibGVuZ3RoIiwidGhyZXNob2xkIiwic2hhcmVLZXkiLCJjcnlwdG8iLCJwcml2YXRlRGVjcnlwdCIsInNlY0tleSIsImZyb20iLCJwdXNoIiwidmVyaWZ5TXVsdGlTaWciLCJvbk11bHRpc2lnVHJhbkRvbmUiLCJlcnJvciIsImZyaWVuZHNQdWJLZXlBZXMiLCJ2b3RlIiwiYW1vdW50IiwibWFrZU5ld011bHRpU2lnQWRkcmVzcyIsIkN5cGhlciIsImFlc0tleSIsIk1hdGgiLCJyYW5kb20iLCJ0b1N0cmluZyIsImVuY3J5cHRTZWNLZXkiLCJlbmNyeXB0Iiwic2hhcmVLZXlzIiwic3BsaXQiLCJhZXMiLCJpIiwiZGVjcnlwdCIsImlkIiwicHVibGljRW5jcnlwdCIsIm15U2hhcmUiLCJpc093bmVyIiwibXVsdGlzaWdQdWJLZXkiLCJuZXdUcmFuc2FjdGlvbiIsIk1VTFRJU0lHIiwic2hhcmVLZXlSc2EiLCJub3dBbW91bnQiLCJyZWNvdmVyZWQiLCJjb21iaW5lIiwiZW5jcnlwdGVkS2V5IiwiY29tbWVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUVB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dXJjZXNDb250ZW50IjpbImltcG9ydCBCbG9ja0NoYWluIGZyb20gXCIuL2Jsb2NrY2hhaW5cIjtcbmltcG9ydCB7IG11bHRpc2lnSW5mbyB9IGZyb20gXCIuL2ludGVyZmFjZVwiO1xuaW1wb3J0IHNoYTI1NiBmcm9tIFwic2hhMjU2XCI7XG5pbXBvcnQgQ3lwaGVyIGZyb20gXCIuL2N5cGhlclwiO1xuaW1wb3J0IGNyeXB0byBmcm9tIFwiY3J5cHRvLWJyb3dzZXJpZnlcIjtcbmltcG9ydCBzaGExIGZyb20gXCJzaGExXCI7XG5jb25zdCBCdWZmZXIgPSByZXF1aXJlKFwiYnVmZmVyL1wiKS5CdWZmZXI7XG52YXIgYWVzMjU2ID0gcmVxdWlyZShcImFlczI1NlwiKTtcbmNvbnN0IHNzcyA9IHJlcXVpcmUoXCJzaGFtaXJzLXNlY3JldC1zaGFyaW5nXCIpO1xuXG5leHBvcnQgZW51bSB0eXBlIHtcbiAgTUFLRSA9IFwibXVsdGlzaWctbWFrZVwiLFxuICBUUkFOID0gXCJtdWx0aXNpZy10cmFuXCIsXG4gIEFQUFJPVkUgPSBcIm11bHRpc2lnLWFwcHJvdmVcIixcbiAgTVVMVElTSUcgPSBcIm11bHRpc2lnXCJcbn1cblxuaW50ZXJmYWNlIG11bHRpc2lnRGF0YSB7XG4gIG15U2hhcmU6IHN0cmluZztcbiAgc2hhcmVzOiBBcnJheTxzdHJpbmc+O1xuICB0aHJlc2hvbGQ6IG51bWJlcjtcbiAgcHViS2V5OiBzdHJpbmc7XG4gIGVuY3J5cHRTZWNLZXk6IHN0cmluZztcbiAgaXNPd25lcj86IGJvb2xlYW47XG59XG5cbi8v44Kw44Ot44O844OQ44Or44Gr572u44GP44GoKOOBk+OBkylzdGF0aWPjgavjgarjgovjgYvjgoJcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTXVsdGlzaWcge1xuICBtdWx0aVNpZzogeyBba2V5OiBzdHJpbmddOiBtdWx0aXNpZ0RhdGEgfSA9IHt9O1xuICBhZGRyZXNzOiBzdHJpbmc7XG4gIGI6IEJsb2NrQ2hhaW47XG4gIHByaXZhdGUgb25NdWx0aXNpZ1RyYW46IHsgW2tleTogc3RyaW5nXTogKHY/OiBhbnkpID0+IHZvaWQgfSA9IHt9O1xuICBwcml2YXRlIG9uTXVsdGlzaWdUcmFuRG9uZTogeyBba2V5OiBzdHJpbmddOiAodj86IGFueSkgPT4gdm9pZCB9ID0ge307XG4gIGV2ZW50cyA9IHtcbiAgICBvbk11bHRpc2lnVHJhbjogdGhpcy5vbk11bHRpc2lnVHJhblxuICB9O1xuICBwcml2YXRlIGV4Y3V0ZUV2ZW50KGV2OiB7IFtrZXk6IHN0cmluZ106ICh2PzogYW55KSA9PiB2b2lkIH0sIHY/OiBhbnkpIHtcbiAgICBjb25zb2xlLmxvZyhcImV4Y3V0ZUV2ZW50XCIsIGV2KTtcbiAgICBPYmplY3Qua2V5cyhldikuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgZXZba2V5XSh2KTtcbiAgICB9KTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGJsb2NrY2hhaW46IEJsb2NrQ2hhaW4pIHtcbiAgICB0aGlzLmIgPSBibG9ja2NoYWluO1xuICAgIGNvbnNvbGUubG9nKFwiYWRkcmVzc1wiLCB0aGlzLmIuYWRkcmVzcyk7XG4gICAgdGhpcy5hZGRyZXNzID0gdGhpcy5iLmFkZHJlc3M7XG4gIH1cblxuICByZXNwb25kZXIodHJhbjogYW55KSB7XG4gICAgdGhpcy5iLmFkZFRyYW5zYWN0aW9uKHRyYW4pO1xuICAgIGNvbnN0IGRhdGEgPSB0cmFuLmRhdGE7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnNvbGUubG9nKFwicmVzcG9uZGVyXCIsIGRhdGEub3B0KTtcbiAgICAgIHN3aXRjaCAoZGF0YS5vcHQpIHtcbiAgICAgICAgY2FzZSB0eXBlLk1BS0U6XG4gICAgICAgICAgdGhpcy5nZXRNdWx0aVNpZ0tleShkYXRhLnNoYXJlcywgZGF0YS5pbmZvKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0eXBlLlRSQU46XG4gICAgICAgICAge1xuICAgICAgICAgICAgY29uc3QgaW5mbzogbXVsdGlzaWdJbmZvID0gZGF0YS5pbmZvO1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKHRoaXMubXVsdGlTaWcpLmluY2x1ZGVzKGluZm8ubXVsdGlzaWdBZGRyZXNzKSkge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIm9uTXVsdGlzaWdUcmFuXCIpO1xuICAgICAgICAgICAgICB0aGlzLmV4Y3V0ZUV2ZW50KHRoaXMub25NdWx0aXNpZ1RyYW4sIGluZm8pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0eXBlLkFQUFJPVkU6XG4gICAgICAgICAge1xuICAgICAgICAgICAgY29uc3QgaW5mbzogbXVsdGlzaWdJbmZvID0gZGF0YS5pbmZvO1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICBpbmZvLnNoYXJlUHViS2V5UnNhICYmXG4gICAgICAgICAgICAgIGluZm8ub3duZXJQdWJLZXkgPT09IHRoaXMuYi5jeXBoZXIucHViS2V5ICYmXG4gICAgICAgICAgICAgIE9iamVjdC5rZXlzKHRoaXMubXVsdGlTaWcpLmluY2x1ZGVzKGluZm8ubXVsdGlzaWdBZGRyZXNzKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidHlwZS5BUFBST1ZFXCIpO1xuICAgICAgICAgICAgICBjb25zdCBzaGFyZXMgPSB0aGlzLm11bHRpU2lnW2luZm8ubXVsdGlzaWdBZGRyZXNzXS5zaGFyZXM7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicHJvZ3Jlc3NcIiwgc2hhcmVzLmxlbmd0aCwgaW5mby50aHJlc2hvbGQpO1xuICAgICAgICAgICAgICBjb25zdCBzaGFyZUtleSA9IGNyeXB0by5wcml2YXRlRGVjcnlwdChcbiAgICAgICAgICAgICAgICB0aGlzLmIuY3lwaGVyLnNlY0tleSxcbiAgICAgICAgICAgICAgICBCdWZmZXIuZnJvbShpbmZvLnNoYXJlUHViS2V5UnNhLCBcImJhc2U2NFwiKVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICBpZiAoIXNoYXJlcy5pbmNsdWRlcyhzaGFyZUtleSkpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImFkZCBzaGFyZWtleVwiLCB7IHNoYXJlS2V5IH0pO1xuICAgICAgICAgICAgICAgIHNoYXJlcy5wdXNoKHNoYXJlS2V5KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoc2hhcmVzLmxlbmd0aCA+PSBpbmZvLnRocmVzaG9sZCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidmVyaWZ5IG11bHRpc2lnXCIsIHsgc2hhcmVzIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMudmVyaWZ5TXVsdGlTaWcoaW5mbywgc2hhcmVzKTtcbiAgICAgICAgICAgICAgICB0aGlzLmV4Y3V0ZUV2ZW50KHRoaXMub25NdWx0aXNpZ1RyYW5Eb25lKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge31cbiAgfVxuXG4gIG1ha2VOZXdNdWx0aVNpZ0FkZHJlc3MoXG4gICAgZnJpZW5kc1B1YktleUFlczogQXJyYXk8c3RyaW5nPixcbiAgICB2b3RlOiBudW1iZXIsXG4gICAgYW1vdW50OiBudW1iZXJcbiAgKSB7XG4gICAgY29uc29sZS5sb2codGhpcy5tYWtlTmV3TXVsdGlTaWdBZGRyZXNzKTtcbiAgICBjb25zdCBjeXBoZXIgPSBuZXcgQ3lwaGVyKCk7XG5cbiAgICBjb25zdCBhZXNLZXkgPSBzaGExKE1hdGgucmFuZG9tKCkudG9TdHJpbmcoKSkudG9TdHJpbmcoKTtcbiAgICBjb25zb2xlLmxvZyh7IGFlc0tleSB9KTtcbiAgICBjb25zdCBlbmNyeXB0U2VjS2V5OiBzdHJpbmcgPSBhZXMyNTYuZW5jcnlwdChhZXNLZXksIGN5cGhlci5zZWNLZXkpO1xuXG4gICAgY29uc3Qgc2hhcmVLZXlzOiBBcnJheTxhbnk+ID0gc3NzLnNwbGl0KEJ1ZmZlci5mcm9tKGFlc0tleSksIHtcbiAgICAgIHNoYXJlczogZnJpZW5kc1B1YktleUFlcy5sZW5ndGggKyAxLFxuICAgICAgdGhyZXNob2xkOiB2b3RlXG4gICAgfSk7XG4gICAgY29uc29sZS5sb2coeyBzaGFyZUtleXMgfSk7XG5cbiAgICBjb25zdCBhZGRyZXNzID0gc2hhMjU2KGN5cGhlci5wdWJLZXkpO1xuICAgIGNvbnN0IHNoYXJlczogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSA9IHt9O1xuXG4gICAgZnJpZW5kc1B1YktleUFlcy5mb3JFYWNoKChhZXMsIGkpID0+IHtcbiAgICAgIGNvbnN0IHB1YktleSA9IGFlczI1Ni5kZWNyeXB0KFwiZm9ybWF0XCIsIGFlcyk7XG4gICAgICBjb25zdCBpZCA9IHNoYTI1NihwdWJLZXkpO1xuICAgICAgY29uc29sZS5sb2coXCJtYWtlTmV3TXVsdGlTaWdBZGRyZXNzIHNoYXJla2V5XCIsIHNoYXJlS2V5c1tpXSk7XG4gICAgICBzaGFyZXNbaWRdID0gY3J5cHRvXG4gICAgICAgIC5wdWJsaWNFbmNyeXB0KHB1YktleSwgQnVmZmVyLmZyb20oc2hhcmVLZXlzW2ldKSlcbiAgICAgICAgLnRvU3RyaW5nKFwiYmFzZTY0XCIpO1xuICAgIH0pO1xuICAgIGNvbnNvbGUubG9nKHsgc2hhcmVzIH0pO1xuICAgIGNvbnN0IG15U2hhcmUgPSBzaGFyZUtleXNbc2hhcmVLZXlzLmxlbmd0aCAtIDFdO1xuICAgIHRoaXMubXVsdGlTaWdbYWRkcmVzc10gPSB7XG4gICAgICBteVNoYXJlLFxuICAgICAgdGhyZXNob2xkOiB2b3RlLFxuICAgICAgaXNPd25lcjogZmFsc2UsXG4gICAgICBwdWJLZXk6IGN5cGhlci5wdWJLZXksXG4gICAgICBlbmNyeXB0U2VjS2V5LFxuICAgICAgc2hhcmVzOiBbXVxuICAgIH07XG4gICAgdGhpcy5tdWx0aVNpZ1thZGRyZXNzXS5zaGFyZXMucHVzaChteVNoYXJlKTtcbiAgICAvLyBjb25zb2xlLmxvZyh0aGlzLm11bHRpU2lnW2FkZHJlc3NdKTtcbiAgICBjb25zdCBpbmZvOiBtdWx0aXNpZ0luZm8gPSB7XG4gICAgICBtdWx0aXNpZ1B1YktleTogY3lwaGVyLnB1YktleSxcbiAgICAgIG11bHRpc2lnQWRkcmVzczogYWRkcmVzcyxcbiAgICAgIGVuY3J5cHRTZWNLZXksXG4gICAgICB0aHJlc2hvbGQ6IHZvdGVcbiAgICB9O1xuICAgIGNvbnN0IHRyYW4gPSB0aGlzLmIubmV3VHJhbnNhY3Rpb24odGhpcy5iLmFkZHJlc3MsIGFkZHJlc3MsIGFtb3VudCwge1xuICAgICAgdHlwZTogdHlwZS5NVUxUSVNJRyxcbiAgICAgIG9wdDogdHlwZS5NQUtFLFxuICAgICAgc2hhcmVzLFxuICAgICAgaW5mb1xuICAgIH0pO1xuICAgIGNvbnNvbGUubG9nKFwibWFrZU5ld011bHRpU2lnQWRkcmVzcyBkb25lXCIsIHsgdHJhbiB9KTtcbiAgICByZXR1cm4gdHJhbjtcbiAgfVxuXG4gIG1ha2VNdWx0aVNpZ1RyYW5zYWN0aW9uKG11bHRpc2lnQWRkcmVzczogc3RyaW5nKSB7XG4gICAgY29uc29sZS5sb2coXCJtYWtlTXVsdGlTaWdUcmFuc2FjdGlvbiBzdGFydFwiKTtcbiAgICBjb25zdCBkYXRhID0gdGhpcy5tdWx0aVNpZ1ttdWx0aXNpZ0FkZHJlc3NdO1xuICAgIGlmICghZGF0YSkgcmV0dXJuO1xuICAgIGNvbnN0IG11bHRpc2lnUHViS2V5ID0gZGF0YS5wdWJLZXk7XG5cbiAgICAvLyBjb25zb2xlLmxvZyh0aGlzLmIuY3lwaGVyLnB1YktleSwgZGF0YSk7XG4gICAgY29uc3Qgc2hhcmVLZXlSc2EgPSBjcnlwdG9cbiAgICAgIC5wdWJsaWNFbmNyeXB0KHRoaXMuYi5jeXBoZXIucHViS2V5LCBCdWZmZXIuZnJvbShkYXRhLm15U2hhcmUsIFwiYmFzZTY0XCIpKVxuICAgICAgLnRvU3RyaW5nKFwiYmFzZTY0XCIpO1xuXG4gICAgY29uc3QgaW5mbzogbXVsdGlzaWdJbmZvID0ge1xuICAgICAgb3duZXJQdWJLZXk6IHRoaXMuYi5jeXBoZXIucHViS2V5LFxuICAgICAgbXVsdGlzaWdQdWJLZXksXG4gICAgICBtdWx0aXNpZ0FkZHJlc3MsXG4gICAgICBzaGFyZVB1YktleVJzYTogc2hhcmVLZXlSc2EsXG4gICAgICB0aHJlc2hvbGQ6IGRhdGEudGhyZXNob2xkXG4gICAgfTtcbiAgICBkYXRhLmlzT3duZXIgPSB0cnVlO1xuICAgIGNvbnN0IGFtb3VudCA9IHRoaXMuYi5ub3dBbW91bnQobXVsdGlzaWdBZGRyZXNzKTtcbiAgICBjb25zb2xlLmxvZyhcIm11bHRpc2lnIHRyYW5cIiwgeyBhbW91bnQgfSk7XG4gICAgY29uc3QgdHJhbiA9IHRoaXMuYi5uZXdUcmFuc2FjdGlvbih0aGlzLmIuYWRkcmVzcywgbXVsdGlzaWdBZGRyZXNzLCAwLCB7XG4gICAgICB0eXBlOiB0eXBlLk1VTFRJU0lHLFxuICAgICAgb3B0OiB0eXBlLlRSQU4sXG4gICAgICBhbW91bnQsXG4gICAgICBpbmZvXG4gICAgfSk7XG4gICAgY29uc29sZS5sb2coXCJtYWtlTXVsdGlTaWdUcmFuc2FjdGlvbiBkb25lXCIsIHsgdHJhbiB9KTtcbiAgICByZXR1cm4gdHJhbjtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0TXVsdGlTaWdLZXkoXG4gICAgc2hhcmVzOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9LFxuICAgIGluZm86IG11bHRpc2lnSW5mb1xuICApIHtcbiAgICBjb25zb2xlLmxvZyhcImdldE11bHRpU2lnS2V5XCIpO1xuICAgIGlmIChpbmZvLmVuY3J5cHRTZWNLZXkgJiYgT2JqZWN0LmtleXMoc2hhcmVzKS5pbmNsdWRlcyh0aGlzLmFkZHJlc3MpKSB7XG4gICAgICBjb25zb2xlLmxvZyhcImdldE11bHRpU2lnS2V5IHN0YXJ0XCIpO1xuICAgICAgY29uc3Qga2V5ID0gY3J5cHRvLnByaXZhdGVEZWNyeXB0KFxuICAgICAgICB0aGlzLmIuY3lwaGVyLnNlY0tleSxcbiAgICAgICAgQnVmZmVyLmZyb20oc2hhcmVzW3RoaXMuYWRkcmVzc10sIFwiYmFzZTY0XCIpXG4gICAgICApO1xuXG4gICAgICBjb25zb2xlLmxvZyhcImdldE11bHRpU2lnS2V5IGdldCBteSBrZXlcIiwga2V5KTtcblxuICAgICAgdGhpcy5tdWx0aVNpZ1tpbmZvLm11bHRpc2lnQWRkcmVzc10gPSB7XG4gICAgICAgIG15U2hhcmU6IGtleS50b1N0cmluZyhcImJhc2U2NFwiKSxcbiAgICAgICAgaXNPd25lcjogZmFsc2UsXG4gICAgICAgIHRocmVzaG9sZDogaW5mby50aHJlc2hvbGQsXG4gICAgICAgIHB1YktleTogaW5mby5tdWx0aXNpZ1B1YktleSxcbiAgICAgICAgZW5jcnlwdFNlY0tleTogaW5mby5lbmNyeXB0U2VjS2V5LFxuICAgICAgICBzaGFyZXM6IFtdXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGFwcHJvdmVNdWx0aVNpZyhpbmZvOiBtdWx0aXNpZ0luZm8pIHtcbiAgICBjb25zb2xlLmxvZyhcImFwcHJvdmVNdWx0aVNpZ1wiKTtcbiAgICBpZiAoaW5mby5vd25lclB1YktleSkge1xuICAgICAgaWYgKE9iamVjdC5rZXlzKHRoaXMubXVsdGlTaWcpLmluY2x1ZGVzKGluZm8ubXVsdGlzaWdBZGRyZXNzKSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImFwcHJvdmVNdWx0aVNpZyBzdGFydFwiKTtcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5tdWx0aVNpZ1tpbmZvLm11bHRpc2lnQWRkcmVzc10ubXlTaGFyZTtcbiAgICAgICAgY29uc3Qgc2hhcmVLZXlSc2EgPSBjcnlwdG9cbiAgICAgICAgICAucHVibGljRW5jcnlwdChpbmZvLm93bmVyUHViS2V5LCBCdWZmZXIuZnJvbShrZXksIFwiYmFzZTY0XCIpKVxuICAgICAgICAgIC50b1N0cmluZyhcImJhc2U2NFwiKTtcbiAgICAgICAgaW5mby5zaGFyZVB1YktleVJzYSA9IHNoYXJlS2V5UnNhO1xuICAgICAgICBjb25zdCB0cmFuID0gdGhpcy5iLm5ld1RyYW5zYWN0aW9uKFxuICAgICAgICAgIHRoaXMuYi5hZGRyZXNzLFxuICAgICAgICAgIGluZm8ubXVsdGlzaWdBZGRyZXNzLFxuICAgICAgICAgIDAsXG4gICAgICAgICAge1xuICAgICAgICAgICAgdHlwZTogdHlwZS5NVUxUSVNJRyxcbiAgICAgICAgICAgIG9wdDogdHlwZS5BUFBST1ZFLFxuICAgICAgICAgICAgaW5mbzogaW5mb1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJhcHByb3ZlTXVsdGlTaWcgZG9uZVwiLCB7IHRyYW4gfSk7XG4gICAgICAgIHJldHVybiB0cmFuO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHZlcmlmeU11bHRpU2lnKGluZm86IG11bHRpc2lnSW5mbywgc2hhcmVzOiBBcnJheTxhbnk+KSB7XG4gICAgY29uc29sZS5sb2coXCJ2ZXJpZnlNdWx0aVNpZyBzdGFydFwiLCB7IHNoYXJlcyB9KTtcbiAgICBjb25zdCByZWNvdmVyZWQgPSBzc3MuY29tYmluZShzaGFyZXMpLnRvU3RyaW5nKCk7XG4gICAgY29uc29sZS5sb2coeyByZWNvdmVyZWQgfSk7XG4gICAgY29uc3QgZW5jcnlwdGVkS2V5ID0gdGhpcy5tdWx0aVNpZ1tpbmZvLm11bHRpc2lnQWRkcmVzc10uZW5jcnlwdFNlY0tleTtcbiAgICBjb25zdCBzZWNLZXkgPSBhZXMyNTYuZGVjcnlwdChyZWNvdmVyZWQsIGVuY3J5cHRlZEtleSk7XG4gICAgY29uc29sZS5sb2coeyBzZWNLZXkgfSk7XG4gICAgY29uc3QgY3lwaGVyID0gbmV3IEN5cGhlcihzZWNLZXksIGluZm8ubXVsdGlzaWdQdWJLZXkpO1xuICAgIGNvbnN0IGFkZHJlc3MgPSBpbmZvLm11bHRpc2lnQWRkcmVzcztcbiAgICBjb25zdCBhbW91bnQgPSB0aGlzLmIubm93QW1vdW50KGFkZHJlc3MpO1xuICAgIGNvbnN0IHRyYW4gPSB0aGlzLmIubmV3VHJhbnNhY3Rpb24oXG4gICAgICBhZGRyZXNzLFxuICAgICAgdGhpcy5iLmFkZHJlc3MsXG4gICAgICBhbW91bnQsXG4gICAgICB7IGNvbW1lbnQ6IFwidmVyaWZ5TXVsdGlTaWdcIiB9LFxuICAgICAgY3lwaGVyXG4gICAgKTtcbiAgICBjb25zb2xlLmxvZyhcInZlcmlmeU11bHRpU2lnIGRvbmVcIiwgeyB0cmFuIH0pO1xuICAgIHJldHVybiB0cmFuO1xuICB9XG59XG4iXX0=