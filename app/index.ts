import document from "document";
import * as fs from "fs";
import { vibration } from "haptics";

let xInit: number;
let yInit: number;
let timeoutID: number;

let score: number;
let best: number;
let board: number[][];

const swipeSensitivity: number = 30;

const scoreElement = document.getElementById("score") as TextElement;
const bestElement = document.getElementById("best") as TextElement;
const swipeInterfaceElement = document.getElementById("swipe-interface") as RectElement;
const overlayElement = document.getElementById("overlay") as RectElement;
const overlayTextElement = document.getElementById("overlay-text") as TextElement;
const resumeTextElement = document.getElementById("resume-text") as TextElement;
const resumeButtonElement = document.getElementById("resume-button") as RectElement;
const restartTextElement = document.getElementById("restart-text") as TextElement;
const restartButtonElement = document.getElementById("restart-button") as RectElement;

loadGame();
saveGame();

//   fs.unlinkSync("saveState.txt");

restartTextElement.addEventListener("click", (event) => {
  console.log("Click restartTextElement");
  restartGame();
});

restartButtonElement.addEventListener("click", (event) => {
  console.log("Click restartButtonElement");
  restartGame();
});

resumeTextElement.addEventListener("click", (event) => {
  console.log("Click resumeTextElement");
  unloadSettings();
});

resumeButtonElement.addEventListener("click", (event) => {
  console.log("Click resumeButtonElement");
  unloadSettings();
});

swipeInterfaceElement.addEventListener("mousedown", (event) => {
  console.log("Mousedown swipeInterfaceElement");
  xInit = event.screenX;
  yInit = event.screenY;
  timeoutID = setTimeout(loadSettings, 1000);
});

swipeInterfaceElement.addEventListener("mouseup", (event) => {
  console.log("Mouseup swipeInterfaceElement");
  const boardInit = JSON.parse(JSON.stringify(board)); // JSON method for deep copy
  const xDelta = event.screenX - xInit;
  const yDelta = event.screenY - yInit; // note that since coords are from top-left corner of screen, the sign of yDelta is basically flipped
  const swipeAngle = Math.atan2(yDelta, xDelta); // range (-PI, PI] incl. PI

  clearTimeout(timeoutID);

  console.log("Swipe Vector: (" + xDelta + ", " + yDelta + ")");
  if (Math.abs(xDelta) >= swipeSensitivity || Math.abs(yDelta) >= swipeSensitivity) {
    if (swipeAngle >= (3 * Math.PI) / 4 || swipeAngle < (-3 * Math.PI) / 4) {
      console.log("Swipe Left");
      for (let r = 0; r < 4; r++) {
        let row = board[r];
        row = slide(row);
        board[r] = row;
        for (let c = 0; c < 4; c++) {
          updateTile(r, c);
        }
      }
    } else if (swipeAngle >= -Math.PI / 4 && swipeAngle < Math.PI / 4) {
      console.log("Swipe Right");
      for (let r = 0; r < 4; r++) {
        let row = board[r];
        row.reverse();
        row = slide(row);
        board[r] = row.reverse();
        for (let c = 0; c < 4; c++) {
          updateTile(r, c);
        }
      }
    } else if (swipeAngle >= (-3 * Math.PI) / 4 && swipeAngle < -Math.PI / 4) {
      console.log("Swipe Up");
      for (let c = 0; c < 4; c++) {
        let column = [board[0][c], board[1][c], board[2][c], board[3][c]];
        column = slide(column);
        for (let r = 0; r < 4; r++) {
          board[r][c] = column[r];
          updateTile(r, c);
        }
      }
    } else if (swipeAngle >= Math.PI / 4 && swipeAngle < (3 * Math.PI) / 4) {
      console.log("Swipe Down");
      for (let c = 0; c < 4; c++) {
        let column = [board[0][c], board[1][c], board[2][c], board[3][c]];
        column.reverse();
        column = slide(column);
        column.reverse();
        for (let r = 0; r < 4; r++) {
          board[r][c] = column[r];
          updateTile(r, c);
        }
      }
    }

    // Add 2 if board is different
    if (JSON.stringify(board) !== JSON.stringify(boardInit)) {
      setTwo();
    }

    // Update score on screen
    console.log("Score: " + score + ", Best: " + best);
    scoreElement.text = "SCORE: " + score;
    bestElement.text = "BEST: " + best;

    // Check if game over
    if (isGameOver()) {
      loadGameOver();
    }
  }
});

