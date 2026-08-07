export type TrackType = 'camera' | 'overlay' | 'text' | 'transition' | 'audio' | 'colorGrade';
export interface VideoKeyframe {
    time: number;
    value: any;
    easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}
export type VideoTrackKeyframe = VideoKeyframe;
export interface TimelineClip {
    id: string;
    name: string;
    type: TrackType;
    startTime: number;
    duration: number;
    props: Record<string, any>;
    keyframes?: Record<string, VideoKeyframe[]>;
}
export interface TimelineTrack {
    id: string;
    name: string;
    type: TrackType;
    muted: boolean;
    locked: boolean;
    clips: TimelineClip[];
}
/**
 * High-Performance Multi-Track HTML5 Video Editor Engine
 * Supports camera keyframing, image overlays, video cuts, masking, titling, audio mixing & color grading
 */
export declare class VideoTimeline {
    tracks: TimelineTrack[];
    currentTime: number;
    totalDuration: number;
    isPlaying: boolean;
    fps: number;
    private app;
    private playbackTimer;
    constructor(app?: any, duration?: number);
    addTrack(name: string, type: TrackType): TimelineTrack;
    addClip(trackId: string, clipData: Omit<TimelineClip, 'id'>): TimelineClip;
    /**
     * Scrub video timeline playhead to exact time (seconds)
     */
    seek(time: number): void;
    /**
     * Start playing video timeline
     */
    play(): void;
    /**
     * Pause video timeline playback
     */
    pause(): void;
    /**
     * Evaluate timeline state at specific timestamp and apply camera, overlays, text, transitions & audio
     */
    evaluateAt(time: number): void;
    /**
     * Export video timeline as WebM video file using WebGL recorder
     */
    exportVideo(filename?: string): Promise<void>;
    /**
     * Serialize video timeline to JSON
     */
    toJSON(): Record<string, any>;
    /**
     * Load video timeline from JSON
     */
    fromJSON(data: Record<string, any>): void;
}
