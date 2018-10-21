"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.packetFormat = packetFormat;
exports.sendFormat = sendFormat;

var _type = _interopRequireDefault(require("./type"));

var _sha = _interopRequireDefault(require("sha1"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
p2ch communication model(layer)
-------------------------------
(datalinkLayer)    <- onCommand(datalinkLayer)
network
transport
(session)    <- transaction / newblock
presen
app
*/
function packetFormat(type, data) {
  var packet = {
    layer: "networkLayer",
    type: type,
    data: data,
    date: Date.now(),
    hash: ""
  };
  packet.hash = (0, _sha.default)(JSON.stringify(packet));
  return JSON.stringify(packet);
} //transportLayer


function sendFormat(session, body) {
  return JSON.stringify({
    layer: "transport",
    transport: "blockchainApp",
    type: _type.default.BLOCKCHAIN,
    session: session,
    body: body //transaction format / board format

  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ibG9ja2NoYWluL2Zvcm1hdC50cyJdLCJuYW1lcyI6WyJwYWNrZXRGb3JtYXQiLCJ0eXBlIiwiZGF0YSIsInBhY2tldCIsImxheWVyIiwiZGF0ZSIsIkRhdGUiLCJub3ciLCJoYXNoIiwiSlNPTiIsInN0cmluZ2lmeSIsInNlbmRGb3JtYXQiLCJzZXNzaW9uIiwiYm9keSIsInRyYW5zcG9ydCIsIkJMT0NLQ0hBSU4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7OztBQVdPLFNBQVNBLFlBQVQsQ0FBc0JDLElBQXRCLEVBQW9DQyxJQUFwQyxFQUErQztBQUNwRCxNQUFJQyxNQUFNLEdBQUc7QUFDWEMsSUFBQUEsS0FBSyxFQUFFLGNBREk7QUFFWEgsSUFBQUEsSUFBSSxFQUFFQSxJQUZLO0FBR1hDLElBQUFBLElBQUksRUFBRUEsSUFISztBQUlYRyxJQUFBQSxJQUFJLEVBQUVDLElBQUksQ0FBQ0MsR0FBTCxFQUpLO0FBS1hDLElBQUFBLElBQUksRUFBRTtBQUxLLEdBQWI7QUFPQUwsRUFBQUEsTUFBTSxDQUFDSyxJQUFQLEdBQWMsa0JBQUtDLElBQUksQ0FBQ0MsU0FBTCxDQUFlUCxNQUFmLENBQUwsQ0FBZDtBQUNBLFNBQU9NLElBQUksQ0FBQ0MsU0FBTCxDQUFlUCxNQUFmLENBQVA7QUFDRCxDLENBRUQ7OztBQUNPLFNBQVNRLFVBQVQsQ0FBb0JDLE9BQXBCLEVBQXFDQyxJQUFyQyxFQUFnRDtBQUNyRCxTQUFPSixJQUFJLENBQUNDLFNBQUwsQ0FBZTtBQUNwQk4sSUFBQUEsS0FBSyxFQUFFLFdBRGE7QUFFcEJVLElBQUFBLFNBQVMsRUFBRSxlQUZTO0FBR3BCYixJQUFBQSxJQUFJLEVBQUVBLGNBQUtjLFVBSFM7QUFJcEJILElBQUFBLE9BQU8sRUFBRUEsT0FKVztBQUtwQkMsSUFBQUEsSUFBSSxFQUFFQSxJQUxjLENBS1Q7O0FBTFMsR0FBZixDQUFQO0FBT0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSBmcm9tIFwiLi90eXBlXCI7XG5pbXBvcnQgc2hhMSBmcm9tIFwic2hhMVwiO1xuLypcbnAyY2ggY29tbXVuaWNhdGlvbiBtb2RlbChsYXllcilcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbihkYXRhbGlua0xheWVyKSAgICA8LSBvbkNvbW1hbmQoZGF0YWxpbmtMYXllcilcbm5ldHdvcmtcbnRyYW5zcG9ydFxuKHNlc3Npb24pICAgIDwtIHRyYW5zYWN0aW9uIC8gbmV3YmxvY2tcbnByZXNlblxuYXBwXG4qL1xuXG5leHBvcnQgZnVuY3Rpb24gcGFja2V0Rm9ybWF0KHR5cGU6IHN0cmluZywgZGF0YTogYW55KSB7XG4gIGxldCBwYWNrZXQgPSB7XG4gICAgbGF5ZXI6IFwibmV0d29ya0xheWVyXCIsXG4gICAgdHlwZTogdHlwZSxcbiAgICBkYXRhOiBkYXRhLFxuICAgIGRhdGU6IERhdGUubm93KCksXG4gICAgaGFzaDogXCJcIlxuICB9O1xuICBwYWNrZXQuaGFzaCA9IHNoYTEoSlNPTi5zdHJpbmdpZnkocGFja2V0KSk7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShwYWNrZXQpO1xufVxuXG4vL3RyYW5zcG9ydExheWVyXG5leHBvcnQgZnVuY3Rpb24gc2VuZEZvcm1hdChzZXNzaW9uOiBzdHJpbmcsIGJvZHk6IGFueSkge1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoe1xuICAgIGxheWVyOiBcInRyYW5zcG9ydFwiLFxuICAgIHRyYW5zcG9ydDogXCJibG9ja2NoYWluQXBwXCIsXG4gICAgdHlwZTogdHlwZS5CTE9DS0NIQUlOLFxuICAgIHNlc3Npb246IHNlc3Npb24sXG4gICAgYm9keTogYm9keSAvL3RyYW5zYWN0aW9uIGZvcm1hdCAvIGJvYXJkIGZvcm1hdFxuICB9KTtcbn1cbiJdfQ==