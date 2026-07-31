import test from 'node:test';
import assert from 'node:assert';
import { ScreenRecorder } from '../packages/tools/src/ScreenRecorder.ts';

test('ScreenRecorder instance API methods', () => {
  // Mock canvas object for node environment
  const mockCanvas = {
    toDataURL: (format, quality) => `data:${format};base64,mockimagedata`,
    captureStream: (fps) => ({ getTracks: () => [] })
  };

  const recorder = new ScreenRecorder(mockCanvas);

  assert.strictEqual(typeof recorder.captureScreenshot, 'function');
  assert.strictEqual(typeof recorder.startRecording, 'function');
  assert.strictEqual(typeof recorder.stopRecording, 'function');

  const shotData = recorder.captureScreenshot('test-shot.png');
  assert.ok(shotData.startsWith('data:image/png'));
});
