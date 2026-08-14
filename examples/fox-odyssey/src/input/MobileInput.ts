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

  private joystickContainer: HTMLElement | null = null;
  private joystickKnob: HTMLElement | null = null;
  private joystickTouchId: number | null = null;
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
      } else if (e.code === 'KeyE') {
        this.triggerSpiritCall();
      } else if (e.code === 'KeyQ') {
        if (this.onTogglePhotoMode) this.onTogglePhotoMode();
      }
    });

    window.addEventListener('keyup', e => {
      this.keys[e.code] = false;
    });
  }

  private initTouchControls() {
    this.joystickContainer = document.getElementById('touch-joystick');
    this.joystickKnob = document.getElementById('joystick-knob');

    const mobileJumpBtn = document.getElementById('mobile-jump-btn');
    const mobilePounceBtn = document.getElementById('mobile-pounce-btn');
    const mobileBarkBtn = document.getElementById('mobile-bark-btn');

    if (mobileJumpBtn) {
      mobileJumpBtn.addEventListener('touchstart', e => {
        e.preventDefault();
        e.stopPropagation();
        this.triggerJump();
      }, { passive: false });
    }

    if (mobilePounceBtn) {
      mobilePounceBtn.addEventListener('touchstart', e => {
        e.preventDefault();
        e.stopPropagation();
        this.triggerPounce();
      }, { passive: false });
      mobilePounceBtn.addEventListener('touchend', e => {
        e.preventDefault();
        this.isPouncing = false;
      }, { passive: false });
    }

    if (mobileBarkBtn) {
      mobileBarkBtn.addEventListener('touchstart', e => {
        e.preventDefault();
        e.stopPropagation();
        this.triggerSpiritCall();
      }, { passive: false });
    }

    // Dynamic Full-Screen Left Touch Area for Virtual Joystick
    window.addEventListener('touchstart', e => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        // If touch is on left 50% of screen and joystick is not active
        if (this.joystickTouchId === null && touch.clientX < window.innerWidth * 0.55 && touch.clientY > 100) {
          this.joystickTouchId = touch.identifier;
          this.joystickCenter = { x: touch.clientX, y: touch.clientY };

          if (this.joystickContainer) {
            this.joystickContainer.style.display = 'block';
            this.joystickContainer.style.left = `${touch.clientX - 65}px`;
            this.joystickContainer.style.top = `${touch.clientY - 65}px`;
            this.joystickContainer.style.bottom = 'auto';
          }
          this.updateJoystick(touch.clientX, touch.clientY);
        }
      }
    }, { passive: false });

    window.addEventListener('touchmove', e => {
      if (this.joystickTouchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === this.joystickTouchId) {
          e.preventDefault();
          this.updateJoystick(touch.clientX, touch.clientY);
          break;
        }
      }
    }, { passive: false });

    const endTouch = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === this.joystickTouchId) {
          this.joystickTouchId = null;
          this.moveVector = { x: 0, y: 0 };
          if (this.joystickKnob) {
            this.joystickKnob.style.transform = `translate(-50%, -50%)`;
          }
          break;
        }
      }
    };

    window.addEventListener('touchend', endTouch);
    window.addEventListener('touchcancel', endTouch);
  }

  private updateJoystick(clientX: number, clientY: number) {
    const dx = clientX - this.joystickCenter.x;
    const dy = clientY - this.joystickCenter.y;
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(dist, this.maxRadius);
    const angle = Math.atan2(dy, dx);

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
    this.isPouncing = true;
    this.vibrate(25);
    if (this.onPounce) this.onPounce();
  }

  public triggerSpiritCall() {
    this.vibrate(35);
    if (this.onSpiritCall) this.onSpiritCall();
  }

  private vibrate(durationMs: number) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(durationMs); } catch (e) {}
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
