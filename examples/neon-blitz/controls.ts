import { KairoApp } from '@kairo/core';

export interface MoveInput {
  xAxis: number;
  zAxis: number;
}

export interface GameControls {
  readMove(): MoveInput;
  isSprintPressed(): boolean;
  isJumpPressed(): boolean;
  consumeJump(): void;
  tick(dt: number): void;
}

const JOYSTICK_RADIUS = 50;
const JUMP_BUFFER = 0.15;

/**
 * Wire up keyboard, joystick and action buttons. Keyboard input is always
 * available (hybrid devices) while the touch joystick only contributes when
 * a finger is actively on it. Returns a small controller facade.
 */
export function createControls(app: KairoApp, buttons: { sprint: string; jump: string }): GameControls {
  let jumpHeld = false;
  let jumpBuffer = 0;

  const joyCenter = { x: 0, y: 0 };
  const joyZone = document.getElementById('joy-zone') as HTMLElement;
  const joyKnob = document.getElementById('joy-knob') as HTMLElement;

  function updateJoystick(touch: Touch): void {
    let offsetX = touch.clientX - joyCenter.x;
    let offsetY = touch.clientY - joyCenter.y;
    const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
    if (distance > JOYSTICK_RADIUS) {
      offsetX = (offsetX / distance) * JOYSTICK_RADIUS;
      offsetY = (offsetY / distance) * JOYSTICK_RADIUS;
    }
    joyKnob.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
    app.input.touchJoystickVector.set(offsetX / JOYSTICK_RADIUS, offsetY / JOYSTICK_RADIUS);
  }

  function resetJoystick(): void {
    app.input.touchJoystickActive = false;
    app.input.touchJoystickVector.set(0, 0);
    joyKnob.style.transform = 'translate(-50%, -50%)';
  }

  joyZone.addEventListener(
    'touchstart',
    (touchEvent) => {
      touchEvent.preventDefault();
      app.input.touchJoystickActive = true;
      const rect = joyZone.getBoundingClientRect();
      joyCenter.x = rect.left + rect.width / 2;
      joyCenter.y = rect.top + rect.height / 2;
      updateJoystick(touchEvent.changedTouches[0]);
    },
    { passive: false }
  );
  joyZone.addEventListener(
    'touchmove',
    (touchEvent) => {
      touchEvent.preventDefault();
      const activeTouch = Array.from(touchEvent.touches).find(
        (touch) => touch.target === joyZone || touch.target === joyKnob
      );
      if (activeTouch) updateJoystick(activeTouch);
    },
    { passive: false }
  );
  joyZone.addEventListener('touchend', resetJoystick);
  joyZone.addEventListener('touchcancel', resetJoystick);

  function bindHoldButton(buttonId: string, onDown: () => void, onUp: () => void): void {
    const button = document.getElementById(buttonId) as HTMLElement;
    if (!button) return;
    button.addEventListener(
      'touchstart',
      (touchEvent) => {
        touchEvent.preventDefault();
        onDown();
        button.classList.add('active');
      },
      { passive: false }
    );
    button.addEventListener('touchend', (touchEvent) => {
      touchEvent.preventDefault();
      onUp();
      button.classList.remove('active');
    });
    button.addEventListener('touchcancel', (touchEvent) => {
      touchEvent.preventDefault();
      onUp();
      button.classList.remove('active');
    });
  }

  bindHoldButton(
    buttons.sprint,
    () => {
      jumpHeld = true;
    },
    () => {
      jumpHeld = false;
    }
  );
  bindHoldButton(
    buttons.jump,
    () => {
      jumpBuffer = JUMP_BUFFER;
    },
    () => {}
  );

  function readMove(): MoveInput {
    let moveX = 0;
    let moveZ = 0;
    if (app.isKeyDown('KeyA') || app.isKeyDown('ArrowLeft')) moveX -= 1;
    if (app.isKeyDown('KeyD') || app.isKeyDown('ArrowRight')) moveX += 1;
    if (app.isKeyDown('KeyW') || app.isKeyDown('ArrowUp')) moveZ -= 1;
    if (app.isKeyDown('KeyS') || app.isKeyDown('ArrowDown')) moveZ += 1;

    if (app.input.touchJoystickActive) {
      const joystick = app.input.touchJoystickVector;
      moveX += joystick.x;
      moveZ += joystick.y;
    }
    return { xAxis: moveX, zAxis: moveZ };
  }

  return {
    readMove,
    isSprintPressed: () =>
      app.isKeyDown('Space') || app.isKeyDown('ShiftLeft') || app.isKeyDown('ShiftRight') || jumpHeld,
    isJumpPressed: () => app.isKeyDown('KeyJ') || jumpBuffer > 0,
    consumeJump: () => {
      jumpBuffer = 0;
    },
    tick(dt: number) {
      if (jumpBuffer > 0) jumpBuffer -= dt;
    }
  };
}
