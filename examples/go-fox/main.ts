import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Extend window object for Go WASM Kairo API
declare global {
  interface Window {
    Go: any;
    kairo: {
      update: (dt: number, dirX: number, dirZ: number, run: boolean) => void;
      getEntities: () => string;
      getScore: () => number;
      reset: () => void;
    };
  }
}

// Entity Types from Go
type EntityType = 'player' | 'tree' | 'avocado';
interface GoEntity {
  id: number;
  type: EntityType;
  x: number;
  y: number;
  z: number;
  rotY: number;
  speed: number;
  active: boolean;
}

const scoreElement = document.getElementById('score')!;
const loadingElement = document.getElementById('loading')!;
const uiElement = document.getElementById('ui')!;

// Load WASM
const go = new window.Go();
WebAssembly.instantiateStreaming(fetch((import.meta as any).env.BASE_URL + 'wasm/go-fox.wasm'), go.importObject).then((result) => {
  go.run(result.instance);
  
  loadingElement.style.display = 'none';
  uiElement.style.display = 'block';
  initThreeJS();
});

// Scene setup
let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, controls: OrbitControls;
let mixer: THREE.AnimationMixer | null = null;
let walkAction: THREE.AnimationAction | null = null;
let runAction: THREE.AnimationAction | null = null;
let idleAction: THREE.AnimationAction | null = null;
let currentAction: THREE.AnimationAction | null = null;

// Map Go IDs to Three.js Objects
const objectMap = new Map<number, THREE.Object3D>();

function initThreeJS() {
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x87ceeb, 10, 50);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 3, -6);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 4;
  controls.maxDistance = 15;
  controls.maxPolarAngle = Math.PI / 2 - 0.05;

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 1.2));
  const dirLight = new THREE.DirectionalLight(0xffffff, 3.0);
  dirLight.position.set(-10, 20, -10);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 50;
  dirLight.shadow.camera.left = -20;
  dirLight.shadow.camera.right = 20;
  dirLight.shadow.camera.top = 20;
  dirLight.shadow.camera.bottom = -20;
  scene.add(dirLight);

  // Environment
  const floorGeo = new THREE.PlaneGeometry(100, 100);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x4a7c59, roughness: 0.9 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Prefabs
  const treeGeo = new THREE.ConeGeometry(1, 3, 8);
  const treeMat = new THREE.MeshStandardMaterial({ color: 0x2d4c1e });
  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.2, 1);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });

  const treePrefab = new THREE.Group();
  const leaves = new THREE.Mesh(treeGeo, treeMat);
  leaves.position.y = 2;
  leaves.castShadow = true;
  leaves.receiveShadow = true;
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 0.5;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  treePrefab.add(leaves, trunk);

  const gltfLoader = new GLTFLoader();

  // Load Fox Template
  let foxTemplate: THREE.Group | null = null;
  gltfLoader.load((import.meta as any).env.BASE_URL + 'models/Fox.glb', (gltf) => {
    foxTemplate = gltf.scene;
    foxTemplate.scale.set(0.02, 0.02, 0.02);
    foxTemplate.traverse((child) => { if ((child as THREE.Mesh).isMesh) { child.castShadow = true; child.receiveShadow = true; } });
    
    // We will attach animations to the player instance later when spawning
    // We save the animations array to attach it to the mixer later
    (foxTemplate as any).animations = gltf.animations;
  });

  // Load Avocado Template
  let avocadoTemplate: THREE.Group | null = null;
  gltfLoader.load((import.meta as any).env.BASE_URL + 'models/Avocado.glb', (gltf) => {
    avocadoTemplate = gltf.scene;
    avocadoTemplate.scale.set(10, 10, 10);
    avocadoTemplate.traverse((child) => { if ((child as THREE.Mesh).isMesh) { child.castShadow = true; child.receiveShadow = true; } });
  });

  // Spawn entities based on Go state
  // We check periodically until templates load
  const checkTemplates = setInterval(() => {
    if (foxTemplate && avocadoTemplate) {
      clearInterval(checkTemplates);
      spawnEntitiesFromGo(foxTemplate, treePrefab, avocadoTemplate);
      startGameLoop();
    }
  }, 100);
}

function spawnEntitiesFromGo(foxTemplate: THREE.Group, treeTemplate: THREE.Group, avocadoTemplate: THREE.Group) {
  const entities: GoEntity[] = JSON.parse(window.kairo.getEntities());
  
  for (const ent of entities) {
    let obj: THREE.Object3D;
    
    if (ent.type === 'player') {
      obj = foxTemplate.clone();
      // Setup animations
      mixer = new THREE.AnimationMixer(obj);
      const animations = (foxTemplate as any).animations;
      idleAction = mixer.clipAction(animations[0]);
      walkAction = mixer.clipAction(animations[1]);
      runAction = mixer.clipAction(animations[2]);
      currentAction = idleAction;
      currentAction.play();
    } else if (ent.type === 'tree') {
      obj = treeTemplate.clone();
    } else {
      obj = avocadoTemplate.clone();
    }
    
    obj.position.set(ent.x, ent.y, ent.z);
    obj.rotation.y = ent.rotY;
    scene.add(obj);
    objectMap.set(ent.id, obj);
  }
}

