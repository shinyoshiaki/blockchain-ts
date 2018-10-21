import BlockChain from "./blockchain";
import type from "./type";

let bc: BlockChain;
let onResolveConflict: (body: any) => void;

//コールバックは強制、イベントは任意にしようとしている
interface callback {
  checkConflict: (v?: any) => void;
  onConflict: (chain: any, nodeId: any) => void;
}
let callback: callback;

export default class Responder {
  RPC: any = {};
  constructor(_bc: BlockChain, _callback: callback) {
    bc = _bc;
    callback = _callback;

    this.RPC[type.NEWBLOCK] = async (body: any) => {
      console.log("blockchainApp", "new block");
      //受け取ったブロックのインデックスが自分のチェーンより2長いか
      //現時点のチェーンの長さが1ならブロックチェーンの分岐を疑う
      if (body.index > bc.chain.length + 1 || bc.chain.length === 1) {
        //ブロックチェーンの分岐を調べる
        await this.checkConflicts().catch(console.log);
      } else {
        //新しいブロックを受け入れる
        bc.addBlock(body);
      }
    };

    //トランザクションに対する処理
    this.RPC[type.TRANSACRION] = (body: any) => {
      console.log("blockchainApp transaction", body);
      if (
        //トランザクションプールに受け取ったトランザクションがあるか簡易的に調べる
        !bc.jsonStr(bc.currentTransactions).includes(bc.jsonStr(body))
      ) {
        //トランザクションをトランザクションプールに加える
        bc.addTransaction(body);
      }
    };

    this.RPC[type.CONFLICT] = (body: any) => {
      console.log("blockchain app check conflict");
      //自分のチェーンが質問者より長ければ、自分のチェーンを返す
      if (bc.chain.length > body.size) {
        console.log("blockchain app check is conflict");
        callback.onConflict(bc.chain, body.nodeId);
      }
    };

    this.RPC[type.RESOLVE_CONFLICT] = (body: any) => {
      if (onResolveConflict) onResolveConflict(body);
    };
  }

  runRPC(type: string, body: string) {
    if (Object.keys(this.RPC).includes(type)) this.RPC[type](body);
  }

  private checkConflicts() {
    return new Promise((resolve, reject) => {
      console.log("this.checkConflicts");
      //タイムアウト
      const timeout = setTimeout(() => {
        reject("checkconflicts timeout");
      }, 4 * 1000);
      //他のノードにブロックチェーンの状況を聞く
      callback.checkConflict();
      //他のノードからの回答を調べる
      onResolveConflict = (body: any) => {
        if (bc.chain.length < body.length) {
          if (bc.validChain(body)) {
            bc.chain = body;
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
