import type from "./type";
import sha1 from "sha1";
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

export function packetFormat(type: string, data: any) {
  let packet = {
    layer: "networkLayer",
    type: type,
    data: data,
    date: Date.now(),
    hash: ""
  };
  packet.hash = sha1(JSON.stringify(packet));
  return JSON.stringify(packet);
}

//transportLayer
export function sendFormat(session: string, body: any) {
  return JSON.stringify({
    layer: "transport",
    transport: "blockchainApp",
    type: type.BLOCKCHAIN,
    session: session,
    body: body //transaction format / board format
  });
}
