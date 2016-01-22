var express = require('express');
var router = express.Router();

var queryPhotos = 'SELECT * FROM photos';

// weergeven van index.ejs
router.get('/', function(req, res, next){
	req.getConnection(function(err, connection){
		//bij error
		if (err) return next(err);

		//query om alle foto's op te halen
		connection.query(queryPhotos, function(err, results){
			// array omdraaien zodat recente foto's bovenaan komen
			results.reverse();
			res.locals.results = results;
			res.locals.title = "The Pictures";
			res.locals.session = req.session;
			res.locals.req = req;
			res.render('index', {
				postUrl: '/mypicture/login'
			});
		});
	});
});


// exports de router naar de app
module.exports = router;