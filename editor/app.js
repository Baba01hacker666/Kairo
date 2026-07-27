/**
 * Kairo Engine Studio - Main Editor Application Script
 * Full 3D Camera Controls: Orbit, Pan, Zoom, Reset, & Viewport Gizmo Controls.
 */

// --- ENGINE MATH & UTILS ---
class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x; this.y = y; this.z = z;
  }
  set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
  clone() { return new Vector3(this.x, this.y, this.z); }
  add(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; }
  scale(s) { this.x *= s; this.y *= s; this.z *= s; return this; }
}

// Web Audio API Synthesizer
class AudioManager {
  constructor() { this.ctx = null; }
  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) this.ctx = new AudioCtx();
  }
  playSound(type) {
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      const now = this.ctx.currentTime;

      if (type === 'jump') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(550, now + 0.18);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.18);
        osc.start(now); osc.stop(now + 0.18);
      } else if (type === 'run') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(now); osc.stop(now + 0.12);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.04);
        osc.start(now); osc.stop(now + 0.04);
      }
    } catch (e) {}
  }
}
const audioManager = new AudioManager();

// --- EDITOR STATE ---
const state = {
  isPlaying: true,
  isPaused: false,
  selectedEntityId: 'stickman_root',
  activeGizmo: 'translate',
  showPhysicsDebug: false,
  entities: [],
  demoType: 'stickman', // Default 3D Studio Mode
  stickmanAnimState: 'idle',
  animSpeed: 1.0,
  ikTargetHeight: 0.0,
  isLeftCollapsed: false,
  isRightCollapsed: false,
  isDrawerCollapsed: false,
  isZenMode: false
};

