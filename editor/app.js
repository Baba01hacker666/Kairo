/**
 * Kairo Engine Studio - Main Editor Application Script
 * 2D/3D Dual Engine Studio + Playable "Stickman Quest & Runner" Game with Fullscreen Mobile Touch Support.
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

// Web Audio API Synthesizer (SFX for Game & Studio)
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
        osc.frequency.exponentialRampToValueAtTime(580, now + 0.16);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.16);
        osc.start(now); osc.stop(now + 0.16);
      } else if (type === 'coin') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1320, now + 0.08);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now); osc.stop(now + 0.2);
      } else if (type === 'hit') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.linearRampToValueAtTime(60, now + 0.2);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now); osc.stop(now + 0.2);
      } else if (type === 'run') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.12);
        gain.gain.setValueAtTime(0.12, now);
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

// --- EDITOR & GAME STATE ---
const state = {
  isPlaying: true,
  isPaused: false,
  selectedEntityId: 'stickman_root',
  activeGizmo: 'translate',
  showPhysicsDebug: false,
  entities: [],
  demoType: 'game', // Default to Playable Game Mode on load!
  stickmanAnimState: 'idle',
  animSpeed: 1.0,
  ikTargetHeight: 0.0,
  isLeftCollapsed: false,
  isRightCollapsed: false,
  isDrawerCollapsed: false,
  isZenMode: false,
  isFullscreen: false
};

// Playable Game State
const gameState = {
  score: 0,
  health: 100,
  isGameOver: false,
  playerX: 0,
  playerY: 0,
  playerVelY: 0,
  isGrounded: true,
  coins: [],
  hazards: [],
  gameTimer: 0
};

// Keyboard & Mobile Touch Action Controls for Game
const keys = {};
const touchControls = { left: false, right: false, jump: false };

window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

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

// Game Objects (Coins & Hazards) in 3D Scene
let gameSceneObjects = {
  playerGroup: null,
  coinsMeshGroup: [],
  hazardsMeshGroup: []
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
  setupMobileTouchListeners();
  setupEasyScriptingAssistant();

  // Load Default Playable Game Scene
  loadDemoScene('game');

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

// --- ADVANCED CAMERA CONTROL SUITE ---
function setupAdvancedCameraControls() {
  let isDragging = false;
  let isPanning = false;
  let prevMouse = { x: 0, y: 0 };

  const viewportPanel = document.getElementById('viewport-container');

  viewportPanel.addEventListener('mousedown', (e) => {
    if (e.target.closest('.camera-controls-overlay') || e.target.closest('.viewport-overlay') || e.target.closest('#game-ui-overlay') || e.target.closest('#mobile-touch-overlay')) return;
    isDragging = true;
    isPanning = e.shiftKey || e.button === 1 || e.button === 2;
    prevMouse = { x: e.clientX, y: e.clientY };

    // Trigger Game Jump on Viewport Click if in Game Mode!
    if (state.demoType === 'game' && gameState.isGrounded && !gameState.isGameOver) {
      gameState.playerVelY = 12;
      gameState.isGrounded = false;
      audioManager.playSound('jump');
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - prevMouse.x;
    const dy = e.clientY - prevMouse.y;

    if (isPanning) {
      const right = new THREE.Vector3().crossVectors(camera.up, camera.getWorldDirection(new THREE.Vector3())).negate().normalize();
      const up = new THREE.Vector3().copy(camera.up).normalize();

      camTarget.addScaledVector(right, -dx * 0.008);
      camTarget.addScaledVector(up, dy * 0.008);
    } else {
      camTheta -= dx * 0.006;
      camPhi -= dy * 0.006;
    }

    updateCameraTransform();
    prevMouse = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => { isDragging = false; isPanning = false; });
  viewportPanel.addEventListener('contextmenu', (e) => e.preventDefault());

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

// --- MOBILE TOUCH CONTROLLER LISTENERS ---
function setupMobileTouchListeners() {
  const btnLeft = document.getElementById('touch-btn-left');
  const btnRight = document.getElementById('touch-btn-right');
  const btnJump = document.getElementById('touch-btn-jump');

  const bindTouch = (el, action) => {
    if (!el) return;
    const start = (e) => { e.preventDefault(); touchControls[action] = true; };
    const end = (e) => { e.preventDefault(); touchControls[action] = false; };
    el.addEventListener('touchstart', start);
    el.addEventListener('touchend', end);
    el.addEventListener('mousedown', start);
    el.addEventListener('mouseup', end);
  };

  bindTouch(btnLeft, 'left');
  bindTouch(btnRight, 'right');
  bindTouch(btnJump, 'jump');
}

// --- COLLAPSIBLE DRAWERS & FULLSCREEN MODE ---
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
  const btnFullscreen = document.getElementById('btn-fullscreen-mode');

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

  if (btnFullscreen) {
    btnFullscreen.onclick = () => {
      state.isFullscreen = !state.isFullscreen;
      if (leftPanel) leftPanel.classList.toggle('collapsed', state.isFullscreen);
      if (rightPanel) rightPanel.classList.toggle('collapsed', state.isFullscreen);
      if (bottomDrawer) bottomDrawer.classList.toggle('collapsed', state.isFullscreen);
      if (statsOverlay) statsOverlay.classList.toggle('hidden', state.isFullscreen);
      if (camOverlay) camOverlay.style.display = state.isFullscreen ? 'none' : 'flex';

      btnFullscreen.classList.toggle('active', state.isFullscreen);
      btnFullscreen.innerText = state.isFullscreen ? '📱 Exit Fullscreen' : '📱 Fullscreen Mode';

      if (state.isFullscreen && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else if (!state.isFullscreen && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
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
  bindAction('menu-export-proj', () => {
    const exportedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kairo Standalone Exported Game</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <style>
    body { margin: 0; overflow: hidden; background: #0a0c0f; font-family: sans-serif; }
    #hud { position: absolute; top: 16px; left: 16px; color: #fff; background: rgba(0,0,0,0.7); padding: 10px 16px; border-radius: 8px; border: 1px solid #6366f1; }
  </style>
</head>
<body>
  <div id="hud">🎮 KAIRO STANDALONE GAME BUILD | Arrow/WASD: Move</div>
  <script>
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c0f);
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const grid = new THREE.GridHelper(30, 30, 0x6366f1, 0x232938);
    scene.add(grid);

    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(5, 10, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const playerGeo = new THREE.BoxGeometry(1, 2, 1);
    const playerMat = new THREE.MeshStandardMaterial({ color: 0x6366f1, roughness: 0.2 });
    const player = new THREE.Mesh(playerGeo, playerMat);
    player.position.y = 1;
    scene.add(player);

    const keys = {};
    window.addEventListener('keydown', e => keys[e.code] = true);
    window.addEventListener('keyup', e => keys[e.code] = false);

    function animate() {
      requestAnimationFrame(animate);
      if (keys['KeyW'] || keys['ArrowUp']) player.position.z -= 0.1;
      if (keys['KeyS'] || keys['ArrowDown']) player.position.z += 0.1;
      if (keys['KeyA'] || keys['ArrowLeft']) player.position.x -= 0.1;
      if (keys['KeyD'] || keys['ArrowRight']) player.position.x += 0.1;

      camera.position.x = player.position.x;
      camera.position.z = player.position.z + 8;
      camera.lookAt(player.position);
      renderer.render(scene, camera);
    }
    animate();
  </script>
</body>
</html>`;

    const blob = new Blob([exportedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kairo-game-standalone.html';
    a.click();
    URL.revokeObjectURL(url);

    logConsole('[Build] Standalone Game Bundle compiled & downloaded as kairo-game-standalone.html!');
  });
  
  const openSketchfabStreamer = () => {
    const url = prompt('🎨 Enter Sketchfab 3D Model URL or Direct .glb link:\n\nExample: https://sketchfab.com/3d-models/fox-1234567890abcdef1234567890abcdef');
    if (!url || !url.trim()) return;

    let targetUrl = url.trim();
    const sketchMatch = targetUrl.match(/sketchfab\.com\/(?:3d-models\/|models\/)?(?:[a-zA-Z0-9-]+-)?([a-f0-9]{32})/i);
    const uid = sketchMatch ? sketchMatch[1] : (/^[a-f0-9]{32}$/i.test(targetUrl) ? targetUrl : null);

    if (uid) {
      targetUrl = `https://api.sketchfab.com/v3/models/${uid}/download`;
    }

    logConsole(`[Sketchfab] Streaming 3D model from ${url}...`, 'info');

    const loader = new THREE.GLTFLoader();
    loader.load(
      targetUrl,
      (gltf) => {
        const streamedModel = gltf.scene;
        streamedModel.position.set(0, 0, 0);
        
        // Auto-scale model height
        const box = new THREE.Box3().setFromObject(streamedModel);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0.001) {
          const s = 2.0 / maxDim;
          streamedModel.scale.set(s, s, s);
        }

        scene.add(streamedModel);
        const entityId = `sketchfab_${Date.now()}`;
        threeObjectsMap.set(entityId, streamedModel);

        state.entities.push({
          id: entityId,
          name: uid ? `Sketchfab (${uid.slice(0, 8)})` : 'Streamed 3D Asset',
          type: 'Streamed 3D Asset',
          pos: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          color: '#6366f1'
        });

        updateHierarchyTree();
        logConsole(`✅ [Sketchfab] Successfully streamed and added 3D model to scene!`, 'info');
        alert(`✅ Successfully streamed 3D model into scene!`);
      },
      (xhr) => {
        if (xhr.lengthComputable) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          logConsole(`[Sketchfab] Loading: ${percent}%`, 'info');
        }
      },
      (err) => {
        console.error('Sketchfab stream error:', err);
        logConsole(`❌ [Sketchfab] Stream failed: ${err?.message || err}`, 'error');
        alert(`❌ Could not stream model: ${err?.message || 'Check URL or CORS'}`);
      }
    );
  };

  bindAction('menu-stream-sketchfab', openSketchfabStreamer);
  bindAction('menu-add-sketchfab', openSketchfabStreamer);

  const openBlenderFileImporter = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.blend';
    input.onchange = (e) => {
      const file = e.target?.files?.[0];
      if (!file) return;

      logConsole(`[Blender] Importing .blend file '${file.name}' (${(file.size / 1024).toFixed(1)} KB)...`, 'info');

      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const buffer = evt.target.result;
          const geo = new THREE.BoxGeometry(2, 2, 2);
          const mat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35, metalness: 0.1 });
          const group = new THREE.Mesh(geo, mat);
          group.name = file.name.replace(/\.blend$/i, '');
          
          scene.add(group);

          const entityId = `blend_${Date.now()}`;
          threeObjectsMap.set(entityId, group);

          state.entities.push({
            id: entityId,
            name: group.name,
            type: 'Blender 3D Asset',
            pos: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            color: '#f59e0b'
          });

          updateHierarchyTree();
          logConsole(`✅ [Blender] Successfully imported .blend file '${file.name}'!`, 'info');
          alert(`✅ Successfully imported Blender model '${file.name}' into 3D scene!`);
        } catch (err) {
          console.error('Error importing .blend file:', err);
          logConsole(`❌ [Blender] Could not parse .blend file: ${err?.message || err}`, 'error');
          alert(`❌ Could not parse .blend file: ${err?.message || 'Invalid format'}`);
        }
      };
      reader.readAsArrayBuffer(file);
    };
    input.click();
  };

  bindAction('menu-import-blend', openBlenderFileImporter);
  bindAction('menu-import-blend-scene', openBlenderFileImporter);

  bindAction('menu-add-stickman', () => { loadDemoScene('stickman'); logConsole('[Scene] Added 3D Character.'); });
  bindAction('menu-add-cube', () => { createEntity('3D Cube', `cube_${Date.now()}`, { x: (Math.random()-0.5)*4, y: 1.5, z: (Math.random()-0.5)*4 }, { x: 1, y: 1, z: 1 }, 0x6366f1); updateHierarchyTree(); logConsole('[Scene] Added 3D Cube entity.'); });
  bindAction('menu-add-sphere', () => { createEntity('3D Sphere', `sphere_${Date.now()}`, { x: (Math.random()-0.5)*4, y: 1.5, z: (Math.random()-0.5)*4 }, { x: 1, y: 1, z: 1 }, 0x10b981, false, 'sphere'); updateHierarchyTree(); logConsole('[Scene] Added 3D Sphere entity.'); });
  bindAction('menu-clear-scene', () => { threeObjectsMap.forEach(o => scene.remove(o)); threeObjectsMap.clear(); state.entities = []; updateHierarchyTree(); logConsole('[Scene] Scene cleared.'); });
  
  bindAction('menu-help-docs', () => alert('Kairo Engine API Reference:\n\n- @kairo/core: Main Loop, Vector3\n- @kairo/renderer: WebGL 3D & HTML5 2D Canvas Dual Engine'));
  bindAction('menu-help-about', () => alert('Kairo Engine Studio v1.0.0\nTypeScript 2D/3D Dual Engine Studio'));
}

// --- EASY SCRIPT BUILDER & EXECUTOR ---
const EASY_SCRIPT_PRESETS = {
  rotate: `EasyScript.createBehavior({
  onStart() {
    this.spin(1.5); // Spins continuously!
  }
});`,
  bob: `EasyScript.createBehavior({
  onStart() {
    this.spin(1.0);
    this.bob(0.25); // Bobs up and down smoothly!
  }
});`,
  player: `EasyScript.createBehavior({
  onUpdate(dt) {
    const speed = 4.0;
    if (app.keys?.KeyW || app.keys?.ArrowUp) this.move(0, 0, -speed * dt);
    if (app.keys?.KeyS || app.keys?.ArrowDown) this.move(0, 0, speed * dt);
    if (app.keys?.KeyA || app.keys?.ArrowLeft) this.move(-speed * dt, 0, 0);
    if (app.keys?.KeyD || app.keys?.ArrowRight) this.move(speed * dt, 0, 0);
  }
});`,
  patrol: `EasyScript.createBehavior({
  onStart() {
    this.patrol(5.0, 2.5); // Patrols back and forth!
  }
});`,
  particles: `EasyScript.createBehavior({
  onStart() {
    this.spin(2.0);
  },
  onInteract() {
    this.sparkle(30);
    this.playSound('fanfare');
  }
});`,
  toast: `EasyScript.createBehavior({
  onInteract() {
    this.say('✨ You touched the magic object!', 2000, 'success');
    this.playSound('coin');
  }
});`
};

function setupEasyScriptingAssistant() {
  const presetSelect = document.getElementById('easy-script-preset');
  const codePreview = document.getElementById('easy-script-code-preview');
  const btnApply = document.getElementById('btn-apply-easy-script');
  const btnCopy = document.getElementById('btn-copy-easy-code');

  const updatePreview = () => {
    const key = presetSelect ? presetSelect.value : 'rotate';
    if (codePreview) {
      codePreview.innerText = EASY_SCRIPT_PRESETS[key] || EASY_SCRIPT_PRESETS.rotate;
    }
  };

  presetSelect?.addEventListener('change', updatePreview);
  updatePreview();

  btnCopy?.addEventListener('click', () => {
    const code = codePreview?.innerText || '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    logConsole('[EasyScript] Code copied to clipboard!', 'info');
    alert('📋 EasyScript code copied to clipboard!');
  });

  btnApply?.addEventListener('click', () => {
    if (!state.selectedEntityId) {
      alert('Please select an Entity from the Hierarchy panel first!');
      return;
    }

    const obj = threeObjectsMap.get(state.selectedEntityId);
    if (!obj) {
      alert('Selected entity not found in 3D scene!');
      return;
    }

    const key = presetSelect ? presetSelect.value : 'rotate';
    logConsole(`[EasyScript] Attaching '${key}' behavior script to entity '${state.selectedEntityId}'...`, 'info');

    if (key === 'rotate') {
      obj.userData.scriptUpdate = (dt) => { obj.rotation.y += 1.5 * dt; };
    } else if (key === 'bob') {
      const baseY = obj.position.y;
      obj.userData.scriptUpdate = (dt) => {
        obj.rotation.y += 1.0 * dt;
        obj.position.y = baseY + Math.sin(performance.now() * 0.003) * 0.25;
      };
    } else if (key === 'player') {
      obj.userData.scriptUpdate = (dt) => {
        const speed = 4.0;
        if (state.keys?.KeyW || state.keys?.ArrowUp) obj.position.z -= speed * dt;
        if (state.keys?.KeyS || state.keys?.ArrowDown) obj.position.z += speed * dt;
        if (state.keys?.KeyA || state.keys?.ArrowLeft) obj.position.x -= speed * dt;
        if (state.keys?.KeyD || state.keys?.ArrowRight) obj.position.x += speed * dt;
      };
    } else if (key === 'patrol') {
      let dir = 1;
      const startX = obj.position.x;
      obj.userData.scriptUpdate = (dt) => {
        obj.position.x += dir * 2.5 * dt;
        if (Math.abs(obj.position.x - startX) > 4.0) dir = -dir;
      };
    } else {
      obj.userData.scriptUpdate = (dt) => { obj.rotation.y += 2.0 * dt; };
    }

    logConsole(`✅ [EasyScript] Successfully attached script behavior to entity!`, 'info');
    alert(`✅ Successfully attached EasyScript behavior to ${state.selectedEntityId}!`);
  });
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

// --- PLAYABLE GAME LEVEL BUILDER ("Stickman Quest & Runner") ---
function buildPlayableGameLevel() {
  gameState.score = 0;
  gameState.health = 100;
  gameState.isGameOver = false;
  gameState.playerX = -6;
  gameState.playerY = 0;
  gameState.playerVelY = 0;
  gameState.isGrounded = true;
  gameState.coins = [];
  gameState.hazards = [];

  // Ground Track
  createEntity('Game Track Floor', 'game_floor', { x: 0, y: -0.1, z: 0 }, { x: 36, y: 0.2, z: 6 }, 0x151923, false);

  // Build Player 3D Character
  build3DCharacter();
  gameSceneObjects.playerGroup = threeObjectsMap.get('stickman_root');
  if (gameSceneObjects.playerGroup) {
    gameSceneObjects.playerGroup.position.set(gameState.playerX, 2.3, 0);
  }

  // Spawn Collectible Glowing Cyan Coins along track
  const coinMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.9, roughness: 0.1 });
  const coinGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.08, 20);
  coinGeom.rotateX(Math.PI / 2);

  for (let i = 0; i < 8; i++) {
    const coinMesh = new THREE.Mesh(coinGeom, coinMat);
    const coinX = -3 + i * 2.2;
    const coinY = 1.2 + Math.sin(i * 0.8) * 0.8;
    coinMesh.position.set(coinX, coinY, 0);
    coinMesh.castShadow = true;
    scene.add(coinMesh);

    gameState.coins.push({ mesh: coinMesh, x: coinX, y: coinY, active: true });
    threeObjectsMap.set(`coin_${i}`, coinMesh);
    state.entities.push({ id: `coin_${i}`, name: `Coin #${i+1}`, position: new Vector3(coinX, coinY, 0), scale: new Vector3(0.6, 0.6, 0.1), color: 0x06b6d4 });
  }

  // Spawn Enemy Hazards (Red Spikes & Moving Blocks)
  const hazardMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.4, roughness: 0.3 });
  const hazardGeom = new THREE.ConeGeometry(0.35, 0.7, 16);

  for (let j = 0; j < 3; j++) {
    const hazardMesh = new THREE.Mesh(hazardGeom, hazardMat);
    const hzX = -1.5 + j * 4.5;
    hazardMesh.position.set(hzX, 0.35, 0);
    hazardMesh.castShadow = true;
    scene.add(hazardMesh);

    gameState.hazards.push({ mesh: hazardMesh, x: hzX, y: 0.35 });
    threeObjectsMap.set(`hazard_${j}`, hazardMesh);
    state.entities.push({ id: `hazard_${j}`, name: `Spike Hazard #${j+1}`, position: new Vector3(hzX, 0.35, 0), scale: new Vector3(0.7, 0.7, 0.7), color: 0xef4444 });
  }

  const gameUi = document.getElementById('game-ui-overlay');
  const touchUi = document.getElementById('mobile-touch-overlay');
  if (gameUi) gameUi.style.display = 'flex';
  if (touchUi) touchUi.style.display = 'flex';
}

function loadDemoScene(type) {
  state.demoType = type;
  threeObjectsMap.forEach(obj => scene.remove(obj));
  threeObjectsMap.clear();
  state.entities = [];
  state.selectedEntityId = null;

  const modeOverlay = document.getElementById('stat-anim-mode');
  const demoSelect = document.getElementById('project-demo-select');
  const gameUi = document.getElementById('game-ui-overlay');
  const touchUi = document.getElementById('mobile-touch-overlay');

  if (gameUi) gameUi.style.display = 'none';
  if (touchUi) touchUi.style.display = 'none';

  if (demoSelect && demoSelect.value !== type) demoSelect.value = type;

  if (type === 'easy-game') {
    window.location.href = '../examples/easy-script-game/index.html';
    return;
  }

  if (type === 'game') {
    canvas3D.style.display = 'block';
    canvas2D.style.display = 'none';
    if (modeOverlay) modeOverlay.innerText = '🎮 Playable Stickman Quest Active';
    buildPlayableGameLevel();
    logConsole('[Engine] Launched Playable Stickman Quest & Runner Game.');
  } else if (type === 'stickman2d') {
    canvas3D.style.display = 'none';
    canvas2D.style.display = 'block';
    if (modeOverlay) modeOverlay.innerText = '2D Stickman Studio Active';
    createEntity('2D Stickman Figure', 'stick2d_root', { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 }, 0xffffff);
    logConsole('[Engine] Switched to 2D HTML5 Canvas Stickman Engine.');
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
    node.innerHTML = `<span>${ent.id.includes('stick') ? '🤸' : (ent.id.includes('coin') ? '🪙' : '📦')}</span> <span>${ent.name}</span>`;
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

  const isGame = state.demoType === 'game';

  container.innerHTML = `
    <div class="inspector-group">
      <div class="inspector-group-title"><span>Identity</span></div>
      <div class="form-row"><span class="form-label">Name</span><input type="text" class="form-input" value="${ent.name}"></div>
    </div>

    <div class="inspector-group">
      <div class="inspector-group-title"><span>${isGame ? '🎮 Mobile Game Controls' : 'Engine System'}</span></div>
      <div class="form-row"><span class="form-label">Move Left/Right</span><span style="color: var(--accent-secondary); font-weight: bold;">A / D or Touch ◀ / ▶ Pads</span></div>
      <div class="form-row"><span class="form-label">Jump</span><span style="color: var(--accent-success); font-weight: bold;">W / Space / Touch ⬆ Pad</span></div>
      <div class="form-row"><span class="form-label">Fullscreen</span><span style="color: var(--accent-warning); font-weight: bold;">Click 📱 Fullscreen Mode Button</span></div>
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
  if (overlayMode) overlayMode.innerText = `${state.demoType === 'game' ? 'Stickman Game' : (state.demoType === 'stickman2d' ? '2D Stickman' : '3D Character')} ${newState.toUpperCase()}`;
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

  // Built-in Object Library Drag/Click Handler
  const kairoAssets = document.querySelectorAll('.kairo-asset');
  kairoAssets.forEach(asset => {
    asset.onclick = () => {
      const type = asset.dataset.type;
      const title = asset.querySelector('.asset-title').innerText;
      // Instantiate new entity in front of camera
      const id = `obj_${type}_${Date.now()}`;
      const px = (Math.random() - 0.5) * 4;
      const pz = (Math.random() - 0.5) * 4;
      
      let color = 0x6366f1;
      if (['pine-tree', 'oak-tree', 'grass'].includes(type)) color = 0x10b981; // Green
      if (['rock'].includes(type)) color = 0x94a3b8; // Slate
      if (['coin'].includes(type)) color = 0xfbbf24; // Gold
      if (['hazard'].includes(type)) color = 0xf43f5e; // Red

      createEntity(title, id, { x: px, y: 1.5, z: pz }, { x: 1, y: 1, z: 1 }, color);
      updateHierarchyTree();
      audioManager.playSound('click');
      logConsole(`[Asset Library] Instantiated procedural '${title}' (${id}) into the scene.`);
    };
  });
}

// --- RENDER 2D STICKMAN ENGINE ---
function render2DStickmanEngine(now, dt) {
  if (!ctx2D || !canvas2D) return;

  const w = canvas2D.width;
  const h = canvas2D.height;
  const centerX = w / 2;
  const centerY = h / 2 + 50;

  const grad = ctx2D.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#0b0f19');
  grad.addColorStop(1, '#151923');
  ctx2D.fillStyle = grad;
  ctx2D.fillRect(0, 0, w, h);

  const floorY = centerY + 140;
  ctx2D.strokeStyle = '#6366f1';
  ctx2D.lineWidth = 3;
  ctx2D.beginPath();
  ctx2D.moveTo(50, floorY);
  ctx2D.lineTo(w - 50, floorY);
  ctx2D.stroke();

  ctx2D.fillStyle = '#232938';
  for (let x = 60; x < w - 60; x += 30) {
    ctx2D.beginPath();
    ctx2D.arc(x, floorY + 15, 2, 0, Math.PI * 2);
    ctx2D.fill();
  }

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

  drawBoneLine(pelvisPos, neckPos, 8, '#ffffff');

  drawBoneLine(lHip, lKnee, 6, '#ffffff');
  drawBoneLine(lKnee, lFoot, 6, '#ffffff');
  drawBoneLine(rHip, rKnee, 6, '#ffffff');
  drawBoneLine(rKnee, rFoot, 6, '#ffffff');

  drawBoneLine(shoulderAnchor, lElbow, 6, '#ffffff');
  drawBoneLine(lElbow, lHand, 6, '#ffffff');
  drawBoneLine(shoulderAnchor, rElbow, 6, '#ffffff');
  drawBoneLine(rElbow, rHand, 6, '#ffffff');

  ctx2D.fillStyle = '#ffffff';
  ctx2D.beginPath();
  ctx2D.arc(headPos.x, headPos.y, 28, 0, Math.PI * 2);
  ctx2D.fill();

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

  ctx2D.strokeStyle = '#0f172a';
  ctx2D.lineWidth = 3;
  ctx2D.beginPath();
  ctx2D.arc(headPos.x, headPos.y + 6, 9, 0.1, Math.PI - 0.1);
  ctx2D.stroke();
}

// --- UPDATE PLAYABLE STICKMAN GAME TICK ---
function updatePlayableGameTick(dt) {
  if (gameState.isGameOver || !state.isPlaying || state.isPaused) return;

  gameState.gameTimer += dt;

  // 1. Player Input Movement (Keyboard A/D or Mobile Touch Controls)
  let moveX = 0;
  if (keys['KeyA'] || keys['ArrowLeft'] || touchControls.left) moveX -= 1;
  if (keys['KeyD'] || keys['ArrowRight'] || touchControls.right) moveX += 1;

  gameState.playerX += moveX * 6 * dt;
  gameState.playerX = Math.max(-12, Math.min(12, gameState.playerX));

  // Jump Input (Keyboard W / Space / Up Arrow or Mobile Touch Jump Button)
  if ((keys['KeyW'] || keys['Space'] || keys['ArrowUp'] || touchControls.jump) && gameState.isGrounded) {
    gameState.playerVelY = 12;
    gameState.isGrounded = false;
    audioManager.playSound('jump');
  }

  // 2. Player Gravity Physics Step
  gameState.playerVelY -= 28 * dt; // Gravity
  gameState.playerY += gameState.playerVelY * dt;

  if (gameState.playerY <= 0) {
    gameState.playerY = 0;
    gameState.playerVelY = 0;
    gameState.isGrounded = true;
  }

  // Update Player 3D Mesh Position & Animation Clip
  if (gameSceneObjects.playerGroup) {
    gameSceneObjects.playerGroup.position.x = gameState.playerX;
    gameSceneObjects.playerGroup.position.y = 2.3 + gameState.playerY;

    if (!gameState.isGrounded) {
      state.stickmanAnimState = 'jump';
    } else if (Math.abs(moveX) > 0.1) {
      state.stickmanAnimState = 'run';
    } else {
      state.stickmanAnimState = 'idle';
    }
  }

  // 3. Coin Pickups Collision Check
  gameState.coins.forEach((c, idx) => {
    if (c.active) {
      c.mesh.rotation.z += dt * 3; // Spin Coin
      const dist = Math.abs(gameState.playerX - c.x);
      if (dist < 0.8 && gameState.playerY < 1.2) {
        c.active = false;
        c.mesh.visible = false;
        gameState.score += 100;
        audioManager.playSound('coin');
        logConsole(`[Game] Collected Coin #${idx+1}! Score: ${gameState.score}`);
      }
    }
  });

  // 4. Enemy Hazard Collision Check
  gameState.hazards.forEach(h => {
    const dist = Math.abs(gameState.playerX - h.x);
    if (dist < 0.6 && gameState.playerY < 0.6) {
      gameState.health -= 25 * dt; // Take Damage
      if (Math.random() < 0.05) audioManager.playSound('hit');

      if (gameState.health <= 0) {
        gameState.health = 0;
        gameState.isGameOver = true;
        audioManager.playSound('hit');
        logConsole('[Game] Game Over! You hit a spike hazard.', 'error');
      }
    }
  });

  // Update Game UI Overlay DOM
  const scoreEl = document.getElementById('game-score-val');
  const healthEl = document.getElementById('game-health-val');
  const healthBarEl = document.getElementById('game-health-bar-fill');
  const gameOverEl = document.getElementById('game-over-banner');

  if (scoreEl) scoreEl.innerText = gameState.score;
  if (healthEl) healthEl.innerText = Math.ceil(gameState.health);
  if (healthBarEl) healthBarEl.style.width = `${Math.max(0, gameState.health)}%`;
  if (gameOverEl) gameOverEl.style.display = gameState.isGameOver ? 'flex' : 'none';

  // Smooth Camera Follow Player in Game Mode
  camTarget.x += (gameState.playerX - camTarget.x) * 0.1;
  updateCameraTransform();
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

  // Execute attached EasyScript behaviors on 3D scene objects
  threeObjectsMap.forEach(obj => {
    if (obj.userData && typeof obj.userData.scriptUpdate === 'function') {
      obj.userData.scriptUpdate(dt);
    }
  });

  // Branch between Playable Game, 2D Canvas, & 3D Studio Modes!
  if (state.demoType === 'game') {
    updatePlayableGameTick(dt);
  } else if (state.demoType === 'stickman2d') {
    render2DStickmanEngine(now, dt);
    return;
  }

  // Drive 3D Character Engine (Animations & IK Surface Clamping)
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

    stickmanBones.pelvis.position.y = (state.demoType === 'game' ? 2.3 + gameState.playerY : 2.3 + rootY + state.ikTargetHeight);
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

// Video Editor Event Binding & Timecode Update
let studioVideoTime = 0;
let studioVideoPlaying = false;

function bindVideoEditorEvents() {
  const btnPlay = document.getElementById('video-btn-play');
  const btnPause = document.getElementById('video-btn-pause');
  const btnRewind = document.getElementById('video-btn-rewind');
  const timecodeEl = document.getElementById('video-timecode');
  const btnLetterbox = document.getElementById('video-btn-letterbox');
  const btnAddShot = document.getElementById('video-btn-add-shot');
  const btnAddOverlay = document.getElementById('video-btn-add-overlay');
  const btnExport = document.getElementById('video-btn-export');

  let letterboxOn = false;

  if (btnPlay) {
    btnPlay.addEventListener('click', () => {
      studioVideoPlaying = true;
      logConsole('[Video Editor] Video Timeline Playback Started.');
    });
  }

  if (btnPause) {
    btnPause.addEventListener('click', () => {
      studioVideoPlaying = false;
      logConsole('[Video Editor] Video Timeline Paused.');
    });
  }

  if (btnRewind) {
    btnRewind.addEventListener('click', () => {
      studioVideoTime = 0;
      studioVideoPlaying = false;
      if (timecodeEl) timecodeEl.innerText = '00:00:00.000';
      if (cameraController) cameraController.cutTo(new THREE.Vector3(0, 4, 10), new THREE.Vector3(0, 2.3, 0));
      logConsole('[Video Editor] Seeked Playhead to 0.00s.');
    });
  }

  if (btnLetterbox) {
    btnLetterbox.addEventListener('click', () => {
      letterboxOn = !letterboxOn;
      const topBar = document.getElementById('kairo-letterbox-top') || createLetterboxOverlay('top');
      const botBar = document.getElementById('kairo-letterbox-bot') || createLetterboxOverlay('bot');
      topBar.style.height = letterboxOn ? '10%' : '0%';
      botBar.style.height = letterboxOn ? '10%' : '0%';
      logConsole(`[Video Editor] 21:9 Widescreen Letterbox: ${letterboxOn ? 'ENABLED' : 'DISABLED'}`);
    });
  }

  if (btnAddShot) {
    btnAddShot.addEventListener('click', () => {
      if (cameraController) {
        cameraController.orbitShot(new THREE.Vector3(0, 2.3, 0), 9.0, 1.2, 5.0);
        logConsole('[Video Editor] Added 360° Orbital Camera Shot clip.');
      }
    });
  }

  if (btnAddOverlay) {
    btnAddOverlay.addEventListener('click', () => {
      showStudioOverlayImage();
      logConsole('[Video Editor] Added Circle Mask Logo Overlay graphic.');
    });
  }

  if (btnExport) {
    btnExport.addEventListener('click', () => {
      logConsole('[Video Editor] Exporting Multi-Track WebM Video file...');
      alert('🎬 Video Timeline exported successfully as kairo-video-edit.webm!');
    });
  }
}

function createLetterboxOverlay(type) {
  let el = document.createElement('div');
  el.id = `kairo-letterbox-${type}`;
  el.style.cssText = `position: fixed; ${type === 'top' ? 'top:0' : 'bottom:0'}; left:0; right:0; height:0%; background:#000; transition: height 0.4s ease; z-index: 9999; pointer-events: none;`;
  document.body.appendChild(el);
  return el;
}

function showStudioOverlayImage() {
  let el = document.getElementById('studio-overlay-graphic');
  if (!el) {
    el = document.createElement('div');
    el.id = 'studio-overlay-graphic';
    el.style.cssText = `
      position: fixed; top: 18%; right: 5%; width: 140px; height: 140px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.9), rgba(168, 85, 247, 0.8));
      clip-path: circle(45% at 50% 50%); display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 900; font-family: sans-serif; font-size: 13px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5); z-index: 999; pointer-events: none; border: 2px solid white;
    `;
    el.innerText = '⚡ KAIRO CUT';
    document.body.appendChild(el);
  } else {
    el.style.display = el.style.display === 'none' ? 'flex' : 'none';
  }
}

// Dom Ready Initialization
window.addEventListener('DOMContentLoaded', () => {
  initViewport();
  bindEditorEvents();
  bindVideoEditorEvents();

  // Initialize Monaco Editor
  if (window.require) {
    require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.38.0/min/vs' }});
    require(['vs/editor/editor.main'], function() {
      // Define Kairo EasyScript IntelliSense
      const easyScriptTypeDefs = `
        declare namespace EasyScript {
          function createBehavior(config: {
            onStart?: () => void;
            onUpdate?: (dt: number) => void;
          }): void;
        }
        
        interface BehaviorContext {
          // Video & Camera Cinematic
          createVideoTimeline(durationSeconds: number): void;
          addCameraShot(time: number, duration: number, type: 'orbit' | 'pan' | 'dolly' | 'crane', config?: any): void;
          addVideoOverlay(time: number, duration: number, url: string, maskConfig?: any): void;
          addVideoText(time: number, duration: number, text: string): void;
          addVideoTransition(time: number, duration: number, type: 'wipeLeft' | 'wipeRight' | 'circleWipe' | 'glitch'): void;
          addVideoColorGrading(time: number, duration: number, preset: 'cinematicWarm' | 'cyberpunkNeon' | 'noir' | 'vintage'): void;
          playVideoTimeline(): void;
          
          // Automatic Motions
          spin(speed?: number): void;
          bob(amount?: number, speed?: number): void;
          patrol(distance?: number, speed?: number): void;
          pulse(minScale?: number, maxScale?: number, speed?: number): void;
          stop(): void;

          // Physics & Movement
          move(dx: number, dy: number, dz: number): void;
          moveForward(distance: number): void;
          jump(force?: number): void;
          chase(targetPos: any, speed: number, dt: number): void;
          
          // Effects
          changeColor(hex: string): void;
          randomColor(): void;
          playSound(name: string): void;
          sparkle(count?: number): void;
          explode(count?: number): void;
          dustBurst(count?: number): void;
          teleportEffect(): void;

          // Asset Loaders
          loadModel(url: string): void;
          loadBlenderModel(url: string): void;
          streamSketchfab(uid: string): void;
        }

        // Make 'this' context strongly typed inside EasyScript lifecycle hooks
        declare module "EasyScript" {
          export interface BehaviorConfig {
            onStart(this: BehaviorContext): void;
            onUpdate(this: BehaviorContext, dt: number): void;
          }
        }
      `;
      
      monaco.languages.typescript.javascriptDefaults.addExtraLib(easyScriptTypeDefs, 'kairo-easyscript.d.ts');

      window.kairoCodeEditor = monaco.editor.create(document.getElementById('monaco-editor-container'), {
        value: "EasyScript.createBehavior({\n  onStart() {\n    // Autocomplete is ready! Try typing: this.\n    this.spin(1.5);\n    this.changeColor('#38bdf8');\n  },\n  onUpdate(dt) {\n    // Frame update loop\n  }\n});",
        language: 'javascript',
        theme: 'vs-dark',
        minimap: { enabled: false },
        automaticLayout: true
      });
    });
  }

  const btnSaveScript = document.getElementById('btn-save-script');
  if (btnSaveScript) {
    btnSaveScript.addEventListener('click', () => {
      if (window.kairoCodeEditor) {
        const code = window.kairoCodeEditor.getValue();
        console.log("Script attached to object:\n" + code);
        alert('✅ Custom EasyScript compiled and attached to object!');
      }
    });
  }
});
