"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _interface = require("../blockchain/interface");

var _contractVM = _interopRequireDefault(require("./contractVM"));

var _sha = _interopRequireDefault(require("sha256"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Contract =
/*#__PURE__*/
function () {
  function Contract(bc) {
    _classCallCheck(this, Contract);

    _defineProperty(this, "contracts", {});

    _defineProperty(this, "bc", void 0);

    this.bc = bc;
  }

  _createClass(Contract, [{
    key: "deploy",
    value: function deploy(tran) {
      console.log("deploy", {
        tran: tran
      });
      var sign = JSON.stringify(this.bc.cypher.signMessage(Math.random().toString()));
      var payload = tran.data.payload;
      var contract = new _contractVM.default(tran.recipient, JSON.parse(payload.code), this.bc.cypher.pubKey, sign);
      this.contracts[contract.address] = contract;
    }
  }, {
    key: "messageCall",
    value: function messageCall(tran) {
      var payload = tran.data.payload;
      var contract = this.contracts[tran.recipient];
      contract.messageCall(payload.type, payload.data);
    }
  }, {
    key: "responder",
    value: function responder(tran) {
      console.log("contracts res", {
        tran: tran
      });

      if (tran.data.type === _interface.ETransactionType.deploy) {
        this.deploy(tran);
      } else if (tran.data.type === _interface.ETransactionType.messagecall) {
        this.messageCall(tran);
      }
    }
  }, {
    key: "makeContract",
    value: function makeContract(amount, code) {
      var address = (0, _sha.default)(this.bc.address + this.bc.getNonce());
      var payload = {
        code: code,
        address: address
      };
      var data = {
        type: _interface.ETransactionType.deploy,
        payload: payload
      };
      return this.bc.makeTransaction(address, amount, data);
    }
  }, {
    key: "makeMessageCall",
    value: function makeMessageCall(address, amount, payload) {
      var data = {
        type: _interface.ETransactionType.messagecall,
        payload: payload
      };
      return this.bc.makeTransaction(address, amount, data);
    }
  }]);

  return Contract;
}();

exports.default = Contract;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250cmFjdC9jb250cmFjdC50cyJdLCJuYW1lcyI6WyJDb250cmFjdCIsImJjIiwidHJhbiIsImNvbnNvbGUiLCJsb2ciLCJzaWduIiwiSlNPTiIsInN0cmluZ2lmeSIsImN5cGhlciIsInNpZ25NZXNzYWdlIiwiTWF0aCIsInJhbmRvbSIsInRvU3RyaW5nIiwicGF5bG9hZCIsImRhdGEiLCJjb250cmFjdCIsIkNvbnRyYWN0Vk0iLCJyZWNpcGllbnQiLCJwYXJzZSIsImNvZGUiLCJwdWJLZXkiLCJjb250cmFjdHMiLCJhZGRyZXNzIiwibWVzc2FnZUNhbGwiLCJ0eXBlIiwiRVRyYW5zYWN0aW9uVHlwZSIsImRlcGxveSIsIm1lc3NhZ2VjYWxsIiwiYW1vdW50IiwiZ2V0Tm9uY2UiLCJtYWtlVHJhbnNhY3Rpb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFDQTs7QUFDQTs7QUFFQTs7Ozs7Ozs7Ozs7O0lBWXFCQSxROzs7QUFHbkIsb0JBQVlDLEVBQVosRUFBK0I7QUFBQTs7QUFBQSx1Q0FGWSxFQUVaOztBQUFBOztBQUM3QixTQUFLQSxFQUFMLEdBQVVBLEVBQVY7QUFDRDs7OzsyQkFFY0MsSSxFQUFvQjtBQUNqQ0MsTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksUUFBWixFQUFzQjtBQUFFRixRQUFBQSxJQUFJLEVBQUpBO0FBQUYsT0FBdEI7QUFDQSxVQUFNRyxJQUFJLEdBQUdDLElBQUksQ0FBQ0MsU0FBTCxDQUNYLEtBQUtOLEVBQUwsQ0FBUU8sTUFBUixDQUFlQyxXQUFmLENBQTJCQyxJQUFJLENBQUNDLE1BQUwsR0FBY0MsUUFBZCxFQUEzQixDQURXLENBQWI7QUFHQSxVQUFNQyxPQUFlLEdBQUdYLElBQUksQ0FBQ1ksSUFBTCxDQUFVRCxPQUFsQztBQUNBLFVBQU1FLFFBQVEsR0FBRyxJQUFJQyxtQkFBSixDQUNmZCxJQUFJLENBQUNlLFNBRFUsRUFFZlgsSUFBSSxDQUFDWSxLQUFMLENBQVdMLE9BQU8sQ0FBQ00sSUFBbkIsQ0FGZSxFQUdmLEtBQUtsQixFQUFMLENBQVFPLE1BQVIsQ0FBZVksTUFIQSxFQUlmZixJQUplLENBQWpCO0FBTUEsV0FBS2dCLFNBQUwsQ0FBZU4sUUFBUSxDQUFDTyxPQUF4QixJQUFtQ1AsUUFBbkM7QUFDRDs7O2dDQUVtQmIsSSxFQUFvQjtBQUN0QyxVQUFNVyxPQUFvQixHQUFHWCxJQUFJLENBQUNZLElBQUwsQ0FBVUQsT0FBdkM7QUFDQSxVQUFNRSxRQUFRLEdBQUcsS0FBS00sU0FBTCxDQUFlbkIsSUFBSSxDQUFDZSxTQUFwQixDQUFqQjtBQUNBRixNQUFBQSxRQUFRLENBQUNRLFdBQVQsQ0FBcUJWLE9BQU8sQ0FBQ1csSUFBN0IsRUFBbUNYLE9BQU8sQ0FBQ0MsSUFBM0M7QUFDRDs7OzhCQUVTWixJLEVBQW9CO0FBQzVCQyxNQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxlQUFaLEVBQTZCO0FBQUVGLFFBQUFBLElBQUksRUFBSkE7QUFBRixPQUE3Qjs7QUFDQSxVQUFJQSxJQUFJLENBQUNZLElBQUwsQ0FBVVUsSUFBVixLQUFtQkMsNEJBQWlCQyxNQUF4QyxFQUFnRDtBQUM5QyxhQUFLQSxNQUFMLENBQVl4QixJQUFaO0FBQ0QsT0FGRCxNQUVPLElBQUlBLElBQUksQ0FBQ1ksSUFBTCxDQUFVVSxJQUFWLEtBQW1CQyw0QkFBaUJFLFdBQXhDLEVBQXFEO0FBQzFELGFBQUtKLFdBQUwsQ0FBaUJyQixJQUFqQjtBQUNEO0FBQ0Y7OztpQ0FFWTBCLE0sRUFBZ0JULEksRUFBd0M7QUFDbkUsVUFBTUcsT0FBTyxHQUFHLGtCQUFPLEtBQUtyQixFQUFMLENBQVFxQixPQUFSLEdBQWtCLEtBQUtyQixFQUFMLENBQVE0QixRQUFSLEVBQXpCLENBQWhCO0FBQ0EsVUFBTWhCLE9BQWUsR0FBRztBQUFFTSxRQUFBQSxJQUFJLEVBQUpBLElBQUY7QUFBUUcsUUFBQUEsT0FBTyxFQUFQQTtBQUFSLE9BQXhCO0FBQ0EsVUFBTVIsSUFBc0IsR0FBRztBQUFFVSxRQUFBQSxJQUFJLEVBQUVDLDRCQUFpQkMsTUFBekI7QUFBaUNiLFFBQUFBLE9BQU8sRUFBUEE7QUFBakMsT0FBL0I7QUFDQSxhQUFPLEtBQUtaLEVBQUwsQ0FBUTZCLGVBQVIsQ0FBd0JSLE9BQXhCLEVBQWlDTSxNQUFqQyxFQUF5Q2QsSUFBekMsQ0FBUDtBQUNEOzs7b0NBRWVRLE8sRUFBaUJNLE0sRUFBZ0JmLE8sRUFBc0I7QUFDckUsVUFBTUMsSUFBc0IsR0FBRztBQUM3QlUsUUFBQUEsSUFBSSxFQUFFQyw0QkFBaUJFLFdBRE07QUFFN0JkLFFBQUFBLE9BQU8sRUFBUEE7QUFGNkIsT0FBL0I7QUFJQSxhQUFPLEtBQUtaLEVBQUwsQ0FBUTZCLGVBQVIsQ0FBd0JSLE9BQXhCLEVBQWlDTSxNQUFqQyxFQUF5Q2QsSUFBekMsQ0FBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSVRyYW5zYWN0aW9uLCBJVHJhbnNhY3Rpb25EYXRhIH0gZnJvbSBcIi4uL2Jsb2NrY2hhaW4vYmxvY2tjaGFpblwiO1xuaW1wb3J0IHsgRVRyYW5zYWN0aW9uVHlwZSB9IGZyb20gXCIuLi9ibG9ja2NoYWluL2ludGVyZmFjZVwiO1xuaW1wb3J0IENvbnRyYWN0Vk0gZnJvbSBcIi4vY29udHJhY3RWTVwiO1xuaW1wb3J0IEJsb2NrQ2hhaW5BcHAgZnJvbSBcIi4uL2Jsb2NrY2hhaW4vYmxvY2tjaGFpbkFwcFwiO1xuaW1wb3J0IHNoYTI1NiBmcm9tIFwic2hhMjU2XCI7XG5cbmludGVyZmFjZSBEZXBsb3kge1xuICBjb2RlOiBzdHJpbmc7XG4gIGFkZHJlc3M6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIE1lc3NhZ2VDYWxsIHtcbiAgdHlwZTogc3RyaW5nO1xuICBkYXRhOiBvYmplY3Q7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbnRyYWN0IHtcbiAgY29udHJhY3RzOiB7IFtrZXk6IHN0cmluZ106IENvbnRyYWN0Vk0gfSA9IHt9O1xuICBiYzogQmxvY2tDaGFpbkFwcDtcbiAgY29uc3RydWN0b3IoYmM6IEJsb2NrQ2hhaW5BcHApIHtcbiAgICB0aGlzLmJjID0gYmM7XG4gIH1cblxuICBwcml2YXRlIGRlcGxveSh0cmFuOiBJVHJhbnNhY3Rpb24pIHtcbiAgICBjb25zb2xlLmxvZyhcImRlcGxveVwiLCB7IHRyYW4gfSk7XG4gICAgY29uc3Qgc2lnbiA9IEpTT04uc3RyaW5naWZ5KFxuICAgICAgdGhpcy5iYy5jeXBoZXIuc2lnbk1lc3NhZ2UoTWF0aC5yYW5kb20oKS50b1N0cmluZygpKVxuICAgICk7XG4gICAgY29uc3QgcGF5bG9hZDogRGVwbG95ID0gdHJhbi5kYXRhLnBheWxvYWQ7XG4gICAgY29uc3QgY29udHJhY3QgPSBuZXcgQ29udHJhY3RWTShcbiAgICAgIHRyYW4ucmVjaXBpZW50LFxuICAgICAgSlNPTi5wYXJzZShwYXlsb2FkLmNvZGUpLFxuICAgICAgdGhpcy5iYy5jeXBoZXIucHViS2V5LFxuICAgICAgc2lnblxuICAgICk7XG4gICAgdGhpcy5jb250cmFjdHNbY29udHJhY3QuYWRkcmVzc10gPSBjb250cmFjdDtcbiAgfVxuXG4gIHByaXZhdGUgbWVzc2FnZUNhbGwodHJhbjogSVRyYW5zYWN0aW9uKSB7XG4gICAgY29uc3QgcGF5bG9hZDogTWVzc2FnZUNhbGwgPSB0cmFuLmRhdGEucGF5bG9hZDtcbiAgICBjb25zdCBjb250cmFjdCA9IHRoaXMuY29udHJhY3RzW3RyYW4ucmVjaXBpZW50XTtcbiAgICBjb250cmFjdC5tZXNzYWdlQ2FsbChwYXlsb2FkLnR5cGUsIHBheWxvYWQuZGF0YSk7XG4gIH1cblxuICByZXNwb25kZXIodHJhbjogSVRyYW5zYWN0aW9uKSB7XG4gICAgY29uc29sZS5sb2coXCJjb250cmFjdHMgcmVzXCIsIHsgdHJhbiB9KTtcbiAgICBpZiAodHJhbi5kYXRhLnR5cGUgPT09IEVUcmFuc2FjdGlvblR5cGUuZGVwbG95KSB7XG4gICAgICB0aGlzLmRlcGxveSh0cmFuKTtcbiAgICB9IGVsc2UgaWYgKHRyYW4uZGF0YS50eXBlID09PSBFVHJhbnNhY3Rpb25UeXBlLm1lc3NhZ2VjYWxsKSB7XG4gICAgICB0aGlzLm1lc3NhZ2VDYWxsKHRyYW4pO1xuICAgIH1cbiAgfVxuXG4gIG1ha2VDb250cmFjdChhbW91bnQ6IG51bWJlciwgY29kZTogc3RyaW5nKTogSVRyYW5zYWN0aW9uIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBhZGRyZXNzID0gc2hhMjU2KHRoaXMuYmMuYWRkcmVzcyArIHRoaXMuYmMuZ2V0Tm9uY2UoKSk7XG4gICAgY29uc3QgcGF5bG9hZDogRGVwbG95ID0geyBjb2RlLCBhZGRyZXNzIH07XG4gICAgY29uc3QgZGF0YTogSVRyYW5zYWN0aW9uRGF0YSA9IHsgdHlwZTogRVRyYW5zYWN0aW9uVHlwZS5kZXBsb3ksIHBheWxvYWQgfTtcbiAgICByZXR1cm4gdGhpcy5iYy5tYWtlVHJhbnNhY3Rpb24oYWRkcmVzcywgYW1vdW50LCBkYXRhKTtcbiAgfVxuXG4gIG1ha2VNZXNzYWdlQ2FsbChhZGRyZXNzOiBzdHJpbmcsIGFtb3VudDogbnVtYmVyLCBwYXlsb2FkOiBNZXNzYWdlQ2FsbCkge1xuICAgIGNvbnN0IGRhdGE6IElUcmFuc2FjdGlvbkRhdGEgPSB7XG4gICAgICB0eXBlOiBFVHJhbnNhY3Rpb25UeXBlLm1lc3NhZ2VjYWxsLFxuICAgICAgcGF5bG9hZFxuICAgIH07XG4gICAgcmV0dXJuIHRoaXMuYmMubWFrZVRyYW5zYWN0aW9uKGFkZHJlc3MsIGFtb3VudCwgZGF0YSk7XG4gIH1cbn1cbiJdfQ==