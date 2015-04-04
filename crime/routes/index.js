var express = require('express');
var router = express.Router();

/* GET home page. 
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
*/

/* GET Landing Page */
router.get('/', function(req, res) {
	res.render('landing', { title: 'Neighborhood Watch'});
});

module.exports = router;
