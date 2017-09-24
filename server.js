var express = require('express');
var Board = require('./board');

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

// Board object
var board = new Board(fieldHeight, fieldWidth);

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
  board = new Board(fieldHeight, fieldWidth);
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

    // When both players are connected
    if (clients.length == 2) {
      startGame();
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
    legalMoves: board.legalMoves()
  });
}

function switchPlayers() {
  var current = getCurrentPlayerClientSocket();
  var opponent = getOpponentClientSocket();
  current.client.play = false;
  opponent.client.play = true;
}

// Called when both players are connected
// Player who connected first plays first
function startGame() {
  clients[0].client.play = true;
  win = false;
}

// Called when somebody wins or no legal moves are left
function endGame() {
  win = true;
  var current = getCurrentPlayerClientSocket();
  var opponent = getOpponentClientSocket();
  current.client.play = false;
  opponent.client.play = false;
}

// Play turn that client send as columnIndex
function playTurn(data) {
  var columnIndex = data.columnIndex;
  var rowIndex = board.findNext(columnIndex);
  // If he can put at that column, otherwise he still must play turn
  if (rowIndex >= 0) {
    var current = getCurrentPlayerClientSocket().client.player;
    board.update(rowIndex, columnIndex, current.number);

    switchPlayers();
    updateClients();
  }
  var winner = board.getWinner();
  if (winner > 0) {
    endGame();
    updateClients();
  }
}
