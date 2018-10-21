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
  } //通信などにより得られた命令に対する処理


  _createClass(Multisig, [{
    key: "responder",
    value: function responder(tran) {
      this.b.addTransaction(tran);
      var data = tran.data;

      try {
        console.log("responder", data.opt);

        switch (data.opt) {
          case type.MAKE:
            {
              //トランザクションからマルチシグの情報を取得
              this.getMultiSigKey(data.shares, data.info);
            }
            break;

          case type.TRAN:
            {
              //イベントの準備
              this.onMultiSigTransaction(data.info);
            }
            break;

          case type.APPROVE:
            {
              this.onApproveMultiSig(data.info);
            }
            break;
        }
      } catch (error) {}
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
        type: type.MULTISIG,
        opt: type.MAKE,
        shares: shares,
        info: info
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
        type: type.MULTISIG,
        opt: type.TRAN,
        amount: amount,
        info: info
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
        this.excuteEvent(this.onMultisigTran, info);
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
          this.excuteEvent(this.onMultisigTranDone);
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
          comment: "verifyMultiSig"
        }, cypher);
        console.log("verifyMultiSig done", {
          tran: tran
        });
        return tran;
      }
    }
  }]);

  return Multisig;
}();

exports.default = Multisig;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL211bHRpc2lnLnRzIl0sIm5hbWVzIjpbIkJ1ZmZlciIsInJlcXVpcmUiLCJhZXMyNTYiLCJzc3MiLCJ0eXBlIiwiTXVsdGlzaWciLCJldiIsInYiLCJjb25zb2xlIiwibG9nIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJibG9ja2NoYWluIiwib25NdWx0aXNpZ1RyYW4iLCJiIiwiYWRkcmVzcyIsInRyYW4iLCJhZGRUcmFuc2FjdGlvbiIsImRhdGEiLCJvcHQiLCJNQUtFIiwiZ2V0TXVsdGlTaWdLZXkiLCJzaGFyZXMiLCJpbmZvIiwiVFJBTiIsIm9uTXVsdGlTaWdUcmFuc2FjdGlvbiIsIkFQUFJPVkUiLCJvbkFwcHJvdmVNdWx0aVNpZyIsImVycm9yIiwiZnJpZW5kc1B1YktleUFlcyIsInZvdGUiLCJhbW91bnQiLCJtYWtlTmV3TXVsdGlTaWdBZGRyZXNzIiwiY3lwaGVyIiwiQ3lwaGVyIiwiYWVzS2V5IiwiTWF0aCIsInJhbmRvbSIsInRvU3RyaW5nIiwiZW5jcnlwdFNlY0tleSIsImVuY3J5cHQiLCJzZWNLZXkiLCJzaGFyZUtleXMiLCJzcGxpdCIsImZyb20iLCJsZW5ndGgiLCJ0aHJlc2hvbGQiLCJwdWJLZXkiLCJhZXMiLCJpIiwiZGVjcnlwdCIsImlkIiwiY3J5cHRvIiwicHVibGljRW5jcnlwdCIsIm15U2hhcmUiLCJtdWx0aVNpZyIsImlzT3duZXIiLCJwdXNoIiwibXVsdGlzaWdQdWJLZXkiLCJtdWx0aXNpZ0FkZHJlc3MiLCJuZXdUcmFuc2FjdGlvbiIsIk1VTFRJU0lHIiwiaW5jbHVkZXMiLCJwcml2YXRlRGVjcnlwdCIsInNoYXJlS2V5UnNhIiwib3duZXJQdWJLZXkiLCJzaGFyZVB1YktleVJzYSIsIm5vd0Ftb3VudCIsImV4Y3V0ZUV2ZW50Iiwic2hhcmVLZXkiLCJ2ZXJpZnlNdWx0aVNpZyIsIm9uTXVsdGlzaWdUcmFuRG9uZSIsInJlY292ZXJlZCIsImNvbWJpbmUiLCJlbmNy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O0FBQUVrQyxRQUFBQSxNQUFNLEVBQU5BO0FBQUYsT0FBWjtBQUNBLFVBQU1SLE1BQU0sR0FBRyxJQUFJQyxlQUFKLENBQVdPLE1BQVgsRUFBbUJsQixJQUFJLENBQUNtQyxjQUF4QixDQUFmO0FBQ0EsVUFBTTNDLE9BQU8sR0FBR1EsSUFBSSxDQUFDb0MsZUFBckIsQ0FacUQsQ0FhckQ7O0FBQ0EsVUFBTTVCLE1BQU0sR0FBRyxLQUFLakIsQ0FBTCxDQUFPcUQsU0FBUCxDQUFpQnBELE9BQWpCLENBQWYsQ0FkcUQsQ0FlckQ7O0FBQ0EsVUFBSWdCLE1BQU0sR0FBRyxDQUFiLEVBQWdCO0FBQ2QsWUFBTWYsSUFBSSxHQUFHLEtBQUtGLENBQUwsQ0FBTzhDLGNBQVAsQ0FDWDdDLE9BRFcsRUFFWCxLQUFLRCxDQUFMLENBQU9DLE9BRkksRUFHWGdCLE1BSFcsRUFJWDtBQUFFNEMsVUFBQUEsT0FBTyxFQUFFO0FBQVgsU0FKVyxFQUtYMUMsTUFMVyxDQUFiO0FBT0EzQixRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxxQkFBWixFQUFtQztBQUFFUyxVQUFBQSxJQUFJLEVBQUpBO0FBQUYsU0FBbkM7QUFDQSxlQUFPQSxJQUFQO0FBQ0Q7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBCbG9ja0NoYWluIGZyb20gXCIuL2Jsb2NrY2hhaW5cIjtcbmltcG9ydCB7IG11bHRpc2lnSW5mbyB9IGZyb20gXCIuL2ludGVyZmFjZVwiO1xuaW1wb3J0IHNoYTI1NiBmcm9tIFwic2hhMjU2XCI7XG5pbXBvcnQgQ3lwaGVyIGZyb20gXCIuL2N5cGhlclwiO1xuaW1wb3J0IGNyeXB0byBmcm9tIFwiY3J5cHRvLWJyb3dzZXJpZnlcIjtcbmltcG9ydCBzaGExIGZyb20gXCJzaGExXCI7XG5jb25zdCBCdWZmZXIgPSByZXF1aXJlKFwiYnVmZmVyL1wiKS5CdWZmZXI7XG52YXIgYWVzMjU2ID0gcmVxdWlyZShcImFlczI1NlwiKTtcbmNvbnN0IHNzcyA9IHJlcXVpcmUoXCJzaGFtaXJzLXNlY3JldC1zaGFyaW5nXCIpO1xuXG5leHBvcnQgZW51bSB0eXBlIHtcbiAgTUFLRSA9IFwibXVsdGlzaWctbWFrZVwiLFxuICBUUkFOID0gXCJtdWx0aXNpZy10cmFuXCIsXG4gIEFQUFJPVkUgPSBcIm11bHRpc2lnLWFwcHJvdmVcIixcbiAgTVVMVElTSUcgPSBcIm11bHRpc2lnXCJcbn1cblxuaW50ZXJmYWNlIG11bHRpc2lnRGF0YSB7XG4gIG15U2hhcmU6IHN0cmluZztcbiAgc2hhcmVzOiBBcnJheTxzdHJpbmc+O1xuICB0aHJlc2hvbGQ6IG51bWJlcjtcbiAgcHViS2V5OiBzdHJpbmc7XG4gIGVuY3J5cHRTZWNLZXk6IHN0cmluZztcbiAgaXNPd25lcj86IGJvb2xlYW47XG59XG5cbi8v44Kw44Ot44O844OQ44Or44Gr572u44GP44GoKOOBk+OBkylzdGF0aWPjgavjgarjgovjgYvjgoJcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTXVsdGlzaWcge1xuICBtdWx0aVNpZzogeyBba2V5OiBzdHJpbmddOiBtdWx0aXNpZ0RhdGEgfSA9IHt9O1xuICBhZGRyZXNzOiBzdHJpbmc7XG4gIGI6IEJsb2NrQ2hhaW47XG4gIHByaXZhdGUgb25NdWx0aXNpZ1RyYW46IHsgW2tleTogc3RyaW5nXTogKHY/OiBhbnkpID0+IHZvaWQgfSA9IHt9O1xuICBwcml2YXRlIG9uTXVsdGlzaWdUcmFuRG9uZTogeyBba2V5OiBzdHJpbmddOiAodj86IGFueSkgPT4gdm9pZCB9ID0ge307XG4gIGV2ZW50cyA9IHtcbiAgICBvbk11bHRpc2lnVHJhbjogdGhpcy5vbk11bHRpc2lnVHJhblxuICB9O1xuICBwcml2YXRlIGV4Y3V0ZUV2ZW50KGV2OiB7IFtrZXk6IHN0cmluZ106ICh2PzogYW55KSA9PiB2b2lkIH0sIHY/OiBhbnkpIHtcbiAgICBjb25zb2xlLmxvZyhcImV4Y3V0ZUV2ZW50XCIsIGV2KTtcbiAgICBPYmplY3Qua2V5cyhldikuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgZXZba2V5XSh2KTtcbiAgICB9KTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGJsb2NrY2hhaW46IEJsb2NrQ2hhaW4pIHtcbiAgICB0aGlzLmIgPSBibG9ja2NoYWluO1xuICAgIGNvbnNvbGUubG9nKFwiYWRkcmVzc1wiLCB0aGlzLmIuYWRkcmVzcyk7XG4gICAgdGhpcy5hZGRyZXNzID0gdGhpcy5iLmFkZHJlc3M7XG4gIH1cblxuICAvL+mAmuS/oeOBquOBqeOBq+OCiOOCiuW+l+OCieOCjOOBn+WRveS7pOOBq+WvvuOBmeOCi+WHpueQhlxuICByZXNwb25kZXIodHJhbjogYW55KSB7XG4gICAgdGhpcy5iLmFkZFRyYW5zYWN0aW9uKHRyYW4pO1xuICAgIGNvbnN0IGRhdGEgPSB0cmFuLmRhdGE7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnNvbGUubG9nKFwicmVzcG9uZGVyXCIsIGRhdGEub3B0KTtcbiAgICAgIHN3aXRjaCAoZGF0YS5vcHQpIHtcbiAgICAgICAgY2FzZSB0eXBlLk1BS0U6XG4gICAgICAgICAge1xuICAgICAgICAgICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgYvjgonjg57jg6vjg4HjgrfjgrDjga7mg4XloLHjgpLlj5blvpdcbiAgICAgICAgICAgIHRoaXMuZ2V0TXVsdGlTaWdLZXkoZGF0YS5zaGFyZXMsIGRhdGEuaW5mbyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIHR5cGUuVFJBTjpcbiAgICAgICAgICB7XG4gICAgICAgICAgICAvL+OCpOODmeODs+ODiOOBrua6luWCmVxuICAgICAgICAgICAgdGhpcy5vbk11bHRpU2lnVHJhbnNhY3Rpb24oZGF0YS5pbmZvKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHlwZS5BUFBST1ZFOlxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMub25BcHByb3ZlTXVsdGlTaWcoZGF0YS5pbmZvKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHt9XG4gIH1cblxuICAvL+ODnuODq+ODgeOCt+OCsOOBruOCouODieODrOOCueOCkueUn+aIkFxuICBtYWtlTmV3TXVsdGlTaWdBZGRyZXNzKFxuICAgIGZyaWVuZHNQdWJLZXlBZXM6IEFycmF5PHN0cmluZz4sIC8v5YWx5pyJ6ICF44Gu5oOF5aCxXG4gICAgdm90ZTogbnVtYmVyLCAvL+OBl+OBjeOBhOWApFxuICAgIGFtb3VudDogbnVtYmVyIC8v6YeR6aGNXG4gICkge1xuICAgIGNvbnNvbGUubG9nKHRoaXMubWFrZU5ld011bHRpU2lnQWRkcmVzcyk7XG4gICAgLy/np5jlr4bpjbXjgajlhazplovpjbXjgpLnlJ/miJBcbiAgICBjb25zdCBjeXBoZXIgPSBuZXcgQ3lwaGVyKCk7XG5cbiAgICAvL+asoeOBq+S9v+OBhmFlc2tleeOCkueUn+aIkFxuICAgIGNvbnN0IGFlc0tleSA9IHNoYTEoTWF0aC5yYW5kb20oKS50b1N0cmluZygpKS50b1N0cmluZygpO1xuICAgIGNvbnNvbGUubG9nKHsgYWVzS2V5IH0pO1xuXG4gICAgLy9hZXNrZXnjgafnp5jlr4bpjbXjgpLmmpflj7fljJZcbiAgICBjb25zdCBlbmNyeXB0U2VjS2V5OiBzdHJpbmcgPSBhZXMyNTYuZW5jcnlwdChhZXNLZXksIGN5cGhlci5zZWNLZXkpO1xuXG4gICAgLy/jgrfjg6Pjg5/jgqLjga7np5jlr4bliIbmlaPjg6njgqTjg5bjg6njg6rjgadhZXNrZXnjgpLjgrfjgqfjgqLljJZcbiAgICBjb25zdCBzaGFyZUtleXM6IEFycmF5PGFueT4gPSBzc3Muc3BsaXQoQnVmZmVyLmZyb20oYWVzS2V5KSwge1xuICAgICAgc2hhcmVzOiBmcmllbmRzUHViS2V5QWVzLmxlbmd0aCArIDEsXG4gICAgICB0aHJlc2hvbGQ6IHZvdGVcbiAgICB9KTtcblxuICAgIGNvbnNvbGUubG9nKHsgc2hhcmVLZXlzIH0pO1xuXG4gICAgLy/jg57jg6vjg4HjgrfjgrDjgqLjg4njg6zjgrnjgpLlsI7lh7pcbiAgICBjb25zdCBhZGRyZXNzID0gc2hhMjU2KGN5cGhlci5wdWJLZXkpO1xuICAgIGNvbnN0IHNoYXJlczogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSA9IHt9O1xuXG4gICAgLy/jgrfjgqfjgqLjga7lhbHmnInogIXjgavjgrfjgqfjgqLjgpLphY3luINcbiAgICBmcmllbmRzUHViS2V5QWVzLmZvckVhY2goKGFlcywgaSkgPT4ge1xuICAgICAgY29uc3QgcHViS2V5ID0gYWVzMjU2LmRlY3J5cHQoXCJmb3JtYXRcIiwgYWVzKTtcbiAgICAgIGNvbnN0IGlkID0gc2hhMjU2KHB1YktleSk7XG4gICAgICBjb25zb2xlLmxvZyhcIm1ha2VOZXdNdWx0aVNpZ0FkZHJlc3Mgc2hhcmVrZXlcIiwgc2hhcmVLZXlzW2ldKTtcbiAgICAgIC8v5YWx5pyJ6ICF44Gu5YWs6ZaL6Y2144Gn44K344Kn44Ki44KS5pqX5Y+35YyWXG4gICAgICBzaGFyZXNbaWRdID0gY3J5cHRvXG4gICAgICAgIC5wdWJsaWNFbmNyeXB0KHB1YktleSwgQnVmZmVyLmZyb20oc2hhcmVLZXlzW2ldKSlcbiAgICAgICAgLnRvU3RyaW5nKFwiYmFzZTY0XCIpO1xuICAgIH0pO1xuICAgIGNvbnNvbGUubG9nKHsgc2hhcmVzIH0pO1xuXG4gICAgLy/oh6rouqvjgavjgrfjgqfjgqLjgpLkuIDjgaTlibLlvZNcbiAgICBjb25zdCBteVNoYXJlID0gc2hhcmVLZXlzW3NoYXJlS2V5cy5sZW5ndGggLSAxXTtcblxuICAgIC8v44Oe44Or44OB44K344Kw44Gu5oOF5aCx44KS5L+d566hXG4gICAgdGhpcy5tdWx0aVNpZ1thZGRyZXNzXSA9IHtcbiAgICAgIG15U2hhcmUsXG4gICAgICB0aHJlc2hvbGQ6IHZvdGUsXG4gICAgICBpc093bmVyOiBmYWxzZSxcbiAgICAgIHB1YktleTogY3lwaGVyLnB1YktleSxcbiAgICAgIGVuY3J5cHRTZWNLZXksXG4gICAgICBzaGFyZXM6IFtdXG4gICAgfTtcbiAgICB0aGlzLm11bHRpU2lnW2FkZHJlc3NdLnNoYXJlcy5wdXNoKG15U2hhcmUpO1xuXG4gICAgLy/jg5bjg63jg4Pjgq/jg4Hjgqfjg7zjg7PjgavovInjgZvjgovjg57jg6vjg4HjgrfjgrDmg4XloLFcbiAgICBjb25zdCBpbmZvOiBtdWx0aXNpZ0luZm8gPSB7XG4gICAgICBtdWx0aXNpZ1B1YktleTogY3lwaGVyLnB1YktleSxcbiAgICAgIG11bHRpc2lnQWRkcmVzczogYWRkcmVzcyxcbiAgICAgIGVuY3J5cHRTZWNLZXksXG4gICAgICB0aHJlc2hvbGQ6IHZvdGVcbiAgICB9O1xuXG4gICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgpLnlJ/miJBcbiAgICBjb25zdCB0cmFuID0gdGhpcy5iLm5ld1RyYW5zYWN0aW9uKHRoaXMuYi5hZGRyZXNzLCBhZGRyZXNzLCBhbW91bnQsIHtcbiAgICAgIHR5cGU6IHR5cGUuTVVMVElTSUcsXG4gICAgICBvcHQ6IHR5cGUuTUFLRSxcbiAgICAgIHNoYXJlcyxcbiAgICAgIGluZm9cbiAgICB9KTtcbiAgICBjb25zb2xlLmxvZyhcIm1ha2VOZXdNdWx0aVNpZ0FkZHJlc3MgZG9uZVwiLCB7IHRyYW4gfSk7XG4gICAgcmV0dXJuIHRyYW47XG4gIH1cblxuICAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OBi+OCieODnuODq+ODgeOCt+OCsOOBruaDheWgseOCkuWPluW+l1xuICBwcml2YXRlIGdldE11bHRpU2lnS2V5KFxuICAgIHNoYXJlczogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSxcbiAgICBpbmZvOiBtdWx0aXNpZ0luZm9cbiAgKSB7XG4gICAgY29uc29sZS5sb2coXCJnZXRNdWx0aVNpZ0tleVwiKTtcbiAgICBpZiAoaW5mby5lbmNyeXB0U2VjS2V5ICYmIE9iamVjdC5rZXlzKHNoYXJlcykuaW5jbHVkZXModGhpcy5hZGRyZXNzKSkge1xuICAgICAgY29uc29sZS5sb2coXCJnZXRNdWx0aVNpZ0tleSBzdGFydFwiKTtcblxuICAgICAgLy/jgrfjgqfjgqLjgq3jg7zjga7lhazplovpjbXmmpflj7fjgpLnp5jlr4bpjbXjgafop6PpmaRcbiAgICAgIGNvbnN0IGtleSA9IGNyeXB0by5wcml2YXRlRGVjcnlwdChcbiAgICAgICAgdGhpcy5iLmN5cGhlci5zZWNLZXksXG4gICAgICAgIEJ1ZmZlci5mcm9tKHNoYXJlc1t0aGlzLmFkZHJlc3NdLCBcImJhc2U2NFwiKVxuICAgICAgKTtcblxuICAgICAgY29uc29sZS5sb2coXCJnZXRNdWx0aVNpZ0tleSBnZXQgbXkga2V5XCIsIGtleSk7XG5cbiAgICAgIC8v44Oe44Or44OB44K344Kw5oOF5aCx44KS5L+d5a2YXG4gICAgICB0aGlzLm11bHRpU2lnW2luZm8ubXVsdGlzaWdBZGRyZXNzXSA9IHtcbiAgICAgICAgbXlTaGFyZToga2V5LnRvU3RyaW5nKFwiYmFzZTY0XCIpLFxuICAgICAgICBpc093bmVyOiBmYWxzZSxcbiAgICAgICAgdGhyZXNob2xkOiBpbmZvLnRocmVzaG9sZCxcbiAgICAgICAgcHViS2V5OiBpbmZvLm11bHRpc2lnUHViS2V5LFxuICAgICAgICBlbmNyeXB0U2VjS2V5OiBpbmZvLmVuY3J5cHRTZWNLZXksXG4gICAgICAgIHNoYXJlczogW11cbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgLy/jg57jg6vjg4HjgrfjgrDjga7jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgpLnlJ/miJBcbiAgbWFrZU11bHRpU2lnVHJhbnNhY3Rpb24obXVsdGlzaWdBZGRyZXNzOiBzdHJpbmcpIHtcbiAgICBjb25zb2xlLmxvZyhcIm1ha2VNdWx0aVNpZ1RyYW5zYWN0aW9uIHN0YXJ0XCIpO1xuXG4gICAgLy/jg57jg6vjg4HjgrfjgrDjgqLjg4njg6zjgrnjga7mg4XloLHjgpLoh6rliIbjgYzmjIHjgaPjgabjgYTjgovjga7jgYtcbiAgICBjb25zdCBkYXRhID0gdGhpcy5tdWx0aVNpZ1ttdWx0aXNpZ0FkZHJlc3NdO1xuICAgIGlmICghZGF0YSkgcmV0dXJuO1xuICAgIGNvbnN0IG11bHRpc2lnUHViS2V5ID0gZGF0YS5wdWJLZXk7XG5cbiAgICAvL+iHquWIhuOBruaMgeOBo+OBpuOBhOOCi+OCt+OCp+OCouOCreODvOOCkuWFrOmWi+mNteOBp+aal+WPt+WMllxuICAgIGNvbnN0IHNoYXJlS2V5UnNhID0gY3J5cHRvXG4gICAgICAucHVibGljRW5jcnlwdCh0aGlzLmIuY3lwaGVyLnB1YktleSwgQnVmZmVyLmZyb20oZGF0YS5teVNoYXJlLCBcImJhc2U2NFwiKSlcbiAgICAgIC50b1N0cmluZyhcImJhc2U2NFwiKTtcblxuICAgIC8v44OW44Ot44OD44Kv44OB44Kn44O844Oz44Gr6LyJ44Gb44KL5oOF5aCxXG4gICAgY29uc3QgaW5mbzogbXVsdGlzaWdJbmZvID0ge1xuICAgICAgb3duZXJQdWJLZXk6IHRoaXMuYi5jeXBoZXIucHViS2V5LFxuICAgICAgbXVsdGlzaWdQdWJLZXksXG4gICAgICBtdWx0aXNpZ0FkZHJlc3MsXG4gICAgICBzaGFyZVB1YktleVJzYTogc2hhcmVLZXlSc2EsXG4gICAgICB0aHJlc2hvbGQ6IGRhdGEudGhyZXNob2xkXG4gICAgfTtcbiAgICAvL+ODnuODq+ODgeOCt+OCsOaDheWgseOBq+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+Wun+ihjOiAheODleODqeOCsOOCkueri+OBpuOCi1xuICAgIGRhdGEuaXNPd25lciA9IHRydWU7XG5cbiAgICAvL+ODnuODq+ODgeOCt+OCsOOCouODieODrOOCueOBruaui+mrmOOCkuWPluW+l1xuICAgIGNvbnN0IGFtb3VudCA9IHRoaXMuYi5ub3dBbW91bnQobXVsdGlzaWdBZGRyZXNzKTtcbiAgICBjb25zb2xlLmxvZyhcIm11bHRpc2lnIHRyYW5cIiwgeyBhbW91bnQgfSk7XG5cbiAgICAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OCkueUn+aIkFxuICAgIGNvbnN0IHRyYW4gPSB0aGlzLmIubmV3VHJhbnNhY3Rpb24odGhpcy5iLmFkZHJlc3MsIG11bHRpc2lnQWRkcmVzcywgMCwge1xuICAgICAgdHlwZTogdHlwZS5NVUxUSVNJRyxcbiAgICAgIG9wdDogdHlwZS5UUkFOLFxuICAgICAgYW1vdW50LFxuICAgICAgaW5mb1xuICAgIH0pO1xuICAgIGNvbnNvbGUubG9nKFwibWFrZU11bHRpU2lnVHJhbnNhY3Rpb24gZG9uZVwiLCB7IHRyYW4gfSk7XG4gICAgcmV0dXJuIHRyYW47XG4gIH1cblxuICAvL+OCpOODmeODs+ODiOOCs+ODvOODq+ODkOODg+OCr+OBq+S7u+OBm+OCi1xuICBwcml2YXRlIG9uTXVsdGlTaWdUcmFuc2FjdGlvbihpbmZvOiBtdWx0aXNpZ0luZm8pIHtcbiAgICBpZiAoT2JqZWN0LmtleXModGhpcy5tdWx0aVNpZykuaW5jbHVkZXMoaW5mby5tdWx0aXNpZ0FkZHJlc3MpKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIm9uTXVsdGlzaWdUcmFuXCIpO1xuICAgICAgdGhpcy5leGN1dGVFdmVudCh0aGlzLm9uTXVsdGlzaWdUcmFuLCBpbmZvKTtcbiAgICB9XG4gIH1cblxuICAvL+ODnuODq+ODgeOCt+OCsOOBruaJv+iqjVxuICBhcHByb3ZlTXVsdGlTaWcoaW5mbzogbXVsdGlzaWdJbmZvKSB7XG4gICAgY29uc29sZS5sb2coXCJhcHByb3ZlTXVsdGlTaWdcIik7XG4gICAgaWYgKGluZm8ub3duZXJQdWJLZXkpIHtcbiAgICAgIC8v44Oe44Or44OB44K344Kw44Gu5oOF5aCx44GM44GC44KL44GL44KS6Kq/44G544KLXG4gICAgICBpZiAoT2JqZWN0LmtleXModGhpcy5tdWx0aVNpZykuaW5jbHVkZXMoaW5mby5tdWx0aXNpZ0FkZHJlc3MpKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiYXBwcm92ZU11bHRpU2lnIHN0YXJ0XCIpO1xuXG4gICAgICAgIC8v44K344Kn44Ki44Kt44O844KS5Y+W44KK5Ye644GZXG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMubXVsdGlTaWdbaW5mby5tdWx0aXNpZ0FkZHJlc3NdLm15U2hhcmU7XG4gICAgICAgIC8v44K344Kn44Ki44Kt44O844KS44Oe44Or44OB44K344Kw44OI44Op44Oz44K244Kv44K344On44Oz5a6f6KGM6ICF44Gu5YWs6ZaL6Y2144Gn5pqX5Y+35YyWXG4gICAgICAgIGNvbnN0IHNoYXJlS2V5UnNhID0gY3J5cHRvXG4gICAgICAgICAgLnB1YmxpY0VuY3J5cHQoaW5mby5vd25lclB1YktleSwgQnVmZmVyLmZyb20oa2V5LCBcImJhc2U2NFwiKSlcbiAgICAgICAgICAudG9TdHJpbmcoXCJiYXNlNjRcIik7XG4gICAgICAgIGluZm8uc2hhcmVQdWJLZXlSc2EgPSBzaGFyZUtleVJzYTtcbiAgICAgICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgpLnlJ/miJBcbiAgICAgICAgY29uc3QgdHJhbiA9IHRoaXMuYi5uZXdUcmFuc2FjdGlvbihcbiAgICAgICAgICB0aGlzLmIuYWRkcmVzcyxcbiAgICAgICAgICBpbmZvLm11bHRpc2lnQWRkcmVzcyxcbiAgICAgICAgICAwLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHR5cGU6IHR5cGUuTVVMVElTSUcsXG4gICAgICAgICAgICBvcHQ6IHR5cGUuQVBQUk9WRSxcbiAgICAgICAgICAgIGluZm86IGluZm9cbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiYXBwcm92ZU11bHRpU2lnIGRvbmVcIiwgeyB0cmFuIH0pO1xuICAgICAgICByZXR1cm4gdHJhbjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvL+ODnuODq+ODgeOCt+OCsOODiOODqeODs+OCtuOCr+OCt+ODp+ODs+Wun+ihjOiAheOBrumWouaVsFxuICBwcml2YXRlIG9uQXBwcm92ZU11bHRpU2lnKGluZm86IG11bHRpc2lnSW5mbykge1xuICAgIGlmIChcbiAgICAgIGluZm8uc2hhcmVQdWJLZXlSc2EgJiZcbiAgICAgIGluZm8ub3duZXJQdWJLZXkgPT09IHRoaXMuYi5jeXBoZXIucHViS2V5ICYmXG4gICAgICBPYmplY3Qua2V5cyh0aGlzLm11bHRpU2lnKS5pbmNsdWRlcyhpbmZvLm11bHRpc2lnQWRkcmVzcylcbiAgICApIHtcbiAgICAgIGNvbnNvbGUubG9nKFwidHlwZS5BUFBST1ZFXCIpO1xuICAgICAgY29uc3Qgc2hhcmVzID0gdGhpcy5tdWx0aVNpZ1tpbmZvLm11bHRpc2lnQWRkcmVzc10uc2hhcmVzO1xuICAgICAgXG4gICAgICAvL+OCt+OCp+OCouOCreODvOOBruWFrOmWi+mNteaal+WPt+OCkuiHqui6q+OBruenmOWvhumNteOBp+ino+mZpFxuICAgICAgY29uc3Qgc2hhcmVLZXkgPSBjcnlwdG8ucHJpdmF0ZURlY3J5cHQoXG4gICAgICAgIHRoaXMuYi5jeXBoZXIuc2VjS2V5LFxuICAgICAgICBCdWZmZXIuZnJvbShpbmZvLnNoYXJlUHViS2V5UnNhLCBcImJhc2U2NFwiKVxuICAgICAgKTtcblxuICAgICAgLy/mlrDjgZfjgYTjgrfjgqfjgqLjgq3jg7zjgarjgonkv53lrZjjgZnjgovjgIJcbiAgICAgIGlmICghc2hhcmVzLmluY2x1ZGVzKHNoYXJlS2V5KSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcImFkZCBzaGFyZWtleVwiLCB7IHNoYXJlS2V5IH0pO1xuICAgICAgICBzaGFyZXMucHVzaChzaGFyZUtleSk7XG4gICAgICB9XG5cbiAgICAgIC8v44K344Kn44Ki44Kt44O844Gu5pWw44GM44GX44GN44GE5YCk44KS6LaF44GI44KM44Gw44OI44Op44Oz44K244Kv44K344On44Oz44KS5om/6KqNXG4gICAgICBpZiAoc2hhcmVzLmxlbmd0aCA+PSBpbmZvLnRocmVzaG9sZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInZlcmlmeSBtdWx0aXNpZ1wiLCB7IHNoYXJlcyB9KTtcbiAgICAgICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7Pjga7mib/oqo3plqLmlbBcbiAgICAgICAgdGhpcy52ZXJpZnlNdWx0aVNpZyhpbmZvLCBzaGFyZXMpO1xuICAgICAgICB0aGlzLmV4Y3V0ZUV2ZW50KHRoaXMub25NdWx0aXNpZ1RyYW5Eb25lKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OBruaJv+iqjVxuICB2ZXJpZnlNdWx0aVNpZyhpbmZvOiBtdWx0aXNpZ0luZm8sIHNoYXJlczogQXJyYXk8YW55Pikge1xuICAgIGNvbnNvbGUubG9nKFwidmVyaWZ5TXVsdGlTaWcgc3RhcnRcIiwgeyBzaGFyZXMgfSk7XG4gICAgLy/jgrfjg6Pjg5/jgqLjga7jgrfjgqfjgqLjgq3jg7zjgYvjgonjgrfjg7zjgq/jg6zjg4Pjg4jjgpLlvqnlj7fljJZcbiAgICBjb25zdCByZWNvdmVyZWQgPSBzc3MuY29tYmluZShzaGFyZXMpLnRvU3RyaW5nKCk7XG4gICAgY29uc29sZS5sb2coeyByZWNvdmVyZWQgfSk7XG5cbiAgICAvL2Flc+aal+WPt+WMluOBleOCjOOBn+OCt+ODvOOCr+ODrOODg+ODiOOCreODvOOCkuWPluOCiuWHuuOBmeOAglxuICAgIGNvbnN0IGVuY3J5cHRlZEtleSA9IHRoaXMubXVsdGlTaWdbaW5mby5tdWx0aXNpZ0FkZHJlc3NdLmVuY3J5cHRTZWNLZXk7XG4gICAgLy9hZXPmmpflj7fjgpLlvqnlj7fljJZcbiAgICBjb25zdCBzZWNLZXkgPSBhZXMyNTYuZGVjcnlwdChyZWNvdmVyZWQsIGVuY3J5cHRlZEtleSk7XG4gICAgY29uc29sZS5sb2coeyBzZWNLZXkgfSk7XG4gICAgY29uc3QgY3lwaGVyID0gbmV3IEN5cGhlcihzZWNLZXksIGluZm8ubXVsdGlzaWdQdWJLZXkpO1xuICAgIGNvbnN0IGFkZHJlc3MgPSBpbmZvLm11bHRpc2lnQWRkcmVzcztcbiAgICAvL+ODnuODq+ODgeOCt+OCsOOCouODieODrOOCueOBruaui+mrmOOCkuWPluW+l1xuICAgIGNvbnN0IGFtb3VudCA9IHRoaXMuYi5ub3dBbW91bnQoYWRkcmVzcyk7XG4gICAgLy/mrovpq5jjgYzjgYLjgozjgbDjg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgpLlrp/ooYxcbiAgICBpZiAoYW1vdW50ID4gMCkge1xuICAgICAgY29uc3QgdHJhbiA9IHRoaXMuYi5uZXdUcmFuc2FjdGlvbihcbiAgICAgICAgYWRkcmVzcyxcbiAgICAgICAgdGhpcy5iLmFkZHJlc3MsXG4gICAgICAgIGFtb3VudCxcbiAgICAgICAgeyBjb21tZW50OiBcInZlcmlmeU11bHRpU2lnXCIgfSxcbiAgICAgICAgY3lwaGVyXG4gICAgICApO1xuICAgICAgY29uc29sZS5sb2coXCJ2ZXJpZnlNdWx0aVNpZyBkb25lXCIsIHsgdHJhbiB9KTtcbiAgICAgIHJldHVybiB0cmFuO1xuICAgIH1cbiAgfVxufVxuIl19