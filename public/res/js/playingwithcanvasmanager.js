hello: function hello(){
    return ("hello");
}


// base drawing code is from stackoverflow (https://stackoverflow.com/a/30684711) which seems to be originally based on an operadev article (https://dev.opera.com/articles/html5-canvas-painting/)
// create canvas element and append it to document body
var cursorCanvas = document.getElementById('cursor-canvas');
var drawCanvas = document.getElementById('draw-canvas');
var socket = io(); // connects to socket.io server
var roomID;
var first_user = false;
var req_user = false;

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

updateCursor: function updateCursor(e){
  console.log("Cursorrrrrrr", cursorPos);
  setCursorPosition(e);
  socket.emit('send cursor', cursorPos);
}

setCursorPosition: function setCursorPosition(e){
  cursorPos.curX = e.clientX - cursorCanvas.offsetLeft;
  cursorPos.curY = e.clientY - cursorCanvas.offsetTop;
}

renderCursor: function renderCursor(cursorData){
//  thisCursor.style.left = cursorPos.x + 'px';
//  thisCursor.style.top = cursorPos.y + 'px';
  cursorCtx.clearRect(0, 0, 700, 700);
  cursorCtx.fillRect(cursorData.curX, cursorData.curY, 10, 10);
  cursorPos.prevX = cursorPos.curX;
  cursorPos.prevY = cursorPos.curY;
}

// new position from mouse event
setPosition: function setPosition(e) {
  pos.x = e.clientX - drawCanvas.offsetLeft; // thanks to alex for offsets
  pos.y = e.clientY - drawCanvas.offsetTop;
}

draw: function draw(e) { // going to be used for collecting input
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

drawData: function drawData(data){
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

genColor: function genColor(){ // random hex color
  return "#" + Math.floor(Math.random()*16777215).toString(16);
}
eraseCanvas: function eraseCanvas(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
