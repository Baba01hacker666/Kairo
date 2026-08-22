import { Vector2 } from '../../core/src/Math.ts';
import { ComboDetector, InputCombo } from './ComboDetector.ts';

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

  public readonly combos: ComboDetector = new ComboDetector();

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
        this.combos.feed(e.code);
      }
      this.keysPressed.add(e.code);
    });

    window.addEventListener('keyup', (e) => {
      this.keysPressed.delete(e.code);
      this.keysJustReleased.add(e.code);
    });

    window.addEventListener('mousemove', (e) => {
      // Accumulate: several mousemove events can fire within one frame, and
      // overwriting would drop all but the last event's motion.
      this.mouseDelta.x += e.movementX;
      this.mouseDelta.y += e.movementY;
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

    // Release everything on focus loss so keys/mouse buttons don't get
    // stuck "held" after alt-tabbing or switching windows mid-press.
    window.addEventListener('blur', () => {
      this.keysPressed.clear();
      this.keysJustPressed.clear();
      this.keysJustReleased.clear();
      this.mouseButtonsPressed.clear();
      this.mouseButtonsJustPressed.clear();
      this.combos.reset();
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
    return keys.some(k => {
      if (k.startsWith('Mouse')) {
        return this.mouseButtonsJustPressed.has(parseInt(k.replace('Mouse', '')));
      }
      return this.isKeyJustPressed(k);
    });
  }

  public getMovementVector(): Vector2 {
    const vec = new Vector2(0, 0);

    if (this.touchJoystickActive) {
      vec.x += -this.touchJoystickVector.x;
      vec.y += -this.touchJoystickVector.y;
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
        if (Math.abs(axisX) > 0.15) vec.x -= axisX;
        if (Math.abs(axisY) > 0.15) vec.y -= axisY;
      }
    }

    if (vec.lengthSq() > 1) {
      vec.normalize();
    }

    return vec;
  }

  /**
   * Inject native mobile touch joystick & action buttons into DOM
   */
  public setupMobileControls(container?: HTMLElement): void {
    if (typeof document === 'undefined') return;

    if (document.getElementById('kairo-touch-joystick-container')) return;

    const parent = container || document.body;

    // Create Virtual Joystick Base
    const joystickContainer = document.createElement('div');
    joystickContainer.id = 'kairo-touch-joystick-container';
    joystickContainer.style.cssText = `
      position: absolute;
      bottom: 30px;
      left: 30px;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.15);
      border: 2px solid rgba(255, 255, 255, 0.3);
      touch-action: none;
      user-select: none;
      z-index: 9999;
    `;

    const joystickStick = document.createElement('div');
    joystickStick.id = 'kairo-touch-joystick-knob';
    joystickStick.style.cssText = `
      position: absolute;
      top: 35px;
      left: 35px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      touch-action: none;
      user-select: none;
      transition: transform 0.05s ease-out;
    `;
    joystickContainer.appendChild(joystickStick);

    // Create Jump Button (Bottom Right)
    const jumpBtn = document.createElement('button');
    jumpBtn.id = 'kairo-touch-jump-btn';
    jumpBtn.innerText = 'JUMP';
    jumpBtn.style.cssText = `
      position: absolute;
      bottom: 40px;
      right: 30px;
      width: 75px;
      height: 75px;
      border-radius: 50%;
      background: rgba(59, 130, 246, 0.7);
      border: 2px solid rgba(255, 255, 255, 0.5);
      color: white;
      font-weight: bold;
      font-family: sans-serif;
      font-size: 14px;
      touch-action: none;
      user-select: none;
      z-index: 9999;
      box-shadow: 0 4px 14px rgba(0,0,0,0.4);
    `;

    parent.appendChild(joystickContainer);
    parent.appendChild(jumpBtn);

    // Touch Event Handling for Joystick
    let touchId: number | null = null;
    const center = { x: 60, y: 60 };
    const maxRadius = 45;

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touchId === null || touch.identifier === touchId) {
          touchId = touch.identifier;
          const rect = joystickContainer.getBoundingClientRect();
          const dx = touch.clientX - (rect.left + center.x);
          const dy = touch.clientY - (rect.top + center.y);
          // ⚡ Bolt: Math.hypot has measurable overhead in V8 due to internal overflow handling.
          // Using explicit arithmetic (Math.sqrt(dx*dx + dy*dy)) in this hot path avoids that overhead
          // and improves touch tracking performance without sacrificing readability or safety.
          const dist = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);
          const clampedRadius = Math.min(dist, maxRadius);
          const knobX = Math.cos(angle) * clampedRadius;
          const knobY = Math.sin(angle) * clampedRadius;

          joystickStick.style.transform = `translate(${knobX}px, ${knobY}px)`;
          this.touchJoystickActive = true;
          this.touchJoystickVector.set(knobX / maxRadius, knobY / maxRadius);
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) {
          touchId = null;
          joystickStick.style.transform = 'translate(0px, 0px)';
          this.touchJoystickActive = false;
          this.touchJoystickVector.set(0, 0);
        }
      }
    };

    joystickContainer.addEventListener('touchstart', handleTouchMove, { passive: false });
    joystickContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    joystickContainer.addEventListener('touchend', handleTouchEnd);
    joystickContainer.addEventListener('touchcancel', handleTouchEnd);

    // Jump button listener
    jumpBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.keysJustPressed.add('Space');
      this.keysPressed.add('Space');
    }, { passive: false });

    jumpBtn.addEventListener('touchend', (e) => {
      this.keysPressed.delete('Space');
    });
  }

  public registerCombo(
    nameOrCombo: string | InputCombo,
    sequence?: string[],
    onTrigger?: () => void,
    maxDelayMs?: number
  ): this {
    if (typeof nameOrCombo === 'object') {
      this.combos.register(nameOrCombo);
    } else if (sequence) {
      this.combos.register({
        name: nameOrCombo,
        sequence,
        onTrigger,
        maxDelayMs
      });
    }
    return this;
  }

  public endFrame(): void {
    this.keysJustPressed.clear();
    this.keysJustReleased.clear();
    this.mouseButtonsJustPressed.clear();
    this.mouseDelta.set(0, 0);
  }
}

export const GlobalInput = new InputManager();

