"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.type = void 0;

var _interface = require("./interface");

var _sha = _interopRequireDefault(require("sha256"));

var _cypher = _interopRequireDefault(require("./cypher"));

var _cryptoBrowserify = _interopRequireDefault(require("crypto-browserify"));

var _sha2 = _interopRequireDefault(require("sha1"));

var _util = require("../util");

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

var Multisig =
/*#__PURE__*/
function () {
  function Multisig(blockchain) {
    _classCallCheck(this, Multisig);

    _defineProperty(this, "multiSig", {});

    _defineProperty(this, "address", void 0);

    _defineProperty(this, "b", void 0);

    _defineProperty(this, "onMultisigTran", {});

    _defineProperty(this, "onMultisigTranDone", {});

    _defineProperty(this, "events", {
      onMultisigTran: this.onMultisigTran,
      onMultisigTranDone: this.onMultisigTranDone
    });

    this.b = blockchain;
    console.log("address", this.b.address);
    this.address = this.b.address;
  } //通信などにより得られた命令に対する処理


  _createClass(Multisig, [{
    key: "responder",
    value: function responder(tran) {
      var data = tran.data;
      console.log("responder", {
        data: data
      });

      if (data.type === _interface.ETransactionType.multisig) {
        var tranMultisig = data.payload;

        switch (tranMultisig.opt) {
          case type.MAKE:
            {
              //トランザクションからマルチシグの情報を取得
              this.getMultiSigKey(tranMultisig.shares, tranMultisig.info);
            }
            break;

          case type.TRAN:
            {
              //イベントの準備
              this.onMultiSigTransaction(tranMultisig.info);
            }
            break;

          case type.APPROVE:
            {
              this.onApproveMultiSig(tranMultisig.info);
            }
            break;
        }
      }
    } //マルチシグのアドレスを生成

  }, {
    key: "makeNewMultiSigAddress",
    value: function makeNewMultiSigAddress(friendsPubKeyAes, //共有者の情報
    vote, //しきい値
    amount //金額
    ) {
      console.log(this.makeNewMultiSigAddress); //秘密鍵と公開鍵を生成

      var cypher = new _cypher.default(); //次に使うaeskeyを生成

      var aesKey = (0, _sha2.default)(Math.random().toString()).toString();
      console.log({
        aesKey: aesKey
      }); //aeskeyで秘密鍵を暗号化

      var encryptSecKey = aes256.encrypt(aesKey, cypher.secKey); //シャミアの秘密分散ライブラリでaeskeyをシェア化

      var shareKeys = sss.split(Buffer.from(aesKey), {
        shares: friendsPubKeyAes.length + 1,
        threshold: vote
      });
      console.log({
        shareKeys: shareKeys
      }); //マルチシグアドレスを導出

      var address = (0, _sha.default)(cypher.pubKey);
      var shares = {}; //シェアの共有者にシェアを配布

      friendsPubKeyAes.forEach(function (aes, i) {
        var pubKey = aes256.decrypt("format", aes);
        var id = (0, _sha.default)(pubKey);
        console.log("makeNewMultiSigAddress sharekey", shareKeys[i]); //共有者の公開鍵でシェアを暗号化

        shares[id] = _cryptoBrowserify.default.publicEncrypt(pubKey, Buffer.from(shareKeys[i])).toString("base64");
      });
      console.log({
        shares: shares
      }); //自身にシェアを一つ割当

      var myShare = shareKeys[shareKeys.length - 1]; //マルチシグの情報を保管

      this.multiSig[address] = {
        myShare: myShare,
        threshold: vote,
        isOwner: false,
        pubKey: cypher.pubKey,
        encryptSecKey: encryptSecKey,
        shares: []
      };
      this.multiSig[address].shares.push(myShare); //ブロックチェーンに載せるマルチシグ情報

      var info = {
        multisigPubKey: cypher.pubKey,
        multisigAddress: address,
        encryptSecKey: encryptSecKey,
        threshold: vote
      }; //トランザクションを生成

      var tran = this.b.newTransaction(this.b.address, address, amount, {
        type: _interface.ETransactionType.multisig,
        payload: {
          opt: type.MAKE,
          shares: shares,
          info: info
        }
      });
      console.log("makeNewMultiSigAddress done", {
        tran: tran
      });
      return tran;
    } //トランザクションからマルチシグの情報を取得

  }, {
    key: "getMultiSigKey",
    value: function getMultiSigKey(shares, info) {
      console.log("getMultiSigKey");

      if (info.encryptSecKey && Object.keys(shares).includes(this.address)) {
        console.log("getMultiSigKey start"); //シェアキーの公開鍵暗号を秘密鍵で解除

        var _key = _cryptoBrowserify.default.privateDecrypt(this.b.cypher.secKey, Buffer.from(shares[this.address], "base64"));

        console.log("getMultiSigKey get my key", _key); //マルチシグ情報を保存

        this.multiSig[info.multisigAddress] = {
          myShare: _key.toString("base64"),
          isOwner: false,
          threshold: info.threshold,
          pubKey: info.multisigPubKey,
          encryptSecKey: info.encryptSecKey,
          shares: []
        };
      }
    } //マルチシグのトランザクションを生成

  }, {
    key: "makeMultiSigTransaction",
    value: function makeMultiSigTransaction(multisigAddress) {
      console.log("makeMultiSigTransaction start"); //マルチシグアドレスの情報を自分が持っているのか

      var data = this.multiSig[multisigAddress];
      if (!data) return;
      var multisigPubKey = data.pubKey; //自分の持っているシェアキーを公開鍵で暗号化

      var shareKeyRsa = _cryptoBrowserify.default.publicEncrypt(this.b.cypher.pubKey, Buffer.from(data.myShare, "base64")).toString("base64"); //ブロックチェーンに載せる情報


      var info = {
        ownerPubKey: this.b.cypher.pubKey,
        multisigPubKey: multisigPubKey,
        multisigAddress: multisigAddress,
        sharePubKeyRsa: shareKeyRsa,
        threshold: data.threshold
      }; //マルチシグ情報にトランザクション実行者フラグを立てる

      data.isOwner = true; //マルチシグアドレスの残高を取得

      var amount = this.b.nowAmount(multisigAddress);
      console.log("multisig tran", {
        amount: amount
      }); //トランザクションを生成

      var tran = this.b.newTransaction(this.b.address, multisigAddress, 0, {
        type: _interface.ETransactionType.multisig,
        payload: {
          opt: type.TRAN,
          amount: amount,
          info: info
        }
      });
      console.log("makeMultiSigTransaction done", {
        tran: tran
      });
      return tran;
    } //イベントコールバックに任せる

  }, {
    key: "onMultiSigTransaction",
    value: function onMultiSigTransaction(info) {
      if (Object.keys(this.multiSig).includes(info.multisigAddress)) {
        console.log("onMultisigTran");
        (0, _util.excuteEvent)(this.onMultisigTran, info);
      }
    } //マルチシグの承認

  }, {
    key: "approveMultiSig",
    value: function approveMultiSig(info) {
      console.log("approveMultiSig");

      if (info.ownerPubKey) {
        //マルチシグの情報があるかを調べる
        if (Object.keys(this.multiSig).includes(info.multisigAddress)) {
          console.log("approveMultiSig start"); //シェアキーを取り出す

          var _key2 = this.multiSig[info.multisigAddress].myShare; //シェアキーをマルチシグトランザクション実行者の公開鍵で暗号化

          var shareKeyRsa = _cryptoBrowserify.default.publicEncrypt(info.ownerPubKey, Buffer.from(_key2, "base64")).toString("base64");

          info.sharePubKeyRsa = shareKeyRsa; //トランザクションを生成

          var tran = this.b.newTransaction(this.b.address, info.multisigAddress, 0, {
            type: _interface.ETransactionType.multisig,
            payload: {
              opt: type.APPROVE,
              info: info
            }
          });
          console.log("approveMultiSig done", {
            tran: tran
          });
          return tran;
        }
      }
    } //マルチシグトランザクション実行者の関数

  }, {
    key: "onApproveMultiSig",
    value: function onApproveMultiSig(info) {
      if (info.sharePubKeyRsa && info.ownerPubKey === this.b.cypher.pubKey && Object.keys(this.multiSig).includes(info.multisigAddress)) {
        console.log("type.APPROVE");
        var _shares = this.multiSig[info.multisigAddress].shares; //シェアキーの公開鍵暗号を自身の秘密鍵で解除

        var shareKey = _cryptoBrowserify.default.privateDecrypt(this.b.cypher.secKey, Buffer.from(info.sharePubKeyRsa, "base64")); //新しいシェアキーなら保存する。


        if (!_shares.includes(shareKey)) {
          console.log("add sharekey", {
            shareKey: shareKey
          });

          _shares.push(shareKey);
        } //シェアキーの数がしきい値を超えればトランザクションを承認


        if (_shares.length >= info.threshold) {
          console.log("verify multisig", {
            shares: _shares
          }); //トランザクションの承認関数

          this.verifyMultiSig(info, _shares);
        }
      }
    } //トランザクションの承認

  }, {
    key: "verifyMultiSig",
    value: function verifyMultiSig(info, shares) {
      console.log("verifyMultiSig start", {
        shares: shares
      }); //シャミアのシェアキーからシークレットを復号化

      var recovered = sss.combine(shares).toString();
      console.log({
        recovered: recovered
      }); //aes暗号化されたシークレットキーを取り出す。

      var encryptedKey = this.multiSig[info.multisigAddress].encryptSecKey; //aes暗号を復号化

      var secKey = aes256.decrypt(recovered, encryptedKey);
      console.log({
        secKey: secKey
      });
      var cypher = new _cypher.default(secKey, info.multisigPubKey);
      var address = info.multisigAddress; //マルチシグアドレスの残高を取得

      var amount = this.b.nowAmount(address); //残高があればトランザクションを実行

      if (amount > 0) {
        var tran = this.b.newTransaction(address, this.b.address, amount, {
          type: _interface.ETransactionType.transaction,
          payload: "verifymultisig"
        }, cypher);
        console.log("verifyMultiSig done", this.b.address, {
          tran: tran
        });
        (0, _util.excuteEvent)(this.onMultisigTranDone);
        return tran;
      }
    }
  }]);

  return Multisig;
}();

