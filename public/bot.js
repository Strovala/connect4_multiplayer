function Bot(me) {
  this.me = me;
  this.opponent = me == 1 ? 2 : 1;
}

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

Bot.prototype.getMax = function getMax(board, depth) {
  if (depth <= 0) {
    return board.evaluate(this.me);
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

Bot.prototype.getMin = function getMin(board, depth) {
  if (depth <= 0) {
    return board.evaluate(this.me);
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
  return maxMove.value;
}


function Move(move, value) {
  this.move = move;
  this.value = value;
}
