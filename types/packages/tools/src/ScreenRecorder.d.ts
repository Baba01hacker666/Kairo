/**
 * Kairo Engine Screenshot & Video Recording Subsystem
 * Enables capturing high-res PNG/JPEG screenshots & 60 FPS WebM/MP4 gameplay video recordings for testing & QA.
 */
export declare class ScreenRecorder {
    private canvas;
    private mediaRecorder;
    private recordedChunks;
    isRecording: boolean;
    constructor(canvas: HTMLCanvasElement);
    /**
     * Capture instant high-resolution canvas screenshot
     */
    captureScreenshot(filename?: string, format?: 'image/png' | 'image/jpeg' | 'image/webp', quality?: number): string;
    /**
     * Start continuous video recording of WebGL canvas stream
     */
    startRecording(fps?: number): boolean;
    /**
     * Stop video recording and trigger file download or return recorded video Blob
     */
    stopRecording(filename?: string): Promise<Blob | null>;
}
