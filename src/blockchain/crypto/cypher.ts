import Mnemonic from "bitcore-mnemonic";
import { bufferToHex } from "./buffer";
import {
  signMessageWithPassphrase,
  verifyMessageWithPublicKey,
  SignedMessageWithOnePassphrase
} from "./sign";
import { getPrivateAndPublicKeyBytesFromPassphrase } from "./keys";
import {
  encryptMessageWithPassphrase,
  decryptMessageWithPassphrase,
  EncryptedMessageWithNonce
} from "./encrypt";

export default class Cypher {
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

  encrypt(raw: string, recipientPublicKey: string) {
    const result = encryptMessageWithPassphrase(
      raw,
      this.phrase,
      recipientPublicKey
    );
    return JSON.stringify(result);
  }

  decrypt(encrypted: string) {
    const json: EncryptedMessageWithNonce = JSON.parse(encrypted);
    console.log({ json });
    const result = decryptMessageWithPassphrase(
      json.encryptedMessage,
      json.nonce,
      this.phrase,
      json.senderPublickey
    );
    return result;
  }

  signMessage(raw: string) {
    const result = signMessageWithPassphrase(raw, this.phrase);
    return {
      message: result.message,
      signature: result.signature
    };
  }  
}
