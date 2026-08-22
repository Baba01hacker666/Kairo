import { KairoApp, Vector3 } from '@kairo/core';

// 1. Initialize the app magically
const app = new KairoApp({
  canvas: 'game-canvas',
  background: 0x111827 // dark blue-gray
});

// 2. Setup lighting in one line
app.setLighting({ ambient: 0.6, sunPosition: [5, 10, 5], sunIntensity: 1.5 });

// 3. Create a static ground box
app.createBox({
  size: [20, 1, 20],
  position: [0, -0.5, 0],
  color: 0x374151, // gray
  physics: 'static'
});

// 4. Create some physics stairs
for (let i = 0; i < 5; i++) {
  app.createBox({
    size: [4, 0.5, 2],
    position: [0, i * 0.5, -4 - (i * 2)],
    color: 0x10b981, // emerald
    physics: 'static'
  });
}

// 5. Create a dynamic player box!
const player = app.createBox({
  size: [1, 1, 1],
  position: [0, 5, 0],
  color: 0x3b82f6, // blue
  physics: 'dynamic',
  mass: 2
});

// 6. Magic Update Loop
let cameraFollow = false;
app.animate(app.camera.position, { x: [-10, 0], y: [10, 5], z: [20, 10] }, { duration: 2 }).then(() => {
  cameraFollow = true;
});

app.onUpdate((dt) => {
  if (!player.rb || !player.rb.cannonBody) return;

  const speed = 10;
  let moveX = 0;
  let moveZ = 0;

  if (app.isKeyDown('KeyA') || app.isKeyDown('ArrowLeft')) moveX -= speed;
  if (app.isKeyDown('KeyD') || app.isKeyDown('ArrowRight')) moveX += speed;
  if (app.isKeyDown('KeyW') || app.isKeyDown('ArrowUp')) moveZ -= speed;
  if (app.isKeyDown('KeyS') || app.isKeyDown('ArrowDown')) moveZ += speed;

  // Apply velocity to the player
  player.rb.cannonBody.velocity.x = moveX;
  player.rb.cannonBody.velocity.z = moveZ;

  // Jump
  if (app.isKeyDown('Space') && Math.abs(player.rb.cannonBody.velocity.y) < 0.1) {
    player.rb.cannonBody.velocity.y = 10;
  }

  // Fell off the world? Respawn instead of falling forever.
  if (player.rb.cannonBody.position.y < -15) {
    player.rb.teleport(new Vector3(0, 5, 0));
    player.rb.cannonBody.velocity.set(0, 0, 0);
    player.rb.cannonBody.angularVelocity.set(0, 0, 0);
    app.ui.showToast('Respawned! Try the stairs 🪜', 1500, 'info');
  }

  // Smooth camera follow
  if (cameraFollow) {
    app.camera.position.x += (player.mesh.position.x - app.camera.position.x) * 0.1;
    app.camera.position.z += (player.mesh.position.z + 10 - app.camera.position.z) * 0.1;
    app.camera.lookAt(player.mesh.position);
  }
});

// 7. Start the engine!
app.start();
