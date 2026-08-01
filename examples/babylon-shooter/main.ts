import { Engine as KairoEngine } from '@kairo/core';
import {
  Engine as BabylonEngine,
  Scene,
  Vector3,
  UniversalCamera,
  HemisphericLight,
  MeshBuilder,
  StandardMaterial,
  Color3,
  PhysicsShapeType,
  HavokPlugin,
  PhysicsAggregate,
  SceneLoader,
  Texture,
  Mesh
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import '@babylonjs/loaders/OBJ';
import HavokPhysics from '@babylonjs/havok';

const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const shootBtn = document.getElementById('shootBtn') as HTMLDivElement;

async function init() {
  // 1. Init Havok
  const havokInstance = await HavokPhysics();

  // 2. Init Babylon
  const babylonEngine = new BabylonEngine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
  const scene = new Scene(babylonEngine);
  
  // 3. Enable Physics
  const hk = new HavokPlugin(true, havokInstance);
  scene.enablePhysics(new Vector3(0, -9.81, 0), hk);

  // 4. Setup Camera (UniversalCamera supports touch joysticks automatically on mobile)
  const camera = new UniversalCamera("camera", new Vector3(0, 2, -10), scene);
  camera.setTarget(new Vector3(0, 2, 0));
  camera.attachControl(canvas, true);
  camera.minZ = 0.1;
  camera.speed = 0.5;
  
  // Add a player collision body (capsule)
  const playerMesh = MeshBuilder.CreateCapsule("player", { height: 2, radius: 0.5 }, scene);
  playerMesh.isVisible = false;
  const playerAgg = new PhysicsAggregate(playerMesh, PhysicsShapeType.CAPSULE, { mass: 50, friction: 0 }, scene);
  
  // Lock rotation so player doesn't tip over
  playerAgg.body.setMassProperties({ inertia: new Vector3(0,0,0) });

  // 4.5 Load Gun Model
  let gunMesh: Mesh | null = null;
  try {
    const gunResult = await SceneLoader.ImportMeshAsync("", "/models/", "M4A1.obj", scene);
    gunMesh = gunResult.meshes[0] as Mesh;
    
    // Attach gun to the camera
    gunMesh.parent = camera;
    
    // Position it in the bottom-right of the screen like a standard FPS
    // Adjusted scale and position for M4A1
    gunMesh.position = new Vector3(0.5, -0.5, 1.5);
    gunMesh.scaling = new Vector3(0.01, 0.01, 0.01); // OBJ files are usually huge
    gunMesh.rotation = new Vector3(0, Math.PI, 0);
  } catch (e) {
    console.error("Failed to load M4A1.obj model:", e);
  }

  // 5. Lighting
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.7;

  // 6. Environment - Ground
  const ground = MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);
  const groundMat = new StandardMaterial("groundMat", scene);
  groundMat.diffuseColor = new Color3(0.1, 0.2, 0.1);
  ground.material = groundMat;
  new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, scene);

  // 7. Load Asset Targets (Damaged Helmet)
  const targets: Mesh[] = [];
  try {
    const result = await SceneLoader.ImportMeshAsync("", "/models/", "DamagedHelmet.glb", scene);
    const helmet = result.meshes[0];
    helmet.scaling = new Vector3(1.5, 1.5, 1.5);
    helmet.position = new Vector3(0, -100, 0); // Hide original
    
    // Spawn a bunch of targets
    for (let i = 0; i < 10; i++) {
      const clone = helmet.clone("target" + i, null) as Mesh;
      if(clone) {
        clone.position = new Vector3((Math.random() - 0.5) * 40, Math.random() * 5 + 2, (Math.random() - 0.5) * 40);
        // We use a bounding box for physics since it's a complex mesh
        const agg = new PhysicsAggregate(clone, PhysicsShapeType.BOX, { mass: 5, restitution: 0.2 }, scene);
        targets.push(clone);
      }
    }
  } catch(e) {
    console.error("Failed to load DamagedHelmet, using boxes instead.");
    for (let i = 0; i < 10; i++) {
      const box = MeshBuilder.CreateBox("target" + i, { size: 2 }, scene);
      box.position = new Vector3((Math.random() - 0.5) * 40, Math.random() * 5 + 2, (Math.random() - 0.5) * 40);
      const mat = new StandardMaterial("boxMat", scene);
      mat.diffuseColor = new Color3(0.8, 0.2, 0.2);
      box.material = mat;
      new PhysicsAggregate(box, PhysicsShapeType.BOX, { mass: 5 }, scene);
    }
  }

  // 8. Shooting Logic
  const shoot = () => {
    // Create projectile
    const proj = MeshBuilder.CreateSphere("proj", { diameter: 0.5 }, scene);
    proj.position = camera.position.clone();
    
    // Move slightly forward so it doesn't collide with player
    const forward = camera.getDirection(new Vector3(0, 0, 1));
    proj.position.addInPlace(forward.scale(1.0));

    const mat = new StandardMaterial("projMat", scene);
    mat.emissiveColor = new Color3(1, 0.5, 0);
    proj.material = mat;

    const projAgg = new PhysicsAggregate(proj, PhysicsShapeType.SPHERE, { mass: 2, restitution: 0.5 }, scene);
    
    // Apply impulse
    const impulseForce = forward.scale(100);
    projAgg.body.applyImpulse(impulseForce, proj.getAbsolutePosition());

    // Gun Recoil Animation
    if (gunMesh) {
      gunMesh.position.z -= 0.2;
      gunMesh.rotation.x -= 0.1;
      setTimeout(() => {
        if (gunMesh) {
          gunMesh.position.z += 0.2;
          gunMesh.rotation.x += 0.1;
        }
      }, 100);
    }

    // Destroy after 3 seconds
    setTimeout(() => {
      proj.dispose();
      projAgg.dispose();
    }, 3000);
  };

  shootBtn.addEventListener('pointerdown', shoot);
  
  // Also allow clicking canvas to shoot on desktop
  canvas.addEventListener('pointerdown', (e) => {
    // Only shoot if it's a left click and not touching UI (joysticks will stop propagation)
    if (e.button === 0) shoot();
  });

  // 9. Sync camera to player physics body
  scene.onBeforeRenderObservable.add(() => {
    // Sync camera to player mesh position
    camera.position.x = playerMesh.position.x;
    camera.position.z = playerMesh.position.z;
    camera.position.y = playerMesh.position.y + 1; // Eye level
    
    // Instead of free flying, lock the player's y velocity if they jump (optional)
  });

  // Handle Resize
  window.addEventListener('resize', () => {
    babylonEngine.resize();
  });

  // 10. Use Kairo Engine loop
  const kairoEngine = new KairoEngine();

  kairoEngine.events.on('update', (dt: number) => {
    // You can handle custom ECS logic here
  });

  kairoEngine.events.on('render', () => {
    scene.render();
  });

  kairoEngine.start();
}

init();