// Global Mouse Screen Tracking
let mouseScreenPos = { x: 400, y: 300 };
let mouseNormPos = { x: 0, y: 0 };
window.addEventListener('mousemove', (e) => {
  mouseScreenPos.x = e.clientX;
  mouseScreenPos.y = e.clientY;
  mouseNormPos.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouseNormPos.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

// --- THREE.JS 3D VIEWPORT & CAMERA NAVIGATION ---
let container, canvas3D, scene, camera, renderer;
let canvas2D, ctx2D;
let threeObjectsMap = new Map();

// Camera Orbit & Pan State
let camTarget = new THREE.Vector3(0, 1.8, 0);
let camRadius = 7.5;
let camTheta = 0;
let camPhi = Math.PI / 2.3;

// 3D Character References
let stickmanBones = {
  rootGroup: null,
  pelvis: null, torso: null, head: null,
  leftEye: null, rightEye: null, leftPupil: null, rightPupil: null,
  leftUpperArm: null, leftForearm: null, leftHand: null,
  rightUpperArm: null, rightForearm: null, rightHand: null,
  leftThigh: null, leftShin: null, leftFoot: null,
  rightThigh: null, rightShin: null, rightFoot: null
};

function initViewport() {
  canvas3D = document.getElementById('viewport-canvas');
  canvas2D = document.getElementById('canvas-2d');
  container = canvas3D.parentElement;
  ctx2D = canvas2D.getContext('2d');

  // 1. Three.js 3D Scene Setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0c0f);
  scene.fog = new THREE.FogExp2(0x0a0c0f, 0.015);

  // 2. Camera Setup
  const aspect = container.clientWidth / container.clientHeight;
  camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
  updateCameraTransform();

  // 3. Renderer Setup
  renderer = new THREE.WebGLRenderer({ canvas: canvas3D, antialias: true, alpha: false });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // 4. Grid Floor at Y = 0
  const gridHelper = new THREE.GridHelper(30, 30, 0x6366f1, 0x232938);
  gridHelper.position.y = 0;
  scene.add(gridHelper);

  // 5. Studio Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xfffaed, 1.5);
  sunLight.position.set(5, 12, 6);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  scene.add(sunLight);

  const keyLight = new THREE.PointLight(0x06b6d4, 3.0, 15);
  keyLight.position.set(-3, 3.5, 4);
  scene.add(keyLight);

  // Handle Resize
  window.addEventListener('resize', onWindowResize);

  // Advanced Orbit, Pan & Zoom Camera Controls
  setupAdvancedCameraControls();

  // Dropdowns & Drawers
  setupDropdownMenus();
  setupCollapsibleDrawers();

  // Load Default 3D Character Scene
  loadDemoScene('stickman');

  // Start Loop
  animate(0);
}

function updateCameraTransform() {
  if (!camera) return;
  camPhi = Math.max(0.1, Math.min(Math.PI - 0.1, camPhi));
  camRadius = Math.max(1.5, Math.min(40, camRadius));

  camera.position.x = camTarget.x + camRadius * Math.sin(camPhi) * Math.sin(camTheta);
  camera.position.y = camTarget.y + camRadius * Math.cos(camPhi);
  camera.position.z = camTarget.z + camRadius * Math.sin(camPhi) * Math.cos(camTheta);
  camera.lookAt(camTarget);
}

function onWindowResize() {
  if (!container) return;
  const width = container.clientWidth;
  const height = container.clientHeight;

  if (renderer && camera) {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  if (canvas2D) {
    canvas2D.width = width;
    canvas2D.height = height;
  }
}

// --- ADVANCED CAMERA CONTROL SUITE (ORBIT, PAN, ZOOM & GIZMOS) ---
function setupAdvancedCameraControls() {
  let isDragging = false;
  let isPanning = false;
  let prevMouse = { x: 0, y: 0 };

  const viewportPanel = document.getElementById('viewport-container');

  viewportPanel.addEventListener('mousedown', (e) => {
    if (e.target.closest('.camera-controls-overlay') || e.target.closest('.viewport-overlay')) return;
    isDragging = true;
    isPanning = e.shiftKey || e.button === 1 || e.button === 2;
    prevMouse = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - prevMouse.x;
    const dy = e.clientY - prevMouse.y;

    if (isPanning) {
      // Pan Camera parallel to Viewport
      const right = new THREE.Vector3().crossVectors(camera.up, camera.getWorldDirection(new THREE.Vector3())).negate().normalize();
      const up = new THREE.Vector3().copy(camera.up).normalize();

      camTarget.addScaledVector(right, -dx * 0.008);
      camTarget.addScaledVector(up, dy * 0.008);
    } else {
      // Orbit Camera Angle
      camTheta -= dx * 0.006;
      camPhi -= dy * 0.006;
    }

    updateCameraTransform();
    prevMouse = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => { isDragging = false; isPanning = false; });
  viewportPanel.addEventListener('contextmenu', (e) => e.preventDefault());

  // Mouse Wheel Zoom
  viewportPanel.addEventListener('wheel', (e) => {
    e.preventDefault();
    camRadius *= (1 + e.deltaY * 0.001);
    updateCameraTransform();
  });

  // Viewport Overlay Camera Controls Buttons
  const resetBtn = document.getElementById('cam-btn-reset');
  const zoomInBtn = document.getElementById('cam-btn-zoom-in');
  const zoomOutBtn = document.getElementById('cam-btn-zoom-out');
  const rotLeftBtn = document.getElementById('cam-btn-rot-left');
  const rotRightBtn = document.getElementById('cam-btn-rot-right');

  if (resetBtn) resetBtn.onclick = () => {
    camTarget.set(0, 1.8, 0);
    camRadius = 7.5;
    camTheta = 0;
    camPhi = Math.PI / 2.3;
    updateCameraTransform();
    audioManager.playSound('click');
  };

  if (zoomInBtn) zoomInBtn.onclick = () => { camRadius *= 0.82; updateCameraTransform(); };
  if (zoomOutBtn) zoomOutBtn.onclick = () => { camRadius *= 1.18; updateCameraTransform(); };
  if (rotLeftBtn) rotLeftBtn.onclick = () => { camTheta += Math.PI / 4; updateCameraTransform(); };
  if (rotRightBtn) rotRightBtn.onclick = () => { camTheta -= Math.PI / 4; updateCameraTransform(); };
}

// --- COLLAPSIBLE DRAWERS & ZEN MODE ---
function setupCollapsibleDrawers() {
  const leftPanel = document.getElementById('sidebar-left');
  const rightPanel = document.getElementById('sidebar-right');
  const bottomDrawer = document.getElementById('bottom-drawer');
  const statsOverlay = document.getElementById('viewport-stats-overlay');
  const camOverlay = document.getElementById('camera-controls-overlay');

  const btnLeft = document.getElementById('toggle-sidebar-left');
  const btnRight = document.getElementById('toggle-sidebar-right');
  const btnDrawer = document.getElementById('toggle-bottom-drawer');
  const btnCollapseDrawer = document.getElementById('btn-collapse-drawer');
  const btnZen = document.getElementById('btn-zen-mode');

  if (btnLeft && leftPanel) {
    btnLeft.onclick = () => {
      state.isLeftCollapsed = !state.isLeftCollapsed;
      leftPanel.classList.toggle('collapsed', state.isLeftCollapsed);
      btnLeft.classList.toggle('active', !state.isLeftCollapsed);
      setTimeout(onWindowResize, 260);
    };
  }

  if (btnRight && rightPanel) {
    btnRight.onclick = () => {
      state.isRightCollapsed = !state.isRightCollapsed;
      rightPanel.classList.toggle('collapsed', state.isRightCollapsed);
      btnRight.classList.toggle('active', !state.isRightCollapsed);
      setTimeout(onWindowResize, 260);
    };
  }

  const toggleDrawerFn = () => {
    state.isDrawerCollapsed = !state.isDrawerCollapsed;
    bottomDrawer.classList.toggle('collapsed', state.isDrawerCollapsed);
    if (btnDrawer) btnDrawer.classList.toggle('active', !state.isDrawerCollapsed);
    if (btnCollapseDrawer) btnCollapseDrawer.innerText = state.isDrawerCollapsed ? '▲ Show Studio Drawer' : '▼ Hide Drawer';
    setTimeout(onWindowResize, 260);
  };

  if (btnDrawer) btnDrawer.onclick = toggleDrawerFn;
  if (btnCollapseDrawer) btnCollapseDrawer.onclick = toggleDrawerFn;

  if (btnZen) {
    btnZen.onclick = () => {
      state.isZenMode = !state.isZenMode;
      if (leftPanel) leftPanel.classList.toggle('collapsed', state.isZenMode);
      if (rightPanel) rightPanel.classList.toggle('collapsed', state.isZenMode);
      if (bottomDrawer) bottomDrawer.classList.toggle('collapsed', state.isZenMode);
      if (statsOverlay) statsOverlay.classList.toggle('hidden', state.isZenMode);
      if (camOverlay) camOverlay.style.display = state.isZenMode ? 'none' : 'flex';

      btnZen.classList.toggle('active', state.isZenMode);
      btnZen.innerText = state.isZenMode ? '👁 Restore Studio' : '👁 Pure Viewport';
      setTimeout(onWindowResize, 260);
    };
  }
}

// --- FUNCTIONAL DROPDOWN MENUS ---
function setupDropdownMenus() {
  const menus = ['file', 'edit', 'scene', 'gameobject', 'help'];

  menus.forEach(m => {
    const btn = document.getElementById(`menu-btn-${m}`);
    const dropdown = document.getElementById(`dropdown-${m}`);

    if (btn && dropdown) {
      btn.onclick = (e) => {
        e.stopPropagation();
        const wasShowing = dropdown.classList.contains('show');
        document.querySelectorAll('.dropdown-menu').forEach(d => d.classList.remove('show'));
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));

        if (!wasShowing) {
          dropdown.classList.add('show');
          btn.classList.add('active');
        }
      };
    }
  });

  window.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu').forEach(d => d.classList.remove('show'));
    document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
  });

  const bindAction = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.onclick = (e) => { e.stopPropagation(); fn(); document.querySelectorAll('.dropdown-menu').forEach(d => d.classList.remove('show')); };
  };

  bindAction('menu-new-scene', () => { loadDemoScene(state.demoType); logConsole('[Scene] New Scene created.'); });
  bindAction('menu-save-scene', () => { alert('Scene saved to Kairo Local Storage!'); logConsole('[Scene] Scene saved successfully.'); });
  bindAction('menu-export-proj', () => { alert('Project exported to Standalone WebGL / 2D Canvas Bundle!'); logConsole('[Build] Project build exported.'); });
  
  bindAction('menu-add-stickman', () => { loadDemoScene('stickman'); logConsole('[Scene] Added 3D Character.'); });
  bindAction('menu-add-cube', () => { createEntity('3D Cube', `cube_${Date.now()}`, { x: (Math.random()-0.5)*4, y: 1.5, z: (Math.random()-0.5)*4 }, { x: 1, y: 1, z: 1 }, 0x6366f1); updateHierarchyTree(); logConsole('[Scene] Added 3D Cube entity.'); });
  bindAction('menu-add-sphere', () => { createEntity('3D Sphere', `sphere_${Date.now()}`, { x: (Math.random()-0.5)*4, y: 1.5, z: (Math.random()-0.5)*4 }, { x: 1, y: 1, z: 1 }, 0x10b981, false, 'sphere'); updateHierarchyTree(); logConsole('[Scene] Added 3D Sphere entity.'); });
  bindAction('menu-clear-scene', () => { threeObjectsMap.forEach(o => scene.remove(o)); threeObjectsMap.clear(); state.entities = []; updateHierarchyTree(); logConsole('[Scene] Scene cleared.'); });
  
  bindAction('menu-help-docs', () => alert('Kairo Engine API Reference:\n\n- @kairo/core: Main Loop, Vector3\n- @kairo/renderer: WebGL 3D & HTML5 2D Canvas Dual Engine'));
  bindAction('menu-help-about', () => alert('Kairo Engine Studio v1.0.0\nTypeScript 2D/3D Dual Engine Studio'));
}

