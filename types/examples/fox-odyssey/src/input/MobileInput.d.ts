export interface InputVector {
    x: number;
    y: number;
}
export declare class MobileInput {
    moveVector: InputVector;
    isPouncing: boolean;
    private _outVector;
    onJump: (() => void) | null;
    onPounce: (() => void) | null;
    onSpiritCall: (() => void) | null;
    onTogglePhotoMode: (() => void) | null;
    private joystickZone;
    private joystickKnob;
    private activeTouchId;
    private isPointerTracking;
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
