var express = require('express');
var router = express.Router();
var ExifImage = require('exif').ExifImage;
var dms2dec = require('dms2dec');

//index staat gelijk aan photo id in database, zo wordt de juiste foto weergegeven
router.get('/:index', function(req, res, next){
	var query1 = 'SELECT * FROM photos INNER JOIN comments ON photos.id = comments.photo_id WHERE photos.id = ?'
	var query2 = 'SELECT * FROM photos WHERE id= ?';
	var query3 = 'SELECT * FROM comments WHERE photo_id = ?'
	req.getConnection(function(err, connection){
		//bij error
		if(err) return next(err);

		//query uitvoeren om alle fotos op te halen
		connection.query(query2, [req.params.index], function(err, results){
			console.log(results);
			res.locals.results = results;
			res.locals.title = results[0].filename;

			//query uitvoeren om alle comments op te halen
			connection.query(query3, [req.params.index], function(err, dataComments){

						//exif gegevens uit de .jpg bestanden halen
				   		new ExifImage({ image : 'public/uploads/' + results[0].filename }, function (error, exifData) {
				        		if (error){
				            	console.log('Error: '+error.message);
				            	} 
				            		//als exif gegevens zijn gevonden
					            	if(exifData){
						            	console.log(exifData);
						            	//gps gegevens om zetten naar decimalen voor Google Maps
										var dec = dms2dec(exifData.gps.GPSLatitude, exifData.gps.GPSLatitudeRef, exifData.gps.GPSLongitude, exifData.gps.GPSLongitudeRef);
										console.log(dec);
										res.locals.dec = dec;
									} else {
										res.locals.dec = undefined;
									}

									// array omkeren zodat de recente comments boven komen te staan
									dataComments.reverse();
									res.locals.dataComments = dataComments;				
									res.locals.session = req.session;
									res.locals.req = req;
									res.render('show', {
										postUrl: '/mypicture/login'
									});		
				    	});
			});
		});
	});
});

//posten van een comment op de juiste foto
router.post('/:index/comment', function(req, res, next){
	req.getConnection(function(err, connection){
		//bij error
		if(err) return next(err);
		if(req.session.username){
			req.body.commenter = req.session.username;
		}

		//query om comments in de database te voegen
		connection.query('INSERT INTO comments (photo_id, comment, commenter) VALUES (?, ?, ?)'
		, [req.params.index, req.body.comment, req.body.commenter], function(err, results){
			if(err) return next(err);

			//terug naar des betreffende foto
			res.redirect(req.baseUrl + '/' + req.params.index);
		});
	});
});

// exports de router naar de app
module.exports = router;