exports.default = Multisig;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL211bHRpc2lnLnRzIl0sIm5hbWVzIjpbIkJ1ZmZlciIsInJlcXVpcmUiLCJhZXMyNTYiLCJzc3MiLCJ0eXBlIiwiTXVsdGlzaWciLCJibG9ja2NoYWluIiwib25NdWx0aXNpZ1RyYW4iLCJvbk11bHRpc2lnVHJhbkRvbmUiLCJiIiwiY29uc29sZSIsImxvZyIsImFkZHJlc3MiLCJ0cmFuIiwiZGF0YSIsIkVUcmFuc2FjdGlvblR5cGUiLCJtdWx0aXNpZyIsInRyYW5NdWx0aXNpZyIsInBheWxvYWQiLCJvcHQiLCJNQUtFIiwiZ2V0TXVsdGlTaWdLZXkiLCJzaGFyZXMiLCJpbmZvIiwiVFJBTiIsIm9uTXVsdGlTaWdUcmFuc2FjdGlvbiIsIkFQUFJPVkUiLCJvbkFwcHJvdmVNdWx0aVNpZyIsImZyaWVuZHNQdWJLZXlBZXMiLCJ2b3RlIiwiYW1vdW50IiwibWFrZU5ld011bHRpU2lnQWRkcmVzcyIsImN5cGhlciIsIkN5cGhlciIsImFlc0tleSIsIk1hdGgiLCJyYW5kb20iLCJ0b1N0cmluZyIsImVuY3J5cHRTZWNLZXkiLCJlbmNyeXB0Iiwic2VjS2V5Iiwic2hhcmVLZXlzIiwic3BsaXQiLCJmcm9tIiwibGVuZ3RoIiwidGhyZXNob2xkIiwicHViS2V5IiwiZm9yRWFjaCIsImFlcyIsImkiLCJkZWNyeXB0IiwiaWQiLCJjcnlwdG8iLCJwdWJsaWNFbmNyeXB0IiwibXlTaGFyZSIsIm11bHRpU2lnIiwiaXNPd25lciIsInB1c2giLCJtdWx0aXNpZ1B1YktleSIsIm11bHRpc2lnQWRkcmVzcyIsIm5ld1RyYW5zYWN0aW9uIiwiT2JqZWN0Iiwia2V5cyIsImluY2x1ZGVzIiwia2V5IiwicHJpdmF0ZURlY3J5cHQiLCJzaGFyZUtleVJzYSIsIm93bmVyUHViS2V5Iiwic2hhcmVQdWJLZXlSc2EiLCJub3dBbW91bnQiLCJzaGFyZUtleSIsInZlcmlmeU11bHRpU2lnIiwicmVjb3ZlcmVkIiwiY29tYmluZSIsImVuY3J5cHRl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QVpxRCxDQWFyRDs7QUFDQSxVQUFNN0IsTUFBTSxHQUFHLEtBQUtyQixDQUFMLENBQU80RCxTQUFQLENBQWlCekQsT0FBakIsQ0FBZixDQWRxRCxDQWVyRDs7QUFDQSxVQUFJa0IsTUFBTSxHQUFHLENBQWIsRUFBZ0I7QUFDZCxZQUFNakIsSUFBSSxHQUFHLEtBQUtKLENBQUwsQ0FBT21ELGNBQVAsQ0FDWGhELE9BRFcsRUFFWCxLQUFLSCxDQUFMLENBQU9HLE9BRkksRUFHWGtCLE1BSFcsRUFJWDtBQUFFMUIsVUFBQUEsSUFBSSxFQUFFVyw0QkFBaUI0RCxXQUF6QjtBQUFzQ3pELFVBQUFBLE9BQU8sRUFBRTtBQUEvQyxTQUpXLEVBS1hjLE1BTFcsQ0FBYjtBQU9BdEIsUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVkscUJBQVosRUFBbUMsS0FBS0YsQ0FBTCxDQUFPRyxPQUExQyxFQUFtRDtBQUFFQyxVQUFBQSxJQUFJLEVBQUpBO0FBQUYsU0FBbkQ7QUFDQSwrQkFBWSxLQUFLTCxrQkFBakI7QUFDQSxlQUFPSyxJQUFQO0FBQ0Q7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElUcmFuc2FjdGlvbiB9IGZyb20gXCIuL2Jsb2NrY2hhaW5cIjtcbmltcG9ydCB7IG11bHRpc2lnSW5mbywgRVRyYW5zYWN0aW9uVHlwZSB9IGZyb20gXCIuL2ludGVyZmFjZVwiO1xuaW1wb3J0IHNoYTI1NiBmcm9tIFwic2hhMjU2XCI7XG5pbXBvcnQgQ3lwaGVyIGZyb20gXCIuL2N5cGhlclwiO1xuaW1wb3J0IGNyeXB0byBmcm9tIFwiY3J5cHRvLWJyb3dzZXJpZnlcIjtcbmltcG9ydCBzaGExIGZyb20gXCJzaGExXCI7XG5pbXBvcnQgQmxvY2tDaGFpbkFwcCBmcm9tIFwiLi9ibG9ja2NoYWluQXBwXCI7XG5pbXBvcnQgeyBJRXZlbnRzLCBleGN1dGVFdmVudCB9IGZyb20gXCIuLi91dGlsXCI7XG5jb25zdCBCdWZmZXIgPSByZXF1aXJlKFwiYnVmZmVyL1wiKS5CdWZmZXI7XG52YXIgYWVzMjU2ID0gcmVxdWlyZShcImFlczI1NlwiKTtcbmNvbnN0IHNzcyA9IHJlcXVpcmUoXCJzaGFtaXJzLXNlY3JldC1zaGFyaW5nXCIpO1xuXG5leHBvcnQgZW51bSB0eXBlIHtcbiAgTUFLRSA9IFwibXVsdGlzaWctbWFrZVwiLFxuICBUUkFOID0gXCJtdWx0aXNpZy10cmFuXCIsXG4gIEFQUFJPVkUgPSBcIm11bHRpc2lnLWFwcHJvdmVcIixcbiAgTVVMVElTSUcgPSBcIm11bHRpc2lnXCJcbn1cblxuaW50ZXJmYWNlIG11bHRpc2lnRGF0YSB7XG4gIG15U2hhcmU6IHN0cmluZztcbiAgc2hhcmVzOiBBcnJheTxzdHJpbmc+O1xuICB0aHJlc2hvbGQ6IG51bWJlcjtcbiAgcHViS2V5OiBzdHJpbmc7XG4gIGVuY3J5cHRTZWNLZXk6IHN0cmluZztcbiAgaXNPd25lcj86IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBJVHJhbk11bHRpc2lnIHtcbiAgb3B0OiB0eXBlO1xuICBzaGFyZXM6IGFueTtcbiAgaW5mbzogYW55O1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNdWx0aXNpZyB7XG4gIG11bHRpU2lnOiB7IFtrZXk6IHN0cmluZ106IG11bHRpc2lnRGF0YSB9ID0ge307XG4gIGFkZHJlc3M6IHN0cmluZztcbiAgYjogQmxvY2tDaGFpbkFwcDtcbiAgcHJpdmF0ZSBvbk11bHRpc2lnVHJhbjogSUV2ZW50cyA9IHt9O1xuICBwcml2YXRlIG9uTXVsdGlzaWdUcmFuRG9uZTogSUV2ZW50cyA9IHt9O1xuICBldmVudHMgPSB7XG4gICAgb25NdWx0aXNpZ1RyYW46IHRoaXMub25NdWx0aXNpZ1RyYW4sXG4gICAgb25NdWx0aXNpZ1RyYW5Eb25lOiB0aGlzLm9uTXVsdGlzaWdUcmFuRG9uZVxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKGJsb2NrY2hhaW46IEJsb2NrQ2hhaW5BcHApIHtcbiAgICB0aGlzLmIgPSBibG9ja2NoYWluO1xuICAgIGNvbnNvbGUubG9nKFwiYWRkcmVzc1wiLCB0aGlzLmIuYWRkcmVzcyk7XG4gICAgdGhpcy5hZGRyZXNzID0gdGhpcy5iLmFkZHJlc3M7XG4gIH1cblxuICAvL+mAmuS/oeOBquOBqeOBq+OCiOOCiuW+l+OCieOCjOOBn+WRveS7pOOBq+WvvuOBmeOCi+WHpueQhlxuICByZXNwb25kZXIodHJhbjogSVRyYW5zYWN0aW9uKSB7XG4gICAgY29uc3QgZGF0YSA9IHRyYW4uZGF0YTtcbiAgICBjb25zb2xlLmxvZyhcInJlc3BvbmRlclwiLCB7IGRhdGEgfSk7XG4gICAgaWYgKGRhdGEudHlwZSA9PT0gRVRyYW5zYWN0aW9uVHlwZS5tdWx0aXNpZykge1xuICAgICAgY29uc3QgdHJhbk11bHRpc2lnOiBJVHJhbk11bHRpc2lnID0gZGF0YS5wYXlsb2FkO1xuICAgICAgc3dpdGNoICh0cmFuTXVsdGlzaWcub3B0KSB7XG4gICAgICAgIGNhc2UgdHlwZS5NQUtFOlxuICAgICAgICAgIHtcbiAgICAgICAgICAgIC8v44OI44Op44Oz44K244Kv44K344On44Oz44GL44KJ44Oe44Or44OB44K344Kw44Gu5oOF5aCx44KS5Y+W5b6XXG4gICAgICAgICAgICB0aGlzLmdldE11bHRpU2lnS2V5KHRyYW5NdWx0aXNpZy5zaGFyZXMsIHRyYW5NdWx0aXNpZy5pbmZvKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHlwZS5UUkFOOlxuICAgICAgICAgIHtcbiAgICAgICAgICAgIC8v44Kk44OZ44Oz44OI44Gu5rqW5YKZXG4gICAgICAgICAgICB0aGlzLm9uTXVsdGlTaWdUcmFuc2FjdGlvbih0cmFuTXVsdGlzaWcuaW5mbyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHR5cGUuQVBQUk9WRTpcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLm9uQXBwcm92ZU11bHRpU2lnKHRyYW5NdWx0aXNpZy5pbmZvKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy/jg57jg6vjg4HjgrfjgrDjga7jgqLjg4njg6zjgrnjgpLnlJ/miJBcbiAgbWFrZU5ld011bHRpU2lnQWRkcmVzcyhcbiAgICBmcmllbmRzUHViS2V5QWVzOiBBcnJheTxzdHJpbmc+LCAvL+WFseacieiAheOBruaDheWgsVxuICAgIHZvdGU6IG51bWJlciwgLy/jgZfjgY3jgYTlgKRcbiAgICBhbW91bnQ6IG51bWJlciAvL+mHkemhjVxuICApIHtcbiAgICBjb25zb2xlLmxvZyh0aGlzLm1ha2VOZXdNdWx0aVNpZ0FkZHJlc3MpO1xuICAgIC8v56eY5a+G6Y2144Go5YWs6ZaL6Y2144KS55Sf5oiQXG4gICAgY29uc3QgY3lwaGVyID0gbmV3IEN5cGhlcigpO1xuXG4gICAgLy/mrKHjgavkvb/jgYZhZXNrZXnjgpLnlJ/miJBcbiAgICBjb25zdCBhZXNLZXkgPSBzaGExKE1hdGgucmFuZG9tKCkudG9TdHJpbmcoKSkudG9TdHJpbmcoKTtcbiAgICBjb25zb2xlLmxvZyh7IGFlc0tleSB9KTtcblxuICAgIC8vYWVza2V544Gn56eY5a+G6Y2144KS5pqX5Y+35YyWXG4gICAgY29uc3QgZW5jcnlwdFNlY0tleTogc3RyaW5nID0gYWVzMjU2LmVuY3J5cHQoYWVzS2V5LCBjeXBoZXIuc2VjS2V5KTtcblxuICAgIC8v44K344Oj44Of44Ki44Gu56eY5a+G5YiG5pWj44Op44Kk44OW44Op44Oq44GnYWVza2V544KS44K344Kn44Ki5YyWXG4gICAgY29uc3Qgc2hhcmVLZXlzOiBhbnlbXSA9IHNzcy5zcGxpdChCdWZmZXIuZnJvbShhZXNLZXkpLCB7XG4gICAgICBzaGFyZXM6IGZyaWVuZHNQdWJLZXlBZXMubGVuZ3RoICsgMSxcbiAgICAgIHRocmVzaG9sZDogdm90ZVxuICAgIH0pO1xuXG4gICAgY29uc29sZS5sb2coeyBzaGFyZUtleXMgfSk7XG5cbiAgICAvL+ODnuODq+ODgeOCt+OCsOOCouODieODrOOCueOCkuWwjuWHulxuICAgIGNvbnN0IGFkZHJlc3MgPSBzaGEyNTYoY3lwaGVyLnB1YktleSk7XG4gICAgY29uc3Qgc2hhcmVzOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9ID0ge307XG5cbiAgICAvL+OCt+OCp+OCouOBruWFseacieiAheOBq+OCt+OCp+OCouOCkumFjeW4g1xuICAgIGZyaWVuZHNQdWJLZXlBZXMuZm9yRWFjaCgoYWVzLCBpKSA9PiB7XG4gICAgICBjb25zdCBwdWJLZXkgPSBhZXMyNTYuZGVjcnlwdChcImZvcm1hdFwiLCBhZXMpO1xuICAgICAgY29uc3QgaWQgPSBzaGEyNTYocHViS2V5KTtcbiAgICAgIGNvbnNvbGUubG9nKFwibWFrZU5ld011bHRpU2lnQWRkcmVzcyBzaGFyZWtleVwiLCBzaGFyZUtleXNbaV0pO1xuICAgICAgLy/lhbHmnInogIXjga7lhazplovpjbXjgafjgrfjgqfjgqLjgpLmmpflj7fljJZcbiAgICAgIHNoYXJlc1tpZF0gPSBjcnlwdG9cbiAgICAgICAgLnB1YmxpY0VuY3J5cHQocHViS2V5LCBCdWZmZXIuZnJvbShzaGFyZUtleXNbaV0pKVxuICAgICAgICAudG9TdHJpbmcoXCJiYXNlNjRcIik7XG4gICAgfSk7XG4gICAgY29uc29sZS5sb2coeyBzaGFyZXMgfSk7XG5cbiAgICAvL+iHqui6q+OBq+OCt+OCp+OCouOCkuS4gOOBpOWJsuW9k1xuICAgIGNvbnN0IG15U2hhcmUgPSBzaGFyZUtleXNbc2hhcmVLZXlzLmxlbmd0aCAtIDFdO1xuXG4gICAgLy/jg57jg6vjg4HjgrfjgrDjga7mg4XloLHjgpLkv53nrqFcbiAgICB0aGlzLm11bHRpU2lnW2FkZHJlc3NdID0ge1xuICAgICAgbXlTaGFyZSxcbiAgICAgIHRocmVzaG9sZDogdm90ZSxcbiAgICAgIGlzT3duZXI6IGZhbHNlLFxuICAgICAgcHViS2V5OiBjeXBoZXIucHViS2V5LFxuICAgICAgZW5jcnlwdFNlY0tleSxcbiAgICAgIHNoYXJlczogW11cbiAgICB9O1xuICAgIHRoaXMubXVsdGlTaWdbYWRkcmVzc10uc2hhcmVzLnB1c2gobXlTaGFyZSk7XG5cbiAgICAvL+ODluODreODg+OCr+ODgeOCp+ODvOODs+OBq+i8ieOBm+OCi+ODnuODq+ODgeOCt+OCsOaDheWgsVxuICAgIGNvbnN0IGluZm86IG11bHRpc2lnSW5mbyA9IHtcbiAgICAgIG11bHRpc2lnUHViS2V5OiBjeXBoZXIucHViS2V5LFxuICAgICAgbXVsdGlzaWdBZGRyZXNzOiBhZGRyZXNzLFxuICAgICAgZW5jcnlwdFNlY0tleSxcbiAgICAgIHRocmVzaG9sZDogdm90ZVxuICAgIH07XG5cbiAgICAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OCkueUn+aIkFxuICAgIGNvbnN0IHRyYW4gPSB0aGlzLmIubmV3VHJhbnNhY3Rpb24odGhpcy5iLmFkZHJlc3MsIGFkZHJlc3MsIGFtb3VudCwge1xuICAgICAgdHlwZTogRVRyYW5zYWN0aW9uVHlwZS5tdWx0aXNpZyxcbiAgICAgIHBheWxvYWQ6IHsgb3B0OiB0eXBlLk1BS0UsIHNoYXJlcywgaW5mbyB9XG4gICAgfSk7XG4gICAgY29uc29sZS5sb2coXCJtYWtlTmV3TXVsdGlTaWdBZGRyZXNzIGRvbmVcIiwgeyB0cmFuIH0pO1xuICAgIHJldHVybiB0cmFuO1xuICB9XG5cbiAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgYvjgonjg57jg6vjg4HjgrfjgrDjga7mg4XloLHjgpLlj5blvpdcbiAgcHJpdmF0ZSBnZXRNdWx0aVNpZ0tleShcbiAgICBzaGFyZXM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0sXG4gICAgaW5mbzogbXVsdGlzaWdJbmZvXG4gICkge1xuICAgIGNvbnNvbGUubG9nKFwiZ2V0TXVsdGlTaWdLZXlcIik7XG4gICAgaWYgKGluZm8uZW5jcnlwdFNlY0tleSAmJiBPYmplY3Qua2V5cyhzaGFyZXMpLmluY2x1ZGVzKHRoaXMuYWRkcmVzcykpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZ2V0TXVsdGlTaWdLZXkgc3RhcnRcIik7XG5cbiAgICAgIC8v44K344Kn44Ki44Kt44O844Gu5YWs6ZaL6Y215pqX5Y+344KS56eY5a+G6Y2144Gn6Kej6ZmkXG4gICAgICBjb25zdCBrZXkgPSBjcnlwdG8ucHJpdmF0ZURlY3J5cHQoXG4gICAgICAgIHRoaXMuYi5jeXBoZXIuc2VjS2V5LFxuICAgICAgICBCdWZmZXIuZnJvbShzaGFyZXNbdGhpcy5hZGRyZXNzXSwgXCJiYXNlNjRcIilcbiAgICAgICk7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwiZ2V0TXVsdGlTaWdLZXkgZ2V0IG15IGtleVwiLCBrZXkpO1xuXG4gICAgICAvL+ODnuODq+ODgeOCt+OCsOaDheWgseOCkuS/neWtmFxuICAgICAgdGhpcy5tdWx0aVNpZ1tpbmZvLm11bHRpc2lnQWRkcmVzc10gPSB7XG4gICAgICAgIG15U2hhcmU6IGtleS50b1N0cmluZyhcImJhc2U2NFwiKSxcbiAgICAgICAgaXNPd25lcjogZmFsc2UsXG4gICAgICAgIHRocmVzaG9sZDogaW5mby50aHJlc2hvbGQsXG4gICAgICAgIHB1YktleTogaW5mby5tdWx0aXNpZ1B1YktleSxcbiAgICAgICAgZW5jcnlwdFNlY0tleTogaW5mby5lbmNyeXB0U2VjS2V5LFxuICAgICAgICBzaGFyZXM6IFtdXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIC8v44Oe44Or44OB44K344Kw44Gu44OI44Op44Oz44K244Kv44K344On44Oz44KS55Sf5oiQXG4gIG1ha2VNdWx0aVNpZ1RyYW5zYWN0aW9uKG11bHRpc2lnQWRkcmVzczogc3RyaW5nKSB7XG4gICAgY29uc29sZS5sb2coXCJtYWtlTXVsdGlTaWdUcmFuc2FjdGlvbiBzdGFydFwiKTtcblxuICAgIC8v44Oe44Or44OB44K344Kw44Ki44OJ44Os44K544Gu5oOF5aCx44KS6Ieq5YiG44GM5oyB44Gj44Gm44GE44KL44Gu44GLXG4gICAgY29uc3QgZGF0YSA9IHRoaXMubXVsdGlTaWdbbXVsdGlzaWdBZGRyZXNzXTtcbiAgICBpZiAoIWRhdGEpIHJldHVybjtcbiAgICBjb25zdCBtdWx0aXNpZ1B1YktleSA9IGRhdGEucHViS2V5O1xuXG4gICAgLy/oh6rliIbjga7mjIHjgaPjgabjgYTjgovjgrfjgqfjgqLjgq3jg7zjgpLlhazplovpjbXjgafmmpflj7fljJZcbiAgICBjb25zdCBzaGFyZUtleVJzYSA9IGNyeXB0b1xuICAgICAgLnB1YmxpY0VuY3J5cHQodGhpcy5iLmN5cGhlci5wdWJLZXksIEJ1ZmZlci5mcm9tKGRhdGEubXlTaGFyZSwgXCJiYXNlNjRcIikpXG4gICAgICAudG9TdHJpbmcoXCJiYXNlNjRcIik7XG5cbiAgICAvL+ODluODreODg+OCr+ODgeOCp+ODvOODs+OBq+i8ieOBm+OCi+aDheWgsVxuICAgIGNvbnN0IGluZm86IG11bHRpc2lnSW5mbyA9IHtcbiAgICAgIG93bmVyUHViS2V5OiB0aGlzLmIuY3lwaGVyLnB1YktleSxcbiAgICAgIG11bHRpc2lnUHViS2V5LFxuICAgICAgbXVsdGlzaWdBZGRyZXNzLFxuICAgICAgc2hhcmVQdWJLZXlSc2E6IHNoYXJlS2V5UnNhLFxuICAgICAgdGhyZXNob2xkOiBkYXRhLnRocmVzaG9sZFxuICAgIH07XG4gICAgLy/jg57jg6vjg4HjgrfjgrDmg4XloLHjgavjg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7Plrp/ooYzogIXjg5Xjg6njgrDjgpLnq4vjgabjgotcbiAgICBkYXRhLmlzT3duZXIgPSB0cnVlO1xuXG4gICAgLy/jg57jg6vjg4HjgrfjgrDjgqLjg4njg6zjgrnjga7mrovpq5jjgpLlj5blvpdcbiAgICBjb25zdCBhbW91bnQgPSB0aGlzLmIubm93QW1vdW50KG11bHRpc2lnQWRkcmVzcyk7XG4gICAgY29uc29sZS5sb2coXCJtdWx0aXNpZyB0cmFuXCIsIHsgYW1vdW50IH0pO1xuXG4gICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgpLnlJ/miJBcbiAgICBjb25zdCB0cmFuID0gdGhpcy5iLm5ld1RyYW5zYWN0aW9uKHRoaXMuYi5hZGRyZXNzLCBtdWx0aXNpZ0FkZHJlc3MsIDAsIHtcbiAgICAgIHR5cGU6IEVUcmFuc2FjdGlvblR5cGUubXVsdGlzaWcsXG4gICAgICBwYXlsb2FkOiB7XG4gICAgICAgIG9wdDogdHlwZS5UUkFOLFxuICAgICAgICBhbW91bnQsXG4gICAgICAgIGluZm9cbiAgICAgIH1cbiAgICB9KTtcbiAgICBjb25zb2xlLmxvZyhcIm1ha2VNdWx0aVNpZ1RyYW5zYWN0aW9uIGRvbmVcIiwgeyB0cmFuIH0pO1xuICAgIHJldHVybiB0cmFuO1xuICB9XG5cbiAgLy/jgqTjg5njg7Pjg4jjgrPjg7zjg6vjg5Djg4Pjgq/jgavku7vjgZvjgotcbiAgcHJpdmF0ZSBvbk11bHRpU2lnVHJhbnNhY3Rpb24oaW5mbzogbXVsdGlzaWdJbmZvKSB7XG4gICAgaWYgKE9iamVjdC5rZXlzKHRoaXMubXVsdGlTaWcpLmluY2x1ZGVzKGluZm8ubXVsdGlzaWdBZGRyZXNzKSkge1xuICAgICAgY29uc29sZS5sb2coXCJvbk11bHRpc2lnVHJhblwiKTtcbiAgICAgIGV4Y3V0ZUV2ZW50KHRoaXMub25NdWx0aXNpZ1RyYW4sIGluZm8pO1xuICAgIH1cbiAgfVxuXG4gIC8v44Oe44Or44OB44K344Kw44Gu5om/6KqNXG4gIGFwcHJvdmVNdWx0aVNpZyhpbmZvOiBtdWx0aXNpZ0luZm8pIHtcbiAgICBjb25zb2xlLmxvZyhcImFwcHJvdmVNdWx0aVNpZ1wiKTtcbiAgICBpZiAoaW5mby5vd25lclB1YktleSkge1xuICAgICAgLy/jg57jg6vjg4HjgrfjgrDjga7mg4XloLHjgYzjgYLjgovjgYvjgpLoqr/jgbnjgotcbiAgICAgIGlmIChPYmplY3Qua2V5cyh0aGlzLm11bHRpU2lnKS5pbmNsdWRlcyhpbmZvLm11bHRpc2lnQWRkcmVzcykpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJhcHByb3ZlTXVsdGlTaWcgc3RhcnRcIik7XG5cbiAgICAgICAgLy/jgrfjgqfjgqLjgq3jg7zjgpLlj5bjgorlh7rjgZlcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5tdWx0aVNpZ1tpbmZvLm11bHRpc2lnQWRkcmVzc10ubXlTaGFyZTtcbiAgICAgICAgLy/jgrfjgqfjgqLjgq3jg7zjgpLjg57jg6vjg4HjgrfjgrDjg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7Plrp/ooYzogIXjga7lhazplovpjbXjgafmmpflj7fljJZcbiAgICAgICAgY29uc3Qgc2hhcmVLZXlSc2EgPSBjcnlwdG9cbiAgICAgICAgICAucHVibGljRW5jcnlwdChpbmZvLm93bmVyUHViS2V5LCBCdWZmZXIuZnJvbShrZXksIFwiYmFzZTY0XCIpKVxuICAgICAgICAgIC50b1N0cmluZyhcImJhc2U2NFwiKTtcbiAgICAgICAgaW5mby5zaGFyZVB1YktleVJzYSA9IHNoYXJlS2V5UnNhO1xuICAgICAgICAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OCkueUn+aIkFxuICAgICAgICBjb25zdCB0cmFuID0gdGhpcy5iLm5ld1RyYW5zYWN0aW9uKFxuICAgICAgICAgIHRoaXMuYi5hZGRyZXNzLFxuICAgICAgICAgIGluZm8ubXVsdGlzaWdBZGRyZXNzLFxuICAgICAgICAgIDAsXG4gICAgICAgICAge1xuICAgICAgICAgICAgdHlwZTogRVRyYW5zYWN0aW9uVHlwZS5tdWx0aXNpZyxcbiAgICAgICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICAgICAgb3B0OiB0eXBlLkFQUFJPVkUsXG4gICAgICAgICAgICAgIGluZm86IGluZm9cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiYXBwcm92ZU11bHRpU2lnIGRvbmVcIiwgeyB0cmFuIH0pO1xuICAgICAgICByZXR1cm4gdHJhbjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvL+ODnuODq+ODgeOCt+OCsOODiOODqeODs+OCtuOCr+OCt+ODp+ODs+Wun+ihjOiAheOBrumWouaVsFxuICBwcml2YXRlIG9uQXBwcm92ZU11bHRpU2lnKGluZm86IG11bHRpc2lnSW5mbykge1xuICAgIGlmIChcbiAgICAgIGluZm8uc2hhcmVQdWJLZXlSc2EgJiZcbiAgICAgIGluZm8ub3duZXJQdWJLZXkgPT09IHRoaXMuYi5jeXBoZXIucHViS2V5ICYmXG4gICAgICBPYmplY3Qua2V5cyh0aGlzLm11bHRpU2lnKS5pbmNsdWRlcyhpbmZvLm11bHRpc2lnQWRkcmVzcylcbiAgICApIHtcbiAgICAgIGNvbnNvbGUubG9nKFwidHlwZS5BUFBST1ZFXCIpO1xuICAgICAgY29uc3Qgc2hhcmVzID0gdGhpcy5tdWx0aVNpZ1tpbmZvLm11bHRpc2lnQWRkcmVzc10uc2hhcmVzO1xuXG4gICAgICAvL+OCt+OCp+OCouOCreODvOOBruWFrOmWi+mNteaal+WPt+OCkuiHqui6q+OBruenmOWvhumNteOBp+ino+mZpFxuICAgICAgY29uc3Qgc2hhcmVLZXkgPSBjcnlwdG8ucHJpdmF0ZURlY3J5cHQoXG4gICAgICAgIHRoaXMuYi5jeXBoZXIuc2VjS2V5LFxuICAgICAgICBCdWZmZXIuZnJvbShpbmZvLnNoYXJlUHViS2V5UnNhLCBcImJhc2U2NFwiKVxuICAgICAgKTtcblxuICAgICAgLy/mlrDjgZfjgYTjgrfjgqfjgqLjgq3jg7zjgarjgonkv53lrZjjgZnjgovjgIJcbiAgICAgIGlmICghc2hhcmVzLmluY2x1ZGVzKHNoYXJlS2V5KSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImFkZCBzaGFyZWtleVwiLCB7IHNoYXJlS2V5IH0pO1xuICAgICAgICBzaGFyZXMucHVzaChzaGFyZUtleSk7XG4gICAgICB9XG5cbiAgICAgIC8v44K344Kn44Ki44Kt44O844Gu5pWw44GM44GX44GN44GE5YCk44KS6LaF44GI44KM44Gw44OI44Op44Oz44K244Kv44K344On44Oz44KS5om/6KqNXG4gICAgICBpZiAoc2hhcmVzLmxlbmd0aCA+PSBpbmZvLnRocmVzaG9sZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInZlcmlmeSBtdWx0aXNpZ1wiLCB7IHNoYXJlcyB9KTtcbiAgICAgICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7Pjga7mib/oqo3plqLmlbBcbiAgICAgICAgdGhpcy52ZXJpZnlNdWx0aVNpZyhpbmZvLCBzaGFyZXMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8v44OI44Op44Oz44K244Kv44K344On44Oz44Gu5om/6KqNXG4gIHZlcmlmeU11bHRpU2lnKGluZm86IG11bHRpc2lnSW5mbywgc2hhcmVzOiBBcnJheTxhbnk+KSB7XG4gICAgY29uc29sZS5sb2coXCJ2ZXJpZnlNdWx0aVNpZyBzdGFydFwiLCB7IHNoYXJlcyB9KTtcbiAgICAvL+OCt+ODo+ODn+OCouOBruOCt+OCp+OCouOCreODvOOBi+OCieOCt+ODvOOCr+ODrOODg+ODiOOCkuW+qeWPt+WMllxuICAgIGNvbnN0IHJlY292ZXJlZCA9IHNzcy5jb21iaW5lKHNoYXJlcykudG9TdHJpbmcoKTtcbiAgICBjb25zb2xlLmxvZyh7IHJlY292ZXJlZCB9KTtcblxuICAgIC8vYWVz5pqX5Y+35YyW44GV44KM44Gf44K344O844Kv44Os44OD44OI44Kt44O844KS5Y+W44KK5Ye644GZ44CCXG4gICAgY29uc3QgZW5jcnlwdGVkS2V5ID0gdGhpcy5tdWx0aVNpZ1tpbmZvLm11bHRpc2lnQWRkcmVzc10uZW5jcnlwdFNlY0tleTtcbiAgICAvL2Flc+aal+WPt+OCkuW+qeWPt+WMllxuICAgIGNvbnN0IHNlY0tleSA9IGFlczI1Ni5kZWNyeXB0KHJlY292ZXJlZCwgZW5jcnlwdGVkS2V5KTtcbiAgICBjb25zb2xlLmxvZyh7IHNlY0tleSB9KTtcbiAgICBjb25zdCBjeXBoZXIgPSBuZXcgQ3lwaGVyKHNlY0tleSwgaW5mby5tdWx0aXNpZ1B1YktleSk7XG4gICAgY29uc3QgYWRkcmVzcyA9IGluZm8ubXVsdGlzaWdBZGRyZXNzO1xuICAgIC8v44Oe44Or44OB44K344Kw44Ki44OJ44Os44K544Gu5q6L6auY44KS5Y+W5b6XXG4gICAgY29uc3QgYW1vdW50ID0gdGhpcy5iLm5vd0Ftb3VudChhZGRyZXNzKTtcbiAgICAvL+aui+mrmOOBjOOBguOCjOOBsOODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OCkuWun+ihjFxuICAgIGlmIChhbW91bnQgPiAwKSB7XG4gICAgICBjb25zdCB0cmFuID0gdGhpcy5iLm5ld1RyYW5zYWN0aW9uKFxuICAgICAgICBhZGRyZXNzLFxuICAgICAgICB0aGlzLmIuYWRkcmVzcyxcbiAgICAgICAgYW1vdW50LFxuICAgICAgICB7IHR5cGU6IEVUcmFuc2FjdGlvblR5cGUudHJhbnNhY3Rpb24sIHBheWxvYWQ6IFwidmVyaWZ5bXVsdGlzaWdcIiB9LFxuICAgICAgICBjeXBoZXJcbiAgICAgICk7XG4gICAgICBjb25zb2xlLmxvZyhcInZlcmlmeU11bHRpU2lnIGRvbmVcIiwgdGhpcy5iLmFkZHJlc3MsIHsgdHJhbiB9KTtcbiAgICAgIGV4Y3V0ZUV2ZW50KHRoaXMub25NdWx0aXNpZ1RyYW5Eb25lKTtcbiAgICAgIHJldHVybiB0cmFuO1xuICAgIH1cbiAgfVxufVxuIl19