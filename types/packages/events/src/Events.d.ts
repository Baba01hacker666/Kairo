/**
 * Kairo Engine Event System (@kairo/events)
 * Input Event Triggers, Event Bus, Key Binds, Action Dispatchers, & Event Pipelines
 */
export type EventHandler<T = any> = (data: T) => void | boolean | Promise<void>;
export declare enum EventPriority {
    LOW = 0,
    NORMAL = 1,
    HIGH = 2,
    CRITICAL = 3
}
export interface ListenerEntry<T = any> {
    handler: EventHandler<T>;
    priority: EventPriority;
    once: boolean;
}
export interface KeyEventData {
    code: string;
    key: string;
    repeat: boolean;
    shiftKey: boolean;
    ctrlKey: boolean;
    altKey: boolean;
    timestamp: number;
}
/**
 * Advanced Priority Event Bus with Wildcard Matching and Cancellable Events
 */
export declare class EventBus {
    private listeners;
    private wildcardListeners;
    on<T = any>(event: string, handler: EventHandler<T>, priority?: EventPriority): () => void;
    once<T = any>(event: string, handler: EventHandler<T>, priority?: EventPriority): void;
    off<T = any>(event: string, handler: EventHandler<T>): void;
    emit<T = any>(event: string, data?: T): boolean;
    private sortListeners;
    clear(): void;
}
export declare const GlobalEvents: EventBus;
/**
 * Key Event Trigger System
 * Automatically listens for key presses (e.g. 'Enter', 'Space', 'KeyW') and launches configured EventBus actions
 */
export declare class KeyEventTrigger {
    private eventBus;
    private keyBindings;
    private boundKeyDownHandler;
    private boundKeyUpHandler;
    private activeKeys;
    enabled: boolean;
    constructor(eventBus?: EventBus);
    /**
     * Bind a keyboard key (e.g. 'Enter', 'Space', 'KeyW') to launch a specific engine event name
     */
    bindKey(keyCode: string, eventToLaunch: string): void;
    /**
     * Unbind an event from a key
     */
    unbindKey(keyCode: string, eventToLaunch?: string): void;
    handleKeyDown(e: KeyboardEvent): void;
    handleKeyUp(e: KeyboardEvent): void;
    isKeyDown(code: string): boolean;
    destroy(): void;
}
/**
 * Event Action Dispatcher
 * Executes predefined engine actions (callbacks, sound triggers, UI notifications) when specified events fire.
 */
export declare class EventActionDispatcher {
    private eventBus;
    private actions;
    constructor(eventBus?: EventBus);
    addAction(event: string, actionFn: (data: any) => void): void;
}
