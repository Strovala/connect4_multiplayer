// Board class containing information about
// board representation with integers
// 0-blank 1-first player 2-second player
function Board(height, width) {
  this.height = height;
  this.width = width;
  this.board = this.init();
}

// Creating matrix of integer and filling it with zeros
// (blank spaces)
Board.prototype.init = function init() {
  var mat = new Array(this.height);
  for (var i = 0; i < this.height; i++) {
    mat[i] = new Array(this.width).fill(0);
  }
  return mat;
}

// Coping a board
// Returning new object
Board.prototype.copy = function copy() {
  var boardCopy = new Board(this.height, this.width);
  boardCopy.board = this.copyBoard(this.board);
  return boardCopy;
}

// Coping primitive board given by parameter
// Returning matrix of integer
Board.prototype.copyBoard = function copyBoard(board) {
  var mat = this.init();

  for(var i = 0; i < this.height; i++)
    for(var j = 0; j < this.width; j++)
      mat[i][j] = board[i][j];

  return mat;
}

// Updates the matrix field with row and column
// to player number (1 or 2)
Board.prototype.update = function update(row, column, playerNumber) {
  this.board[row][column] = playerNumber;
}

// Updates the board with column given by move
// to player number (1 or 2)
Board.prototype.play = function play(playerNumber, move) {
  this.update(this.findNext(move), move, playerNumber);
}

// Returns first blank row given by column starting
// from bottom
Board.prototype.findNext = function findNext(columnIndex) {
  for (var rowIndex = this.height-1; rowIndex > -1; rowIndex--) {
    if (this.board[rowIndex][columnIndex] === 0)
      return rowIndex;
    }
  return -1;
}

// Returns list of legal moves (columns)
Board.prototype.legalMoves = function legalMoves() {
  var legal = []
  for (var i = 0; i < this.width; i++) {
    if (this.findNext(i) >= 0)
    legal.push(i);
  }
  return legal;
}

// Returns information about is field with row and
// column valid
Board.prototype.valid = function valid(row, column) {
   return row < 0 || column < 0 || row >= this.height || column >= this.width ? -1 : this.board[row][column];
}

// Returns string representation of board
Board.prototype.toString = function toString() {
  var boardView = "";

  for(var i = 0; i < this.height; i++) {
    for(var j = 0; j < this.width; j++)
      boardView += this.board[i][j] + " ";
    boardView += "\n";
  }

  return boardView;
}
