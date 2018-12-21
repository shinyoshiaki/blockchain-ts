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
      var sign = this.bc.cypher.signMessage(Math.random().toString());
      var payload = tran.data.payload;
      var contract = new _contractVM.default(JSON.parse(payload.code), this.bc, sign, tran.recipient);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250cmFjdC9jb250cmFjdC50cyJdLCJuYW1lcyI6WyJDb250cmFjdCIsImJjIiwidHJhbiIsImNvbnNvbGUiLCJsb2ciLCJzaWduIiwiY3lwaGVyIiwic2lnbk1lc3NhZ2UiLCJNYXRoIiwicmFuZG9tIiwidG9TdHJpbmciLCJwYXlsb2FkIiwiZGF0YSIsImNvbnRyYWN0IiwiQ29udHJhY3RWTSIsIkpTT04iLCJwYXJzZSIsImNvZGUiLCJyZWNpcGllbnQiLCJjb250cmFjdHMiLCJhZGRyZXNzIiwibWVzc2FnZUNhbGwiLCJ0eXBlIiwiRVRyYW5zYWN0aW9uVHlwZSIsImRlcGxveSIsIm1lc3NhZ2VjYWxsIiwiYW1vdW50IiwiZ2V0Tm9uY2UiLCJtYWtlVHJhbnNhY3Rpb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFDQTs7QUFDQTs7QUFFQTs7Ozs7Ozs7Ozs7O0lBWXFCQSxROzs7QUFHbkIsb0JBQVlDLEVBQVosRUFBK0I7QUFBQTs7QUFBQSx1Q0FGWSxFQUVaOztBQUFBOztBQUM3QixTQUFLQSxFQUFMLEdBQVVBLEVBQVY7QUFDRDs7OzsyQkFFY0MsSSxFQUFvQjtBQUNqQ0MsTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksUUFBWixFQUFzQjtBQUFFRixRQUFBQSxJQUFJLEVBQUpBO0FBQUYsT0FBdEI7QUFDQSxVQUFNRyxJQUFJLEdBQUcsS0FBS0osRUFBTCxDQUFRSyxNQUFSLENBQWVDLFdBQWYsQ0FBMkJDLElBQUksQ0FBQ0MsTUFBTCxHQUFjQyxRQUFkLEVBQTNCLENBQWI7QUFDQSxVQUFNQyxPQUFlLEdBQUdULElBQUksQ0FBQ1UsSUFBTCxDQUFVRCxPQUFsQztBQUNBLFVBQU1FLFFBQVEsR0FBRyxJQUFJQyxtQkFBSixDQUNmQyxJQUFJLENBQUNDLEtBQUwsQ0FBV0wsT0FBTyxDQUFDTSxJQUFuQixDQURlLEVBRWYsS0FBS2hCLEVBRlUsRUFHZkksSUFIZSxFQUlmSCxJQUFJLENBQUNnQixTQUpVLENBQWpCO0FBTUEsV0FBS0MsU0FBTCxDQUFlTixRQUFRLENBQUNPLE9BQXhCLElBQW1DUCxRQUFuQztBQUNEOzs7Z0NBRW1CWCxJLEVBQW9CO0FBQ3RDLFVBQU1TLE9BQW9CLEdBQUdULElBQUksQ0FBQ1UsSUFBTCxDQUFVRCxPQUF2QztBQUNBLFVBQU1FLFFBQVEsR0FBRyxLQUFLTSxTQUFMLENBQWVqQixJQUFJLENBQUNnQixTQUFwQixDQUFqQjtBQUNBTCxNQUFBQSxRQUFRLENBQUNRLFdBQVQsQ0FBcUJWLE9BQU8sQ0FBQ1csSUFBN0IsRUFBbUNYLE9BQU8sQ0FBQ0MsSUFBM0M7QUFDRDs7OzhCQUVTVixJLEVBQW9CO0FBQzVCQyxNQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxlQUFaLEVBQTZCO0FBQUVGLFFBQUFBLElBQUksRUFBSkE7QUFBRixPQUE3Qjs7QUFDQSxVQUFJQSxJQUFJLENBQUNVLElBQUwsQ0FBVVUsSUFBVixLQUFtQkMsNEJBQWlCQyxNQUF4QyxFQUFnRDtBQUM5QyxhQUFLQSxNQUFMLENBQVl0QixJQUFaO0FBQ0QsT0FGRCxNQUVPLElBQUlBLElBQUksQ0FBQ1UsSUFBTCxDQUFVVSxJQUFWLEtBQW1CQyw0QkFBaUJFLFdBQXhDLEVBQXFEO0FBQzFELGFBQUtKLFdBQUwsQ0FBaUJuQixJQUFqQjtBQUNEO0FBQ0Y7OztpQ0FFWXdCLE0sRUFBZ0JULEksRUFBd0M7QUFDbkUsVUFBTUcsT0FBTyxHQUFHLGtCQUFPLEtBQUtuQixFQUFMLENBQVFtQixPQUFSLEdBQWtCLEtBQUtuQixFQUFMLENBQVEwQixRQUFSLEVBQXpCLENBQWhCO0FBQ0EsVUFBTWhCLE9BQWUsR0FBRztBQUFFTSxRQUFBQSxJQUFJLEVBQUpBLElBQUY7QUFBUUcsUUFBQUEsT0FBTyxFQUFQQTtBQUFSLE9BQXhCO0FBQ0EsVUFBTVIsSUFBc0IsR0FBRztBQUFFVSxRQUFBQSxJQUFJLEVBQUVDLDRCQUFpQkMsTUFBekI7QUFBaUNiLFFBQUFBLE9BQU8sRUFBUEE7QUFBakMsT0FBL0I7QUFDQSxhQUFPLEtBQUtWLEVBQUwsQ0FBUTJCLGVBQVIsQ0FBd0JSLE9BQXhCLEVBQWlDTSxNQUFqQyxFQUF5Q2QsSUFBekMsQ0FBUDtBQUNEOzs7b0NBRWVRLE8sRUFBaUJNLE0sRUFBZ0JmLE8sRUFBc0I7QUFDckUsVUFBTUMsSUFBc0IsR0FBRztBQUM3QlUsUUFBQUEsSUFBSSxFQUFFQyw0QkFBaUJFLFdBRE07QUFFN0JkLFFBQUFBLE9BQU8sRUFBUEE7QUFGNkIsT0FBL0I7QUFJQSxhQUFPLEtBQUtWLEVBQUwsQ0FBUTJCLGVBQVIsQ0FBd0JSLE9BQXhCLEVBQWlDTSxNQUFqQyxFQUF5Q2QsSUFBekMsQ0FBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSVRyYW5zYWN0aW9uLCBJVHJhbnNhY3Rpb25EYXRhIH0gZnJvbSBcIi4uL2Jsb2NrY2hhaW4vYmxvY2tjaGFpblwiO1xuaW1wb3J0IHsgRVRyYW5zYWN0aW9uVHlwZSB9IGZyb20gXCIuLi9ibG9ja2NoYWluL2ludGVyZmFjZVwiO1xuaW1wb3J0IENvbnRyYWN0Vk0gZnJvbSBcIi4vY29udHJhY3RWTVwiO1xuaW1wb3J0IEJsb2NrQ2hhaW5BcHAgZnJvbSBcIi4uL2Jsb2NrY2hhaW4vYmxvY2tjaGFpbkFwcFwiO1xuaW1wb3J0IHNoYTI1NiBmcm9tIFwic2hhMjU2XCI7XG5cbmludGVyZmFjZSBEZXBsb3kge1xuICBjb2RlOiBzdHJpbmc7XG4gIGFkZHJlc3M6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIE1lc3NhZ2VDYWxsIHtcbiAgdHlwZTogc3RyaW5nO1xuICBkYXRhOiBvYmplY3Q7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbnRyYWN0IHtcbiAgY29udHJhY3RzOiB7IFtrZXk6IHN0cmluZ106IENvbnRyYWN0Vk0gfSA9IHt9O1xuICBiYzogQmxvY2tDaGFpbkFwcDtcbiAgY29uc3RydWN0b3IoYmM6IEJsb2NrQ2hhaW5BcHApIHtcbiAgICB0aGlzLmJjID0gYmM7XG4gIH1cblxuICBwcml2YXRlIGRlcGxveSh0cmFuOiBJVHJhbnNhY3Rpb24pIHtcbiAgICBjb25zb2xlLmxvZyhcImRlcGxveVwiLCB7IHRyYW4gfSk7XG4gICAgY29uc3Qgc2lnbiA9IHRoaXMuYmMuY3lwaGVyLnNpZ25NZXNzYWdlKE1hdGgucmFuZG9tKCkudG9TdHJpbmcoKSk7XG4gICAgY29uc3QgcGF5bG9hZDogRGVwbG95ID0gdHJhbi5kYXRhLnBheWxvYWQ7XG4gICAgY29uc3QgY29udHJhY3QgPSBuZXcgQ29udHJhY3RWTShcbiAgICAgIEpTT04ucGFyc2UocGF5bG9hZC5jb2RlKSxcbiAgICAgIHRoaXMuYmMsXG4gICAgICBzaWduLFxuICAgICAgdHJhbi5yZWNpcGllbnRcbiAgICApO1xuICAgIHRoaXMuY29udHJhY3RzW2NvbnRyYWN0LmFkZHJlc3NdID0gY29udHJhY3Q7XG4gIH1cblxuICBwcml2YXRlIG1lc3NhZ2VDYWxsKHRyYW46IElUcmFuc2FjdGlvbikge1xuICAgIGNvbnN0IHBheWxvYWQ6IE1lc3NhZ2VDYWxsID0gdHJhbi5kYXRhLnBheWxvYWQ7XG4gICAgY29uc3QgY29udHJhY3QgPSB0aGlzLmNvbnRyYWN0c1t0cmFuLnJlY2lwaWVudF07XG4gICAgY29udHJhY3QubWVzc2FnZUNhbGwocGF5bG9hZC50eXBlLCBwYXlsb2FkLmRhdGEpO1xuICB9XG5cbiAgcmVzcG9uZGVyKHRyYW46IElUcmFuc2FjdGlvbikge1xuICAgIGNvbnNvbGUubG9nKFwiY29udHJhY3RzIHJlc1wiLCB7IHRyYW4gfSk7XG4gICAgaWYgKHRyYW4uZGF0YS50eXBlID09PSBFVHJhbnNhY3Rpb25UeXBlLmRlcGxveSkge1xuICAgICAgdGhpcy5kZXBsb3kodHJhbik7XG4gICAgfSBlbHNlIGlmICh0cmFuLmRhdGEudHlwZSA9PT0gRVRyYW5zYWN0aW9uVHlwZS5tZXNzYWdlY2FsbCkge1xuICAgICAgdGhpcy5tZXNzYWdlQ2FsbCh0cmFuKTtcbiAgICB9XG4gIH1cblxuICBtYWtlQ29udHJhY3QoYW1vdW50OiBudW1iZXIsIGNvZGU6IHN0cmluZyk6IElUcmFuc2FjdGlvbiB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgYWRkcmVzcyA9IHNoYTI1Nih0aGlzLmJjLmFkZHJlc3MgKyB0aGlzLmJjLmdldE5vbmNlKCkpO1xuICAgIGNvbnN0IHBheWxvYWQ6IERlcGxveSA9IHsgY29kZSwgYWRkcmVzcyB9O1xuICAgIGNvbnN0IGRhdGE6IElUcmFuc2FjdGlvbkRhdGEgPSB7IHR5cGU6IEVUcmFuc2FjdGlvblR5cGUuZGVwbG95LCBwYXlsb2FkIH07XG4gICAgcmV0dXJuIHRoaXMuYmMubWFrZVRyYW5zYWN0aW9uKGFkZHJlc3MsIGFtb3VudCwgZGF0YSk7XG4gIH1cblxuICBtYWtlTWVzc2FnZUNhbGwoYWRkcmVzczogc3RyaW5nLCBhbW91bnQ6IG51bWJlciwgcGF5bG9hZDogTWVzc2FnZUNhbGwpIHtcbiAgICBjb25zdCBkYXRhOiBJVHJhbnNhY3Rpb25EYXRhID0ge1xuICAgICAgdHlwZTogRVRyYW5zYWN0aW9uVHlwZS5tZXNzYWdlY2FsbCxcbiAgICAgIHBheWxvYWRcbiAgICB9O1xuICAgIHJldHVybiB0aGlzLmJjLm1ha2VUcmFuc2FjdGlvbihhZGRyZXNzLCBhbW91bnQsIGRhdGEpO1xuICB9XG59XG4iXX0=