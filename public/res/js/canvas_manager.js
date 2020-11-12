// base drawing code is from stackoverflow (https://stackoverflow.com/a/30684711) which seems to be originally based on an operadev article (https://dev.opera.com/articles/html5-canvas-painting/)
// create canvas element and append it to document body
var cursorCanvas = document.getElementById('cursor-canvas');
var drawCanvas = document.getElementById('draw-canvas');
var socket = io(); // connects to socket.io server
var roomID;
var isHost = false;

var socID = document.getElementById('socketID');
var gameID = document.getElementById('gameID');
const ctx = drawCanvas.getContext('2d'); // we are using a 2d canvas
const cursorCtx = cursorCanvas.getContext('2d'); // we are using a 2d canvas

//timer vars
var timeLeft = 5;
var timer = document.getElementById('timer');
var timerId;
var thisCursor = document.getElementById('thisCursor');

// last known position
let pos = { x: 0, y: 0 };
let cursorPos = { curX: 0, curY: 0, prevX: 0, prevY: 0 };

// sets some brush variables // TODO: look into this more for game options later
ctx.lineWidth = 5;
ctx.lineCap = 'round';

// add some listeners - UPDATE: only to the canvas, stop tracking coordinates in the middle of nowhere and sending them to the server
cursorCanvas.addEventListener('mousemove', updateCursor);
cursorCanvas.addEventListener('mousedown', setPosition);
cursorCanvas.addEventListener('mouseenter', setPosition);

function updateCursor(e){
  setCursorPosition(e);
  socket.emit('send cursor', cursorPos);
}

function setCursorPosition(e){
  cursorPos.curX = e.clientX;
  cursorPos.curY = e.clientY;
}

function renderCursor(cursorData){
//  thisCursor.style.left = cursorPos.x + 'px';
//  thisCursor.style.top = cursorPos.y + 'px';
  cursorCtx.clearRect(cursorPos.prevX - cursorCanvas.offsetLeft, cursorPos.prevY - cursorCanvas.offsetTop, 10, 10);
  cursorCtx.fillRect(cursorPos.curX - cursorCanvas.offsetLeft, cursorPos.curY - cursorCanvas.offsetTop, 10, 10);
  cursorPos.prevX = cursorPos.curX;
  cursorPos.prevY = cursorPos.curY;
}

// new position from mouse event
function setPosition(e) {
  pos.x = e.clientX - drawCanvas.offsetLeft; // thanks to alex for offsets
  pos.y = e.clientY - drawCanvas.offsetTop;
}

function draw(e) { // going to be used for collecting input
  // must be left click right now
  if (e.buttons !== 1) return;

  ctx.beginPath(); // begin
  var gen_color = genColor(); // generates a color

  var stroke_data = [pos.x,pos.y]; // initial x1,y1
  setPosition(e); // changing coordinates
  // push new coordinates into array and the color
  stroke_data.push(pos.x);
  stroke_data.push(pos.y);
  stroke_data.push(gen_color);
  //format of stroke_data = [x1,y1,x2,y2,color];
  drawData(stroke_data);

  if(roomID) sendData(stroke_data); // don't send to server if we don't need to!
}

function drawData(data){
  var x1 = data[0];
  var y1 = data[1];
  var x2 = data[2];
  var y2 = data[3];
  var color = data[4];
  ctx.strokeStyle = color; // generates a color
  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  ctx.stroke();
}

function genColor(){ // random hex color
  return "#" + Math.floor(Math.random()*16777215).toString(16);
}
function erase(){
  ctx.clearRect(0, 0, draw-canvas.width, draw-canvas.height);
}
function sendData(raw_dat){ // going to emit data
  socket.emit('send data',raw_dat);
  console.log(raw_dat);
  //document.getElementById('curr_url').innerHTML = data; // dev only, set
}
function sendRoomCreateReq(){
  isHost = true;
  document.getElementById('start-game').disabled = false;
  document.getElementById('create-room').disabled = true;
  document.getElementById('room-req').disabled = true;
  document.getElementById('room-submit').disabled = true;
  socket.emit('create game');
}
function sendRoomJoinReq(){
  const getRoomID = document.getElementById('room-req').value;
  socket.emit('req room',getRoomID);
}

function startGame(){
  //start timer
  socket.emit('game start');
  //send timer data with emit
  console.log("game is about to YEET");
  cursorCanvas.addEventListener('mousemove', draw);
  timerId = setInterval(countdown, 1000);
}
function endGame(){
  console.log("We're in the endgame now.");
  cursorCanvas.removeEventListener('mousemove', draw);
  timeLeft = 5;
}
function countdown() {
  if (timeLeft == -1) {
    clearTimeout(timerId);
    endGame();
  } else {
    timer.innerHTML = timeLeft + ' seconds remaining';
    timeLeft--;
  }
}

socket.on('cursor_to_client',function(cursorData) {
  console.log('cursor data received from server')
  renderCursor(cursorData);
})

socket.on('to_client',function(data) {
  console.log('line info and color received from server')
  drawData(data);
})

socket.on('roots made', function(msg){ // successfully handshake with room handler server side
  console.log(msg);
})

socket.on('create game success', function(data){ // successfully created game
  socID.innerHTML = data.yourSocketId;
  gameID.innerHTML = 'Share this code with friends: ' + data.gameID;
  roomID = data.gameID;
})

socket.on('join failed', function(){ // server couldn't find game id, try again
  console.log('server cannot find game id :(');
  gameID.innerHTML = "failed :(";
})

socket.on('successful join',function(){ // successfully joined!
  console.log('successfully joined a room!');
  const getRoomID = document.getElementById('room-req').value;

  gameID.innerHTML = 'Share this code with friends: ' + getRoomID;
  roomID = getRoomID;
  document.getElementById('room-req').disabled = true; // don't let them submit any more rooms
  document.getElementById('create-room').disabled = true;
  document.getElementById('room-submit').disabled = true;
})
