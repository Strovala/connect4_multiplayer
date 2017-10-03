// Bot class representing the minimax algorithm
function Bot(me) {
  this.me = me;
  this.opponent = me == 1 ? 2 : 1;
  this.reward = 100;
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

  var winner = board.getWinner();
  if (winner == this.me) {
    return Math.pow(this.reward, 8);
  } else if (winner == this.opponent) {
    return -Math.pow(this.reward, 8);
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
  return maxMove != undefined ? maxMove.value : 0;
}

// Returns minimal value of legal moves
// This is used to determine opponents best move
Bot.prototype.getMin = function getMin(board, depth) {
  if (depth <= 0) {
    return this.evaluate(board, this.me);
  }

  var winner = board.getWinner();
  if (winner == this.me) {
    return Math.pow(this.reward, 8);
  } else if (winner == this.opponent) {
    return -Math.pow(this.reward, 8);
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
  return maxMove != undefined ? maxMove.value : 0;
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
      four.push(new Field(row, column+offset, board.board[row][column+offset]));
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
      four.push(new Field(row+offset, column, board.board[row+offset][column]));
  }
  return four;
}

// Returns next four fields towards down right
// including one with row and column
Bot.prototype.nextFourDiagonalDown = function nextFourDiagonalDown(board, row, column) {
  four = [];
  if (!(
    board.valid(row, column)     < 0 ||
    board.valid(row+1, column+1) < 0 ||
    board.valid(row+2, column+2) < 0 ||
    board.valid(row+3, column+3) < 0
  )) {
    for (var offset = 0; offset < 4; offset++)
      four.push(new Field(row+offset, column+offset, board.board[row+offset][column+offset]));
  }
  return four;
}

// Returns next four fields towards up right
// including one with row and column
Bot.prototype.nextFourDiagonalUp = function nextFourDiagonalUp(board, row, column) {
  four = [];
  if (!(
    board.valid(row, column)     < 0 ||
    board.valid(row-1, column+1) < 0 ||
    board.valid(row-2, column+2) < 0 ||
    board.valid(row-3, column+3) < 0
  )) {
    for (var offset = 0; offset < 4; offset++)
      four.push(new Field(row-offset, column+offset, board.board[row-offset][column+offset]));
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
      var temp = this.calculateFour(fourRows, playerNumber, board);

      sum += temp;
      //Get 4 fields from column
      var fourColumns = this.nextFourColumn(board, row, column);
      var temp = this.calculateFourColumns(fourColumns, playerNumber, board);

      sum += temp;
      //Get 4 fields from diagonal towards down
      var fourDiagonalsDown = this.nextFourDiagonalDown(board, row, column);
      var temp = this.calculateFour(fourDiagonalsDown, playerNumber, board);

      sum += temp;
      //Get 4 fields from diagonal towards up
      var fourDiagonalsUp = this.nextFourDiagonalUp(board, row, column);
      var temp = this.calculateFour(fourDiagonalsUp, playerNumber, board);

      sum += temp;
    }
  }
  return sum;
}

