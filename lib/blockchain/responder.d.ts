import BlockChain from "./blockchain";
interface callback {
    checkConflict: (v?: any) => void;
    onConflict: (chain: any, nodeId: any) => void;
}
declare let callback: callback;
export default class Responder {
    RPC: any;
    constructor(_bc: BlockChain, _callback: callback);
    runRPC(type: string, body: string): void;
    private checkConflicts;
}
export {};
