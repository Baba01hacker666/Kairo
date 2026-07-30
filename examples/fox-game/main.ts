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
controls.minDistance = 2;
controls.maxDistance = 10;
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

// Load Helmets as collectibles
gltfLoader.load(
  (import.meta as any).env.BASE_URL + 'models/DamagedHelmet.glb',
  (gltf) => {
    const helmetTemplate = gltf.scene;
    helmetTemplate.scale.set(0.5, 0.5, 0.5);
    helmetTemplate.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Spawn 10 helmets
    for (let i = 0; i < 10; i++) {
      const helmet = helmetTemplate.clone();
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 20;
      helmet.position.set(Math.cos(angle) * radius, 0.5, Math.sin(angle) * radius);
      
      // Store bobbing state in userData
      helmet.userData = {
        baseY: 0.5,
        timeOffset: Math.random() * 100,
        active: true
      };
      
      scene.add(helmet);
      collectibles.push(helmet);
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
    
    if (keys.w) direction.add(cameraDirection);
    if (keys.s) direction.sub(cameraDirection);
    if (keys.a) direction.sub(cameraRight);
    if (keys.d) direction.add(cameraRight);
    
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

    // Camera follow
    const idealOffset = new THREE.Vector3(0, 2, -5); // Behind and slightly up
    idealOffset.applyQuaternion(fox.quaternion);
    idealOffset.add(fox.position);

    camera.position.lerp(idealOffset, 5 * delta);
    controls.target.lerp(new THREE.Vector3(fox.position.x, fox.position.y + 1, fox.position.z), 5 * delta);
    
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
