var express = require('express');
var router = express.Router();
var unirest = require('unirest');
var http = require('http');
var parseString = require('xml2js').parseString;
var graph = require('fbgraph');

var counter = 0;

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
    res.render('newuser', { title: 'Know Your Community' });
});

/* GET New User page. */
router.get('/facebook', function(req, res) {
    
    graph.setAccessToken(accessToken);

    var wallPost = {
        message: "I'm gonna come at you like a spider monkey, chip!"
    };

    graph.post("/feed", wallPost, function(err, res) {
      // returns the post id
      console.log(res); // { id: xxxxx}
    });
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

    //Replace search field spaces with '+'
    var new_city = city.replace(/ /g, "+");
    var zillow_url = "http://www.zillow.com/webservice/GetDemographics.htm?zws-id=X1-ZWz1b2gfe4yjuz_a3t9y&city="+new_city+"&state="+state;
    
    unirest.get(zillow_url)
    .header("Accept", "application/xml")
    .end(function (result) {
        var xml = result.body;
        parseString(xml, function (err, result) {
            //var json = JSON.stringify(result);
            //console.log(json);
            console.log("Yolo ",result['Demographics:demographics']['message'][0]['code'][0]);
            if ( parseInt(result['Demographics:demographics']['message'][0]['code'][0]) != 0 ) {
                res.render('results', { title: 'Results For Your Neighborhood', city:"N/A", state:"N/A"});
            } 
            else {
            
                var root = result['Demographics:demographics']['response'][0]['pages'][0]['page'];
                var afford = root[0];
                var homes = root[1];
                var people = root[2];
                
                var aff = afford['tables'][0]['table'][0]['data'][0]['attribute'];
                var avg_home_value = aff[0]['values'][0]['city'][0]['value'][0]['_'];
                var med_single_family = aff[1]['values'][0]['city'][0]['value'][0]['_'];
                var prop_tax = aff[13]['values'][0]['city'][0]['value'][0]['_'];

                var percent_owners = parseFloat(homes['tables'][0]['table'][0]['data'][0]['attribute'][0]['values'][0]['nation'][0]['value'][0]['_'])*100;

                var peo = people['tables'][0]['table'][0]['data'][0]['attribute'];
                var med_household_income = peo[0]['values'][0]['nation'][0]['value'][0]['_'];
                var med_age = peo[3]['values'][0]['nation'][0]['value'][0];
                var avg_commute_time = peo[6]['values'][0]['nation'][0]['value'][0];

                var lat = result['Demographics:demographics']['response'][0]['region'][0]['latitude'][0];
                var lon = result['Demographics:demographics']['response'][0]['region'][0]['longitude'][0];

                console.log(lat);

                unirest.get("https://simple-weather.p.mashape.com/weather?lat="+lat+"&lng="+lon)
                .header("X-Mashape-Key", "00nWJd3S5ZmshdkVpBqujaDny0cnp1WVFlwjsn2SZg6cLBCxXL")
                .header("Accept", "text/plain")
                .end(function (result) {
                        
                        res.render('results', { title: 'Results For Your Neighborhood', 
                                    city: city, 
                                    state: state, 
                                    avg_home_value: parseFloat(avg_home_value).toFixed(2), 
                                    med_single_family: parseFloat(med_single_family).toFixed(2), 
                                    prop_tax: parseFloat(prop_tax).toFixed(2),
                                    percent_owners: parseFloat(percent_owners).toFixed(2),
                                    med_household_income: parseFloat(med_household_income).toFixed(2),
                                    med_age: med_age,
                                    lon: lon,  
                                    lat: lat,
                                    avg_commute_time: parseFloat(avg_commute_time).toFixed(2),
                                    weather: result.body
                        });

                });
                
                    
            }
        });
    });

});

module.exports = router;
