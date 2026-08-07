import { Vector2 } from '@kairo/core';
export declare enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2
}
export type InputAction = 'MoveForward' | 'MoveBackward' | 'MoveLeft' | 'MoveRight' | 'Jump' | 'Interact' | 'Sprint' | 'Undo' | 'Restart' | 'Hint' | 'Menu' | 'Pause';
export declare class InputManager {
    private keysPressed;
    private keysJustPressed;
    private keysJustReleased;
    mousePosition: Vector2;
    mouseDelta: Vector2;
    private mouseButtonsPressed;
    private mouseButtonsJustPressed;
    touchJoystickActive: boolean;
    touchJoystickVector: Vector2;
    private actionBindings;
    constructor();
    private setupDefaultBindings;
    private setupListeners;
    isKeyDown(code: string): boolean;
    isKeyJustPressed(code: string): boolean;
    bindAction(action: InputAction, keys: string[]): void;
    getActionBindings(action: InputAction): string[];
    isActionActive(actionName: InputAction): boolean;
    isActionJustPressed(actionName: InputAction): boolean;
    getMovementVector(): Vector2;
    endFrame(): void;
}
export declare const GlobalInput: InputManager;
