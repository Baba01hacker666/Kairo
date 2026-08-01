import * as THREE from 'three';

const canvas = document.getElementById('scifi-canvas') as HTMLCanvasElement;
const container = canvas.parentElement!;

// 1. Scene & Renderer Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030712);
scene.fog = new THREE.FogExp2(0x030712, 0.025);

const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 4, 8);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 2. Futuristic Grid & Sci-Fi Environment
const gridHelper = new THREE.GridHelper(60, 60, 0xa855f7, 0x1f2937);
scene.add(gridHelper);

// Neon Light Pillars
const colors = [0xa855f7, 0xec4899, 0x3b82f6, 0x10b981];
for (let i = 0; i < 16; i++) {
  const angle = (i / 16) * Math.PI * 2;
  const radius = 18;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  const color = colors[i % colors.length];
  const geo = new THREE.CylinderGeometry(0.1, 0.1, 8, 16);
  const mat = new THREE.MeshBasicMaterial({ color });
  const pillar = new THREE.Mesh(geo, mat);
  pillar.position.set(x, 4, z);
  scene.add(pillar);

  const pLight = new THREE.PointLight(color, 2.5, 12);
  pLight.position.set(x, 4, z);
  scene.add(pLight);
}

// Center Hologram Orb
const orbGeo = new THREE.IcosahedronGeometry(1.5, 2);
const orbMat = new THREE.MeshStandardMaterial({
  color: 0xec4899,
  wireframe: true,
  emissive: 0xec4899,
  emissiveIntensity: 0.8
});
const orb = new THREE.Mesh(orbGeo, orbMat);
orb.position.set(0, 3, 0);
scene.add(orb);

// Lights
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);

const dirLight = new THREE.DirectionalLight(0xa855f7, 1.5);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

// 3. Sci-Fi Drone / Ship Player Object
const droneGroup = new THREE.Group();

const bodyGeo = new THREE.ConeGeometry(0.8, 2, 4);
bodyGeo.rotateX(Math.PI / 2);
const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
const body = new THREE.Mesh(bodyGeo, bodyMat);
droneGroup.add(body);

const wingGeo = new THREE.BoxGeometry(2.5, 0.1, 0.6);
const wingMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.1 });
const wings = new THREE.Mesh(wingGeo, wingMat);
wings.position.set(0, 0, 0.2);
droneGroup.add(wings);

// Thruster Light
const thrusterLight = new THREE.PointLight(0x38bdf8, 4, 6);
thrusterLight.position.set(0, 0, 1.2);
droneGroup.add(thrusterLight);

droneGroup.position.set(0, 1.2, 3);
scene.add(droneGroup);

// 4. Movement Logic & Key listeners
const keys: Record<string, boolean> = {};
window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

const thrusterVal = document.getElementById('thruster-val')!;
const altVal = document.getElementById('alt-val')!;

window.addEventListener('resize', () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});

let clock = new THREE.Clock();

function animate() {
  const dt = clock.getDelta();
  const time = clock.getElapsedTime();

  // Rotate hologram orb
  orb.rotation.y = time * 0.5;
  orb.rotation.x = time * 0.3;

  // Drone movement
  let speed = 6;
  let isThrusting = false;

  if (keys['KeyW'] || keys['ArrowUp']) {
    droneGroup.position.z -= speed * dt;
    isThrusting = true;
  }
  if (keys['KeyS'] || keys['ArrowDown']) {
    droneGroup.position.z += speed * dt;
    isThrusting = true;
  }
  if (keys['KeyA'] || keys['ArrowLeft']) {
    droneGroup.position.x -= speed * dt;
    isThrusting = true;
  }
  if (keys['KeyD'] || keys['ArrowRight']) {
    droneGroup.position.x += speed * dt;
    isThrusting = true;
  }

  // Bobbing hover effect
  droneGroup.position.y = 1.2 + Math.sin(time * 3) * 0.15;

  // Camera follow
  camera.position.x = THREE.MathUtils.lerp(camera.position.x, droneGroup.position.x, 0.05);
  camera.position.z = THREE.MathUtils.lerp(camera.position.z, droneGroup.position.z + 5, 0.05);
  camera.lookAt(droneGroup.position);

  // HUD updates
  thrusterVal.innerText = isThrusting ? 'ACTIVE (100%)' : 'IDLE';
  thrusterVal.style.color = isThrusting ? '#38bdf8' : '#9ca3af';
  altVal.innerText = `${droneGroup.position.y.toFixed(2)}m`;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
