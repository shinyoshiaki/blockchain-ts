import sha256 from "sha256";
import { Decimal } from "decimal.js";
import Cypher from "./cypher";
import type from "./type";
import { ETransactionType } from "./interface";

const diff = /^0000/;

export interface ITransaction {
  sender: string;
  recipient: string;
  amount: number;
  data: { type: ETransactionType; payload: any };
  now: any;
  publicKey: string;
  sign: string;
}

export default class BlockChain {
  chain: Array<any> = [];
  currentTransactions: Array<any> = [];
  cypher: Cypher;
  address: string;

  callback = {
    onAddBlock: (v?: any) => {}
  };

  private onAddBlock: { [key: string]: () => void } = {};
  private onTransaction: { [key: string]: () => void } = {};
  events = {
    onAddBlock: this.onAddBlock,
    onTransaction: this.onTransaction
  };

  constructor(secKey?: string, pubKey?: string) {
    this.cypher = new Cypher(secKey, pubKey);
    this.address = sha256(this.cypher.pubKey);
    this.newBlock(0, "genesis");
  }

  hash(obj: any) {
    const objString = JSON.stringify(obj, Object.keys(obj).sort());
    return sha256(objString);
  }

  jsonStr(obj: any) {
    return JSON.stringify(obj, Object.keys(obj).sort());
  }

  newBlock(proof: any, previousHash: string) {
    //採掘報酬
    this.newTransaction(type.SYSTEM, this.address, 1, {
      type: ETransactionType.transaction,
      payload: "reward"
    });

    const block = {
      index: this.chain.length + 1, //ブロックの番号
      timestamp: Date.now(), //タイムスタンプ
      transactions: this.currentTransactions, //トランザクションの塊
      proof: proof, //ナンス
      previousHash: previousHash || this.hash(this.lastBlock()), //前のブロックのハッシュ値
      owner: this.address, //このブロックを作った人
      publicKey: this.cypher.pubKey, //このブロックを作った人の公開鍵
      sign: "" //このブロックを作った人の署名
    };
    //署名を生成
    block.sign = this.cypher.encrypt(this.hash(block));
    //ブロックチェーンに追加
    this.chain.push(block);

    //トランザクションプールをリセット
    this.currentTransactions = [];
    console.log("new block done", this.chain);
    return block;
  }

  newTransaction(
    sender: string,
    recipient: string,
    amount: number,
    data: { type: ETransactionType; payload: any },
    cypher = this.cypher
  ) {
    const tran: ITransaction = {
      sender: sender, //送信アドレス
      recipient: recipient, //受取アドレス
      amount: amount, //量
      data: data, //任意のメッセージ
      now: Date.now(), //タイムスタンプ
      publicKey: cypher.pubKey, //公開鍵
      sign: "" //署名
    };
    tran.sign = cypher.encrypt(this.hash(tran));
    //トランザクションを追加
    this.currentTransactions.push(tran);

    return tran;
  }

  lastBlock(blockchain = this.chain) {
    return blockchain[blockchain.length - 1];
  }

  addBlock(block: any) {
    if (this.validBlock(block)) {
      console.log("validBlock");
      this.currentTransactions = [];
      this.chain.push(block);

      this.callback.onAddBlock();
      this.excuteEvent(this.events.onAddBlock);
    }
  }

  private excuteEvent(ev: any, v?: any) {
    console.log("excuteEvent", ev);
    Object.keys(ev).forEach(key => {
      ev[key](v);
    });
  }

  validBlock(block: any) {
    const lastBlock = this.lastBlock();
    const lastProof = lastBlock.proof;
    const lastHash = this.hash(lastBlock);
    const owner = block.owner;
    const sign = block.sign;
    const publicKey = block.publicKey;
    block.sign = "";

    //署名が正しいかどうか
    if (this.cypher.decrypt(sign, publicKey) === this.hash(block)) {
      block.sign = sign;
      //ナンスが正しいかどうか
      if (this.validProof(lastProof, block.proof, lastHash, owner)) {
        return true;
      } else {
        console.log("block nonce error", this.address, this.chain);
        return false;
      }
    } else {
      console.log("block sign error", this.address);
      return false;
    }
  }

  validProof(
    lastProof: string,
    proof: number,
    lastHash: string,
    address: string
  ) {
    const guess = `${lastProof}${proof}${lastHash}${address}`;
    const guessHash = sha256(guess);
    //先頭から４文字が０なら成功
    return diff.test(guessHash);
  }

  validChain(chain: Array<any>) {
    let index = 2;
    while (index < chain.length) {
      const previousBlock = chain[index - 1];
      const block = chain[index];

      //ブロックの持つ前のブロックのハッシュ値と実際の前の
      //ブロックのハッシュ値を比較
      if (block.previousHash !== this.hash(previousBlock)) {
        return false;
      }
      //ナンスの値の検証
      if (
        !this.validProof(
          previousBlock.proof,
          block.proof,
          this.hash(block),
          block.owner
        )
      ) {
        return false;
      }
      index++;
    }
    return true;
  }

  validTransaction(transaction: ITransaction) {
    const amount = transaction.amount;
    const sign = transaction.sign;

    const result = this.currentTransactions.find(prev => {
      return prev.sign === sign;
    });
    if (result) {
      console.log("duplicate error", { result });
      return false;
    }

    const publicKey = transaction.publicKey;
    const address = transaction.sender;
    transaction.sign = "";

    //公開鍵が送金者のものかどうか
    if (sha256(publicKey) === address) {
      //署名が正しいかどうか
      //公開鍵で署名を解読しトランザクションのハッシュ値と一致することを確認する。
      if (this.cypher.decrypt(sign, publicKey) === this.hash(transaction)) {
        const balance = this.nowAmount(address);
        //送金可能な金額を超えているかどうか
        if (balance >= amount) {
          //消した署名を戻す
          transaction.sign = sign;
          return true;
        } else {
          console.log("balance error", amount, balance);
          return false;
        }
      } else {
        console.log("sign error");
        return false;
      }
    } else {
      console.log("pubkey error");
      return false;
    }
  }

  addTransaction(tran: ITransaction) {
    if (this.validTransaction(tran)) {
      console.log("validTransaction", { tran });
      //トランザクションを追加
      this.currentTransactions.push(tran);
      this.excuteEvent(this.events.onTransaction);
    } else {
      console.log("error Transaction");
    }
  }

  proofOfWork() {
    const lastBlock = this.lastBlock();
    const lastProof = lastBlock.proof;
    const lastHash = this.hash(lastBlock);

    let proof = 0;

    while (!this.validProof(lastProof, proof, lastHash, this.address)) {
      //ナンスの値を試行錯誤的に探す
      proof++;
    }

    return proof;
  }

  nowAmount(address = this.address) {
    let tokenNum = new Decimal(0.0);
    this.chain.forEach(block => {
      block.transactions.forEach((transaction: any) => {
        if (transaction.recipient === address) {
          tokenNum = tokenNum.plus(new Decimal(parseFloat(transaction.amount)));
        }
        if (transaction.sender === address) {
          tokenNum = tokenNum.minus(
            new Decimal(parseFloat(transaction.amount))
          );
        }
      });
    });
    this.currentTransactions.forEach(transaction => {
      if (transaction.recipient === address) {
        tokenNum = tokenNum.plus(new Decimal(parseFloat(transaction.amount)));
      }
      if (transaction.sender === address) {
        tokenNum = tokenNum.minus(new Decimal(parseFloat(transaction.amount)));
      }
    });
    return tokenNum.toNumber();
  }
}
