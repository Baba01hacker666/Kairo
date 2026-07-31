/**
 * Kairo High-Performance Web UI Framework
 * Provides responsive, animated, themeable HUD overlays, menus, modals, toasts, and settings controls.
 */

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
      font-family: ${this.theme.fontFamily};
      color: ${this.theme.textColor};
      z-index: 1000;
      overflow: hidden;
      box-sizing: border-box;
    `;
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
      background: ${this.theme.cardBackground};
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: ${this.theme.borderRadius};
      padding: 32px;
      max-width: 480px;
      width: 90%;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
      transform: scale(0.9);
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    const titleEl = document.createElement('h2');
    titleEl.style.cssText = `margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: ${this.theme.textColor};`;
    titleEl.innerText = title;

    const bodyEl = document.createElement('div');
    bodyEl.style.cssText = `margin-bottom: 24px; color: ${this.theme.mutedTextColor}; font-size: 15px; line-height: 1.6;`;
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
        background: ${b.primary ? this.theme.primaryColor : 'rgba(255, 255, 255, 0.1)'};
        color: white;
        transition: transform 0.15s, background 0.15s;
      `;
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

  public showAchievement(title: string, description: string, icon: string = '🏆'): void {
    if (!this.container || typeof document === 'undefined') return;
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: absolute;
      top: 24px;
      right: 24px;
      background: ${this.theme.cardBackground};
      border: 1px solid rgba(255, 215, 0, 0.4);
      border-radius: ${this.theme.borderRadius};
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.1);
      transform: translateX(120%);
      transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s;
      z-index: 9999;
    `;
    
    toast.innerHTML = `
      <div style="font-size: 32px;">${icon}</div>
      <div>
        <div style="font-size: 12px; font-weight: bold; color: #facc15; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;">Achievement Unlocked</div>
        <div style="font-size: 16px; font-weight: 600; color: white;">${title}</div>
        <div style="font-size: 13px; color: ${this.theme.mutedTextColor}; margin-top: 2px;">${description}</div>
      </div>
    `;
    
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
        background: ${baseBg}; border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px; cursor: pointer; transition: all 0.2s;
        text-align: center;
      `;
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
}

export const GlobalUI = new UIManager();

