var express = require('express');
var app = express();
var path = require('path');
var session = require('express-session');
var multer = require('multer');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var myConnection = require('express-myconnection');

//db opzetten
var dbOptions = {
	host: 'localhost',
	user: 'student',
	password: 'serverSide',
	database: 'student'
}

//plaats waar geuploade bestanden terechtkomen
var upload = multer({dest: 'public/uploads/'});

app.use(myConnection(mysql, dbOptions, 'single'));

//bepalen van de routers
var indexRouter = require('./routes/index');
var mypictureRouter = require('./routes/mypicture')
var errRouter = require('./routes/err');
var photoRouter = require('./routes/photo')


//sessies gebruiken 
app.use(session({
  secret: "picturegeheim",
  resave: false,
  saveUninitialized: true
}));

//Instellen van ejs view engine 
app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'ejs');

//Zorgt voor serveren statische bestanden als .css. moet boven alle routes
app.use(express.static('public'));

//bodyparser module instellen
app.use(bodyParser.urlencoded({extended: true}));

// app doorsturen naar routers 
app.use('/', indexRouter);
app.use('/mypicture', upload.single('test-file'), mypictureRouter);
app.use('/photo', photoRouter);

// Als geen van de routers wordt aangesproken komt de error
app.use(errRouter);

// app laten draaien op port 3000
app.listen(3000, function(){
	console.log('Port 3000 it is');
});
