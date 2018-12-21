import { bufferToHex, hexToBuffer } from "../../blockchain/crypto/buffer";

const sss = require("shamirs-secret-sharing");

export const sssSplit = (raw: string, shares: number, threshold: number) => {
  const shareKeys: any[] = sss.split(Buffer.from(raw), {
    shares,
    threshold
  });
  return shareKeys.map(key => bufferToHex(key));
};

export const sssCombine = (shares: string[]) => {
  return sss.combine(shares.map(share => hexToBuffer(share))).toString();
};

export default { sssSplit, sssCombine };
