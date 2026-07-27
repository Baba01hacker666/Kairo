/**
 * Engine Time tracking and frame rate metrics
 */

export class Time {
  public static deltaTime: number = 0.016;
  public static fixedDeltaTime: number = 0.0166; // 60hz
  public static elapsedTime: number = 0;
  public static timeScale: number = 1.0;
  public static fps: number = 60;
  public static frameCount: number = 0;

  private static lastTime: number = 0;
  private static frameTimeAccumulator: number = 0;
  private static framesThisSecond: number = 0;

  static update(currentTime: number): void {
    if (this.lastTime === 0) {
      this.lastTime = currentTime;
      return;
    }

    const rawDelta = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Clamp delta time to avoid large spikes on lag/tab out
    this.deltaTime = Math.min(rawDelta, 0.1) * this.timeScale;
    this.elapsedTime += this.deltaTime;
    this.frameCount++;

    // FPS calculation
    this.frameTimeAccumulator += rawDelta;
    this.framesThisSecond++;

    if (this.frameTimeAccumulator >= 1.0) {
      this.fps = this.framesThisSecond;
      this.framesThisSecond = 0;
      this.frameTimeAccumulator -= 1.0;
    }
  }
}
