import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Engine, Vector3 } from '@kairo/core';
import { PhysicsWorld, RigidBody, Collider, RigidBodyType, ColliderType, RaycastVehicle } from '@kairo/physics';
import { RenderPipeline, CameraController } from '@kairo/renderer';

// --- Global Engine State ---
const engine = new Engine();
const physics = new PhysicsWorld('cannon');

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const threeRenderer = new THREE.WebGLRenderer({ canvas, antialias: true });
threeRenderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Sky blue
scene.fog = new THREE.FogExp2(0x87ceeb, 0.005);

const threeCam = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const camera = new CameraController(threeCam);
camera.camera.position.set(0, 5, -10);

const renderer = new RenderPipeline(threeRenderer, scene, threeCam);


// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(20, 50, 20);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 150;
dirLight.shadow.camera.left = -50;
dirLight.shadow.camera.right = 50;
dirLight.shadow.camera.top = 50;
dirLight.shadow.camera.bottom = -50;
scene.add(dirLight);

// --- Track/Ground Setup ---
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });
const groundGeo = new THREE.BoxGeometry(200, 1, 200);
const groundMesh = new THREE.Mesh(groundGeo, groundMaterial);
groundMesh.receiveShadow = true;
groundMesh.position.y = -0.5;
scene.add(groundMesh);


const groundBody = new RigidBody();
groundBody.type = RigidBodyType.Static;
groundBody.mass = 0;

const groundCollider = new Collider();
groundCollider.type = ColliderType.Box;
groundCollider.size = new Vector3(200, 1, 200);

physics.registerBody(groundBody, groundCollider);
if (groundBody.cannonBody) groundBody.cannonBody.position.set(0, -0.5, 0);

// --- Vehicle Setup ---
const chassisWidth = 1.8;
const chassisHeight = 0.6;
const chassisLength = 4.0;
const chassisMass = 800;

// Chassis Mesh
const chassisGeo = new THREE.BoxGeometry(chassisWidth, chassisHeight, chassisLength);
const chassisMat = new THREE.MeshStandardMaterial({ color: 0xcc0000 });
const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat);
chassisMesh.castShadow = true;
scene.add(chassisMesh);

// Chassis Physics
const chassisBody = new RigidBody();
chassisBody.type = RigidBodyType.Dynamic;
chassisBody.mass = chassisMass;

const chassisCollider = new Collider();
chassisCollider.type = ColliderType.Box;
chassisCollider.size = new Vector3(chassisWidth, chassisHeight, chassisLength);

physics.registerBody(chassisBody, chassisCollider);
if (chassisBody.cannonBody) chassisBody.cannonBody.position.set(0, 2, 0);


const vehicle = new RaycastVehicle({
  chassisBody: chassisBody,
  indexRightAxis: 0,
  indexUpAxis: 1,
  indexForwardAxis: 2
});

// Wheels

const wheelOptions: any = {
  radius: 0.4,
  directionLocal: new Vector3(0, -1, 0),
  suspensionStiffness: 30,
  suspensionRestLength: 0.3,
  frictionSlip: 5,
  dampingRelaxation: 2.3,
  dampingCompression: 4.4,
  maxSuspensionForce: 100000,
  rollInfluence: 0.1,
  axleLocal: new Vector3(-1, 0, 0),
  chassisConnectionPointLocal: new Vector3(),
  maxSuspensionTravel: 0.3,
  customSlidingRotationalSpeed: -30,
  useCustomSlidingRotationalSpeed: true
};


const wheelMeshes: THREE.Mesh[] = [];
const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 20);
wheelGeo.rotateZ(Math.PI / 2);
const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });

// Front Left
wheelOptions.chassisConnectionPointLocal.set(chassisWidth / 2 + 0.3, 0, chassisLength / 2 - 0.5);
wheelOptions.isFrontWheel = true;
vehicle.addWheel({ ...wheelOptions });

// Front Right
wheelOptions.chassisConnectionPointLocal.set(-chassisWidth / 2 - 0.3, 0, chassisLength / 2 - 0.5);
wheelOptions.isFrontWheel = true;
vehicle.addWheel({ ...wheelOptions });

// Back Left
wheelOptions.chassisConnectionPointLocal.set(chassisWidth / 2 + 0.3, 0, -chassisLength / 2 + 0.5);
wheelOptions.isFrontWheel = false;
vehicle.addWheel({ ...wheelOptions });

// Back Right
wheelOptions.chassisConnectionPointLocal.set(-chassisWidth / 2 - 0.3, 0, -chassisLength / 2 + 0.5);
wheelOptions.isFrontWheel = false;
vehicle.addWheel({ ...wheelOptions });

for (let i = 0; i < 4; i++) {
  const mesh = new THREE.Mesh(wheelGeo, wheelMat);
  mesh.castShadow = true;
  scene.add(mesh);
  wheelMeshes.push(mesh);
}

vehicle.addToWorld(physics);

