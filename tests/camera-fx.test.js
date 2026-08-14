import test from 'node:test';
import assert from 'node:assert';
import { CameraFX } from '../packages/core/src/CameraFX.ts';
import { TweenManager } from '../packages/core/src/Tween.ts';

function makeCamera(fov = 60) {
  const calls = { lookAt: 0, updateProjectionMatrix: 0, lastLookTarget: null };
  return {
    position: { x: 0, y: 0, z: 10 },
    fov,
    lookAt: (x, y, z) => {
      calls.lookAt++;
      calls.lastLookTarget = { x, y, z };
    },
    updateProjectionMatrix: () => { calls.updateProjectionMatrix++; },
    calls
  };
}

test('CameraFX - shake jitters within bounds and settles exactly back to base', () => {
  const camera = makeCamera();
  const fx = new CameraFX(camera, new TweenManager());

  fx.shake(2, 1, { decay: 2, axisScale: { x: 1, y: 1, z: 0 } });
  assert.strictEqual(fx.isShaking, true);

  const base = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
  for (let i = 0; i < 20; i++) {
    fx.update(0.05);
    assert.ok(Math.abs(camera.position.x) <= 2.01, `x jitter out of bounds: ${camera.position.x}`);
    assert.ok(Math.abs(camera.position.y) <= 2.01, `y jitter out of bounds: ${camera.position.y}`);
    assert.strictEqual(camera.position.z, base.z, 'z axis disabled by axisScale');
  }

  // Advance past the duration → shake ends and the camera settles back to base.
  fx.update(1);
  assert.strictEqual(fx.isShaking, false);
  assert.ok(Math.abs(camera.position.x - base.x) < 1e-9);
  assert.ok(Math.abs(camera.position.y - base.y) < 1e-9);
  assert.strictEqual(camera.position.z, base.z);
});

test('CameraFX - stopShake settles immediately without a jump', () => {
  const camera = makeCamera();
  const fx = new CameraFX(camera, new TweenManager());
  const base = { x: camera.position.x, y: camera.position.y };
  fx.shake(1, 5);
  fx.update(0.1); // jitters away from base
  assert.ok(camera.position.x !== base.x || camera.position.y !== base.y, 'shake should move the camera');
  fx.stopShake();
  assert.strictEqual(fx.isShaking, false);
  assert.strictEqual(camera.position.x, base.x, 'settles back to the original base');
  assert.strictEqual(camera.position.y, base.y);
});

test('CameraFX - punchZoom springs fov up and returns to base', () => {
  const camera = makeCamera(60);
  const fx = new CameraFX(camera, new TweenManager());
  const projCalls = camera.calls.updateProjectionMatrix;

  fx.punchZoom(10, 0.5);
  fx.tweens.update(0.25);
  assert.ok(camera.fov > 60 && camera.fov < 70, `fov should be mid-punch, got ${camera.fov}`);
  fx.tweens.update(0.25); // forward done
  assert.strictEqual(camera.fov, 70);
  fx.tweens.update(0.5); // reverse done (yoyo)
  assert.strictEqual(camera.fov, 60);
  assert.ok(camera.calls.updateProjectionMatrix > projCalls, 'projection matrix refreshed');
});

test('CameraFX - zoomTo tweens to target and clamps to config bounds', () => {
  const camera = makeCamera(60);
  const fx = new CameraFX(camera, new TweenManager(), { minFov: 20, maxFov: 90 });

  fx.zoomTo(500, 0.5); // clamps to maxFov 90
  fx.tweens.update(0.25);
  fx.tweens.update(0.25);
  assert.strictEqual(camera.fov, 90);

  fx.zoomTo(10, 0.5); // clamps to minFov 20
  fx.tweens.update(0.5);
  assert.strictEqual(camera.fov, 20);
});

test('CameraFX - moveTo tweens camera position', () => {
  const camera = makeCamera();
  const fx = new CameraFX(camera, new TweenManager());

  fx.moveTo({ x: 5, y: 2, z: -3 }, 1, 'linear');
  fx.tweens.update(0.5);
  assert.strictEqual(camera.position.x, 2.5);
  assert.strictEqual(camera.position.y, 1);
  assert.strictEqual(camera.position.z, 3.5);
  fx.tweens.update(0.5);
  assert.strictEqual(camera.position.x, 5);
  assert.strictEqual(camera.position.y, 2);
  assert.strictEqual(camera.position.z, -3);
});

test('CameraFX - lookAt smoothly rotates to face the target', () => {
  const camera = makeCamera();
  const fx = new CameraFX(camera, new TweenManager());

  fx.lookAt({ x: 0, y: 0, z: 0 }, 1, 'linear');
  fx.update(0.5);
  assert.ok(camera.calls.lookAt > 0);
  // Camera at z=10 (default -Z facing → start target z=9), halfway to (0,0,0).
  const mid = camera.calls.lastLookTarget;
  assert.ok(mid.z < 9 && mid.z > 0, `mid look target z should be between 0 and 9, got ${mid.z}`);

  fx.update(0.5);
  const end = camera.calls.lastLookTarget;
  assert.ok(Math.abs(end.x) < 1e-9 && Math.abs(end.y) < 1e-9 && Math.abs(end.z) < 1e-9,
    `should face (0,0,0), got (${end.x},${end.y},${end.z})`);
});

test('CameraFX - lookAt no-ops when camera has no lookAt method', () => {
  const fx = new CameraFX({ position: { x: 0, y: 0, z: 0 } }, new TweenManager());
  fx.lookAt({ x: 1, y: 0, z: 0 }, 1);
  fx.update(1); // must not throw
  fx.punchZoom(10); // no fov → no-op
  assert.ok(true);
});

test('CameraFX - getLookTarget hook seeds the smooth lookAt start', () => {
  const camera = makeCamera();
  const fx = new CameraFX(camera, new TweenManager(), {
    getLookTarget: () => ({ x: 0, y: 5, z: 9 })
  });
  fx.lookAt({ x: 0, y: 0, z: 0 }, 1, 'linear');
  fx.update(0.5);
  const mid = camera.calls.lastLookTarget;
  assert.strictEqual(mid.y, 2.5); // lerp from y=5 (hook) to y=0
  fx.update(0.5);
  assert.ok(Math.abs(camera.calls.lastLookTarget.y) < 1e-9);
});
