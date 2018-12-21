import {
  encryptMessageWithPassphrase,
  EncryptedMessageWithNonce,
  decryptMessageWithPassphrase
} from "../../blockchain/crypto/encrypt";
import {
  signMessageWithPassphrase,
  verifyMessageWithPublicKey
} from "../../blockchain/crypto/sign";
import Account from "../../blockchain/account";

export default class Cypher {
  accout: Account;
  phrase: string;

  constructor(accout: Account) {
    this.phrase = accout.phrase;
    this.accout = accout;
  }

  encrypt = (raw: string, recipientPublicKey: string) => {
    const result = encryptMessageWithPassphrase(
      raw,
      this.phrase,
      recipientPublicKey
    );
    return JSON.stringify(result);
  };

  decrypt = (encrypted: string) => {
    const json: EncryptedMessageWithNonce = JSON.parse(encrypted);
    const result = decryptMessageWithPassphrase(
      json.encryptedMessage,
      json.nonce,
      this.phrase,
      json.senderPublickey
    );
    return result;
  };

  signMessage = (seed: string) => {
    return signMessageWithPassphrase(seed, this.phrase);
  };

  verifyMessage = (message: string, publicKey: string, signature: string) => {
    return verifyMessageWithPublicKey({ message, publicKey, signature });
  };
}
