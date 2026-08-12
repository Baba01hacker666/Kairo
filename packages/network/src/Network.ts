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
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number; w: number };
  timestamp: number;
}

/**
 * Entity Transform Interpolator for Smooth Multiplayer Snapshot Rendering
 */
export class StateInterpolator {
  private buffer: EntitySnapshot[] = [];
  public interpolationDelayMs: number = 100; // Render state 100ms in the past for smooth interpolation

  public pushSnapshot(snapshot: EntitySnapshot): void {
    this.buffer.push(snapshot);
    // Keep max 30 snapshots in queue
    if (this.buffer.length > 30) {
      this.buffer.shift();
    }
  }

  public getInterpolatedState(renderTimeMs: number): { position: Vector3 } | null {
    const targetTime = renderTimeMs - this.interpolationDelayMs;

    if (this.buffer.length === 0) return null;
    if (this.buffer.length === 1) {
      const s = this.buffer[0];
      return { position: new Vector3(s.position.x, s.position.y, s.position.z) };
    }

    // Find surrounding snapshots
    let fromSnap = this.buffer[0];
    let toSnap = this.buffer[this.buffer.length - 1];

    for (let i = 0; i < this.buffer.length - 1; i++) {
      if (this.buffer[i].timestamp <= targetTime && this.buffer[i + 1].timestamp >= targetTime) {
        fromSnap = this.buffer[i];
        toSnap = this.buffer[i + 1];
        break;
      }
    }

    const duration = toSnap.timestamp - fromSnap.timestamp;
    const alpha = duration > 0 ? Math.max(0, Math.min(1, (targetTime - fromSnap.timestamp) / duration)) : 1;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    return {
      position: new Vector3(
        lerp(fromSnap.position.x, toSnap.position.x, alpha),
        lerp(fromSnap.position.y, toSnap.position.y, alpha),
        lerp(fromSnap.position.z, toSnap.position.z, alpha)
      )
    };
  }
}

/**
 * WebSocket Network Transport Client with Ping / RTT Measurement
 */
export class WebSocketClient {
  private socket: WebSocket | null = null;
  public rttMs: number = 0;
  private pingInterval: any = null;
  public onMessageCallbacks: Array<(packet: NetworkPacket) => void> = [];

  public connect(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.socket = new WebSocket(url);
        this.socket.onopen = () => {
          this.startPingLoop();
          resolve(true);
        };
        this.socket.onerror = () => resolve(false);
        this.socket.onmessage = (event) => {
          try {
            const packet: NetworkPacket = JSON.parse(event.data);
            if (packet.type === 'pong') {
              this.rttMs = performance.now() - packet.timestamp;
            } else {
              this.onMessageCallbacks.forEach(cb => cb(packet));
            }
          } catch (err) {
            console.error('[NetworkManager] Error processing network packet:', err);
          }
        };
      } catch (e) {
        resolve(false);
      }
    });
  }

  private startPingLoop(): void {
    this.pingInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({
          type: 'ping',
          senderId: 'client',
          timestamp: performance.now(),
          payload: {}
        }));
      }
    }, 2000);
  }

  public send(packet: NetworkPacket): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(packet));
    }
  }

  public disconnect(): void {
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.socket) this.socket.close();
  }
}

/**
 * Master Network Manager
 */
export class NetworkManager {
  public isServer: boolean = false;
  public clientId: string;
  public connected: boolean = false;
  private rpcHandlers: Map<string, Function> = new Map();
  private entityStates: Map<string, any> = new Map();
  public interpolator: StateInterpolator = new StateInterpolator();
  public wsClient: WebSocketClient = new WebSocketClient();

  constructor() {
    this.clientId = `client_${Math.random().toString(36).substring(2, 9)}`;
    this.wsClient.onMessageCallbacks.push((packet) => this.onReceivePacket(packet));
  }

  public registerRPC(name: string, handler: Function): void {
    this.rpcHandlers.set(name, handler);
  }

  public sendRPC(name: string, args: any[]): void {
    const packet: NetworkPacket = {
      type: 'rpc',
      senderId: this.clientId,
      timestamp: performance.now(),
      payload: { name, args }
    };
    this.onReceivePacket(packet);
    this.wsClient.send(packet);
  }

  public onReceivePacket(packet: NetworkPacket): void {
    if (packet.type === 'rpc') {
      const handler = this.rpcHandlers.get(packet.payload.name);
      if (handler) {
        handler(...packet.payload.args);
      }
    } else if (packet.type === 'state') {
      this.entityStates.set(packet.payload.id, packet.payload.state);
      if (packet.payload.snapshot) {
        this.interpolator.pushSnapshot(packet.payload.snapshot);
      }
    }
  }

  public replicateEntityState(entityId: string, state: any): NetworkPacket {
    const packet: NetworkPacket = {
      type: 'state',
      senderId: this.clientId,
      timestamp: performance.now(),
      payload: { id: entityId, state }
    };
    this.wsClient.send(packet);
    return packet;
  }
}
