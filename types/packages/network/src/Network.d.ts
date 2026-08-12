/**
 * Kairo Engine Networking Framework
 * Client Prediction, Entity State Interpolation, RPC, WebSocket Transport & Snapshot Reconciliation
 */
import { Vector3 } from '../../core/src/Math.ts';
export interface NetworkPacket {
    type: 'state' | 'rpc' | 'connect' | 'disconnect' | 'ping' | 'pong';
    senderId: string;
    timestamp: number;
    payload: any;
}
export interface EntitySnapshot {
    entityId: string;
    position: {
        x: number;
        y: number;
        z: number;
    };
    rotation: {
        x: number;
        y: number;
        z: number;
        w: number;
    };
    timestamp: number;
}
/**
 * Entity Transform Interpolator for Smooth Multiplayer Snapshot Rendering
 */
export declare class StateInterpolator {
    private buffer;
    interpolationDelayMs: number;
    pushSnapshot(snapshot: EntitySnapshot): void;
    getInterpolatedState(renderTimeMs: number): {
        position: Vector3;
    } | null;
}
/**
 * WebSocket Network Transport Client with Ping / RTT Measurement
 */
export declare class WebSocketClient {
    private socket;
    rttMs: number;
    private pingInterval;
    onMessageCallbacks: Array<(packet: NetworkPacket) => void>;
    connect(url: string): Promise<boolean>;
    private startPingLoop;
    send(packet: NetworkPacket): void;
    disconnect(): void;
}
/**
 * Master Network Manager
 */
export declare class NetworkManager {
    isServer: boolean;
    clientId: string;
    connected: boolean;
    private rpcHandlers;
    private entityStates;
    interpolator: StateInterpolator;
    wsClient: WebSocketClient;
    constructor();
    registerRPC(name: string, handler: Function): void;
    sendRPC(name: string, args: any[]): void;
    onReceivePacket(packet: NetworkPacket): void;
    replicateEntityState(entityId: string, state: any): NetworkPacket;
}
