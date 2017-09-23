// Bot class representing the minimax algorithm
function Bot(me) {
  this.me = me;
  this.opponent = me == 1 ? 2 : 1;
}

// Returns the best move
// This is equal to getMax function only this function
// returns move object
Bot.prototype.bestMove = function bestMove(board, depth) {
  var maxMove;
  var moveList = [];
  var legalMoves = board.legalMoves();
  for (var i = 0; i < legalMoves.length; i++) {
    var move = legalMoves[i];
    var boardCopy = board.copy();
    boardCopy.play(this.me, move);
    var value = this.getMin(boardCopy, depth-1);
    moveList.push(new Move(move, value));
  }

  maxMove = moveList[0];
  for (var i = 1; i < moveList.length; i++) {
    if (moveList[i].value > maxMove.value) {
      maxMove = moveList[i];
    }
  }

  return maxMove;
}

// Returns maximal value of legal moves
// This is used to determine players best move
Bot.prototype.getMax = function getMax(board, depth) {
  if (depth <= 0) {
    return this.evaluate(board, this.me);
  }

  var maxMove;
  var moveList = [];
  var legalMoves = board.legalMoves();
  for (var i = 0; i < legalMoves.length; i++) {
    var move = legalMoves[i];
    var boardCopy = board.copy();
    boardCopy.play(this.me, move);
    var value = this.getMin(boardCopy, depth-1);
    moveList.push(new Move(move, value));
  }

  maxMove = moveList[0];
  for (var i = 1; i < moveList.length; i++) {
    if (moveList[i].value > maxMove.value) {
      maxMove = moveList[i];
    }
  }
  return maxMove.value;
}

// Returns minimal value of legal moves
// This is used to determine opponents best move
Bot.prototype.getMin = function getMin(board, depth) {
  if (depth <= 0) {
    return this.evaluate(board, this.me);
  }

  var maxMove;
  var moveList = [];
  var legalMoves = board.legalMoves();
  for (var i = 0; i < legalMoves.length; i++) {
    var move = legalMoves[i];
    var boardCopy = board.copy();
    boardCopy.play(this.opponent, move);
    var value = this.getMax(boardCopy, depth-1);
    moveList.push(new Move(move, value));
  }

  maxMove = moveList[0];
  for (var i = 1; i < moveList.length; i++) {
    if (moveList[i].value < maxMove.value) {
      maxMove = moveList[i];
    }
  }
  return maxMove.value ;
}

// Returns next four fields towards right
// including one with row and column
Bot.prototype.nextFourRow = function nextFourRow(board, row, column) {
  four = [];
  if (!(
    board.valid(row, column)   < 0 ||
    board.valid(row, column+1) < 0 ||
    board.valid(row, column+2) < 0 ||
    board.valid(row, column+3) < 0
  )) {
    for (var offset = 0; offset < 4; offset++)
      four.push(board.board[row][column+offset]);
  }
  return four;
}

// Returns next four fields towards down
// including one with row and column
Bot.prototype.nextFourColumn = function nextFourColumn(board, row, column) {
  four = [];
  if (!(
    board.valid(row, column)   < 0 ||
    board.valid(row+1, column) < 0 ||
    board.valid(row+2, column) < 0 ||
    board.valid(row+3, column) < 0
  )) {
    for (var offset = 0; offset < 4; offset++)
      four.push(board.board[row+offset][column]);
  }
  return four;
}

// Returns next four fields towards down right
// including one with row and column
Bot.prototype.nextFourDiagonalDown = function nextFourDiagonalDown(board, row, column) {
  four = [];
  if (!(
    board.valid(row, column)   < 0 ||
    board.valid(row+1, column+1) < 0 ||
    board.valid(row+2, column+2) < 0 ||
    board.valid(row+3, column+3) < 0
  )) {
    for (var offset = 0; offset < 4; offset++)
      four.push(board.board[row+offset][column+offset]);
  }
  return four;
}

// Returns next four fields towards up right
// including one with row and column
Bot.prototype.nextFourDiagonalUp = function nextFourDiagonalUp(board, row, column) {
  four = [];
  if (!(
    board.valid(row, column)   < 0 ||
    board.valid(row-1, column+1) < 0 ||
    board.valid(row-2, column+2) < 0 ||
    board.valid(row-3, column+3) < 0
  )) {
    for (var offset = 0; offset < 4; offset++)
      four.push(board.board[row-offset][column+offset]);
  }
  return four;
}

// Returns how good is current state on the board
// for player with player number
Bot.prototype.evaluate = function evaluate(board, playerNumber) {
  var sum = 0;
  for (var row = 0; row < board.height; row++) {
    for (var column = 0; column < board.width; column++) {
      //Get 4 fields from row
      var fourRows = this.nextFourRow(board, row, column);
      sum += this.calculateFour(fourRows, playerNumber);

      //Get 4 fields from column
      var fourColumns = this.nextFourColumn(board, row, column);
      sum += this.calculateFour(fourColumns, playerNumber);

      //Get 4 fields from diagonal towards down
      var fourDiagonalsDown = this.nextFourDiagonalDown(board, row, column);
      sum += this.calculateFour(fourDiagonalsDown, playerNumber);

      //Get 4 fields from diagonal towards up
      var fourDiagonalsUp = this.nextFourDiagonalUp(board, row, column);
      sum += this.calculateFour(fourDiagonalsUp, playerNumber);
    }
  }
  return sum;
}


// Calculate value of 4 fields
Bot.prototype.calculateFour = function calculateFour(four, playerNumber) {
  if (four.length == 0) {
    return 0;
  }
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

// Move class representing a column index to be played and
// value of that move given by evaluate function
function Move(move, value) {
  this.move = move;
  this.value = value;
}