function isGameOver() {
  if (hasEmptyTile()) {
    console.log("hasEmptyTile");
    return false;
  } else {
    for (let r = 0; r < 4; r++) {
      let row = board[r];
      for (let c = 1; c < 4; c++) {
        if (row[c] === row[c - 1] || row[c] === 2048) {
          console.log("Same number horizontally adjacent or 2048 exists");
          return false;
        }
      }
    }

    for (let c = 0; c < 4; c++) {
      let column = [board[0][c], board[1][c], board[2][c], board[3][c]];
      for (let r = 1; r < 4; r++) {
        if (column[r] === column[r - 1]) {
          console.log("Same number vertically adjacent");
          return false;
        }
      }
    }
    console.log("isGameOver");
    return true;
  }
}

function loadGameOver() {
  console.log("loadGameOver");
  vibration.start("nudge-max");

  overlayElement.style.fill = "#fcf8ed";
  overlayTextElement.text = "Game over!";
  overlayTextElement.style.fill = "#7e6e62";

  overlayElement.layer = 1;
  overlayTextElement.layer = 2;
  restartTextElement.layer = 3;
  restartButtonElement.layer = 2;
}

function slide(rowOrColumn: number[]) {
  // Remove 0s: [0, 2, 2, 4] -> [2, 2, 4]
  console.log("Slide " + rowOrColumn);
  rowOrColumn = rowOrColumn.filter((num) => num !== 0);

  // Combine same numbers: [2, 2, 4] -> [4, 0, 4]
  for (let i = 0; i < rowOrColumn.length - 1; i++) {
    if (rowOrColumn[i] === rowOrColumn[i + 1]) {
      rowOrColumn[i] *= 2;
      rowOrColumn[i + 1] = 0;
      score += rowOrColumn[i];
      if (score > best) {
        best = score;
      }
    }
  }

  // Remove 0s again: [4, 0, 4] -> [4, 4]
  rowOrColumn = rowOrColumn.filter((num) => num !== 0);

  // Append 0s: [4, 4] -> [4, 4, 0, 0]
  while (rowOrColumn.length < 4) {
    rowOrColumn.push(0);
  }

  return rowOrColumn;
}

function updateTile(r: number, c: number) {
  const tileElement = document.getElementById("tile-" + r.toString() + "-" + c.toString()) as RectElement;
  const tileTextElement = document.getElementById("text-" + r.toString() + "-" + c.toString()) as TextElement;
  tileTextElement.text = board[r][c].toString();

  switch (board[r][c]) {
    case 0:
      tileElement.style.fill = "#cdc1b4";
      tileTextElement.style.fill = "#cdc1b4";
      tileTextElement.style.fontSize = 30;
      tileTextElement.y = 77 + r * 68;
      break;
    case 2:
      tileElement.style.fill = "#eee4da";
      tileTextElement.style.fill = "#7e6e62";
      tileTextElement.style.fontSize = 30;
      tileTextElement.y = 77 + r * 68;
      break;
    case 4:
      tileElement.style.fill = "#eddfc4";
      tileTextElement.style.fill = "#7e6e62";
      tileTextElement.style.fontSize = 30;
      tileTextElement.y = 77 + r * 68;
      break;
    case 8:
      tileElement.style.fill = "#f4b17a";
      tileTextElement.style.fill = "#fcf8ed";
      tileTextElement.style.fontSize = 30;
      tileTextElement.y = 77 + r * 68;
      break;
    case 16:
      tileElement.style.fill = "#f79663";
      tileTextElement.style.fill = "#fcf8ed";
      tileTextElement.style.fontSize = 30;
      tileTextElement.y = 77 + r * 68;
      break;
    case 32:
      tileElement.style.fill = "#f67d62";
      tileTextElement.style.fill = "#fcf8ed";
      tileTextElement.style.fontSize = 30;
      tileTextElement.y = 77 + r * 68;
      break;
    case 64:
      tileElement.style.fill = "#f1633f";
      tileTextElement.style.fill = "#fcf8ed";
      tileTextElement.style.fontSize = 30;
      tileTextElement.y = 77 + r * 68;
      break;
    case 128:
      tileElement.style.fill = "#edce73";
      tileTextElement.style.fill = "#fcf8ed";
      tileTextElement.style.fontSize = 24;
      tileTextElement.y = 74 + r * 68;
      break;
    case 256:
      tileElement.style.fill = "#edca64";
      tileTextElement.style.fill = "#fcf8ed";
      tileTextElement.style.fontSize = 24;
      tileTextElement.y = 74 + r * 68;
      break;
    case 512:
      tileElement.style.fill = "#ecc658";
      tileTextElement.style.fill = "#fcf8ed";
      tileTextElement.style.fontSize = 24;
      tileTextElement.y = 74 + r * 68;
      break;
    case 1024:
      tileElement.style.fill = "#edc74c";
      tileTextElement.style.fill = "#fcf8ed";
      tileTextElement.style.fontSize = 20;
      tileTextElement.y = 73 + r * 68;
      break;
    case 2048:
      tileElement.style.fill = "#edc53f";
      tileTextElement.style.fill = "#fcf8ed";
      tileTextElement.style.fontSize = 20;
      tileTextElement.y = 73 + r * 68;

      console.log("You win!");
      vibration.start("nudge-max");

      overlayElement.style.fill = "#edc53f";
      overlayTextElement.text = "You win!";
      overlayTextElement.style.fill = "#fcf8ed";

      overlayElement.layer = 1;
      overlayTextElement.layer = 2;
      restartTextElement.layer = 3;
      restartButtonElement.layer = 2;
      break;
  }
}

