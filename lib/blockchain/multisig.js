"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

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
          case multisig.type.MAKE:
            {
              //トランザクションからマルチシグの情報を取得
              this.getMultiSigKey(tranMultisig.shares, tranMultisig.info);
            }
            break;

          case multisig.type.TRAN:
            {
              //イベントの準備
              this.onMultiSigTransaction(tranMultisig.info);
            }
            break;

          case multisig.type.APPROVE:
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
          opt: multisig.type.MAKE,
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
          opt: multisig.type.TRAN,
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
              opt: multisig.type.APPROVE,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL211bHRpc2lnLnRzIl0sIm5hbWVzIjpbIkJ1ZmZlciIsInJlcXVpcmUiLCJhZXMyNTYiLCJzc3MiLCJNdWx0aXNpZyIsImJsb2NrY2hhaW4iLCJvbk11bHRpc2lnVHJhbiIsIm9uTXVsdGlzaWdUcmFuRG9uZSIsImIiLCJhZGRyZXNzIiwidHJhbiIsImRhdGEiLCJ0eXBlIiwiRVRyYW5zYWN0aW9uVHlwZSIsIm11bHRpc2lnIiwidHJhbk11bHRpc2lnIiwicGF5bG9hZCIsIm9wdCIsIk1BS0UiLCJnZXRNdWx0aVNpZ0tleSIsInNoYXJlcyIsImluZm8iLCJUUkFOIiwib25NdWx0aVNpZ1RyYW5zYWN0aW9uIiwiQVBQUk9WRSIsIm9uQXBwcm92ZU11bHRpU2lnIiwiZnJpZW5kc1B1YktleUFlcyIsImZyaWVuZHNQdWJrZXlSc2FQYXNzIiwidm90ZSIsImFtb3VudCIsImN5cGhlciIsIkN5cGhlciIsInNoYXJlS2V5cyIsInNwbGl0IiwiZnJvbSIsInBocmFzZSIsImxlbmd0aCIsInRocmVzaG9sZCIsInB1YktleSIsImZvckVhY2giLCJhZXMiLCJpIiwiZGVjcnlwdCIsImlkIiwiZW5jcnlwdCIsIm15U2hhcmUiLCJtdWx0aVNpZyIsImlzT3duZXIiLCJwdXNoIiwibXVsdGlzaWdQdWJLZXkiLCJtdWx0aXNpZ0FkZHJlc3MiLCJuZXdUcmFuc2FjdGlvbiIsIk9iamVjdCIsImtleXMiLCJpbmNsdWRlcyIsImtleSIsInNoYXJlS2V5UnNhIiwib3duZXJQdWJLZXkiLCJzaGFyZVB1YktleVJzYSIsIm5vd0Ftb3VudCIsInNoYXJlS2V5IiwidmVyaWZ5TXVsdGlTaWciLCJfc2hhcmVzIiwibWFwIiwic2hhcmUiLCJjb21iaW5lIiwidG9TdHJpbmciLCJ0cmFuc2FjdGlvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNBOztBQUNBOztBQUNBOztBQUdBOztBQUNBOzs7Ozs7Ozs7Ozs7QUFDQSxJQUFNQSxNQUFNLEdBQUdDLE9B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ZUFBS3dCLGNBQUwsQ0FBb0J4QyxJQUFwQixFQUEwQkQsUUFBMUI7QUFDRDtBQUNGO0FBQ0YsSyxDQUVEOzs7O21DQUN1QkMsSSxFQUFvQnlDLE8sRUFBcUI7QUFDOUQ7QUFDQSxVQUFNMUMsTUFBTSxHQUFHMEMsT0FBTyxDQUFDQyxHQUFSLENBQVksVUFBQUMsS0FBSztBQUFBLGVBQUkseUJBQVlBLEtBQVosQ0FBSjtBQUFBLE9BQWpCLENBQWY7O0FBQ0EsVUFBTTdCLE1BQU0sR0FBR2hDLEdBQUcsQ0FBQzhELE9BQUosQ0FBWTdDLE1BQVosRUFBb0I4QyxRQUFwQixFQUFmO0FBQ0EsVUFBTXBDLE1BQU0sR0FBRyxJQUFJQyxlQUFKLENBQVdJLE1BQVgsQ0FBZjtBQUNBLFVBQU0xQixPQUFPLEdBQUdZLElBQUksQ0FBQzZCLGVBQXJCLENBTDhELENBTTlEOztBQUNBLFVBQU1yQixNQUFNLEdBQUcsS0FBS3JCLENBQUwsQ0FBT21ELFNBQVAsQ0FBaUJsRCxPQUFqQixDQUFmLENBUDhELENBUTlEOztBQUNBLFVBQUlvQixNQUFNLEdBQUcsQ0FBYixFQUFnQjtBQUNkLFlBQU1uQixJQUFJLEdBQUcsS0FBS0YsQ0FBTCxDQUFPMkMsY0FBUCxDQUNYMUMsT0FEVyxFQUVYLEtBQUtELENBQUwsQ0FBT0MsT0FGSSxFQUdYb0IsTUFIVyxFQUlYO0FBQUVqQixVQUFBQSxJQUFJLEVBQUVDLDRCQUFpQnNELFdBQXpCO0FBQXNDbkQsVUFBQUEsT0FBTyxFQUFFO0FBQS9DLFNBSlcsRUFLWGMsTUFMVyxDQUFiO0FBT0EsK0JBQVksS0FBS3ZCLGtCQUFqQjtBQUNBLGVBQU9HLElBQVA7QUFDRDtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSVRyYW5zYWN0aW9uIH0gZnJvbSBcIi4vYmxvY2tjaGFpblwiO1xuaW1wb3J0IHsgbXVsdGlzaWdJbmZvLCBFVHJhbnNhY3Rpb25UeXBlIH0gZnJvbSBcIi4vaW50ZXJmYWNlXCI7XG5pbXBvcnQgc2hhMjU2IGZyb20gXCJzaGEyNTZcIjtcbmltcG9ydCBDeXBoZXIgZnJvbSBcIi4vY3J5cHRvL2N5cGhlclwiO1xuXG5pbXBvcnQgQmxvY2tDaGFpbkFwcCBmcm9tIFwiLi9ibG9ja2NoYWluQXBwXCI7XG5pbXBvcnQgeyBJRXZlbnRzLCBleGN1dGVFdmVudCB9IGZyb20gXCIuLi91dGlsXCI7XG5pbXBvcnQgeyBidWZmZXJUb0hleCwgaGV4VG9CdWZmZXIgfSBmcm9tIFwiLi9jcnlwdG8vYnVmZmVyXCI7XG5jb25zdCBCdWZmZXIgPSByZXF1aXJlKFwiYnVmZmVyL1wiKS5CdWZmZXI7XG52YXIgYWVzMjU2ID0gcmVxdWlyZShcImFlczI1NlwiKTtcbmNvbnN0IHNzcyA9IHJlcXVpcmUoXCJzaGFtaXJzLXNlY3JldC1zaGFyaW5nXCIpO1xuXG5kZWNsYXJlIG5hbWVzcGFjZSBtdWx0aXNpZyB7XG4gIGV4cG9ydCBlbnVtIHR5cGUge1xuICAgIE1BS0UgPSBcIm11bHRpc2lnLW1ha2VcIixcbiAgICBUUkFOID0gXCJtdWx0aXNpZy10cmFuXCIsXG4gICAgQVBQUk9WRSA9IFwibXVsdGlzaWctYXBwcm92ZVwiLFxuICAgIE1VTFRJU0lHID0gXCJtdWx0aXNpZ1wiXG4gIH1cblxuICBleHBvcnQgaW50ZXJmYWNlIGRhdGEge1xuICAgIG15U2hhcmU6IHN0cmluZztcbiAgICBzaGFyZXM6IHN0cmluZ1tdO1xuICAgIHRocmVzaG9sZDogbnVtYmVyO1xuICAgIHB1YktleTogc3RyaW5nO1xuICAgIGlzT3duZXI/OiBib29sZWFuO1xuICB9XG5cbiAgZXhwb3J0IGludGVyZmFjZSB0cmFuc2FjdGlvbiB7XG4gICAgb3B0OiB0eXBlO1xuICAgIHNoYXJlczogYW55O1xuICAgIGluZm86IGFueTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNdWx0aXNpZyB7XG4gIG11bHRpU2lnOiB7IFtrZXk6IHN0cmluZ106IG11bHRpc2lnLmRhdGEgfSA9IHt9O1xuICBhZGRyZXNzOiBzdHJpbmc7XG4gIGI6IEJsb2NrQ2hhaW5BcHA7XG4gIHByaXZhdGUgb25NdWx0aXNpZ1RyYW46IElFdmVudHMgPSB7fTtcbiAgcHJpdmF0ZSBvbk11bHRpc2lnVHJhbkRvbmU6IElFdmVudHMgPSB7fTtcbiAgZXZlbnRzID0ge1xuICAgIG9uTXVsdGlzaWdUcmFuOiB0aGlzLm9uTXVsdGlzaWdUcmFuLFxuICAgIG9uTXVsdGlzaWdUcmFuRG9uZTogdGhpcy5vbk11bHRpc2lnVHJhbkRvbmVcbiAgfTtcblxuICBjb25zdHJ1Y3RvcihibG9ja2NoYWluOiBCbG9ja0NoYWluQXBwKSB7XG4gICAgdGhpcy5iID0gYmxvY2tjaGFpbjtcbiAgICB0aGlzLmFkZHJlc3MgPSB0aGlzLmIuYWRkcmVzcztcbiAgfVxuXG4gIC8v6YCa5L+h44Gq44Gp44Gr44KI44KK5b6X44KJ44KM44Gf5ZG95Luk44Gr5a++44GZ44KL5Yem55CGXG4gIHJlc3BvbmRlcih0cmFuOiBJVHJhbnNhY3Rpb24pIHtcbiAgICBjb25zdCBkYXRhID0gdHJhbi5kYXRhO1xuICAgIGlmIChkYXRhLnR5cGUgPT09IEVUcmFuc2FjdGlvblR5cGUubXVsdGlzaWcpIHtcbiAgICAgIGNvbnN0IHRyYW5NdWx0aXNpZzogbXVsdGlzaWcudHJhbnNhY3Rpb24gPSBkYXRhLnBheWxvYWQ7XG4gICAgICBzd2l0Y2ggKHRyYW5NdWx0aXNpZy5vcHQpIHtcbiAgICAgICAgY2FzZSBtdWx0aXNpZy50eXBlLk1BS0U6XG4gICAgICAgICAge1xuICAgICAgICAgICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgYvjgonjg57jg6vjg4HjgrfjgrDjga7mg4XloLHjgpLlj5blvpdcbiAgICAgICAgICAgIHRoaXMuZ2V0TXVsdGlTaWdLZXkodHJhbk11bHRpc2lnLnNoYXJlcywgdHJhbk11bHRpc2lnLmluZm8pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBtdWx0aXNpZy50eXBlLlRSQU46XG4gICAgICAgICAge1xuICAgICAgICAgICAgLy/jgqTjg5njg7Pjg4jjga7mupblgplcbiAgICAgICAgICAgIHRoaXMub25NdWx0aVNpZ1RyYW5zYWN0aW9uKHRyYW5NdWx0aXNpZy5pbmZvKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgbXVsdGlzaWcudHlwZS5BUFBST1ZFOlxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMub25BcHByb3ZlTXVsdGlTaWcodHJhbk11bHRpc2lnLmluZm8pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvL+ODnuODq+ODgeOCt+OCsOOBruOCouODieODrOOCueOCkueUn+aIkFxuICBtYWtlTmV3TXVsdGlTaWdBZGRyZXNzKFxuICAgIGZyaWVuZHNQdWJLZXlBZXM6IEFycmF5PHN0cmluZz4sIC8v5YWx5pyJ6ICF44Gu5oOF5aCxXG4gICAgZnJpZW5kc1B1YmtleVJzYVBhc3M6IHN0cmluZyxcbiAgICB2b3RlOiBudW1iZXIsIC8v44GX44GN44GE5YCkXG4gICAgYW1vdW50OiBudW1iZXIgLy/ph5HpoY1cbiAgKSB7XG4gICAgY29uc3QgY3lwaGVyID0gbmV3IEN5cGhlcigpO1xuICAgIC8v44K344Oj44Of44Ki44Gu56eY5a+G5YiG5pWj44Op44Kk44OW44Op44Oq44GnYWVza2V544KS44K344Kn44Ki5YyWXG4gICAgY29uc3Qgc2hhcmVLZXlzOiBhbnlbXSA9IHNzcy5zcGxpdChCdWZmZXIuZnJvbShjeXBoZXIucGhyYXNlKSwge1xuICAgICAgc2hhcmVzOiBmcmllbmRzUHViS2V5QWVzLmxlbmd0aCArIDEsXG4gICAgICB0aHJlc2hvbGQ6IHZvdGVcbiAgICB9KTtcblxuICAgIC8v44Oe44Or44OB44K344Kw44Ki44OJ44Os44K544KS5bCO5Ye6XG4gICAgY29uc3QgYWRkcmVzcyA9IHNoYTI1NihjeXBoZXIucHViS2V5KTtcbiAgICBjb25zdCBzaGFyZXM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7fTtcblxuICAgIC8v44K344Kn44Ki44Gu5YWx5pyJ6ICF44Gr44K344Kn44Ki44KS6YWN5biDXG4gICAgZnJpZW5kc1B1YktleUFlcy5mb3JFYWNoKChhZXMsIGkpID0+IHtcbiAgICAgIGNvbnN0IHB1YktleSA9IGFlczI1Ni5kZWNyeXB0KGZyaWVuZHNQdWJrZXlSc2FQYXNzLCBhZXMpO1xuICAgICAgY29uc3QgaWQgPSBzaGEyNTYocHViS2V5KTtcbiAgICAgIC8v5YWx5pyJ6ICF44Gu5YWs6ZaL6Y2144Gn44K344Kn44Ki44KS5pqX5Y+35YyWXG4gICAgICBzaGFyZXNbaWRdID0gY3lwaGVyLmVuY3J5cHQoYnVmZmVyVG9IZXgoc2hhcmVLZXlzW2ldKSwgcHViS2V5KTtcbiAgICB9KTtcblxuICAgIC8v6Ieq6Lqr44Gr44K344Kn44Ki44KS5LiA44Gk5Ymy5b2TXG4gICAgY29uc3QgbXlTaGFyZSA9IGJ1ZmZlclRvSGV4KHNoYXJlS2V5c1tzaGFyZUtleXMubGVuZ3RoIC0gMV0pO1xuXG4gICAgLy/jg57jg6vjg4HjgrfjgrDjga7mg4XloLHjgpLkv53nrqFcbiAgICB0aGlzLm11bHRpU2lnW2FkZHJlc3NdID0ge1xuICAgICAgbXlTaGFyZSxcbiAgICAgIHRocmVzaG9sZDogdm90ZSxcbiAgICAgIGlzT3duZXI6IGZhbHNlLFxuICAgICAgcHViS2V5OiBjeXBoZXIucHViS2V5LFxuICAgICAgc2hhcmVzOiBbXVxuICAgIH07XG4gICAgdGhpcy5tdWx0aVNpZ1thZGRyZXNzXS5zaGFyZXMucHVzaChteVNoYXJlKTtcblxuICAgIC8v44OW44Ot44OD44Kv44OB44Kn44O844Oz44Gr6LyJ44Gb44KL44Oe44Or44OB44K344Kw5oOF5aCxXG4gICAgY29uc3QgaW5mbzogbXVsdGlzaWdJbmZvID0ge1xuICAgICAgbXVsdGlzaWdQdWJLZXk6IGN5cGhlci5wdWJLZXksXG4gICAgICBtdWx0aXNpZ0FkZHJlc3M6IGFkZHJlc3MsXG4gICAgICB0aHJlc2hvbGQ6IHZvdGVcbiAgICB9O1xuXG4gICAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgpLnlJ/miJBcbiAgICBjb25zdCB0cmFuID0gdGhpcy5iLm5ld1RyYW5zYWN0aW9uKHRoaXMuYi5hZGRyZXNzLCBhZGRyZXNzLCBhbW91bnQsIHtcbiAgICAgIHR5cGU6IEVUcmFuc2FjdGlvblR5cGUubXVsdGlzaWcsXG4gICAgICBwYXlsb2FkOiB7IG9wdDogbXVsdGlzaWcudHlwZS5NQUtFLCBzaGFyZXMsIGluZm8gfVxuICAgIH0pO1xuICAgIHJldHVybiB0cmFuO1xuICB9XG5cbiAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7PjgYvjgonjg57jg6vjg4HjgrfjgrDjga7mg4XloLHjgpLlj5blvpdcbiAgcHJpdmF0ZSBnZXRNdWx0aVNpZ0tleShcbiAgICBzaGFyZXM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0sXG4gICAgaW5mbzogbXVsdGlzaWdJbmZvXG4gICkge1xuICAgIGlmIChPYmplY3Qua2V5cyhzaGFyZXMpLmluY2x1ZGVzKHRoaXMuYWRkcmVzcykpIHtcbiAgICAgIC8v44K344Kn44Ki44Kt44O844Gu5YWs6ZaL6Y215pqX5Y+344KS56eY5a+G6Y2144Gn6Kej6ZmkXG4gICAgICBjb25zdCBrZXkgPSB0aGlzLmIuY3lwaGVyLmRlY3J5cHQoc2hhcmVzW3RoaXMuYWRkcmVzc10pO1xuXG4gICAgICAvL+ODnuODq+ODgeOCt+OCsOaDheWgseOCkuS/neWtmFxuICAgICAgdGhpcy5tdWx0aVNpZ1tpbmZvLm11bHRpc2lnQWRkcmVzc10gPSB7XG4gICAgICAgIG15U2hhcmU6IGtleSxcbiAgICAgICAgaXNPd25lcjogZmFsc2UsXG4gICAgICAgIHRocmVzaG9sZDogaW5mby50aHJlc2hvbGQsXG4gICAgICAgIHB1YktleTogaW5mby5tdWx0aXNpZ1B1YktleSxcbiAgICAgICAgc2hhcmVzOiBbXVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICAvL+ODnuODq+ODgeOCt+OCsOOBruODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OCkueUn+aIkFxuICBtYWtlTXVsdGlTaWdUcmFuc2FjdGlvbihtdWx0aXNpZ0FkZHJlc3M6IHN0cmluZykge1xuICAgIC8v44Oe44Or44OB44K344Kw44Ki44OJ44Os44K544Gu5oOF5aCx44KS6Ieq5YiG44GM5oyB44Gj44Gm44GE44KL44Gu44GLXG4gICAgY29uc3QgZGF0YSA9IHRoaXMubXVsdGlTaWdbbXVsdGlzaWdBZGRyZXNzXTtcbiAgICBpZiAoIWRhdGEpIHJldHVybjtcbiAgICBjb25zdCBtdWx0aXNpZ1B1YktleSA9IGRhdGEucHViS2V5O1xuXG4gICAgLy/oh6rliIbjga7mjIHjgaPjgabjgYTjgovjgrfjgqfjgqLjgq3jg7zjgpLmmpflj7fljJZcbiAgICBjb25zdCBzaGFyZUtleVJzYSA9IHRoaXMuYi5jeXBoZXIuZW5jcnlwdChcbiAgICAgIGRhdGEubXlTaGFyZSxcbiAgICAgIHRoaXMuYi5jeXBoZXIucHViS2V5XG4gICAgKTtcblxuICAgIC8v44OW44Ot44OD44Kv44OB44Kn44O844Oz44Gr6LyJ44Gb44KL5oOF5aCxXG4gICAgY29uc3QgaW5mbzogbXVsdGlzaWdJbmZvID0ge1xuICAgICAgb3duZXJQdWJLZXk6IHRoaXMuYi5jeXBoZXIucHViS2V5LFxuICAgICAgbXVsdGlzaWdQdWJLZXksXG4gICAgICBtdWx0aXNpZ0FkZHJlc3MsXG4gICAgICBzaGFyZVB1YktleVJzYTogc2hhcmVLZXlSc2EsXG4gICAgICB0aHJlc2hvbGQ6IGRhdGEudGhyZXNob2xkXG4gICAgfTtcbiAgICAvL+ODnuODq+ODgeOCt+OCsOaDheWgseOBq+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+Wun+ihjOiAheODleODqeOCsOOCkueri+OBpuOCi1xuICAgIGRhdGEuaXNPd25lciA9IHRydWU7XG5cbiAgICAvL+ODnuODq+ODgeOCt+OCsOOCouODieODrOOCueOBruaui+mrmOOCkuWPluW+l1xuICAgIGNvbnN0IGFtb3VudCA9IHRoaXMuYi5ub3dBbW91bnQobXVsdGlzaWdBZGRyZXNzKTtcblxuICAgIC8v44OI44Op44Oz44K244Kv44K344On44Oz44KS55Sf5oiQXG4gICAgY29uc3QgdHJhbiA9IHRoaXMuYi5uZXdUcmFuc2FjdGlvbih0aGlzLmIuYWRkcmVzcywgbXVsdGlzaWdBZGRyZXNzLCAwLCB7XG4gICAgICB0eXBlOiBFVHJhbnNhY3Rpb25UeXBlLm11bHRpc2lnLFxuICAgICAgcGF5bG9hZDoge1xuICAgICAgICBvcHQ6IG11bHRpc2lnLnR5cGUuVFJBTixcbiAgICAgICAgYW1vdW50LFxuICAgICAgICBpbmZvXG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHRyYW47XG4gIH1cblxuICAvL+OCpOODmeODs+ODiOOCs+ODvOODq+ODkOODg+OCr+OBq+S7u+OBm+OCi1xuICBwcml2YXRlIG9uTXVsdGlTaWdUcmFuc2FjdGlvbihpbmZvOiBtdWx0aXNpZ0luZm8pIHtcbiAgICBpZiAoT2JqZWN0LmtleXModGhpcy5tdWx0aVNpZykuaW5jbHVkZXMoaW5mby5tdWx0aXNpZ0FkZHJlc3MpKSB7XG4gICAgICAvL+aJv+iqjeOBmeOCi+OBi+OBqeOBhuOBi+OCkuaxuuOCgeOBn+OBhOOBruOBp+OAgeOCpOODmeODs+ODiOOCkuS4gOWbnuaMn+OCk+OBp+OBhOOCi+OAglxuICAgICAgZXhjdXRlRXZlbnQodGhpcy5vbk11bHRpc2lnVHJhbiwgaW5mbyk7XG4gICAgfVxuICB9XG5cbiAgLy/jg57jg6vjg4HjgrfjgrDjga7mib/oqo1cbiAgYXBwcm92ZU11bHRpU2lnKGluZm86IG11bHRpc2lnSW5mbykge1xuICAgIGlmIChpbmZvLm93bmVyUHViS2V5KSB7XG4gICAgICAvL+ODnuODq+ODgeOCt+OCsOOBruaDheWgseOBjOOBguOCi+OBi+OCkuiqv+OBueOCi1xuICAgICAgaWYgKE9iamVjdC5rZXlzKHRoaXMubXVsdGlTaWcpLmluY2x1ZGVzKGluZm8ubXVsdGlzaWdBZGRyZXNzKSkge1xuICAgICAgICAvL+OCt+OCp+OCouOCreODvOOCkuWPluOCiuWHuuOBmVxuICAgICAgICBjb25zdCBrZXkgPSB0aGlzLm11bHRpU2lnW2luZm8ubXVsdGlzaWdBZGRyZXNzXS5teVNoYXJlO1xuXG4gICAgICAgIGNvbnN0IHNoYXJlS2V5UnNhID0gdGhpcy5iLmN5cGhlci5lbmNyeXB0KGtleSwgaW5mby5vd25lclB1YktleSk7XG5cbiAgICAgICAgaW5mby5zaGFyZVB1YktleVJzYSA9IHNoYXJlS2V5UnNhO1xuICAgICAgICAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OCkueUn+aIkFxuICAgICAgICBjb25zdCB0cmFuID0gdGhpcy5iLm5ld1RyYW5zYWN0aW9uKFxuICAgICAgICAgIHRoaXMuYi5hZGRyZXNzLFxuICAgICAgICAgIGluZm8ubXVsdGlzaWdBZGRyZXNzLFxuICAgICAgICAgIDAsXG4gICAgICAgICAge1xuICAgICAgICAgICAgdHlwZTogRVRyYW5zYWN0aW9uVHlwZS5tdWx0aXNpZyxcbiAgICAgICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICAgICAgb3B0OiBtdWx0aXNpZy50eXBlLkFQUFJPVkUsXG4gICAgICAgICAgICAgIGluZm86IGluZm9cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiB0cmFuO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8v44Oe44Or44OB44K344Kw44OI44Op44Oz44K244Kv44K344On44Oz5a6f6KGM6ICF44Gu6Zai5pWwXG4gIHByaXZhdGUgb25BcHByb3ZlTXVsdGlTaWcoaW5mbzogbXVsdGlzaWdJbmZvKSB7XG4gICAgaWYgKFxuICAgICAgaW5mby5zaGFyZVB1YktleVJzYSAmJlxuICAgICAgaW5mby5vd25lclB1YktleSA9PT0gdGhpcy5iLmN5cGhlci5wdWJLZXkgJiZcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMubXVsdGlTaWcpLmluY2x1ZGVzKGluZm8ubXVsdGlzaWdBZGRyZXNzKVxuICAgICkge1xuICAgICAgY29uc3Qgc2hhcmVzID0gdGhpcy5tdWx0aVNpZ1tpbmZvLm11bHRpc2lnQWRkcmVzc10uc2hhcmVzO1xuXG4gICAgICBjb25zdCBzaGFyZUtleSA9IHRoaXMuYi5jeXBoZXIuZGVjcnlwdChpbmZvLnNoYXJlUHViS2V5UnNhKTtcblxuICAgICAgLy/mlrDjgZfjgYTjgrfjgqfjgqLjgq3jg7zjgarjgonkv53lrZjjgZnjgovjgIJcbiAgICAgIGlmICghc2hhcmVzLmluY2x1ZGVzKHNoYXJlS2V5KSkge1xuICAgICAgICBzaGFyZXMucHVzaChzaGFyZUtleSk7XG4gICAgICB9XG5cbiAgICAgIC8v44K344Kn44Ki44Kt44O844Gu5pWw44GM44GX44GN44GE5YCk44KS6LaF44GI44KM44Gw44OI44Op44Oz44K244Kv44K344On44Oz44KS5om/6KqNXG4gICAgICBpZiAoc2hhcmVzLmxlbmd0aCA+PSBpbmZvLnRocmVzaG9sZCkge1xuICAgICAgICAvL+ODiOODqeODs+OCtuOCr+OCt+ODp+ODs+OBruaJv+iqjemWouaVsFxuICAgICAgICB0aGlzLnZlcmlmeU11bHRpU2lnKGluZm8sIHNoYXJlcyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy/jg4jjg6njg7Pjgrbjgq/jgrfjg6fjg7Pjga7mib/oqo1cbiAgcHJpdmF0ZSB2ZXJpZnlNdWx0aVNpZyhpbmZvOiBtdWx0aXNpZ0luZm8sIF9zaGFyZXM6IEFycmF5PGFueT4pIHtcbiAgICAvL+OCt+ODo+ODn+OCouOBruOCt+OCp+OCouOCreODvOOBi+OCieOCt+ODvOOCr+ODrOODg+ODiOOCkuW+qeWPt+WMllxuICAgIGNvbnN0IHNoYXJlcyA9IF9zaGFyZXMubWFwKHNoYXJlID0+IGhleFRvQnVmZmVyKHNoYXJlKSk7XG4gICAgY29uc3QgcGhyYXNlID0gc3NzLmNvbWJpbmUoc2hhcmVzKS50b1N0cmluZygpO1xuICAgIGNvbnN0IGN5cGhlciA9IG5ldyBDeXBoZXIocGhyYXNlKTtcbiAgICBjb25zdCBhZGRyZXNzID0gaW5mby5tdWx0aXNpZ0FkZHJlc3M7XG4gICAgLy/jg57jg6vjg4HjgrfjgrDjgqLjg4njg6zjgrnjga7mrovpq5jjgpLlj5blvpdcbiAgICBjb25zdCBhbW91bnQgPSB0aGlzLmIubm93QW1vdW50KGFkZHJlc3MpO1xuICAgIC8v5q6L6auY44GM44GC44KM44Gw44OI44Op44Oz44K244Kv44K344On44Oz44KS5a6f6KGMXG4gICAgaWYgKGFtb3VudCA+IDApIHtcbiAgICAgIGNvbnN0IHRyYW4gPSB0aGlzLmIubmV3VHJhbnNhY3Rpb24oXG4gICAgICAgIGFkZHJlc3MsXG4gICAgICAgIHRoaXMuYi5hZGRyZXNzLFxuICAgICAgICBhbW91bnQsXG4gICAgICAgIHsgdHlwZTogRVRyYW5zYWN0aW9uVHlwZS50cmFuc2FjdGlvbiwgcGF5bG9hZDogXCJ2ZXJpZnltdWx0aXNpZ1wiIH0sXG4gICAgICAgIGN5cGhlclxuICAgICAgKTtcbiAgICAgIGV4Y3V0ZUV2ZW50KHRoaXMub25NdWx0aXNpZ1RyYW5Eb25lKTtcbiAgICAgIHJldHVybiB0cmFuO1xuICAgIH1cbiAgfVxufVxuIl19