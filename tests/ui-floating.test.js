import test from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';
import * as THREE from 'three';
import { FloatingTextManager, GlobalFloatingText } from '../packages/ui/src/FloatingText.ts';

test('FloatingTextManager - 3D world to screen projection calculation', () => {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  global.document = dom.window.document;
  global.window = dom.window;

  const ft = new FloatingTextManager(document.body);
  const camera = new THREE.PerspectiveCamera(60, 800 / 600, 0.1, 1000);
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();

  // Project point in center of screen (0, 0, 0)
  const centerProj = ft.projectToScreen(new THREE.Vector3(0, 0, 0), camera, 800, 600);
  assert.strictEqual(centerProj.visible, true);
  assert.strictEqual(Math.round(centerProj.x), 400);
  assert.strictEqual(Math.round(centerProj.y), 300);

  // Project point behind camera (0, 0, 20) -> should have z > 1 so visible = false
  const behindProj = ft.projectToScreen(new THREE.Vector3(0, 0, 20), camera, 800, 600);
  assert.strictEqual(behindProj.visible, false);
});

test('FloatingTextManager - spawnFloatingNumber DOM node creation and styling', () => {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  global.document = dom.window.document;
  global.window = dom.window;
  global.requestAnimationFrame = (fn) => setTimeout(fn, 0);

  const container = document.createElement('div');
  document.body.appendChild(container);
  const ft = new FloatingTextManager(container);

  // Normal damage number
  const el = ft.spawnFloatingNumber({
    text: '-50',
    position: { x: 100, y: 150, z: 0 },
    color: '#ef4444',
    container
  });

  assert.ok(el);
  assert.strictEqual(el.innerText, '-50');
  assert.strictEqual(el.style.color, 'rgb(239, 68, 68)');
  assert.strictEqual(el.style.left, '100px');
  assert.strictEqual(el.style.top, '150px');

  // Critical strike number
  const critEl = ft.spawnFloatingNumber({
    text: 'CRITICAL! -150',
    position: { x: 200, y: 250, z: 0 },
    isCrit: true,
    container
  });

  assert.ok(critEl);
  assert.strictEqual(critEl.innerText, 'CRITICAL! -150');
  assert.strictEqual(critEl.style.color, 'rgb(250, 204, 21)');
});

test('FloatingTextManager - createFloatingHealthBar health update and positioning', () => {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  global.document = dom.window.document;
  global.window = dom.window;

  const container = document.createElement('div');
  document.body.appendChild(container);
  const ft = new FloatingTextManager(container);

  const camera = new THREE.PerspectiveCamera(60, 800 / 600, 0.1, 1000);
  camera.position.set(0, 5, 10);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();

  const handle = ft.createFloatingHealthBar({ x: 0, y: 0, z: 0 }, {
    max: 100,
    current: 100,
    width: 80,
    height: 8,
    camera,
    container
  });

  assert.ok(handle.element);
  const fill = handle.element.firstChild;
  assert.ok(fill);
  assert.strictEqual(fill.style.width, '100%');

  // Update health to 40% (should turn orange/warning)
  handle.setHealth(40);
  assert.strictEqual(fill.style.width, '40%');
  assert.strictEqual(fill.style.backgroundColor, 'rgb(245, 158, 11)');

  // Update health to 15% (should turn red/danger)
  handle.setHealth(15);
  assert.strictEqual(fill.style.width, '15%');
  assert.strictEqual(fill.style.backgroundColor, 'rgb(239, 68, 68)');

  handle.remove();
  assert.strictEqual(container.contains(handle.element), false);
});
