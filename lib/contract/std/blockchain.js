"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _interface = require("../../blockchain/interface");

var _util = require("../../util");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ContractBlockchain =
/*#__PURE__*/
function () {
  function ContractBlockchain(bc) {
    var _this = this;

    _classCallCheck(this, ContractBlockchain);

    _defineProperty(this, "bc", void 0);

    _defineProperty(this, "makeTransaction", function (recipent, amount, payload) {
      var data = {
        type: _interface.ETransactionType.transaction,
        payload: payload
      };

      var tran = _this.bc.makeTransaction(recipent, amount, data);

      if (!tran) {
        console.log("unvalid transaction");
        return;
      }

      if (_this.isExistTransaction(tran)) {
        console.log("transaction exist", tran);
        return;
      }

      return JSON.stringify(tran);
    });

    _defineProperty(this, "transfer", function (tran) {
      if (!tran) {
        console.log("unvalid transaction");
        return;
      }

      if (_this.isExistTransaction(tran)) {
        console.log("transaction exist");
        return;
      }

      (0, _util.excuteEvent)(_this.bc.events.onMadeTransaction, tran);
    });

    this.bc = bc;
  }

  _createClass(ContractBlockchain, [{
    key: "isExistTransaction",
    value: function isExistTransaction(tran) {
      var transactions = this.bc.getAllTransactions();
      var exist = transactions.filter(function (transaction) {
        if (transaction) {
          return transaction.sign === tran.sign;
        }
      });
      console.log(JSON.stringify(exist[0]));
      if (exist.length > 0) return true;else return false;
    }
  }]);

  return ContractBlockchain;
}();

