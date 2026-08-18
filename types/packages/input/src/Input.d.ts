import { Vector2 } from '../../core/src/Math.ts';
import { ComboDetector, InputCombo } from './ComboDetector.ts';
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
    readonly combos: ComboDetector;
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
    /**
     * Inject native mobile touch joystick & action buttons into DOM
     */
    setupMobileControls(container?: HTMLElement): void;
    registerCombo(nameOrCombo: string | InputCombo, sequence?: string[], onTrigger?: () => void, maxDelayMs?: number): this;
    endFrame(): void;
}
export declare const GlobalInput: InputManager;