function logConsole(msg, type = 'info') {
  const container = document.getElementById('tab-console');
  if (container) {
    const line = document.createElement('div');
    line.className = `console-log ${type}`;
    line.innerText = msg;
    container.appendChild(line);
    container.scrollTop = container.scrollHeight;
  }
}

// --- 3D CHARACTER BUILDER ---
function build3DCharacter() {
  const charGroup = new THREE.Group();
  charGroup.name = '3D Character';
  scene.add(charGroup);

  const bodyShirtMat = new THREE.MeshStandardMaterial({ color: 0x6366f1, roughness: 0.3, metalness: 0.1 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.1 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.1 });
  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.2, metalness: 0.3 });

  function createLimbMesh(radius, length, material) {
    const group = new THREE.Group();
    const geom = new THREE.CylinderGeometry(radius, radius, length, 16);
    geom.translate(0, -length / 2, 0);
    const mesh = new THREE.Mesh(geom, material);
    mesh.castShadow = true;
    group.add(mesh);
    return group;
  }

  const pelvis = new THREE.Group(); pelvis.position.set(0, 2.3, 0); charGroup.add(pelvis);
  const torsoGroup = new THREE.Group();
  const chestMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.19, 0.55, 20), bodyShirtMat); chestMesh.position.set(0, -0.28, 0); chestMesh.castShadow = true; torsoGroup.add(chestMesh);
  const waistMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.18, 0.4, 20), pantsMat); waistMesh.position.set(0, -0.72, 0); waistMesh.castShadow = true; torsoGroup.add(waistMesh);
  pelvis.add(torsoGroup);

  const headGroup = new THREE.Group(); headGroup.position.set(0, 0.35, 0);
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.32, 32, 32), skinMat); headMesh.castShadow = true; headGroup.add(headMesh);

  const leftEyeGroup = new THREE.Group(); leftEyeGroup.position.set(-0.11, 0.06, 0.28);
  leftEyeGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 16), eyeWhiteMat));
  const leftPupil = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 16), pupilMat); leftPupil.position.set(0, 0, 0.04); leftEyeGroup.add(leftPupil); headGroup.add(leftEyeGroup);

  const rightEyeGroup = new THREE.Group(); rightEyeGroup.position.set(0.11, 0.06, 0.28);
  rightEyeGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 16), eyeWhiteMat));
  const rightPupil = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 16), pupilMat); rightPupil.position.set(0, 0, 0.04); rightEyeGroup.add(rightPupil); headGroup.add(rightEyeGroup);

  const mouthCurve = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.02, 12, 24, Math.PI), pupilMat); mouthCurve.rotation.x = Math.PI; mouthCurve.position.set(0, -0.06, 0.29); headGroup.add(mouthCurve);
  torsoGroup.add(headGroup);

  const leftUpperArm = createLimbMesh(0.06, 0.52, bodyShirtMat); leftUpperArm.position.set(-0.28, -0.1, 0); torsoGroup.add(leftUpperArm);
  const leftForearm = createLimbMesh(0.05, 0.52, skinMat); leftForearm.position.set(0, -0.52, 0); leftUpperArm.add(leftForearm);
  const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), skinMat); leftHand.position.set(0, -0.52, 0); leftForearm.add(leftHand);

  const rightUpperArm = createLimbMesh(0.06, 0.52, bodyShirtMat); rightUpperArm.position.set(0.28, -0.1, 0); torsoGroup.add(rightUpperArm);
  const rightForearm = createLimbMesh(0.05, 0.52, skinMat); rightForearm.position.set(0, -0.52, 0); rightUpperArm.add(rightForearm);
  const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), skinMat); rightHand.position.set(0, -0.52, 0); rightForearm.add(rightHand);

  const leftThigh = createLimbMesh(0.075, 0.58, pantsMat); leftThigh.position.set(-0.16, -0.85, 0); pelvis.add(leftThigh);
  const leftShin = createLimbMesh(0.065, 0.58, pantsMat); leftShin.position.set(0, -0.58, 0); leftThigh.add(leftShin);
  const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.26), shoeMat); leftFoot.position.set(0, -0.58, 0.07); leftShin.add(leftFoot);

  const rightThigh = createLimbMesh(0.075, 0.58, pantsMat); rightThigh.position.set(0.16, -0.85, 0); pelvis.add(rightThigh);
  const rightShin = createLimbMesh(0.065, 0.58, pantsMat); rightShin.position.set(0, -0.58, 0); rightThigh.add(rightShin);
  const rightFoot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.26), shoeMat); rightFoot.position.set(0, -0.58, 0.07); rightShin.add(rightFoot);

  stickmanBones = {
    rootGroup: charGroup,
    pelvis, torso: torsoGroup, head: headGroup,
    leftEye: leftEyeGroup, rightEye: rightEyeGroup,
    leftPupil, rightPupil, mouthMesh: mouthCurve,
    leftUpperArm, leftForearm, leftHand,
    rightUpperArm, rightForearm, rightHand,
    leftThigh, leftShin, leftFoot,
    rightThigh, rightShin, rightFoot
  };

  const entityData = { id: 'stickman_root', name: '3D Character', position: new Vector3(0, 2.3, 0), scale: new Vector3(1, 1, 1), color: 0x6366f1 };
  state.entities.push(entityData);
  threeObjectsMap.set('stickman_root', charGroup);
}

