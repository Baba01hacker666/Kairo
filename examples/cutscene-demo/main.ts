import { KairoApp } from '@kairo/core';

const app = new KairoApp({
  canvas: 'game-canvas',
  background: 0x111827,
  shadows: true,
  mode: '3d'
});

app.setLighting({
  ambient: 0.2,
  sunPosition: [10, 20, 10],
  sunIntensity: 1.5,
  sunColor: 0xffedd5
});

// Setup scene geometry
app.createBox({ size: [20, 1, 20], position: [0, -0.5, 0], color: 0x374151 });
app.createBox({ size: [1, 2, 1], position: [0, 1, 0], color: 0x3b82f6 }); // Hero
app.createBox({ size: [1.5, 2.5, 1.5], position: [5, 1.25, 5], color: 0xef4444 }); // Enemy

app.camera.position.set(0, 10, 20);
app.camera.lookAt(0, 0, 0);

// Cinematic bars
const barTop = document.getElementById('bar-top')!;
const barBottom = document.getElementById('bar-bottom')!;

function setCinematicBars(active: boolean) {
  if (active) {
    barTop.classList.add('active');
    barBottom.classList.add('active');
  } else {
    barTop.classList.remove('active');
    barBottom.classList.remove('active');
  }
}

app.start();

// Launch the Cutscene Script
app.cutscene.play(async (ctx) => {
  setCinematicBars(true);
  
  // 1. Slow Pan in
  await ctx.moveCamera([0, 3, 8], 3.0);
  await ctx.lookAt([0, 1, 0], 1.5);
  
  // 2. Dialogue Sequence
  await ctx.showDialogue("It's quiet...", 2.0);
  await ctx.wait(0.5);
  await ctx.showDialogue("Too quiet.", 2.0);
  
  // 3. Action snap to enemy
  // Use Promise.all to do camera move and lookAt simultaneously
  await Promise.all([
    ctx.moveCamera([8, 2, 8], 0.8),
    ctx.lookAt([5, 1.25, 5], 0.8)
  ]);
  
  ctx.shakeCamera(0.5, 1.5, 0.8);
  await ctx.showDialogue("ROAARRRR!", 1.5);
  
  // Flash screen
  ctx.flashScreen('#ff0000', 800);
  
  // 4. Dramatic Zoom Out
  await Promise.all([
    ctx.moveCamera([2.5, 15, 20], 2.0),
    ctx.lookAt([2.5, 0, 2.5], 2.0)
  ]);
  
  // Fade to black
  await ctx.fadeScreen(1.0, '#000000', 1000);
  await ctx.wait(0.5);
  await ctx.fadeScreen(0.0, '#000000', 1000);
  
  setCinematicBars(false);
  app.ui.showToast("Cutscene Ended. Player gains control!", 4000, 'success');
}).catch(e => {
  console.log("Cutscene aborted");
  setCinematicBars(false);
});

// Allow skipping by pressing ESC
window.addEventListener('keydown', (e) => {
  if (e.code === 'Escape' || e.code === 'Enter' || e.code === 'Space') {
    if (app.cutscene.isPlaying) {
      app.cutscene.skip();
    }
  }
});
