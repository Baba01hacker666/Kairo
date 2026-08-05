export interface OverlayImageOptions {
  id?: string;
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  opacity?: number;
  mask?: 'circle' | 'vignette' | 'rounded' | 'hexagon' | 'none';
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay';
}

export type TransitionType = 'wipeLeft' | 'wipeRight' | 'fadeBlack' | 'circleWipe' | 'glitch';
export type ColorGradingPreset = 'cinematicWarm' | 'cyberpunkNeon' | 'noir' | 'sepia' | 'vintage' | 'none';

/**
 * High-Level Cinematic Video Editing & Screen Overlay Manager
 * Handles image overlays, cutting, masking, letterbox bars, and video transitions
 */
export class CinematicOverlayManager {
  private container: HTMLElement | null = null;
  private letterboxTop: HTMLElement | null = null;
  private letterboxBottom: HTMLElement | null = null;
  private colorGradeOverlay: HTMLElement | null = null;
  private transitionOverlay: HTMLElement | null = null;
  private overlaysMap: Map<string, HTMLElement> = new Map();

  constructor() {
    if (typeof document === 'undefined') return;

    let existing = document.getElementById('kairo-cinematic-container');
    if (!existing) {
      existing = document.createElement('div');
      existing.id = 'kairo-cinematic-container';
      existing.style.cssText = `
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        pointer-events: none;
        z-index: 999;
        overflow: hidden;
      `;
      document.body.appendChild(existing);
    }
    this.container = existing;

    // Create 21:9 Letterbox Top & Bottom Black Bars
    this.letterboxTop = document.createElement('div');
    this.letterboxTop.style.cssText = `
      position: absolute; top: 0; left: 0; right: 0; height: 0%;
      background: #000; transition: height 0.4s ease; z-index: 100;
    `;

    this.letterboxBottom = document.createElement('div');
    this.letterboxBottom.style.cssText = `
      position: absolute; bottom: 0; left: 0; right: 0; height: 0%;
      background: #000; transition: height 0.4s ease; z-index: 100;
    `;

    // Color Grading Overlay
    this.colorGradeOverlay = document.createElement('div');
    this.colorGradeOverlay.style.cssText = `
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      pointer-events: none; transition: all 0.3s ease; z-index: 10;
    `;

    // Transition Mask Overlay
    this.transitionOverlay = document.createElement('div');
    this.transitionOverlay.style.cssText = `
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      pointer-events: none; opacity: 0; transition: opacity 0.3s ease; z-index: 200;
      background: #000;
    `;

    this.container.appendChild(this.letterboxTop);
    this.container.appendChild(this.letterboxBottom);
    this.container.appendChild(this.colorGradeOverlay);
    this.container.appendChild(this.transitionOverlay);
  }

