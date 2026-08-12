import * as THREE from 'three';

export type TrackType = 'camera' | 'overlay' | 'text' | 'transition' | 'audio' | 'colorGrade';

export interface VideoKeyframe {
  time: number; // in seconds
  value: any;   // numeric, vector, or string
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

export type VideoTrackKeyframe = VideoKeyframe;

export interface TimelineClip {
  id: string;
  name: string;
  type: TrackType;
  startTime: number; // in seconds
  duration: number;  // in seconds
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
export class VideoTimeline {
  public tracks: TimelineTrack[] = [];
  public currentTime: number = 0;
  public totalDuration: number = 10.0;
  public isPlaying: boolean = false;
  public fps: number = 60;

  private app: any;
  private playbackTimer: any = null;

  // Pre-allocated vectors for frame evaluation to prevent GC spikes
  private _evalPos1: THREE.Vector3 = new THREE.Vector3();
  private _evalPos2: THREE.Vector3 = new THREE.Vector3();
  private _evalTarget: THREE.Vector3 = new THREE.Vector3();
  private _evalCurrent: THREE.Vector3 = new THREE.Vector3();

  private _setVector3(target: THREE.Vector3, prop: THREE.Vector3 | [number, number, number] | any): void {
    if (!prop) return;
    if (Array.isArray(prop)) {
      target.set(prop[0] ?? 0, prop[1] ?? 0, prop[2] ?? 0);
    } else if (typeof prop === 'object') {
      if ('x' in prop && typeof prop.x === 'number') {
        target.set(prop.x, prop.y ?? 0, prop.z ?? 0);
      } else if (typeof prop[0] === 'number') {
        target.set(prop[0], prop[1] ?? 0, prop[2] ?? 0);
      }
    }
  }

  constructor(app?: any, duration: number = 10.0) {
    this.app = app;
    this.totalDuration = duration;

    // Create default video editing tracks
    this.addTrack('Camera Shots', 'camera');
    this.addTrack('Overlays & Graphics', 'overlay');
    this.addTrack('Titles & Subtitles', 'text');
    this.addTrack('Transitions & Cuts', 'transition');
    this.addTrack('Audio & Music', 'audio');
    this.addTrack('Color Grading & FX', 'colorGrade');
  }

  public addTrack(name: string, type: TrackType): TimelineTrack {
    const track: TimelineTrack = {
      id: `track_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      type,
      muted: false,
      locked: false,
      clips: []
    };
    this.tracks.push(track);
    return track;
  }

  public addClip(trackId: string, clipData: Omit<TimelineClip, 'id'>): TimelineClip {
    const track = this.tracks.find(t => t.id === trackId || t.name === trackId || t.type === trackId);
    if (!track) throw new Error(`Track ${trackId} not found`);

    const clip: TimelineClip = {
      ...clipData,
      id: `clip_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    };

    track.clips.push(clip);
    track.clips.sort((a, b) => a.startTime - b.startTime);

    // Update total duration if clip exceeds current max
    const clipEnd = clip.startTime + clip.duration;
    if (clipEnd > this.totalDuration) {
      this.totalDuration = clipEnd;
    }

    return clip;
  }

  /**
   * Scrub video timeline playhead to exact time (seconds)
   */
  public seek(time: number): void {
    this.currentTime = Math.max(0, Math.min(this.totalDuration, time));
    this.evaluateAt(this.currentTime);
  }

  /**
   * Start playing video timeline
   */
  public play(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;

    let lastTime = performance.now();
    const tick = () => {
      if (!this.isPlaying) return;
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      this.currentTime += dt;
      if (this.currentTime >= this.totalDuration) {
        this.currentTime = this.totalDuration;
        this.pause();
      }

      this.evaluateAt(this.currentTime);

      if (this.isPlaying) {
        this.playbackTimer = requestAnimationFrame(tick);
      }
    };

    lastTime = performance.now();
    this.playbackTimer = requestAnimationFrame(tick);
  }

  /**
   * Pause video timeline playback
   */
  public pause(): void {
    this.isPlaying = false;
    if (this.playbackTimer) {
      cancelAnimationFrame(this.playbackTimer);
      this.playbackTimer = null;
    }
  }

