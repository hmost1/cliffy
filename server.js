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
var router = express.Router();              // get an instance of the express Router

// middleware called with all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Call made');
    next(); // make sure we go to the next routes
});

// get random object in s3 bucket
router.post('/', function(req, res) {
	var text = req.body.text;

	s3.listObjects({Bucket: "cliffy"}, function(err, data){
		var random = Math.floor((Math.random() * data.Contents.length));
		var url = s3.getSignedUrl('getObject', {Bucket: "cliffy", Key: data.Contents[random].Key});
		res.header("Content-Type", "application/json");
		switch(text){
			case "1":
				res.status(200).json({response_type: "in_channel", text: "welcome to cliffy", attachments: [{text: "1", image_url: url}]});
				break;
  			case "2":
  				url = "https://cliffy.s3.amazonaws.com/giphy.gif";
  			  	res.status(200).json({response_type: "in_channel", text: "welcome to cliffy", attachments: [{text: "2", image_url: url}]});
  			  	break;
  			case "3":
  				url = "http://i.giphy.com/3o6UBo8U2iHUG5mszS.gif"
  				res.status(200).json({response_type: "in_channel", text: "welcome to cliffy", attachments: [{text: "3", image_url: url}]});
  				break;
  			case "4":
  				res.status(200).json({response_type: "in_channel", text: "welcome to cliffy", attachments: [{image_url: url}]});
  				break;
  			default:
  				res.status(200).json({response_type: "in_channel", attachments: [{text: "cliffy", image_url: url}]});
				break;
		}
	});
});

router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api with a get!' });   
});

router.put('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api with a put!' });   
});


//the REST (lol) of the routes go here 

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic through portal ' + port);

