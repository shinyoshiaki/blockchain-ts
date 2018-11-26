import { IBlock } from "./blockchain";
import BlockChainApp from "./blockchainApp";
import { IEvents } from "../util";
export interface IcallbackResponder {
    listenConfilict: (rpc: RPC) => void;
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
export declare enum typeRPC {
    NEWBLOCK = "NEWBLOCK",
    TRANSACRION = "TRANSACRION",
    CONFLICT = "CONFLICT",
    RESOLVE_CONFLICT = "RESOLVE_CONFLICT"
}
export default class Responder {
    callback: IcallbackResponder | undefined;
    private onResolveConflict?;
    private onTransaction;
    events: {
        transaction: IEvents;
    };
    bc: BlockChainApp;
    RPC: any;
    constructor(_bc: BlockChainApp, callback?: IcallbackResponder);
    runRPC(rpc: RPC): void;
    private checkConflicts;
}
