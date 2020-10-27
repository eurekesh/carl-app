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
app.set('views', [__dirname+'/public/views/pages', __dirname+'/public/views/about-me-pages']);
//app.set('img', __dirname+'/public/views/about-me-pages/img');

app.set('view engine', 'ejs')
app.use(express.static(__dirname+ "public/"))

app.get("/", function (req, res) {
  //res.sendFile(__dirname +'/public/about-me-pages/about-us.ejs')
  res.render('instructions')
});

app.get("/res/:folder/:filen", function (req, res) { // yikes this took a long time
                                             //res.sendFile(__dirname +'/public/about-me-pages/about-us.ejs')
  let curr_path = path.parse(req.originalUrl);
  console.log('req.originalURl for res is ' + req.originalUrl)
  res.sendFile(__dirname + '/public/res/' + req.params.folder + '/' + req.params.filen);

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
    res.render(req.params.req_page);
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
    console.log('attempting to send file path ' + req.originalUrl)
    res.sendFile(__dirname+'/public/views/about-me-pages/img/'+req.params.req_page)
  }
  else{
    console.log('attempting to render '+req.params.req_page);
    res.render(req.params.req_page);
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






//Create Database Connection
var pgp = require('pg-promise')();

/**********************
  Database Connection information
  host: This defines the ip address of the server hosting our database.  We'll be using localhost and run our database on our local machine (i.e. can't be access via the Internet)
  port: This defines what port we can expect to communicate to our database.  We'll use 5432 to talk with PostgreSQL
  database: This is the name of our specific database.  From our previous lab, we created the football_db database, which holds our football data tables
  user: This should be left as postgres, the default user account created when PostgreSQL was installed
  password: This the password for accessing the database.  You'll need to set a password USING THE PSQL TERMINAL THIS IS NOT A PASSWORD FOR POSTGRES USER ACCOUNT IN LINUX!
**********************/
const dbConfig = {
	host: 'localhost',
	port: 5432,
	database: 'carl',
	user: 'postgres',
	password: 'CARL',
};

var db = pgp(dbConfig);





//get request to display all old canvases in order of date created 
app.get('/past-drawings', function(req, res) {
	var query = 'SELECT img_64bitcode FROM canvases ORDER BY date;';
	db.any(query)
        .then(function (rows) {
            res.render('views/past-drawings',{
				my_title: "Past Drawings",
				data: rows
			})

        })
        .catch(function (err) {
            console.log('error', err);
            res.render('views/past-drawings', {
                my_title: 'Past Drawings',
                data: ''
            })
        })
});
