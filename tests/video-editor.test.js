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

test('VideoTimeline - Pan and orbit shots evaluation with array and THREE.Vector3 props', (t) => {
  const mockCamera = { position: { set: function(x, y, z) { this.x = x; this.y = y; this.z = z; }, copy: function(v) { this.x = v.x; this.y = v.y; this.z = v.z; } }, lookAt: function(v) { this.targetX = v.x; this.targetY = v.y; this.targetZ = v.z; } };
  const mockApp = { cameraController: { camera: mockCamera } };
  const timeline = new VideoTimeline(mockApp, 10.0);
  const cameraTrack = timeline.tracks.find(tr => tr.type === 'camera');

  // Test pan shot with array props
  timeline.addClip(cameraTrack.id, {
    name: 'Pan Shot Array',
    type: 'camera',
    startTime: 0.0,
    duration: 5.0,
    props: { shotType: 'pan', fromPos: [0, 0, 0], toPos: [10, 20, 30], target: [0, 5, 0] }
  });

  timeline.evaluateAt(2.5); // 50% progress
  assert.strictEqual(mockCamera.position.x, 5);
  assert.strictEqual(mockCamera.position.y, 10);
  assert.strictEqual(mockCamera.position.z, 15);
  assert.strictEqual(mockCamera.targetY, 5);
  assert.ok(!Number.isNaN(mockCamera.position.x));

  // Test pan shot with THREE.Vector3 props
  cameraTrack.clips = [];
  const THREE = { Vector3: class { constructor(x=0, y=0, z=0) { this.x = x; this.y = y; this.z = z; } } };
  timeline.addClip(cameraTrack.id, {
    name: 'Pan Shot Vector3',
    type: 'camera',
    startTime: 0.0,
    duration: 5.0,
    props: {
      shotType: 'pan',
      fromPos: new THREE.Vector3(0, 0, 0),
      toPos: new THREE.Vector3(20, 40, 60),
      target: new THREE.Vector3(1, 2, 3)
    }
  });

  timeline.evaluateAt(2.5);
  assert.strictEqual(mockCamera.position.x, 10);
  assert.strictEqual(mockCamera.position.y, 20);
  assert.strictEqual(mockCamera.position.z, 30);
  assert.strictEqual(mockCamera.targetX, 1);
  assert.strictEqual(mockCamera.targetY, 2);
  assert.strictEqual(mockCamera.targetZ, 3);
  assert.ok(!Number.isNaN(mockCamera.position.x));
});

test('ScriptBehavior - chase handles both array and THREE.Vector3 targets without NaN', (t) => {
  const behavior = new ScriptBehavior();
  const obj = {
    position: { x: 0, y: 0, z: 0, add: function(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; } },
    scale: { x: 1, y: 1, z: 1 },
    lookAt: function(x, y, z) { this.lookX = x; this.lookY = y; this.lookZ = z; }
  };
  behavior.attach(obj);

  // Test array target
  behavior.chase([10, 0, 0], 2.0, 0.1);
  assert.ok(obj.position.x > 0);
  assert.strictEqual(obj.lookX, 10);
  assert.ok(!Number.isNaN(obj.position.x));

  // Test Vector3 object target
  const targetVec = { x: 0, y: 10, z: 0 };
  behavior.chase(targetVec, 2.0, 0.1);
  assert.ok(obj.position.y > 0);
  assert.strictEqual(obj.lookY, 10);
  assert.ok(!Number.isNaN(obj.position.y));
});

test('VideoTimeline - Zero and negative clip duration evaluation (Corgea safeguard)', (t) => {
  const mockCamera = { position: { set: function() {}, copy: function() {} }, lookAt: function() {} };
  const mockApp = { cameraController: { camera: mockCamera } };
  const timeline = new VideoTimeline(mockApp, 10.0);
  const cameraTrack = timeline.tracks.find(tr => tr.type === 'camera');

  timeline.addClip(cameraTrack.id, {
    name: 'Zero Duration Clip',
    type: 'camera',
    startTime: 1.0,
    duration: 0.0,
    props: { shotType: 'pan', fromPos: [0, 0, 0], toPos: [10, 10, 10], target: [0, 0, 0] }
  });

  // Should evaluate safely without NaN or throw
  assert.doesNotThrow(() => {
    timeline.evaluateAt(1.0);
  });
});


