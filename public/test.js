// create canvas element and append it to document body
var canvas = document.getElementById('canvas');
var socket = io();

// some hotfixes... ( ≖_≖)
document.body.style.margin = 0;
canvas.style.position = 'fixed';

// get canvas 2D context and set him correct size
var ctx = canvas.getContext('2d');

// last known position
var pos = { x: 0, y: 0 };

document.addEventListener('mousemove', draw);
document.addEventListener('mousedown', setPosition);
document.addEventListener('mouseenter', setPosition);

// new position from mouse event
function setPosition(e) {
  pos.x = e.clientX;
  pos.y = e.clientY;
}

function draw(e) {
  // mouse left button must be pressed
  if (e.buttons !== 1) return;

  ctx.beginPath(); // begin

  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.strokeStyle = genColor();
  var stroke_data = [pos.x,pos.y];
  ctx.moveTo(pos.x, pos.y); // from
  setPosition(e);
  ctx.lineTo(pos.x, pos.y); // to
  stroke_data.push(pos.x);
  stroke_data.push(pos.y);
  //format of stroke_data = [x1,y1,x2,y2];


  ctx.stroke(); // draw it!
  recordData(stroke_data);
}

function genColor(){
  return Math.floor(Math.random()*16777215).toString(16);
}
function recordData(raw_dat){ // going to record and emit data
  socket.emit('send data',raw_dat);
  console.log(raw_dat);
  //document.getElementById('curr_url').innerHTML = data; // dev only
}

function drawData(data){
  var x1 = data[0];
  var y1 = data[1];
  var x2 = data[2];
  var y2 = data[3];
  ctx.moveTo(x1,y1);
  ctx.moveTo(x2,y2);
  ctx.stroke();
}

socket.on('to_client',function(data) {
  console.log('image recieved from server')
  drawData(data);
})
// var image = new Image
// image.src = "URL or DataURL"
// image.onload = function(){
//    ctx.drawImage(image)
// } var dataURL = canvas.toDataURL()
