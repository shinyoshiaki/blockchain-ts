"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.type = void 0;

var _interface = require("./interface");

var _sha = _interopRequireDefault(require("sha256"));

var _cypher = _interopRequireDefault(require("./crypto/cypher"));

var _util = require("../util");

var _buffer = require("./crypto/buffer");

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
    this.address = this.b.address;
  } //通信などにより得られた命令に対する処理


  _createClass(Multisig, [{
    key: "responder",
    value: function responder(tran) {
      var data = tran.data;

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
    friendsPubkeyRsaPass, vote, //しきい値
    amount //金額
    ) {
      var cypher = new _cypher.default(); //シャミアの秘密分散ライブラリでaeskeyをシェア化

      var shareKeys = sss.split(Buffer.from(cypher.phrase), {
        shares: friendsPubKeyAes.length + 1,
        threshold: vote
      }); //マルチシグアドレスを導出

      var address = (0, _sha.default)(cypher.pubKey);
      var shares = {}; //シェアの共有者にシェアを配布

      friendsPubKeyAes.forEach(function (aes, i) {
        var pubKey = aes256.decrypt(friendsPubkeyRsaPass, aes);
        var id = (0, _sha.default)(pubKey); //共有者の公開鍵でシェアを暗号化

        shares[id] = cypher.encrypt((0, _buffer.bufferToHex)(shareKeys[i]), pubKey);
      }); //自身にシェアを一つ割当

      var myShare = (0, _buffer.bufferToHex)(shareKeys[shareKeys.length - 1]); //マルチシグの情報を保管

      this.multiSig[address] = {
        myShare: myShare,
        threshold: vote,
        isOwner: false,
        pubKey: cypher.pubKey,
        shares: []
      };
      this.multiSig[address].shares.push(myShare); //ブロックチェーンに載せるマルチシグ情報

      var info = {
        multisigPubKey: cypher.pubKey,
        multisigAddress: address,
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
      return tran;
    } //トランザクションからマルチシグの情報を取得

  }, {
    key: "getMultiSigKey",
    value: function getMultiSigKey(shares, info) {
      if (Object.keys(shares).includes(this.address)) {
        //シェアキーの公開鍵暗号を秘密鍵で解除
        var _key = this.b.cypher.decrypt(shares[this.address]); //マルチシグ情報を保存


        this.multiSig[info.multisigAddress] = {
          myShare: _key,
          isOwner: false,
          threshold: info.threshold,
          pubKey: info.multisigPubKey,
          shares: []
        };
      }
    } //マルチシグのトランザクションを生成

  }, {
    key: "makeMultiSigTransaction",
    value: function makeMultiSigTransaction(multisigAddress) {
      //マルチシグアドレスの情報を自分が持っているのか
      var data = this.multiSig[multisigAddress];
      if (!data) return;
      var multisigPubKey = data.pubKey; //自分の持っているシェアキーを暗号化

      var shareKeyRsa = this.b.cypher.encrypt(data.myShare, this.b.cypher.pubKey); //ブロックチェーンに載せる情報

      var info = {
        ownerPubKey: this.b.cypher.pubKey,
        multisigPubKey: multisigPubKey,
        multisigAddress: multisigAddress,
        sharePubKeyRsa: shareKeyRsa,
        threshold: data.threshold
      }; //マルチシグ情報にトランザクション実行者フラグを立てる

      data.isOwner = true; //マルチシグアドレスの残高を取得

      var amount = this.b.nowAmount(multisigAddress); //トランザクションを生成

      var tran = this.b.newTransaction(this.b.address, multisigAddress, 0, {
        type: _interface.ETransactionType.multisig,
        payload: {
          opt: type.TRAN,
          amount: amount,
          info: info
        }
      });
      return tran;
    } //イベントコールバックに任せる

  }, {
    key: "onMultiSigTransaction",
    value: function onMultiSigTransaction(info) {
      if (Object.keys(this.multiSig).includes(info.multisigAddress)) {
        //承認するかどうかを決めたいので、イベントを一回挟んでいる。
        (0, _util.excuteEvent)(this.onMultisigTran, info);
      }
    } //マルチシグの承認

  }, {
    key: "approveMultiSig",
    value: function approveMultiSig(info) {
      if (info.ownerPubKey) {
        //マルチシグの情報があるかを調べる
        if (Object.keys(this.multiSig).includes(info.multisigAddress)) {
          //シェアキーを取り出す
          var _key2 = this.multiSig[info.multisigAddress].myShare;
          var shareKeyRsa = this.b.cypher.encrypt(_key2, info.ownerPubKey);
          info.sharePubKeyRsa = shareKeyRsa; //トランザクションを生成

          var tran = this.b.newTransaction(this.b.address, info.multisigAddress, 0, {
            type: _interface.ETransactionType.multisig,
            payload: {
              opt: type.APPROVE,
              info: info
            }
          });
          return tran;
        }
      }
    } //マルチシグトランザクション実行者の関数

  }, {
    key: "onApproveMultiSig",
    value: function onApproveMultiSig(info) {
      if (info.sharePubKeyRsa && info.ownerPubKey === this.b.cypher.pubKey && Object.keys(this.multiSig).includes(info.multisigAddress)) {
        var _shares2 = this.multiSig[info.multisigAddress].shares;
        var shareKey = this.b.cypher.decrypt(info.sharePubKeyRsa); //新しいシェアキーなら保存する。

        if (!_shares2.includes(shareKey)) {
          _shares2.push(shareKey);
        } //シェアキーの数がしきい値を超えればトランザクションを承認


        if (_shares2.length >= info.threshold) {
          //トランザクションの承認関数
          this.verifyMultiSig(info, _shares2);
        }
      }
    } //トランザクションの承認

  }, {
    key: "verifyMultiSig",
    value: function verifyMultiSig(info, _shares) {
      //シャミアのシェアキーからシークレットを復号化
      var shares = _shares.map(function (share) {
        return (0, _buffer.hexToBuffer)(share);
      });

      var phrase = sss.combine(shares).toString();
      var cypher = new _cypher.default(phrase);
      var address = info.multisigAddress; //マルチシグアドレスの残高を取得

      var amount = this.b.nowAmount(address); //残高があればトランザクションを実行

      if (amount > 0) {
        var tran = this.b.newTransaction(address, this.b.address, amount, {
          type: _interface.ETransactionType.transaction,
          payload: "verifymultisig"
        }, cypher);
        (0, _util.excuteEvent)(this.onMultisigTranDone);
        return tran;
      }
    }
  }]);

  return Multisig;
}();

