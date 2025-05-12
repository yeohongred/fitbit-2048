import document from "document";


let score = 0;
let xInit;
let yInit;
const board = [
	[0, 0, 0, 0],
	[0, 0, 0, 0],
	[0, 0, 0, 0],
	[0, 0, 0, 0]];
const rows = 4;
const columns = 4;
let boardElement = document.getElementById("board") as ContainerElement;
let gameOver = document.getElementById("game-over") as RectElement;
let gameOverText = document.getElementById("game-over-text") as TextElement;
let scoreElement = document.getElementById('score') as TextElement;


setTwo();
setTwo();


boardElement.onmousedown = function (event) {
	xInit = event.screenX;
	yInit = event.screenY;
}

boardElement.onmouseup = function (event) {
	let xDelta = event.screenX - xInit;
	let yDelta = event.screenY - yInit;
	let angle = Math.atan2(yDelta, xDelta); // range (-PI, PI] incl. PI
	const boardInit = JSON.parse(JSON.stringify(board))
	if (angle >= -3*Math.PI/4 && angle < -Math.PI/4) {
        console.log('Up');
        for (let r = 0; r < rows; r++) {
            let row = board[r];
            row = slide(row);
            board[r] = row;
            for (let c = 0; c < columns; c++) {
                const tile = document.getElementById('tile-' + r.toString() + '-' + c.toString());
				const text = document.getElementById('text-' + r.toString() + '-' + c.toString());
                const num = board[r][c];
                updateTile(tile, text, num);
            }
        }		
	} else if (angle >= Math.PI/4 && angle < 3*Math.PI/4) {
		console.log('Down');
		for (let r = 0; r < rows; r++) {
			let row = board[r]; // [0, 2, 2, 2]
			row.reverse(); // [2, 2, 2, 0]
			row = slide(row); // [4, 2, 0, 0]
			board[r] = row.reverse(); // [0, 0, 2, 4]
			for (let c = 0; c < columns; c++) {
				const tile = document.getElementById('tile-' + r.toString() + '-' + c.toString());
				const text = document.getElementById('text-' + r.toString() + '-' + c.toString());
                const num = board[r][c];
				updateTile(tile, text, num);
			}
		}		
	} else if (angle >= 3*Math.PI/4 || angle < -3*Math.PI/4) {
		console.log('Left');
		for (let c = 0; c < columns; c++) {
			let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
			row = slide(row);
			// board[0][c] = row[0];
			// board[1][c] = row[1];
			// board[2][c] = row[2];
			// board[3][c] = row[3];
			for (let r = 0; r < rows; r++) {
				board[r][c] = row[r];
				const tile = document.getElementById('tile-' + r.toString() + '-' + c.toString());
				const text = document.getElementById('text-' + r.toString() + '-' + c.toString());
                const num = board[r][c];
				updateTile(tile, text, num);
			}
		}		
	} else if (angle >= -Math.PI/4 && angle < Math.PI/4) {
		console.log('Right');
		for (let c = 0; c < columns; c++) {
			let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
			row.reverse();
			row = slide(row);
			row.reverse();
			// board[0][c] = row[0];
			// board[1][c] = row[1];
			// board[2][c] = row[2];
			// board[3][c] = row[3];
			for (let r = 0; r < rows; r++) {
				board[r][c] = row[r];
				const tile = document.getElementById('tile-' + r.toString() + '-' + c.toString());
				const text = document.getElementById('text-' + r.toString() + '-' + c.toString());
                const num = board[r][c];
				updateTile(tile, text, num);
			}
	 	}		
	}

	if (JSON.stringify(board) !== JSON.stringify(boardInit)) {
		setTwo();
	}
	
	scoreElement.text = 'SCORE: ' + score;
	if (isGameOver(board)) {
		console.log("Game Over!");
		gameOver.style.display = "inline";
		gameOverText.layer = 2;
	}
}


