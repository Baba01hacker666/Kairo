/**
 * Kairo Engine Core Event System & EventEmitter
 */

type EventHandler<T = any> = (data: T) => void;

export class EventEmitter {
  private events: Map<string, Set<EventHandler>> = new Map();

  on<T = any>(event: string, handler: EventHandler<T>): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  once<T = any>(event: string, handler: EventHandler<T>): void {
    const wrapper: EventHandler<T> = (data: T) => {
      handler(data);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  off<T = any>(event: string, handler: EventHandler<T>): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  emit<T = any>(event: string, data?: T): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  clear(): void {
    this.events.clear();
  }
}

export const GlobalEventBus = new EventEmitter();
