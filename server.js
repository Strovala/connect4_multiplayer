var Client = require('./client');
// Get game settings
var gameSettings = require('./gameSettings');
var Game = require('./game');

function Server() {
  this.clients = {};
  this.game = new Game(gameSettings);
  this.spectatorClient = new Client(gameSettings.spectator, this.game)
  this.assignedPlayer = null;
}

// Sets up a new game
Server.prototype.newGame = function newGame(column) {
  this.game = new Game(gameSettings);
}

// Play turn that client send as column
Server.prototype.playTurn = function playTurn(column) {
  this.game.play(column);
}

// Gets next player to be assigned
Server.prototype.getNextPlayer = function getNextPlayer() {
  var player1 = this.game.gameSettings.player1;
  var player2 = this.game.gameSettings.player2;
  this.assignedPlayer =
         this.assignedPlayer == null ?
          player1 :
         this.assignedPlayer.number == player1.number ?
          player2 :
         null;
  return this.assignedPlayer;
}

module.exports = Server;