function loadDemoScene(type) {
  state.demoType = type;
  threeObjectsMap.forEach(obj => scene.remove(obj));
  threeObjectsMap.clear();
  state.entities = [];
  state.selectedEntityId = null;

  const modeOverlay = document.getElementById('stat-anim-mode');
  const demoSelect = document.getElementById('project-demo-select');
  if (demoSelect && demoSelect.value !== type) demoSelect.value = type;

  if (type === 'stickman2d') {
    canvas3D.style.display = 'none';
    canvas2D.style.display = 'block';
    if (modeOverlay) modeOverlay.innerText = '2D Stickman Studio Active';
    createEntity('2D Stickman Figure', 'stick2d_root', { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 }, 0xffffff);
    logConsole('[Engine] Switched to 2D HTML5 Canvas Stickman Physics Engine.');
  } else {
    canvas3D.style.display = 'block';
    canvas2D.style.display = 'none';
    if (modeOverlay) modeOverlay.innerText = '3D Character Studio Active';

    if (type === 'stickman') {
      createEntity('Floor Grid', 'floor', { x: 0, y: -0.05, z: 0 }, { x: 30, y: 0.1, z: 30 }, 0x151923, false);
      build3DCharacter();
    } else if (type === 'scifi') {
      createEntity('Floor (PBR)', 'floor', { x: 0, y: 0, z: 0 }, { x: 20, y: 0.2, z: 20 }, 0x212631, false);
      createEntity('Core Generator', 'core', { x: 0, y: 1.5, z: 0 }, { x: 2, y: 2, z: 2 }, 0x6366f1, false);
    } else if (type === 'platformer') {
      createEntity('Tilemap Floor', 'floor', { x: 0, y: 0, z: 0 }, { x: 24, y: 0.5, z: 2 }, 0x10b981, false);
    } else if (type === 'ai-maze') {
      createEntity('NavMesh Grid Base', 'floor', { x: 0, y: 0, z: 0 }, { x: 16, y: 0.2, z: 16 }, 0x151923, false);
    }
  }

  onWindowResize();
  updateHierarchyTree();
  selectEntity(state.entities[0] ? state.entities[0].id : null);
}