exports.default = Multisig;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL211bHRpc2lnLnRzIl0sIm5hbWVzIjpbIkJ1ZmZlciIsInJlcXVpcmUiLCJhZXMyNTYiLCJzc3MiLCJ0eXBlIiwiTXVsdGlzaWciLCJibG9ja2NoYWluIiwib25NdWx0aXNpZ1RyYW4iLCJvbk11bHRpc2lnVHJhbkRvbmUiLCJiIiwiYWRkcmVzcyIsInRyYW4iLCJkYXRhIiwiRVRyYW5zYWN0aW9uVHlwZSIsIm11bHRpc2lnIiwidHJhbk11bHRpc2lnIiwicGF5bG9hZCIsIm9wdCIsIk1BS0UiLCJnZXRNdWx0aVNpZ0tleSIsInNoYXJlcyIsImluZm8iLCJUUkFOIiwib25NdWx0aVNpZ1RyYW5zYWN0aW9uIiwiQVBQUk9WRSIsIm9uQXBwcm92ZU11bHRpU2lnIiwiZnJpZW5kc1B1YktleUFlcyIsImZyaWVuZHNQdWJrZXlSc2FQYXNzIiwidm90ZSIsImFtb3VudCIsImN5cGhlciIsIkN5cGhlciIsInNoYXJlS2V5cyIsInNwbGl0IiwiZnJvbSIsInBocmFzZSIsImxlbmd0aCIsInRocmVzaG9sZCIsInB1YktleSIsImZvckVhY2giLCJhZXMiLCJpIiwiZGVjcnlwdCIsImlkIiwiZW5jcnlwdCIsIm15U2hhcmUiLCJtdWx0aVNpZyIsImlzT3duZXIiLCJwdXNoIiwibXVsdGlzaWdQdWJLZXkiLCJtdWx0aXNpZ0FkZHJlc3MiLCJuZXdUcmFuc2FjdGlvbiIsIk9iamVjdCIsImtleXMiLCJpbmNsdWRlcyIsImtleSIsInNoYXJlS2V5UnNhIiwib3duZXJQdWJLZXkiLCJzaGFyZVB1YktleVJzYSIsIm5vd0Ftb3VudCIsInNoYXJlS2V5IiwidmVyaWZ5TXVsdGlTaWciLCJfc2hhcmVzIiwibWFwIiwic2hhcmUiLCJjb21iaW5lIiwidG9TdHJpbmciLCJ0cmFuc2FjdGlvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNBOztBQUNBOztBQUNBOztBQUdBOztBQUNBOzs7Ozs7Ozs7Ozs7QUFDQSxJQUFNQSxNQUFNLEdBQUdDLE9B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Q2dCLFNBQTFCLEVBQXFDO0FBQ25DO0FBQ0EsZUFBS3dCLGNBQUwsQ0FBb0J4QyxJQUFwQixFQUEwQkQsUUFBMUI7QUFDRDtBQUNGO0FBQ0YsSyxDQUVEOzs7O21DQUN1QkMsSSxFQUFvQnlDLE8sRUFBcUI7QUFDOUQ7QUFDQSxVQUFNMUMsTUFBTSxHQUFHMEMsT0FBTyxDQUFDQyxHQUFSLENBQVksVUFBQUMsS0FBSztBQUFBLGVBQUkseUJBQVlBLEtBQVosQ0FBSjtBQUFBLE9BQWpCLENBQWY7O0FBQ0EsVUFBTTdCLE1BQU0sR0FBR2hDLEdBQUcsQ0FBQzhELE9BQUosQ0FBWTdDLE1BQVosRUFBb0I4QyxRQUFwQixFQUFmO0FBQ0EsVUFBTXBDLE1BQU0sR0FBRyxJQUFJQyxlQUFKLENBQVdJLE1BQVgsQ0FBZjtBQUNBLFVBQU16QixPQUFPLEdBQUdXLElBQUksQ0FBQzZCLGVBQXJCLENBTDhELENBTTlEOztBQUNBLFVBQU1yQixNQUFNLEdBQUcsS0FBS3BCLENBQUwsQ0FBT2tELFNBQVAsQ0FBaUJqRCxPQUFqQixDQUFmLENBUDhELENBUTlEOztBQUNBLFVBQUltQixNQUFNLEdBQUcsQ0FBYixFQUFnQjtBQUNkLFlBQU1sQixJQUFJLEdBQUcsS0FBS0YsQ0FBTCxDQUFPMEMsY0FBUCxDQUNYekMsT0FEVyxFQUVYLEtBQUtELENBQUwsQ0FBT0MsT0FGSSxFQUdYbUIsTUFIVyxFQUlYO0FBQUV6QixVQUFBQSxJQUFJLEVBQUVTLDRCQUFpQnNELFdBQXpCO0FBQXNDbkQsVUFBQUEsT0FBTyxFQUFFO0FBQS9DLFNBSlcsRUFLWGMsTUFMVyxDQUFiO0FBT0EsK0JBQVksS0FBS3RCLGtCQUFqQjtBQUNBLGVBQU9HLElBQVA7QUFDRDtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSVRyYW5zYWN0aW9uIH0gZnJvbSBcIi4vYmxvY2tjaGFpblwiO1xuaW1wb3J0IHsgbXVsdGlzaWdJbmZvLCBFVHJhbnNhY3Rpb25UeXBlIH0gZnJvbSBcIi4vaW50ZXJmYWNlXCI7XG5pbXBvcnQgc2hhMjU2IGZyb20gXCJzaGEyNTZcIjtcbmltcG9ydCBDeXBoZXIgZnJvbSBcIi4vY3J5cHRvL2N5cGhlclwiO1xuXG5pbXBvcnQgQmxvY2tDaGFpbkFwcCBmcm9tIFwiLi9ibG9ja2NoYWluQXBwXCI7XG5pbXBvcnQgeyBJRXZlbnRzLCBleGN1dGVFdmVudCB9IGZyb20gXCIuLi91dGlsXCI7XG5pbXBvcnQgeyBidWZmZXJUb0hleCwgaGV4VG9CdWZmZXIgfSBmcm9tIFwiLi9jcnlwdG8vYnVmZmVyXCI7XG5jb25zdCBCdWZmZXIgPSByZXF1aXJlKFwiYnVmZmVyL1wiKS5CdWZmZXI7XG52YXIgYWVzMjU2ID0gcmVxdWlyZShcImFlczI1NlwiKTtcbmNvbnN0IHNzcyA9IHJlcXVpcmUoXCJzaGFtaXJzLXNlY3JldC1zaGFyaW5nXCIpO1xuXG5leHBvcnQgZW51bSB0eXBlIHtcbiAgTUFLRSA9IFwibXVsdGlzaWctbWFrZVwiLFxuICBUUkFOID0gXCJtdWx0aXNpZy10cmFuXCIsXG4gIEFQUFJPVkUgPSBcIm11bHRpc2lnLWFwcHJvdmVcIixcbiAgTVVMVElTSUcgPSBcIm11bHRpc2lnXCJcbn1cblxuaW50ZXJmYWNlIG11bHRpc2lnRGF0YSB7XG4gIG15U2hhcmU6IHN0cmluZztcbiAgc2hhcmVzOiBzdHJpbmdbXTtcbiAgdGhyZXNob2xkOiBudW1iZXI7XG4gIHB1YktleTogc3RyaW5nO1xuICBpc093bmVyPzogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIElUcmFuTXVsdGlzaWcge1xuICBvcHQ6IHR5cGU7XG4gIHNoYXJlczogYW55O1xuICBpbmZvOiBhbnk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE11bHRpc2lnIHtcbiAgbXVsdGlTaWc6IHsgW2tleTogc3RyaW5nXTogbXVsdGlzaWdEYXRhIH0gPSB7fTtcbiAgYWRkcmVzczogc3RyaW5nO1xuICBiOiBCbG9ja0NoYWluQXBwO1xuICBwcml2YXRlIG9uTXVsdGlzaWdUcmFuOiBJRXZlbnRzID0ge307XG4gIHByaXZhdGUgb25NdWx0aXNpZ1RyYW5Eb25lOiBJRXZlbnRzID0ge307XG4gIGV2ZW50cyA9IHtcbiAgICBvbk11bHRpc2lnVHJhbjogdGhpcy5vbk11bHRpc2lnVHJhbixcbiAgICBvbk11bHRpc2lnVHJhbkRvbmU6IHRoaXMub25NdWx0aXNpZ1RyYW5Eb25lXG4gIH07XG5cbiAgY29uc3RydWN0b3IoYmxvY2tjaGFpbjogQmxvY2tDaGFpbkFwcCkge1xuICAgIHRoaXMuYiA9IGJsb2NrY2hhaW47XG4gICAgdGhpcy5hZGRyZXNzID0gdGhpcy5iLmFkZHJlc3M7XG4gIH1cblxuICAvL+mAmuS/oeOBquOBqeOBq+OCiOOCiuW+l+OCieOCjOOBn+WRveS7pOOBq+WvvuOBmeOCi+WHpueQhlxuICByZXNwb25kZXIodHJhbjogSVRyYW5zYWN0aW9uKSB7XG4gICAgY29uc3QgZGF0YSA9IHRyYW4uZGF0YTtcbiAgICBpZiAoZGF0YS50eXBlID09PSBFVHJhbnNhY3Rpb25UeXBlLm11bHRpc2lnKSB7XG4gICAgICBjb25zdCB0cmFuTXVsdGlzaWc6IElUcmFuTXVsdGlzaWcgPSBkYXRhLnBheWxvYWQ7XG4gICAgICBzd2l0Y2ggKHRyYW5NdWx0aXNpZy5vcHQpIHtcbiAgICAgICAgY2FzZSB0eXBlLk1BS0U6XG4gICAgICAgICAge1xuICAgICAgICAgICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgYvjgonjg57jg6vjg4HjgrfjgrDjga7mg4XloLHjgpLlj5blvpdcbiAgICAgICAgICAgIHRoaXMuZ2V0TXVsdGlTaWdLZXkodHJhbk11bHRpc2lnLnNoYXJlcywgdHJhbk11bHRpc2lnLmluZm8pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSB0eXBlLlRSQU46XG4gICAgICAgICAge1xuICAgICAgICAgICAgLy/jgqTjg5njg7Pjg4jjga7mupblgplcbiAgICAgICAgICAgIHRoaXMub25NdWx0aVNpZ1RyYW5zYWN0aW9uKHRyYW5NdWx0aXNpZy5pbmZvKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHlwZS5BUFBST1ZFOlxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMub25BcHByb3ZlTXVsdGlTaWcodHJhbk11bHRpc2lnLmluZm8pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvL+ODnuODq+ODgeOCt+OCsOOBruOCouODieODrOOCueOCkueUn+aIkFxuICBtYWtlTmV3TXVsdGlTaWdBZGRyZXNzKFxuICAgIGZyaWVuZHNQdWJLZXlBZXM6IEFycmF5PHN0cmluZz4sIC8v5YWx5pyJ6ICF44Gu5oOF5aCxXG4gICAgZnJpZW5kc1B1YmtleVJzYVBhc3M6IHN0cmluZyxcbiAgICB2b3RlOiBudW1iZXIsIC8v44GX44GN44GE5YCkXG4gICAgYW1vdW50OiBudW1iZXIgLy/ph5HpoY1cbiAgKSB7XG4gICAgY29uc3QgY3lwaGVyID0gbmV3IEN5cGhlcigpO1xuICAgIC8v44K344Oj44Of44Ki44Gu56eY5a+G5YiG5pWj44Op44Kk44OW44Op44Oq44GnYWVza2V544KS44K344Kn44Ki5YyWXG4gICAgY29uc3Qgc2hhcmVLZXlzOiBhbnlbXSA9IHNzcy5zcGxpdChCdWZmZXIuZnJvbShjeXBoZXIucGhyYXNlKSwge1xuICAgICAgc2hhcmVzOiBmcmllbmRzUHViS2V5QWVzLmxlbmd0aCArIDEsXG4gICAgICB0aHJlc2hvbGQ6IHZvdGVcbiAgICB9KTtcblxuICAgIC8v44Oe44Or44OB44K344Kw44Ki44OJ44Os44K544KS5bCO5Ye6XG4gICAgY29uc3QgYWRkcmVzcyA9IHNoYTI1NihjeXBoZXIucHViS2V5KTtcbiAgICBjb25zdCBzaGFyZXM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7fTtcblxuICAgIC8v44K344Kn44Ki44Gu5YWx5pyJ6ICF44Gr44K344Kn44Ki44KS6YWN5biDXG4gICAgZnJpZW5kc1B1YktleUFlcy5mb3JFYWNoKChhZXMsIGkpID0+IHtcbiAgICAgIGNvbnN0IHB1YktleSA9IGFlczI1Ni5kZWNyeXB0KGZyaWVuZHNQdWJrZXlSc2FQYXNzLCBhZXMpO1xuICAgICAgY29uc3QgaWQgPSBzaGEyNTYocHViS2V5KTtcbiAgICAgIC8v5YWx5pyJ6ICF44Gu5YWs6ZaL6Y2144Gn44K344Kn44Ki44KS5pqX5Y+35YyWXG4gICAgICBzaGFyZXNbaWRdID0gY3lwaGVyLmVuY3J5cHQoYnVmZmVyVG9IZXgoc2hhcmVLZXlzW2ldKSwgcHViS2V5KTtcbiAgICB9KTtcblxuICAgIC8v6Ieq6Lqr44Gr44K344Kn44Ki44KS5LiA44Gk5Ymy5b2TXG4gICAgY29uc3QgbXlTaGFyZSA9IGJ1ZmZlclRvSGV4KHNoYXJlS2V5c1tzaGFyZUtleXMubGVuZ3RoIC0gMV0pO1xuXG4gICAgLy/jg57jg6vjg4HjgrfjgrDjga7mg4XloLHjgpLkv53nrqFcbiAgICB0aGlzLm11bHRpU2lnW2FkZHJlc3NdID0ge1xuICAgICAgbXlTaGFyZSxcbiAgICAgIHRocmVzaG9sZDogdm90ZSxcbiAgICAgIGlzT3duZXI6IGZhbHNlLFxuICAgICAgcHViS2V5OiBjeXBoZXIucHViS2V5LFxuICAgICAgc2hhcmVzOiBbXVxuICAgIH07XG4gICAgdGhpcy5tdWx0aVNpZ1thZGRyZXNzXS5zaGFyZXMucHVzaChteVNoYXJlKTtcblxuICAgIC8v44OW44Ot44OD44Kv44OB44Kn44O844Oz44Gr6LyJ44Gb44KL44Oe44Or44OB44K344Kw5oOF5aCxXG4gICAgY29uc3QgaW5mbzogbXVsdGlzaWdJbmZvID0ge1xuICAgICAgbXVsdGlzaWdQdWJLZXk6IGN5cGhlci5wdWJLZXksXG4gICAgICBtdWx0aXNpZ0FkZHJlc3M6IGFkZHJlc3MsXG4gICAgICB0aHJlc2hvbGQ6IHZvdGVcbiAgICB9O1xuXG4gICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgpLnlJ/miJBcbiAgICBjb25zdCB0cmFuID0gdGhpcy5iLm5ld1RyYW5zYWN0aW9uKHRoaXMuYi5hZGRyZXNzLCBhZGRyZXNzLCBhbW91bnQsIHtcbiAgICAgIHR5cGU6IEVUcmFuc2FjdGlvblR5cGUubXVsdGlzaWcsXG4gICAgICBwYXlsb2FkOiB7IG9wdDogdHlwZS5NQUtFLCBzaGFyZXMsIGluZm8gfVxuICAgIH0pO1xuICAgIHJldHVybiB0cmFuO1xuICB9XG5cbiAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgYvjgonjg57jg6vjg4HjgrfjgrDjga7mg4XloLHjgpLlj5blvpdcbiAgcHJpdmF0ZSBnZXRNdWx0aVNpZ0tleShcbiAgICBzaGFyZXM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0sXG4gICAgaW5mbzogbXVsdGlzaWdJbmZvXG4gICkge1xuICAgIGlmIChPYmplY3Qua2V5cyhzaGFyZXMpLmluY2x1ZGVzKHRoaXMuYWRkcmVzcykpIHtcbiAgICAgIC8v44K344Kn44Ki44Kt44O844Gu5YWs6ZaL6Y215pqX5Y+344KS56eY5a+G6Y2144Gn6Kej6ZmkXG4gICAgICBjb25zdCBrZXkgPSB0aGlzLmIuY3lwaGVyLmRlY3J5cHQoc2hhcmVzW3RoaXMuYWRkcmVzc10pO1xuXG4gICAgICAvL+ODnuODq+ODgeOCt+OCsOaDheWgseOCkuS/neWtmFxuICAgICAgdGhpcy5tdWx0aVNpZ1tpbmZvLm11bHRpc2lnQWRkcmVzc10gPSB7XG4gICAgICAgIG15U2hhcmU6IGtleSxcbiAgICAgICAgaXNPd25lcjogZmFsc2UsXG4gICAgICAgIHRocmVzaG9sZDogaW5mby50aHJlc2hvbGQsXG4gICAgICAgIHB1YktleTogaW5mby5tdWx0aXNpZ1B1YktleSxcbiAgICAgICAgc2hhcmVzOiBbXVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICAvL+ODnuODq+ODgeOCt+OCsOOBruODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OCkueUn+aIkFxuICBtYWtlTXVsdGlTaWdUcmFuc2FjdGlvbihtdWx0aXNpZ0FkZHJlc3M6IHN0cmluZykge1xuICAgIC8v44Oe44Or44OB44K344Kw44Ki44OJ44Os44K544Gu5oOF5aCx44KS6Ieq5YiG44GM5oyB44Gj44Gm44GE44KL44Gu44GLXG4gICAgY29uc3QgZGF0YSA9IHRoaXMubXVsdGlTaWdbbXVsdGlzaWdBZGRyZXNzXTtcbiAgICBpZiAoIWRhdGEpIHJldHVybjtcbiAgICBjb25zdCBtdWx0aXNpZ1B1YktleSA9IGRhdGEucHViS2V5O1xuXG4gICAgLy/oh6rliIbjga7mjIHjgaPjgabjgYTjgovjgrfjgqfjgqLjgq3jg7zjgpLmmpflj7fljJZcbiAgICBjb25zdCBzaGFyZUtleVJzYSA9IHRoaXMuYi5jeXBoZXIuZW5jcnlwdChcbiAgICAgIGRhdGEubXlTaGFyZSxcbiAgICAgIHRoaXMuYi5jeXBoZXIucHViS2V5XG4gICAgKTtcblxuICAgIC8v44OW44Ot44OD44Kv44OB44Kn44O844Oz44Gr6LyJ44Gb44KL5oOF5aCxXG4gICAgY29uc3QgaW5mbzogbXVsdGlzaWdJbmZvID0ge1xuICAgICAgb3duZXJQdWJLZXk6IHRoaXMuYi5jeXBoZXIucHViS2V5LFxuICAgICAgbXVsdGlzaWdQdWJLZXksXG4gICAgICBtdWx0aXNpZ0FkZHJlc3MsXG4gICAgICBzaGFyZVB1YktleVJzYTogc2hhcmVLZXlSc2EsXG4gICAgICB0aHJlc2hvbGQ6IGRhdGEudGhyZXNob2xkXG4gICAgfTtcbiAgICAvL+ODnuODq+ODgeOCt+OCsOaDheWgseOBq+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+Wun+ihjOiAheODleODqeOCsOOCkueri+OBpuOCi1xuICAgIGRhdGEuaXNPd25lciA9IHRydWU7XG5cbiAgICAvL+ODnuODq+ODgeOCt+OCsOOCouODieODrOOCueOBruaui+mrmOOCkuWPluW+l1xuICAgIGNvbnN0IGFtb3VudCA9IHRoaXMuYi5ub3dBbW91bnQobXVsdGlzaWdBZGRyZXNzKTtcblxuICAgIC8v44OI44Op44Oz44K244Kv44K344On44Oz44KS55Sf5oiQXG4gICAgY29uc3QgdHJhbiA9IHRoaXMuYi5uZXdUcmFuc2FjdGlvbih0aGlzLmIuYWRkcmVzcywgbXVsdGlzaWdBZGRyZXNzLCAwLCB7XG4gICAgICB0eXBlOiBFVHJhbnNhY3Rpb25UeXBlLm11bHRpc2lnLFxuICAgICAgcGF5bG9hZDoge1xuICAgICAgICBvcHQ6IHR5cGUuVFJBTixcbiAgICAgICAgYW1vdW50LFxuICAgICAgICBpbmZvXG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHRyYW47XG4gIH1cblxuICAvL+OCpOODmeODs+ODiOOCs+ODvOODq+ODkOODg+OCr+OBq+S7u+OBm+OCi1xuICBwcml2YXRlIG9uTXVsdGlTaWdUcmFuc2FjdGlvbihpbmZvOiBtdWx0aXNpZ0luZm8pIHtcbiAgICBpZiAoT2JqZWN0LmtleXModGhpcy5tdWx0aVNpZykuaW5jbHVkZXMoaW5mby5tdWx0aXNpZ0FkZHJlc3MpKSB7XG4gICAgICAvL+aJv+iqjeOBmeOCi+OBi+OBqeOBhuOBi+OCkuaxuuOCgeOBn+OBhOOBruOBp+OAgeOCpOODmeODs+ODiOOCkuS4gOWbnuaMn+OCk+OBp+OBhOOCi+OAglxuICAgICAgZXhjdXRlRXZlbnQodGhpcy5vbk11bHRpc2lnVHJhbiwgaW5mbyk7XG4gICAgfVxuICB9XG5cbiAgLy/jg57jg6vjg4HjgrfjgrDjga7mib/oqo1cbiAgYXBwcm92ZU11bHRpU2lnKGluZm86IG11bHRpc2lnSW5mbykge1xuICAgIGlmIChpbmZvLm93bmVyUHViS2V5KSB7XG4gICAgICAvL+ODnuODq+ODgeOCt+OCsOOBruaDheWgseOBjOOBguOCi+OBi+OCkuiqv+OBueOCi1xuICAgICAgaWYgKE9iamVjdC5rZXlzKHRoaXMubXVsdGlTaWcpLmluY2x1ZGVzKGluZm8ubXVsdGlzaWdBZGRyZXNzKSkgeyAgICAgIFxuICAgICAgICAvL+OCt+OCp+OCouOCreODvOOCkuWPluOCiuWHuuOBmVxuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLm11bHRpU2lnW2luZm8ubXVsdGlzaWdBZGRyZXNzXS5teVNoYXJlO1xuXG4gICAgICAgIGNvbnN0IHNoYXJlS2V5UnNhID0gdGhpcy5iLmN5cGhlci5lbmNyeXB0KGtleSwgaW5mby5vd25lclB1YktleSk7XG5cbiAgICAgICAgaW5mby5zaGFyZVB1YktleVJzYSA9IHNoYXJlS2V5UnNhO1xuICAgICAgICAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OCkueUn+aIkFxuICAgICAgICBjb25zdCB0cmFuID0gdGhpcy5iLm5ld1RyYW5zYWN0aW9uKFxuICAgICAgICAgIHRoaXMuYi5hZGRyZXNzLFxuICAgICAgICAgIGluZm8ubXVsdGlzaWdBZGRyZXNzLFxuICAgICAgICAgIDAsXG4gICAgICAgICAge1xuICAgICAgICAgICAgdHlwZTogRVRyYW5zYWN0aW9uVHlwZS5tdWx0aXNpZyxcbiAgICAgICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICAgICAgb3B0OiB0eXBlLkFQUFJPVkUsXG4gICAgICAgICAgICAgIGluZm86IGluZm9cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICk7ICAgICAgICBcbiAgICAgICAgcmV0dXJuIHRyYW47XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy/jg57jg6vjg4HjgrfjgrDjg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7Plrp/ooYzogIXjga7plqLmlbBcbiAgcHJpdmF0ZSBvbkFwcHJvdmVNdWx0aVNpZyhpbmZvOiBtdWx0aXNpZ0luZm8pIHtcbiAgICBpZiAoXG4gICAgICBpbmZvLnNoYXJlUHViS2V5UnNhICYmXG4gICAgICBpbmZvLm93bmVyUHViS2V5ID09PSB0aGlzLmIuY3lwaGVyLnB1YktleSAmJlxuICAgICAgT2JqZWN0LmtleXModGhpcy5tdWx0aVNpZykuaW5jbHVkZXMoaW5mby5tdWx0aXNpZ0FkZHJlc3MpXG4gICAgKSB7XG4gICAgICBjb25zdCBzaGFyZXMgPSB0aGlzLm11bHRpU2lnW2luZm8ubXVsdGlzaWdBZGRyZXNzXS5zaGFyZXM7XG5cbiAgICAgIGNvbnN0IHNoYXJlS2V5ID0gdGhpcy5iLmN5cGhlci5kZWNyeXB0KGluZm8uc2hhcmVQdWJLZXlSc2EpO1xuXG4gICAgICAvL+aWsOOBl+OBhOOCt+OCp+OCouOCreODvOOBquOCieS/neWtmOOBmeOCi+OAglxuICAgICAgaWYgKCFzaGFyZXMuaW5jbHVkZXMoc2hhcmVLZXkpKSB7ICAgICAgICBcbiAgICAgICAgc2hhcmVzLnB1c2goc2hhcmVLZXkpO1xuICAgICAgfVxuXG4gICAgICAvL+OCt+OCp+OCouOCreODvOOBruaVsOOBjOOBl+OBjeOBhOWApOOCkui2heOBiOOCjOOBsOODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OCkuaJv+iqjVxuICAgICAgaWYgKHNoYXJlcy5sZW5ndGggPj0gaW5mby50aHJlc2hvbGQpIHsgICAgICAgIFxuICAgICAgICAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OBruaJv+iqjemWouaVsFxuICAgICAgICB0aGlzLnZlcmlmeU11bHRpU2lnKGluZm8sIHNoYXJlcyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7Pjga7mib/oqo1cbiAgcHJpdmF0ZSB2ZXJpZnlNdWx0aVNpZyhpbmZvOiBtdWx0aXNpZ0luZm8sIF9zaGFyZXM6IEFycmF5PGFueT4pIHtcbiAgICAvL+OCt+ODo+ODn+OCouOBruOCt+OCp+OCouOCreODvOOBi+OCieOCt+ODvOOCr+ODrOODg+ODiOOCkuW+qeWPt+WMllxuICAgIGNvbnN0IHNoYXJlcyA9IF9zaGFyZXMubWFwKHNoYXJlID0+IGhleFRvQnVmZmVyKHNoYXJlKSk7ICAgIFxuICAgIGNvbnN0IHBocmFzZSA9IHNzcy5jb21iaW5lKHNoYXJlcykudG9TdHJpbmcoKTsgICAgXG4gICAgY29uc3QgY3lwaGVyID0gbmV3IEN5cGhlcihwaHJhc2UpO1xuICAgIGNvbnN0IGFkZHJlc3MgPSBpbmZvLm11bHRpc2lnQWRkcmVzcztcbiAgICAvL+ODnuODq+ODgeOCt+OCsOOCouODieODrOOCueOBruaui+mrmOOCkuWPluW+l1xuICAgIGNvbnN0IGFtb3VudCA9IHRoaXMuYi5ub3dBbW91bnQoYWRkcmVzcyk7XG4gICAgLy/mrovpq5jjgYzjgYLjgozjgbDjg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgpLlrp/ooYxcbiAgICBpZiAoYW1vdW50ID4gMCkge1xuICAgICAgY29uc3QgdHJhbiA9IHRoaXMuYi5uZXdUcmFuc2FjdGlvbihcbiAgICAgICAgYWRkcmVzcyxcbiAgICAgICAgdGhpcy5iLmFkZHJlc3MsXG4gICAgICAgIGFtb3VudCxcbiAgICAgICAgeyB0eXBlOiBFVHJhbnNhY3Rpb25UeXBlLnRyYW5zYWN0aW9uLCBwYXlsb2FkOiBcInZlcmlmeW11bHRpc2lnXCIgfSxcbiAgICAgICAgY3lwaGVyXG4gICAgICApOyAgICAgIFxuICAgICAgZXhjdXRlRXZlbnQodGhpcy5vbk11bHRpc2lnVHJhbkRvbmUpO1xuICAgICAgcmV0dXJuIHRyYW47XG4gICAgfVxuICB9XG59XG4iXX0=