Bot.prototype.calculateFourColumns = function calculateFourColumns(four, playerNumber, board) {
  if (four.length == 0) {
    return 0;
  }
  var opponentNumber = playerNumber === 1 ? 2 : 1;
  var cntMe = 0;
  var me = [];
  var cntOpponent = 0;
  var opponent = [];
  var cntBlank = 0;
  var blank = [];
  for (var i = 0; i < 4; i++) {
    if (four[i].value === playerNumber) {
      me.push(four[i]);
    }
    if (four[i].value === opponentNumber) {
      opponent.push(four[i]);
    }
    if (four[i].value === 0) {
      blank.push(four[i]);
    }
  }
  cntMe = me.length;
  cntOpponent = opponent.length;
  cntBlank = blank.length;
  // 0000
  if (cntBlank === 4) {
    return 0;
  }
  // 1111
  if (cntMe === 4)
    return Math.pow(this.reward, 5);
  // 2222
  if (cntOpponent === 4)
    return -Math.pow(this.reward, 5);

  if (cntMe === 3) {
    // 1110 and all permutations
    if (cntBlank === 1) {
      // First row of blank field in column where this this blank is
      var firstBlank = board.findNext(blank[0].column);
      // Difference between theese two blank fields
      var difference = firstBlank - blank[0].row;
      // 1110
      // xxxx
      if (difference == 0)
        return Math.pow(this.reward, 3);
      // 1110
      // xxx0
      // xxxx
      if (difference == 1)
        return Math.pow(this.reward, 2);

      // Otherwise
      // 1110
      // xxx0
      // xxx0
      // ....
      return 0;
    }
    // 1112 and all permutations
    if (cntOpponent === 1) {
      // First row of blank field in column where this opponent is
      var firstBlank = board.findNext(opponent[0].column);
      // If there is no blank fields
      // ....
      // xxxx
      // 1121
      if (firstBlank < 0) {
        return 0;
      }
      // Difference between opponent and blank
      var difference = opponent[0].row - firstBlank;
      // If there is no blank field right on top of opponent
      // xxxx
      // 1121
      if (difference > 1)
        return 0;

      // Otherwise
      // xx0x
      // 1121
      // TODO: Think about this
      return -Math.pow(this.reward, 3);
    }
  }

  if (cntOpponent === 3) {
    // 2220 and all permutations
    if (cntBlank === 1) {
      // First row of blank field in column where this this blank is
      var firstBlank = board.findNext(blank[0].column);
      // Difference between theese two blank fields
      var difference = firstBlank - blank[0].row;
      // 2220
      // xxxx
      if (difference == 0)
        return -Math.pow(this.reward, 3);
      // 2220
      // xxx0
      // xxxx
      if (difference == 1)
        return -Math.pow(this.reward, 2);

      // Otherwise
      // 2220
      // xxx0
      // xxx0
      // ....
      return 0;
    }
    // 2221 and all permutations
    if (cntMe === 1) {
      // First row of blank field in column where this I am
      var firstBlank = board.findNext(me[0].column);
      // If there is no blank fields
      // ....
      // xxxx
      // 2212
      if (firstBlank < 0) {
        return 0;
      }
      // Difference between opponent and blank
      var difference = me[0].row - firstBlank;
      // If there is no blank field right on top of opponent
      // xxxx
      // 2212
      if (difference > 1)
        return 0;

      // Otherwise
      // xx0x
      // 2212
      // TODO: Think about this
      return Math.pow(this.reward, 3);
    }
  }
  return 0;
}

