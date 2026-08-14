import * as THREE from 'three';

export type BugSeverity = 'critical' | 'warning' | 'info';

export type BugCategory =
  | 'nan_infinity'
  | 'physics_anomaly'
  | 'memory_leak'
  | 'rendering_glitch'
  | 'performance_spike'
  | 'runtime_error';

export interface GameBug {
  id: string;
  category: BugCategory;
  severity: BugSeverity;
  title: string;
  description: string;
  target?: string;
  details?: Record<string, any>;
  suggestedFix: string;
  timestamp: number;
}

export interface BugAuditReport {
  timestamp: number;
  healthScore: number; // 0 to 100
  totalBugs: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  bugs: GameBug[];
  metricsSummary: {
    activeEntities: number;
    sceneObjects: number;
    physicsBodies: number;
    geometriesInMemory: number;
    texturesInMemory: number;
    drawCalls: number;
    triangles: number;
  };
}

export interface FuzzTestResult {
  durationMs: number;
  actionsExecuted: number;
  bugsFoundDuringFuzz: GameBug[];
  passed: boolean;
}

export interface WatchdogOptions {
  checkIntervalFrames?: number;
  checkPhysics?: boolean;
  checkTransforms?: boolean;
  checkMemory?: boolean;
  checkPerformance?: boolean;
  autoLogToConsole?: boolean;
}

/**
 * 🐞 GameBugDetector
 * Production-grade Automated QA & Live Runtime Bug Detector for Kairo Engine.
 * Scans Scene, ECS, Physics, Shaders, and Memory to catch game-breaking anomalies,
 * NaN/Infinity propagation, leaks, tunneling, and performance regressions.
 */
export class GameBugDetector {
  public detectedBugs: GameBug[] = [];
  private bugIdCounter: number = 1;
  private isWatchdogActive: boolean = false;
  private watchdogFrameCount: number = 0;
  private watchdogUnsubscribe: (() => void) | null = null;

  // In-game UI Overlay
  private overlay: HTMLElement | null = null;
  public visible: boolean = false;

  // Track runtime console and unhandled errors
  private originalOnError: any = null;
  private originalOnUnhandledRejection: any = null;
  private onUnhandledRejection: any = null;
  private onKeydown: any = null;
  private disposed: boolean = false;

  constructor() {
    this.hookGlobalErrors();
  }

  private hookGlobalErrors(): void {
    if (typeof window !== 'undefined') {
      this.originalOnError = window.onerror;
      window.onerror = (message, source, lineno, colno, error) => {
        this.addBug({
          category: 'runtime_error',
          severity: 'critical',
          title: 'Unhandled JavaScript Runtime Exception',
          description: String(message),
          target: `${source}:${lineno}:${colno}`,
          details: { stack: error?.stack },
          suggestedFix: 'Inspect the stack trace and add defensive null/undefined checks.'
        });
        if (typeof this.originalOnError === 'function') {
          return this.originalOnError(message, source, lineno, colno, error);
        }
        return false;
      };

      this.originalOnUnhandledRejection = (window as any).onunhandledrejection;
      this.onUnhandledRejection = (event: PromiseRejectionEvent) => {
        this.addBug({
          category: 'runtime_error',
          severity: 'critical',
          title: 'Unhandled Promise Rejection',
          description: String(event.reason),
          target: 'Promise',
          details: { reason: event.reason },
          suggestedFix: 'Add .catch() error handler or wrap async calls with try/catch.'
        });
      };
      window.addEventListener('unhandledrejection', this.onUnhandledRejection);

      // Hotkey to toggle QA Bug Detector Overlay (F4 or Alt+B)
      this.onKeydown = (e: KeyboardEvent) => {
        if (e.code === 'F4' || (e.altKey && e.code === 'KeyB')) {
          this.toggleOverlay();
        }
      };
      window.addEventListener('keydown', this.onKeydown);
    }
  }

