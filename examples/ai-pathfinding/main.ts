import { PathfindingGrid, SequenceNode, SelectorNode, ActionNode, NodeStatus } from '@kairo/ai';
import { Vector3 } from '@kairo/core';

// 1. Grid & State Setup
const GRID_SIZE = 16;
const grid = new PathfindingGrid(GRID_SIZE, GRID_SIZE, 1.0);

// Default obstacles
grid.setObstacle(5, 5, false);
grid.setObstacle(5, 6, false);
grid.setObstacle(5, 7, false);
grid.setObstacle(5, 8, false);
grid.setObstacle(6, 8, false);
grid.setObstacle(7, 8, false);

let startX = 2;
let startZ = 2;
let endX = 13;
let endZ = 13;

let activeToolMode: 'wall' | 'start' | 'end' = 'wall';
let botPos = { x: startX, z: startZ };
let calculatedPath: Vector3[] = [];

// Canvas setup
const canvas = document.getElementById('ai-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

function resizeCanvas() {
  const container = canvas.parentElement!;
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function recalculatePath() {
  const startVec = new Vector3((startX - GRID_SIZE / 2), 0, (startZ - GRID_SIZE / 2));
  const endVec = new Vector3((endX - GRID_SIZE / 2), 0, (endZ - GRID_SIZE / 2));
  calculatedPath = grid.findPath(startVec, endVec);
}
recalculatePath();

// UI Buttons & Tool mode
const modeWallBtn = document.getElementById('mode-wall')!;
const modeStartBtn = document.getElementById('mode-start')!;
const modeEndBtn = document.getElementById('mode-end')!;
const clearWallsBtn = document.getElementById('btn-clear-walls')!;
const stepAiBtn = document.getElementById('btn-step-ai')!;

function setMode(mode: 'wall' | 'start' | 'end') {
  activeToolMode = mode;
  [modeWallBtn, modeStartBtn, modeEndBtn].forEach(btn => btn.classList.remove('active'));
  if (mode === 'wall') modeWallBtn.classList.add('active');
  if (mode === 'start') modeStartBtn.classList.add('active');
  if (mode === 'end') modeEndBtn.classList.add('active');
}

modeWallBtn.onclick = () => setMode('wall');
modeStartBtn.onclick = () => setMode('start');
modeEndBtn.onclick = () => setMode('end');

clearWallsBtn.onclick = () => {
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let z = 0; z < GRID_SIZE; z++) {
      grid.setObstacle(x, z, true);
    }
  }
  recalculatePath();
};

let isMouseDown = false;
canvas.addEventListener('mousedown', (e) => {
  isMouseDown = true;
  handleCanvasInput(e);
});
canvas.addEventListener('mousemove', (e) => {
  if (isMouseDown && activeToolMode === 'wall') {
    handleCanvasInput(e);
  }
});
window.addEventListener('mouseup', () => { isMouseDown = false; });

function handleCanvasInput(e: MouseEvent) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const minDim = Math.min(canvas.width, canvas.height) * 0.85;
  const offsetX = (canvas.width - minDim) / 2;
  const offsetY = (canvas.height - minDim) / 2;
  const cellSize = minDim / GRID_SIZE;

  const gx = Math.floor((mouseX - offsetX) / cellSize);
  const gz = Math.floor((mouseY - offsetY) / cellSize);

  if (gx >= 0 && gx < GRID_SIZE && gz >= 0 && gz < GRID_SIZE) {
    if (activeToolMode === 'wall') {
      if ((gx !== startX || gz !== startZ) && (gx !== endX || gz !== endZ)) {
        const isWalkable = grid.nodes[gx][gz].walkable;
        grid.setObstacle(gx, gz, !isWalkable);
      }
    } else if (activeToolMode === 'start') {
      startX = gx;
      startZ = gz;
      botPos = { x: startX, z: startZ };
    } else if (activeToolMode === 'end') {
      endX = gx;
      endZ = gz;
    }
    recalculatePath();
  }
}

// Behavior Tree Setup & Monitor
const btContainer = document.getElementById('bt-container')!;
let btLastResult = 'RUNNING';

