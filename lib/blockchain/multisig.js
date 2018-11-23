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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL211bHRpc2lnLnRzIl0sIm5hbWVzIjpbIkJ1ZmZlciIsInJlcXVpcmUiLCJhZXMyNTYiLCJzc3MiLCJ0eXBlIiwiTXVsdGlzaWciLCJibG9ja2NoYWluIiwib25NdWx0aXNpZ1RyYW4iLCJvbk11bHRpc2lnVHJhbkRvbmUiLCJiIiwiY29uc29sZSIsImxvZyIsImFkZHJlc3MiLCJ0cmFuIiwiZGF0YSIsIkVUcmFuc2FjdGlvblR5cGUiLCJtdWx0aXNpZyIsInRyYW5NdWx0aXNpZyIsInBheWxvYWQiLCJvcHQiLCJNQUtFIiwiZ2V0TXVsdGlTaWdLZXkiLCJzaGFyZXMiLCJpbmZvIiwiVFJBTiIsIm9uTXVsdGlTaWdUcmFuc2FjdGlvbiIsIkFQUFJPVkUiLCJvbkFwcHJvdmVNdWx0aVNpZyIsImZyaWVuZHNQdWJLZXlBZXMiLCJ2b3RlIiwiYW1vdW50IiwibWFrZU5ld011bHRpU2lnQWRkcmVzcyIsImN5cGhlciIsIkN5cGhlciIsImFlc0tleSIsIk1hdGgiLCJyYW5kb20iLCJ0b1N0cmluZyIsImVuY3J5cHRTZWNLZXkiLCJlbmNyeXB0Iiwic2VjS2V5Iiwic2hhcmVLZXlzIiwic3BsaXQiLCJmcm9tIiwibGVuZ3RoIiwidGhyZXNob2xkIiwicHViS2V5IiwiZm9yRWFjaCIsImFlcyIsImkiLCJkZWNyeXB0IiwiaWQiLCJjcnlwdG8iLCJwdWJsaWNFbmNyeXB0IiwibXlTaGFyZSIsIm11bHRpU2lnIiwiaXNPd25lciIsInB1c2giLCJtdWx0aXNpZ1B1YktleSIsIm11bHRpc2lnQWRkcmVzcyIsIm5ld1RyYW5zYWN0aW9uIiwiT2JqZWN0Iiwia2V5cyIsImluY2x1ZGVzIiwia2V5IiwicHJpdmF0ZURlY3J5cHQiLCJzaGFyZUtleVJzYSIsIm93bmVyUHViS2V5Iiwic2hhcmVQdWJLZXlSc2EiLCJub3dBbW91bnQiLCJzaGFyZUtleSIsInZlcmlmeU11bHRpU2lnIiwicmVjb3ZlcmVkIiwiY29tYmluZSIsImVuY3J5cHRl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Q0FaNkQsQ0FhN0Q7O0FBQ0EsVUFBTTdCLE1BQU0sR0FBRyxLQUFLckIsQ0FBTCxDQUFPNEQsU0FBUCxDQUFpQnpELE9BQWpCLENBQWYsQ0FkNkQsQ0FlN0Q7O0FBQ0EsVUFBSWtCLE1BQU0sR0FBRyxDQUFiLEVBQWdCO0FBQ2QsWUFBTWpCLElBQUksR0FBRyxLQUFLSixDQUFMLENBQU9tRCxjQUFQLENBQ1hoRCxPQURXLEVBRVgsS0FBS0gsQ0FBTCxDQUFPRyxPQUZJLEVBR1hrQixNQUhXLEVBSVg7QUFBRTFCLFVBQUFBLElBQUksRUFBRVcsNEJBQWlCNEQsV0FBekI7QUFBc0N6RCxVQUFBQSxPQUFPLEVBQUU7QUFBL0MsU0FKVyxFQUtYYyxNQUxXLENBQWI7QUFPQXRCLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLHFCQUFaLEVBQW1DLEtBQUtGLENBQUwsQ0FBT0csT0FBMUMsRUFBbUQ7QUFBRUMsVUFBQUEsSUFBSSxFQUFKQTtBQUFGLFNBQW5EO0FBQ0EsK0JBQVksS0FBS0wsa0JBQWpCO0FBQ0EsZUFBT0ssSUFBUDtBQUNEO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJVHJhbnNhY3Rpb24gfSBmcm9tIFwiLi9ibG9ja2NoYWluXCI7XG5pbXBvcnQgeyBtdWx0aXNpZ0luZm8sIEVUcmFuc2FjdGlvblR5cGUgfSBmcm9tIFwiLi9pbnRlcmZhY2VcIjtcbmltcG9ydCBzaGEyNTYgZnJvbSBcInNoYTI1NlwiO1xuaW1wb3J0IEN5cGhlciBmcm9tIFwiLi9jeXBoZXJcIjtcbmltcG9ydCBjcnlwdG8gZnJvbSBcImNyeXB0by1icm93c2VyaWZ5XCI7XG5pbXBvcnQgc2hhMSBmcm9tIFwic2hhMVwiO1xuaW1wb3J0IEJsb2NrQ2hhaW5BcHAgZnJvbSBcIi4vYmxvY2tjaGFpbkFwcFwiO1xuaW1wb3J0IHsgSUV2ZW50cywgZXhjdXRlRXZlbnQgfSBmcm9tIFwiLi4vdXRpbFwiO1xuY29uc3QgQnVmZmVyID0gcmVxdWlyZShcImJ1ZmZlci9cIikuQnVmZmVyO1xudmFyIGFlczI1NiA9IHJlcXVpcmUoXCJhZXMyNTZcIik7XG5jb25zdCBzc3MgPSByZXF1aXJlKFwic2hhbWlycy1zZWNyZXQtc2hhcmluZ1wiKTtcblxuZXhwb3J0IGVudW0gdHlwZSB7XG4gIE1BS0UgPSBcIm11bHRpc2lnLW1ha2VcIixcbiAgVFJBTiA9IFwibXVsdGlzaWctdHJhblwiLFxuICBBUFBST1ZFID0gXCJtdWx0aXNpZy1hcHByb3ZlXCIsXG4gIE1VTFRJU0lHID0gXCJtdWx0aXNpZ1wiXG59XG5cbmludGVyZmFjZSBtdWx0aXNpZ0RhdGEge1xuICBteVNoYXJlOiBzdHJpbmc7XG4gIHNoYXJlczogQXJyYXk8c3RyaW5nPjtcbiAgdGhyZXNob2xkOiBudW1iZXI7XG4gIHB1YktleTogc3RyaW5nO1xuICBlbmNyeXB0U2VjS2V5OiBzdHJpbmc7XG4gIGlzT3duZXI/OiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgSVRyYW5NdWx0aXNpZyB7XG4gIG9wdDogdHlwZTtcbiAgc2hhcmVzOiBhbnk7XG4gIGluZm86IGFueTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTXVsdGlzaWcge1xuICBtdWx0aVNpZzogeyBba2V5OiBzdHJpbmddOiBtdWx0aXNpZ0RhdGEgfSA9IHt9O1xuICBhZGRyZXNzOiBzdHJpbmc7XG4gIGI6IEJsb2NrQ2hhaW5BcHA7XG4gIHByaXZhdGUgb25NdWx0aXNpZ1RyYW46IElFdmVudHMgPSB7fTtcbiAgcHJpdmF0ZSBvbk11bHRpc2lnVHJhbkRvbmU6IElFdmVudHMgPSB7fTtcbiAgZXZlbnRzID0ge1xuICAgIG9uTXVsdGlzaWdUcmFuOiB0aGlzLm9uTXVsdGlzaWdUcmFuLFxuICAgIG9uTXVsdGlzaWdUcmFuRG9uZTogdGhpcy5vbk11bHRpc2lnVHJhbkRvbmVcbiAgfTtcblxuICBjb25zdHJ1Y3RvcihibG9ja2NoYWluOiBCbG9ja0NoYWluQXBwKSB7XG4gICAgdGhpcy5iID0gYmxvY2tjaGFpbjtcbiAgICBjb25zb2xlLmxvZyhcImFkZHJlc3NcIiwgdGhpcy5iLmFkZHJlc3MpO1xuICAgIHRoaXMuYWRkcmVzcyA9IHRoaXMuYi5hZGRyZXNzO1xuICB9XG5cbiAgLy/pgJrkv6HjgarjganjgavjgojjgorlvpfjgonjgozjgZ/lkb3ku6Tjgavlr77jgZnjgovlh6bnkIZcbiAgcmVzcG9uZGVyKHRyYW46IElUcmFuc2FjdGlvbikge1xuICAgIGNvbnN0IGRhdGEgPSB0cmFuLmRhdGE7XG4gICAgY29uc29sZS5sb2coXCJyZXNwb25kZXJcIiwgeyBkYXRhIH0pO1xuICAgIGlmIChkYXRhLnR5cGUgPT09IEVUcmFuc2FjdGlvblR5cGUubXVsdGlzaWcpIHtcbiAgICAgIGNvbnN0IHRyYW5NdWx0aXNpZzogSVRyYW5NdWx0aXNpZyA9IGRhdGEucGF5bG9hZDtcbiAgICAgIHN3aXRjaCAodHJhbk11bHRpc2lnLm9wdCkge1xuICAgICAgICBjYXNlIHR5cGUuTUFLRTpcbiAgICAgICAgICB7XG4gICAgICAgICAgICAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OBi+OCieODnuODq+ODgeOCt+OCsOOBruaDheWgseOCkuWPluW+l1xuICAgICAgICAgICAgdGhpcy5nZXRNdWx0aVNpZ0tleSh0cmFuTXVsdGlzaWcuc2hhcmVzLCB0cmFuTXVsdGlzaWcuaW5mbyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHR5cGUuVFJBTjpcbiAgICAgICAgICB7XG4gICAgICAgICAgICAvL+OCpOODmeODs+ODiOOBrua6luWCmVxuICAgICAgICAgICAgdGhpcy5vbk11bHRpU2lnVHJhbnNhY3Rpb24odHJhbk11bHRpc2lnLmluZm8pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0eXBlLkFQUFJPVkU6XG4gICAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5vbkFwcHJvdmVNdWx0aVNpZyh0cmFuTXVsdGlzaWcuaW5mbyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8v44Oe44Or44OB44K344Kw44Gu44Ki44OJ44Os44K544KS55Sf5oiQXG4gIG1ha2VOZXdNdWx0aVNpZ0FkZHJlc3MoXG4gICAgZnJpZW5kc1B1YktleUFlczogQXJyYXk8c3RyaW5nPiwgLy/lhbHmnInogIXjga7mg4XloLFcbiAgICB2b3RlOiBudW1iZXIsIC8v44GX44GN44GE5YCkXG4gICAgYW1vdW50OiBudW1iZXIgLy/ph5HpoY1cbiAgKSB7XG4gICAgY29uc29sZS5sb2codGhpcy5tYWtlTmV3TXVsdGlTaWdBZGRyZXNzKTtcbiAgICAvL+enmOWvhumNteOBqOWFrOmWi+mNteOCkueUn+aIkFxuICAgIGNvbnN0IGN5cGhlciA9IG5ldyBDeXBoZXIoKTtcblxuICAgIC8v5qyh44Gr5L2/44GGYWVza2V544KS55Sf5oiQXG4gICAgY29uc3QgYWVzS2V5ID0gc2hhMShNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKCkpLnRvU3RyaW5nKCk7XG4gICAgY29uc29sZS5sb2coeyBhZXNLZXkgfSk7XG5cbiAgICAvL2Flc2tleeOBp+enmOWvhumNteOCkuaal+WPt+WMllxuICAgIGNvbnN0IGVuY3J5cHRTZWNLZXk6IHN0cmluZyA9IGFlczI1Ni5lbmNyeXB0KGFlc0tleSwgY3lwaGVyLnNlY0tleSk7XG5cbiAgICAvL+OCt+ODo+ODn+OCouOBruenmOWvhuWIhuaVo+ODqeOCpOODluODqeODquOBp2Flc2tleeOCkuOCt+OCp+OCouWMllxuICAgIGNvbnN0IHNoYXJlS2V5czogYW55W10gPSBzc3Muc3BsaXQoQnVmZmVyLmZyb20oYWVzS2V5KSwge1xuICAgICAgc2hhcmVzOiBmcmllbmRzUHViS2V5QWVzLmxlbmd0aCArIDEsXG4gICAgICB0aHJlc2hvbGQ6IHZvdGVcbiAgICB9KTtcblxuICAgIGNvbnNvbGUubG9nKHsgc2hhcmVLZXlzIH0pO1xuXG4gICAgLy/jg57jg6vjg4HjgrfjgrDjgqLjg4njg6zjgrnjgpLlsI7lh7pcbiAgICBjb25zdCBhZGRyZXNzID0gc2hhMjU2KGN5cGhlci5wdWJLZXkpO1xuICAgIGNvbnN0IHNoYXJlczogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSA9IHt9O1xuXG4gICAgLy/jgrfjgqfjgqLjga7lhbHmnInogIXjgavjgrfjgqfjgqLjgpLphY3luINcbiAgICBmcmllbmRzUHViS2V5QWVzLmZvckVhY2goKGFlcywgaSkgPT4ge1xuICAgICAgY29uc3QgcHViS2V5ID0gYWVzMjU2LmRlY3J5cHQoXCJmb3JtYXRcIiwgYWVzKTtcbiAgICAgIGNvbnN0IGlkID0gc2hhMjU2KHB1YktleSk7XG4gICAgICBjb25zb2xlLmxvZyhcIm1ha2VOZXdNdWx0aVNpZ0FkZHJlc3Mgc2hhcmVrZXlcIiwgc2hhcmVLZXlzW2ldKTtcbiAgICAgIC8v5YWx5pyJ6ICF44Gu5YWs6ZaL6Y2144Gn44K344Kn44Ki44KS5pqX5Y+35YyWXG4gICAgICBzaGFyZXNbaWRdID0gY3J5cHRvXG4gICAgICAgIC5wdWJsaWNFbmNyeXB0KHB1YktleSwgQnVmZmVyLmZyb20oc2hhcmVLZXlzW2ldKSlcbiAgICAgICAgLnRvU3RyaW5nKFwiYmFzZTY0XCIpO1xuICAgIH0pO1xuICAgIGNvbnNvbGUubG9nKHsgc2hhcmVzIH0pO1xuXG4gICAgLy/oh6rouqvjgavjgrfjgqfjgqLjgpLkuIDjgaTlibLlvZNcbiAgICBjb25zdCBteVNoYXJlID0gc2hhcmVLZXlzW3NoYXJlS2V5cy5sZW5ndGggLSAxXTtcblxuICAgIC8v44Oe44Or44OB44K344Kw44Gu5oOF5aCx44KS5L+d566hXG4gICAgdGhpcy5tdWx0aVNpZ1thZGRyZXNzXSA9IHtcbiAgICAgIG15U2hhcmUsXG4gICAgICB0aHJlc2hvbGQ6IHZvdGUsXG4gICAgICBpc093bmVyOiBmYWxzZSxcbiAgICAgIHB1YktleTogY3lwaGVyLnB1YktleSxcbiAgICAgIGVuY3J5cHRTZWNLZXksXG4gICAgICBzaGFyZXM6IFtdXG4gICAgfTtcbiAgICB0aGlzLm11bHRpU2lnW2FkZHJlc3NdLnNoYXJlcy5wdXNoKG15U2hhcmUpO1xuXG4gICAgLy/jg5bjg63jg4Pjgq/jg4Hjgqfjg7zjg7PjgavovInjgZvjgovjg57jg6vjg4HjgrfjgrDmg4XloLFcbiAgICBjb25zdCBpbmZvOiBtdWx0aXNpZ0luZm8gPSB7XG4gICAgICBtdWx0aXNpZ1B1YktleTogY3lwaGVyLnB1YktleSxcbiAgICAgIG11bHRpc2lnQWRkcmVzczogYWRkcmVzcyxcbiAgICAgIGVuY3J5cHRTZWNLZXksXG4gICAgICB0aHJlc2hvbGQ6IHZvdGVcbiAgICB9O1xuXG4gICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgpLnlJ/miJBcbiAgICBjb25zdCB0cmFuID0gdGhpcy5iLm5ld1RyYW5zYWN0aW9uKHRoaXMuYi5hZGRyZXNzLCBhZGRyZXNzLCBhbW91bnQsIHtcbiAgICAgIHR5cGU6IEVUcmFuc2FjdGlvblR5cGUubXVsdGlzaWcsXG4gICAgICBwYXlsb2FkOiB7IG9wdDogdHlwZS5NQUtFLCBzaGFyZXMsIGluZm8gfVxuICAgIH0pO1xuICAgIGNvbnNvbGUubG9nKFwibWFrZU5ld011bHRpU2lnQWRkcmVzcyBkb25lXCIsIHsgdHJhbiB9KTtcbiAgICByZXR1cm4gdHJhbjtcbiAgfVxuXG4gIC8v44OI44Op44Oz44K244Kv44K344On44Oz44GL44KJ44Oe44Or44OB44K344Kw44Gu5oOF5aCx44KS5Y+W5b6XXG4gIHByaXZhdGUgZ2V0TXVsdGlTaWdLZXkoXG4gICAgc2hhcmVzOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9LFxuICAgIGluZm86IG11bHRpc2lnSW5mb1xuICApIHtcbiAgICBjb25zb2xlLmxvZyhcImdldE11bHRpU2lnS2V5XCIpO1xuICAgIGlmIChpbmZvLmVuY3J5cHRTZWNLZXkgJiYgT2JqZWN0LmtleXMoc2hhcmVzKS5pbmNsdWRlcyh0aGlzLmFkZHJlc3MpKSB7XG4gICAgICBjb25zb2xlLmxvZyhcImdldE11bHRpU2lnS2V5IHN0YXJ0XCIpO1xuXG4gICAgICAvL+OCt+OCp+OCouOCreODvOOBruWFrOmWi+mNteaal+WPt+OCkuenmOWvhumNteOBp+ino+mZpFxuICAgICAgY29uc3Qga2V5ID0gY3J5cHRvLnByaXZhdGVEZWNyeXB0KFxuICAgICAgICB0aGlzLmIuY3lwaGVyLnNlY0tleSxcbiAgICAgICAgQnVmZmVyLmZyb20oc2hhcmVzW3RoaXMuYWRkcmVzc10sIFwiYmFzZTY0XCIpXG4gICAgICApO1xuXG4gICAgICBjb25zb2xlLmxvZyhcImdldE11bHRpU2lnS2V5IGdldCBteSBrZXlcIiwga2V5KTtcblxuICAgICAgLy/jg57jg6vjg4HjgrfjgrDmg4XloLHjgpLkv53lrZhcbiAgICAgIHRoaXMubXVsdGlTaWdbaW5mby5tdWx0aXNpZ0FkZHJlc3NdID0ge1xuICAgICAgICBteVNoYXJlOiBrZXkudG9TdHJpbmcoXCJiYXNlNjRcIiksXG4gICAgICAgIGlzT3duZXI6IGZhbHNlLFxuICAgICAgICB0aHJlc2hvbGQ6IGluZm8udGhyZXNob2xkLFxuICAgICAgICBwdWJLZXk6IGluZm8ubXVsdGlzaWdQdWJLZXksXG4gICAgICAgIGVuY3J5cHRTZWNLZXk6IGluZm8uZW5jcnlwdFNlY0tleSxcbiAgICAgICAgc2hhcmVzOiBbXVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICAvL+ODnuODq+ODgeOCt+OCsOOBruODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OCkueUn+aIkFxuICBtYWtlTXVsdGlTaWdUcmFuc2FjdGlvbihtdWx0aXNpZ0FkZHJlc3M6IHN0cmluZykge1xuICAgIGNvbnNvbGUubG9nKFwibWFrZU11bHRpU2lnVHJhbnNhY3Rpb24gc3RhcnRcIik7XG5cbiAgICAvL+ODnuODq+ODgeOCt+OCsOOCouODieODrOOCueOBruaDheWgseOCkuiHquWIhuOBjOaMgeOBo+OBpuOBhOOCi+OBruOBi1xuICAgIGNvbnN0IGRhdGEgPSB0aGlzLm11bHRpU2lnW211bHRpc2lnQWRkcmVzc107XG4gICAgaWYgKCFkYXRhKSByZXR1cm47XG4gICAgY29uc3QgbXVsdGlzaWdQdWJLZXkgPSBkYXRhLnB1YktleTtcblxuICAgIC8v6Ieq5YiG44Gu5oyB44Gj44Gm44GE44KL44K344Kn44Ki44Kt44O844KS5YWs6ZaL6Y2144Gn5pqX5Y+35YyWXG4gICAgY29uc3Qgc2hhcmVLZXlSc2EgPSBjcnlwdG9cbiAgICAgIC5wdWJsaWNFbmNyeXB0KHRoaXMuYi5jeXBoZXIucHViS2V5LCBCdWZmZXIuZnJvbShkYXRhLm15U2hhcmUsIFwiYmFzZTY0XCIpKVxuICAgICAgLnRvU3RyaW5nKFwiYmFzZTY0XCIpO1xuXG4gICAgLy/jg5bjg63jg4Pjgq/jg4Hjgqfjg7zjg7PjgavovInjgZvjgovmg4XloLFcbiAgICBjb25zdCBpbmZvOiBtdWx0aXNpZ0luZm8gPSB7XG4gICAgICBvd25lclB1YktleTogdGhpcy5iLmN5cGhlci5wdWJLZXksXG4gICAgICBtdWx0aXNpZ1B1YktleSxcbiAgICAgIG11bHRpc2lnQWRkcmVzcyxcbiAgICAgIHNoYXJlUHViS2V5UnNhOiBzaGFyZUtleVJzYSxcbiAgICAgIHRocmVzaG9sZDogZGF0YS50aHJlc2hvbGRcbiAgICB9O1xuICAgIC8v44Oe44Or44OB44K344Kw5oOF5aCx44Gr44OI44Op44Oz44K244Kv44K344On44Oz5a6f6KGM6ICF44OV44Op44Kw44KS56uL44Gm44KLXG4gICAgZGF0YS5pc093bmVyID0gdHJ1ZTtcblxuICAgIC8v44Oe44Or44OB44K344Kw44Ki44OJ44Os44K544Gu5q6L6auY44KS5Y+W5b6XXG4gICAgY29uc3QgYW1vdW50ID0gdGhpcy5iLm5vd0Ftb3VudChtdWx0aXNpZ0FkZHJlc3MpO1xuICAgIGNvbnNvbGUubG9nKFwibXVsdGlzaWcgdHJhblwiLCB7IGFtb3VudCB9KTtcblxuICAgIC8v44OI44Op44Oz44K244Kv44K344On44Oz44KS55Sf5oiQXG4gICAgY29uc3QgdHJhbiA9IHRoaXMuYi5uZXdUcmFuc2FjdGlvbih0aGlzLmIuYWRkcmVzcywgbXVsdGlzaWdBZGRyZXNzLCAwLCB7XG4gICAgICB0eXBlOiBFVHJhbnNhY3Rpb25UeXBlLm11bHRpc2lnLFxuICAgICAgcGF5bG9hZDoge1xuICAgICAgICBvcHQ6IHR5cGUuVFJBTixcbiAgICAgICAgYW1vdW50LFxuICAgICAgICBpbmZvXG4gICAgICB9XG4gICAgfSk7XG4gICAgY29uc29sZS5sb2coXCJtYWtlTXVsdGlTaWdUcmFuc2FjdGlvbiBkb25lXCIsIHsgdHJhbiB9KTtcbiAgICByZXR1cm4gdHJhbjtcbiAgfVxuXG4gIC8v44Kk44OZ44Oz44OI44Kz44O844Or44OQ44OD44Kv44Gr5Lu744Gb44KLXG4gIHByaXZhdGUgb25NdWx0aVNpZ1RyYW5zYWN0aW9uKGluZm86IG11bHRpc2lnSW5mbykge1xuICAgIGlmIChPYmplY3Qua2V5cyh0aGlzLm11bHRpU2lnKS5pbmNsdWRlcyhpbmZvLm11bHRpc2lnQWRkcmVzcykpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwib25NdWx0aXNpZ1RyYW5cIik7XG4gICAgICBleGN1dGVFdmVudCh0aGlzLm9uTXVsdGlzaWdUcmFuLCBpbmZvKTtcbiAgICB9XG4gIH1cblxuICAvL+ODnuODq+ODgeOCt+OCsOOBruaJv+iqjVxuICBhcHByb3ZlTXVsdGlTaWcoaW5mbzogbXVsdGlzaWdJbmZvKSB7XG4gICAgY29uc29sZS5sb2coXCJhcHByb3ZlTXVsdGlTaWdcIik7XG4gICAgaWYgKGluZm8ub3duZXJQdWJLZXkpIHtcbiAgICAgIC8v44Oe44Or44OB44K344Kw44Gu5oOF5aCx44GM44GC44KL44GL44KS6Kq/44G544KLXG4gICAgICBpZiAoT2JqZWN0LmtleXModGhpcy5tdWx0aVNpZykuaW5jbHVkZXMoaW5mby5tdWx0aXNpZ0FkZHJlc3MpKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiYXBwcm92ZU11bHRpU2lnIHN0YXJ0XCIpO1xuXG4gICAgICAgIC8v44K344Kn44Ki44Kt44O844KS5Y+W44KK5Ye644GZXG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMubXVsdGlTaWdbaW5mby5tdWx0aXNpZ0FkZHJlc3NdLm15U2hhcmU7XG4gICAgICAgIC8v44K344Kn44Ki44Kt44O844KS44Oe44Or44OB44K344Kw44OI44Op44Oz44K244Kv44K344On44Oz5a6f6KGM6ICF44Gu5YWs6ZaL6Y2144Gn5pqX5Y+35YyWXG4gICAgICAgIGNvbnN0IHNoYXJlS2V5UnNhID0gY3J5cHRvXG4gICAgICAgICAgLnB1YmxpY0VuY3J5cHQoaW5mby5vd25lclB1YktleSwgQnVmZmVyLmZyb20oa2V5LCBcImJhc2U2NFwiKSlcbiAgICAgICAgICAudG9TdHJpbmcoXCJiYXNlNjRcIik7XG4gICAgICAgIGluZm8uc2hhcmVQdWJLZXlSc2EgPSBzaGFyZUtleVJzYTtcbiAgICAgICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgpLnlJ/miJBcbiAgICAgICAgY29uc3QgdHJhbiA9IHRoaXMuYi5uZXdUcmFuc2FjdGlvbihcbiAgICAgICAgICB0aGlzLmIuYWRkcmVzcyxcbiAgICAgICAgICBpbmZvLm11bHRpc2lnQWRkcmVzcyxcbiAgICAgICAgICAwLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHR5cGU6IEVUcmFuc2FjdGlvblR5cGUubXVsdGlzaWcsXG4gICAgICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgICAgIG9wdDogdHlwZS5BUFBST1ZFLFxuICAgICAgICAgICAgICBpbmZvOiBpbmZvXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICBjb25zb2xlLmxvZyhcImFwcHJvdmVNdWx0aVNpZyBkb25lXCIsIHsgdHJhbiB9KTtcbiAgICAgICAgcmV0dXJuIHRyYW47XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy/jg57jg6vjg4HjgrfjgrDjg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7Plrp/ooYzogIXjga7plqLmlbBcbiAgcHJpdmF0ZSBvbkFwcHJvdmVNdWx0aVNpZyhpbmZvOiBtdWx0aXNpZ0luZm8pIHtcbiAgICBpZiAoXG4gICAgICBpbmZvLnNoYXJlUHViS2V5UnNhICYmXG4gICAgICBpbmZvLm93bmVyUHViS2V5ID09PSB0aGlzLmIuY3lwaGVyLnB1YktleSAmJlxuICAgICAgT2JqZWN0LmtleXModGhpcy5tdWx0aVNpZykuaW5jbHVkZXMoaW5mby5tdWx0aXNpZ0FkZHJlc3MpXG4gICAgKSB7XG4gICAgICBjb25zb2xlLmxvZyhcInR5cGUuQVBQUk9WRVwiKTtcbiAgICAgIGNvbnN0IHNoYXJlcyA9IHRoaXMubXVsdGlTaWdbaW5mby5tdWx0aXNpZ0FkZHJlc3NdLnNoYXJlcztcblxuICAgICAgLy/jgrfjgqfjgqLjgq3jg7zjga7lhazplovpjbXmmpflj7fjgpLoh6rouqvjga7np5jlr4bpjbXjgafop6PpmaRcbiAgICAgIGNvbnN0IHNoYXJlS2V5ID0gY3J5cHRvLnByaXZhdGVEZWNyeXB0KFxuICAgICAgICB0aGlzLmIuY3lwaGVyLnNlY0tleSxcbiAgICAgICAgQnVmZmVyLmZyb20oaW5mby5zaGFyZVB1YktleVJzYSwgXCJiYXNlNjRcIilcbiAgICAgICk7XG5cbiAgICAgIC8v5paw44GX44GE44K344Kn44Ki44Kt44O844Gq44KJ5L+d5a2Y44GZ44KL44CCXG4gICAgICBpZiAoIXNoYXJlcy5pbmNsdWRlcyhzaGFyZUtleSkpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJhZGQgc2hhcmVrZXlcIiwgeyBzaGFyZUtleSB9KTtcbiAgICAgICAgc2hhcmVzLnB1c2goc2hhcmVLZXkpO1xuICAgICAgfVxuXG4gICAgICAvL+OCt+OCp+OCouOCreODvOOBruaVsOOBjOOBl+OBjeOBhOWApOOCkui2heOBiOOCjOOBsOODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OCkuaJv+iqjVxuICAgICAgaWYgKHNoYXJlcy5sZW5ndGggPj0gaW5mby50aHJlc2hvbGQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJ2ZXJpZnkgbXVsdGlzaWdcIiwgeyBzaGFyZXMgfSk7XG4gICAgICAgIC8v44OI44Op44Oz44K244Kv44K344On44Oz44Gu5om/6KqN6Zai5pWwXG4gICAgICAgIHRoaXMudmVyaWZ5TXVsdGlTaWcoaW5mbywgc2hhcmVzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OBruaJv+iqjVxuICBwcml2YXRlIHZlcmlmeU11bHRpU2lnKGluZm86IG11bHRpc2lnSW5mbywgc2hhcmVzOiBBcnJheTxhbnk+KSB7XG4gICAgY29uc29sZS5sb2coXCJ2ZXJpZnlNdWx0aVNpZyBzdGFydFwiLCB7IHNoYXJlcyB9KTtcbiAgICAvL+OCt+ODo+ODn+OCouOBruOCt+OCp+OCouOCreODvOOBi+OCieOCt+ODvOOCr+ODrOODg+ODiOOCkuW+qeWPt+WMllxuICAgIGNvbnN0IHJlY292ZXJlZCA9IHNzcy5jb21iaW5lKHNoYXJlcykudG9TdHJpbmcoKTtcbiAgICBjb25zb2xlLmxvZyh7IHJlY292ZXJlZCB9KTtcblxuICAgIC8vYWVz5pqX5Y+35YyW44GV44KM44Gf44K344O844Kv44Os44OD44OI44Kt44O844KS5Y+W44KK5Ye644GZ44CCXG4gICAgY29uc3QgZW5jcnlwdGVkS2V5ID0gdGhpcy5tdWx0aVNpZ1tpbmZvLm11bHRpc2lnQWRkcmVzc10uZW5jcnlwdFNlY0tleTtcbiAgICAvL2Flc+aal+WPt+OCkuW+qeWPt+WMllxuICAgIGNvbnN0IHNlY0tleSA9IGFlczI1Ni5kZWNyeXB0KHJlY292ZXJlZCwgZW5jcnlwdGVkS2V5KTtcbiAgICBjb25zb2xlLmxvZyh7IHNlY0tleSB9KTtcbiAgICBjb25zdCBjeXBoZXIgPSBuZXcgQ3lwaGVyKHNlY0tleSwgaW5mby5tdWx0aXNpZ1B1YktleSk7XG4gICAgY29uc3QgYWRkcmVzcyA9IGluZm8ubXVsdGlzaWdBZGRyZXNzO1xuICAgIC8v44Oe44Or44OB44K344Kw44Ki44OJ44Os44K544Gu5q6L6auY44KS5Y+W5b6XXG4gICAgY29uc3QgYW1vdW50ID0gdGhpcy5iLm5vd0Ftb3VudChhZGRyZXNzKTtcbiAgICAvL+aui+mrmOOBjOOBguOCjOOBsOODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OCkuWun+ihjFxuICAgIGlmIChhbW91bnQgPiAwKSB7XG4gICAgICBjb25zdCB0cmFuID0gdGhpcy5iLm5ld1RyYW5zYWN0aW9uKFxuICAgICAgICBhZGRyZXNzLFxuICAgICAgICB0aGlzLmIuYWRkcmVzcyxcbiAgICAgICAgYW1vdW50LFxuICAgICAgICB7IHR5cGU6IEVUcmFuc2FjdGlvblR5cGUudHJhbnNhY3Rpb24sIHBheWxvYWQ6IFwidmVyaWZ5bXVsdGlzaWdcIiB9LFxuICAgICAgICBjeXBoZXJcbiAgICAgICk7XG4gICAgICBjb25zb2xlLmxvZyhcInZlcmlmeU11bHRpU2lnIGRvbmVcIiwgdGhpcy5iLmFkZHJlc3MsIHsgdHJhbiB9KTtcbiAgICAgIGV4Y3V0ZUV2ZW50KHRoaXMub25NdWx0aXNpZ1RyYW5Eb25lKTtcbiAgICAgIHJldHVybiB0cmFuO1xuICAgIH1cbiAgfVxufVxuIl19