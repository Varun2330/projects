const grid = document.querySelector(".grid");
const startButton = document.getElementById("start-button");
const container = document.querySelector(".container");
const coverScreen = document.querySelector(".cover-screen");
const result = document.getElementById("result");
const overText = document.getElementById("over-text");

let matrix, score, isSwiped, touchY, initialY = 0, touchX, initialX = 0, rows = 4, columns = 4, swipeDirection;

// Cache bounding rectangle
const rect = grid.getBoundingClientRect();
const rectLeft = rect.left;
const rectTop = rect.top;

const getXY = (e) => {
  touchX = e.touches[0].pageX - rectLeft;
  touchY = e.touches[0].pageY - rectTop;
};

const createGrid = () => {
  grid.innerHTML = ''; // Clear grid before creating new cells
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      const boxDiv = document.createElement("div");
      boxDiv.classList.add("box");
      boxDiv.setAttribute("data-position", `${i}_${j}`);
      grid.appendChild(boxDiv);
    }
  }
};

const adjacentCheck = (arr) => arr.some((_, i) => arr[i] === arr[i + 1]);

const possibleMovesCheck = () => {
  // Check for adjacent cells in rows and columns
  return matrix.some(row => adjacentCheck(row)) ||
         matrix[0].some((_, col) => adjacentCheck(matrix.map(row => row[col])));
};

const randomPosition = (arr) => Math.floor(Math.random() * arr.length);

const hasEmptyBox = () => matrix.flat().includes(0);

const gameOverCheck = () => {
  if (!possibleMovesCheck()) {
    coverScreen.classList.remove("hide");
    container.classList.add("hide");
    overText.classList.remove("hide");
    result.innerText = `Final score: ${score}`;
    startButton.innerText = "Restart Game";
  }
};

const generateNumber = (value) => {
  if (hasEmptyBox()) {
    let randomRow = randomPosition(matrix);
    let randomCol = randomPosition(matrix[randomRow]);
    if (matrix[randomRow][randomCol] === 0) {
      matrix[randomRow][randomCol] = value;
      let element = document.querySelector(`[data-position='${randomRow}_${randomCol}']`);
      element.innerHTML = value;
      element.classList.add(`box-${value}`);
    } else {
      generateNumber(value);
    }
  } else {
    gameOverCheck();
  }
};

const removeZero = (arr) => arr.filter(num => num);

const checker = (arr, reverseArr = false) => {
  arr = removeZero(arr);
  if (reverseArr) arr.reverse();

  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      arr[i + 1] = 0;
      score += arr[i];
    }
  }

  arr = removeZero(arr);
  while (arr.length < 4) {
    reverseArr ? arr.unshift(0) : arr.push(0);
  }
  if (reverseArr) arr.reverse();

  return arr;
};

const slide = (direction, reverse = false) => {
  for (let i = 0; i < (direction === 'left' || direction === 'right' ? rows : columns); i++) {
    let num = [];
    for (let j = 0; j < (direction === 'left' || direction === 'right' ? columns : rows); j++) {
      num.push(matrix[direction === 'left' || direction === 'right' ? i : j][direction === 'left' || direction === 'right' ? j : i]);
    }
    num = checker(num, reverse);
    for (let j = 0; j < (direction === 'left' || direction === 'right' ? columns : rows); j++) {
      matrix[direction === 'left' || direction === 'right' ? i : j][direction === 'left' || direction === 'right' ? j : i] = num[j];
      let element = document.querySelector(`[data-position='${direction === 'left' || direction === 'right' ? i : j}_${direction === 'left' || direction === 'right' ? j : i}']`);
      element.innerHTML = matrix[direction === 'left' || direction === 'right' ? i : j][direction === 'left' || direction === 'right' ? j : i] || "";
      element.className = `box box-${matrix[direction === 'left' || direction === 'right' ? i : j][direction === 'left' || direction === 'right' ? j : i]}`;
    }
  }

  setTimeout(() => {
    Math.random() > 0.5 ? generateNumber(4) : generateNumber(2);
  }, 200);
};

document.addEventListener("keyup", (e) => {
  const directions = {
    ArrowLeft: () => slide('left'),
    ArrowRight: () => slide('right'),
    ArrowUp: () => slide('up', true),
    ArrowDown: () => slide('down', true),
  };
  if (directions[e.code]) {
    directions[e.code]();
    document.getElementById("score").innerText = score;
  }
});

grid.addEventListener("touchstart", (event) => {
  isSwiped = true;
  getXY(event);
  initialX = touchX;
  initialY = touchY;
});

grid.addEventListener("touchmove", (event) => {
  if (isSwiped) {
    getXY(event);
    const diffX = touchX - initialX;
    const diffY = touchY - initialY;
    swipeDirection = Math.abs(diffY) > Math.abs(diffX) ? (diffY > 0 ? "down" : "up") : (diffX > 0 ? "right" : "left");
  }
});

grid.addEventListener("touchend", () => {
  isSwiped = false;
  const swipeCalls = {
    up: () => slide('up', true),
    down: () => slide('down', true),
    left: () => slide('left'),
    right: () => slide('right'),
  };
  if (swipeCalls[swipeDirection]) {
    swipeCalls[swipeDirection]();
    document.getElementById("score").innerText = score;
  }
});

const startGame = () => {
  score = 0;
  document.getElementById("score").innerText = score;
  matrix = Array.from({ length: rows }, () => Array(columns).fill(0));
  container.classList.remove("hide");
  coverScreen.classList.add("hide");
  createGrid();
  generateNumber(2);
  generateNumber(2);
};

startButton.addEventListener("click", startGame);
