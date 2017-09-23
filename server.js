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


var fieldWidth = 7, fieldHeight = 6, fieldSize = 100;
var canvasHeight = fieldHeight * fieldSize, canvasWidth = fieldWidth * fieldSize;

var WHITE = 'white';
var RED = 'red';
var GREEN = 'green';
var BLUE = 'blue';

var PLAYER_1 = 1;
var PLAYER_2 = 2;
var player1 = new Player(PLAYER_1, RED);
var player2 = new Player(PLAYER_2, GREEN);
var currentPlayer = player1;

// Board represented as matrix of integer (0 - empty; 1 - Player 1; 2 - Player 2)
var board = initBoard();

var clients = [];
// Init information to client
gameData = {
  canvasWidth: canvasWidth,
  canvasHeight: canvasHeight,
  backgroundColor: WHITE,
  fieldSize: fieldSize,
  fieldWidth: fieldWidth,
  fieldHeight: fieldHeight,
  player1: player1,
  player2: player2,
  board: board
};

function resetData() {
  clients = [];
  board = initBoard();
  gameData.board = board;
}

function Player(playerNum, playerColor) {
  this.number = playerNum;
  this.color = playerColor;
};

function Client(player) {
  this.gameData = gameData;
  this.player = player;
  this.play = false;
};

function ClientSocket(client, socket) {
  this.client = client;
  this.socket = socket;
}

var spectatorClient = new Client(new Player(3, BLUE));
var spectatorClientSocket = new ClientSocket(spectatorClient, null);

var win = false;

function newConnection(socket) {
  console.log("New connection : " + socket.id);
  var client;
  // Add clients until there are 2 of them
  if (clients.length < 2) {
    // Init client object with 1 and 2 as player numbers
    client = new Client(clients.length == 0 ? player1 : player2);
    socket.emit('start', client);
    clients.push(new ClientSocket(client, socket));

    if (clients.length == 2) {
      clients[0].client.play = true;
      win = false;
      updateClients();
    }
  }
  // Spectators
  else {
    client = spectatorClient;
    socket.emit('start', client);
    updateClients();
  }

  socket.on('disconnect', function () {
    console.log('Got disconnect');

    var oldClient = findClientBySocket(socket);
    if (oldClient != null) {
      console.log('Requested dissconection');
      resetData();
      updateClients();
      io.sockets.emit('disconnect_req');
    }
  });

  // When client plays turn
  socket.on('turn', playTurn);
}

function findClientBySocket(socket) {
  for (var i = 0; i < clients.length; i++) {
    if (clients[i].socket.id === socket.id)
      return clients[i];
  }
  return null;
}

function getCurrentPlayerClientSocket() {
  return clients[0] && clients[0].client.play ? clients[0] :
         clients[1] && clients[1].client.play ? clients[1] :
         spectatorClientSocket;
}

function getOpponentClientSocket() {
  return clients[0] && clients[0].client.play ? clients[1] :
         clients[1] && clients[1].client.play ? clients[0] :
         spectatorClientSocket;
}

function updateClients() {
  // Update board and send current player to all clients
  io.sockets.emit('update', {
    board: board,
    currentPlayer: getCurrentPlayerClientSocket().client.player,
    legalMoves: legalMoves()
  });
}

function switchPlayers() {
  var current = getCurrentPlayerClientSocket();
  var opponent = getOpponentClientSocket();
  current.client.play = false;
  opponent.client.play = true;
}

// Play turn that client send as columnIndex
function playTurn(data) {
  if (win) return;
  var columnIndex = data.columnIndex;
  var rowIndex = findNext(columnIndex);
  // If he can put at that column, otherwise he still must play turn
  if (rowIndex >= 0) {
    var current = getCurrentPlayerClientSocket().client.player;
    updateBoard(rowIndex, columnIndex, current.number);

    switchPlayers();
    updateClients();
  }
  var winner = getWinner();
  if (winner > 0) {

    win = true;
  }
}

function legalMoves() {
  var legal = []
  for (var i = 0; i < gameData.fieldWidth; i++) {
    if (findNext(i) >= 0)
      legal.push(i);
  }
  return legal;
}

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
