/**
 * Kairo Engine Event System (@kairo/events)
 * Input Event Triggers, Event Bus, Key Binds, Action Dispatchers, & Event Pipelines
 */

export type EventHandler<T = any> = (data: T) => void | boolean | Promise<void>;

export enum EventPriority {
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
export class EventBus {
  private listeners: Map<string, ListenerEntry[]> = new Map();
  private wildcardListeners: ListenerEntry[] = [];

  public on<T = any>(event: string, handler: EventHandler<T>, priority: EventPriority = EventPriority.NORMAL): () => void {
    if (event === '*') {
      this.wildcardListeners.push({ handler, priority, once: false });
      this.sortListeners(this.wildcardListeners);
      return () => this.off('*', handler);
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    const list = this.listeners.get(event)!;
    list.push({ handler, priority, once: false });
    this.sortListeners(list);
    return () => this.off(event, handler);
  }

  public once<T = any>(event: string, handler: EventHandler<T>, priority: EventPriority = EventPriority.NORMAL): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    const list = this.listeners.get(event)!;
    list.push({ handler, priority, once: true });
    this.sortListeners(list);
  }

  public off<T = any>(event: string, handler: EventHandler<T>): void {
    if (event === '*') {
      this.wildcardListeners = this.wildcardListeners.filter(l => l.handler !== handler);
      return;
    }
    const list = this.listeners.get(event);
    if (list) {
      this.listeners.set(event, list.filter(l => l.handler !== handler));
    }
  }

  public emit<T = any>(event: string, data?: T): boolean {
    let cancelled = false;

    // Wildcard listeners
    for (const entry of [...this.wildcardListeners]) {
      const result = entry.handler({ event, data });
      if (result === false) cancelled = true;
    }

    // Direct event listeners
    const list = this.listeners.get(event);
    if (list) {
      const toRemove: ListenerEntry[] = [];
      for (const entry of [...list]) {
        const result = entry.handler(data);
        if (result === false) cancelled = true;
        if (entry.once) toRemove.push(entry);
      }
      if (toRemove.length > 0) {
        this.listeners.set(event, list.filter(l => !toRemove.includes(l)));
      }
    }

    return !cancelled;
  }

  private sortListeners(list: ListenerEntry[]): void {
    list.sort((a, b) => b.priority - a.priority);
  }

  public clear(): void {
    this.listeners.clear();
    this.wildcardListeners = [];
  }
}

export const GlobalEvents = new EventBus();

/**
 * Key Event Trigger System
 * Automatically listens for key presses (e.g. 'Enter', 'Space', 'KeyW') and launches configured EventBus actions
 */
export class KeyEventTrigger {
  private eventBus: EventBus;
  private keyBindings: Map<string, string[]> = new Map();
  private boundKeyDownHandler: (e: KeyboardEvent) => void;
  private boundKeyUpHandler: (e: KeyboardEvent) => void;
  private activeKeys: Set<string> = new Set();
  public enabled: boolean = true;

  constructor(eventBus: EventBus = GlobalEvents) {
    this.eventBus = eventBus;

    this.boundKeyDownHandler = (e: KeyboardEvent) => this.handleKeyDown(e);
    this.boundKeyUpHandler = (e: KeyboardEvent) => this.handleKeyUp(e);

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.boundKeyDownHandler);
      window.addEventListener('keyup', this.boundKeyUpHandler);
    }
  }

  /**
   * Bind a keyboard key (e.g. 'Enter', 'Space', 'KeyW') to launch a specific engine event name
   */
  public bindKey(keyCode: string, eventToLaunch: string): void {
    if (!this.keyBindings.has(keyCode)) {
      this.keyBindings.set(keyCode, []);
    }
    const events = this.keyBindings.get(keyCode)!;
    if (!events.includes(eventToLaunch)) {
      events.push(eventToLaunch);
    }
  }

  /**
   * Unbind an event from a key
   */
  public unbindKey(keyCode: string, eventToLaunch?: string): void {
    if (!eventToLaunch) {
      this.keyBindings.delete(keyCode);
    } else if (this.keyBindings.has(keyCode)) {
      const events = this.keyBindings.get(keyCode)!.filter(e => e !== eventToLaunch);
      if (events.length > 0) {
        this.keyBindings.set(keyCode, events);
      } else {
        this.keyBindings.delete(keyCode);
      }
    }
  }

  public handleKeyDown(e: KeyboardEvent): void {
    if (!this.enabled) return;

    const eventData: KeyEventData = {
      code: e.code,
      key: e.key,
      repeat: e.repeat,
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
      timestamp: performance.now()
    };

    // Emit generic key down events
    this.eventBus.emit(`key:down:${e.code}`, eventData);
    this.eventBus.emit(`key:down:${e.key}`, eventData);

    // If key is Enter, launch special 'key:Enter' and 'action:submit' events
    if (e.code === 'Enter' || e.key === 'Enter') {
      this.eventBus.emit('key:Enter', eventData);
      this.eventBus.emit('action:submit', eventData);
    }

    // Launch custom bound events for this key
    const boundEvents = this.keyBindings.get(e.code) || this.keyBindings.get(e.key);
    if (boundEvents) {
      for (const eventName of boundEvents) {
        this.eventBus.emit(eventName, eventData);
      }
    }

    this.activeKeys.add(e.code);
  }

  public handleKeyUp(e: KeyboardEvent): void {
    if (!this.enabled) return;

    const eventData: KeyEventData = {
      code: e.code,
      key: e.key,
      repeat: false,
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
      timestamp: performance.now()
    };

    this.eventBus.emit(`key:up:${e.code}`, eventData);
    this.eventBus.emit(`key:up:${e.key}`, eventData);
    this.activeKeys.delete(e.code);
  }

  public isKeyDown(code: string): boolean {
    return this.activeKeys.has(code);
  }

  public destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.boundKeyDownHandler);
      window.removeEventListener('keyup', this.boundKeyUpHandler);
    }
    this.keyBindings.clear();
    this.activeKeys.clear();
  }
}

/**
 * Event Action Dispatcher
 * Executes predefined engine actions (callbacks, sound triggers, UI notifications) when specified events fire.
 */
export class EventActionDispatcher {
  private eventBus: EventBus;
  private actions: Map<string, Array<(data: any) => void>> = new Map();

  constructor(eventBus: EventBus = GlobalEvents) {
    this.eventBus = eventBus;
  }

  public addAction(event: string, actionFn: (data: any) => void): void {
    if (!this.actions.has(event)) {
      this.actions.set(event, []);
      this.eventBus.on(event, (data) => {
        const list = this.actions.get(event);
        if (list) {
          list.forEach(fn => fn(data));
        }
      });
    }
    this.actions.get(event)!.push(actionFn);
  }
}
