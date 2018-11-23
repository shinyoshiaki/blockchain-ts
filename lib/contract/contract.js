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
      var payload = tran.data.payload;
      var contract = new _contractVM.default(tran.recipient, payload.code);
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
        code: code
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250cmFjdC9jb250cmFjdC50cyJdLCJuYW1lcyI6WyJDb250cmFjdCIsImJjIiwidHJhbiIsInBheWxvYWQiLCJkYXRhIiwiY29udHJhY3QiLCJDb250cmFjdFZNIiwicmVjaXBpZW50IiwiY29kZSIsImNvbnRyYWN0cyIsImFkZHJlc3MiLCJtZXNzYWdlQ2FsbCIsInR5cGUiLCJFVHJhbnNhY3Rpb25UeXBlIiwiZGVwbG95IiwibWVzc2FnZWNhbGwiLCJhbW91bnQiLCJnZXROb25jZSIsIm1ha2VUcmFuc2FjdGlvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNBOztBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7SUFXcUJBLFE7OztBQUduQixvQkFBWUMsRUFBWixFQUErQjtBQUFBOztBQUFBLHVDQUZZLEVBRVo7O0FBQUE7O0FBQzdCLFNBQUtBLEVBQUwsR0FBVUEsRUFBVjtBQUNEOzs7OzJCQUVjQyxJLEVBQW9CO0FBQ2pDLFVBQU1DLE9BQWUsR0FBR0QsSUFBSSxDQUFDRSxJQUFMLENBQVVELE9BQWxDO0FBQ0EsVUFBTUUsUUFBUSxHQUFHLElBQUlDLG1CQUFKLENBQWVKLElBQUksQ0FBQ0ssU0FBcEIsRUFBK0JKLE9BQU8sQ0FBQ0ssSUFBdkMsQ0FBakI7QUFDQSxXQUFLQyxTQUFMLENBQWVKLFFBQVEsQ0FBQ0ssT0FBeEIsSUFBbUNMLFFBQW5DO0FBQ0Q7OztnQ0FFbUJILEksRUFBb0I7QUFDdEMsVUFBTUMsT0FBb0IsR0FBR0QsSUFBSSxDQUFDRSxJQUFMLENBQVVELE9BQXZDO0FBQ0EsVUFBTUUsUUFBUSxHQUFHLEtBQUtJLFNBQUwsQ0FBZVAsSUFBSSxDQUFDSyxTQUFwQixDQUFqQjtBQUNBRixNQUFBQSxRQUFRLENBQUNNLFdBQVQsQ0FBcUJSLE9BQU8sQ0FBQ1MsSUFBN0IsRUFBbUNULE9BQU8sQ0FBQ0MsSUFBM0M7QUFDRDs7OzhCQUVTRixJLEVBQW9CO0FBQzVCLFVBQUlBLElBQUksQ0FBQ0UsSUFBTCxDQUFVUSxJQUFWLEtBQW1CQyw0QkFBaUJDLE1BQXhDLEVBQWdEO0FBQzlDLGFBQUtBLE1BQUwsQ0FBWVosSUFBWjtBQUNELE9BRkQsTUFFTyxJQUFJQSxJQUFJLENBQUNFLElBQUwsQ0FBVVEsSUFBVixLQUFtQkMsNEJBQWlCRSxXQUF4QyxFQUFxRDtBQUMxRCxhQUFLSixXQUFMLENBQWlCVCxJQUFqQjtBQUNEO0FBQ0Y7OztpQ0FFWWMsTSxFQUFnQlIsSSxFQUFjO0FBQ3pDLFVBQU1FLE9BQU8sR0FBRyxrQkFBTyxLQUFLVCxFQUFMLENBQVFTLE9BQVIsR0FBa0IsS0FBS1QsRUFBTCxDQUFRZ0IsUUFBUixFQUF6QixDQUFoQjtBQUNBLFVBQU1kLE9BQWUsR0FBRztBQUFFSyxRQUFBQSxJQUFJLEVBQUpBO0FBQUYsT0FBeEI7QUFDQSxVQUFNSixJQUFzQixHQUFHO0FBQUVRLFFBQUFBLElBQUksRUFBRUMsNEJBQWlCQyxNQUF6QjtBQUFpQ1gsUUFBQUEsT0FBTyxFQUFQQTtBQUFqQyxPQUEvQjtBQUNBLGFBQU8sS0FBS0YsRUFBTCxDQUFRaUIsZUFBUixDQUF3QlIsT0FBeEIsRUFBaUNNLE1BQWpDLEVBQXlDWixJQUF6QyxDQUFQO0FBQ0Q7OztvQ0FFZU0sTyxFQUFpQk0sTSxFQUFnQmIsTyxFQUFzQjtBQUNyRSxVQUFNQyxJQUFzQixHQUFHO0FBQzdCUSxRQUFBQSxJQUFJLEVBQUVDLDRCQUFpQkUsV0FETTtBQUU3QlosUUFBQUEsT0FBTyxFQUFQQTtBQUY2QixPQUEvQjtBQUlBLGFBQU8sS0FBS0YsRUFBTCxDQUFRaUIsZUFBUixDQUF3QlIsT0FBeEIsRUFBaUNNLE1BQWpDLEVBQXlDWixJQUF6QyxDQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJVHJhbnNhY3Rpb24sIElUcmFuc2FjdGlvbkRhdGEgfSBmcm9tIFwiLi4vYmxvY2tjaGFpbi9ibG9ja2NoYWluXCI7XG5pbXBvcnQgeyBFVHJhbnNhY3Rpb25UeXBlIH0gZnJvbSBcIi4uL2Jsb2NrY2hhaW4vaW50ZXJmYWNlXCI7XG5pbXBvcnQgQ29udHJhY3RWTSBmcm9tIFwiLi9jb250cmFjdFZNXCI7XG5pbXBvcnQgQmxvY2tDaGFpbkFwcCBmcm9tIFwiLi4vYmxvY2tjaGFpbi9ibG9ja2NoYWluQXBwXCI7XG5pbXBvcnQgc2hhMjU2IGZyb20gXCJzaGEyNTZcIjtcblxuaW50ZXJmYWNlIERlcGxveSB7XG4gIGNvZGU6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIE1lc3NhZ2VDYWxsIHtcbiAgdHlwZTogc3RyaW5nO1xuICBkYXRhOiBvYmplY3Q7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbnRyYWN0IHtcbiAgY29udHJhY3RzOiB7IFtrZXk6IHN0cmluZ106IENvbnRyYWN0Vk0gfSA9IHt9O1xuICBiYzogQmxvY2tDaGFpbkFwcDtcbiAgY29uc3RydWN0b3IoYmM6IEJsb2NrQ2hhaW5BcHApIHtcbiAgICB0aGlzLmJjID0gYmM7XG4gIH1cblxuICBwcml2YXRlIGRlcGxveSh0cmFuOiBJVHJhbnNhY3Rpb24pIHtcbiAgICBjb25zdCBwYXlsb2FkOiBEZXBsb3kgPSB0cmFuLmRhdGEucGF5bG9hZDtcbiAgICBjb25zdCBjb250cmFjdCA9IG5ldyBDb250cmFjdFZNKHRyYW4ucmVjaXBpZW50LCBwYXlsb2FkLmNvZGUpO1xuICAgIHRoaXMuY29udHJhY3RzW2NvbnRyYWN0LmFkZHJlc3NdID0gY29udHJhY3Q7XG4gIH1cblxuICBwcml2YXRlIG1lc3NhZ2VDYWxsKHRyYW46IElUcmFuc2FjdGlvbikge1xuICAgIGNvbnN0IHBheWxvYWQ6IE1lc3NhZ2VDYWxsID0gdHJhbi5kYXRhLnBheWxvYWQ7XG4gICAgY29uc3QgY29udHJhY3QgPSB0aGlzLmNvbnRyYWN0c1t0cmFuLnJlY2lwaWVudF07XG4gICAgY29udHJhY3QubWVzc2FnZUNhbGwocGF5bG9hZC50eXBlLCBwYXlsb2FkLmRhdGEpO1xuICB9XG5cbiAgcmVzcG9uZGVyKHRyYW46IElUcmFuc2FjdGlvbikge1xuICAgIGlmICh0cmFuLmRhdGEudHlwZSA9PT0gRVRyYW5zYWN0aW9uVHlwZS5kZXBsb3kpIHtcbiAgICAgIHRoaXMuZGVwbG95KHRyYW4pO1xuICAgIH0gZWxzZSBpZiAodHJhbi5kYXRhLnR5cGUgPT09IEVUcmFuc2FjdGlvblR5cGUubWVzc2FnZWNhbGwpIHtcbiAgICAgIHRoaXMubWVzc2FnZUNhbGwodHJhbik7XG4gICAgfVxuICB9XG5cbiAgbWFrZUNvbnRyYWN0KGFtb3VudDogbnVtYmVyLCBjb2RlOiBzdHJpbmcpIHtcbiAgICBjb25zdCBhZGRyZXNzID0gc2hhMjU2KHRoaXMuYmMuYWRkcmVzcyArIHRoaXMuYmMuZ2V0Tm9uY2UoKSk7XG4gICAgY29uc3QgcGF5bG9hZDogRGVwbG95ID0geyBjb2RlIH07XG4gICAgY29uc3QgZGF0YTogSVRyYW5zYWN0aW9uRGF0YSA9IHsgdHlwZTogRVRyYW5zYWN0aW9uVHlwZS5kZXBsb3ksIHBheWxvYWQgfTtcbiAgICByZXR1cm4gdGhpcy5iYy5tYWtlVHJhbnNhY3Rpb24oYWRkcmVzcywgYW1vdW50LCBkYXRhKTtcbiAgfVxuXG4gIG1ha2VNZXNzYWdlQ2FsbChhZGRyZXNzOiBzdHJpbmcsIGFtb3VudDogbnVtYmVyLCBwYXlsb2FkOiBNZXNzYWdlQ2FsbCkge1xuICAgIGNvbnN0IGRhdGE6IElUcmFuc2FjdGlvbkRhdGEgPSB7XG4gICAgICB0eXBlOiBFVHJhbnNhY3Rpb25UeXBlLm1lc3NhZ2VjYWxsLFxuICAgICAgcGF5bG9hZFxuICAgIH07XG4gICAgcmV0dXJuIHRoaXMuYmMubWFrZVRyYW5zYWN0aW9uKGFkZHJlc3MsIGFtb3VudCwgZGF0YSk7XG4gIH1cbn1cbiJdfQ==