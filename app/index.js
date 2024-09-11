import * as document from "document";
import { SwipeDetector, GestureType, GestureDirection } from "fitbit-gestures";

var board;
var score = 0;
var rows = 4;
var columns = 4;

board = [
	[0, 0, 0, 0],
	[0, 0, 0, 0],
	[0, 0, 0, 0],
	[0, 0, 0, 0]
]

setTwo();
setTwo();

function updateTile(tile, num) {
    tile.text = "0";
    //tile.classList.value = ""; //clear the classList
    if (num > 0) {
        tile.text = num.toString();
        if (num <= 4096) {
            //tile.classList.add("x"+num.toString());
        } else {
            //tile.classList.add("x8192");
        }                
    }
}

function filterZero(row){
    return row.filter(num => num != 0); //create new array of all nums != 0
}

function slide(row) {
    //[0, 2, 2, 2] 
    row = filterZero(row); //[2, 2, 2]
    for (let i = 0; i < row.length-1; i++){
        if (row[i] == row[i+1]) {
            row[i] *= 2;
            row[i+1] = 0;
            score += row[i];
			console.log(score)
        }
    } //[4, 0, 2]
    row = filterZero(row); //[4, 2]
    //add zeroes
    while (row.length < columns) {
        row.push(0);
    } //[4, 2, 0, 0]
    return row;
}

const swipeConfig = {
	threshold: 10
  }

const swipe = new SwipeDetector("board", onGesture.bind(this), swipeConfig);

function onGesture(event) {
	if (event.type === GestureType.Swipe && event.dir === GestureDirection.Up) {
		console.log("Up")
		for (let r = 0; r < rows; r++) {
			let row = board[r];
			row = slide(row);
			board[r] = row;
			for (let c = 0; c < columns; c++){
				let tile = document.getElementById(r.toString() + "-" + c.toString());
				let num = board[r][c];
				updateTile(tile, num);
			}
		}
		setTwo();
	}
	else if (event.type === GestureType.Swipe && event.dir === GestureDirection.Down) {
		console.log("Down")
		for (let r = 0; r < rows; r++) {
			let row = board[r];         //[0, 2, 2, 2]
			row.reverse();              //[2, 2, 2, 0]
			row = slide(row)            //[4, 2, 0, 0]
			board[r] = row.reverse();   //[0, 0, 2, 4];
			for (let c = 0; c < columns; c++){
				let tile = document.getElementById(r.toString() + "-" + c.toString());
				let num = board[r][c];
				updateTile(tile, num);
			}
		}
		setTwo();
	}
	else if (event.type === GestureType.Swipe && event.dir === GestureDirection.Left) {
		console.log("Left")
		for (let c = 0; c < columns; c++) {
			let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
			row = slide(row);
			// board[0][c] = row[0];
			// board[1][c] = row[1];
			// board[2][c] = row[2];
			// board[3][c] = row[3];
			for (let r = 0; r < rows; r++){
				board[r][c] = row[r];
				let tile = document.getElementById(r.toString() + "-" + c.toString());
				let num = board[r][c];
				updateTile(tile, num);
			}
		}
		setTwo();
	}
	else if (event.type === GestureType.Swipe && event.dir === GestureDirection.Right) {
		console.log("Right")
		for (let c = 0; c < columns; c++) {
			let row = [board[0][c], board[1][c], board[2][c], board[3][c]];
			row.reverse();
			row = slide(row);
			row.reverse();
			// board[0][c] = row[0];
			// board[1][c] = row[1];
			// board[2][c] = row[2];
			// board[3][c] = row[3];
			for (let r = 0; r < rows; r++){
				board[r][c] = row[r];
				let tile = document.getElementById(r.toString() + "-" + c.toString());
				let num = board[r][c];
				updateTile(tile, num);
			}
		}
		setTwo();
	}
	document.getElementById("score").text = score;
}

function setTwo() {
    if (!hasEmptyTile()) {
        return;
    }
    let found = false;
    while (!found) {
        //find random row and column to place a 2 in
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        if (board[r][c] == 0) {
            board[r][c] = 2;
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            tile.text = "2";
			//tile.classList.value = ""; //clear the classList
            //tile.classList.add("x2");
            found = true;
        }
    }
}

function hasEmptyTile() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (board[r][c] == 0) { //at least one zero in the board
                return true;
            }
        }
    }
    return false;
}


