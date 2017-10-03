const express = require('express');
const Socket = require('./socket');
const Client = require('./client');
const Server = require('./server');

// Initialize application
var app = express();
var ioServer = app.listen(3000);
var server = new Server();

// Set public stuff to server
app.use(express.static('public'));

console.log("My socket server is running!");

// Initialize sockets
var socket = require('socket.io');
var io = socket(ioServer);
var game = 0;
io.sockets.on('connection', function (socket) {
  console.log("New connection : " + socket.id);
  var client;
  // Add clients until there are 2 of them
  if (!server.clients[socket.id]) {
    // Init client object with 1 and 2 as objects
    client = new Client(server.getNextPlayer());
    server.clients[socket.id] = new Socket(client, socket);
    socket.emit('start', {
      client: client,
      gameSettings: server.game.gameSettings,
      board: server.game.board
    });

    // When both players are connected
    if (Object.keys(server.clients).length == 2) {
      server.game.start();
      updateClients();
    }
  }
  // Spectators
  else {
    socket.emit('start', server.spectatorClient);
    updateClients();
  }

  socket.on('disconnect', function() {
    console.log('Got disconnect');

    var oldClient = server.clients[socket.id];
    if (oldClient) {
      console.log('Requested dissconection');
      server.game.end();
      updateClients();
      server = new Server();
      io.sockets.emit('disconnect_reqest');
    }
  });

  // When client plays turn
  socket.on('turn', function(data) {
    var color = server.game.board.turn.number == 1 ? "RED" : "GREEN";
    console.log(color + " -> " + data.column);
    server.playTurn(data.column);
    var winner = server.game.winner();
    if (winner > 0) {
      // console.log("NEW GAME");
      // server.newGame();
      // server.game.start();
      // if (game % 2 == 0)
      //   server.game.board.turn = server.game.gameSettings.player2;
      // else
      //   server.game.board.turn = server.game.gameSettings.player1;
      game++;
    }
    updateClients();
  });
});

function updateClients() {
  // Update board and send current player to all clients
  io.sockets.emit('update', {
    board: server.game.board
  });
}
