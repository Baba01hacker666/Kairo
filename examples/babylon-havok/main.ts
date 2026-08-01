import { Engine } from '@kairo/core';
import {
  Engine as BabylonEngine,
  Scene,
  Vector3,
  FreeCamera,
  HemisphericLight,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Color4,
  PhysicsShapeType,
  HavokPlugin,
  PhysicsAggregate
} from '@babylonjs/core';
import HavokPhysics from '@babylonjs/havok';

const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;

async function init() {
  // 1. Initialize Havok Engine
  const havokInstance = await HavokPhysics();

  // 2. Setup Babylon.js
  const babylonEngine = new BabylonEngine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
  const scene = new Scene(babylonEngine);
  scene.clearColor = new Color4(0.05, 0.05, 0.05, 1.0) as any;

  // 3. Integrate Havok with Babylon.js
  const hk = new HavokPlugin(true, havokInstance);
  scene.enablePhysics(new Vector3(0, -9.81, 0), hk);

  // Camera & Lighting
  const camera = new FreeCamera("camera", new Vector3(0, 10, -20), scene);
  camera.setTarget(Vector3.Zero());
  camera.attachControl(canvas, true);

  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.8;

  // 4. Create Ground (Static Physics Body)
  const ground = MeshBuilder.CreateGround("ground", { width: 25, height: 25 }, scene);
  const groundMat = new StandardMaterial("groundMat", scene);
  groundMat.diffuseColor = new Color3(0.2, 0.5, 0.2);
  ground.material = groundMat;
  new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, scene);

  // 5. Create falling objects with Havok Physics (Dynamic Bodies)
  const colors = [
    new Color3(0.8, 0.2, 0.2),
    new Color3(0.2, 0.8, 0.2),
    new Color3(0.2, 0.2, 0.8),
    new Color3(0.8, 0.8, 0.2)
  ];

  for (let i = 0; i < 20; i++) {
    const box = MeshBuilder.CreateBox("box" + i, { size: 1.5 }, scene);
    box.position = new Vector3((Math.random() - 0.5) * 10, 10 + i * 2, (Math.random() - 0.5) * 10);
    
    // Add some random rotation
    box.rotation = new Vector3(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    
    const mat = new StandardMaterial("mat" + i, scene);
    mat.diffuseColor = colors[i % colors.length];
    box.material = mat;
    
    new PhysicsAggregate(box, PhysicsShapeType.BOX, { mass: 1, restitution: 0.5, friction: 0.5 }, scene);
  }

  // 6. Use Kairo Engine for the core game loop
  const kairoEngine = new Engine();

  window.addEventListener('resize', () => {
    babylonEngine.resize();
  });

  kairoEngine.events.on('update', (dt: number) => {
    // You can handle Kairo ECS logic here
    // Babylon/Havok physics is automatically updated by scene.render()
  });

  kairoEngine.events.on('render', () => {
    scene.render();
  });

  // Start Kairo Engine loop
  kairoEngine.start();
}

init();
