import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Game state
let score = 0;
const scoreElement = document.getElementById('score')!;
const collectibles: THREE.Object3D[] = [];

// Scene setup
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x87ceeb, 10, 50);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 3, -6);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 4;
controls.maxDistance = 15;
controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below ground

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

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
const floorMat = new THREE.MeshStandardMaterial({ 
    color: 0x4a7c59, // Grass green
    roughness: 0.9,
    metalness: 0.0
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Add some trees (simple cones + cylinders)
const treeGeo = new THREE.ConeGeometry(1, 3, 8);
const treeMat = new THREE.MeshStandardMaterial({ color: 0x2d4c1e });
const trunkGeo = new THREE.CylinderGeometry(0.2, 0.2, 1);
const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });

const trees: THREE.Group[] = [];

for (let i = 0; i < 30; i++) {
  const tree = new THREE.Group();
  
  const leaves = new THREE.Mesh(treeGeo, treeMat);
  leaves.position.y = 2;
  leaves.castShadow = true;
  leaves.receiveShadow = true;
  
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 0.5;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  
  tree.add(leaves);
  tree.add(trunk);
  
  // Random placement
  const angle = Math.random() * Math.PI * 2;
  const radius = 5 + Math.random() * 40;
  tree.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
  
  scene.add(tree);
  trees.push(tree);
}

// Loading Models
const gltfLoader = new GLTFLoader();

let fox: THREE.Group | null = null;
let mixer: THREE.AnimationMixer | null = null;
let walkAction: THREE.AnimationAction | null = null;
let runAction: THREE.AnimationAction | null = null;
let idleAction: THREE.AnimationAction | null = null;
let currentAction: THREE.AnimationAction | null = null;

// Load Fox
gltfLoader.load(
  (import.meta as any).env.BASE_URL + 'models/Fox.glb',
  (gltf) => {
    fox = gltf.scene;
    fox.scale.set(0.02, 0.02, 0.02);
    
    fox.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(fox);

    mixer = new THREE.AnimationMixer(fox);
    // Animations: 0: Survey (Idle), 1: Walk, 2: Run
    idleAction = mixer.clipAction(gltf.animations[0]);
    walkAction = mixer.clipAction(gltf.animations[1]);
    runAction = mixer.clipAction(gltf.animations[2]);
    
    currentAction = idleAction;
    currentAction.play();
  }
);

// Load Avocados as collectibles
gltfLoader.load(
  (import.meta as any).env.BASE_URL + 'models/Avocado.glb',
  (gltf) => {
    const itemTemplate = gltf.scene;
    itemTemplate.scale.set(10, 10, 10);
    itemTemplate.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Spawn 10 avocados
    for (let i = 0; i < 10; i++) {
      const item = itemTemplate.clone();
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 20;
      item.position.set(Math.cos(angle) * radius, 0.5, Math.sin(angle) * radius);
      
      // Store bobbing state in userData
      item.userData = {
        baseY: 0.5,
        timeOffset: Math.random() * 100,
        active: true
      };
      
      scene.add(item);
      collectibles.push(item);
    }
  }
);

// Input Handling
const keys = { w: false, a: false, s: false, d: false, shift: false };
window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase() as keyof typeof keys] = true;
});
window.addEventListener('keyup', (e) => {
  if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase() as keyof typeof keys] = false;
});

// Mobile Joystick State
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
    
    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }
    
    joystickKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    
    // Normalize to -1 to 1
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
  
  const resetJoystick = () => {
    joystickActive = false;
    joystickVector.set(0, 0);
    joystickKnob.style.transform = `translate(-50%, -50%)`;
  };
  
  joystickZone.addEventListener('touchend', resetJoystick);
  joystickZone.addEventListener('touchcancel', resetJoystick);
}

if (sprintBtn) {
  sprintBtn.addEventListener('touchstart', (e) => { e.preventDefault(); keys.shift = true; }, { passive: false });
  sprintBtn.addEventListener('touchend', (e) => { e.preventDefault(); keys.shift = false; }, { passive: false });
  sprintBtn.addEventListener('touchcancel', (e) => { e.preventDefault(); keys.shift = false; }, { passive: false });
}