  /**
   * Evaluate timeline state at specific timestamp and apply camera, overlays, text, transitions & audio
   */
  public evaluateAt(time: number): void {
    for (const track of this.tracks) {
      if (track.muted) continue;

      for (const clip of track.clips) {
        const clipEnd = clip.startTime + clip.duration;
        const isActive = time >= clip.startTime && time <= clipEnd;

        if (!isActive) continue;

        const localTime = time - clip.startTime;
        const progress = localTime / clip.duration;

        // Process Track Behaviors
        if (track.type === 'camera' && this.app?.cameraController) {
          if (clip.props.shotType === 'pan' && clip.props.fromPos && clip.props.toPos && clip.props.target) {
            this._setVector3(this._evalPos1, clip.props.fromPos);
            this._setVector3(this._evalPos2, clip.props.toPos);
            this._evalCurrent.lerpVectors(this._evalPos1, this._evalPos2, progress);

            this.app.cameraController.camera.position.copy(this._evalCurrent);
            this._setVector3(this._evalTarget, clip.props.target);
            this.app.cameraController.camera.lookAt(this._evalTarget);
          } else if (clip.props.shotType === 'orbit' && clip.props.target) {
            const angle = localTime * (clip.props.speed || 1.0);
            const radius = clip.props.radius || 8.0;
            this._setVector3(this._evalTarget, clip.props.target);
            this.app.cameraController.camera.position.set(
              this._evalTarget.x + Math.sin(angle) * radius,
              this._evalTarget.y + 3.0,
              this._evalTarget.z + Math.cos(angle) * radius
            );
            this.app.cameraController.camera.lookAt(this._evalTarget);
          }
        }

        if (track.type === 'overlay' && this.app?.ui) {
          if (clip.props.url) {
            this.app.ui.showImageOverlay(clip.props.url, {
              id: clip.id,
              x: clip.props.x ?? '50%',
              y: clip.props.y ?? '50%',
              width: clip.props.width ?? '240px',
              opacity: clip.props.opacity ?? 1.0,
              mask: clip.props.mask ?? 'none'
            });
          }
        }

        if (track.type === 'text' && this.app?.ui) {
          if (clip.props.text) {
            this.app.ui.showSubtitle(clip.props.text, Math.min(2000, clip.duration * 1000));
          }
        }

        if (track.type === 'transition' && this.app?.ui) {
          if (clip.props.transitionType && localTime < 0.1) {
            this.app.ui.transitionCut(clip.props.transitionType, clip.duration * 1000);
          }
        }

        if (track.type === 'colorGrade' && this.app?.ui) {
          if (clip.props.preset) {
            this.app.ui.setColorGrading(clip.props.preset);
          }
        }

        if (track.type === 'audio' && this.app?.audio) {
          if (clip.props.soundName && localTime < 0.1) {
            this.app.audio.playSynthesizedSound(clip.props.soundName);
          }
        }
      }
    }
  }

  /**
   * Export video timeline as WebM video file using WebGL recorder
   */
  public async exportVideo(filename: string = 'kairo-video-edit.webm'): Promise<void> {
    if (!this.app?.startRecording || !this.app?.stopRecording) {
      throw new Error('ScreenRecorder not attached to app');
    }

    this.seek(0);
    this.app.startRecording(this.fps);
    this.play();

    return new Promise((resolve) => {
      const checkEnd = setInterval(async () => {
        if (this.currentTime >= this.totalDuration) {
          clearInterval(checkEnd);
          this.pause();
          await this.app.stopRecording(filename);
          resolve();
        }
      }, 100);
    });
  }

  /**
   * Serialize video timeline to JSON
   */
  public toJSON(): Record<string, any> {
    return {
      totalDuration: this.totalDuration,
      fps: this.fps,
      tracks: this.tracks
    };
  }

  /**
   * Load video timeline from JSON
   */
  public fromJSON(data: Record<string, any>): void {
    this.totalDuration = data.totalDuration || 10.0;
    this.fps = data.fps || 60;
    this.tracks = data.tracks || [];
  }
}
