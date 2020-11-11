// base drawing code is from stackoverflow (https://stackoverflow.com/a/30684711) which seems to be originally based on an operadev article (https://dev.opera.com/articles/html5-canvas-painting/)
// create canvas element and append it to document body
var canvas = document.getElementById('canvas');
var socket = io(); // connects to socket.io server
var roomID;
var first_user = false;
var req_user = false;


var socID = document.getElementById('socketID');
var gameID = document.getElementById('gameID');
const ctx = canvas.getContext('2d'); // we are using a 2d canvas

// last known position
let pos = { x: 0, y: 0 };

// sets some brush variables // TODO: look into this more for game options later
ctx.lineWidth = 5;
ctx.lineCap = 'round';

// add some listeners - UPDATE: only to the canvas, stop tracking coordinates in the middle of nowhere and sending them to the server
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mousedown', setPosition);
canvas.addEventListener('mouseenter', setPosition);

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
function eraseCanvas(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
function sendData(raw_dat){ // going to emit data
  socket.emit('send data',raw_dat);
  // console.log(raw_dat);
  //document.getElementById('curr_url').innerHTML = data; // dev only, set
}
function sendRoomCreateReq(){
  document.getElementById('create-room').disabled = true;
  document.getElementById('room-req').disabled = true;
  document.getElementById('room-submit').disabled = true;
  socket.emit('create game');
  first_user = true;
}
function sendRoomJoinReq(){
  const getRoomID = document.getElementById('room-req').value;
  socket.emit('req room',getRoomID);
  req_user = true;
}

socket.on('to_client',function(data) {
  // console.log('line info and color received from server')
  drawData(data);
})

socket.on('roots made', function(msg){ // successfully handshake with room handler server side
  console.log(msg);
})

socket.on('create game success', function(data){ // successfully created game
  socID.innerHTML = data.yourSocketId;
  gameID.innerHTML = 'Share this code with friends: ' + data.gameID;
  roomID = data.gameID;
  req_user = false;
})

socket.on('join failed', function(){ // server couldn't find game id, try again
  console.log('server cannot find game id :(');
  gameID.innerHTML = "failed :(";
})

socket.on('initial canvas',function(data){ // if the client is new, process the incoming data
  if(req_user){
    if(data==="") console.log("data was empty :(");
    console.log(data);
    eraseCanvas(); // new function! check above. it just wipes the canvas
    // leftover shenanigans from SO that sets the image
    let img = new Image;
    img.onload = function(){
      ctx.drawImage(img,0,0);
    };
    img.src = data;
    req_user = false;
  }
  else{
    console.log("new client has joined, but we do not need to update canvas")
  }
})

socket.on('successful join',function(data){ // successfully joined!
  console.log('successfully joined a room!');
  const getRoomID = document.getElementById('room-req').value;

  gameID.innerHTML = 'Share this code with friends: ' + getRoomID;
  roomID = getRoomID;
  document.getElementById('room-req').disabled = true; // don't let them submit any more rooms
  document.getElementById('create-room').disabled = true;
  document.getElementById('room-submit').disabled = true;

})

socket.on('request canvas',function(){ // a new client is joining soon, let's send them our current canvas state
  if(first_user) {
    console.log("a new client is joining, calculating and sending canvas state");
    let calc_string = canvas.toDataURL();
    socket.emit('send canvas', calc_string);
  }
  else{
    console.log("a new client is joining, but we aren't the first user so no calculations needed")
  }
})