// Resize handler
window.addEventListener('resize', () => {
  renderer.renderer.setSize(window.innerWidth, window.innerHeight);
  const cam = camera.camera as THREE.PerspectiveCamera;
  cam.aspect = window.innerWidth / window.innerHeight;
  cam.updateProjectionMatrix();
});

// Controls
const keys = { w: false, a: false, s: false, d: false };
document.addEventListener('keydown', (e) => {
  if (keys.hasOwnProperty(e.key.toLowerCase())) {
    keys[e.key.toLowerCase() as keyof typeof keys] = true;
  }
});
document.addEventListener('keyup', (e) => {
  if (keys.hasOwnProperty(e.key.toLowerCase())) {
    keys[e.key.toLowerCase() as keyof typeof keys] = false;
  }
});


// Mobile controls support
document.getElementById('btn-gas')?.addEventListener('touchstart', (e) => { e.preventDefault(); keys.w = true; });
document.getElementById('btn-gas')?.addEventListener('touchend', (e) => { e.preventDefault(); keys.w = false; });
document.getElementById('btn-brake')?.addEventListener('touchstart', (e) => { e.preventDefault(); keys.s = true; });
document.getElementById('btn-brake')?.addEventListener('touchend', (e) => { e.preventDefault(); keys.s = false; });
document.getElementById('btn-left')?.addEventListener('touchstart', (e) => { e.preventDefault(); keys.a = true; });
document.getElementById('btn-left')?.addEventListener('touchend', (e) => { e.preventDefault(); keys.a = false; });
document.getElementById('btn-right')?.addEventListener('touchstart', (e) => { e.preventDefault(); keys.d = true; });
document.getElementById('btn-right')?.addEventListener('touchend', (e) => { e.preventDefault(); keys.d = false; });

const speedUI = document.getElementById('speedometer')!;


// Engine Loop
engine.events.on('update', (dt: any) => {
  physics.step(dt);

  // Sync meshes
  if (chassisBody.cannonBody) {
    chassisMesh.position.set(chassisBody.cannonBody.position.x, chassisBody.cannonBody.position.y, chassisBody.cannonBody.position.z);
    chassisMesh.quaternion.set(chassisBody.cannonBody.quaternion.x, chassisBody.cannonBody.quaternion.y, chassisBody.cannonBody.quaternion.z, chassisBody.cannonBody.quaternion.w);

    // Calculate speed (km/h)
    const speed = chassisBody.cannonBody.velocity.length() * 3.6;
    speedUI.innerText = `${Math.round(speed)} km/h`;
  }

  for (let i = 0; i < 4; i++) {
    vehicle.updateWheelTransform(i);
    const transform = vehicle.getWheelTransform(i);
    if (transform) {
      wheelMeshes[i].position.set(transform.position.x, transform.position.y, transform.position.z);
      wheelMeshes[i].quaternion.set(transform.quaternion.x, transform.quaternion.y, transform.quaternion.z, transform.quaternion.w);
    }
  }

  // Input to vehicle forces
  const maxSteerVal = 0.5;
  const maxForce = 1000;
  const brakeForce = 20;

  vehicle.setSteeringValue(0, 0);
  vehicle.setSteeringValue(0, 1);
  vehicle.applyEngineForce(0, 2);
  vehicle.applyEngineForce(0, 3);
  vehicle.setBrake(0, 0);
  vehicle.setBrake(0, 1);
  vehicle.setBrake(0, 2);
  vehicle.setBrake(0, 3);

  if (keys.w) {
    vehicle.applyEngineForce(maxForce, 2);
    vehicle.applyEngineForce(maxForce, 3);
  } else if (keys.s) {
    vehicle.applyEngineForce(-maxForce / 2, 2);
    vehicle.applyEngineForce(-maxForce / 2, 3);
  }

  if (keys.a) {
    vehicle.setSteeringValue(maxSteerVal, 0);
    vehicle.setSteeringValue(maxSteerVal, 1);
  } else if (keys.d) {
    vehicle.setSteeringValue(-maxSteerVal, 0);
    vehicle.setSteeringValue(-maxSteerVal, 1);
  }


  // Basic Camera Follow
  if (chassisBody.cannonBody) {
    const pos = chassisBody.cannonBody.position;

    // Convert cannon quaternion to Three.js quaternion to properly apply rotation
    const threeQuat = new THREE.Quaternion(
        chassisBody.cannonBody.quaternion.x,
        chassisBody.cannonBody.quaternion.y,
        chassisBody.cannonBody.quaternion.z,
        chassisBody.cannonBody.quaternion.w
    );

    const cameraOffset = new THREE.Vector3(0, 3, -7);
    cameraOffset.applyQuaternion(threeQuat);

    const targetPos = new THREE.Vector3(pos.x, pos.y, pos.z).add(cameraOffset);
    camera.camera.position.lerp(targetPos, 0.1);
    camera.camera.lookAt(pos.x, pos.y + 1, pos.z);
  }

  renderer.renderer.render(scene, camera.camera);
});

engine.start();
