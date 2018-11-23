import BlockChain, { ITransaction } from "./blockchain";
import BlockChainApp from "./blockchainApp";
import { IEvents, excuteEvent } from "../util";

//コールバックは強制、イベントは任意にしようとしている
interface callback {
  checkConflict: (v?: any) => void;
  onConflict: (chain: any, nodeId: any) => void;
}

interface RPC {
  type: typeRPC;
  body: any;
}

export enum typeRPC {
  NEWBLOCK = "NEWBLOCK",
  TRANSACRION = "TRANSACRION",
  CONFLICT = "CONFLICT",
  RESOLVE_CONFLICT = "RESOLVE_CONFLICT"
}

export default class Responder {
  callback: callback = {
    checkConflict: () => {},
    onConflict: () => {}
  };
  onResolveConflict?: (chain: Array<any>) => void;
  private onTransaction: IEvents = {};
  events = { onTransaction: this.onTransaction };
  bc: BlockChainApp;
  RPC: any = {};
  constructor(_bc: BlockChainApp) {
    this.bc = _bc;

    this.RPC[typeRPC.NEWBLOCK] = async (block: any) => {
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
        this.bc.multisig.responder(body)
        // excuteEvent(this.onTransaction, body);
      }
    };

    this.RPC[typeRPC.CONFLICT] = (body: any) => {
      console.log("blockchain app check conflict");
      //自分のチェーンが質問者より長ければ、自分のチェーンを返す
      if (this.bc.chain.length > body.size) {
        console.log("blockchain app check is conflict");
        this.callback.onConflict(this.bc.chain, body.nodeId);
      }
    };

    this.RPC[typeRPC.RESOLVE_CONFLICT] = (chain: Array<any>) => {
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

      //他のノードにブロックチェーンの状況を聞く
      this.callback.checkConflict();

      //他のノードからの回答を調べる
      this.onResolveConflict = (chain: Array<any>) => {
        console.log("onResolveConflict");
        if (this.bc.chain.length < chain.length) {
          if (this.bc.validChain(chain)) {
            this.bc.chain = chain;
          } else {
            console.log("conflict wrong chain");
          }
        }
        clearTimeout(timeout);
        resolve(true);
      };
    });
  }
}
