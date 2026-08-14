export interface InputVector {
  x: number;
  y: number;
}

export class MobileInput {
  public moveVector: InputVector = { x: 0, y: 0 };
  public isPouncing: boolean = false;
  private _outVector: InputVector = { x: 0, y: 0 }; // Reused to avoid per-frame allocation
  public onJump: (() => void) | null = null;
  public onPounce: (() => void) | null = null;
  public onSpiritCall: (() => void) | null = null;
  public onTogglePhotoMode: (() => void) | null = null;

  // 3D Camera Look & Orbit Drag
  public lookDelta: { x: number; y: number } = { x: 0, y: 0 };
  public zoomDelta: number = 0;
  private cameraTouchId: number | null = null;
  private lastCameraTouch = { x: 0, y: 0 };
  private isMouseDraggingCamera: boolean = false;
  private lastMousePos = { x: 0, y: 0 };

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
    this.initMouseCameraControls();
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

    // Dynamic Touch Handling: Left 50% = Joystick, Right 50% = Camera Look Orbit
    window.addEventListener(
      'touchstart',
      (e: TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          const isOverButtons = (e.target as HTMLElement)?.closest?.('.mobile-buttons, .photo-bar, .dialogue-box, .victory-modal');
          if (isOverButtons) continue;

          // Left Half of Screen -> Virtual Joystick
          if (this.activeTouchId === null && touch.clientX < window.innerWidth * 0.52 && touch.clientY > 90) {
            startJoystick(touch.clientX, touch.clientY, touch.identifier);
          }
          // Right Half of Screen -> Camera Look Drag
          else if (this.cameraTouchId === null && touch.clientX >= window.innerWidth * 0.48 && touch.clientY > 80) {
            this.cameraTouchId = touch.identifier;
            this.lastCameraTouch = { x: touch.clientX, y: touch.clientY };
          }
        }
      },
      { passive: false }
    );

    // Touch Move: Track Joystick + Camera Look
    window.addEventListener(
      'touchmove',
      (e: TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (touch.identifier === this.activeTouchId) {
            e.preventDefault();
            this.updateJoystick(touch.clientX, touch.clientY);
          } else if (touch.identifier === this.cameraTouchId) {
            e.preventDefault();
            const dx = touch.clientX - this.lastCameraTouch.x;
            const dy = touch.clientY - this.lastCameraTouch.y;
            this.lookDelta.x += dx;
            this.lookDelta.y += dy;
            this.lastCameraTouch = { x: touch.clientX, y: touch.clientY };
          }
        }
      },
      { passive: false }
    );

    // Touch End
    const resetJoystick = () => {
      this.activeTouchId = null;
      this.isPointerTracking = false;
      this.moveVector.x = 0;
      this.moveVector.y = 0;
      if (this.joystickKnob) {
        this.joystickKnob.style.transform = `translate(-50%, -50%)`;
      }
    };

    window.addEventListener('touchend', (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === this.activeTouchId) {
          resetJoystick();
        }
        if (touch.identifier === this.cameraTouchId) {
          this.cameraTouchId = null;
        }
      }
    });

    window.addEventListener('touchcancel', (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === this.activeTouchId) resetJoystick();
        if (touch.identifier === this.cameraTouchId) this.cameraTouchId = null;
      }
    });

    // Reset touch tracking on screen rotation & window resize
    const handleLayoutChange = () => {
      resetJoystick();
      this.cameraTouchId = null;
      this.lookDelta.x = 0;
      this.lookDelta.y = 0;
    };
    window.addEventListener('resize', handleLayoutChange);
    window.addEventListener('orientationchange', handleLayoutChange);
  }

  private initMouseCameraControls() {
    window.addEventListener('pointerdown', (e: PointerEvent) => {
      if (e.pointerType === 'touch') return; // Handled by touch events
      const isOverInteractive = (e.target as HTMLElement)?.closest?.('button, input, #hud, .dialogue-box, .victory-card, #touch-joystick');
      if (isOverInteractive) return;

      this.isMouseDraggingCamera = true;
      this.lastMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointermove', (e: PointerEvent) => {
      if (this.isMouseDraggingCamera) {
        const dx = e.clientX - this.lastMousePos.x;
        const dy = e.clientY - this.lastMousePos.y;
        this.lookDelta.x += dx;
        this.lookDelta.y += dy;
        this.lastMousePos = { x: e.clientX, y: e.clientY };
      }
    });

    const stopMouse = () => {
      this.isMouseDraggingCamera = false;
    };
    window.addEventListener('pointerup', stopMouse);
    window.addEventListener('pointercancel', stopMouse);

    // Zoom on wheel
    window.addEventListener(
      'wheel',
      (e: WheelEvent) => {
        this.zoomDelta += e.deltaY * 0.004;
      },
      { passive: true }
    );
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
    this.moveVector.x = nx;
    this.moveVector.y = ny;

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

  /**
   * Consume and reset camera look deltas for smooth frame rotation
   */
  public consumeLookDelta(): { x: number; y: number; zoom: number } {
    const res = { x: this.lookDelta.x, y: this.lookDelta.y, zoom: this.zoomDelta };
    this.lookDelta.x = 0;
    this.lookDelta.y = 0;
    this.zoomDelta = 0;
    return res;
  }

  public update(): InputVector {
    let x = this.moveVector.x;
    let y = this.moveVector.y;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) y -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) y += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) x -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) x += 1;

    const len = Math.hypot(x, y);
    if (len > 1.0) {
      x /= len;
      y /= len;
    }

    // Write into a reused object so no garbage is produced at 60fps
    this._outVector.x = x;
    this._outVector.y = y;
    return this._outVector;
  }
}
