"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const hash_1 = require("./hash");
const nacl_1 = require("./nacl");
exports.getPrivateAndPublicKeyBytesFromPassphrase = (passphrase) => {
    const hashed = hash_1.hash(passphrase, 'utf8');
    const { publicKeyBytes, privateKeyBytes } = nacl_1.getKeyPair(hashed);
    return {
        privateKeyBytes,
        publicKeyBytes,
    };
};
//# sourceMappingURL=keys.js.map