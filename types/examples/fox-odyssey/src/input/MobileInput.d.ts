export interface InputVector {
    x: number;
    y: number;
}
export declare class MobileInput {
    moveVector: InputVector;
    isPouncing: boolean;
    onJump: (() => void) | null;
    onPounce: (() => void) | null;
    onSpiritCall: (() => void) | null;
    onTogglePhotoMode: (() => void) | null;
    private joystickContainer;
    private joystickKnob;
    private joystickTouchId;
    private joystickCenter;
    private maxRadius;
    private keys;
    constructor();
    private initKeyboard;
    private initTouchControls;
    private updateJoystick;
    triggerJump(): void;
    triggerPounce(): void;
    triggerSpiritCall(): void;
    private vibrate;
    update(): InputVector;
}
