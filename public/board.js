function Board(height, width) {
  this.height = height;
  this.width = width;
  this.board = this.init();
}

Board.prototype.init = function init() {
  var mat = new Array(this.height);
  for (var i = 0; i < this.height; i++) {
    mat[i] = new Array(this.width).fill(0);
  }
  return mat;
}

Board.prototype.copy = function copy() {
  var boardCopy = new Board(this.height, this.width);
  boardCopy.board = this.copyBoard(this.board);
  return boardCopy;
}

Board.prototype.copyBoard = function copyBoard(board) {
  var mat = this.init();

  for(var i = 0; i < this.height; i++)
    for(var j = 0; j < this.width; j++)
      mat[i][j] = board[i][j];

  return mat;
}

Board.prototype.update = function update(j, i, playerNumber) {
  this.board[j][i] = playerNumber;
}

Board.prototype.findNext = function findNext(columnIndex) {
  for (var rowIndex = this.height-1; rowIndex > -1; rowIndex--) {
    if (this.board[rowIndex][columnIndex] === 0)
      return rowIndex;
    }
  return -1;
}

Board.prototype.legalMoves = function legalMoves() {
  var legal = []
  for (var i = 0; i < this.width; i++) {
    if (this.findNext(i) >= 0)
    legal.push(i);
  }
  return legal;
}

Board.prototype.play = function play(playerNumber, move) {
  this.update(this.findNext(move), move, playerNumber);
}

Board.prototype.connected = function connected(playerNumber) {
  var sum = 0;
  for (var row = 0; row < this.height; row++) {
    for (var column = 0; column < this.width; column++) {
      var field = this.board[row][column];
      var fourRows = this.nextFourRow(row, column);
      if (fourRows.length != 0) {
        var val = this.calculateFour(fourRows, playerNumber);
        sum += val;
      }

      var fourColumns = this.nextFourColumn(row, column);
      if (fourColumns.length != 0) {
        var val = this.calculateFour(fourColumns, playerNumber);
        sum += val;
      }

      var fourDiagonalsDown = this.nextFourDiagonalDown(row, column);
      if (fourDiagonalsDown.length != 0) {
        var val = this.calculateFour(fourDiagonalsDown, playerNumber);
        sum += val;
      }

      var fourDiagonalsUp = this.nextFourDiagonalUp(row, column);
      if (fourDiagonalsUp.length != 0) {
        var val = this.calculateFour(fourDiagonalsUp, playerNumber);
        sum += val;
      }
    }
  }
  return sum;
}

Board.prototype.valid = function valid(row, column) {
   return row < 0 || column < 0 || row >= this.height || column >= this.width ? -1 : this.board[row][column];
}

Board.prototype.nextFourRow = function nextFourRow(row, column) {
  four = [];
  if (!(
    this.valid(row, column)   < 0 ||
    this.valid(row, column+1) < 0 ||
    this.valid(row, column+2) < 0 ||
    this.valid(row, column+3) < 0
  )) {
    for (var offset = 0; offset < 4; offset++)
      four.push(this.board[row][column+offset]);
  }
  return four;
}

Board.prototype.nextFourColumn = function nextFourColumn(row, column) {
  four = [];
  if (!(
    this.valid(row, column)   < 0 ||
    this.valid(row+1, column) < 0 ||
    this.valid(row+2, column) < 0 ||
    this.valid(row+3, column) < 0
  )) {
    for (var offset = 0; offset < 4; offset++)
      four.push(this.board[row+offset][column]);
  }
  return four;
}

Board.prototype.nextFourDiagonalDown = function nextFourDiagonalDown(row, column) {
  four = [];
  if (!(
    this.valid(row, column)   < 0 ||
    this.valid(row+1, column+1) < 0 ||
    this.valid(row+2, column+2) < 0 ||
    this.valid(row+3, column+3) < 0
  )) {
    for (var offset = 0; offset < 4; offset++)
      four.push(this.board[row+offset][column+offset]);
  }
  return four;
}

Board.prototype.nextFourDiagonalUp = function nextFourDiagonalUp(row, column) {
  four = [];
  if (!(
    this.valid(row, column)   < 0 ||
    this.valid(row-1, column+1) < 0 ||
    this.valid(row-2, column+2) < 0 ||
    this.valid(row-3, column+3) < 0
  )) {
    for (var offset = 0; offset < 4; offset++)
      four.push(this.board[row-offset][column+offset]);
  }
  return four;
}

Board.prototype.evaluate = function evaluate(playerNumber) {
  return this.connected(playerNumber);
}

Board.prototype.calculateFour = function calculateFour(four, playerNumber) {
  var opponent = playerNumber === 1 ? 2 : 1;
  var cntMe = 0;
  var cntOpponent = 0;
  var cntBlank = 0;
  for (var i = 0; i < 4; i++) {
    if (four[i] === playerNumber)
      cntMe++;
    if (four[i] === opponent)
      cntOpponent++;
    if (four[i] === 0)
      cntBlank++;
  }
  if (cntBlank === 4) {
    return 0;
  }
  if (cntMe === 4)
    return 10000;
  if (cntOpponent === 4)
    return -10000;

  if (cntMe === 3) {
    if (cntBlank === 1) {
      return 1000;
    }
    if (cntOpponent === 1) {
      return -2000;
    }
  }

  if (cntOpponent === 3) {
    if (cntBlank === 1) {
      return -1000;
    }
    if (cntMe === 1) {
      return 2000;
    }
  }

  if (cntMe === 2) {
    if (cntBlank === 2) {
      return 100;
    }
    if (cntOpponent == 2) {
      return 0;
    }
    if (cntBlank === 1 && cntOpponent === 1) {
      return -200;
    }
  }

  if (cntOpponent === 2) {
    if (cntBlank === 2) {
      return -100;
    }
    if (cntOpponent == 2) {
      return 0;
    }
    if (cntBlank === 1 && cntMe === 1) {
      return 200;
    }
  }

  if (cntMe === 1) {
    if (cntBlank === 3) {
      return 10;
    }
    if (cntBlank === 2 && cntOpponent === 1) {
      return 0;
    }
    if (cntBlank === 1 && cntOpponent === 2) {
      return 50;
    }
  }

  if (cntOpponent === 1) {
    if (cntBlank === 3) {
      return -10;
    }
    if (cntBlank === 2 && cntMe === 1) {
      return 0;
    }
    if (cntBlank === 1 && cntMe === 2) {
      return -50;
    }
  }

}

Board.prototype.toString = function toString() {
  var boardView = "";

  for(var i = 0; i < this.height; i++) {
    for(var j = 0; j < this.width; j++)
      boardView += this.board[i][j] + " ";
    boardView += "\n";
  }

  return boardView;
}
