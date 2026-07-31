import { RenderMetrics } from '@kairo/renderer';

export class DebugInspector {
  private overlay: HTMLElement | null = null;
  private metricsElement: HTMLElement | null = null;
  private entityCountElement: HTMLElement | null = null;
  public visible: boolean = false;

  constructor() {
    // Hidden by default, toggled with tilde `~` or F3
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', (e) => {
        if (e.code === 'Backquote' || e.code === 'F3') {
          this.toggle();
        }
      });
    }
  }

  public createOverlay(): void {
    if (this.overlay) return;

    this.overlay = document.createElement('div');
    this.overlay.id = 'kairo-debug-inspector';
    this.overlay.style.cssText = `
      position: absolute;
      top: 12px;
      right: 12px;
      width: 260px;
      background: rgba(9, 9, 11, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 10px;
      padding: 14px;
      color: #fafafa;
      font-family: monospace;
      font-size: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      z-index: 9999;
      pointer-events: auto;
      display: none;
    `;

    this.overlay.innerHTML = `
      <div style="font-weight: bold; border-bottom: 1px solid #333; padding-bottom: 6px; margin-bottom: 8px; color: #3b82f6; display: flex; justify-content: space-between; align-items: center;">
        <span>🛠️ Kairo Engine Profiler</span>
        <span style="font-size: 10px; color: #888;">[~] Toggle</span>
      </div>
      <div id="kairo-metrics-content" style="line-height: 1.6;">
        FPS: --<br>
        Frame: -- ms<br>
        Draw Calls: --<br>
        Triangles: --<br>
        Geometries: --<br>
        Textures: --
      </div>
      <div id="kairo-ecs-content" style="margin-top: 8px; border-top: 1px dashed #333; padding-top: 6px; color: #10b981;">
        Active Entities: --
      </div>
    `;

    document.body.appendChild(this.overlay);
    this.metricsElement = this.overlay.querySelector('#kairo-metrics-content');
    this.entityCountElement = this.overlay.querySelector('#kairo-ecs-content');
  }

  public toggle(): void {
    this.visible = !this.visible;
    if (!this.overlay) this.createOverlay();
    if (this.overlay) {
      this.overlay.style.display = this.visible ? 'block' : 'none';
    }
  }

  public update(metrics: RenderMetrics, entityCount: number = 0): void {
    if (!this.visible) return;
    if (!this.overlay) this.createOverlay();

    if (this.metricsElement) {
      this.metricsElement.innerHTML = `
        <span style="color: ${metrics.fps >= 55 ? '#10b981' : '#f59e0b'};">FPS: ${metrics.fps}</span><br>
        Frame Time: ${metrics.frameTimeMs} ms<br>
        Draw Calls: ${metrics.drawCalls}<br>
        Triangles: ${metrics.triangles.toLocaleString()}<br>
        Geometries: ${metrics.geometries}<br>
        Textures: ${metrics.textures}
      `;
    }

    if (this.entityCountElement) {
      this.entityCountElement.innerText = `Active ECS Entities: ${entityCount}`;
    }
  }
}

export const GlobalDebugInspector = new DebugInspector();
