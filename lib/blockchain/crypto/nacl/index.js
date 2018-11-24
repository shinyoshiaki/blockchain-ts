"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line no-let
let lib;
try {
    if (process.env.NACL_FAST === 'disable') {
        throw new Error('Use tweetnacl');
    }
    // Require used for conditional importing
    // tslint:disable-next-line no-var-requires no-require-imports
    lib = require('./fast');
}
catch (err) {
    process.env.NACL_FAST = 'disable';
    // tslint:disable-next-line no-var-requires no-require-imports
    lib = require('./slow');
}
exports.NACL_SIGN_PUBLICKEY_LENGTH = 32;
exports.NACL_SIGN_SIGNATURE_LENGTH = 64;
exports.box = lib.box, exports.openBox = lib.openBox, exports.signDetached = lib.signDetached, exports.verifyDetached = lib.verifyDetached, exports.getRandomBytes = lib.getRandomBytes, exports.getKeyPair = lib.getKeyPair;
//# sourceMappingURL=index.js.map