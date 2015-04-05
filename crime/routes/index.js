var express = require('express');
var router = express.Router();
var unirest = require('unirest');

var counter = 0;

/* GET home page. 
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
*/

/* GET Landing Page */
router.get('/about', function(req, res) {
	res.render('landing', { title: 'Neighborhood Watch'});
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
    var city = req.body.city;
    var state = req.body.state;

    // Set our collection
    var collection = db.get('usercollection');

    //Replace search field spaces with '+'
    var new_city = city.replace(/ /g, "+");
    var zillow_url = "http://www.zillow.com/webservice/GetDemographics.htm?zws-id=X1-ZWz1b2gfe4yjuz_a3t9y&city="+new_city+"&state="+state;

    var jsdom = require("jsdom");
    jsdom.env(
        zillow_url,
        ["http://code.jquery.com/jquery.js"],
        function (errors, window) {
            var lat = window.$("latitude").text();
            var lon = window.$("longitude").text();
            jsdom.env(
                window.$("affordability").text(),
                ["http://code.jquery.com/jquery.js"],
                function (errors2, window) {
            
                    res.render('results', { title: 'Results For Your Neighborhood', 
                        city: city, 
                        state: state, 
                        tz: "N/A", 
                        lat: lat, 
                        lon: lon,  
                        avg_home_prices: window.$("h2:first").text(),
                    });
                });
        });

    /*
    var new_city = city.replace(/ /g, "+");
    unirest.get("http://www.zillow.com/webservice/GetDemographics.htm?zws-id=X1-ZWz1b2gfe4yjuz_a3t9y&city="+new_city+"&state="+state)
    .header("X-Mashape-Key", "00nWJd3S5ZmshdkVpBqujaDny0cnp1WVFlwjsn2SZg6cLBCxXL")
    .header("Accept", "xml")
    .end(function (result_xml) {
        
        res.render('results', { title: 'Results For Your Neighborhood'/*, name: json1['name'], type: json1['type'], tz: json1['tzs'], country: json1['c'], lat: json1['lat'], lon: json1['lon'], no_crimes: json1['no_crimes'] });
        });
        /*
        var json = JSON.stringify(result);
        var json1 = JSON.stringify(json["body"]);
        console.log("OUTPUT=",json["body"]);*/
        //res.render('results', { title: 'Results For Your Neighborhood'/*, name: json1['name'], type: json1['type'], tz: json1['tzs'], country: json1['c'], lat: json1['lat'], lon: json1['lon'], no_crimes: json1['no_crimes'] */});
        /*console.log("\nOUTPUT=",result.body);
        
        var json1;
        if ( result.body['Results'].length == 0 ) {
            json1 = { "name": "N/A", "type": "N/A", "tzs": "N/A", "c": "N/A", "lat": "N/A", "lon": "N/A", "no_crimes":"N/A"};
            res.render('results', { title: 'Results For Your Neighborhood', name: json1['name'], type: json1['type'], tz: json1['tzs'], country: json1['c'], lat: json1['lat'], lon: json1['lon'], no_crimes: json1['no_crimes'] });
        }
        else {
            json1 = result.body['Results'][0];

            unirest.get("https://jgentes-Crime-Data-v1.p.mashape.com/crime?enddate=4%2F1%2F2015&lat="+json1['lat']+"&long="+json1['long']+"&startdate=4%2F1%2F2014")
            .header("X-Mashape-Key", "wq12TdjK70mshFahNLTwVPBSBKTcp1saVHHjsnVwwmdWNixkU5")
            .header("Accept", "application/json")
            .end(function (result) {
                console.log("\nOUTPUT: ",result.body.length);
                json1['no_crimes'] = result.body.length;
                res.render('results', { title: 'Results For Your Neighborhood', name: json1['name'], type: json1['type'], tz: json1['tzs'], country: json1['c'], lat: json1['lat'], lon: json1['lon'], no_crimes: json1['no_crimes'] });
            });
        }
        
    });*/

    

    // Submit to the DB
    collection.insert({
        "city" : city,
        "state" : state
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
