// pull in all the packages we'll need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var AWS = require('aws-sdk');        

//AWS connection      
AWS.config.update({
	accessKeyId: process.env.S3_KEY, 
	secretAccessKey: process.env.S3_SECRET, 
	region:process.env.REGION 
});

var s3 = new AWS.S3();

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
// get an instance of the express Router
var router = express.Router();  

// middleware called with all requests
router.use(function(req, res, next) {
    // do logging
    next(); // make sure we go to the next routes
});

// get random object in s3 bucket
router.post('/', function(req, res) {
	var text = req.body.text;

	s3.listObjects({Bucket: "cliffy", EncodingType: "url"}, function(err, data){
    //pick a random item in this bucket
		var random = Math.floor((Math.random() * data.Contents.length));

    //TODO: is there an api call to check if this item is public and then make it public if not?
    //for now we have to manually make them public in the s3 console 
    //TODO: shouldn't have this hardcoded, use get public url if possible 
    var key = data.Contents[random].Key; 
		var url = "https://s3-us-west-1.amazonaws.com/cliffy/" + data.Contents[random].Key; 

    res.header("Content-Type", "application/json");
		res.status(200).json({response_type: "in_channel", attachments: [{text: "cliffy", image_url: url}]});
	});
});

//the REST (lol) of the routes go here 

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic through portal ' + port);