  /**
   * Display image graphics, logos, or texture cutouts over 3D viewport with masking
   */
  public showImageOverlay(url: string, options: OverlayImageOptions = {}): string {
    const id = options.id || `img_overlay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    if (typeof document === 'undefined' || !this.container) return id;

    let el = this.overlaysMap.get(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      this.container.appendChild(el);
      this.overlaysMap.set(id, el);
    }

    const maskType = options.mask || 'none';
    let clipPath = 'none';
    if (maskType === 'circle') clipPath = 'circle(45% at 50% 50%)';
    else if (maskType === 'rounded') clipPath = 'inset(0 round 16px)';
    else if (maskType === 'hexagon') clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';

    const width = typeof options.width === 'number' ? `${options.width}px` : (options.width || '200px');
    const height = typeof options.height === 'number' ? `${options.height}px` : (options.height || 'auto');
    const opacity = options.opacity ?? 1.0;
    const blend = options.blendMode || 'normal';

    const posX = options.x !== undefined ? (typeof options.x === 'number' ? `${options.x}px` : options.x) : '50%';
    const posY = options.y !== undefined ? (typeof options.y === 'number' ? `${options.y}px` : options.y) : '50%';

    el.style.cssText = `
      position: absolute;
      left: ${posX};
      top: ${posY};
      transform: translate(-50%, -50%);
      width: ${width};
      height: ${height};
      opacity: ${opacity};
      mix-blend-mode: ${blend};
      clip-path: ${clipPath};
      background-image: url('${url}');
      background-size: cover;
      background-position: center;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 50;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    `;

    return id;
  }

  /**
   * Remove image overlay
   */
  public removeImageOverlay(id: string): void {
    const el = this.overlaysMap.get(id);
    if (el) {
      el.style.opacity = '0';
      setTimeout(() => {
        el.remove();
        this.overlaysMap.delete(id);
      }, 300);
    }
  }

  /**
   * Toggle 21:9 Widescreen Letterbox Black Bars
   */
  public setLetterbox(enabled: boolean, barHeightPercent: number = 10): void {
    if (!this.letterboxTop || !this.letterboxBottom) return;
    const heightStr = enabled ? `${barHeightPercent}%` : '0%';
    this.letterboxTop.style.height = heightStr;
    this.letterboxBottom.style.height = heightStr;
  }

  /**
   * Video Editing Transition Cut (Wipe, Fade, Circle Mask, Glitch)
   */
  public async transitionCut(type: TransitionType = 'fadeBlack', durationMs: number = 500): Promise<void> {
    return new Promise((resolve) => {
      if (!this.transitionOverlay) return resolve();
      this.transitionOverlay.style.transition = `all ${durationMs / 2}ms ease`;

      if (type === 'fadeBlack') {
        this.transitionOverlay.style.background = '#000';
        this.transitionOverlay.style.opacity = '1';
      } else if (type === 'wipeLeft') {
        this.transitionOverlay.style.background = 'linear-gradient(to left, #000 50%, transparent 100%)';
        this.transitionOverlay.style.opacity = '1';
      } else if (type === 'circleWipe') {
        this.transitionOverlay.style.background = 'radial-gradient(circle, transparent 0%, #000 100%)';
        this.transitionOverlay.style.opacity = '1';
      } else if (type === 'glitch') {
        this.transitionOverlay.style.background = 'rgba(99, 102, 241, 0.4)';
        this.transitionOverlay.style.opacity = '0.8';
      }

      setTimeout(() => {
        if (this.transitionOverlay) this.transitionOverlay.style.opacity = '0';
        setTimeout(resolve, durationMs / 2);
      }, durationMs / 2);
    });
  }

  /**
   * Real-time Color Grading Preset Filters
   */
  public setColorGrading(preset: ColorGradingPreset): void {
    if (!this.colorGradeOverlay) return;
    if (preset === 'cinematicWarm') {
      this.colorGradeOverlay.style.backdropFilter = 'contrast(108%) sepia(20%) saturate(120%)';
      this.colorGradeOverlay.style.background = 'rgba(245, 158, 11, 0.05)';
    } else if (preset === 'cyberpunkNeon') {
      this.colorGradeOverlay.style.backdropFilter = 'contrast(115%) saturate(150%) hue-rotate(10deg)';
      this.colorGradeOverlay.style.background = 'rgba(99, 102, 241, 0.06)';
    } else if (preset === 'noir') {
      this.colorGradeOverlay.style.backdropFilter = 'grayscale(100%) contrast(140%)';
      this.colorGradeOverlay.style.background = 'none';
    } else if (preset === 'sepia') {
      this.colorGradeOverlay.style.backdropFilter = 'sepia(80%) contrast(110%)';
      this.colorGradeOverlay.style.background = 'rgba(217, 119, 6, 0.08)';
    } else if (preset === 'vintage') {
      this.colorGradeOverlay.style.backdropFilter = 'contrast(95%) brightness(105%) saturate(85%)';
      this.colorGradeOverlay.style.background = 'rgba(168, 85, 247, 0.04)';
    } else {
      this.colorGradeOverlay.style.backdropFilter = 'none';
      this.colorGradeOverlay.style.background = 'none';
    }
  }

  public clearAll(): void {
    this.overlaysMap.forEach((el) => el.remove());
    this.overlaysMap.clear();
    this.setLetterbox(false);
    this.setColorGrading('none');
  }
}

export const GlobalCinematicOverlay = new CinematicOverlayManager();
