import { Time } from './Time.ts';
import { Scene } from './Scene.ts';
import { EventEmitter } from './EventSystem.ts';

export const EngineState = {
  Stopped: 'STOPPED',
  Running: 'RUNNING',
  Paused: 'PAUSED'
} as const;

export type EngineStateType = typeof EngineState[keyof typeof EngineState];

export class Engine {
  public state: EngineStateType = EngineState.Stopped;
  public activeScene: Scene;
  public events: EventEmitter = new EventEmitter();
  
  private animationFrameId: number | null = null;
  private fixedUpdateAccumulator: number = 0;
  private loopGeneration: number = 0;

  constructor() {
    this.activeScene = new Scene('Main Scene');
  }

  public start(): void {
    if (this.state === EngineState.Running) return;
    this.state = EngineState.Running;
    this.loopGeneration++;
    Time.resetClock();
    const generation = this.loopGeneration;
    this.events.emit('started');
    if (generation === this.loopGeneration && this.state === EngineState.Running) this.loop(performance.now());
  }

  public pause(): void {
    if (this.state !== EngineState.Running) return;
    this.state = EngineState.Paused;
    this.loopGeneration++;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.events.emit('paused');
  }

  public resume(): void {
    if (this.state === EngineState.Paused) {
      this.state = EngineState.Running;
      this.loopGeneration++;
      Time.resetClock();
      const generation = this.loopGeneration;
      this.events.emit('resumed');
      if (generation === this.loopGeneration && this.state === EngineState.Running) this.loop(performance.now());
    }
  }

  public stop(): void {
    this.state = EngineState.Stopped;
    this.loopGeneration++;
    this.fixedUpdateAccumulator = 0;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.events.emit('stopped');
  }

  private loop = (timestamp: number): void => {
    if (this.state !== EngineState.Running) return;

    const generation = this.loopGeneration;
    Time.update(timestamp);
    this.fixedUpdateAccumulator += Math.min(Time.deltaTime, 0.1);

    // Cap fixed update accumulator to max 5 steps to prevent spiral of death
    const maxAccumulator = Time.fixedDeltaTime * 5;
    if (this.fixedUpdateAccumulator > maxAccumulator) {
      this.fixedUpdateAccumulator = maxAccumulator;
    }

    while (this.fixedUpdateAccumulator >= Time.fixedDeltaTime) {
      this.fixedUpdateAccumulator -= Time.fixedDeltaTime;
      this.fixedUpdate(Time.fixedDeltaTime);
      if (generation !== this.loopGeneration) return;
    }

    this.update(Time.deltaTime);
    if (generation !== this.loopGeneration) return;
    this.render();

    if (generation === this.loopGeneration && this.state === EngineState.Running && typeof requestAnimationFrame !== 'undefined') {
      this.animationFrameId = requestAnimationFrame(this.loop);
    }
  };

  private fixedUpdate(fixedDelta: number): void {
    this.events.emit('fixedUpdate', fixedDelta);
  }

  private update(delta: number): void {
    this.activeScene.root.updateMatrix();
    this.events.emit('update', delta);
  }

  private render(): void {
    this.events.emit('render');
  }
}
