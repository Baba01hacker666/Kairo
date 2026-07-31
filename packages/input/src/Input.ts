import { Vector2 } from '@kairo/core';

export enum MouseButton {
  Left = 0,
  Middle = 1,
  Right = 2
}

export type InputAction =
  | 'MoveForward'
  | 'MoveBackward'
  | 'MoveLeft'
  | 'MoveRight'
  | 'Jump'
  | 'Interact'
  | 'Sprint'
  | 'Undo'
  | 'Restart'
  | 'Hint'
  | 'Menu'
  | 'Pause';

export class InputManager {
  private keysPressed: Set<string> = new Set();
  private keysJustPressed: Set<string> = new Set();
  private keysJustReleased: Set<string> = new Set();

  public mousePosition: Vector2 = new Vector2();
  public mouseDelta: Vector2 = new Vector2();
  private mouseButtonsPressed: Set<number> = new Set();
  private mouseButtonsJustPressed: Set<number> = new Set();

  public touchJoystickActive: boolean = false;
  public touchJoystickVector: Vector2 = new Vector2(0, 0);

  private actionBindings: Map<InputAction, string[]> = new Map();

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
    this.actionBindings.set('Interact', ['KeyE', 'Enter']);
    this.actionBindings.set('Sprint', ['ShiftLeft', 'ShiftRight']);
    this.actionBindings.set('Undo', ['KeyZ', 'KeyU']);
    this.actionBindings.set('Restart', ['KeyR']);
    this.actionBindings.set('Hint', ['KeyH']);
    this.actionBindings.set('Pause', ['Escape', 'KeyP']);
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

  public bindAction(action: InputAction, keys: string[]): void {
    this.actionBindings.set(action, keys);
  }

  public getActionBindings(action: InputAction): string[] {
    return this.actionBindings.get(action) || [];
  }

  public isActionActive(actionName: InputAction): boolean {
    const keys = this.actionBindings.get(actionName) || [];
    const keyActive = keys.some(k => k.startsWith('Mouse') ? this.mouseButtonsPressed.has(parseInt(k.replace('Mouse', ''))) : this.isKeyDown(k));
    if (keyActive) return true;

    // Check Gamepad API if available
    if (typeof navigator !== 'undefined' && navigator.getGamepads) {
      const gamepads = navigator.getGamepads();
      for (const gp of gamepads) {
        if (!gp) continue;
        if (actionName === 'Jump' && gp.buttons[0]?.pressed) return true; // A button
        if (actionName === 'Interact' && gp.buttons[2]?.pressed) return true; // X button
        if (actionName === 'Undo' && gp.buttons[3]?.pressed) return true; // Y button
        if (actionName === 'Hint' && gp.buttons[1]?.pressed) return true; // B button
        if (actionName === 'Pause' && gp.buttons[9]?.pressed) return true; // Start button
        if (actionName === 'Sprint' && gp.buttons[10]?.pressed) return true; // L3
      }
    }

    return false;
  }

  public isActionJustPressed(actionName: InputAction): boolean {
    const keys = this.actionBindings.get(actionName) || [];
    return keys.some(k => this.isKeyJustPressed(k));
  }

  public getMovementVector(): Vector2 {
    const vec = new Vector2(0, 0);

    if (this.touchJoystickActive) {
      vec.x = -this.touchJoystickVector.x;
      vec.y = -this.touchJoystickVector.y;
      return vec;
    }

    if (this.isActionActive('MoveForward')) vec.y += 1;
    if (this.isActionActive('MoveBackward')) vec.y -= 1;
    if (this.isActionActive('MoveRight')) vec.x -= 1;
    if (this.isActionActive('MoveLeft')) vec.x += 1;

    // Check Gamepad Left Stick
    if (typeof navigator !== 'undefined' && navigator.getGamepads) {
      const gamepads = navigator.getGamepads();
      for (const gp of gamepads) {
        if (!gp) continue;
        const axisX = gp.axes[0];
        const axisY = gp.axes[1];
        if (Math.abs(axisX) > 0.15) vec.x = -axisX;
        if (Math.abs(axisY) > 0.15) vec.y = -axisY;
      }
    }

    if (vec.lengthSq() > 1) {
      vec.normalize();
    }

    return vec;
  }

  public endFrame(): void {
    this.keysJustPressed.clear();
    this.keysJustReleased.clear();
    this.mouseButtonsJustPressed.clear();
    this.mouseDelta.set(0, 0);
  }
}

export const GlobalInput = new InputManager();