// Calculate value of 4 fields
Bot.prototype.calculateFour = function calculateFour(four, playerNumber, board) {
  if (four.length == 0) {
    return 0;
  }
  var opponentNumber = playerNumber === 1 ? 2 : 1;
  var cntMe = 0;
  var me = [];
  var cntOpponent = 0;
  var opponent = [];
  var cntBlank = 0;
  var blank = [];
  for (var i = 0; i < 4; i++) {
    if (four[i].value === playerNumber) {
      me.push(four[i]);
    }
    if (four[i].value === opponentNumber) {
      opponent.push(four[i]);
    }
    if (four[i].value === 0) {
      blank.push(four[i]);
    }
  }
  cntMe = me.length;
  cntOpponent = opponent.length;
  cntBlank = blank.length;
  // 0000
  if (cntBlank === 4) {
    return 0;
  }
  // 1111
  if (cntMe === 4)
    return Math.pow(this.reward, 5);
  // 2222
  if (cntOpponent === 4) {
    debugger;
    return -Math.pow(this.reward, 5);
  }

  if (cntMe === 3) {
    // 1110 and all permutations
    if (cntBlank === 1) {
      // First row of blank field in column where this this blank is
      var firstBlank = board.findNext(blank[0].column);
      // Difference between theese two blank fields
      var difference = firstBlank - blank[0].row;
      // 1110
      // xxxx
      if (difference == 0)
        return Math.pow(this.reward, 2);
      // 1110
      // xxx0
      // xxxx
      if (difference == 1)
        return Math.pow(this.reward, 2);

      // Otherwise
      // 2220
      // xxx0
      // xxx0
      // ....
      return 0;
    }
    // 1112 and all permutations
    if (cntOpponent === 1) {
      // First row of blank field in column where this opponent is
      var firstBlank = board.findNext(opponent[0].column);
      // If there is no blank fields
      // ....
      // xxxx
      // 1121
      if (firstBlank < 0) {
        return 0;
      }
      // Difference between opponent and blank
      var difference = opponent[0].row - firstBlank;
      // If there is no blank field right on top of opponent
      // xxxx
      // 1121
      if (difference > 1)
        return 0;

      // Otherwise
      // xx0x
      // 1121
      // TODO: Think about this
      return -Math.pow(this.reward, 3);
    }
  }

  if (cntOpponent === 3) {
    // 2220 and all permutations
    if (cntBlank === 1) {
      // First row of blank field in column where this this blank is
      var firstBlank = board.findNext(blank[0].column);
      // Difference between theese two blank fields
      var difference = firstBlank - blank[0].row;
      // 2220
      // xxxx
      if (difference == 0)
        return -Math.pow(this.reward, 2);
      // 2220
      // xxx0
      // xxxx
      if (difference == 1)
        return -Math.pow(this.reward, 2);

      // Otherwise
      // 2220
      // xxx0
      // xxx0
      // ....
      return 0;
    }
    // 2221 and all permutations
    if (cntMe === 1) {
      // First row of blank field in column where this I am
      var firstBlank = board.findNext(me[0].column);
      // If there is no blank fields
      // ....
      // xxxx
      // 2212
      if (firstBlank < 0) {
        return 0;
      }
      // Difference between opponent and blank
      var difference = me[0].row - firstBlank;
      // If there is no blank field right on top of opponent

      // xxxx
      // 2212
      if (difference > 1)
        return 0;

      // Otherwise
      // xx0x
      // 2212
      // TODO: Think about this
      return Math.pow(this.reward, 3);
    }
  }

  if (cntMe === 2) {
    // 1100 and all permutations
    if (cntBlank === 2) {
      return this.reward;
    }
    // 1122 and all permutations
    if (cntOpponent == 2) {
      return 0;
    }
    // 1120 and all permutations
    if (cntBlank === 1 && cntOpponent === 1) {
      return -this.reward;
    }
  }

  if (cntOpponent === 2) {
    // 2200 and all permutations
    if (cntBlank === 2) {
      return -this.reward;
    }
    // 2211 and all permutations
    if (cntMe == 2) {
      return 0;
    }
    // 2210 and all permutations
    if (cntBlank === 1 && cntMe === 1) {
      return this.reward;
    }
  }

  if (cntMe === 1) {
    // 1000 and all permutations
    if (cntBlank === 3) {
      return Math.pow(this.reward, 0.5);
    }
    // 1200 and all permutations
    if (cntBlank === 2 && cntOpponent === 1) {
      return 0;
    }
    // 1022 and all permutations
    if (cntBlank === 1 && cntOpponent === 2) {
      return Math.pow(this.reward, 0.5)
    }
  }

  if (cntOpponent === 1) {
    // 2000 and all permutations
    if (cntBlank === 3) {
      return -Math.pow(this.reward, 0.5);
    }
    // 2100 and all permutations
    if (cntBlank === 2 && cntMe === 1) {
      return 0;
    }
    // 2011 and all permutations
    if (cntBlank === 1 && cntMe === 2) {
      return -Math.pow(this.reward, 0.5);
    }
  }
  return 0;
}

// Move class representing a column index to be played and
// value of that move given by evaluate function
function Move(move, value) {
  this.move = move;
  this.value = value;
}

function Field(row, column, value) {
  this.row = row;
  this.column = column;
  this.value = value;
}
