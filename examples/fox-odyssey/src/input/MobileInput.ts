export interface InputVector {
  x: number;
  y: number;
}

export class MobileInput {
  public moveVector: InputVector = { x: 0, y: 0 };
  public isPouncing: boolean = false;
  public onJump: (() => void) | null = null;
  public onPounce: (() => void) | null = null;
  public onSpiritCall: (() => void) | null = null;
  public onTogglePhotoMode: (() => void) | null = null;

  private joystickZone: HTMLElement | null = null;
  private joystickKnob: HTMLElement | null = null;
  private activeTouchId: number | null = null;
  private isPointerTracking: boolean = false;
  private joystickCenter = { x: 0, y: 0 };
  private maxRadius = 45;

  private keys: Record<string, boolean> = {};

  constructor() {
    this.initKeyboard();
    this.initTouchControls();
  }

  private initKeyboard() {
    window.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      if (e.code === 'Space') {
        e.preventDefault();
        this.triggerJump();
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        this.isPouncing = true;
        this.triggerPounce();
      } else if (e.code === 'KeyE') {
        this.triggerSpiritCall();
      } else if (e.code === 'KeyQ') {
        if (this.onTogglePhotoMode) this.onTogglePhotoMode();
      }
    });

    window.addEventListener('keyup', e => {
      this.keys[e.code] = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        this.isPouncing = false;
      }
    });
  }

  private initTouchControls() {
    this.joystickZone = document.getElementById('touch-joystick');
    this.joystickKnob = document.getElementById('joystick-knob');

    const mobileJumpBtn = document.getElementById('mobile-jump-btn');
    const mobilePounceBtn = document.getElementById('mobile-pounce-btn');
    const mobileBarkBtn = document.getElementById('mobile-bark-btn');

    // 1. Action Buttons Multi-Touch & Pointer Handlers
    const bindButton = (el: HTMLElement | null, onDown: () => void, onUp?: () => void) => {
      if (!el) return;

      const handleDown = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        onDown();
      };

      const handleUp = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        if (onUp) onUp();
      };

      el.addEventListener('pointerdown', handleDown);
      el.addEventListener('pointerup', handleUp);
      el.addEventListener('pointercancel', handleUp);
      el.addEventListener('touchstart', handleDown, { passive: false });
      el.addEventListener('touchend', handleUp, { passive: false });
      el.addEventListener('touchcancel', handleUp, { passive: false });
    };

    bindButton(mobileJumpBtn, () => this.triggerJump());
    bindButton(
      mobilePounceBtn,
      () => {
        this.isPouncing = true;
        this.triggerPounce();
      },
      () => {
        this.isPouncing = false;
      }
    );
    bindButton(mobileBarkBtn, () => this.triggerSpiritCall());

    // 2. Fixed & Dynamic Joystick Touch Tracking
    const startJoystick = (clientX: number, clientY: number, touchId: number | null) => {
      this.activeTouchId = touchId;
      this.isPointerTracking = true;

      if (this.joystickZone) {
        const rect = this.joystickZone.getBoundingClientRect();
        this.joystickCenter = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
      } else {
        this.joystickCenter = { x: clientX, y: clientY };
      }

      this.updateJoystick(clientX, clientY);
    };

    // Dedicated Joystick Zone direct pointerdown
    if (this.joystickZone) {
      this.joystickZone.addEventListener('pointerdown', (e: PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        startJoystick(e.clientX, e.clientY, e.pointerId);
      });
    }

    // Dynamic Touch on Left 55% of Screen
    window.addEventListener(
      'touchstart',
      (e: TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          // Check if touch is on left half of screen and not over action buttons/HUD top bar
          if (this.activeTouchId === null && touch.clientX < window.innerWidth * 0.55 && touch.clientY > 90) {
            startJoystick(touch.clientX, touch.clientY, touch.identifier);
            break;
          }
        }
      },
      { passive: false }
    );

    // Touch / Pointer Move
    window.addEventListener(
      'touchmove',
      (e: TouchEvent) => {
        if (this.activeTouchId === null) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (touch.identifier === this.activeTouchId) {
            e.preventDefault();
            this.updateJoystick(touch.clientX, touch.clientY);
            break;
          }
        }
      },
      { passive: false }
    );

    window.addEventListener('pointermove', (e: PointerEvent) => {
      if (this.isPointerTracking && (this.activeTouchId === null || this.activeTouchId === e.pointerId)) {
        this.updateJoystick(e.clientX, e.clientY);
      }
    });

    // Touch / Pointer End
    const resetJoystick = () => {
      this.activeTouchId = null;
      this.isPointerTracking = false;
      this.moveVector = { x: 0, y: 0 };
      if (this.joystickKnob) {
        this.joystickKnob.style.transform = `translate(-50%, -50%)`;
      }
    };

    window.addEventListener('touchend', (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === this.activeTouchId) {
          resetJoystick();
          break;
        }
      }
    });
    window.addEventListener('touchcancel', resetJoystick);
    window.addEventListener('pointerup', resetJoystick);
    window.addEventListener('pointercancel', resetJoystick);
  }

  private updateJoystick(clientX: number, clientY: number) {
    const dx = clientX - this.joystickCenter.x;
    const dy = clientY - this.joystickCenter.y;
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(dist, this.maxRadius);
    const angle = Math.atan2(dy, dx);

    // Direct Cartesian normalized vectors (nx: left/right, ny: up/down)
    const nx = (Math.cos(angle) * clampedDist) / this.maxRadius;
    const ny = (Math.sin(angle) * clampedDist) / this.maxRadius;
    this.moveVector = { x: nx, y: ny };

    if (this.joystickKnob) {
      const px = Math.cos(angle) * clampedDist;
      const py = Math.sin(angle) * clampedDist;
      this.joystickKnob.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`;
    }
  }

  public triggerJump() {
    this.vibrate(20);
    if (this.onJump) this.onJump();
  }

  public triggerPounce() {
    this.vibrate(25);
    if (this.onPounce) this.onPounce();
  }

  public triggerSpiritCall() {
    this.vibrate(35);
    if (this.onSpiritCall) this.onSpiritCall();
  }

  private vibrate(durationMs: number) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(durationMs);
      } catch (e) {}
    }
  }

  public update(): InputVector {
    let x = this.moveVector.x;
    let y = this.moveVector.y;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) y -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) y += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) x -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) x += 1;

    if (this.keys['ShiftLeft'] || this.keys['ShiftRight']) {
      this.isPouncing = true;
    }

    const len = Math.hypot(x, y);
    if (len > 1.0) {
      x /= len;
      y /= len;
    }

    return { x, y };
  }
}