// Input Handling
const keys = { w: false, a: false, s: false, d: false, shift: false };
window.addEventListener('keydown', (e) => { if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase() as keyof typeof keys] = true; });
window.addEventListener('keyup', (e) => { if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase() as keyof typeof keys] = false; });

let joystickActive = false;
let joystickVector = new THREE.Vector2(0, 0);

const joystickZone = document.getElementById('joystick-zone');
const joystickKnob = document.getElementById('joystick-knob');
const sprintBtn = document.getElementById('sprint-btn');

if (joystickZone && joystickKnob) {
  let stickCenter = { x: 0, y: 0 };
  let maxRadius = 60;
  const onTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (!joystickActive) return;
    const touch = Array.from(e.touches).find(t => t.target === joystickZone || t.target === joystickKnob);
    if (!touch) return;
    let dx = touch.clientX - stickCenter.x;
    let dy = touch.clientY - stickCenter.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > maxRadius) { dx = (dx / dist) * maxRadius; dy = (dy / dist) * maxRadius; }
    joystickKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    joystickVector.set(dx / maxRadius, dy / maxRadius);
  };
  joystickZone.addEventListener('touchstart', (e) => {
    e.preventDefault();
    joystickActive = true;
    const rect = joystickZone.getBoundingClientRect();
    stickCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    onTouchMove(e);
  }, { passive: false });
  joystickZone.addEventListener('touchmove', onTouchMove, { passive: false });
  const resetJoystick = () => { joystickActive = false; joystickVector.set(0, 0); joystickKnob.style.transform = `translate(-50%, -50%)`; };
  joystickZone.addEventListener('touchend', resetJoystick);
  joystickZone.addEventListener('touchcancel', resetJoystick);
}

if (sprintBtn) {
  sprintBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keys.shift = true; }, { passive: false });
  sprintBtn.addEventListener('touchend', (e) => { e.preventDefault(); keys.shift = false; }, { passive: false });
  sprintBtn.addEventListener('touchcancel', (e) => { e.preventDefault(); keys.shift = false; }, { passive: false });
}

function fadeToAction(newAction: THREE.AnimationAction, duration: number) {
  if (currentAction !== newAction && newAction) {
    const prevAction = currentAction;
    currentAction = newAction;
    if (prevAction) prevAction.fadeOut(duration);
    currentAction.reset().fadeIn(duration).play();
  }
}

function startGameLoop() {
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    // 1. Prepare Input for Go
    let dirX = 0;
    let dirZ = 0;
    
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();
    const cameraRight = new THREE.Vector3().crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0)).normalize();
    const inputDir = new THREE.Vector3();

    if (joystickActive) {
      inputDir.addScaledVector(cameraDirection, -joystickVector.y);
      inputDir.addScaledVector(cameraRight, joystickVector.x);
    } else {
      if (keys.w) inputDir.add(cameraDirection);
      if (keys.s) inputDir.sub(cameraDirection);
      if (keys.a) inputDir.sub(cameraRight);
      if (keys.d) inputDir.add(cameraRight);
    }

    dirX = inputDir.x;
    dirZ = inputDir.z;

    // 2. Call Go Update
    window.kairo.update(delta, dirX, dirZ, keys.shift);

    // 3. Read State back from Go
    const entities: GoEntity[] = JSON.parse(window.kairo.getEntities());
    let playerObj: THREE.Object3D | null = null;
    let currentSpeed = 0;

    for (const ent of entities) {
      const obj = objectMap.get(ent.id);
      if (obj) {
        if (!ent.active) {
          obj.visible = false;
        } else {
          // Lerp position for super smooth rendering (even if Go tick rate drops)
          // Here we just set it since Go delta is smooth
          obj.position.set(ent.x, ent.y, ent.z);
          obj.rotation.y = ent.rotY;
        }
        
        if (ent.type === 'player') {
          playerObj = obj;
          currentSpeed = ent.speed;
        }
      }
    }

    scoreElement.innerText = window.kairo.getScore().toString();

    // 4. Update Animations & Camera based on Player State
    if (playerObj && mixer) {
      if (currentSpeed > 0.1) {
        if (currentSpeed > 4.5 && runAction) {
          fadeToAction(runAction, 0.2);
        } else if (walkAction) {
          fadeToAction(walkAction, 0.2);
        }
      } else if (idleAction) {
        fadeToAction(idleAction, 0.2);
      }
      mixer.update(delta);

      // Hard lock the target to the player's head area
      const idealTarget = new THREE.Vector3(playerObj.position.x, playerObj.position.y + 1.5, playerObj.position.z);
      
      // Calculate how much the target moved this frame
      const targetDiff = idealTarget.clone().sub(controls.target);
      
      // Move both target and camera by the exact difference to prevent zooming in/out
      controls.target.copy(idealTarget);
      camera.position.add(targetDiff);
    }

    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}

window.addEventListener('resize', () => {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
});
