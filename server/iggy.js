const util = require('./utils.js');

var active_rooms = []; // will use format {id: some_id, num_users: some_number}, may add user ids later?
var io;
var soc;
var new_user_queue = [];

// to note, "this" keyword is required for sending private events to the particular client that is calling a function
exports.createYggdrasil = function(io_obj,socket){
    soc = socket;
    io = io_obj;

    socket.emit('roots made',
        {
            confirm: "You can now be sorted."
        });
    soc.on('create game', createNewRoom);
    soc.on('req room', requestRoom);
    soc.on('send data', processData);
    soc.on('send canvas', extractData);
    soc.on('host start game', emitStartGame);
    soc.on('send cursor', processCursor);

    //setInterval(updateRoomState,5000); // update the room state with a base64 png TODO: maybe just request room state from new client?
};

function findRoom(id){ // given a room id (6 chars that define the room), find it's index in active_rooms
    let found = -1;
  for(let i = 0; i < active_rooms.length; i++) // iterate through active_rooms
  {
    if(active_rooms[i].id == id){
        found = i;
        break;
    }
  }
  return found;
};

function processCursor(cursorLocation){
    let currentRoom = this.rooms[Object.keys(this.rooms)[0]]; // ugh. thanks so
    console.log("Current room: ", currentRoom, "cursorLocation: ", cursorLocation);
    io.to(currentRoom).emit('cursor_to_client', cursorLocation);
}

function extractData(canvas_string){ // we request a canvas from the host to give to new users, here's what we do with it
    console.log("canvas string updated: " + canvas_string.substr(0,50));
    let currentRoom = this.rooms[Object.keys(this.rooms)[0]];
    console.log(currentRoom);
    io.to(currentRoom).emit('initial canvas',canvas_string); // we emit to the room that was waiting
}

function requestRoom(id){ // client is looking for a room, let's try and find a match; this is a ROOM ID not socket id (a user)
    let found = findRoom(id);

    if (found === -1) {
        this.emit('join failed');
    } else {
        io.to(id).emit('request canvas'); // BEFORE the client joins, let's request a current canvas, use client side flag to only get it from first user who created room
        new_user_queue.push(active_rooms[found].id); // stores the ROOM that we want to send a canvas update to, client side flags handle the rest
        this.leaveAll(); // bug SQUASHED. without this, the "first selected room" would be the default. sad.
        this.join(active_rooms[found].id); // use the socket.io reserved keyword "join" to join a room
        active_rooms[found].num_users++; // TODO: use setInterval to clean out old rooms
        console.log('client ' + this.id + ' successfully joined room ' + id + '!');
        this.emit('successful join');
    }

}

function createNewRoom(){
    let new_room = {id: '', num_users: 1};
    new_room.id = util.generateID(); // generate a room id (defined below)
    this.emit('create game success',
    {
        gameID: new_room.id,
        yourSocketId: this.id
    });
    active_rooms.push(new_room); // push the new room
    this.leaveAll(); // force the client to leave it's old rooms so we can do what we want
    this.join(new_room.id); // join the new room
    console.log('new room id created: ' + new_room.id + ' for a very happy customer: ' + this.id);

}

function processData(data){ // receives draw data and processes where to send it

    let currentRoom = this.rooms[Object.keys(this.rooms)[0]]; // array-ifies the "this" object, ask Ash for more info
    //console.log("room target: " + currentRoom);
    io.to(currentRoom).emit('to_client',data); // send it!
}

function emitStartGame(){
  const noun = util.chooseNoun();
  console.log("emitting start game to clients");
  let currentRoom = this.rooms[Object.keys(this.rooms)[0]];
  io.to(currentRoom).emit('start game', noun);
}


