import { Scene } from './Scene.js';
import { EventEmitter } from './EventSystem.js';
export declare const EngineState: {
    readonly Stopped: "STOPPED";
    readonly Running: "RUNNING";
    readonly Paused: "PAUSED";
};
export type EngineStateType = typeof EngineState[keyof typeof EngineState];
export declare class Engine {
    state: EngineStateType;
    activeScene: Scene;
    events: EventEmitter;
    private animationFrameId;
    private fixedUpdateAccumulator;
    private loopGeneration;
    constructor();
    start(): void;
    pause(): void;
    resume(): void;
    stop(): void;
    private loop;
    private fixedUpdate;
    private update;
    private render;
}
