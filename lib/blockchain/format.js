"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const type_1 = __importDefault(require("./type"));
const sha1_1 = __importDefault(require("sha1"));
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
    let packet = {
        layer: "networkLayer",
        type: type,
        data: data,
        date: Date.now(),
        hash: ""
    };
    packet.hash = sha1_1.default(JSON.stringify(packet));
    return JSON.stringify(packet);
}
exports.packetFormat = packetFormat;
//transportLayer
function sendFormat(session, body) {
    return JSON.stringify({
        layer: "transport",
        transport: "blockchainApp",
        type: type_1.default.BLOCKCHAIN,
        session: session,
        body: body //transaction format / board format
    });
}
exports.sendFormat = sendFormat;
//# sourceMappingURL=format.js.map