declare module "bitcore-mnemonic" {
  interface Mnemonic {
    new (v?: any): Mnemonic;
    toHDPrivateKey(
      pass: string,
      network: string
    ): {
      derive: (
        v: any
      ) => { toString: () => string; hdPublicKey: { toString: () => string } };
      toString: () => string;
    };
    toString: () => string;
    Words: any;
  }
  const Mnemonic: Mnemonic;
  export default Mnemonic;
}
