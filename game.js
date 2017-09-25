var Board = require('./board');

function Game(gameSettings) {
  this.gameSettings = gameSettings;
  this.board = new Board(this.gameSettings);
  this.history = [];
}

Game.prototype.start = function start() {
  // Give turn to player 1 at start
  this.board.turn = this.gameSettings.player1;
}

Game.prototype.end = function end() {
  // When game ends give turn to noone
  this.board.turn = this.gameSettings.spectator;
}

Game.prototype.switchTurn = function switchTurn() {
  var player1 = this.gameSettings.player1;
  var player2 = this.gameSettings.player2;
  var currentPlayer = this.board.turn;
  this.board.turn =
    currentPlayer.number === player1.number ?
      // If current player is player 1, give turn to player 2
      player2 :
    currentPlayer.number === player2.number ?
      // If current player is player 2, give turn to player 1
      player1 :
    // If current player noone, keep it that way
    this.gameSettings.spectator;
}

Game.prototype.play = function play(column) {
  // If it is end of the game ignore this invoke
  if (this.winner() > 0)
    return;
  // If its legal move play move
  // otherwise ignore
  if (this.board.isLegal(column)) {
    // Remember this state
    this.history.push(this.board);
    // Play move
    var currentPlayer = this.board.turn;
    this.board.play(column, currentPlayer.number);
    // Switch turn
    this.switchTurn();
  }

  // Commented for puropses of neural network learning
  // // If someone won call end game
  // if (this.winner() > 0)
  //   this.end();
}

Game.prototype.getTurnsNumber = function getTurnsNumber() {
  return this.board.getTurnsNumber();
}

Game.prototype.winner = function winner() {
  return this.board.getWinner();
}

module.exports = Game;
