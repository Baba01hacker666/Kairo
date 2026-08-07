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
export declare class CinematicOverlayManager {
    private container;
    private letterboxTop;
    private letterboxBottom;
    private colorGradeOverlay;
    private transitionOverlay;
    private overlaysMap;
    constructor();
    /**
     * Display image graphics, logos, or texture cutouts over 3D viewport with masking
     */
    showImageOverlay(url: string, options?: OverlayImageOptions): string;
    /**
     * Remove image overlay
     */
    removeImageOverlay(id: string): void;
    /**
     * Toggle 21:9 Widescreen Letterbox Black Bars
     */
    setLetterbox(enabled: boolean, barHeightPercent?: number): void;
    /**
     * Video Editing Transition Cut (Wipe, Fade, Circle Mask, Glitch)
     */
    transitionCut(type?: TransitionType, durationMs?: number): Promise<void>;
    /**
     * Real-time Color Grading Preset Filters
     */
    setColorGrading(preset: ColorGradingPreset): void;
    clearAll(): void;
}
export declare const GlobalCinematicOverlay: CinematicOverlayManager;
