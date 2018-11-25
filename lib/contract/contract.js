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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250cmFjdC9jb250cmFjdC50cyJdLCJuYW1lcyI6WyJDb250cmFjdCIsImJjIiwidHJhbiIsInNpZ24iLCJKU09OIiwic3RyaW5naWZ5IiwiY3lwaGVyIiwic2lnbk1lc3NhZ2UiLCJNYXRoIiwicmFuZG9tIiwidG9TdHJpbmciLCJwYXlsb2FkIiwiZGF0YSIsImNvbnRyYWN0IiwiQ29udHJhY3RWTSIsInJlY2lwaWVudCIsImNvZGUiLCJwdWJLZXkiLCJjb250cmFjdHMiLCJhZGRyZXNzIiwibWVzc2FnZUNhbGwiLCJ0eXBlIiwiRVRyYW5zYWN0aW9uVHlwZSIsImRlcGxveSIsIm1lc3NhZ2VjYWxsIiwiYW1vdW50IiwiZ2V0Tm9uY2UiLCJtYWtlVHJhbnNhY3Rpb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFDQTs7QUFDQTs7QUFFQTs7Ozs7Ozs7Ozs7O0lBWXFCQSxROzs7QUFHbkIsb0JBQVlDLEVBQVosRUFBK0I7QUFBQTs7QUFBQSx1Q0FGWSxFQUVaOztBQUFBOztBQUM3QixTQUFLQSxFQUFMLEdBQVVBLEVBQVY7QUFDRDs7OzsyQkFFY0MsSSxFQUFvQjtBQUNqQyxVQUFNQyxJQUFJLEdBQUdDLElBQUksQ0FBQ0MsU0FBTCxDQUNYLEtBQUtKLEVBQUwsQ0FBUUssTUFBUixDQUFlQyxXQUFmLENBQTJCQyxJQUFJLENBQUNDLE1BQUwsR0FBY0MsUUFBZCxFQUEzQixDQURXLENBQWI7QUFJQSxVQUFNQyxPQUFlLEdBQUdULElBQUksQ0FBQ1UsSUFBTCxDQUFVRCxPQUFsQztBQUNBLFVBQU1FLFFBQVEsR0FBRyxJQUFJQyxtQkFBSixDQUNmWixJQUFJLENBQUNhLFNBRFUsRUFFZkosT0FBTyxDQUFDSyxJQUZPLEVBR2YsS0FBS2YsRUFBTCxDQUFRSyxNQUFSLENBQWVXLE1BSEEsRUFJZmQsSUFKZSxDQUFqQjtBQU1BLFdBQUtlLFNBQUwsQ0FBZUwsUUFBUSxDQUFDTSxPQUF4QixJQUFtQ04sUUFBbkM7QUFDRDs7O2dDQUVtQlgsSSxFQUFvQjtBQUN0QyxVQUFNUyxPQUFvQixHQUFHVCxJQUFJLENBQUNVLElBQUwsQ0FBVUQsT0FBdkM7QUFDQSxVQUFNRSxRQUFRLEdBQUcsS0FBS0ssU0FBTCxDQUFlaEIsSUFBSSxDQUFDYSxTQUFwQixDQUFqQjtBQUNBRixNQUFBQSxRQUFRLENBQUNPLFdBQVQsQ0FBcUJULE9BQU8sQ0FBQ1UsSUFBN0IsRUFBbUNWLE9BQU8sQ0FBQ0MsSUFBM0M7QUFDRDs7OzhCQUVTVixJLEVBQW9CO0FBQzVCLFVBQUlBLElBQUksQ0FBQ1UsSUFBTCxDQUFVUyxJQUFWLEtBQW1CQyw0QkFBaUJDLE1BQXhDLEVBQWdEO0FBQzlDLGFBQUtBLE1BQUwsQ0FBWXJCLElBQVo7QUFDRCxPQUZELE1BRU8sSUFBSUEsSUFBSSxDQUFDVSxJQUFMLENBQVVTLElBQVYsS0FBbUJDLDRCQUFpQkUsV0FBeEMsRUFBcUQ7QUFDMUQsYUFBS0osV0FBTCxDQUFpQmxCLElBQWpCO0FBQ0Q7QUFDRjs7O2lDQUVZdUIsTSxFQUFnQlQsSSxFQUFjO0FBQ3pDLFVBQU1HLE9BQU8sR0FBRyxrQkFBTyxLQUFLbEIsRUFBTCxDQUFRa0IsT0FBUixHQUFrQixLQUFLbEIsRUFBTCxDQUFReUIsUUFBUixFQUF6QixDQUFoQjtBQUNBLFVBQU1mLE9BQWUsR0FBRztBQUFFSyxRQUFBQSxJQUFJLEVBQUpBLElBQUY7QUFBUUcsUUFBQUEsT0FBTyxFQUFQQTtBQUFSLE9BQXhCO0FBQ0EsVUFBTVAsSUFBc0IsR0FBRztBQUFFUyxRQUFBQSxJQUFJLEVBQUVDLDRCQUFpQkMsTUFBekI7QUFBaUNaLFFBQUFBLE9BQU8sRUFBUEE7QUFBakMsT0FBL0I7QUFDQSxhQUFPLEtBQUtWLEVBQUwsQ0FBUTBCLGVBQVIsQ0FBd0JSLE9BQXhCLEVBQWlDTSxNQUFqQyxFQUF5Q2IsSUFBekMsQ0FBUDtBQUNEOzs7b0NBRWVPLE8sRUFBaUJNLE0sRUFBZ0JkLE8sRUFBc0I7QUFDckUsVUFBTUMsSUFBc0IsR0FBRztBQUM3QlMsUUFBQUEsSUFBSSxFQUFFQyw0QkFBaUJFLFdBRE07QUFFN0JiLFFBQUFBLE9BQU8sRUFBUEE7QUFGNkIsT0FBL0I7QUFJQSxhQUFPLEtBQUtWLEVBQUwsQ0FBUTBCLGVBQVIsQ0FBd0JSLE9BQXhCLEVBQWlDTSxNQUFqQyxFQUF5Q2IsSUFBekMsQ0FBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSVRyYW5zYWN0aW9uLCBJVHJhbnNhY3Rpb25EYXRhIH0gZnJvbSBcIi4uL2Jsb2NrY2hhaW4vYmxvY2tjaGFpblwiO1xuaW1wb3J0IHsgRVRyYW5zYWN0aW9uVHlwZSB9IGZyb20gXCIuLi9ibG9ja2NoYWluL2ludGVyZmFjZVwiO1xuaW1wb3J0IENvbnRyYWN0Vk0gZnJvbSBcIi4vY29udHJhY3RWTVwiO1xuaW1wb3J0IEJsb2NrQ2hhaW5BcHAgZnJvbSBcIi4uL2Jsb2NrY2hhaW4vYmxvY2tjaGFpbkFwcFwiO1xuaW1wb3J0IHNoYTI1NiBmcm9tIFwic2hhMjU2XCI7XG5cbmludGVyZmFjZSBEZXBsb3kge1xuICBjb2RlOiBzdHJpbmc7XG4gIGFkZHJlc3M6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIE1lc3NhZ2VDYWxsIHtcbiAgdHlwZTogc3RyaW5nO1xuICBkYXRhOiBvYmplY3Q7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbnRyYWN0IHtcbiAgY29udHJhY3RzOiB7IFtrZXk6IHN0cmluZ106IENvbnRyYWN0Vk0gfSA9IHt9O1xuICBiYzogQmxvY2tDaGFpbkFwcDtcbiAgY29uc3RydWN0b3IoYmM6IEJsb2NrQ2hhaW5BcHApIHtcbiAgICB0aGlzLmJjID0gYmM7XG4gIH1cblxuICBwcml2YXRlIGRlcGxveSh0cmFuOiBJVHJhbnNhY3Rpb24pIHtcbiAgICBjb25zdCBzaWduID0gSlNPTi5zdHJpbmdpZnkoXG4gICAgICB0aGlzLmJjLmN5cGhlci5zaWduTWVzc2FnZShNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKCkpXG4gICAgKTtcblxuICAgIGNvbnN0IHBheWxvYWQ6IERlcGxveSA9IHRyYW4uZGF0YS5wYXlsb2FkO1xuICAgIGNvbnN0IGNvbnRyYWN0ID0gbmV3IENvbnRyYWN0Vk0oXG4gICAgICB0cmFuLnJlY2lwaWVudCxcbiAgICAgIHBheWxvYWQuY29kZSxcbiAgICAgIHRoaXMuYmMuY3lwaGVyLnB1YktleSxcbiAgICAgIHNpZ25cbiAgICApO1xuICAgIHRoaXMuY29udHJhY3RzW2NvbnRyYWN0LmFkZHJlc3NdID0gY29udHJhY3Q7XG4gIH1cblxuICBwcml2YXRlIG1lc3NhZ2VDYWxsKHRyYW46IElUcmFuc2FjdGlvbikge1xuICAgIGNvbnN0IHBheWxvYWQ6IE1lc3NhZ2VDYWxsID0gdHJhbi5kYXRhLnBheWxvYWQ7XG4gICAgY29uc3QgY29udHJhY3QgPSB0aGlzLmNvbnRyYWN0c1t0cmFuLnJlY2lwaWVudF07XG4gICAgY29udHJhY3QubWVzc2FnZUNhbGwocGF5bG9hZC50eXBlLCBwYXlsb2FkLmRhdGEpO1xuICB9XG5cbiAgcmVzcG9uZGVyKHRyYW46IElUcmFuc2FjdGlvbikge1xuICAgIGlmICh0cmFuLmRhdGEudHlwZSA9PT0gRVRyYW5zYWN0aW9uVHlwZS5kZXBsb3kpIHtcbiAgICAgIHRoaXMuZGVwbG95KHRyYW4pO1xuICAgIH0gZWxzZSBpZiAodHJhbi5kYXRhLnR5cGUgPT09IEVUcmFuc2FjdGlvblR5cGUubWVzc2FnZWNhbGwpIHtcbiAgICAgIHRoaXMubWVzc2FnZUNhbGwodHJhbik7XG4gICAgfVxuICB9XG5cbiAgbWFrZUNvbnRyYWN0KGFtb3VudDogbnVtYmVyLCBjb2RlOiBzdHJpbmcpIHtcbiAgICBjb25zdCBhZGRyZXNzID0gc2hhMjU2KHRoaXMuYmMuYWRkcmVzcyArIHRoaXMuYmMuZ2V0Tm9uY2UoKSk7XG4gICAgY29uc3QgcGF5bG9hZDogRGVwbG95ID0geyBjb2RlLCBhZGRyZXNzIH07XG4gICAgY29uc3QgZGF0YTogSVRyYW5zYWN0aW9uRGF0YSA9IHsgdHlwZTogRVRyYW5zYWN0aW9uVHlwZS5kZXBsb3ksIHBheWxvYWQgfTtcbiAgICByZXR1cm4gdGhpcy5iYy5tYWtlVHJhbnNhY3Rpb24oYWRkcmVzcywgYW1vdW50LCBkYXRhKTtcbiAgfVxuXG4gIG1ha2VNZXNzYWdlQ2FsbChhZGRyZXNzOiBzdHJpbmcsIGFtb3VudDogbnVtYmVyLCBwYXlsb2FkOiBNZXNzYWdlQ2FsbCkge1xuICAgIGNvbnN0IGRhdGE6IElUcmFuc2FjdGlvbkRhdGEgPSB7XG4gICAgICB0eXBlOiBFVHJhbnNhY3Rpb25UeXBlLm1lc3NhZ2VjYWxsLFxuICAgICAgcGF5bG9hZFxuICAgIH07XG4gICAgcmV0dXJuIHRoaXMuYmMubWFrZVRyYW5zYWN0aW9uKGFkZHJlc3MsIGFtb3VudCwgZGF0YSk7XG4gIH1cbn1cbiJdfQ==