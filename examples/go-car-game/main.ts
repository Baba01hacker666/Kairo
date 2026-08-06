import { KairoApp } from '@kairo/core';

async function initGame() {
  // 1. Initialize Go WASM Physics
  const go = new (window as any).Go();
  const result = await WebAssembly.instantiateStreaming(fetch('/public/kairo-physics.wasm'), go.importObject);
  go.run(result.instance); // This binds KairoPhysicsAddBody, KairoPhysicsStep, KairoPhysicsApplyForce, KairoPhysicsGetState to window
  
  // 2. Initialize the Kairo Engine App
  const app = new KairoApp({
    canvas: 'game-canvas',
    background: 0x111827 // dark blue-gray
  });
  
  app.setLighting({ ambient: 0.8, sunPosition: [20, 50, 20], sunIntensity: 2.0 });

  // 3. Create Open World Grass Terrain
  // Massive 1000x1000 green field
  app.createBox({ size: [1000, 1, 1000], position: [0, -0.5, 0], color: 0x15803d }); // Lush deep green
  (window as any).KairoPhysicsAddBody("ground", 0, 500, 0, -0.5, 0);

  // Scatter 40 procedural boulders around the open world
  for(let i = 0; i < 40; i++) {
    const rx = (Math.random() - 0.5) * 800;
    const rz = (Math.random() - 0.5) * 800;
    // Don't spawn exactly on the car
    if (Math.abs(rx) < 20 && Math.abs(rz) < 20) continue;
    
    const size = 3 + Math.random() * 8;
    app.createBox({ size: [size, size, size], position: [rx, size/2 - 1, rz], color: 0x64748b });
    (window as any).KairoPhysicsAddBody(`rock_${i}`, 0, size/2, rx, size/2 - 1, rz);
  }

  // 4. Load the Real Car Model!
  // We use the direct loadModel that is built-in to the EasyScript context equivalent
  let carEntity = null;
  
  // Fallback to basic mesh if loadModel doesn't directly return it sync
  carEntity = app.createBox({
    size: [2, 1, 4],
    position: [0, 2, 0],
    color: 0xef4444, // red fallback

  });

  // Try to load the GLTF model and replace the mesh if possible
  // In a real EasyScript script, this is bound to the ECS system
  if ((app as any).loadModel) {
     (app as any).loadModel('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/refs/heads/main/Models/CarConcept/glTF-Binary/CarConcept.glb'); 
  }
  
  // Register Car in Go Physics
  // ID, Mass (1500), Radius (2.5), X, Y, Z
  (window as any).KairoPhysicsAddBody("player_car", 1500, 2.5, 0, 2, 0);

  // 5. GSAP Camera Entrance Animation
  const gsap = (window as any).gsap;
  app.camera.position.set(0, 50, -50);
  gsap.to(app.camera.position, {
    x: 0,
    y: 10,
    z: -15,
    duration: 3,
    ease: "power3.out"
  });

  // Mobile Controls State
  const mobileInput = { up: false, down: false, left: false, right: false, jump: false };

  const bindBtn = (id: string, key: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('touchstart', (e) => { e.preventDefault(); (mobileInput as any)[key] = true; });
    el.addEventListener('touchend', (e) => { e.preventDefault(); (mobileInput as any)[key] = false; });
    el.addEventListener('mousedown', (e) => { e.preventDefault(); (mobileInput as any)[key] = true; });
    el.addEventListener('mouseup', (e) => { e.preventDefault(); (mobileInput as any)[key] = false; });
    el.addEventListener('mouseleave', (e) => { e.preventDefault(); (mobileInput as any)[key] = false; });
  };

  bindBtn('btn-up', 'up');
  bindBtn('btn-down', 'down');
  bindBtn('btn-left', 'left');
  bindBtn('btn-right', 'right');
  bindBtn('btn-jump', 'jump');

  // 6. Game Loop Update
  const speedEl = document.getElementById('speed');
  
  app.onUpdate((dt) => {
    // A. Step Go Physics
    (window as any).KairoPhysicsStep(dt);
    
    // B. Get Go Physics State
    const state = (window as any).KairoPhysicsGetState("player_car");
    if (!state) return;
    
    // C. Sync Visuals
    carEntity.mesh.position.set(state.px, state.py, state.pz);
    
    // D. Input Handling (Apply Forces to Go Backend)
    const acceleration = 30000;
    const turnSpeed = 20000;
    
    if (app.isKeyDown('KeyW') || app.isKeyDown('ArrowUp') || mobileInput.up) {
      (window as any).KairoPhysicsApplyForce("player_car", 0, 0, acceleration * dt);
    }
    if (app.isKeyDown('KeyS') || app.isKeyDown('ArrowDown') || mobileInput.down) {
      (window as any).KairoPhysicsApplyForce("player_car", 0, 0, -acceleration * dt);
    }
    if (app.isKeyDown('KeyA') || app.isKeyDown('ArrowLeft') || mobileInput.left) {
      (window as any).KairoPhysicsApplyForce("player_car", turnSpeed * dt, 0, 0);
    }
    if (app.isKeyDown('KeyD') || app.isKeyDown('ArrowRight') || mobileInput.right) {
      (window as any).KairoPhysicsApplyForce("player_car", -turnSpeed * dt, 0, 0);
    }
    if (app.isKeyDown('Space') || mobileInput.jump) {
      (window as any).KairoPhysicsApplyForce("player_car", 0, 500000 * dt, 0); // Jump!
    }
    
    // E. Camera Follow with GSAP for smooth tracking
    gsap.to(app.camera.position, {
      x: state.px,
      y: state.py + 10,
      z: state.pz - 15,
      duration: 0.5,
      ease: "power1.out"
    });
    app.camera.lookAt(carEntity.mesh.position);
    
    // F. Update UI
    const velocityMag = Math.sqrt(state.vx*state.vx + state.vz*state.vz);
    if(speedEl) speedEl.innerText = Math.floor(velocityMag * 3.6) + " KM/H";
    
    // G. Win/Lose Condition
    if (state.py < -20 && !(window as any).isGameOver) {
      (window as any).isGameOver = true;
      app.ui.showEndScreen({
        title: "WASTED",
        subtitle: "You fell off the edge of the world.",
        score: Math.floor(velocityMag * 3.6) + " KM/H Max Speed",
        btnText: "RESPAWN",
        onRestart: () => {
          location.reload();
        }
      });
    }
  });

  // 7. Show Start Screen before Engine Start!
  app.ui.showStartScreen({
    title: "GO WASM RACING",
    subtitle: "Drift around the boulders. Don't fall off.",
    btnText: "START ENGINE",
    onStart: () => {
      app.start();
    }
  });
}

initGame();
