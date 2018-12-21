import {
  verifyMessageWithPublicKey,
  SignedMessageWithOnePassphrase
} from "../../blockchain/crypto/sign";

export const isOwner = (sign: SignedMessageWithOnePassphrase) => {
  return verifyMessageWithPublicKey(sign);
};

export default { isOwner };
