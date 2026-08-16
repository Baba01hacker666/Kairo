/**
 * Kairo Engine Core Event System & EventEmitter
 */
type EventHandler<T = any> = (data: T) => void;
export declare class EventEmitter {
    private events;
    on<T = any>(event: string, handler: EventHandler<T>): () => void;
    once<T = any>(event: string, handler: EventHandler<T>): () => void;
    off<T = any>(event: string, handler: EventHandler<T>): void;
    emit<T = any>(event: string, data?: T): void;
    clear(): void;
}
export declare const GlobalEventBus: EventEmitter;
export {};
