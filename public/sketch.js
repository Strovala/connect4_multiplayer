var socket;
var gameData;
var me, board;
var myTurn = false;
var render = false;
var play = false;
var robot = true;
var legalMoves;

// Initialize
function setup() {
  socket = io.connect('http://localhost:3000');
  socket.on('start', init);
  socket.on('update', update);

  ellipseMode(CORNER);
}

function update(data) {
  board = data.board;
  play = data.currentPlayer.number === me.number;
  legalMoves = data.legalMoves;
}

// Initialize
function init(client) {
  render = true;
  gameData = client.gameData;
  play = client.play;
  board = gameData.board;
  me = client.player;
  createCanvas(gameData.canvasWidth, gameData.canvasHeight);
  background(gameData.backgroundColor);
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Send column index if it is your turn
function mousePressed() {
  if (play && robot == false) {
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

function botPlay() {
  if (play && robot) {
    var columnIndex = legalMoves[randomInt(0, legalMoves.length-1)];
    socket.emit('turn', {
      columnIndex: columnIndex
    });
  }
}

function draw() {
  if (render) {
    showTable();
    wait(1000);
    botPlay();
  }
}

function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}
