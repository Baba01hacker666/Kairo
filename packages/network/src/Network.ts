/**
 * Kairo Engine Networking Framework
 * Client Prediction, Entity Replication, RPC, & State Synchronization
 */

export interface NetworkPacket {
  type: 'state' | 'rpc' | 'connect' | 'disconnect';
  senderId: string;
  timestamp: number;
  payload: any;
}

export class NetworkManager {
  public isServer: boolean = false;
  public clientId: string;
  public connected: boolean = false;
  private rpcHandlers: Map<string, Function> = new Map();
  private entityStates: Map<string, any> = new Map();

  constructor() {
    this.clientId = `client_${Math.random().toString(36).substring(2, 9)}`;
  }

  registerRPC(name: string, handler: Function): void {
    this.rpcHandlers.set(name, handler);
  }

  sendRPC(name: string, args: any[]): void {
    const packet: NetworkPacket = {
      type: 'rpc',
      senderId: this.clientId,
      timestamp: performance.now(),
      payload: { name, args }
    };
    this.onReceivePacket(packet);
  }

  onReceivePacket(packet: NetworkPacket): void {
    if (packet.type === 'rpc') {
      const handler = this.rpcHandlers.get(packet.payload.name);
      if (handler) {
        handler(...packet.payload.args);
      }
    } else if (packet.type === 'state') {
      this.entityStates.set(packet.payload.id, packet.payload.state);
    }
  }

  replicateEntityState(entityId: string, state: any): NetworkPacket {
    return {
      type: 'state',
      senderId: this.clientId,
      timestamp: performance.now(),
      payload: { id: entityId, state }
    };
  }
}
