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
      var contract = new _contractVM.default(tran.recipient, payload.code, this.bc.cypher.pubKey, sign);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250cmFjdC9jb250cmFjdC50cyJdLCJuYW1lcyI6WyJDb250cmFjdCIsImJjIiwidHJhbiIsImNvbnNvbGUiLCJsb2ciLCJzaWduIiwiSlNPTiIsInN0cmluZ2lmeSIsImN5cGhlciIsInNpZ25NZXNzYWdlIiwiTWF0aCIsInJhbmRvbSIsInRvU3RyaW5nIiwicGF5bG9hZCIsImRhdGEiLCJjb250cmFjdCIsIkNvbnRyYWN0Vk0iLCJyZWNpcGllbnQiLCJjb2RlIiwicHViS2V5IiwiY29udHJhY3RzIiwiYWRkcmVzcyIsIm1lc3NhZ2VDYWxsIiwidHlwZSIsIkVUcmFuc2FjdGlvblR5cGUiLCJkZXBsb3kiLCJtZXNzYWdlY2FsbCIsImFtb3VudCIsImdldE5vbmNlIiwibWFrZVRyYW5zYWN0aW9uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQ0E7O0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7OztJQVlxQkEsUTs7O0FBR25CLG9CQUFZQyxFQUFaLEVBQStCO0FBQUE7O0FBQUEsdUNBRlksRUFFWjs7QUFBQTs7QUFDN0IsU0FBS0EsRUFBTCxHQUFVQSxFQUFWO0FBQ0Q7Ozs7MkJBRWNDLEksRUFBb0I7QUFDakNDLE1BQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLFFBQVosRUFBc0I7QUFBRUYsUUFBQUEsSUFBSSxFQUFKQTtBQUFGLE9BQXRCO0FBQ0EsVUFBTUcsSUFBSSxHQUFHQyxJQUFJLENBQUNDLFNBQUwsQ0FDWCxLQUFLTixFQUFMLENBQVFPLE1BQVIsQ0FBZUMsV0FBZixDQUEyQkMsSUFBSSxDQUFDQyxNQUFMLEdBQWNDLFFBQWQsRUFBM0IsQ0FEVyxDQUFiO0FBR0EsVUFBTUMsT0FBZSxHQUFHWCxJQUFJLENBQUNZLElBQUwsQ0FBVUQsT0FBbEM7QUFDQSxVQUFNRSxRQUFRLEdBQUcsSUFBSUMsbUJBQUosQ0FDZmQsSUFBSSxDQUFDZSxTQURVLEVBRWZKLE9BQU8sQ0FBQ0ssSUFGTyxFQUdmLEtBQUtqQixFQUFMLENBQVFPLE1BQVIsQ0FBZVcsTUFIQSxFQUlmZCxJQUplLENBQWpCO0FBTUEsV0FBS2UsU0FBTCxDQUFlTCxRQUFRLENBQUNNLE9BQXhCLElBQW1DTixRQUFuQztBQUNEOzs7Z0NBRW1CYixJLEVBQW9CO0FBQ3RDLFVBQU1XLE9BQW9CLEdBQUdYLElBQUksQ0FBQ1ksSUFBTCxDQUFVRCxPQUF2QztBQUNBLFVBQU1FLFFBQVEsR0FBRyxLQUFLSyxTQUFMLENBQWVsQixJQUFJLENBQUNlLFNBQXBCLENBQWpCO0FBQ0FGLE1BQUFBLFFBQVEsQ0FBQ08sV0FBVCxDQUFxQlQsT0FBTyxDQUFDVSxJQUE3QixFQUFtQ1YsT0FBTyxDQUFDQyxJQUEzQztBQUNEOzs7OEJBRVNaLEksRUFBb0I7QUFDNUJDLE1BQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGVBQVosRUFBNkI7QUFBRUYsUUFBQUEsSUFBSSxFQUFKQTtBQUFGLE9BQTdCOztBQUNBLFVBQUlBLElBQUksQ0FBQ1ksSUFBTCxDQUFVUyxJQUFWLEtBQW1CQyw0QkFBaUJDLE1BQXhDLEVBQWdEO0FBQzlDLGFBQUtBLE1BQUwsQ0FBWXZCLElBQVo7QUFDRCxPQUZELE1BRU8sSUFBSUEsSUFBSSxDQUFDWSxJQUFMLENBQVVTLElBQVYsS0FBbUJDLDRCQUFpQkUsV0FBeEMsRUFBcUQ7QUFDMUQsYUFBS0osV0FBTCxDQUFpQnBCLElBQWpCO0FBQ0Q7QUFDRjs7O2lDQUVZeUIsTSxFQUFnQlQsSSxFQUF3QztBQUNuRSxVQUFNRyxPQUFPLEdBQUcsa0JBQU8sS0FBS3BCLEVBQUwsQ0FBUW9CLE9BQVIsR0FBa0IsS0FBS3BCLEVBQUwsQ0FBUTJCLFFBQVIsRUFBekIsQ0FBaEI7QUFDQSxVQUFNZixPQUFlLEdBQUc7QUFBRUssUUFBQUEsSUFBSSxFQUFKQSxJQUFGO0FBQVFHLFFBQUFBLE9BQU8sRUFBUEE7QUFBUixPQUF4QjtBQUNBLFVBQU1QLElBQXNCLEdBQUc7QUFBRVMsUUFBQUEsSUFBSSxFQUFFQyw0QkFBaUJDLE1BQXpCO0FBQWlDWixRQUFBQSxPQUFPLEVBQVBBO0FBQWpDLE9BQS9CO0FBQ0EsYUFBTyxLQUFLWixFQUFMLENBQVE0QixlQUFSLENBQXdCUixPQUF4QixFQUFpQ00sTUFBakMsRUFBeUNiLElBQXpDLENBQVA7QUFDRDs7O29DQUVlTyxPLEVBQWlCTSxNLEVBQWdCZCxPLEVBQXNCO0FBQ3JFLFVBQU1DLElBQXNCLEdBQUc7QUFDN0JTLFFBQUFBLElBQUksRUFBRUMsNEJBQWlCRSxXQURNO0FBRTdCYixRQUFBQSxPQUFPLEVBQVBBO0FBRjZCLE9BQS9CO0FBSUEsYUFBTyxLQUFLWixFQUFMLENBQVE0QixlQUFSLENBQXdCUixPQUF4QixFQUFpQ00sTUFBakMsRUFBeUNiLElBQXpDLENBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElUcmFuc2FjdGlvbiwgSVRyYW5zYWN0aW9uRGF0YSB9IGZyb20gXCIuLi9ibG9ja2NoYWluL2Jsb2NrY2hhaW5cIjtcbmltcG9ydCB7IEVUcmFuc2FjdGlvblR5cGUgfSBmcm9tIFwiLi4vYmxvY2tjaGFpbi9pbnRlcmZhY2VcIjtcbmltcG9ydCBDb250cmFjdFZNIGZyb20gXCIuL2NvbnRyYWN0Vk1cIjtcbmltcG9ydCBCbG9ja0NoYWluQXBwIGZyb20gXCIuLi9ibG9ja2NoYWluL2Jsb2NrY2hhaW5BcHBcIjtcbmltcG9ydCBzaGEyNTYgZnJvbSBcInNoYTI1NlwiO1xuXG5pbnRlcmZhY2UgRGVwbG95IHtcbiAgY29kZTogc3RyaW5nO1xuICBhZGRyZXNzOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBNZXNzYWdlQ2FsbCB7XG4gIHR5cGU6IHN0cmluZztcbiAgZGF0YTogb2JqZWN0O1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb250cmFjdCB7XG4gIGNvbnRyYWN0czogeyBba2V5OiBzdHJpbmddOiBDb250cmFjdFZNIH0gPSB7fTtcbiAgYmM6IEJsb2NrQ2hhaW5BcHA7XG4gIGNvbnN0cnVjdG9yKGJjOiBCbG9ja0NoYWluQXBwKSB7XG4gICAgdGhpcy5iYyA9IGJjO1xuICB9XG5cbiAgcHJpdmF0ZSBkZXBsb3kodHJhbjogSVRyYW5zYWN0aW9uKSB7XG4gICAgY29uc29sZS5sb2coXCJkZXBsb3lcIiwgeyB0cmFuIH0pO1xuICAgIGNvbnN0IHNpZ24gPSBKU09OLnN0cmluZ2lmeShcbiAgICAgIHRoaXMuYmMuY3lwaGVyLnNpZ25NZXNzYWdlKE1hdGgucmFuZG9tKCkudG9TdHJpbmcoKSlcbiAgICApO1xuICAgIGNvbnN0IHBheWxvYWQ6IERlcGxveSA9IHRyYW4uZGF0YS5wYXlsb2FkO1xuICAgIGNvbnN0IGNvbnRyYWN0ID0gbmV3IENvbnRyYWN0Vk0oXG4gICAgICB0cmFuLnJlY2lwaWVudCxcbiAgICAgIHBheWxvYWQuY29kZSxcbiAgICAgIHRoaXMuYmMuY3lwaGVyLnB1YktleSxcbiAgICAgIHNpZ25cbiAgICApO1xuICAgIHRoaXMuY29udHJhY3RzW2NvbnRyYWN0LmFkZHJlc3NdID0gY29udHJhY3Q7XG4gIH1cblxuICBwcml2YXRlIG1lc3NhZ2VDYWxsKHRyYW46IElUcmFuc2FjdGlvbikge1xuICAgIGNvbnN0IHBheWxvYWQ6IE1lc3NhZ2VDYWxsID0gdHJhbi5kYXRhLnBheWxvYWQ7XG4gICAgY29uc3QgY29udHJhY3QgPSB0aGlzLmNvbnRyYWN0c1t0cmFuLnJlY2lwaWVudF07XG4gICAgY29udHJhY3QubWVzc2FnZUNhbGwocGF5bG9hZC50eXBlLCBwYXlsb2FkLmRhdGEpO1xuICB9XG5cbiAgcmVzcG9uZGVyKHRyYW46IElUcmFuc2FjdGlvbikge1xuICAgIGNvbnNvbGUubG9nKFwiY29udHJhY3RzIHJlc1wiLCB7IHRyYW4gfSk7XG4gICAgaWYgKHRyYW4uZGF0YS50eXBlID09PSBFVHJhbnNhY3Rpb25UeXBlLmRlcGxveSkge1xuICAgICAgdGhpcy5kZXBsb3kodHJhbik7XG4gICAgfSBlbHNlIGlmICh0cmFuLmRhdGEudHlwZSA9PT0gRVRyYW5zYWN0aW9uVHlwZS5tZXNzYWdlY2FsbCkge1xuICAgICAgdGhpcy5tZXNzYWdlQ2FsbCh0cmFuKTtcbiAgICB9XG4gIH1cblxuICBtYWtlQ29udHJhY3QoYW1vdW50OiBudW1iZXIsIGNvZGU6IHN0cmluZyk6IElUcmFuc2FjdGlvbiB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgYWRkcmVzcyA9IHNoYTI1Nih0aGlzLmJjLmFkZHJlc3MgKyB0aGlzLmJjLmdldE5vbmNlKCkpO1xuICAgIGNvbnN0IHBheWxvYWQ6IERlcGxveSA9IHsgY29kZSwgYWRkcmVzcyB9O1xuICAgIGNvbnN0IGRhdGE6IElUcmFuc2FjdGlvbkRhdGEgPSB7IHR5cGU6IEVUcmFuc2FjdGlvblR5cGUuZGVwbG95LCBwYXlsb2FkIH07XG4gICAgcmV0dXJuIHRoaXMuYmMubWFrZVRyYW5zYWN0aW9uKGFkZHJlc3MsIGFtb3VudCwgZGF0YSk7XG4gIH1cblxuICBtYWtlTWVzc2FnZUNhbGwoYWRkcmVzczogc3RyaW5nLCBhbW91bnQ6IG51bWJlciwgcGF5bG9hZDogTWVzc2FnZUNhbGwpIHtcbiAgICBjb25zdCBkYXRhOiBJVHJhbnNhY3Rpb25EYXRhID0ge1xuICAgICAgdHlwZTogRVRyYW5zYWN0aW9uVHlwZS5tZXNzYWdlY2FsbCxcbiAgICAgIHBheWxvYWRcbiAgICB9O1xuICAgIHJldHVybiB0aGlzLmJjLm1ha2VUcmFuc2FjdGlvbihhZGRyZXNzLCBhbW91bnQsIGRhdGEpO1xuICB9XG59XG4iXX0=