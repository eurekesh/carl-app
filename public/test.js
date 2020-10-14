// create canvas element and append it to document body
var canvas = document.getElementById('canvas');
var socket = io();

// some hotfixes... ( ≖_≖)
document.body.style.margin = 0;
canvas.style.position = 'fixed';

// get canvas 2D context and set him correct size
var ctx = canvas.getContext('2d');
resize();

// last known position
var pos = { x: 0, y: 0 };

window.addEventListener('resize', resize);
document.addEventListener('mousemove', draw);
document.addEventListener('mousedown', setPosition);
document.addEventListener('mouseenter', setPosition);

// new position from mouse event
function setPosition(e) {
  pos.x = e.clientX;
  pos.y = e.clientY;
}

// resize canvas
function resize() {
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
}

function draw(e) {
  // mouse left button must be pressed
  if (e.buttons !== 1) return;

  ctx.beginPath(); // begin

  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.strokeStyle = genColor();

  ctx.moveTo(pos.x, pos.y); // from
  setPosition(e);
  ctx.lineTo(pos.x, pos.y); // to

  ctx.stroke(); // draw it!
  recordData();
}

function genColor(){
  return Math.floor(Math.random()*16777215).toString(16);
}
function recordData(){ // going to record and emit data
  var data = canvas.toDataURL();
  socket.emit('send data',data);
  console.log(data);
  //document.getElementById('curr_url').innerHTML = data; // dev only
}

function drawData(data){
  var img = new Image;
  img.onload = function(){
    ctx.drawImage(img,0,0);
  };
  img.src = data;
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
