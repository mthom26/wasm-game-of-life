import { Universe, Cell } from 'wasm-game-of-life';
import { memory } from 'wasm-game-of-life/wasm_game_of_life_bg';

const universe = Universe.new();
const width = universe.get_width();
const height = universe.get_height();

const CELL_SIZE = 5;
const GRID_COLOR = '#cccccc';
const ALIVE_COLOR = '#121212';
const DEAD_COLOR = '#f2f2f2';

const canvas = document.getElementById("game-of-life-canvas");
canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;
const ctx = canvas.getContext('2d');

canvas.addEventListener('click', (event) => {
  const boundingRect = canvas.getBoundingClientRect();
  
  const scaleX = canvas.width / boundingRect.width;
  const scaleY = canvas.height / boundingRect.height;

  const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
  const canvasTop = (event.clientY - boundingRect.top) * scaleY;

  const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1);
  const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1);

  universe.toggle_cell(row, col);

  drawGrid();
  drawCells();
});

const playPauseButton = document.getElementById("play-pause-button");
const oneTickButton = document.getElementById("render-one-tick-button");

playPauseButton.addEventListener('click', (event) => {
  isPaused() ? play() : pause();
});

oneTickButton.addEventListener('click', (event) => {
  renderOneTick();
});

let animationId = null;
// Render 
const renderLoop = () => {
  // debugger;
  universe.tick();
  drawGrid();
  drawCells();
  animationId = requestAnimationFrame(renderLoop);
};

const renderOneTick = () => {
  universe.tick();
  drawGrid();
  drawCells();
};

// Playback controls
const isPaused = () => {
  return animationId === null;
};

const play = () => {
  console.log('playing');
  playPauseButton.textContent = 'pause';
  renderLoop();
};

const pause = () => {
  console.log('paused')
  playPauseButton.textContent = 'play';
  cancelAnimationFrame(animationId);
  animationId = null;
};

// Draw Grid
const drawGrid = () => {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

  // Vertical
  for (let i = 0; i <= width; i++) {
    ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
    ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
  }

  // Horizontal
  for (let j = 0; j <= height; j++) {
    ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
    ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
  }

  ctx.stroke();
};

// Draw Cells
const getIndex = (row, column) => {
  return row * width + column;
};

const drawCells = () => {
  const cellsPtr = universe.get_cells();
  const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

  ctx.beginPath();

  for (let row = 0; row <= height; row++) {
    for (let col = 0; col <= width; col++) {
      const idx = getIndex(row, col);

      ctx.fillStyle = cells[idx] === Cell.Dead ? DEAD_COLOR : ALIVE_COLOR;

      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }

  ctx.stroke();
};

// Initial Render and setup draws the initial universe and leaves the game in
// a paused state
playPauseButton.textContent = 'play';
drawGrid();
drawCells();