function createEntity(name, id, pos, scale, colorHex, isDynamic = false, geometryType = 'box') {
  let geom = geometryType === 'sphere' ? new THREE.SphereGeometry(scale.x * 0.5, 32, 32) : new THREE.BoxGeometry(scale.x, scale.y, scale.z);
  const mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.3, metalness: 0.4 });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.set(pos.x, pos.y, pos.z);
  mesh.castShadow = true; mesh.receiveShadow = true;
  scene.add(mesh);

  const entityData = { id, name, position: new Vector3(pos.x, pos.y, pos.z), scale: new Vector3(scale.x, scale.y, scale.z), color: colorHex };
  state.entities.push(entityData);
  threeObjectsMap.set(id, mesh);
}

// --- UI EVENT BINDINGS & INSPECTOR ---
function updateHierarchyTree() {
  const container = document.getElementById('hierarchy-list');
  if (!container) return;

  container.innerHTML = '';
  state.entities.forEach(ent => {
    const node = document.createElement('div');
    node.className = `tree-node ${ent.id === state.selectedEntityId ? 'selected' : ''}`;
    node.innerHTML = `<span>${ent.id.includes('stick') ? '🤸' : '📦'}</span> <span>${ent.name}</span>`;
    node.onclick = () => selectEntity(ent.id);
    container.appendChild(node);
  });

  const statEntities = document.getElementById('stat-entities');
  if (statEntities) statEntities.innerText = state.entities.length;
}

function selectEntity(id) {
  state.selectedEntityId = id;
  updateHierarchyTree();
  renderInspector();
}

function renderInspector() {
  const container = document.getElementById('inspector-content');
  const tag = document.getElementById('inspector-entity-tag');
  if (!container) return;

  const ent = state.entities.find(e => e.id === state.selectedEntityId);
  if (!ent) {
    container.innerHTML = '<div style="color: var(--text-muted); text-align: center; margin-top: 40px;">Select an Entity to inspect properties</div>';
    if (tag) tag.innerText = 'No Selection';
    return;
  }

  if (tag) tag.innerText = `ID: ${ent.id}`;

  const is2D = state.demoType === 'stickman2d';

  container.innerHTML = `
    <div class="inspector-group">
      <div class="inspector-group-title"><span>Identity</span></div>
      <div class="form-row"><span class="form-label">Name</span><input type="text" class="form-input" value="${ent.name}"></div>
    </div>

    <div class="inspector-group">
      <div class="inspector-group-title"><span>Camera Controls</span></div>
      <div class="form-row"><span class="form-label">Orbit</span><span style="color: var(--accent-secondary); font-weight: bold;">Left-Click Drag</span></div>
      <div class="form-row"><span class="form-label">Pan</span><span style="color: var(--accent-success); font-weight: bold;">Shift + Drag / Middle Drag</span></div>
      <div class="form-row"><span class="form-label">Zoom</span><span style="color: var(--accent-warning); font-weight: bold;">Scroll Wheel / Gizmo Buttons</span></div>
    </div>

    <div class="inspector-group">
      <div class="inspector-group-title"><span>Character Motion</span></div>
      <div class="form-row">
        <span class="form-label">Active Clip</span>
        <select class="form-input" id="inspect-anim-clip">
          <option ${state.stickmanAnimState === 'idle' ? 'selected' : ''} value="idle">Idle Stance</option>
          <option ${state.stickmanAnimState === 'walk' ? 'selected' : ''} value="walk">Walk Cycle</option>
          <option ${state.stickmanAnimState === 'run' ? 'selected' : ''} value="run">Run Cycle</option>
          <option ${state.stickmanAnimState === 'jump' ? 'selected' : ''} value="jump">Backflip Jump</option>
        </select>
      </div>
    </div>
  `;

  const animSelect = document.getElementById('inspect-anim-clip');
  if (animSelect) animSelect.onchange = (e) => setStickmanAnimState(e.target.value);
}

function setStickmanAnimState(newState) {
  state.stickmanAnimState = newState;
  audioManager.playSound(newState === 'jump' ? 'jump' : (newState === 'run' ? 'run' : 'click'));

  document.querySelectorAll('.anim-state-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.state === newState);
  });

  const overlayMode = document.getElementById('stat-anim-mode');
  if (overlayMode) overlayMode.innerText = `${state.demoType === 'stickman2d' ? '2D Stickman' : '3D Character'} ${newState.toUpperCase()}`;
}

