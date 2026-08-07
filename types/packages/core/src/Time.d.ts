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
    static update(currentTime: number): void;
}
