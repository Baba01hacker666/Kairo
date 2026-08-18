import { EventEmitter } from '../../core/src/EventSystem.ts';

export interface StateConfig<TContext = any, TState extends string = string> {
  /** Lifecycle hook invoked when entering this state. */
  onEnter?: (context: TContext, fromState: TState | null) => void;
  /** Lifecycle hook invoked on each frame/update step while in this state. */
  onUpdate?: (context: TContext, dt: number) => void;
  /** Lifecycle hook invoked when leaving this state. */
  onExit?: (context: TContext, toState: TState) => void;
}

export interface StateTransition<TContext = any, TState extends string = string> {
  from: TState | '*';
  to: TState;
  condition?: (context: TContext) => boolean;
  trigger?: string;
  onTransition?: (context: TContext) => void;
}

export interface StateMachineOptions<TState extends string = string> {
  initialState?: TState;
  maxHistory?: number;
}

/**
 * 🤖 StateMachine
 * High-performance, flexible Finite State Machine for Game AI, Character Controllers,
 * Boss Phases, UI flows, and Game Lifecycles.
 */
export class StateMachine<TContext = any, TState extends string = string> {
  public readonly context: TContext;
  private states: Map<TState, StateConfig<TContext, TState>> = new Map();
  private transitions: StateTransition<TContext, TState>[] = [];
  private _currentState: TState | null = null;
  private _previousState: TState | null = null;
  private _timeInState: number = 0;
  private _history: TState[] = [];
  private maxHistory: number;
  public readonly events: EventEmitter = new EventEmitter();

  constructor(context: TContext, options: StateMachineOptions<TState> = {}) {
    this.context = context;
    this.maxHistory = options.maxHistory ?? 10;
    if (options.initialState) {
      this.setState(options.initialState, true);
    }
  }

  /**
   * Register or configure a state with enter, update, and exit hooks.
   */
  public state(name: TState, config: StateConfig<TContext, TState> = {}): this {
    this.states.set(name, config);
    if (!this._currentState) {
      this.setState(name);
    }
    return this;
  }

  /**
   * Register a transition between states.
   * Can be triggered via boolean condition in update() or named event in trigger().
   */
  public transition(
    from: TState | '*',
    to: TState,
    conditionOrTrigger?: string | ((context: TContext) => boolean),
    onTransition?: (context: TContext) => void
  ): this {
    const isTrigger = typeof conditionOrTrigger === 'string';
    const condition = typeof conditionOrTrigger === 'function' ? conditionOrTrigger : undefined;
    const trigger = isTrigger ? conditionOrTrigger : undefined;

    this.transitions.push({
      from,
      to,
      condition,
      trigger,
      onTransition
    });
    return this;
  }

  /**
   * Directly switch to a target state. Checks valid transitions unless force = true.
   */
  public setState(nextState: TState, force: boolean = false, recordHistory: boolean = true): boolean {
    if (this._currentState === nextState && !force) return false;

    if (!force && this._currentState !== null) {
      const allowed = this.canTransitionTo(nextState);
      if (!allowed) {
        this.events.emit('transition_denied', { from: this._currentState, to: nextState });
        return false;
      }
    }

    const prev = this._currentState;
    const currentConfig = prev ? this.states.get(prev) : undefined;
    const nextConfig = this.states.get(nextState);

    // Call onExit on previous state
    if (currentConfig?.onExit && prev) {
      currentConfig.onExit(this.context, nextState);
    }

    // Execute transition callback if matching transition rule exists
    if (prev) {
      const matched = this.transitions.find(t => (t.from === prev || t.from === '*') && t.to === nextState);
      if (matched?.onTransition) {
        matched.onTransition(this.context);
      }
    }

    this._previousState = prev;
    this._currentState = nextState;
    this._timeInState = 0;

    if (prev && recordHistory) {
      this._history.push(prev);
      if (this._history.length > this.maxHistory) {
        this._history.shift();
      }
    }

    // Call onEnter on new state
    if (nextConfig?.onEnter) {
      nextConfig.onEnter(this.context, prev);
    }

    this.events.emit('state_changed', { from: prev, to: nextState, context: this.context });
    return true;
  }

  /**
   * Fire a named event trigger to transition to a matching state.
   */
  public trigger(eventName: string): boolean {
    if (!this._currentState) return false;

    for (const t of this.transitions) {
      if ((t.from === this._currentState || t.from === '*') && t.trigger === eventName) {
        if (!t.condition || t.condition(this.context)) {
          return this.setState(t.to);
        }
      }
    }
    return false;
  }

  /**
   * Check if transitioning to a state is allowed from current state.
   */
  public canTransitionTo(targetState: TState): boolean {
    if (!this._currentState) return true;
    if (this.transitions.length === 0) return true; // Unrestricted if no transitions declared

    return this.transitions.some(t => {
      if (t.from !== this._currentState && t.from !== '*') return false;
      if (t.to !== targetState) return false;
      if (t.condition && !t.condition(this.context)) return false;
      return true;
    });
  }

  /**
   * Revert to the immediately preceding state in history.
   */
  public revertToPreviousState(): boolean {
    if (this._history.length === 0) return false;
    const prev = this._history.pop()!;
    return this.setState(prev, true, false);
  }

  /**
   * Update the active state and automatically evaluate conditional transition rules.
   */
  public update(dt: number): void {
    if (!this._currentState) return;
    this._timeInState += dt;

    // 1. Check auto-evaluating conditional transitions
    for (const t of this.transitions) {
      if (t.trigger) continue; // Trigger-based transitions are explicitly fired via trigger()
      if ((t.from === this._currentState || t.from === '*') && t.to !== this._currentState) {
        if (t.condition && t.condition(this.context)) {
          this.setState(t.to);
          return;
        }
      }
    }

    // 2. Tick current state onUpdate
    const config = this.states.get(this._currentState);
    if (config?.onUpdate) {
      config.onUpdate(this.context, dt);
    }
  }

  public get currentState(): TState | null {
    return this._currentState;
  }

  public get previousState(): TState | null {
    return this._previousState;
  }

  public get timeInState(): number {
    return this._timeInState;
  }

  public get history(): readonly TState[] {
    return this._history;
  }

  public is(stateName: TState): boolean {
    return this._currentState === stateName;
  }

  public reset(initialState?: TState): void {
    this._history = [];
    this._previousState = null;
    this._timeInState = 0;
    if (initialState) {
      this.setState(initialState, true);
    } else {
      this._currentState = null;
    }
  }
}

export { StateMachine as FSM };
