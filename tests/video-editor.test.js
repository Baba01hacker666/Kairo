import { test } from 'node:test';
import assert from 'node:assert';
import { VideoTimeline } from '../packages/tools/src/VideoEditor.ts';
import { ScriptBehavior } from '../packages/core/src/Scripting.ts';

test('VideoTimeline - Multi-track creation & clip management', (t) => {
  const timeline = new VideoTimeline(null, 12.0);
  assert.strictEqual(timeline.tracks.length, 6);

  const cameraTrack = timeline.tracks.find(t => t.type === 'camera');
  assert.ok(cameraTrack);

  const clip = timeline.addClip(cameraTrack.id, {
    name: 'Intro Orbit Shot',
    type: 'camera',
    startTime: 0.0,
    duration: 4.0,
    props: { shotType: 'orbit', target: [0, 1, 0], radius: 6.0, speed: 1.0 }
  });

  assert.strictEqual(cameraTrack.clips.length, 1);
  assert.strictEqual(clip.duration, 4.0);
});

test('VideoTimeline - Playback, seeking & timeline evaluation', (t) => {
  const timeline = new VideoTimeline(null, 10.0);
  
  timeline.seek(2.5);
  assert.strictEqual(timeline.currentTime, 2.5);

  timeline.seek(15.0); // Exceeds max duration
  assert.strictEqual(timeline.currentTime, 10.0);

  timeline.seek(-5.0); // Below 0
  assert.strictEqual(timeline.currentTime, 0.0);
});

test('VideoTimeline - JSON Serialization & Deserialization', (t) => {
  const timeline = new VideoTimeline(null, 15.0);
  const json = timeline.toJSON();

  assert.strictEqual(json.totalDuration, 15.0);
  assert.strictEqual(json.fps, 60);
  assert.ok(Array.isArray(json.tracks));

  const newTimeline = new VideoTimeline();
  newTimeline.fromJSON(json);
  assert.strictEqual(newTimeline.totalDuration, 15.0);
});

test('ScriptBehavior & Core Engine - Video editing helper methods', (t) => {
  const behavior = new ScriptBehavior();
  assert.strictEqual(typeof behavior.createVideoTimeline, 'function');
  assert.strictEqual(typeof behavior.addCameraShot, 'function');
  assert.strictEqual(typeof behavior.addVideoOverlay, 'function');
  assert.strictEqual(typeof behavior.addVideoText, 'function');
  assert.strictEqual(typeof behavior.addVideoTransition, 'function');
  assert.strictEqual(typeof behavior.addVideoColorGrading, 'function');
  assert.strictEqual(typeof behavior.playVideoTimeline, 'function');
  assert.strictEqual(typeof behavior.exportVideoFile, 'function');
});
