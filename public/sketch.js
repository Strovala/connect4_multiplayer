var socket;
var fieldSize, fieldWidth, fieldHeight;
var board;
var backgroundColor;
var player1Color, player2Color;
var playerNum;
var myTurn = false;

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
  myTurn = true;
}

function waitTurn() {
  myTurn = false;
}

function update(data) {
  board = data.board;
}

// Initialize
function init(data) {
    createCanvas(data.canvasWidth, data.canvasHeight);
    backgroundColor = data.backgroundColor;
    fieldSize = data.fieldSize;
    fieldWidth = data.fieldWidth;
    fieldHeight = data.fieldHeight;
    board = data.board;
    player1Color = data.player1Color;
    player2Color = data.player2Color;
    playerNum = data.playerNum;
    background(backgroundColor);
}

// Send column index if it is your turn
function mousePressed() {
  if (myTurn) {
    var columnIndex = int(mouseX / fieldSize);
    socket.emit('turn', {
      columnIndex: columnIndex
    });
  }
}

// Code for showing table
function showTable() {
  for (var j = 0; j < fieldHeight; j++)
    for (var i = 0; i < fieldWidth; i++) {
      // Set color to white, for drawing rectangle
      fill(backgroundColor);
      // Top left pixel, for drawing
      var topLeftX = i * fieldSize;
      var topLeftY = j * fieldSize;
      rect(topLeftX, topLeftY, fieldSize, fieldSize);
      // Field from board at current position
      var field = board[j][i];
      // If field is not empty, set color to corresponding players color
      if (field > 0) {
        fill(field === 1 ? player1Color: field === 2 ? player2Color : 0);
        ellipse(topLeftX, topLeftY, fieldSize, fieldSize);
      }
    }
}

function draw() {
  showTable();
}