function bindEditorEvents() {
  document.getElementById('btn-play').onclick = () => {
    state.isPlaying = true;
    state.isPaused = false;
    audioManager.playSound('jump');
  };

  document.getElementById('btn-pause').onclick = () => {
    state.isPaused = !state.isPaused;
  };

  document.getElementById('btn-stop').onclick = () => {
    state.isPlaying = false;
    state.isPaused = false;
    setStickmanAnimState('idle');
  };

  const demoSelect = document.getElementById('project-demo-select');
  if (demoSelect) demoSelect.onchange = (e) => loadDemoScene(e.target.value);

  document.querySelectorAll('.anim-state-btn').forEach(btn => {
    btn.onclick = () => setStickmanAnimState(btn.dataset.state);
  });

  const speedSlider = document.getElementById('anim-speed-slider');
  if (speedSlider) speedSlider.oninput = (e) => {
    state.animSpeed = parseFloat(e.target.value);
    document.getElementById('anim-speed-val').innerText = `${state.animSpeed.toFixed(1)}x`;
  };

  const ikSlider = document.getElementById('anim-ik-slider');
  if (ikSlider) ikSlider.oninput = (e) => {
    state.ikTargetHeight = parseFloat(e.target.value);
    document.getElementById('anim-ik-val').innerText = `${state.ikTargetHeight.toFixed(2)}m`;
  };

  const addEntityBtn = document.getElementById('btn-add-entity');
  if (addEntityBtn) addEntityBtn.onclick = () => {
    createEntity('New GameObject', `obj_${Date.now()}`, { x: (Math.random()-0.5)*4, y: 1.5, z: (Math.random()-0.5)*4 }, { x: 1, y: 1, z: 1 }, 0x6366f1);
    updateHierarchyTree();
    audioManager.playSound('click');
  };

  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.onclick = () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.dataset.tab;
      document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = content.id === targetId ? 'block' : 'none';
      });
    };
  });
}

