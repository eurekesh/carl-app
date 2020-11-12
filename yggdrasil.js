var active_rooms = []; // will use format {id: some_id, num_users: some_number}, may add user ids later?
var io;
var soc;

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
    soc.on('send cursor', processCursor);
    soc.on('game start', startTimer);
};

function processCursor(cursorLocation){
    let currentRoom = this.rooms[Object.keys(this.rooms)[0]]; // ugh. thanks so
    io.to(currentRoom).emit('cursor_to_client', cursorLocation);
}

function requestRoom(id){ // client is looking for a room, let's try and find a match
    let found = -1;
    for(let i = 0; i < active_rooms.length; i++) // iterate through active_rooms object
    {
        if(active_rooms[i].id == id){
            found = i;
            break;
        }
    }
    if (found == -1) {
        this.emit('join failed');
        console.log('client ' + soc.id + ' tried to join, but failed. room ' + id + ' cannot be found')
    } else {
        this.leaveAll(); // bug SQUASHED. without this, the "first selected room" would be the default. sad.
        this.join(active_rooms[found].id);
        active_rooms[found].num_users++; // TODO: use setInterval to clean out old rooms
        console.log('client ' + this.id + ' successfully joined room ' + id + '!');
        this.emit('successful join');
    }

}

function createNewRoom(){
    let new_room = {id: '', num_users: 1};
    new_room.id = generateID();
    this.emit('create game success',
    {
        gameID: new_room.id,
        yourSocketId: this.id
    });
    active_rooms.push(new_room);
    this.leaveAll();
    this.join(new_room.id);
    console.log('new room id created: ' + new_room.id + ' for a very happy customer: ' + soc.id);

}
function processData(data){

    let currentRoom = this.rooms[Object.keys(this.rooms)[0]]; // ugh. thanks so
    //console.log("room target: " + currentRoom);
    io.to(currentRoom).emit('to_client',data);
}

function generateID() { // based on https://www.codegrepper.com/code-examples/delphi/how+to+generate+random+alphabet+in+javascript
    let res = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 6; i++) {
        res += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return res;
}
function startTimer(){
  console.log("does startTimer work");
}
