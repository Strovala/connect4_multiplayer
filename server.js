var express = require('express');

// Initialize application
var app = express();
var server = app.listen(3000);

app.use(express.static('public'));

console.log("My socket server is running!");

// Initialize sockets
var socket = require('socket.io');
var io = socket(server)
io.sockets.on('connection', newConnection);

clients = [];
var oldSocketIndex;
var newCons = 0;

function newConnection(socket) {
  console.log("New connection : " + socket.id);
  // Init information to client
  var data = {
    canvasWidth: canvasWidth,
    canvasHeight: canvasHeight,
    backgroundColor: WHITE,
    fieldSize: fieldSize,
    fieldWidth: fieldWidth,
    fieldHeight: fieldHeight,
    player1Color: player1Color,
    player2Color: player2Color,
    playerNum: currentPlayer,
    board: board
  };

  // Add clients until there are 2 of them
  if (clients.length < 2) {
    // Send init information
    socket.emit('start', data);
    clients.push(socket);
  } else {
    // Set playerNum to player who was disconected
    // and then send init data
    data.playerNum = oldSocketIndex+1;
    socket.emit('start', data);

    // Update clients with new socket
    clients[oldSocketIndex] = socket;

    // If earlier disconected player is current player tell him that is his
    // turn to play
    if (oldSocketIndex == currentPlayer-1) {
      currentPlayersTurn();
    }
  }

  // Remember which player disconected and dont pop him from array of clients.
  // When next connection happens, set that new socket on his place
  socket.on('disconnect', function() {
      console.log('Got disconnect!');

      var i = clients.indexOf(socket);
      oldSocketIndex = i;
   });

  // When client plays turn
  socket.on('turn', playTurn);

  // If this is first connected player he is player which plays first
  if (clients.length == 1)
    clients[0].emit('play');

  if (newCons < 2) {
    switchPlayers();
    newCons++;
  }
}

// Tells a current player to play and opponent to wait
function currentPlayersTurn() {
  console.log(currentPlayer + ' before emit');
  clients[currentPlayer-1].emit('play');
  switchPlayers();
  clients[currentPlayer-1].emit('wait');
  switchPlayers();
}

// Play turn that client send as columnIndex
function playTurn(data) {
  var columnIndex = data.columnIndex;
  var rowIndex = findNext(columnIndex);
  // If he can put at that column, otherwise he still must play turn
  if (rowIndex >= 0) {
    console.log(currentPlayer + ' before upload');
    updateBoard(rowIndex, columnIndex, currentPlayer);
    switchPlayers();
    // Update board to all clients
    io.sockets.emit('update', {
      board: board
    });
    // Set myTurn variable on clients
    currentPlayersTurn();
  }
}

var fieldWidth = 7, fieldHeight = 6, fieldSize = 100;
var canvasHeight = fieldHeight * fieldSize, canvasWidth = fieldWidth * fieldSize;
var WHITE = 'white';
var RED = 'red';
var GREEN = 'green';
var BLUE = 'blue';

var player1Color = RED, player2Color = GREEN;
var currentPlayer = 1;

// Board represented as matrix of integer (0 - empty; 1 - Player 1; 2 - Player 2)
var board = initBoard();

function initBoard() {
  var mat = new Array(fieldHeight);
  for (var i = 0; i < fieldHeight; i++) {
    mat[i] = new Array(fieldWidth).fill(0);
  }
  return mat;
}

// Search for fisr empty cell in column given by columnIndex
function findNext(columnIndex) {
  for (var rowIndex = fieldHeight-1; rowIndex > -1; rowIndex--) {
    if (board[rowIndex][columnIndex] === 0)
      return rowIndex;
    }
  return -1;
}

function updateBoard(j, i, player) {
  board[j][i] = player;
}

function switchPlayers() {
  currentPlayer = currentPlayer === 1 ? 2 : 1;
}

function valid(row, column) {
   return row < 0 || column < 0 || row >= fieldHeight || column >= fieldWidth ? 0 : board[row][column];
}

function connectedRows() {
  for (var j = 0; j < fieldHeight; j++)
    for (var i = 0; i < fieldWidth; i++)
      if (
        valid(j, i) !== 0 &&
        valid(j, i) === valid(j, i+1) &&
        valid(j, i) === valid(j, i+2) &&
        valid(j, i) === valid(j, i+3)
      )
        return board[j][i];
  return 0;
}

function connectedColumns() {
  for (var j = 0; j < fieldHeight; j++)
    for (var i = 0; i < fieldWidth; i++)
      if (
        valid(j, i) !== 0 &&
        valid(j, i) === valid(j+1, i) &&
        valid(j, i) === valid(j+2, i) &&
        valid(j, i) === valid(j+3, i)
      )
        return board[j][i];
  return 0;
}

function connectedDiagonals() {
  for (var j = 0; j < fieldHeight; j++)
    for (var i = 0; i < fieldWidth; i++)
      for (var k = -1; k <= 1; k+=2)
      if (
        valid(j, i) !== 0 &&
        valid(j, i) === valid(j+k*1, i+1) &&
        valid(j, i) === valid(j+k*2, i+2) &&
        valid(j, i) === valid(j+k*3, i+3)
      )
        return board[j][i];
  return 0;
}

// Return winner if there is four in rows, columns or diagonals
function getWinner() {
  // rows
  var player = connectedRows();
  if (player > 0)
    return player;

  // columns
  var player = connectedColumns();
  if (player > 0)
    return player;

  // diagonals
  var player = connectedDiagonals();
  if (player > 0)
    return player;

  return 0;
}
