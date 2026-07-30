import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

// Setup basic scene
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.25, 100);
camera.position.set(0, 1.5, 5.0); // Move camera back and center it

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2; // Brighter exposure
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0.5, 0); // Look slightly up
controls.update();

// Add realistic lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); // Much brighter ambient
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 4.0); // Brighter sun
dirLight.position.set(5, 10, 5); // Sun in front/above, casting shadow behind
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.bias = -0.0001;
scene.add(dirLight);

// Setup Animation Mixer
let mixer: THREE.AnimationMixer;

// Load the Animated Fox Model
const gltfLoader = new GLTFLoader();
gltfLoader.load(
  (import.meta as any).env.BASE_URL + 'models/Fox.glb',
  (gltf) => {
    const model = gltf.scene;
    
    // Scale and position
    model.scale.set(0.015, 0.015, 0.015);
    model.position.set(-1.5, 0, 0); // Put on floor and further left
    model.rotation.y = Math.PI / 6;
    
    // Enable shadows for the model
    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(model);

    // Play animation (Fox has 'Walk', 'Run', 'Survey')
    mixer = new THREE.AnimationMixer(model);
    if (gltf.animations.length > 0) {
      const action = mixer.clipAction(gltf.animations[1]); // Play 'Walk' or 'Run'
      action.play();
    }
  }
);

// Load the Realistic Helmet Model (PBR Textures)
gltfLoader.load(
  (import.meta as any).env.BASE_URL + 'models/DamagedHelmet.glb',
  (gltf) => {
    const helmet = gltf.scene;
    helmet.scale.set(1.2, 1.2, 1.2);
    helmet.position.set(1.5, 0.6, 0);
    helmet.rotation.y = -Math.PI / 4;
    
    helmet.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(helmet);
  }
);

// Add a floor for shadows
const floorGeo = new THREE.PlaneGeometry(50, 50);
const floorMat = new THREE.MeshStandardMaterial({ 
    color: 0x999999, // Lighter grey
    roughness: 0.8,
    metalness: 0.1
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
floor.receiveShadow = true;
scene.add(floor);

// Removed empty environment map fallback as it causes metallic materials to render pitch black

// Animation Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);

  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
