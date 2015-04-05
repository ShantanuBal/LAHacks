var express = require('express');
var router = express.Router();
var unirest = require('unirest');

/* GET home page. 
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
*/

/* GET Landing Page */
router.get('/about', function(req, res) {
	res.render('landing', { title: 'Know Your Community'});
});

/* GET Userlist page. */
router.get('/userlist', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    /*console.log("\nJSON:",json);*/
    collection.find({},{},function(e,docs){
        res.render('userlist', {
            "userlist" : docs
        });
    });
});

/* GET New User page. */
router.get('/', function(req, res) {
    res.render('newuser', { title: 'Search A Neighborhood' });
});

/* POST to Add User Service */
router.post('/results', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var userName = req.body.username;
    /*var userEmail = req.body.useremail;*/

    // Set our collection
    var collection = db.get('usercollection');

    //Replace search field spaces with '+'
    var query = userName.replace(/ /g, "+");
    console.log("\nQuery="+query);
    unirest.get("https://devru-latitude-longitude-find-v1.p.mashape.com/latlon.php?location="+query)
    .header("X-Mashape-Key", "00nWJd3S5ZmshdkVpBqujaDny0cnp1WVFlwjsn2SZg6cLBCxXL")
    .header("Accept", "application/json")
    .end(function (result) {
        /*console.log(result.status, result.headers, "OUTPUT=",result.body);*/
        console.log("\nOUTPUT=",result.body);
        var json;
        if ( result.body['Results'].length == 0 ) {
            /*res.render('results', { title: 'Results For Your Neighborhood', name: "Result Not Found", ty });*/
            json1 = { "name": "N/A", "type": "N/A", "tzs": "N/A", "c": "N/A", "lat": "N/A", "lon": "N/A"};
        }
        else {
            json1 = result.body['Results'][0];
        }
        res.render('results', { title: 'Results For Your Neighborhood', name: json1['name'], type: json1['type'], tz: json1['tzs'], country: json1['c'], lat: json1['lat'], lon: json1['lon'] });
    });

    // Submit to the DB
    collection.insert({
        "username" : userName /*,
        "email" : userEmail*/
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // If it worked, set the header so the address bar doesn't still say /adduser
            res.location("results");
            // And forward to success page
            /*res.redirect("userlist");*/
        }
    });
});

module.exports = router;
