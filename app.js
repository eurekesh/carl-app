const express = require("express");
const app = express();
const serv = require('http').createServer(app);
const io = require('socket.io')(serv);
const port = process.env.PORT || 3000;

serv.listen(port,()=> {
  console.log('Server successfully started at port %d',port);
});

//dynamic routes go here, look into socket.io "rooms"

app.use(express.static("public/views"))
app.use(express.static("public"))

app.get("/", function (req, res) {
  //res.sendFile(__dirname +'/public/about-me-pages/about-us.html')
  res.sendFile("/public/views/instructions.html", { root: __dirname });
});

io.on('connection', (socket) => {
  console.log('user connected');
  socket.on('send data', (data) => {
    console.log('data recieved, distributing it to clients now.');
    console.log('data contains: ' + data);
    socket.broadcast.emit('to_client',data);
  })
})
