import { Vector2 } from '@kairo/core';

export enum MouseButton {
  Left = 0,
  Middle = 1,
  Right = 2
}

export class InputManager {
  private keysPressed: Set<string> = new Set();
  private keysJustPressed: Set<string> = new Set();
  private keysJustReleased: Set<string> = new Set();

  public mousePosition: Vector2 = new Vector2();
  public mouseDelta: Vector2 = new Vector2();
  private mouseButtonsPressed: Set<number> = new Set();
  private mouseButtonsJustPressed: Set<number> = new Set();

  private actionBindings: Map<string, string[]> = new Map();

  constructor() {
    this.setupListeners();
    this.setupDefaultBindings();
  }

  private setupDefaultBindings(): void {
    this.actionBindings.set('MoveForward', ['KeyW', 'ArrowUp']);
    this.actionBindings.set('MoveBackward', ['KeyS', 'ArrowDown']);
    this.actionBindings.set('MoveLeft', ['KeyA', 'ArrowLeft']);
    this.actionBindings.set('MoveRight', ['KeyD', 'ArrowRight']);
    this.actionBindings.set('Jump', ['Space']);
    this.actionBindings.set('Fire', ['KeyF', 'Mouse0']);
  }

  private setupListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (e) => {
      if (!this.keysPressed.has(e.code)) {
        this.keysJustPressed.add(e.code);
      }
      this.keysPressed.add(e.code);
    });

    window.addEventListener('keyup', (e) => {
      this.keysPressed.delete(e.code);
      this.keysJustReleased.add(e.code);
    });

    window.addEventListener('mousemove', (e) => {
      this.mouseDelta.set(e.movementX, e.movementY);
      this.mousePosition.set(e.clientX, e.clientY);
    });

    window.addEventListener('mousedown', (e) => {
      if (!this.mouseButtonsPressed.has(e.button)) {
        this.mouseButtonsJustPressed.add(e.button);
      }
      this.mouseButtonsPressed.add(e.button);
    });

    window.addEventListener('mouseup', (e) => {
      this.mouseButtonsPressed.delete(e.button);
    });
  }

  public isKeyDown(code: string): boolean {
    return this.keysPressed.has(code);
  }

  public isKeyJustPressed(code: string): boolean {
    return this.keysJustPressed.has(code);
  }

  public isActionActive(actionName: string): boolean {
    const keys = this.actionBindings.get(actionName) || [];
    return keys.some(k => k.startsWith('Mouse') ? this.mouseButtonsPressed.has(parseInt(k.replace('Mouse', ''))) : this.isKeyDown(k));
  }

  public getAxis(negativeAction: string, positiveAction: string): number {
    let val = 0;
    if (this.isActionActive(positiveAction)) val += 1;
    if (this.isActionActive(negativeAction)) val -= 1;
    return val;
  }

  public endFrame(): void {
    this.keysJustPressed.clear();
    this.keysJustReleased.clear();
    this.mouseButtonsJustPressed.clear();
    this.mouseDelta.set(0, 0);
  }
}

export const GlobalInput = new InputManager();
