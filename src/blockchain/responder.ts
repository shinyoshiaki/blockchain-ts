import { ITransaction, IBlock } from "./blockchain";
import BlockChainApp from "./blockchainApp";
import { IEvents, excuteEvent } from "../util";

//コールバックは強制、イベントは任意にしようとしている
export interface IcallbackResponder {
  listenConflict: (rpc: RPC) => void;
  answerConflict: (rpc: RPC) => void;
}

export interface RPC {
  type: typeRPC;
  body: any;
}

export interface IConflict {
  size: number;
  address: string;
}

export interface IOnConflict {
  chain: IBlock[];
  listenrAddress: string;
}

export enum typeRPC {
  NEWBLOCK = "NEWBLOCK",
  TRANSACRION = "TRANSACRION",
  CONFLICT = "CONFLICT",
  RESOLVE_CONFLICT = "RESOLVE_CONFLICT"
}

export default class Responder {
  callback: IcallbackResponder | undefined;
  private onResolveConflict?: (chain: IBlock[]) => void;
  private onTransaction: IEvents = {};
  events = { transaction: this.onTransaction };
  bc: BlockChainApp;
  RPC: any = {};
  constructor(_bc: BlockChainApp, callback?: IcallbackResponder) {
    this.bc = _bc;
    this.callback = callback;

    this.RPC[typeRPC.NEWBLOCK] = async (block: IBlock) => {
      console.log("blockchainApp", "new block");
      //受け取ったブロックのインデックスが自分のチェーンより2長いか
      //現時点のチェーンの長さが1ならブロックチェーンの分岐を疑う
      if (
        block.index > this.bc.chain.length + 1 ||
        this.bc.chain.length === 1
      ) {
        //ブロックチェーンの分岐を調べる
        await this.checkConflicts().catch(console.log);
      } else {
        //新しいブロックを受け入れる
        this.bc.addBlock(block);
      }
    };

    //トランザクションに対する処理
    this.RPC[typeRPC.TRANSACRION] = (body: ITransaction) => {
      console.log("blockchainApp transaction", body);
      if (
        //トランザクションプールに受け取ったトランザクションがあるか簡易的に調べる
        !this.bc
          .jsonStr(this.bc.currentTransactions)
          .includes(this.bc.jsonStr(body))
      ) {
        //トランザクションをトランザクションプールに加える
        this.bc.addTransaction(body);
        this.bc.multisig.responder(body);
        this.bc.contract.responder(body);
        excuteEvent(this.events.transaction, body);
      }
    };

    this.RPC[typeRPC.CONFLICT] = (body: IConflict) => {
      console.log("blockchain app check conflict");
      //自分のチェーンが質問者より長ければ、自分のチェーンを返す
      if (this.bc.chain.length > body.size) {
        console.log(
          "blockchain app check is conflict",
          this.bc.chain.length,
          body.size
        );
        const onConflict: IOnConflict = {
          chain: this.bc.chain,
          listenrAddress: body.address
        };
        const rpc: RPC = { type: typeRPC.RESOLVE_CONFLICT, body: onConflict };
        if (this.callback) this.callback.answerConflict(rpc);
      }
    };

    this.RPC[typeRPC.RESOLVE_CONFLICT] = (chain: IBlock[]) => {
      if (this.onResolveConflict) this.onResolveConflict(chain);
    };
  }

  runRPC(rpc: RPC) {
    if (Object.keys(this.RPC).includes(rpc.type)) this.RPC[rpc.type](rpc.body);
  }

  private checkConflicts() {
    return new Promise((resolve, reject) => {
      console.log("checkConflicts");
      //タイムアウト
      const timeout = setTimeout(() => {
        reject("checkconflicts timeout");
      }, 4 * 1000);

      const conflict: IConflict = {
        size: this.bc.chain.length,
        address: this.bc.address
      };
      const rpc: RPC = { type: typeRPC.CONFLICT, body: conflict };
      //他のノードにブロックチェーンの状況を聞く
      if (this.callback) this.callback.listenConflict(rpc);

      //他のノードからの回答を調べる
      this.onResolveConflict = (chain: IBlock[]) => {
        console.log("onResolveConflict", this.bc.chain.length, chain.length);
        if (this.bc.chain.length < chain.length) {
          if (this.bc.validChain(chain)) {
            console.log("swap chain");
            this.bc.chain = chain;
          } else {
            console.log("conflict wrong chain");
          }
        } else {
          console.log("my chain is longer");
        }
        clearTimeout(timeout);
        resolve(true);
      };
    });
  }
}