  /** Remove all global error listeners and restore the original handlers. */
  public dispose(): void {
    if (this.disposed || typeof window === 'undefined') return;
    this.disposed = true;
    if (this.onUnhandledRejection) {
      window.removeEventListener('unhandledrejection', this.onUnhandledRejection);
      this.onUnhandledRejection = null;
    }
    if (this.onKeydown) {
      window.removeEventListener('keydown', this.onKeydown);
      this.onKeydown = null;
    }
    if (this.originalOnError) {
      window.onerror = this.originalOnError;
    }
    this.disableLiveWatchdog();
  }

  public addBug(bug: Omit<GameBug, 'id' | 'timestamp'>): GameBug {
    // Deduplicate identical bug reports
    const existing = this.detectedBugs.find(
      b => b.category === bug.category && b.title === bug.title && b.target === bug.target
    );
    if (existing) {
      existing.timestamp = Date.now();
      return existing;
    }

    const newBug: GameBug = {
      ...bug,
      id: `BUG-${this.bugIdCounter++}`,
      timestamp: Date.now()
    };
    this.detectedBugs.push(newBug);
    this.updateOverlayUI();
    return newBug;
  }

  public clearBugs(): void {
    this.detectedBugs = [];
    this.updateOverlayUI();
  }

  /**
   * Run a comprehensive one-pass audit of the entire game engine state.
   */
  public audit(app: any): BugAuditReport {
    const reportBugs: GameBug[] = [];

    // Helper to log audit bug
    const record = (bug: Omit<GameBug, 'id' | 'timestamp'>) => {
      const added = this.addBug(bug);
      reportBugs.push(added);
    };

    // 1. Scan Three.js Scene Graph Hierarchy
    if (app.scene && app.scene instanceof THREE.Scene) {
      this.scanSceneGraph(app.scene, record);
    }

    // 2. Scan ECS Entities & Components
    if (app.world) {
      this.scanECSWorld(app.world, record);
    }

    // 3. Scan Physics World
    if (app.physics) {
      this.scanPhysicsWorld(app.physics, record);
    }

    // 4. Scan Render Pipeline & Shaders
    if (app.renderer && app.pipeline) {
      this.scanRenderPipeline(app, record);
    }

    // Compute Health Score (Starts at 100, drops per bug)
    const criticals = this.detectedBugs.filter(b => b.severity === 'critical').length;
    const warnings = this.detectedBugs.filter(b => b.severity === 'warning').length;
    const infos = this.detectedBugs.filter(b => b.severity === 'info').length;

    const penalty = criticals * 25 + warnings * 8 + infos * 2;
    const healthScore = Math.max(0, Math.min(100, 100 - penalty));

    const report: BugAuditReport = {
      timestamp: Date.now(),
      healthScore,
      totalBugs: this.detectedBugs.length,
      criticalCount: criticals,
      warningCount: warnings,
      infoCount: infos,
      bugs: [...this.detectedBugs],
      metricsSummary: {
        activeEntities: app.world?.activeEntities?.size ?? 0,
        sceneObjects: app.scene?.children?.length ?? 0,
        physicsBodies: (app.physics?.bodies?.length ?? app.physics?.cannonWorld?.bodies?.length) ?? 0,
        geometriesInMemory: app.pipeline?.metrics?.geometries ?? 0,
        texturesInMemory: app.pipeline?.metrics?.textures ?? 0,
        drawCalls: app.pipeline?.metrics?.drawCalls ?? 0,
        triangles: app.pipeline?.metrics?.triangles ?? 0
      }
    };

    return report;
  }

