import Mnemonic from "bitcore-mnemonic";
import { getPrivateAndPublicKeyBytesFromPassphrase } from "./crypto/keys";
import { bufferToHex } from "./crypto/buffer";

export default class Account {
  mnemonic: Mnemonic;
  secKey: string;
  pubKey: string;
  phrase: string;
  constructor(phrase?: string) {
    if (phrase) {
      this.mnemonic = new Mnemonic(phrase);
      this.phrase = phrase;
    } else {
      this.mnemonic = new Mnemonic();
      this.phrase = this.mnemonic.toString();
    }
    const {
      privateKeyBytes,
      publicKeyBytes
    } = getPrivateAndPublicKeyBytesFromPassphrase(this.phrase);
    this.pubKey = bufferToHex(publicKeyBytes);
    this.secKey = bufferToHex(privateKeyBytes);
  }
}
