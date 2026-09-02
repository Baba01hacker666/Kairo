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
/**
 * Wire up keyboard, joystick and action buttons. Keyboard input is always
 * available (hybrid devices) while the touch joystick only contributes when
 * a finger is actively on it. Returns a small controller facade.
 */
export declare function createControls(app: KairoApp, buttons: {
    sprint: string;
    jump: string;
}): GameControls;
