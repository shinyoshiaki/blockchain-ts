import BlockChainApp from "./blockchainApp";
import { IEvents } from "../util";
interface callback {
    checkConflict: (v?: any) => void;
    onConflict: (chain: any, nodeId: any) => void;
}
interface RPC {
    type: typeRPC;
    body: any;
}
export declare enum typeRPC {
    NEWBLOCK = "NEWBLOCK",
    TRANSACRION = "TRANSACRION",
    CONFLICT = "CONFLICT",
    RESOLVE_CONFLICT = "RESOLVE_CONFLICT"
}
export default class Responder {
    callback: callback;
    onResolveConflict?: (chain: Array<any>) => void;
    private onTransaction;
    events: {
        onTransaction: IEvents;
    };
    bc: BlockChainApp;
    RPC: any;
    constructor(_bc: BlockChainApp);
    runRPC(rpc: RPC): void;
    private checkConflicts;
}
export {};
