var express = require('express');
var router  = express.Router();


// '*' pakt alle (get)reqs die op de router binnen komen
router.get('*', function(req, res, next){
	res.status(404);
	//meegeven voor aside.ejs
	res.locals.session = req.session;
	res.locals.req = req;
	res.render('404',{
		postUrl: '/mypicture/login'
	});
});

// exports de router naar de app
module.exports = router;