function isGameOver(board) {
	if (!hasEmptyTile()) {
		for (let r = 0; r < rows; r++) {
            let row = board[r];
			for (let c = 1; c < columns; c++) {
				if (row[c] === row[c-1]) {
					return false;
				}
			}
		}
		for (let c = 0; c < columns; c++) {
            let column = [board[0][c], board[1][c], board[2][c], board[3][c]];
			for (let r = 1; r < rows; r++) {
				if (column[r] === column[r-1]) {
					return false;
				}
			}
		}
		return true;
	} else {
		return false;
	}
}


function slide(row) {
	// create new array of all nums != 0
	// [0, 2, 2, 2] -> [2, 2, 2]
	  row = row.filter(num => num !== 0);
	  for (let i = 0; i < row.length - 1; i++) {
		  if (row[i] === row[i + 1]) {
			  row[i] *= 2;
			  row[i + 1] = 0;
			  score += row[i];
			  console.log(score);
		  }
	  }
  
	// create new array of all nums != 0
	// [4, 0, 2] -> [4, 2]
	  row = row.filter(num => num !== 0);
	  // add zeroes
	  while (row.length < columns) {
		  row.push(0);
	  } // [4, 2, 0, 0]
		return row;
}


function updateTile(tile, text, num) {
	text.text = num.toString();
	switch (num) {
		case 0:
			tile.style.fill = "#cdc1b4";
			text.style.fill = "#cdc1b4";
			text.style.fontSize = 40;
			break;
		case 2:
			tile.style.fill = "#eee4da";
			text.style.fill = "#776e65";
			text.style.fontSize = 40;
			break;
		case 4:
			tile.style.fill = "#eee1c9";
			text.style.fill = "#776e65";
			text.style.fontSize = 40;
			break;		
		case 8:
			tile.style.fill = "#f3b27a";
			text.style.fill = "#f9f6f2";
			text.style.fontSize = 40;
			break;	
		case 16:
			tile.style.fill = "#f69664";
			text.style.fill = "#f9f6f2";
			text.style.fontSize = 40;
			break;
		case 32:
			tile.style.fill = "#f77c5f";
			text.style.fill = "#f9f6f2";
			text.style.fontSize = 40;
			break;	
		case 64:
			tile.style.fill = "#f65d3b";
			text.style.fill = "#f9f6f2";
			text.style.fontSize = 40;
			break;	
		case 128:
			tile.style.fill = "#edce71";
			text.style.fill = "#f9f6f2";
			text.style.fontSize = 30;
			break;	
		case 256:
			tile.style.fill = "#edcc63";
			text.style.fill = "#f9f6f2";
			text.style.fontSize = 30;
			break;	
		case 512:
			tile.style.fill = "#edc651";
			text.style.fill = "#f9f6f2";
			text.style.fontSize = 30;
			break;	
		case 1024:
			tile.style.fill = "#eec744";
			text.style.fill = "#f9f6f2";
			text.style.fontSize = 20;
			break;	
		case 2048:
			tile.style.fill = "#ecc230";
			text.style.fill = "#f9f6f2";
			text.style.fontSize = 20;
			break;	
		case 4096:
			tile.style.fill = "#fe3d3d";
			text.style.fill = "#f9f6f2";
			text.style.fontSize = 20;
			break;	
		case 8192:
			tile.style.fill = "#ff2020";
			text.style.fill = "#f9f6f2";
			text.style.fontSize = 20;
	}
}


function setTwo() {
	if (!hasEmptyTile()) {
		return;
	}

	let found = false;
	while (!found) {
		// find random row and column to place a 2 in
		const r = Math.floor(Math.random() * rows);
		const c = Math.floor(Math.random() * columns);
		if (board[r][c] === 0) {
			board[r][c] = 2;
			const tile = document.getElementById('tile-' + r.toString() + '-' + c.toString());
			const text = document.getElementById('text-' + r.toString() + '-' + c.toString());
			const num = board[r][c];
			updateTile(tile, text, num);
			found = true;
		}
	}
}

function hasEmptyTile() {
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < columns; c++) {
			if (board[r][c] === 0) { // at least one zero in the board
				return true
			}
		}
	}
	return false
}