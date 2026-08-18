import * as THREE from 'three';

export interface FloatingTextOptions {
  /** Text or number to display (e.g. "-45", "+20 HP", "CRITICAL!"). */
  text: string | number;
  /** 3D World coordinates or Vector3 where the floating text originates. */
  position: { x: number; y: number; z: number } | THREE.Vector3;
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
  updatePosition: (worldPos: { x: number; y: number; z: number } | THREE.Vector3) => void;
  setVisible: (visible: boolean) => void;
  remove: () => void;
  readonly element: HTMLElement;
}

/**
 * 💥 FloatingTextManager
 * World-space 3D to Screen-space projection for Combat Damage Numbers, Popups, and Floating Health Bars.
 */
export class FloatingTextManager {
  private container: HTMLElement | null = null;
  private activeBars: Set<FloatingHealthBarHandle> = new Set();
  private _projectVec: THREE.Vector3 = new THREE.Vector3();

  constructor(container?: HTMLElement) {
    if (container) {
      this.container = container;
    } else if (typeof document !== 'undefined') {
      let el = document.getElementById('kairo-floating-overlay');
      if (!el) {
        el = document.createElement('div');
        el.id = 'kairo-floating-overlay';
        el.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 4000;
          overflow: hidden;
        `;
        document.body.appendChild(el);
      }
      this.container = el;
    }
  }

  /**
   * Project a 3D World position to 2D Screen pixel coordinates.
   */
  public projectToScreen(
    pos: { x: number; y: number; z: number } | THREE.Vector3,
    camera: THREE.Camera,
    viewportWidth: number = typeof window !== 'undefined' ? window.innerWidth : 800,
    viewportHeight: number = typeof window !== 'undefined' ? window.innerHeight : 600
  ): { x: number; y: number; visible: boolean } {
    this._projectVec.set(pos.x, pos.y, pos.z);
    this._projectVec.project(camera);

    const visible = this._projectVec.z < 1 && this._projectVec.z > -1;
    const x = ((this._projectVec.x + 1) * viewportWidth) / 2;
    const y = ((-this._projectVec.y + 1) * viewportHeight) / 2;

    return { x, y, visible };
  }

  /**
   * Spawn a floating combat number or status popup at a 3D location.
   */
  public spawnFloatingNumber(options: FloatingTextOptions): HTMLElement | null {
    if (typeof document === 'undefined') return null;
    const parent = options.container || this.container || document.body;

    const el = document.createElement('div');
    const isCrit = options.isCrit ?? false;
    const color = options.color ?? (isCrit ? '#facc15' : '#ef4444');
    const fontSize = options.fontSize ?? (isCrit ? 28 : 20);
    const duration = options.durationMs ?? 1200;
    const floatDist = options.floatDistance ?? 60;

    let screenX = 0;
    let screenY = 0;

    if (options.camera) {
      const proj = this.projectToScreen(options.position, options.camera);
      if (!proj.visible) return null;
      screenX = proj.x;
      screenY = proj.y;
    } else {
      screenX = options.position.x;
      screenY = options.position.y;
    }

    el.innerText = String(options.text);
    el.style.cssText = `
      position: absolute;
      left: ${screenX}px;
      top: ${screenY}px;
      transform: translate(-50%, -50%) scale(${isCrit ? 1.4 : 0.8});
      color: ${color};
      font-size: ${fontSize}px;
      font-weight: 800;
      font-family: 'Inter', system-ui, sans-serif;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8)${isCrit ? ', 0 0 16px rgba(250, 204, 21, 0.6)' : ''};
      pointer-events: none;
      user-select: none;
      opacity: 0;
      transition: transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1), opacity ${duration}ms ease-out;
      z-index: 4500;
    `;

    parent.appendChild(el);

    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = `translate(-50%, calc(-50% - ${floatDist}px)) scale(1)`;
    });

    setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 200);
    }, duration - 200);

    return el;
  }

  /**
   * Create an interactive floating health bar attached to a 3D target.
   */
  public createFloatingHealthBar(
    targetPos: { x: number; y: number; z: number } | THREE.Vector3,
    options: FloatingHealthBarOptions = {}
  ): FloatingHealthBarHandle {
    const parent = options.container || this.container || (typeof document !== 'undefined' ? document.body : null);

    let maxHealth = Math.max(1, options.max ?? 100);
    let currentHealth = Math.max(0, options.current ?? maxHealth);
    const width = options.width ?? 64;
    const height = options.height ?? 6;
    const barColor = options.color ?? '#22c55e';
    const bgColor = options.backgroundColor ?? 'rgba(0, 0, 0, 0.6)';
    const borderRadius = options.borderRadius ?? 3;
    const offsetY = options.offsetY ?? 0;
    const camera = options.camera;

    let barWrapper: HTMLElement;
    let fillBar: HTMLElement;

    if (typeof document !== 'undefined') {
      barWrapper = document.createElement('div');
      barWrapper.style.cssText = `
        position: absolute;
        width: ${width}px;
        height: ${height}px;
        background: ${bgColor};
        border-radius: ${borderRadius}px;
        overflow: hidden;
        pointer-events: none;
        box-shadow: 0 2px 6px rgba(0,0,0,0.5);
        border: 1px solid rgba(255,255,255,0.15);
        transform: translate(-50%, -50%);
        transition: opacity 0.2s ease;
      `;

      fillBar = document.createElement('div');
      fillBar.style.cssText = `
        width: ${(currentHealth / maxHealth) * 100}%;
        height: 100%;
        background: ${barColor};
        border-radius: ${borderRadius}px;
        transition: width 0.25s ease-out, background-color 0.25s;
      `;

      barWrapper.appendChild(fillBar);
      if (parent) parent.appendChild(barWrapper);
    } else {
      barWrapper = {} as any;
      fillBar = {} as any;
    }

    const handle: FloatingHealthBarHandle = {
      element: barWrapper,
      setHealth: (current: number, max?: number) => {
        if (max !== undefined) maxHealth = Math.max(1, max);
        currentHealth = Math.max(0, Math.min(maxHealth, current));
        const pct = (currentHealth / maxHealth) * 100;
        if (fillBar.style) {
          fillBar.style.width = `${pct}%`;
          if (pct <= 25) {
            fillBar.style.backgroundColor = '#ef4444';
          } else if (pct <= 50) {
            fillBar.style.backgroundColor = '#f59e0b';
          } else {
            fillBar.style.backgroundColor = barColor;
          }
        }
      },
      updatePosition: (worldPos: { x: number; y: number; z: number } | THREE.Vector3) => {
        if (!camera || !barWrapper.style) return;
        const pos = { x: worldPos.x, y: worldPos.y + offsetY, z: worldPos.z };
        const proj = this.projectToScreen(pos, camera);
        if (proj.visible) {
          barWrapper.style.display = 'block';
          barWrapper.style.left = `${proj.x}px`;
          barWrapper.style.top = `${proj.y}px`;
        } else {
          barWrapper.style.display = 'none';
        }
      },
      setVisible: (visible: boolean) => {
        if (barWrapper.style) {
          barWrapper.style.opacity = visible ? '1' : '0';
        }
      },
      remove: () => {
        if (barWrapper.remove) barWrapper.remove();
        this.activeBars.delete(handle);
      }
    };

    if (camera) {
      handle.updatePosition(targetPos);
    }

    this.activeBars.add(handle);
    return handle;
  }

  public clear(): void {
    this.activeBars.forEach(b => b.remove());
    this.activeBars.clear();
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

export const GlobalFloatingText = new FloatingTextManager();
