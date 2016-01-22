var express = require('express');
var router = express.Router();
var fs = require('fs');

router.get('/', function(req, res){
	if(req.session.username){
		//connectie maken met db
		req.getConnection(function(err, connection){
			//bij error
			if (err) return next(err);

			//query uitvoeren waarbij alle fotos van de ingelogde gebruiker worden opgehaald
			connection.query('SELECT * FROM photos WHERE user_id = ?', [req.session.userid], function(err, results){
				console.log(results);
				res.locals.results = results;
				res.locals.title = "My Picture";
				res.locals.session = req.session;
				res.locals.req = req;
				res.render('./mypicture/index');
			});
		});

	} else {
		res.redirect('/mypicture/login');
	}
});

//uploaden vanaf mypicture
router.post('/upload', function(req, res){
	console.log(req.file);
  	// A file was uploaded if req.file is not undefined
  	if(req.file !== undefined && (req.file.mimetype == 'image/png' || req.file.mimetype == 'image/jpeg')) {
    	
    		// verplaatsen en hernoemen van het bestand
    		fs.rename(req.file.path, req.file.destination + req.file.originalname, function(err){ 
    			console.log('nog steeds hoor');
      			if(err) return next(err);
    		});

    	//maak connectie met db		
    	req.getConnection(function(err, connection){
    		//bij error
			if (err) return next(err);

			//query uitvoeren om fotos in de db te voegen
			connection.query('INSERT INTO photos (user_id, caption, filename) VALUES (?, ?, ?)', [req.session.userid, req.file.originalname, req.file.originalname], function(err, results){
					//bij error
					if(err) return next(err);
			});
    	});
  	}
  	res.redirect('/mypicture/');
});


//login form tonen
router.get('/login', function(req, res){
	res.locals.session = req.session;
		res.locals.req = req;
	res.render('mypicture/login', {
		postUrl: '/mypicture/login'
	});
});

//form in login behandelen
router.post('/login', function(req, res){
	//maak connectie met db
	req.getConnection(function(err, connection){
		var username = req.body.username;
		var password = req.body.password;
		//bij error
		if (err) return next(err);

		//gegevens uit de database halen waar naam en wachtwoord gelijk is aan de ingevulde gegevens 
		connection.query('SELECT * FROM users WHERE name = ? AND password = ?', [username, password] , function(err, results) {
			console.log(results);

			if (err) return next(err);

			//Als de arrey 0 objecten bevat is de naam of het wachtwoord fout
			if(results.length < 1) {
				res.send('nope');
			} else {
				//opgehaalde gegevens in de session zetten
				req.session.username = results[0].name;
        		req.session.userid = results[0].id;
        		res.redirect('../');
			}
		});
	});
});

//registreren
router.get('/register', function(req, res, next){
	res.locals.postUrl = 'register';
	res.locals.session = req.session;
	res.locals.req = req;
	res.render('mypicture/register');
});

//user aanmaken
router.post('/register', function(req, res, next){
	req.getConnection(function(err, connection){
		//bij error
		if (err) return next(err);

		// user wordt aangemaakt in db
		connection.query('INSERT INTO users (email, password, name) VALUES (?,?,?)', 
		[req.body.email, req.body.password, req.body.username], function(err, results){
			//bij error
			if (err) return next(err);

			req.session.username = req.body.username;
			console.log(results);
        	req.session.userid = results.insertId;
        	req.session.username = req.body.username;
			res.locals.session = req.session;
			res.locals.req = req;
			res.render('mypicture/index');
			res.redirect('/');
		});
	});
});

//uitloggen
router.get('/logout', function(req, res, next){
	//verwijderen van sessie 
	req.session.destroy(function(){
		res.redirect(req.baseUrl);
	});
});

// exports de router naar de app
module.exports = router;