exports.default = ContractBlockchain;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cmFjdC9zdGQvYmxvY2tjaGFpbi50cyJdLCJuYW1lcyI6WyJDb250cmFjdEJsb2NrY2hhaW4iLCJiYyIsInJlY2lwZW50IiwiYW1vdW50IiwicGF5bG9hZCIsImRhdGEiLCJ0eXBlIiwiRVRyYW5zYWN0aW9uVHlwZSIsInRyYW5zYWN0aW9uIiwidHJhbiIsIm1ha2VUcmFuc2FjdGlvbiIsImNvbnNvbGUiLCJsb2ciLCJpc0V4aXN0VHJhbnNhY3Rpb24iLCJKU09OIiwic3RyaW5naWZ5IiwiZXZlbnRzIiwib25NYWRlVHJhbnNhY3Rpb24iLCJ0cmFuc2FjdGlvbnMiLCJnZXRBbGxUcmFuc2FjdGlvbnMiLCJleGlzdCIsImZpbHRlciIsInNpZ24iLCJsZW5ndGgiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFNQTs7QUFDQTs7Ozs7Ozs7OztJQUVxQkEsa0I7OztBQUVuQiw4QkFBWUMsRUFBWixFQUErQjtBQUFBOztBQUFBOztBQUFBOztBQUFBLDZDQWdCYixVQUFDQyxRQUFELEVBQW1CQyxNQUFuQixFQUFtQ0MsT0FBbkMsRUFBb0Q7QUFDcEUsVUFBTUMsSUFBc0IsR0FBRztBQUM3QkMsUUFBQUEsSUFBSSxFQUFFQyw0QkFBaUJDLFdBRE07QUFFN0JKLFFBQUFBLE9BQU8sRUFBUEE7QUFGNkIsT0FBL0I7O0FBSUEsVUFBTUssSUFBSSxHQUFHLEtBQUksQ0FBQ1IsRUFBTCxDQUFRUyxlQUFSLENBQXdCUixRQUF4QixFQUFrQ0MsTUFBbEMsRUFBMENFLElBQTFDLENBQWI7O0FBQ0EsVUFBSSxDQUFDSSxJQUFMLEVBQVc7QUFDVEUsUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVkscUJBQVo7QUFDQTtBQUNEOztBQUNELFVBQUksS0FBSSxDQUFDQyxrQkFBTCxDQUF3QkosSUFBeEIsQ0FBSixFQUFtQztBQUNqQ0UsUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksbUJBQVosRUFBaUNILElBQWpDO0FBQ0E7QUFDRDs7QUFDRCxhQUFPSyxJQUFJLENBQUNDLFNBQUwsQ0FBZU4sSUFBZixDQUFQO0FBQ0QsS0EvQjhCOztBQUFBLHNDQWlDcEIsVUFBQ0EsSUFBRCxFQUFlO0FBQ3hCLFVBQUksQ0FBQ0EsSUFBTCxFQUFXO0FBQ1RFLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLHFCQUFaO0FBQ0E7QUFDRDs7QUFDRCxVQUFJLEtBQUksQ0FBQ0Msa0JBQUwsQ0FBd0JKLElBQXhCLENBQUosRUFBbUM7QUFDakNFLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLG1CQUFaO0FBQ0E7QUFDRDs7QUFDRCw2QkFBWSxLQUFJLENBQUNYLEVBQUwsQ0FBUWUsTUFBUixDQUFlQyxpQkFBM0IsRUFBOENSLElBQTlDO0FBQ0QsS0EzQzhCOztBQUM3QixTQUFLUixFQUFMLEdBQVVBLEVBQVY7QUFDRDs7Ozt1Q0FFMEJRLEksRUFBNkI7QUFDdEQsVUFBTVMsWUFBWSxHQUFHLEtBQUtqQixFQUFMLENBQVFrQixrQkFBUixFQUFyQjtBQUNBLFVBQU1DLEtBQUssR0FBR0YsWUFBWSxDQUFDRyxNQUFiLENBQW9CLFVBQUFiLFdBQVcsRUFBSTtBQUMvQyxZQUFJQSxXQUFKLEVBQWlCO0FBQ2YsaUJBQU9BLFdBQVcsQ0FBQ2MsSUFBWixLQUFxQmIsSUFBSSxDQUFDYSxJQUFqQztBQUNEO0FBQ0YsT0FKYSxDQUFkO0FBS0FYLE1BQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZRSxJQUFJLENBQUNDLFNBQUwsQ0FBZUssS0FBSyxDQUFDLENBQUQsQ0FBcEIsQ0FBWjtBQUNBLFVBQUlBLEtBQUssQ0FBQ0csTUFBTixHQUFlLENBQW5CLEVBQXNCLE9BQU8sSUFBUCxDQUF0QixLQUNLLE9BQU8sS0FBUDtBQUNOIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEJsb2NrQ2hhaW5BcHAgZnJvbSBcIi4uLy4uL2Jsb2NrY2hhaW4vYmxvY2tjaGFpbkFwcFwiO1xuaW1wb3J0IHtcbiAgSVRyYW5zYWN0aW9uRGF0YSxcbiAgSVRyYW5zYWN0aW9uLFxuICBqc29uU3RyXG59IGZyb20gXCIuLi8uLi9ibG9ja2NoYWluL2Jsb2NrY2hhaW5cIjtcbmltcG9ydCB7IEVUcmFuc2FjdGlvblR5cGUgfSBmcm9tIFwiLi4vLi4vYmxvY2tjaGFpbi9pbnRlcmZhY2VcIjtcbmltcG9ydCB7IGV4Y3V0ZUV2ZW50IH0gZnJvbSBcIi4uLy4uL3V0aWxcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29udHJhY3RCbG9ja2NoYWluIHtcbiAgYmM6IEJsb2NrQ2hhaW5BcHA7XG4gIGNvbnN0cnVjdG9yKGJjOiBCbG9ja0NoYWluQXBwKSB7XG4gICAgdGhpcy5iYyA9IGJjO1xuICB9XG5cbiAgcHJpdmF0ZSBpc0V4aXN0VHJhbnNhY3Rpb24odHJhbjogSVRyYW5zYWN0aW9uKTogYm9vbGVhbiB7XG4gICAgY29uc3QgdHJhbnNhY3Rpb25zID0gdGhpcy5iYy5nZXRBbGxUcmFuc2FjdGlvbnMoKTtcbiAgICBjb25zdCBleGlzdCA9IHRyYW5zYWN0aW9ucy5maWx0ZXIodHJhbnNhY3Rpb24gPT4ge1xuICAgICAgaWYgKHRyYW5zYWN0aW9uKSB7XG4gICAgICAgIHJldHVybiB0cmFuc2FjdGlvbi5zaWduID09PSB0cmFuLnNpZ247XG4gICAgICB9XG4gICAgfSk7XG4gICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoZXhpc3RbMF0pKTtcbiAgICBpZiAoZXhpc3QubGVuZ3RoID4gMCkgcmV0dXJuIHRydWU7XG4gICAgZWxzZSByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBtYWtlVHJhbnNhY3Rpb24gPSAocmVjaXBlbnQ6IHN0cmluZywgYW1vdW50OiBudW1iZXIsIHBheWxvYWQ6IGFueSkgPT4ge1xuICAgIGNvbnN0IGRhdGE6IElUcmFuc2FjdGlvbkRhdGEgPSB7XG4gICAgICB0eXBlOiBFVHJhbnNhY3Rpb25UeXBlLnRyYW5zYWN0aW9uLFxuICAgICAgcGF5bG9hZFxuICAgIH07XG4gICAgY29uc3QgdHJhbiA9IHRoaXMuYmMubWFrZVRyYW5zYWN0aW9uKHJlY2lwZW50LCBhbW91bnQsIGRhdGEpO1xuICAgIGlmICghdHJhbikge1xuICAgICAgY29uc29sZS5sb2coXCJ1bnZhbGlkIHRyYW5zYWN0aW9uXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5pc0V4aXN0VHJhbnNhY3Rpb24odHJhbikpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwidHJhbnNhY3Rpb24gZXhpc3RcIiwgdHJhbik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0cmFuKTtcbiAgfTtcblxuICB0cmFuc2ZlciA9ICh0cmFuOiBhbnkpID0+IHtcbiAgICBpZiAoIXRyYW4pIHtcbiAgICAgIGNvbnNvbGUubG9nKFwidW52YWxpZCB0cmFuc2FjdGlvblwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMuaXNFeGlzdFRyYW5zYWN0aW9uKHRyYW4pKSB7XG4gICAgICBjb25zb2xlLmxvZyhcInRyYW5zYWN0aW9uIGV4aXN0XCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBleGN1dGVFdmVudCh0aGlzLmJjLmV2ZW50cy5vbk1hZGVUcmFuc2FjdGlvbiwgdHJhbik7XG4gIH07XG59XG4iXX0=