function Player(playerNum, playerColor) {
  this.number = playerNum;
  this.color = playerColor;
};

// GameSettings class
function GameSettings() {
  this.WHITE = 'white';
  this.RED = 'red';
  this.GREEN = 'green';
  this.BLUE = 'blue';
  this.BLACK = 'black';

  this.PLAYER_1 = 1;
  this.PLAYER_2 = 2;
  this.SPECTATOR = 3;

  this.fieldWidth = 7;
  this.fieldHeight = 6;
  this.fieldSize = 100;
  this.canvasHeight = this.fieldHeight * this.fieldSize;
  this.canvasWidth = this.fieldWidth * this.fieldSize;

  this.backgroundColor = this.WHITE;

  this.player1 = new Player(this.PLAYER_1, this.RED);
  this.player2 = new Player(this.PLAYER_2, this.GREEN);
  this.spectator = new Player(this.SPECTATOR, this.BLACK);
}

module.exports = new GameSettings();
