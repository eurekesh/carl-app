// base drawing code is from stackoverflow (https://stackoverflow.com/a/30684711) which seems to be originally based on an operadev article (https://dev.opera.com/articles/html5-canvas-painting/)
// create canvas element and append it to document body
var cursorCanvas = document.getElementById('cursor-canvas');
var drawCanvas = document.getElementById('draw-canvas');
var socket = io(); // connects to socket.io server
var roomID;
var first_user = false;
var req_user = false;
var gen_color = genColor();

var isHost = false;
var users = [];

var socID;
var gameID = document.getElementById('gameID');
const ctx = drawCanvas.getContext('2d'); // we are using a 2d canvas
const cursorCtx = cursorCanvas.getContext('2d'); // we are using a 2d canvas

//timer vars
var timeLeft = 30;
var timer = document.getElementById('timer');
var timerId;

// last known position
let pos = { x: 0, y: 0 };
let cursorPos = { x: 0, y: 0 };

// sets some brush variables // TODO: look into this more for game options later
ctx.lineWidth = 5;
ctx.lineCap = 'round';

// add some listeners - UPDATE: only to the canvas, stop tracking coordinates in the middle of nowhere and sending them to the server
cursorCanvas.addEventListener('mousedown', setPosition);
cursorCanvas.addEventListener('mouseenter', setPosition);
cursorCanvas.addEventListener('mousemove', updateCursor);

function updateCursor(e){
  //console.log("cursor position: ", cursorPos);
  setCursorPosition(e);
  let cursorInfo = [cursorPos, socID];
  if(roomID){
    socket.emit('send cursor', cursorInfo);
  }
}

function setCursorPosition(e){
  cursorPos.x = e.clientX; // - cursorCanvas.offsetLeft;
  cursorPos.y = e.clientY; // - cursorCanvas.offsetTop;
}

function renderCursor(cursorData){
  let cursor = document.getElementById(cursorData[1]);
  cursor.style.left = cursorData[0].x + 'px';
  cursor.style.top = cursorData[0].y + 'px';
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
  // var gen_color = genColor(); // generates a color

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
  ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
}
function sendData(raw_dat){ // going to emit data
  socket.emit('send data',raw_dat);
  // console.log(raw_dat);
  //document.getElementById('curr_url').innerHTML = data; // dev only, set
}
function sendRoomCreateReq(){
  isHost = true;
  document.getElementById('start-game').disabled = false;
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

function hostStartGame(){
  socket.emit('host start game');
}

function startGame(noun){
  //start timer
  eraseCanvas();
  document.getElementById('start-game').disabled = true;
  document.getElementById('noun').innerHTML = noun;
  //send timer data with emit
  console.log("game is about to YEET");
  cursorCanvas.addEventListener('mousemove', draw);
  timerId = setInterval(countdown, 1000);
}
function endGame(){
  console.log("We're in the endgame now.");
  cursorCanvas.removeEventListener('mousemove', draw);
  timeLeft = 30;
  document.getElementById('start-game').disabled = false;
  //send finished canvas to server
  if(isHost === true){
    let emit_data = [document.getElementById('noun').innerHTML, drawCanvas.toDataURL()]; // TODO: send noun data and canvas url
    console.log('sending final data to db')
    socket.emit('send final canvas', emit_data);
  }


}
function countdown() {
  if (timeLeft == -1) {
    clearTimeout(timerId);
    endGame();
  } else {
    timer.innerHTML = timeLeft;
    timeLeft--;
  }
}

socket.on('cursor_to_client',function(cursorData) {
  renderCursor(cursorData);
})

socket.on('to_client',function(data) {
  // console.log('line info and color received from server')
  drawData(data);
})

socket.on('roots made', function(id){ // successfully handshake with room handler server side
  socID = id;
  console.log(id);
})

socket.on('create game success', function(data){ // successfully created game
  //socID.innerHTML = data.yourSocketId;
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

/* works with only single cursor
socket.on('new user id', function(id){
  if(isHost == true){
    var usersParagraph = document.getElementById('users').innerHTML += "<br>" + id;
    socket.emit('host added user', usersParagraph);
  }
})
*/

socket.on('new user id', function(id){
  if(isHost == true){
    //let usersInfo = [document.getElementById('users').innerHTML += "<br>" + id, id, document.getElementById('cursors').innerHTML];
    users.push(id);
    socket.emit('host added user', users);
  }
})

socket.on('copy hosts users', function(usersInfo){

  let usersList = "<br>Friends";
  //alert(usersInfo);
  for(let i = 0; i < usersInfo.length; i++){
    usersList += "<br>" + usersInfo[i];
  }
  document.getElementById('users').innerHTML = usersList;
  for(let i = 0; i < usersInfo.length; i++)
  {
    document.getElementById('cursors').insertAdjacentHTML('beforeend', "<img id = "+ "'" + usersInfo[i] + "'" + "src='pencil.png' style = 'position: fixed; top: 0px; left: 0px; z-index: 1;'>");
  }
/*
  if(isHost == false){
    //document.getElementById('cursors').insertAdjacentHTML('beforeend', "<img id = "+ "'" + usersInfo[1] + "'" + "src='pencil.png' style = 'position: fixed; top: 0px; left: 0px; z-index: 1;'>");
    if(document.getElementById('cursors').innerHTML == ""){
      document.getElementById('cursors').insertAdjacentHTML('beforeend', usersInfo[3]);
    }

    else{
      document.getElementById('users').innerHTML = usersInfo[0];
    }
  }

  else{
    document.getElementById('cursors').insertAdjacentHTML('beforeend', "<img id = "+ "'" + usersInfo[1] + "'" + "src='pencil.png' style = 'position: fixed; top: 0px; left: 0px; z-index: 1;'>");
  }
 */
})

socket.on('request canvas',function(){ // a new client is joining soon, let's send them our current canvas state
  if(first_user) {
    console.log("a new client is joining, calculating and sending canvas state");
    let calc_string = drawCanvas.toDataURL();
    socket.emit('send canvas', calc_string);
  }
  else{
    console.log("a new client is joining, but we aren't the first user so no calculations needed")
  }
})



socket.on('start game', function(noun){
  startGame(noun)
})
