const express = require("express");
const app = express();
const serv = require('http').createServer(app);
const io = require('socket.io')(serv);
const port = process.env.PORT || 3000;

serv.listen(port,()=> {
  console.log('Server successfully started at port %d',port);
});


var bodyParser = require('body-parser'); //Ensure our body-parser tool has been added
app.use(bodyParser.json());              // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

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

// set the view engine to ejs
app.set('view engine', 'ejs');

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


//get request to display all old canvases in order of date created 
app.get('/home', function(req, res) {
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
