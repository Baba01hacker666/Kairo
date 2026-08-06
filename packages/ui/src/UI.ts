/**
 * Kairo High-Performance Web UI Framework
 * Provides responsive, animated, themeable HUD overlays, menus, modals, toasts, and settings controls.
 */

import { GlobalCinematicOverlay } from './CinematicOverlay.ts';

export interface UITheme {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  cardBackground: string;
  textColor: string;
  mutedTextColor: string;
  fontFamily: string;
  borderRadius: string;
}

export const DefaultTheme: UITheme = {
  primaryColor: '#3b82f6',
  accentColor: '#10b981',
  backgroundColor: '#09090b',
  cardBackground: 'rgba(24, 24, 27, 0.85)',
  textColor: '#fafafa',
  mutedTextColor: '#a1a1aa',
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  borderRadius: '12px'
};

export class UIManager {
  public container: HTMLElement | null = null;
  public theme: UITheme;

  constructor(theme: UITheme = DefaultTheme) {
    this.theme = theme;
    
    if (typeof document !== 'undefined') {
      let el = document.getElementById('kairo-ui-overlay');
      if (!el) {
        el = document.createElement('div');
        el.id = 'kairo-ui-overlay';
        document.body.appendChild(el);
      }
      this.container = el;
      this.applyGlobalStyles();
    }
  }