  private scanSceneGraph(root: THREE.Object3D, record: (bug: Omit<GameBug, 'id' | 'timestamp'>) => void): void {
    let totalObjects = 0;

    root.traverse((obj) => {
      totalObjects++;
      const name = obj.name || `Object3D_${obj.id}`;

      // A. Check for NaN / Infinity in transform matrices & vectors
      const pos = obj.position;
      const rot = obj.rotation;
      const scale = obj.scale;

      if (isNaN(pos.x) || isNaN(pos.y) || isNaN(pos.z) || !isFinite(pos.x) || !isFinite(pos.y) || !isFinite(pos.z)) {
        record({
          category: 'nan_infinity',
          severity: 'critical',
          title: 'NaN or Infinity in Position Transform',
          description: `Object position vector contains invalid values: (${pos.x}, ${pos.y}, ${pos.z})`,
          target: name,
          details: { position: [pos.x, pos.y, pos.z] },
          suggestedFix: 'Check movement delta time calculations or division by zero in position updates.'
        });
      }

      if (isNaN(rot.x) || isNaN(rot.y) || isNaN(rot.z)) {
        record({
          category: 'nan_infinity',
          severity: 'critical',
          title: 'NaN in Rotation Transform',
          description: `Object rotation contains NaN Euler angles.`,
          target: name,
          suggestedFix: 'Normalize direction vectors before calling Math.atan2 or lookAt.'
        });
      }

      // B. Degenerate or Negative Scale
      if (scale.x <= 0 || scale.y <= 0 || scale.z <= 0) {
        record({
          category: 'rendering_glitch',
          severity: 'warning',
          title: 'Degenerate or Negative Scale Transform',
          description: `Scale is zero or negative (${scale.x}, ${scale.y}, ${scale.z}), which causes invisible meshes and flipped lighting normals.`,
          target: name,
          suggestedFix: 'Ensure minimum scale is clamped to at least 0.001.'
        });
      }

      // C. Out-of-bounds Fallen Object
      if (pos.y < -150) {
        record({
          category: 'physics_anomaly',
          severity: 'warning',
          title: 'Object Fallen Out of World Bounds',
          description: `Object has fallen below Y = -150 (${pos.y.toFixed(1)}). Likely fell through level geometry.`,
          target: name,
          details: { y: pos.y },
          suggestedFix: 'Add a respawn boundary hook or enable continuous collision detection.'
        });
      }

      // D. Missing or Broken Materials on Meshes
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        if (!mesh.material) {
          record({
            category: 'rendering_glitch',
            severity: 'critical',
            title: 'Mesh Missing Material',
            description: `Mesh has no material attached and will fail to render.`,
            target: name,
            suggestedFix: 'Assign a MeshStandardMaterial or CustomShaderMaterial.'
          });
        }
        if (!mesh.geometry) {
          record({
            category: 'rendering_glitch',
            severity: 'critical',
            title: 'Mesh Missing Geometry',
            description: `Mesh has no BufferGeometry and will throw WebGL draw errors.`,
            target: name,
            suggestedFix: 'Assign a valid BufferGeometry before adding to scene.'
          });
        }
      }
    });

