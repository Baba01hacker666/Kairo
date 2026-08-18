import * as THREE from 'three';
export interface FloatingTextOptions {
    /** Text or number to display (e.g. "-45", "+20 HP", "CRITICAL!"). */
    text: string | number;
    /** 3D World coordinates or Vector3 where the floating text originates. */
    position: {
        x: number;
        y: number;
        z: number;
    } | THREE.Vector3;
    /** Text color (default: '#ef4444' for damage, '#10b981' for heal). */
    color?: string;
    /** Font size in pixels (default: 20; critical hits default: 28). */
    fontSize?: number;
    /** Total animation duration in milliseconds (default: 1200ms). */
    durationMs?: number;
    /** Highlight as a dramatic critical hit with scale pop and golden glow. */
    isCrit?: boolean;
    /** Vertical float distance in pixels (default: 60px). */
    floatDistance?: number;
    /** Camera to project world coords to screen space. */
    camera?: THREE.Camera;
    /** Optional container element. */
    container?: HTMLElement;
}
export interface FloatingHealthBarOptions {
    max?: number;
    current?: number;
    width?: number;
    height?: number;
    color?: string;
    backgroundColor?: string;
    borderRadius?: number;
    offsetY?: number;
    camera?: THREE.Camera;
    container?: HTMLElement;
}
export interface FloatingHealthBarHandle {
    setHealth: (current: number, max?: number) => void;
    updatePosition: (worldPos: {
        x: number;
        y: number;
        z: number;
    } | THREE.Vector3) => void;
    setVisible: (visible: boolean) => void;
    remove: () => void;
    readonly element: HTMLElement;
}
/**
 * 💥 FloatingTextManager
 * World-space 3D to Screen-space projection for Combat Damage Numbers, Popups, and Floating Health Bars.
 */
export declare class FloatingTextManager {
    private container;
    private activeBars;
    private _projectVec;
    constructor(container?: HTMLElement);
    /**
     * Project a 3D World position to 2D Screen pixel coordinates.
     */
    projectToScreen(pos: {
        x: number;
        y: number;
        z: number;
    } | THREE.Vector3, camera: THREE.Camera, viewportWidth?: number, viewportHeight?: number): {
        x: number;
        y: number;
        visible: boolean;
    };
    /**
     * Spawn a floating combat number or status popup at a 3D location.
     */
    spawnFloatingNumber(options: FloatingTextOptions): HTMLElement | null;
    /**
     * Create an interactive floating health bar attached to a 3D target.
     */
    createFloatingHealthBar(targetPos: {
        x: number;
        y: number;
        z: number;
    } | THREE.Vector3, options?: FloatingHealthBarOptions): FloatingHealthBarHandle;
    clear(): void;
}
export declare const GlobalFloatingText: FloatingTextManager;
