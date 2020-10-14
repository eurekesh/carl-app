const express = require("express");
const app = express();
const serv = require('http').createServer(app);
const io = require('socket.io')(serv);
const port = process.env.PORT || 3000;

serv.listen(port,()=> {
  console.log('Server successfully started at port %d',port);
});

app.use('/',function(req, res, next){
   console.log("A new request received at " + Date.now());
   next();
});

//dynamic routes go here

<<<<<<< Updated upstream
// use the express-static middleware
app.use(express.static("public/about-me-pages"))
=======
app.use(express.static("public"))
>>>>>>> Stashed changes

app.get("/", function (req, res) {
<<<<<<< Updated upstream
  res.sendFile(__dirname +'/public/about-me-pages/about-us.html')
})
=======
  //res.sendFile(__dirname +'/public/about-me-pages/about-us.html')
  res.sendFile("index.html");
});
>>>>>>> Stashed changes

io.on('connection', (socket) => {
  console.log('user connected');
  socket.on('send data', (data) => {
    console.log('data recieved, distributing it now.');
    socket.broadcast.emit('to_client',data);
  })
})