// Third Person Controller Variables
const walkSpeed = 3;
const runSpeed = 8;
const rotationSpeed = 5;
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let currentSpeed = 0;

function fadeToAction(newAction: THREE.AnimationAction, duration: number) {
  if (currentAction !== newAction && newAction) {
    const prevAction = currentAction;
    currentAction = newAction;
    if (prevAction) {
      prevAction.fadeOut(duration);
    }
    currentAction.reset().fadeIn(duration).play();
  }
}

// Game Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  if (fox && mixer) {
    // Determine target speed and rotation based on input
    let targetSpeed = 0;
    
    // Get camera facing direction (ignoring Y)
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();
    
    const cameraRight = new THREE.Vector3().crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0)).normalize();
    
    direction.set(0, 0, 0);
    
    if (joystickActive) {
      // Use joystick vector
      direction.addScaledVector(cameraDirection, -joystickVector.y);
      direction.addScaledVector(cameraRight, joystickVector.x);
    } else {
      if (keys.w) direction.add(cameraDirection);
      if (keys.s) direction.sub(cameraDirection);
      if (keys.a) direction.sub(cameraRight);
      if (keys.d) direction.add(cameraRight);
    }
    
    direction.normalize();

    if (direction.lengthSq() > 0) {
      targetSpeed = keys.shift ? runSpeed : walkSpeed;
      
      // Rotate fox towards movement direction
      const targetRotation = Math.atan2(direction.x, direction.z);
      
      // Smooth rotation
      let diff = targetRotation - fox.rotation.y;
      // Normalize angle difference to [-PI, PI]
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      fox.rotation.y += diff * rotationSpeed * delta;
    }

    // Smoothly accelerate/decelerate
    currentSpeed = THREE.MathUtils.lerp(currentSpeed, targetSpeed, 10 * delta);

    // Apply movement
    const movement = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), fox.rotation.y);
    fox.position.addScaledVector(movement, currentSpeed * delta);

    // Tree collisions (simple circle-circle overlap on XZ plane)
    const foxRadius = 0.5;
    const treeRadius = 0.6; // Slightly larger than visual trunk to feel right
    
    for (const tree of trees) {
      const dx = fox.position.x - tree.position.x;
      const dz = fox.position.z - tree.position.z;
      const distSq = dx * dx + dz * dz;
      const minDistance = foxRadius + treeRadius;
      
      if (distSq < minDistance * minDistance) {
        // Fox is inside the tree, push it out
        const dist = Math.sqrt(distSq);
        const overlap = minDistance - dist;
        // Normalize the vector pointing away from tree
        const nx = dx / (dist || 1); // fallback if dist is 0
        const nz = dz / (dist || 1);
        
        fox.position.x += nx * overlap;
        fox.position.z += nz * overlap;
      }
    }

    // Handle animations
    if (currentSpeed > 0.1) {
      if (keys.shift && runAction) {
        fadeToAction(runAction, 0.2);
      } else if (walkAction) {
        fadeToAction(walkAction, 0.2);
      }
    } else if (idleAction) {
      fadeToAction(idleAction, 0.2);
    }

    mixer.update(delta);

    // Camera follow - Hard lock target to player's head area
    const idealTarget = new THREE.Vector3(fox.position.x, fox.position.y + 1.5, fox.position.z);
    
    // Calculate how much the target moved this frame
    const targetDiff = idealTarget.clone().sub(controls.target);
    
    // Move both target and camera by the exact difference to prevent zooming in/out
    controls.target.copy(idealTarget);
    camera.position.add(targetDiff);
    
    // Check collisions with collectibles
    for (const item of collectibles) {
      if (item.userData.active) {
        // Bobbing animation
        item.userData.timeOffset += delta * 2;
        item.position.y = item.userData.baseY + Math.sin(item.userData.timeOffset) * 0.2;
        item.rotation.y += delta;
        
        // Distance check (radius of ~1)
        if (fox.position.distanceTo(item.position) < 1.5) {
          item.userData.active = false;
          item.visible = false;
          score += 1;
          scoreElement.innerText = score.toString();
          
          // Small pop effect or sound could go here
        }
      }
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
