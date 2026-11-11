/**
 * Engine Time tracking and frame rate metrics
 */
export declare class Time {
    static deltaTime: number;
    static fixedDeltaTime: number;
    static elapsedTime: number;
    static timeScale: number;
    static fps: number;
    static frameCount: number;
    private static lastTime;
    private static frameTimeAccumulator;
    private static framesThisSecond;
    /** Start a new timing interval without advancing simulation time. */
    static resetClock(): void;
    static update(currentTime: number): void;
}
