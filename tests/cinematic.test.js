import { test } from 'node:test';
import assert from 'node:assert';
import * as THREE from 'three';
import { CameraController } from '../packages/renderer/src/Camera.ts';
import { ScriptBehavior } from '../packages/core/src/Scripting.ts';

test('CameraController - Cinematic camera shots (panTo, orbitShot, cutTo, dollyZoom)', (t) => {
  const camera = new THREE.PerspectiveCamera(60, 16 / 9, 0.1, 1000);
  const controller = new CameraController(camera);

  // 1. Cut Shot
  controller.cutTo(new THREE.Vector3(10, 5, 20), new THREE.Vector3(0, 0, 0));
  assert.strictEqual(camera.position.x, 10);
  assert.strictEqual(camera.position.y, 5);
  assert.strictEqual(camera.position.z, 20);

  // 2. Pan Shot Interpolation
  controller.panTo(new THREE.Vector3(0, 5, 10), new THREE.Vector3(20, 5, 10), new THREE.Vector3(0, 0, 0), 2.0);
  controller.update(1.0); // Halfway progress
  assert.ok(camera.position.x > 0 && camera.position.x < 20);

  // 3. Orbit Shot
  controller.orbitShot(new THREE.Vector3(0, 0, 0), 10.0, 1.0, 5.0);
  controller.update(0.5);
  assert.ok(camera.position.x !== 0 || camera.position.z !== 0);

  // 4. Dolly Zoom
  controller.dollyZoom(30, 2.0);
  controller.update(0.5);
  assert.ok(camera.fov < 60);
});

test('ScriptBehavior - Cinematic video editing helper methods', (t) => {
  const behavior = new ScriptBehavior();
  assert.strictEqual(typeof behavior.cutToShot, 'function');
  assert.strictEqual(typeof behavior.panCamera, 'function');
  assert.strictEqual(typeof behavior.orbitCamera, 'function');
  assert.strictEqual(typeof behavior.dollyZoom, 'function');
  assert.strictEqual(typeof behavior.craneShot, 'function');
  assert.strictEqual(typeof behavior.trackObject, 'function');
  assert.strictEqual(typeof behavior.showOverlayImage, 'function');
  assert.strictEqual(typeof behavior.letterbox, 'function');
  assert.strictEqual(typeof behavior.transitionCut, 'function');
  assert.strictEqual(typeof behavior.setColorGrading, 'function');
});
