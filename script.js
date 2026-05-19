const boardElement = document.getElementById("board");
const shuffleButton = document.getElementById("shuffleButton");
const resetButton = document.getElementById("resetButton");
const statusElement = document.getElementById("status");
const movesElement = document.getElementById("moves");
const timerElement = document.getElementById("timer");
const difficultySelect = document.getElementById("difficulty");
const recordsListElement = document.getElementById("recordsList");

let size = 3;
let tiles = [];
let moves = 0;
let timerInterval = null;
let seconds = 0;
let isGameRunning = false;

// Инициализация
function init() {
  size = parseInt(difficultySelect.value);
  createTiles();
  renderBoard();
  resetTimer();
  moves = 0;
  movesElement.textContent = "0";
  statusElement.textContent = "Играем...";
  statusElement.classList.remove("solved");
  isGameRunning = true;
}

function createTiles() {
  tiles = Array.from({ length: size * size }, (_, index) => index);
}

function renderBoard() {
  boardElement.innerHTML = "";
  boardElement.className = `board size-${size}`;
  tiles.forEach((value, index) => {
    const tile = document.createElement("div");
    tile.className = value === 0 ? "tile empty" : "tile";
    tile.textContent = value === 0 ? "" : value;
    tile.addEventListener("click", () => onTileClick(index));
    boardElement.appendChild(tile);
  });
}

function getNeighbors(index) {
  const row = Math.floor(index / size);
  const col = index % size;
  return [
    { row: row - 1, col }, // вверх
    { row: row + 1, col }, // вниз
    { row, col: col - 1 }, // влево
    { row, col: col + 1 }, // вправо
  ]
    .filter(({ row, col }) => row >= 0 && row < size && col >= 0 && col < size)
    .map(({ row, col }) => row * size + col);
}

function onTileClick(index) {
  if (!isGameRunning) return;

  const emptyIndex = tiles.indexOf(0);
  if (getNeighbors(index).includes(emptyIndex)) {
    [tiles[index], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[index]];
    moves++;
    movesElement.textContent = moves;
    renderBoard();

    if (isSolved()) {
      solveGame();
    }
  }
}

function isSolved() {
  return tiles.every((value, index) => value === index);
}

function solveGame() {
  isGameRunning = false;
  clearInterval(timerInterval);
  statusElement.textContent = `✅ Пазл собран за ${moves} ходов!`;
  statusElement.classList.add("solved");
  
  // Сохранение рекорда
  saveRecord(size, moves, seconds);
  displayRecords();
}

function shuffleTiles() {
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
  // Проверка: если случайно собралось, перемешиваем ещё раз
  if (isSolved()) shuffleTiles();
}

// Таймер
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    seconds++;
    updateTimerDisplay();
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  seconds = 0;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  timerElement.textContent = `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Рекорды
function saveRecord(gameSize, gameMove, gameSeconds) {
  const records = JSON.parse(localStorage.getItem("puzzleRecords") || "{}");
  const key = `size${gameSize}`;
  
  if (!records[key] || gameMove < records[key].moves) {
    records[key] = { moves: gameMove, time: gameSeconds, date: new Date().toLocaleDateString() };
    localStorage.setItem("puzzleRecords", JSON.stringify(records));
  }
}

function displayRecords() {
  const records = JSON.parse(localStorage.getItem("puzzleRecords") || "{}");
  recordsListElement.innerHTML = "";

  if (Object.keys(records).length === 0) {
    recordsListElement.innerHTML = '<div class="records-empty">Нет рекордов</div>';
    return;
  }

  [3, 4, 5].forEach((sz) => {
    const key = `size${sz}`;
    if (records[key]) {
      const record = records[key];
      const item = document.createElement("div");
      item.className = "record-item";
      item.innerHTML = `
        <span class="record-level">${sz}×${sz}</span>
        <span class="record-stats">${record.moves} ходов • ${Math.floor(record.time / 60)}:${(record.time % 60).toString().padStart(2, "0")}</span>
      `;
      recordsListElement.appendChild(item);
    }
  });
}

// События
shuffleButton.addEventListener("click", () => {
  shuffleTiles();
  renderBoard();
  moves = 0;
  movesElement.textContent = "0";
  resetTimer();
  startTimer();
  statusElement.textContent = "Играем...";
  statusElement.classList.remove("solved");
  isGameRunning = true;
});

resetButton.addEventListener("click", () => {
  init();
  shuffleTiles();
  renderBoard();
  startTimer();
});

difficultySelect.addEventListener("change", () => {
  init();
  shuffleTiles();
  renderBoard();
  startTimer();
});

// Инициализация при загрузке
init();
shuffleTiles();
renderBoard();
displayRecords();
startTimer();
