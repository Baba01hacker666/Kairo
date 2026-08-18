/**
 * Kairo High-Performance Web UI Framework
 * Provides responsive, animated, themeable HUD overlays, menus, modals, toasts, and settings controls.
 */
import { FloatingTextOptions, FloatingHealthBarOptions, FloatingHealthBarHandle } from './FloatingText.ts';
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
export declare const DefaultTheme: UITheme;
export declare class UIManager {
    container: HTMLElement | null;
    theme: UITheme;
    constructor(theme?: UITheme);
    private applyGlobalStyles;
    showToast(message: string, durationMs?: number, type?: 'info' | 'success' | 'warning'): void;
    createModal(title: string, contentHtml: string, buttons: {
        text: string;
        primary?: boolean;
        onClick: () => void;
    }[]): HTMLElement | null;
    showStartScreen(options: {
        title: string;
        subtitle?: string;
        btnText?: string;
        onStart: () => void;
    }): HTMLElement | null;
    showEndScreen(options: {
        title: string;
        subtitle?: string;
        score?: string;
        btnText?: string;
        onRestart: () => void;
    }): HTMLElement | null;
    showAchievement(title: string, description: string, icon?: string): void;
    createGameMenu(title: string, options: {
        text: string;
        onClick: () => void;
        color?: string;
    }[]): HTMLElement | null;
    clear(): void;
    private subtitleEl;
    showSubtitle(text: string, durationMs?: number): void;
    hideSubtitle(): void;
    private overlayEl;
    private getOverlayEl;
    flash(color?: string, durationMs?: number): void;
    fade(targetOpacity: number, color?: string, durationMs?: number): Promise<void>;
    showImageOverlay(url: string, options?: any): string;
    removeImageOverlay(id: string): void;
    setLetterbox(enabled: boolean, barHeightPercent?: number): void;
    transitionCut(type?: any, durationMs?: number): Promise<void>;
    setColorGrading(preset: any): void;
    showFloatingNumber(options: FloatingTextOptions): HTMLElement | null;
    createFloatingHealthBar(targetPos: {
        x: number;
        y: number;
        z: number;
    } | any, options?: FloatingHealthBarOptions): FloatingHealthBarHandle;
}
export declare const GlobalUI: UIManager;
