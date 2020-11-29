const express = require("express");
const path = require('path');
const app = express();
const serv = require('http').createServer(app);
const io = require('socket.io')(serv);
const port = process.env.PORT || 3000;
const yggdrasil = require('./yggdrasil');

serv.listen(port,()=> {
  console.log('Server successfully started at port %d',port);
});


//dynamic routes go here, look into socket.io "rooms"
app.set('views', [__dirname+'/public/views/pages', __dirname+'/public/views/about-me-pages']); // ejs looks for "views"

app.set('view engine', 'ejs')
app.use(express.static(__dirname+ "public/"))

app.get("/", function (req, res) {
  //res.sendFile(__dirname +'/public/about-me-pages/about-us.ejs')
  res.render('instructions')
});

app.get("/res/:folder/:filen", function (req, res) { // yikes this took a long time
//res.sendFile(__dirname +'/public/about-me-pages/about-us.ejs')
  let curr_path = path.parse(req.originalUrl);
 // console.log('req.originalURl for res is ' + req.originalUrl)
  res.sendFile(__dirname + '/public/res/' + req.params.folder + '/' + req.params.filen);

});




//Create Database Connection
var pgp = require('pg-promise')();

/**********************
  Database Connection information
  host: This defines the ip address of the server hosting our database.  Using localhost to  run our database on our local machine
  port: The port to communicate to our database
  database: This is the name of our specific database- carl
  user: using the default user account postgres
  password: This the password for accessing the database. THIS IS NOT A PASSWORD FOR POSTGRES USER ACCOUNT IN LINUX!
**********************/
const dbConfig = {
	host: 'localhost',
	port: 5432,
	database: 'carl',
	user: 'postgres',
	password: 'Poopie100$',
};

var db = pgp(dbConfig);



/*
//get request to retreive canvas url and convert to bit string 
app.get('/past-drawings', function(req, res) {
  var theURL= canvas.toDataURL();
 
	db.task('get-everything', task => { 
    return task.batch([
      task.any(thecanvases)
    ]);
  })
  .then(data => {
    res.render('past-drawings' , {
      my_title: "Past Drawings",
      allcanvases: data[0]

    })
  })
  .catch(err => {
    console.log('error', err);
    res.render('past-drawings', {
      my_title: "Past Drawings",
      allcanvases: ''
    })
  });
});
*/





//get request to display all old canvases in order of date created 
app.get('/past-drawings', function(req, res) {
  var thecanvases= 'SELECT * FROM canvases ORDER BY date_created;';
 
	db.task('get-everything', task => { 
    return task.batch([
      task.any(thecanvases)
    ]);
  })
  .then(data => {
    res.render('past-drawings' , {
      my_title: "Past Drawings",
      allcanvases: data[0]

    })
  })
  .catch(err => {
    console.log('error', err);
    res.render('past-drawings', {
      my_title: "Past Drawings",
      allcanvases: ''
    })
  });
});

app.get("/:req_page/", function (req, res) { // yikes this took a long time
  //res.sendFile(__dirname +'/public/about-me-pages/about-us.ejs')
  let curr_path = path.parse(req.originalUrl);
 //  console.log('req.originalURl is ' + req.originalUrl)
  if(curr_path.ext !== '' && curr_path.ext !== '.ejs')
  {
    res.sendFile(__dirname+'/public/views/pages'+req.originalUrl)
  }
  else{
    // console.log('attempting to render '+req.params.req_page);
    res.render(req.params.req_page);
  }
  // console.log(req.params);

});

app.get("/about-me-pages/:req_page", function (req, res) { // yikes this took a long time, turns out you have to make a second handler!
                                            //res.sendFile(__dirname +'/public/about-me-pages/about-us.ejs')
  let curr_path = path.parse(req.originalUrl);
  // console.log('req.originalURl is ' + req.originalUrl)
  // console.log('req.path is ' + req.path)

  if(curr_path.ext !== '' && curr_path.ext !== '.ejs')
  {
    //console.log('attempting to send file path ' + req.originalUrl)
    res.sendFile(__dirname+'/public/views/about-me-pages/img/'+req.params.req_page)
  }
  else{
    //console.log('attempting to render '+req.params.req_page);
    res.render(req.params.req_page);
  }

 // console.log(req.params);
});

io.on('connection', (socket) => {
  console.log('user connected: ' + socket.id);
  yggdrasil.createYggdrasil(io,socket);
});