// --- RENDER PURE CLASSIC 2D STICK FIGURE ---
function render2DStickmanEngine(now, dt) {
  if (!ctx2D || !canvas2D) return;

  const w = canvas2D.width;
  const h = canvas2D.height;
  const centerX = w / 2;
  const centerY = h / 2 + 50;

  // Clear 2D Canvas
  const grad = ctx2D.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#0b0f19');
  grad.addColorStop(1, '#151923');
  ctx2D.fillStyle = grad;
  ctx2D.fillRect(0, 0, w, h);

  // 2D Floor Surface Line
  const floorY = centerY + 140;
  ctx2D.strokeStyle = '#6366f1';
  ctx2D.lineWidth = 3;
  ctx2D.beginPath();
  ctx2D.moveTo(50, floorY);
  ctx2D.lineTo(w - 50, floorY);
  ctx2D.stroke();

  // Grid Dots
  ctx2D.fillStyle = '#232938';
  for (let x = 60; x < w - 60; x += 30) {
    ctx2D.beginPath();
    ctx2D.arc(x, floorY + 15, 2, 0, Math.PI * 2);
    ctx2D.fill();
  }

  // Motion Math
  const t = now * 0.005 * state.animSpeed;
  let rootY = 0, swing = 0, kneeBend = 0, armSwing = 0;

  if (state.stickmanAnimState === 'idle') {
    rootY = Math.sin(t * 0.5) * 4;
    armSwing = Math.sin(t * 0.5) * 8;
  } else if (state.stickmanAnimState === 'walk') {
    rootY = Math.abs(Math.sin(t)) * 12;
    swing = Math.sin(t) * 35;
    kneeBend = Math.max(0, Math.sin(t + Math.PI / 2)) * 30;
    armSwing = -Math.sin(t) * 35;
  } else if (state.stickmanAnimState === 'run') {
    rootY = Math.abs(Math.sin(t * 1.5)) * 25;
    swing = Math.sin(t * 1.5) * 60;
    kneeBend = Math.max(0, Math.sin(t * 1.5 + Math.PI / 2)) * 50;
    armSwing = -Math.sin(t * 1.5) * 60;
  } else if (state.stickmanAnimState === 'jump') {
    const jumpProgress = (t % 2) / 2;
    rootY = -Math.sin(jumpProgress * Math.PI) * 140;
    swing = 20; kneeBend = 45; armSwing = -50;
  }

  // 2D Skeleton Joint Coordinates
  const pelvisPos = { x: centerX, y: centerY + rootY };
  const neckPos = { x: pelvisPos.x, y: pelvisPos.y - 85 };
  const headPos = { x: pelvisPos.x, y: pelvisPos.y - 120 };

  const shoulderAnchor = { x: pelvisPos.x, y: neckPos.y + 12 };

  const lElbow = { x: shoulderAnchor.x - 22 + Math.sin(armSwing * 0.03) * 15, y: shoulderAnchor.y + 28 };
  const rElbow = { x: shoulderAnchor.x + 22 - Math.sin(armSwing * 0.03) * 15, y: shoulderAnchor.y + 28 };

  const lHand = { x: lElbow.x - 12 + Math.sin(armSwing * 0.03) * 20, y: lElbow.y + 28 };
  const rHand = { x: rElbow.x + 10 - Math.sin(armSwing * 0.03) * 20, y: rElbow.y + 28 };

  const lHip = { x: pelvisPos.x, y: pelvisPos.y };
  const rHip = { x: pelvisPos.x, y: pelvisPos.y };

  const lKnee = { x: lHip.x - 12 + Math.sin(swing * 0.02) * 30, y: lHip.y + 55 };
  const rKnee = { x: rHip.x + 12 - Math.sin(swing * 0.02) * 30, y: rHip.y + 55 };

  const lFoot = { x: lKnee.x + Math.sin((swing + kneeBend) * 0.02) * 18, y: Math.min(floorY - 6, lKnee.y + 55) };
  const rFoot = { x: rKnee.x - Math.sin((swing - kneeBend) * 0.02) * 18, y: Math.min(floorY - 6, rKnee.y + 55) };

  // Shadow Oval on Floor
  ctx2D.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx2D.beginPath();
  ctx2D.ellipse(pelvisPos.x, floorY + 4, 45, 10, 0, 0, Math.PI * 2);
  ctx2D.fill();

  function drawBoneLine(p1, p2, width = 6, color = '#ffffff') {
    ctx2D.strokeStyle = color;
    ctx2D.lineWidth = width;
    ctx2D.lineCap = 'round';
    ctx2D.beginPath();
    ctx2D.moveTo(p1.x, p1.y);
    ctx2D.lineTo(p2.x, p2.y);
    ctx2D.stroke();
  }

  // Pure White Stick Lines (#ffffff)
  drawBoneLine(pelvisPos, neckPos, 8, '#ffffff');

  drawBoneLine(lHip, lKnee, 6, '#ffffff');
  drawBoneLine(lKnee, lFoot, 6, '#ffffff');
  drawBoneLine(rHip, rKnee, 6, '#ffffff');
  drawBoneLine(rKnee, rFoot, 6, '#ffffff');

  drawBoneLine(shoulderAnchor, lElbow, 6, '#ffffff');
  drawBoneLine(lElbow, lHand, 6, '#ffffff');
  drawBoneLine(shoulderAnchor, rElbow, 6, '#ffffff');
  drawBoneLine(rElbow, rHand, 6, '#ffffff');

  // Head Circle
  ctx2D.fillStyle = '#ffffff';
  ctx2D.beginPath();
  ctx2D.arc(headPos.x, headPos.y, 28, 0, Math.PI * 2);
  ctx2D.fill();

  // 2D Trigonometric Eye Pupil Tracking
  const dx = mouseScreenPos.x - (canvas2D.getBoundingClientRect().left + headPos.x);
  const dy = mouseScreenPos.y - (canvas2D.getBoundingClientRect().top + headPos.y);
  const angle = Math.atan2(dy, dx);
  const dist = Math.min(7, Math.sqrt(dx * dx + dy * dy) * 0.05);

  const leftEyeX = headPos.x - 9 + Math.cos(angle) * dist;
  const leftEyeY = headPos.y - 4 + Math.sin(angle) * dist;
  const rightEyeX = headPos.x + 9 + Math.cos(angle) * dist;
  const rightEyeY = headPos.y - 4 + Math.sin(angle) * dist;

  ctx2D.fillStyle = '#0f172a';
  ctx2D.beginPath(); ctx2D.arc(leftEyeX, leftEyeY, 5, 0, Math.PI * 2); ctx2D.fill();
  ctx2D.beginPath(); ctx2D.arc(rightEyeX, rightEyeY, 5, 0, Math.PI * 2); ctx2D.fill();

  // 2D Smile Mouth
  ctx2D.strokeStyle = '#0f172a';
  ctx2D.lineWidth = 3;
  ctx2D.beginPath();
  ctx2D.arc(headPos.x, headPos.y + 6, 9, 0.1, Math.PI - 0.1);
  ctx2D.stroke();
}

// --- PROCEDURAL MOTION TICK ---
let lastTime = 0, frameCount = 0, fpsTimer = 0, animTimer = 0, blinkTimer = 0;
const leftFootWorldPos = new THREE.Vector3();
const rightFootWorldPos = new THREE.Vector3();

