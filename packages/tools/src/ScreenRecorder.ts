/**
 * Kairo Engine Screenshot & Video Recording Subsystem
 * Enables capturing high-res PNG/JPEG screenshots & 60 FPS WebM/MP4 gameplay video recordings for testing & QA.
 */

export class ScreenRecorder {
  private canvas: HTMLCanvasElement;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  public isRecording: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  /**
   * Capture instant high-resolution canvas screenshot
   */
  public captureScreenshot(
    filename: string = `kairo-shot-${Date.now()}.png`,
    format: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png',
    quality: number = 0.95
  ): string {
    const dataUrl = this.canvas.toDataURL(format, quality);

    if (typeof document !== 'undefined') {
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    return dataUrl;
  }

  /**
   * Start continuous video recording of WebGL canvas stream
   */
  public startRecording(fps: number = 60): boolean {
    if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') return false;
    if (this.isRecording) return false;

    this.recordedChunks = [];
    const stream = (this.canvas as any).captureStream ? (this.canvas as any).captureStream(fps) : null;
    if (!stream) return false;

    let mimeType = 'video/webm';
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      mimeType = 'video/webm;codecs=vp9';
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      mimeType = 'video/webm';
    } else if (MediaRecorder.isTypeSupported('video/mp4')) {
      mimeType = 'video/mp4';
    }

    try {
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 6000000 // 6 Mbps high clarity
      });

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.start(100);
      this.isRecording = true;
      return true;
    } catch (e) {
      console.warn('Failed to start MediaRecorder:', e);
      return false;
    }
  }

  /**
   * Stop video recording and trigger file download or return recorded video Blob
   */
  public stopRecording(filename: string = `kairo-recording-${Date.now()}.webm`): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        const mimeType = this.mediaRecorder?.mimeType || 'video/webm';
        const blob = new Blob(this.recordedChunks, { type: mimeType });

        if (typeof document !== 'undefined') {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 100);
        }

        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }
}
