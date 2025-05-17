import document from "document";

let score = 0;
let xInit: number;
let yInit: number;
let board = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];

const scoreElement = document.getElementById("score") as TextElement;
const boardElement = document.getElementById("board") as ContainerElement;
const overlayElement = document.getElementById("overlay") as RectElement;
const overlayTextElement = document.getElementById("overlay-text") as TextElement;

setTwo();
setTwo();

boardElement.onmousedown = function (event) {
  xInit = event.screenX;
  yInit = event.screenY;
};

boardElement.onmouseup = function (event) {
  const boardInit = JSON.parse(JSON.stringify(board)); // JSON method for deep copy
  const xDelta = event.screenX - xInit;
  const yDelta = event.screenY - yInit; // note that since coords are from top-left corner of screen, the sign of yDelta is basically flipped
  const swipeAngle = Math.atan2(yDelta, xDelta); // range (-PI, PI] incl. PI

  if (swipeAngle >= (3 * Math.PI) / 4 || swipeAngle < (-3 * Math.PI) / 4) {
    console.log("Swipe Direction: Left");
    for (let r = 0; r < 4; r++) {
      let row = board[r];
      row = slide(row);
      board[r] = row;
      for (let c = 0; c < 4; c++) {
        updateTile(r, c);
      }
    }
  } else if (swipeAngle >= -Math.PI / 4 && swipeAngle < Math.PI / 4) {
    console.log("Swipe Direction: Right");
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
    console.log("Swipe Direction: Up");
    for (let c = 0; c < 4; c++) {
      let column = [board[0][c], board[1][c], board[2][c], board[3][c]];
      column = slide(column);
      for (let r = 0; r < 4; r++) {
        board[r][c] = column[r];
        updateTile(r, c);
      }
    }
  } else if (swipeAngle >= Math.PI / 4 && swipeAngle < (3 * Math.PI) / 4) {
    console.log("Swipe Direction: Down");
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
  scoreElement.text = "SCORE: " + score;

  // Check if game over
  if (isGameOver()) {
    console.log("Game Over!");
    overlayElement.style.display = "inline";
    overlayTextElement.layer = 2;
  }
};

function isGameOver() {
  if (hasEmptyTile()) {
    return false;
  } else {
    for (let r = 0; r < 4; r++) {
      let row = board[r];
      for (let c = 1; c < 4; c++) {
        if (row[c] === row[c - 1]) {
          return false;
        }
      }
    }

    for (let c = 0; c < 4; c++) {
      let column = [board[0][c], board[1][c], board[2][c], board[3][c]];
      for (let r = 1; r < 4; r++) {
        if (column[r] === column[r - 1]) {
          return false;
        }
      }
    }
    return true;
  }
}

function slide(rowOrColumn: number[]) {
  // Remove 0s: [0, 2, 2, 4] -> [2, 2, 4]
  rowOrColumn = rowOrColumn.filter((num) => num !== 0);

  // Combine same numbers: [2, 2, 4] -> [4, 0, 4]
  for (let i = 0; i < rowOrColumn.length - 1; i++) {
    if (rowOrColumn[i] === rowOrColumn[i + 1]) {
      rowOrColumn[i] *= 2;
      rowOrColumn[i + 1] = 0;
      score += rowOrColumn[i];
      console.log("Score: " + score);
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
      tileTextElement.style.fontSize = 40;
      break;
    case 2:
      tileElement.style.fill = "#eee4da";
      tileTextElement.style.fill = "#776e65";
      tileTextElement.style.fontSize = 40;
      break;
    case 4:
      tileElement.style.fill = "#eee1c9";
      tileTextElement.style.fill = "#776e65";
      tileTextElement.style.fontSize = 40;
      break;
    case 8:
      tileElement.style.fill = "#f3b27a";
      tileTextElement.style.fill = "#f9f6f2";
      tileTextElement.style.fontSize = 40;
      break;
    case 16:
      tileElement.style.fill = "#f69664";
      tileTextElement.style.fill = "#f9f6f2";
      tileTextElement.style.fontSize = 40;
      break;
    case 32:
      tileElement.style.fill = "#f77c5f";
      tileTextElement.style.fill = "#f9f6f2";
      tileTextElement.style.fontSize = 40;
      break;
    case 64:
      tileElement.style.fill = "#f65d3b";
      tileTextElement.style.fill = "#f9f6f2";
      tileTextElement.style.fontSize = 40;
      break;
    case 128:
      tileElement.style.fill = "#edce71";
      tileTextElement.style.fill = "#f9f6f2";
      tileTextElement.style.fontSize = 30;
      break;
    case 256:
      tileElement.style.fill = "#edcc63";
      tileTextElement.style.fill = "#f9f6f2";
      tileTextElement.style.fontSize = 30;
      break;
    case 512:
      tileElement.style.fill = "#edc651";
      tileTextElement.style.fill = "#f9f6f2";
      tileTextElement.style.fontSize = 30;
      break;
    case 1024:
      tileElement.style.fill = "#eec744";
      tileTextElement.style.fill = "#f9f6f2";
      tileTextElement.style.fontSize = 20;
      break;
    case 2048:
      tileElement.style.fill = "#ecc230";
      tileTextElement.style.fill = "#f9f6f2";
      tileTextElement.style.fontSize = 20;
      break;
    case 4096:
      tileElement.style.fill = "#fe3d3d";
      tileTextElement.style.fill = "#f9f6f2";
      tileTextElement.style.fontSize = 20;
      break;
    case 8192:
      tileElement.style.fill = "#ff2020";
      tileTextElement.style.fill = "#f9f6f2";
      tileTextElement.style.fontSize = 20;
  }
}

function setTwo() {
  if (!hasEmptyTile()) {
    return;
  }

  let found = false;
  while (!found) {
    // find random row and column to place a 2 in
    const r = Math.floor(Math.random() * 4);
    const c = Math.floor(Math.random() * 4);

    // check if tile is empty
    if (board[r][c] === 0) {
      board[r][c] = 2;
      updateTile(r, c);
      found = true;
    }
  }
}

function hasEmptyTile() {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      // at least one zero in the board
      if (board[r][c] === 0) {
        return true;
      }
    }
  }
  return false;
}