  private applyGlobalStyles(): void {
    if (!this.container) return;
    this.container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
      overflow: hidden;
      box-sizing: border-box;
    `;
    // Assign theme values through the CSSOM so they are parsed as property
    // values instead of being concatenated into CSS (prevents CSS injection).
    this.container.style.fontFamily = this.theme.fontFamily;
    this.container.style.color = this.theme.textColor;
  }

  public showToast(message: string, durationMs: number = 3000, type: 'info' | 'success' | 'warning' = 'info'): void {
    if (!this.container || typeof document === 'undefined') return;
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: absolute;
      top: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(-20px);
      background: ${type === 'success' ? '#059669' : type === 'warning' ? '#d97706' : 'rgba(30, 41, 59, 0.95)'};
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(8px);
      pointer-events: auto;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      opacity: 0;
      border: 1px solid rgba(255, 255, 255, 0.2);
    `;
    toast.innerText = message;
    this.container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(-20px)';
      setTimeout(() => toast.remove(), 300);
    }, durationMs);
  }

  public createModal(title: string, contentHtml: string, buttons: { text: string; primary?: boolean; onClick: () => void }[]): HTMLElement | null {
    if (!this.container || typeof document === 'undefined') return null;
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
      z-index: 2000;
      opacity: 0;
      transition: opacity 0.25s ease;
    `;

    const card = document.createElement('div');
    card.style.cssText = `
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 32px;
      max-width: 480px;
      width: 90%;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
      transform: scale(0.9);
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    `;
    card.style.background = this.theme.cardBackground;
    card.style.borderRadius = this.theme.borderRadius;

    const titleEl = document.createElement('h2');
    titleEl.style.cssText = `margin: 0 0 16px 0; font-size: 24px; font-weight: 700;`;
    titleEl.style.color = this.theme.textColor;
    titleEl.innerText = title;

    const bodyEl = document.createElement('div');
    bodyEl.style.cssText = `margin-bottom: 24px; font-size: 15px; line-height: 1.6;`;
    bodyEl.style.color = this.theme.mutedTextColor;
    bodyEl.innerHTML = contentHtml;

    const btnRow = document.createElement('div');
    btnRow.style.cssText = `display: flex; gap: 12px; justify-content: flex-end;`;

    buttons.forEach(b => {
      const btn = document.createElement('button');
      btn.innerText = b.text;
      btn.style.cssText = `
        padding: 10px 20px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        border: none;
        color: white;
        transition: transform 0.15s, background 0.15s;
      `;
      btn.style.background = b.primary ? this.theme.primaryColor : 'rgba(255, 255, 255, 0.1)';
      btn.onmouseenter = () => btn.style.transform = 'scale(1.04)';
      btn.onmouseleave = () => btn.style.transform = 'scale(1)';
      btn.onclick = () => {
        if (btn.disabled) return;
        btnRow.querySelectorAll('button').forEach(button => (button as HTMLButtonElement).disabled = true);
        backdrop.style.opacity = '0';
        card.style.transform = 'scale(0.9)';
        setTimeout(() => backdrop.remove(), 250);
        b.onClick();
      };
      btnRow.appendChild(btn);
    });

    card.appendChild(titleEl);
    card.appendChild(bodyEl);
    card.appendChild(btnRow);
    backdrop.appendChild(card);
    this.container.appendChild(backdrop);

    requestAnimationFrame(() => {
      backdrop.style.opacity = '1';
      card.style.transform = 'scale(1)';
    });

    return backdrop;
  }

  public showStartScreen(options: { title: string; subtitle?: string; btnText?: string; onStart: () => void }): HTMLElement | null {
    if (!this.container || typeof document === 'undefined') return null;
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(10px);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      pointer-events: auto; z-index: 3000; color: white; text-align: center;
    `;
    
    const titleEl = document.createElement('h1');
    titleEl.innerText = options.title;
    titleEl.style.cssText = `font-size: 64px; font-weight: 800; margin: 0 0 10px 0; color: ${this.theme.primaryColor}; text-shadow: 0 4px 20px rgba(0,0,0,0.5);`;
    
    const subtitleEl = document.createElement('p');
    subtitleEl.innerText = options.subtitle || '';
    subtitleEl.style.cssText = `font-size: 24px; color: ${this.theme.mutedTextColor}; margin: 0 0 40px 0; max-width: 600px;`;
    
    const btn = document.createElement('button');
    btn.innerText = options.btnText || 'START GAME';
    btn.style.cssText = `
      padding: 16px 48px; border-radius: 30px; font-size: 20px; font-weight: 700;
      background: ${this.theme.accentColor}; color: white; border: none; cursor: pointer;
      box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3); transition: transform 0.2s;
    `;
    btn.onmouseenter = () => btn.style.transform = 'scale(1.05)';
    btn.onmouseleave = () => btn.style.transform = 'scale(1)';
    btn.onclick = () => {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.5s ease';
      setTimeout(() => { overlay.remove(); options.onStart(); }, 500);
    };
    
    overlay.appendChild(titleEl);
    if (options.subtitle) overlay.appendChild(subtitleEl);
    overlay.appendChild(btn);
    this.container.appendChild(overlay);
    return overlay;
  }

  public showEndScreen(options: { title: string; subtitle?: string; score?: string; btnText?: string; onRestart: () => void }): HTMLElement | null {
    if (!this.container || typeof document === 'undefined') return null;
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.9); backdrop-filter: blur(8px);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      pointer-events: auto; z-index: 3000; color: white; text-align: center;
    `;
    
    const titleEl = document.createElement('h1');
    titleEl.innerText = options.title;
    titleEl.style.cssText = `font-size: 56px; font-weight: 800; margin: 0 0 10px 0; color: #ef4444; text-shadow: 0 4px 20px rgba(239, 68, 68, 0.5);`;
    
    const subtitleEl = document.createElement('p');
    subtitleEl.innerText = options.subtitle || '';
    subtitleEl.style.cssText = `font-size: 20px; color: ${this.theme.mutedTextColor}; margin: 0 0 20px 0; max-width: 600px;`;
    
    const scoreEl = document.createElement('div');
    if (options.score) {
      scoreEl.innerText = "Score: " + options.score;
      scoreEl.style.cssText = `font-size: 32px; font-weight: bold; color: #facc15; margin: 0 0 40px 0;`;
    }

    const btn = document.createElement('button');
    btn.innerText = options.btnText || 'RESTART';
    btn.style.cssText = `
      padding: 16px 48px; border-radius: 30px; font-size: 20px; font-weight: 700;
      background: ${this.theme.primaryColor}; color: white; border: none; cursor: pointer;
      box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3); transition: transform 0.2s;
    `;
    btn.onmouseenter = () => btn.style.transform = 'scale(1.05)';
    btn.onmouseleave = () => btn.style.transform = 'scale(1)';
    btn.onclick = () => {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.3s ease';
      setTimeout(() => { overlay.remove(); options.onRestart(); }, 300);
    };
    
    overlay.appendChild(titleEl);
    if (options.subtitle) overlay.appendChild(subtitleEl);
    if (options.score) overlay.appendChild(scoreEl);
    overlay.appendChild(btn);
    this.container.appendChild(overlay);
    return overlay;
  }

  public showAchievement(title: string, description: string, icon: string = '🏆'): void {
    if (!this.container || typeof document === 'undefined') return;
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: absolute;
      top: 24px;
      right: 24px;
      border: 1px solid rgba(255, 215, 0, 0.4);
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.1);
      transform: translateX(120%);
      transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s;
      z-index: 9999;
    `;
    toast.style.background = this.theme.cardBackground;
    toast.style.borderRadius = this.theme.borderRadius;

    const iconEl = document.createElement('div');
    iconEl.style.cssText = 'font-size: 32px;';
    iconEl.innerText = icon;

    const textWrap = document.createElement('div');
    const labelEl = document.createElement('div');
    labelEl.style.cssText = 'font-size: 12px; font-weight: bold; color: #facc15; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;';
    labelEl.innerText = 'Achievement Unlocked';
    const achTitleEl = document.createElement('div');
    achTitleEl.style.cssText = 'font-size: 16px; font-weight: 600; color: white;';
    achTitleEl.innerText = title;
    const descEl = document.createElement('div');
    descEl.style.cssText = 'font-size: 13px; margin-top: 2px;';
    descEl.style.color = this.theme.mutedTextColor;
    descEl.innerText = description;

    textWrap.appendChild(labelEl);
    textWrap.appendChild(achTitleEl);
    textWrap.appendChild(descEl);

    toast.appendChild(iconEl);
    toast.appendChild(textWrap);
    
    this.container.appendChild(toast);
    
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
    });
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(120%)';
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  public createGameMenu(title: string, options: { text: string; onClick: () => void; color?: string }[]): HTMLElement | null {
    if (!this.container || typeof document === 'undefined') return null;
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      z-index: 3000; opacity: 0; transition: opacity 0.3s;
      pointer-events: auto;
    `;

    const titleEl = document.createElement('h1');
    titleEl.innerText = title;
    titleEl.style.cssText = `font-size: 48px; font-weight: 800; color: white; margin-bottom: 40px; text-shadow: 0 4px 20px rgba(0,0,0,0.5);`;

    const menuContainer = document.createElement('div');
    menuContainer.style.cssText = `display: flex; flex-direction: column; gap: 16px; width: 300px;`;

    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.innerText = opt.text;
      const baseBg = opt.color || 'rgba(255, 255, 255, 0.1)';
      btn.style.cssText = `
        padding: 16px 24px; font-size: 18px; font-weight: 600; color: white;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px; cursor: pointer; transition: all 0.2s;
        text-align: center;
      `;
      btn.style.background = baseBg;
      btn.onmouseenter = () => { btn.style.transform = 'scale(1.05)'; btn.style.background = opt.color ? opt.color : 'rgba(255,255,255,0.2)'; };
      btn.onmouseleave = () => { btn.style.transform = 'scale(1)'; btn.style.background = baseBg; };
      btn.onclick = () => {
        backdrop.style.opacity = '0';
        setTimeout(() => { backdrop.remove(); opt.onClick(); }, 300);
      };
      menuContainer.appendChild(btn);
    });

    backdrop.appendChild(titleEl);
    backdrop.appendChild(menuContainer);
    this.container.appendChild(backdrop);

    requestAnimationFrame(() => { backdrop.style.opacity = '1'; });
    return backdrop;
  }

  public clear(): void {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  private subtitleEl: HTMLElement | null = null;

  public showSubtitle(text: string, durationMs?: number): void {
    if (!this.container || typeof document === 'undefined') return;
    
    if (!this.subtitleEl) {
      this.subtitleEl = document.createElement('div');
      this.subtitleEl.style.cssText = `
        position: absolute;
        bottom: 10%;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 20px;
        font-weight: 500;
        text-align: center;
        max-width: 80%;
        opacity: 0;
        transition: all 0.3s ease;
        pointer-events: none;
        text-shadow: 1px 1px 2px black;
      `;
      this.container.appendChild(this.subtitleEl);
    }

    this.subtitleEl.innerText = text;
    
    requestAnimationFrame(() => {
      if (this.subtitleEl) {
        this.subtitleEl.style.opacity = '1';
        this.subtitleEl.style.transform = 'translateX(-50%) translateY(0)';
      }
    });

    if (durationMs) {
      setTimeout(() => this.hideSubtitle(), durationMs);
    }
  }

  public hideSubtitle(): void {
    if (this.subtitleEl) {
      this.subtitleEl.style.opacity = '0';
      this.subtitleEl.style.transform = 'translateX(-50%) translateY(20px)';
    }
  }

  // --- Screen Effects ---
  
  private overlayEl: HTMLElement | null = null;
  
  private getOverlayEl(): HTMLElement {
    if (!this.overlayEl) {
      this.overlayEl = document.createElement('div');
      this.overlayEl.style.cssText = `
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        pointer-events: none;
        z-index: 5000;
        opacity: 0;
        transition: opacity 0.5s ease;
      `;
      if (this.container) this.container.appendChild(this.overlayEl);
    }
    return this.overlayEl;
  }

  public flash(color: string = '#ffffff', durationMs: number = 500): void {
    const el = this.getOverlayEl();
    el.style.transition = 'none'; // Instant on
    el.style.backgroundColor = color;
    el.style.opacity = '1';
    
    // Force reflow
    void el.offsetWidth;
    
    // Fade out
    el.style.transition = `opacity ${durationMs}ms ease-out`;
    el.style.opacity = '0';
  }

  public async fade(targetOpacity: number, color: string = '#000000', durationMs: number = 1000): Promise<void> {
    return new Promise((resolve) => {
      const el = this.getOverlayEl();
      el.style.backgroundColor = color;
      el.style.transition = `opacity ${durationMs}ms ease-in-out`;
      el.style.opacity = targetOpacity.toString();
      setTimeout(resolve, durationMs);
    });
  }

  // --- CINEMATIC OVERLAY & VIDEO EDITING HELPERS ---
  public showImageOverlay(url: string, options?: any): string {
    return GlobalCinematicOverlay.showImageOverlay(url, options);
  }

  public removeImageOverlay(id: string): void {
    GlobalCinematicOverlay.removeImageOverlay(id);
  }

  public setLetterbox(enabled: boolean, barHeightPercent?: number): void {
    GlobalCinematicOverlay.setLetterbox(enabled, barHeightPercent);
  }

  public async transitionCut(type?: any, durationMs?: number): Promise<void> {
    await GlobalCinematicOverlay.transitionCut(type, durationMs);
  }

  public setColorGrading(preset: any): void {
    GlobalCinematicOverlay.setColorGrading(preset);
  }
}

export const GlobalUI = new UIManager();