function animate(now) {
  requestAnimationFrame(animate);

  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  frameCount++; fpsTimer += dt;
  if (fpsTimer >= 1.0) {
    const statFps = document.getElementById('stat-fps');
    if (statFps) statFps.innerText = frameCount;
    frameCount = 0; fpsTimer -= 1.0;
  }

  // Branch between 2D HTML5 Canvas & 3D WebGL Engines!
  if (state.demoType === 'stickman2d') {
    render2DStickmanEngine(now, dt);
    return;
  }

  // Drive 3D Character Engine
  if (state.isPlaying && !state.isPaused && stickmanBones.rootGroup) {
    animTimer += dt * state.animSpeed;
    const t = animTimer * 5.0;

    let rootY = 0, flipAngle = 0, torsoAngle = 0;
    let lArm = 0, rArm = 0, lFore = 0, rFore = 0;
    let lLeg = 0, rLeg = 0, lShin = 0, rShin = 0;

    if (state.stickmanAnimState === 'idle') {
      rootY = Math.sin(animTimer * 1.8) * 0.02;
      lArm = Math.sin(animTimer * 1.8) * 0.08 + 0.05;
      rArm = -Math.sin(animTimer * 1.8) * 0.08 - 0.05;
    } else if (state.stickmanAnimState === 'walk') {
      rootY = Math.abs(Math.sin(t)) * 0.08;
      lLeg = Math.sin(t) * 0.5; rLeg = -Math.sin(t) * 0.5;
      lShin = Math.max(0, Math.sin(t + Math.PI / 2)) * 0.4;
      rShin = Math.max(0, Math.sin(t - Math.PI / 2)) * 0.4;
      lArm = -Math.sin(t) * 0.5; rArm = Math.sin(t) * 0.5;
      lFore = 0.2; rFore = 0.2;
    } else if (state.stickmanAnimState === 'run') {
      torsoAngle = 0.3;
      rootY = Math.abs(Math.sin(t * 1.5)) * 0.15;
      lLeg = Math.sin(t * 1.5) * 0.85; rLeg = -Math.sin(t * 1.5) * 0.85;
      lShin = Math.max(0, Math.sin(t * 1.5 + Math.PI / 2)) * 0.65;
      rShin = Math.max(0, Math.sin(t * 1.5 - Math.PI / 2)) * 0.65;
      lArm = -Math.sin(t * 1.5) * 1.0; rArm = Math.sin(t * 1.5) * 1.0;
      lFore = 0.5; rFore = 0.5;
    } else if (state.stickmanAnimState === 'jump') {
      const jumpProgress = (animTimer % 1.8) / 1.8;
      rootY = Math.sin(jumpProgress * Math.PI) * 2.0;
      flipAngle = jumpProgress * Math.PI * 2;
      lArm = -1.2; rArm = -1.2;
      lLeg = 0.7; rLeg = 0.7; lShin = 1.0; rShin = 1.0;
    }

    // Apply Constrained Bone Transformations
    stickmanBones.pelvis.position.y = 2.3 + rootY + state.ikTargetHeight;
    stickmanBones.pelvis.rotation.x = flipAngle;
    stickmanBones.torso.rotation.x = torsoAngle;

    stickmanBones.leftUpperArm.rotation.x = lArm;
    stickmanBones.leftForearm.rotation.x = lFore;
    stickmanBones.rightUpperArm.rotation.x = rArm;
    stickmanBones.rightForearm.rotation.x = rFore;

    stickmanBones.leftThigh.rotation.set(lLeg, 0, 0);
    stickmanBones.leftShin.rotation.set(lShin, 0, 0);
    stickmanBones.rightThigh.rotation.set(rLeg, 0, 0);
    stickmanBones.rightShin.rotation.set(rShin, 0, 0);

    // REALTIME INVERSE KINEMATICS SURFACE FLOOR CLAMPING
    stickmanBones.rootGroup.updateMatrixWorld(true);
    if (stickmanBones.leftFoot && stickmanBones.rightFoot) {
      stickmanBones.leftFoot.getWorldPosition(leftFootWorldPos);
      stickmanBones.rightFoot.getWorldPosition(rightFootWorldPos);

      const minFootY = Math.min(leftFootWorldPos.y, rightFootWorldPos.y);
      const minAllowedY = 0.08;
      if (minFootY < minAllowedY) {
        const ikCorrection = minAllowedY - minFootY;
        stickmanBones.pelvis.position.y += ikCorrection;
      }
    }

    // PROCEDURAL TRIGONOMETRIC EYE & NECK TRACKING
    if (stickmanBones.head) {
      const targetHeadYaw = mouseNormPos.x * 0.4 + Math.sin(animTimer * 0.8) * 0.15;
      const targetHeadPitch = -mouseNormPos.y * 0.25 + Math.cos(animTimer * 1.1) * 0.08;

      stickmanBones.head.rotation.y += (targetHeadYaw - stickmanBones.head.rotation.y) * 0.1;
      stickmanBones.head.rotation.x += (targetHeadPitch - stickmanBones.head.rotation.x) * 0.1;

      const lookAngle = Math.atan2(-mouseNormPos.y, mouseNormPos.x);
      const lookDist = Math.min(0.025, Math.sqrt(mouseNormPos.x * mouseNormPos.x + mouseNormPos.y * mouseNormPos.y) * 0.03);

      const pupilOffsetX = Math.cos(lookAngle) * lookDist + Math.sin(animTimer * 2.5) * 0.005;
      const pupilOffsetY = Math.sin(lookAngle) * lookDist + Math.cos(animTimer * 3.0) * 0.005;

      if (stickmanBones.leftPupil && stickmanBones.rightPupil) {
        stickmanBones.leftPupil.position.x = pupilOffsetX;
        stickmanBones.leftPupil.position.y = pupilOffsetY;
        stickmanBones.rightPupil.position.x = pupilOffsetX;
        stickmanBones.rightPupil.position.y = pupilOffsetY;
      }

      blinkTimer += dt;
      let blinkScaleY = 1.0;
      if ((blinkTimer % 3.5) > 3.35) blinkScaleY = 0.08;

      if (stickmanBones.leftEye && stickmanBones.rightEye) {
        stickmanBones.leftEye.scale.y += (blinkScaleY - stickmanBones.leftEye.scale.y) * 0.4;
        stickmanBones.rightEye.scale.y += (blinkScaleY - stickmanBones.rightEye.scale.y) * 0.4;
      }
    }
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

// Dom Ready Initialization
window.addEventListener('DOMContentLoaded', () => {
  initViewport();
  bindEditorEvents();
});
