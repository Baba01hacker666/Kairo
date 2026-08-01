import { Engine as KairoEngine } from '@kairo/core';
import {
  Engine as BabylonEngine,
  Scene,
  Vector3,
  VirtualJoysticksCamera,
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

  // 4. Setup Camera
  // Using VirtualJoysticksCamera forces on-screen joysticks to appear on all touch devices
  const camera = new VirtualJoysticksCamera("camera", new Vector3(0, 2, -10), scene);
  camera.setTarget(new Vector3(0, 2, 0));
  camera.attachControl(canvas, true);
  camera.minZ = 0.1;
  camera.speed = 0.8;
  
  // 4.5 Build a reliable Procedural Gun (so there is ALWAYS a gun visible)
  const gunMesh = new Mesh("gunRoot", scene);
  gunMesh.parent = camera;
  gunMesh.position = new Vector3(0.5, -0.4, 1.2);
  
  const barrel = MeshBuilder.CreateCylinder("barrel", { height: 1.5, diameter: 0.15 }, scene);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.z = 0.5;
  barrel.parent = gunMesh;
  
  const body = MeshBuilder.CreateBox("body", { width: 0.2, height: 0.3, depth: 0.8 }, scene);
  body.parent = gunMesh;
  
  const handle = MeshBuilder.CreateBox("handle", { width: 0.15, height: 0.4, depth: 0.2 }, scene);
  handle.position.y = -0.2;
  handle.position.z = -0.2;
  handle.rotation.x = Math.PI / 8;
  handle.parent = gunMesh;
  
  const gunMat = new StandardMaterial("gunMat", scene);
  gunMat.diffuseColor = new Color3(0.2, 0.2, 0.2);
  gunMat.specularColor = new Color3(0.5, 0.5, 0.5);
  barrel.material = gunMat;
  body.material = gunMat;
  handle.material = gunMat;
  
  // Try to load M4A1.obj, if it works, hide the procedural gun and use the loaded one
  try {
    const gunResult = await SceneLoader.ImportMeshAsync("", "/models/", "M4A1.obj", scene);
    if (gunResult.meshes.length > 0) {
      const loadedGun = gunResult.meshes[0] as Mesh;
      loadedGun.parent = camera;
      loadedGun.position = new Vector3(0.5, -0.5, 1.5);
      loadedGun.scaling = new Vector3(0.01, 0.01, 0.01); 
      loadedGun.rotation = new Vector3(0, Math.PI, 0);
      
      // Hide procedural gun
      barrel.isVisible = false;
      body.isVisible = false;
      handle.isVisible = false;
    }
  } catch (e) {
    console.warn("Failed to load M4A1.obj model, falling back to procedural gun.", e);
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

  // 9. Keep camera height locked to simulate walking on ground
  scene.onBeforeRenderObservable.add(() => {
    // Lock the Y axis so players can't fly up into the air
    camera.position.y = 2.0; 
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
