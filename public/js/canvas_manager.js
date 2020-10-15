// base drawing code is from stackoverflow (https://stackoverflow.com/a/30684711) which seems to be originally based on an operadev article (https://dev.opera.com/articles/html5-canvas-painting/)
// create canvas element and append it to document body
var canvas = document.getElementById('canvas');
var socket = io(); // connects to socket.io server

var ctx = canvas.getContext('2d'); // we are using a 2d canvas

// last known position
var pos = { x: 0, y: 0 };

// sets some brush variables // TODO: look into this more for game options later
ctx.lineWidth = 5;
ctx.lineCap = 'round';

// add some listeners
document.addEventListener('mousemove', draw);
document.addEventListener('mousedown', setPosition);
document.addEventListener('mouseenter', setPosition);

// new position from mouse event
function setPosition(e) {
  pos.x = e.clientX - canvas.offsetLeft; // thanks to alex for offsets
  pos.y = e.clientY - canvas.offsetTop;
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
  recordData(stroke_data);
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
  var result = "#" + Math.floor(Math.random()*16777215).toString(16);
  return result;
}

function recordData(raw_dat){ // going to record and emit data
  socket.emit('send data',raw_dat);
  console.log(raw_dat);
  //document.getElementById('curr_url').innerHTML = data; // dev only, set
}

socket.on('to_client',function(data) {
  console.log('line info and color received from server')
  drawData(data);
})
