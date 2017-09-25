// Board class containing information about
// board representation with integers
// 0-blank 1-first player 2-second player
function Board(gameSettings) {
  this.height = gameSettings.fieldHeight;
  this.width = gameSettings.fieldWidth;
  this.board = this.initBoard();
  this.turn = gameSettings.spectator;

  this.gameSettings = gameSettings;
}

// Creating matrix of integer and filling it with zeros
// (blank spaces)
Board.prototype.initBoard = function initBoard() {
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

  for (var i = 0; i < this.height; i++)
    for (var j = 0; j < this.width; j++)
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
Board.prototype.play = function play(move, playerNumber) {
  this.update(this.findNext(move), move, playerNumber);
}

// Returns first blank row given by column starting
// from bottom
Board.prototype.findNext = function findNext(columnIndex) {
  for (var rowIndex = this.height - 1; rowIndex > -1; rowIndex--) {
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

// Returns if move is legal
Board.prototype.isLegal = function isLegal(move) {
  if (this.findNext(move) >= 0)
    return true;
  return false;
}

// Returns information about is field with row and
// column valid
Board.prototype.valid = function valid(row, column) {
  return row < 0 || column < 0 || row >= this.height || column >= this.width ? -1 : this.board[row][column];
}

Board.prototype.winByRows = function winByRows() {
  for (var j = 0; j < this.height; j++)
    for (var i = 0; i < this.width; i++)
      if (
        this.valid(j, i) > 0 &&
        this.valid(j, i) === this.valid(j, i + 1) &&
        this.valid(j, i) === this.valid(j, i + 2) &&
        this.valid(j, i) === this.valid(j, i + 3)
      )
        return this.board[j][i];
  return 0;
}

Board.prototype.winByColumns = function winByColumns() {
  for (var j = 0; j < this.height; j++)
    for (var i = 0; i < this.width; i++)
      if (
        this.valid(j, i) > 0 &&
        this.valid(j, i) === this.valid(j + 1, i) &&
        this.valid(j, i) === this.valid(j + 2, i) &&
        this.valid(j, i) === this.valid(j + 3, i)
      )
        return this.board[j][i];
  return 0;
}

Board.prototype.winByDiagonals = function winByDiagonals() {
  for (var j = 0; j < this.height; j++)
    for (var i = 0; i < this.width; i++)
      for (var k = -1; k <= 1; k += 2)
        if (
          this.valid(j, i) > 0 &&
          this.valid(j, i) === this.valid(j + k * 1, i + 1) &&
          this.valid(j, i) === this.valid(j + k * 2, i + 2) &&
          this.valid(j, i) === this.valid(j + k * 3, i + 3)
        )
          return this.board[j][i];
  return 0;
}

// Return winner if there is four in rows, columns or diagonals
Board.prototype.getWinner = function getWinner() {
  // rows
  var player = this.winByRows();
  if (player > 0)
    return player;

  // columns
  var player = this.winByColumns();
  if (player > 0)
    return player;

  // diagonals
  var player = this.winByDiagonals();
  if (player > 0)
    return player;

  if (this.legalMoves().length === 0)
    return this.gameSettings.spectator.number;

  return 0;
}

// Gets number of turns by counting all non blank spaces and
// dividing by 2
Board.prototype.getTurnsNumber = function getTurnsNumber() {
  var nonBlanks = 0;

  for (var i = 0; i < this.height; i++)
    for (var j = 0; j < this.width; j++) {
      var field = this.board[i][j];
      if (field !== this.gameSettings.BLANK)
        nonBlanks++;
    }

  return Math.floor(nonBlanks / 2);
}

// Returns string representation of board
Board.prototype.toString = function toString() {
  var boardView = "";

  for (var i = 0; i < this.height; i++) {
    for (var j = 0; j < this.width; j++)
      boardView += this.board[i][j] + " ";
    boardView += "\n";
  }

  return boardView;
}

module.exports = Board;
