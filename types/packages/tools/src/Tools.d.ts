import { RenderMetrics } from '@kairo/renderer';
export declare class DebugInspector {
    private overlay;
    private metricsElement;
    private entityCountElement;
    visible: boolean;
    constructor();
    createOverlay(): void;
    toggle(): void;
    update(metrics: RenderMetrics, entityCount?: number): void;
}
export declare const GlobalDebugInspector: DebugInspector;