const blackboard = new Map<string, any>();
const behaviorTree = new SelectorNode([
  new SequenceNode([
    new ActionNode((bb) => {
      const dx = botPos.x - endX;
      const dz = botPos.z - endZ;
      const dist = Math.sqrt(dx * dx + dz * dz);
      return dist === 0 ? NodeStatus.Success : NodeStatus.Failure;
    }),
    new ActionNode(() => {
      return NodeStatus.Success;
    })
  ]),
  new ActionNode(() => {
    if (calculatedPath.length > 1) {
      // Step bot along path
      const nextPt = calculatedPath[1];
      const gx = Math.round(nextPt.x + GRID_SIZE / 2);
      const gz = Math.round(nextPt.z + GRID_SIZE / 2);
      botPos = { x: gx, z: gz };
      startX = gx;
      startZ = gz;
      recalculatePath();
      return NodeStatus.Success;
    }
    return NodeStatus.Failure;
  })
]);

stepAiBtn.onclick = () => {
  blackboard.set('botX', botPos.x);
  blackboard.set('botZ', botPos.z);
  btLastResult = behaviorTree.tick(blackboard);
  updateBtUI();
};

function updateBtUI() {
  const dx = botPos.x - endX;
  const dz = botPos.z - endZ;
  const dist = Math.sqrt(dx * dx + dz * dz);
  const atGoal = dist === 0;

  btContainer.innerHTML = `
    <div class="bt-node ${atGoal ? 'success' : 'running'}">
      <div><strong>Selector Node</strong> (Root)</div>
      <div style="font-size: 10px; opacity: 0.8;">Evaluates children until Success</div>
    </div>
    <div class="bt-node ${atGoal ? 'success' : 'failure'}" style="margin-left: 12px;">
      <div><strong>Sequence Node</strong> [Goal Reached]</div>
      <div style="font-size: 10px; color: ${atGoal ? '#34d399' : '#f87171'};">Status: ${atGoal ? 'SUCCESS (At Target)' : 'FAILURE (Not At Target)'}</div>
    </div>
    <div class="bt-node ${!atGoal ? 'success' : 'running'}" style="margin-left: 12px;">
      <div><strong>Action Node</strong> [Move Along Path]</div>
      <div style="font-size: 10px; color: ${!atGoal ? '#34d399' : '#94a3b8'};">Waypoints Left: ${calculatedPath.length}</div>
    </div>
  `;
}
updateBtUI();

// Render Loop
function render() {
  ctx.fillStyle = '#060911';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const minDim = Math.min(canvas.width, canvas.height) * 0.85;
  const offsetX = (canvas.width - minDim) / 2;
  const offsetY = (canvas.height - minDim) / 2;
  const cellSize = minDim / GRID_SIZE;

  // Draw Grid
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let z = 0; z < GRID_SIZE; z++) {
      const px = offsetX + x * cellSize;
      const py = offsetY + z * cellSize;

      const isWalkable = grid.nodes[x][z].walkable;
      ctx.fillStyle = isWalkable ? '#0f172a' : '#334155';
      ctx.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);

      ctx.strokeStyle = '#1e293b';
      ctx.strokeRect(px, py, cellSize, cellSize);
    }
  }

  // Draw Calculated Path
  if (calculatedPath.length > 1) {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    calculatedPath.forEach((pt, i) => {
      const gx = pt.x + GRID_SIZE / 2;
      const gz = pt.z + GRID_SIZE / 2;
      const px = offsetX + gx * cellSize + cellSize / 2;
      const py = offsetY + gz * cellSize + cellSize / 2;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
  }

  // Draw Start (Green)
  const startPx = offsetX + startX * cellSize + cellSize / 2;
  const startPy = offsetY + startZ * cellSize + cellSize / 2;
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(startPx, startPy, cellSize * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Draw End (Red)
  const endPx = offsetX + endX * cellSize + cellSize / 2;
  const endPy = offsetY + endZ * cellSize + cellSize / 2;
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(endPx, endPy, cellSize * 0.35, 0, Math.PI * 2);
  ctx.fill();

  requestAnimationFrame(render);
}
render();
