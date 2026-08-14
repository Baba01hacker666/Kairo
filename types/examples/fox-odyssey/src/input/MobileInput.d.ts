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
    lookDelta: {
        x: number;
        y: number;
    };
    zoomDelta: number;
    private cameraTouchId;
    private lastCameraTouch;
    private isMouseDraggingCamera;
    private lastMousePos;
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
    private initMouseCameraControls;
    private updateJoystick;
    triggerJump(): void;
    triggerPounce(): void;
    triggerSpiritCall(): void;
    private vibrate;
    /**
     * Consume and reset camera look deltas for smooth frame rotation
     */
    consumeLookDelta(): {
        x: number;
        y: number;
        zoom: number;
    };
    update(): InputVector;
}
