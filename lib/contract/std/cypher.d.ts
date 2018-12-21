import Account from "../../blockchain/account";
export default class Cypher {
    accout: Account;
    phrase: string;
    constructor(accout: Account);
    encrypt: (raw: string, recipientPublicKey: string) => string;
    decrypt: (encrypted: string) => string;
    signMessage: (seed: string) => import("../../blockchain/crypto/sign").SignedMessageWithOnePassphrase;
    verifyMessage: (message: string, publicKey: string, signature: string) => boolean;
}
