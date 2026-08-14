export type BugSeverity = 'critical' | 'warning' | 'info';
export type BugCategory = 'nan_infinity' | 'physics_anomaly' | 'memory_leak' | 'rendering_glitch' | 'performance_spike' | 'runtime_error';
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
    healthScore: number;
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
export declare class GameBugDetector {
    detectedBugs: GameBug[];
    private bugIdCounter;
    private isWatchdogActive;
    private watchdogFrameCount;
    private watchdogUnsubscribe;
    private overlay;
    visible: boolean;
    private originalOnError;
    private originalOnUnhandledRejection;
    private onUnhandledRejection;
    private onKeydown;
    private disposed;
    constructor();
    private hookGlobalErrors;
    /** Remove all global error listeners and restore the original handlers. */
    dispose(): void;
    addBug(bug: Omit<GameBug, 'id' | 'timestamp'>): GameBug;
    clearBugs(): void;
    /**
     * Run a comprehensive one-pass audit of the entire game engine state.
     */
    audit(app: any): BugAuditReport;
    private scanSceneGraph;
    private scanECSWorld;
    private scanPhysicsWorld;
    private scanRenderPipeline;
    /**
     * Enable real-time background watchdog that asserts game health every N frames.
     */
    enableLiveWatchdog(app: any, options?: WatchdogOptions): void;
    disableLiveWatchdog(): void;
    /**
     * Automated AI Fuzz Tester
     * Simulates high-frequency player actions, rapid jumps, pounces, camera pans, and edge bounds
     * to automatically expose hidden memory leaks, state desyncs, or physics explosions.
     */
    runFuzzTest(app: any, durationSeconds?: number): Promise<FuzzTestResult>;
    createUIOverlay(): void;
    toggleOverlay(): void;
    private updateOverlayUI;
    exportReportMarkdown(): string;
    downloadReportMarkdown(filename?: string): void;
}
export declare const GlobalGameBugDetector: GameBugDetector;
