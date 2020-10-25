const express = require("express");
const path = require('path');
const app = express();
const serv = require('http').createServer(app);
const io = require('socket.io')(serv);
const port = process.env.PORT || 3000;

serv.listen(port,()=> {
  console.log('Server successfully started at port %d',port);
});

//dynamic routes go here, look into socket.io "rooms"
app.set('views', __dirname+'/public/views');
app.set('view engine', 'ejs')
app.use(express.static(__dirname+ "public/"))

app.get("/", function (req, res) {
  //res.sendFile(__dirname +'/public/about-me-pages/about-us.ejs')
  res.render('pages/instructions.ejs')
});

app.get("/:req_page/", function (req, res) { // yikes this took a long time
  //res.sendFile(__dirname +'/public/about-me-pages/about-us.ejs')
  let curr_path = path.parse(req.originalUrl);
  console.log('req.originalURl is ' + req.originalUrl)
  if(curr_path.ext !== '' && curr_path.ext !== '.ejs')
  {
    res.sendFile(__dirname+'/public/views/pages'+req.originalUrl)
  }
  else{
    console.log('attempting to render '+req.params.req_page);
    res.render('pages/' + req.originalUrl);
  }
  console.log(req.params);

});

app.get("/about-me-pages/:req_page", function (req, res) { // yikes this took a long time, turns out you have to make a second handler!
                                            //res.sendFile(__dirname +'/public/about-me-pages/about-us.ejs')
  let curr_path = path.parse(req.originalUrl);
  console.log('req.originalURl is ' + req.originalUrl)
  console.log('req.path is ' + req.path)
  if(curr_path.ext !== '' && curr_path.ext !== '.ejs')
  {
    res.sendFile(__dirname+'/public/views/about-me-pages'+req.originalUrl)
  }
  else{
    console.log('attempting to render '+req.params.req_page);
    res.render('about-me-pages/' + req.params.req_page);
  }
  console.log(req.params);

});

io.on('connection', (socket) => {
  console.log('user connected');
  socket.on('send data', (data) => {
    console.log('data received, distributing it to clients now.');
    console.log('data contains: ' + data);
    socket.broadcast.emit('to_client',data);
  })
});
