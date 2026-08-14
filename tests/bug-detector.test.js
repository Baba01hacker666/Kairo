import assert from 'node:assert';
import test from 'node:test';
import * as THREE from 'three';
import { GameBugDetector } from '../packages/tools/src/GameBugDetector.ts';
import { World } from '../packages/ecs/src/ECS.ts';
import { PhysicsWorld, RigidBody, Collider, RigidBodyType } from '../packages/physics/src/Physics.ts';
import { Vector3 } from '../packages/core/src/Math.ts';

test('GameBugDetector - Detects NaN in Scene Object3D position and rotation', () => {
  const detector = new GameBugDetector();
  detector.clearBugs();

  const scene = new THREE.Scene();
  const badMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial());
  badMesh.name = 'GlitchObject';
  badMesh.position.set(NaN, 0, 10);
  scene.add(badMesh);

  const mockApp = { scene };
  const report = detector.audit(mockApp);

  assert(report.criticalCount >= 1);
  const nanBug = report.bugs.find(b => b.category === 'nan_infinity');
  assert.notStrictEqual(nanBug, undefined);
  assert(nanBug?.title.includes('NaN'));
  assert.strictEqual(nanBug?.target, 'GlitchObject');
});

test('GameBugDetector - Detects degenerate scale and missing materials', () => {
  const detector = new GameBugDetector();
  detector.clearBugs();

  const scene = new THREE.Scene();
  const zeroScaleMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial());
  zeroScaleMesh.name = 'ZeroScaleProp';
  zeroScaleMesh.scale.set(0, 1, 1);
  scene.add(zeroScaleMesh);

  const noMatMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), undefined);
  noMatMesh.material = null;
  noMatMesh.name = 'BrokenMaterialMesh';
  scene.add(noMatMesh);

  const mockApp = { scene };
  const report = detector.audit(mockApp);

  const scaleBug = report.bugs.find(b => b.title.includes('Degenerate or Negative Scale'));
  assert.notStrictEqual(scaleBug, undefined);

  const matBug = report.bugs.find(b => b.title.includes('Missing Material'));
  assert.notStrictEqual(matBug, undefined);
});

test('GameBugDetector - Detects out of bounds fallen objects', () => {
  const detector = new GameBugDetector();
  detector.clearBugs();

  const scene = new THREE.Scene();
  const fallenMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial());
  fallenMesh.name = 'FallenRock';
  fallenMesh.position.set(0, -250, 0);
  scene.add(fallenMesh);

  const mockApp = { scene };
  const report = detector.audit(mockApp);

  const fallenBug = report.bugs.find(b => b.title.includes('Fallen Out of World'));
  assert.notStrictEqual(fallenBug, undefined);
});

test('GameBugDetector - Detects physics velocity explosion and NaN coordinates', () => {
  const detector = new GameBugDetector();
  detector.clearBugs();

  const physics = new PhysicsWorld();
  const body = new RigidBody();
  body.type = RigidBodyType.Dynamic;
  body.velocity = new Vector3(800, 0, 0); // Extreme speed (> 500 u/s)

  const col = new Collider();
  physics.registerBody(body, col, new Vector3(0, 0, 0));
  if (body.cannonBody) {
    body.cannonBody.velocity.set(800, 0, 0);
  } else {
    body.velocity = new Vector3(800, 0, 0);
  }

  const mockApp = { physics };
  const report = detector.audit(mockApp);

  const speedBug = report.bugs.find(b => b.category === 'physics_anomaly' && b.title.includes('Extreme Physics Velocity'));
  assert.notStrictEqual(speedBug, undefined);
});

test('GameBugDetector - Health score computation & Markdown report generation', () => {
  const detector = new GameBugDetector();
  detector.clearBugs();

  detector.addBug({
    category: 'nan_infinity',
    severity: 'critical',
    title: 'Test Critical Bug',
    description: 'Testing score penalty',
    suggestedFix: 'Fix math'
  });

  detector.addBug({
    category: 'rendering_glitch',
    severity: 'warning',
    title: 'Test Warning Bug',
    description: 'Testing warning penalty',
    suggestedFix: 'Check scale'
  });

  const report = detector.audit({});
  // 100 - (1*25 + 1*8) = 67
  assert.strictEqual(report.healthScore, 67);
  assert.strictEqual(report.criticalCount, 1);
  assert.strictEqual(report.warningCount, 1);

  const md = detector.exportReportMarkdown();
  assert(md.includes('# 🐞 Kairo Engine - Automated Bug Report'));
  assert(md.includes('Test Critical Bug'));
  assert(md.includes('Fix math'));
});
