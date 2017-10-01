const express = require('express');
const Socket = require('./socket');
const Client = require('./client');
const Server = require('./server');
// Neural network learning puropses
const Board = require('./board');

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

io.sockets.on('connection', function(socket) {
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

      var fs = require('fs');
      var best = "bst";
      var that = this;
      fs.readFile("best", 'utf8', function(err, data) {
          if(err) {
              return console.log(err);
          }

          socket.emit('best_set', {
            best: data
          });
      });

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

  socket.on('best', function(data) {
    var best = JSON.stringify(data.best);

    var fs = require('fs');
    fs.writeFile("best", best, function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
  })

  // When client plays turn
  socket.on('turn', function(data) {
    var winner = server.game.winner();
    if (winner > 0) {
      // After finishing game start a new one
      // For purposes of training neural network
      var turnsNumber = server.game.getTurnsNumber();
      server.game.board = new Board(server.game.gameSettings);
      server.game.start();
      io.sockets.emit('start_new', {
        turns: turnsNumber,
        winner: winner
      });
    } else {
      server.playTurn(data.column);
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