    if (totalObjects > 2500) {
      record({
        category: 'memory_leak',
        severity: 'warning',
        title: 'High Scene Object Count Without Batching',
        description: `Scene contains ${totalObjects} individual Object3D nodes. This causes high CPU overhead.`,
        target: 'SceneGraph',
        suggestedFix: 'Use InstancedMesh, ParticleSystem, or spawnBatch for bulk props and projectiles.'
      });
    }
  }

  private scanECSWorld(world: any, record: (bug: Omit<GameBug, 'id' | 'timestamp'>) => void): void {
    if (!world.activeEntities) return;

    const count = world.activeEntities.size;
    if (count > 4000) {
      record({
        category: 'memory_leak',
        severity: 'warning',
        title: 'Elevated ECS Entity Count',
        description: `${count} active ECS entities in memory. Verify that destroyed entities are being deregistered.`,
        target: 'World.activeEntities',
        suggestedFix: 'Call world.destroyEntity(id) when projectiles or defeated enemies expire.'
      });
    }

    // Verify entity component integrity
    for (const id of world.activeEntities) {
      const tags = world.tags?.get(id);
      const comps = world.getAllComponents ? world.getAllComponents(id) : [];

      if (comps.length === 0 && (!tags || tags.size === 0)) {
        record({
          category: 'memory_leak',
          severity: 'info',
          title: 'Orphaned Empty Entity',
          description: `Entity ID #${id} has 0 components and 0 tags.`,
          target: `Entity #${id}`,
          suggestedFix: 'Clean up unused empty entities with world.destroyEntity(id).'
        });
      }
    }
  }

  private scanPhysicsWorld(physics: any, record: (bug: Omit<GameBug, 'id' | 'timestamp'>) => void): void {
    const bodies = physics.bodies || (physics.getCannonWorld ? physics.getCannonWorld().bodies : []) || [];
    for (let i = 0; i < bodies.length; i++) {
      const entry = bodies[i];
      const pos = entry.position || entry.body?.position || entry.body?.cannonBody?.position;
      const vel = entry.velocity || entry.body?.velocity || entry.body?.cannonBody?.velocity;

      if (pos && (isNaN(pos.x) || isNaN(pos.y) || isNaN(pos.z) || !isFinite(pos.x) || !isFinite(pos.y) || !isFinite(pos.z))) {
        record({
          category: 'nan_infinity',
          severity: 'critical',
          title: 'Physics Body Position NaN or Infinity',
          description: `Rigid body position contains invalid coordinates: (${pos.x}, ${pos.y}, ${pos.z})`,
          target: `RigidBody[${i}]`,
          suggestedFix: 'Ensure impulse and force vectors do not receive NaN inputs.'
        });
      }

      if (vel) {
        const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z);
        if (speed > 500) {
          record({
            category: 'physics_anomaly',
            severity: 'warning',
            title: 'Extreme Physics Velocity (Tunneling Risk)',
            description: `Rigid body velocity is ${speed.toFixed(1)} u/s, which will cause tunneling through walls.`,
            target: `RigidBody[${i}]`,
            details: { speed },
            suggestedFix: 'Clamp max velocity or apply air drag damping.'
          });
        }
      }
    }
  }

  private scanRenderPipeline(app: any, record: (bug: Omit<GameBug, 'id' | 'timestamp'>) => void): void {
    const metrics = app.pipeline?.metrics;
    if (!metrics) return;

    if (metrics.drawCalls > 350) {
      record({
        category: 'performance_spike',
        severity: 'warning',
        title: 'Excessive WebGL Draw Calls',
        description: `Current frame generated ${metrics.drawCalls} draw calls (recommended < 150 on mobile).`,
        target: 'RenderPipeline',
        details: { drawCalls: metrics.drawCalls },
        suggestedFix: 'Combine static meshes using BufferGeometryUtils or use InstancedMesh.'
      });
    }

    if (metrics.fps > 0 && metrics.fps < 22) {
      record({
        category: 'performance_spike',
        severity: 'critical',
        title: 'Severe Frame Rate Drop',
        description: `FPS dropped to ${metrics.fps} FPS, causing perceptible stutter.`,
        target: 'RenderPipeline',
        details: { fps: metrics.fps },
        suggestedFix: 'Reduce shadow map resolutions or disable complex particle systems on mobile.'
      });
    }
  }

  /**
   * Enable real-time background watchdog that asserts game health every N frames.
   */
  public enableLiveWatchdog(app: any, options: WatchdogOptions = {}): void {
    if (this.isWatchdogActive) return;
    this.isWatchdogActive = true;

    const interval = options.checkIntervalFrames ?? 30; // Check twice a second at 60 FPS

    const onUpdate = () => {
      this.watchdogFrameCount++;
      if (this.watchdogFrameCount % interval === 0) {
        const report = this.audit(app);
        if (options.autoLogToConsole && report.criticalCount > 0) {
          console.warn(`[🐞 Kairo QA Watchdog] ${report.criticalCount} Critical bug(s) detected!`, report.bugs);
        }
      }
    };

    if (app.onUpdate) {
      // onUpdate returns an unsubscribe function — capture it so the watchdog
      // can actually be stopped instead of running forever.
      this.watchdogUnsubscribe = app.onUpdate(onUpdate);
    }
  }

  public disableLiveWatchdog(): void {
    this.isWatchdogActive = false;
    if (this.watchdogUnsubscribe) {
      this.watchdogUnsubscribe();
      this.watchdogUnsubscribe = null;
    }
  }

  /**
   * Automated AI Fuzz Tester
   * Simulates high-frequency player actions, rapid jumps, pounces, camera pans, and edge bounds
   * to automatically expose hidden memory leaks, state desyncs, or physics explosions.
   */
  public async runFuzzTest(app: any, durationSeconds: number = 3.0): Promise<FuzzTestResult> {
    const startTime = performance.now();
    const durationMs = durationSeconds * 1000;
    let actionsExecuted = 0;
    const initialBugCount = this.detectedBugs.length;

    console.log(`[🤖 Kairo QA Fuzz Tester] Starting ${durationSeconds}s automated fuzz stress test...`);

    const intervalId = setInterval(() => {
      actionsExecuted++;

      // Simulate erratic keyboard inputs
      const keys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'ShiftLeft', 'KeyE', 'KeyQ'];
      const randomKey = keys[Math.floor(Math.random() * keys.length)];

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: randomKey }));
        setTimeout(() => {
          window.dispatchEvent(new KeyboardEvent('keyup', { code: randomKey }));
        }, 40);
      }

      // Simulate sudden camera shakes or rapid updates
      if (app.cameraController && Math.random() < 0.2) {
        app.cameraController.shake(0.3, 0.2);
      }

      // Intermittent health audit
      if (actionsExecuted % 10 === 0) {
        this.audit(app);
      }
    }, 50);

    await new Promise(resolve => setTimeout(resolve, durationMs));
    clearInterval(intervalId);

    // Final audit
    const finalReport = this.audit(app);
    const newBugs = this.detectedBugs.slice(initialBugCount);

    console.log(`[🤖 Kairo QA Fuzz Tester] Completed. Actions: ${actionsExecuted}, New Bugs: ${newBugs.length}`);

    return {
      durationMs,
      actionsExecuted,
      bugsFoundDuringFuzz: newBugs,
      passed: newBugs.filter(b => b.severity === 'critical').length === 0
    };
  }

  // --- Visual In-Game Diagnostic UI Overlay ---

  public createUIOverlay(): void {
    if (this.overlay || typeof document === 'undefined') return;

    this.overlay = document.createElement('div');
    this.overlay.id = 'kairo-bug-detector-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 380px;
      max-height: 480px;
      background: rgba(15, 23, 42, 0.95);
      border: 2px solid #ef4444;
      border-radius: 16px;
      padding: 16px;
      color: #f8fafc;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      font-size: 12px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
      z-index: 99999;
      display: none;
      flex-direction: column;
      backdrop-filter: blur(12px);
      pointer-events: auto;
    `;

    document.body.appendChild(this.overlay);
    this.updateOverlayUI();
  }

  public toggleOverlay(): void {
    this.visible = !this.visible;
    if (!this.overlay) this.createUIOverlay();
    if (this.overlay) {
      this.overlay.style.display = this.visible ? 'flex' : 'none';
      if (this.visible) this.updateOverlayUI();
    }
  }

  private updateOverlayUI(): void {
    if (!this.overlay) return;

    const criticals = this.detectedBugs.filter(b => b.severity === 'critical').length;
    const warnings = this.detectedBugs.filter(b => b.severity === 'warning').length;
    const healthScore = Math.max(0, 100 - (criticals * 25 + warnings * 8));

    const badgeColor = healthScore >= 90 ? '#10b981' : healthScore >= 70 ? '#f59e0b' : '#ef4444';

    this.overlay.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 10px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 18px;">🐞</span>
          <span style="font-weight: 800; font-size: 14px; color: #fff;">Kairo QA Bug Detector</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="background: ${badgeColor}; color: #000; font-weight: 800; padding: 2px 8px; border-radius: 99px; font-size: 11px;">
            ${healthScore}/100
          </span>
          <button id="qa-close-btn" style="background: none; border: none; color: #94a3b8; font-size: 16px; cursor: pointer;">✕</button>
        </div>
      </div>

      <div style="display: flex; gap: 8px; margin-bottom: 10px;">
        <span style="background: rgba(239, 68, 68, 0.2); color: #f87171; padding: 4px 8px; border-radius: 6px; font-weight: 700;">
          Critical: ${criticals}
        </span>
        <span style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; padding: 4px 8px; border-radius: 6px; font-weight: 700;">
          Warnings: ${warnings}
        </span>
        <span style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; padding: 4px 8px; border-radius: 6px; font-weight: 700;">
          Total: ${this.detectedBugs.length}
        </span>
      </div>

      <div style="flex: 1; overflow-y: auto; max-height: 240px; display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px;">
        ${
          this.detectedBugs.length === 0
            ? `<div style="text-align: center; color: #10b981; padding: 20px; font-weight: 600;">✨ No bugs detected! Game health is optimal.</div>`
            : this.detectedBugs
                .slice(-10)
                .map(
                  b => `
            <div style="background: rgba(0,0,0,0.3); border-left: 3px solid ${
              b.severity === 'critical' ? '#ef4444' : b.severity === 'warning' ? '#f59e0b' : '#38bdf8'
            }; padding: 8px 10px; border-radius: 6px;">
              <div style="font-weight: 700; color: #fff; display: flex; justify-content: space-between;">
                <span>${b.title}</span>
                <span style="font-size: 10px; color: #94a3b8;">${b.target || ''}</span>
              </div>
              <div style="color: #cbd5e1; font-size: 11px; margin-top: 3px;">${b.description}</div>
              <div style="color: #34d399; font-size: 10px; margin-top: 4px;">💡 Fix: ${b.suggestedFix}</div>
            </div>
          `
                )
                .join('')
        }
      </div>

      <div style="display: flex; gap: 8px;">
        <button id="qa-scan-btn" style="flex: 1; background: #3b82f6; border: none; color: #fff; padding: 8px; border-radius: 8px; font-weight: 700; cursor: pointer;">
          🔍 Audit Now
        </button>
        <button id="qa-clear-btn" style="background: rgba(255,255,255,0.1); border: none; color: #fff; padding: 8px 12px; border-radius: 8px; font-weight: 700; cursor: pointer;">
          Clear
        </button>
        <button id="qa-export-btn" style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #34d399; padding: 8px 12px; border-radius: 8px; font-weight: 700; cursor: pointer;">
          📥 Export
        </button>
      </div>
    `;

    // Bind UI actions
    this.overlay.querySelector('#qa-close-btn')?.addEventListener('click', () => this.toggleOverlay());
    this.overlay.querySelector('#qa-clear-btn')?.addEventListener('click', () => this.clearBugs());
    this.overlay.querySelector('#qa-export-btn')?.addEventListener('click', () => this.downloadReportMarkdown());
  }

  public exportReportMarkdown(): string {
    const criticals = this.detectedBugs.filter(b => b.severity === 'critical');
    const warnings = this.detectedBugs.filter(b => b.severity === 'warning');

    let md = `# 🐞 Kairo Engine - Automated Bug Report\n\n`;
    md += `**Date:** ${new Date().toISOString()}\n`;
    md += `**Total Issues Detected:** ${this.detectedBugs.length}\n`;
    md += `**Critical Bugs:** ${criticals.length}\n`;
    md += `**Warnings:** ${warnings.length}\n\n`;

    md += `## 📋 Detected Issues\n\n`;
    if (this.detectedBugs.length === 0) {
      md += `*No issues detected. System clean! ✅*\n`;
    } else {
      this.detectedBugs.forEach((bug, idx) => {
        md += `### ${idx + 1}. [${bug.severity.toUpperCase()}] ${bug.title}\n`;
        md += `- **Category:** \`${bug.category}\`\n`;
        if (bug.target) md += `- **Target:** \`${bug.target}\`\n`;
        md += `- **Description:** ${bug.description}\n`;
        md += `- **Suggested Fix:** ${bug.suggestedFix}\n\n`;
      });
    }

    return md;
  }

  public downloadReportMarkdown(filename: string = 'Kairo_Bug_Report.md'): void {
    if (typeof document === 'undefined') return;
    const content = this.exportReportMarkdown();
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const GlobalGameBugDetector = new GameBugDetector();