function setTwo() {
  if (hasEmptyTile()) {
    let found = false;
    while (!found) {
      // find random row and column to place a 2 in
      const r = Math.floor(Math.random() * 4);
      const c = Math.floor(Math.random() * 4);

      // check if tile is empty
      if (board[r][c] === 0) {
        console.log("setTwo");
        board[r][c] = 2;
        updateTile(r, c);
        saveGame();
        found = true;
      }
    }
  }
}

function hasEmptyTile() {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      // at least one zero in the board
      if (board[r][c] === 0) {
        console.log("hasEmptyTile");
        return true;
      }
    }
  }
  console.log("!hasEmptyTile");
  return false;
}

function loadSettings() {
  console.log("Load Settings");
  vibration.start("confirmation");

  overlayElement.style.fill = "#fcf8ed";

  overlayElement.layer = 1;
  resumeTextElement.layer = 3;
  resumeButtonElement.layer = 2;
  restartTextElement.layer = 3;
  restartButtonElement.layer = 2;
}

function unloadSettings() {
  console.log("Unload Settings");
  vibration.start("bump");

  overlayElement.layer = 0;
  resumeTextElement.layer = 0;
  resumeButtonElement.layer = 0;
  restartTextElement.layer = 0;
  restartButtonElement.layer = 0;
}

function restartGame() {
  console.log("restart");
  unloadSettings();

  overlayTextElement.layer = 0;
  score = 0;
  board = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  setTwo();
  setTwo();

  saveGame();
  loadGame();
}

function saveGame() {
  console.log("Saving to saveState.txt");
  let saveState = {
    "score": score,
    "best": best,
    "board": board,
  };
  fs.writeFileSync("saveState.txt", saveState, "json");
  console.log("Saved to saveState.txt");
}

function loadGame() {
  if (fs.existsSync("/private/data/saveState.txt")) {
    // Read saveState.txt
    console.log("Reading saveState.txt");
    let saveState = fs.readFileSync("saveState.txt", "json");

    // Load score and board
    score = saveState.score;
    console.log("Loaded Score: " + saveState.score);
    best = saveState.best;
    console.log("Loaded Best: " + saveState.best);
    board = saveState.board;
    console.log("Loaded Board: " + saveState.board);

    // Check if game over
    if (isGameOver()) {
      loadGameOver();
    }
  } else {
    console.log("saveState.txt does not exist");
    score = 0;
    best = 0;
    board = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];

    setTwo();
    setTwo();
  }

  // Update score on screen
  console.log("Score: " + score + ", Best: " + best);
  scoreElement.text = "SCORE: " + score;
  bestElement.text = "BEST: " + best;

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      updateTile(r, c);
    }
  }
}
