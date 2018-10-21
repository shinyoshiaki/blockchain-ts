import BlockChain from "./blockchain";
interface callback {
    checkConflict: (v?: any) => void;
    onConflict: (chain: any, nodeId: any) => void;
}
export declare enum type {
    NEWBLOCK = "NEWBLOCK",
    TRANSACRION = "TRANSACRION",
    CONFLICT = "CONFLICT",
    RESOLVE_CONFLICT = "RESOLVE_CONFLICT"
}
export default class Responder {
    callback?: callback;
    onResolveConflict?: (chain: Array<any>) => void;
    bc: BlockChain;
    RPC: any;
    constructor(_bc: BlockChain);
    runRPC(name: type, body: any): void;
    private checkConflicts;
}
export {};
