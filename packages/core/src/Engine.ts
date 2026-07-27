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

  constructor() {
    this.activeScene = new Scene('Main Scene');
  }

  public start(): void {
    if (this.state === EngineState.Running) return;
    this.state = EngineState.Running;
    this.events.emit('started');
    this.loop(performance.now());
  }

  public pause(): void {
    this.state = EngineState.Paused;
    this.events.emit('paused');
  }

  public resume(): void {
    if (this.state === EngineState.Paused) {
      this.state = EngineState.Running;
      this.events.emit('resumed');
      this.loop(performance.now());
    }
  }

  public stop(): void {
    this.state = EngineState.Stopped;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.events.emit('stopped');
  }

  private loop = (timestamp: number): void => {
    if (this.state !== EngineState.Running) return;

    Time.update(timestamp);
    this.fixedUpdateAccumulator += Time.deltaTime;

    while (this.fixedUpdateAccumulator >= Time.fixedDeltaTime) {
      this.fixedUpdate(Time.fixedDeltaTime);
      this.fixedUpdateAccumulator -= Time.fixedDeltaTime;
    }

    this.update(Time.deltaTime);
    this.render();

    if (typeof requestAnimationFrame !== 'undefined') {
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
