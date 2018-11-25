/*
 * Copyright © 2018 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */

import { hash } from "./hash";
import { getKeyPair } from "./nacl";
import mnemonic from "bitcore-mnemonic";

export interface KeypairBytes {
  readonly privateKeyBytes: Buffer;
  readonly publicKeyBytes: Buffer;
}

export const getPrivateAndPublicKeyBytesFromPassphrase = (
  passphrase: string
): KeypairBytes => {
  const hashed = hash(passphrase, "utf8");
  const { publicKeyBytes, privateKeyBytes } = getKeyPair(hashed);

  return {
    privateKeyBytes,
    publicKeyBytes
  };
};

export const isValidPassphrase = (passphrase: string) => {
  const normalizedValue = passphrase.replace(/ +/g, " ").trim();
  let isValid;
  try {
    isValid =
      normalizedValue.split(" ").length >= 12 &&
      mnemonic.isValid(normalizedValue);
  } catch (e) {
    // If the mnemonic check throws an error, we assume that the
    // passphrase being entered isn't valid
    isValid = false;
  }
  return isValid;
};
