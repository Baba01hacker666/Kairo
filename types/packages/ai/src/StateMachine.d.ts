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
export declare class StateMachine<TContext = any, TState extends string = string> {
    readonly context: TContext;
    private states;
    private transitions;
    private _currentState;
    private _previousState;
    private _timeInState;
    private _history;
    private maxHistory;
    readonly events: EventEmitter;
    constructor(context: TContext, options?: StateMachineOptions<TState>);
    /**
     * Register or configure a state with enter, update, and exit hooks.
     */
    state(name: TState, config?: StateConfig<TContext, TState>): this;
    /**
     * Register a transition between states.
     * Can be triggered via boolean condition in update() or named event in trigger().
     */
    transition(from: TState | '*', to: TState, conditionOrTrigger?: string | ((context: TContext) => boolean), onTransition?: (context: TContext) => void): this;
    /**
     * Directly switch to a target state. Checks valid transitions unless force = true.
     */
    setState(nextState: TState, force?: boolean, recordHistory?: boolean): boolean;
    /**
     * Fire a named event trigger to transition to a matching state.
     */
    trigger(eventName: string): boolean;
    /**
     * Check if transitioning to a state is allowed from current state.
     */
    canTransitionTo(targetState: TState): boolean;
    /**
     * Revert to the immediately preceding state in history.
     */
    revertToPreviousState(): boolean;
    /**
     * Update the active state and automatically evaluate conditional transition rules.
     */
    update(dt: number): void;
    get currentState(): TState | null;
    get previousState(): TState | null;
    get timeInState(): number;
    get history(): readonly TState[];
    is(stateName: TState): boolean;
    reset(initialState?: TState): void;
}
export { StateMachine as FSM };
