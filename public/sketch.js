var socket;
var gameSettings;
var me, board;
var myTurn = false;
var render = false;
var play = false;
var robot = false;
var legalMoves;

var startGame = false, nickname;
var formNick = $('.form_nick');
var nickElem = $('#nick');
var robotElem = $('#robot');
var startBtn = $('#start_game');

var gen = new Genetic.Population(5);
gen.individuals[3].wins = 2;
gen.individuals[1].wins = 1;
gen.individuals[3].turns = 2;
gen.individuals[1].turns = 1;

gen.evaluate();
console.log(gen);

startBtn.on('click', function () {
  robot = robotElem.is(':checked');
  nickname = $('#nick').val();
  if (nickname == '')
    return;
  startGame = true;

  formNick.remove();

  lateSetUp();
});

function setup() {

}

function lateSetUp() {
  // socket = io.connect('http://178.79.17.81:3000');
  socket = io.connect('http://localhost:3000');
  socket.on('start', init);
  socket.on('update', update);
  socket.on('start_new', newGame);
  socket.on('disconnect_reqest', function() {
    console.log('Ordered dissconection');
    socket.emit('disconnect');
    startGame = false;
    render = false;
    // refresh
    location.reload();
  })

  ellipseMode(CORNER);
}

function update(data) {
  board = new Board(data.board.height, data.board.width);
  board.copyFrom(data.board);
  // Determine is it mine turn
  play = data.board.turn.number == me.number;
  legalMoves = board.legalMoves();
}

// Initialize
function init(data) {
  var client = data.client;
  gameSettings = data.gameSettings;
  // Init board
  board = new Board(data.board.height, data.board.width);
  board.copyFrom(data.board);
  // Get player object
  me = client.player;
  // Determine is it mine turn
  play = data.board.turn.number == me.number;
  // Set up canvas
  createCanvas(gameSettings.canvasWidth, gameSettings.canvasHeight);
  background(gameSettings.backgroundColor);
  // Start rendering when succesfull start
  render = true;
}

function newGame(data) {
  var winner = data.winner;
  var turns = data.turns;

  if (nickname == "Krimina") {
    nickname = "Piprina";
  } else if (nickname == "Piprina") {
    nickname = "Krimina";
  }
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Send column index if it is your turn
function mousePressed() {
  if (play && robot == false) {
    var column = int(mouseX / gameSettings.fieldSize);
    socket.emit('turn', {
      column: column
    });
  }
}


// Code for showing table
function showTable() {
  for (var j = 0; j < gameSettings.fieldHeight; j++)
    for (var i = 0; i < gameSettings.fieldWidth; i++) {
      // Set color to white, for drawing rectangle
      fill(gameSettings.backgroundColor);
      // Top left pixel, for drawing
      var topLeftX = i * gameSettings.fieldSize;
      var topLeftY = j * gameSettings.fieldSize;
      rect(topLeftX, topLeftY, gameSettings.fieldSize, gameSettings.fieldSize);
      // Field from board at current position
      var field = board.board[j][i];
      // If field is not empty, set color to corresponding players color
      if (field > 0) {
        fill(field === 1 ? gameSettings.player1.color: field === 2 ? gameSettings.player2.color : 0);
        ellipse(topLeftX, topLeftY, gameSettings.fieldSize, gameSettings.fieldSize);
      }
    }
}

function botPlay() {
  if (play && robot) {
    var column = legalMoves[randomInt(0, legalMoves.length-1)];

    if (legalMoves.length !== 0) {
      // Your Code
      console.log(nickname);
      if (nickname === 'Strovala') {
        var bot = new Bot(me.number);
        var boardObj = new Board(gameSettings.fieldHeight, gameSettings.fieldWidth);
        boardObj = board.copy();
        var best = bot.bestMove(boardObj, 6);
        column = best.move;
      } else if (nickname === 'Krimina') {
        var bot = new Bot(me.number);
        var boardObj = new Board(gameSettings.fieldHeight, gameSettings.fieldWidth);
        boardObj = board.copy();
        var best = bot.bestMove(boardObj, 4);
        column = best.move;
      } else if (nickname === 'Piprina') {
        var bot = new Bot(me.number);
        var boardObj = new Board(gameSettings.fieldHeight, gameSettings.fieldWidth);
        boardObj = board.copy();
        var best = bot.bestMove(boardObj, 2);
        column = best.move;
      } else if (nickname === 'Viprina') {
        var bot = new Bot(me.number);
        var boardObj = new Board(gameSettings.fieldHeight, gameSettings.fieldWidth);
        boardObj = board.copy();
        var best = bot.bestMove(boardObj, 0);
        column = best.move;
      } else if (nickname === 'Net') {
        var boardObj = new Board(gameSettings.fieldHeight, gameSettings.fieldWidth);
        boardObj = board.copy();

        var out = net.run(boardObj.getInput());
        column = boardObj.getMoveFromOutput(out);
      }
      // Your Code End
    }


    socket.emit('turn', {
      column: column
    });
  }
}

function draw() {
  if (startGame && render) {
    showTable();
    botPlay();
    // wait(1000);
  }
}

function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}
