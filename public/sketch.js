var socket;
var gameData;
var me, board;
var myTurn = false;
var render = false;

// Initialize
function setup() {
  socket = io.connect('http://localhost:3000');
  socket.on('start', init);
  socket.on('update', update);
  socket.on('play', setTurn);
  socket.on('wait', waitTurn);

  ellipseMode(CORNER);
}

function setTurn() {
  gameData.play = true;
}

function waitTurn() {
  gameData.play = false;
}

function update(data) {
  board = data.board;
}

// Initialize
function init(client) {
  render = true;
  gameData = client.gameData;
  gameData.play = client.play;
  board = gameData.board;
  me = client.playerNumber == 1 ? gameData.player1 : gameData.player2;
  createCanvas(gameData.canvasWidth, gameData.canvasHeight);
  background(gameData.backgroundColor);
}

// Send column index if it is your turn
function mousePressed() {
  if (gameData.play) {
    var columnIndex = int(mouseX / gameData.fieldSize);
    socket.emit('turn', {
      columnIndex: columnIndex
    });
  }
}

// Code for showing table
function showTable() {
  for (var j = 0; j < gameData.fieldHeight; j++)
    for (var i = 0; i < gameData.fieldWidth; i++) {
      // Set color to white, for drawing rectangle
      fill(gameData.backgroundColor);
      // Top left pixel, for drawing
      var topLeftX = i * gameData.fieldSize;
      var topLeftY = j * gameData.fieldSize;
      rect(topLeftX, topLeftY, gameData.fieldSize, gameData.fieldSize);
      // Field from board at current position
      var field = board[j][i];
      // If field is not empty, set color to corresponding players color
      if (field > 0) {
        fill(field === 1 ? gameData.player1.color: field === 2 ? gameData.player2.color : 0);
        ellipse(topLeftX, topLeftY, gameData.fieldSize, gameData.fieldSize);
      }
    }
}

function draw() {
  if (render)
    showTable();
}
