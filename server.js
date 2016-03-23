// pull in all the packages we use
var express    = require('express');      
var app        = express();                 
var bodyParser = require('body-parser');
var AWS = require('aws-sdk');        

//AWS connection      
AWS.config.update({
	accessKeyId: process.env.S3_KEY, 
	secretAccessKey: process.env.S3_SECRET, 
	region:process.env.REGION 
});

var s3 = new AWS.S3();
var bucket = process.env.S3_BUCKET;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080; 
var router = express.Router();  

// middleware for all requests
router.use(function(req, res, next) {
	var token = req.body.token; 
	var user = req.body.user_id
	
	switch (token)
	{
		case process.env.LADIES_TOKEN: 
				next();
				break; 
		case process.env.IDI_TOKEN:
			if(process.env.IDI_NAMES && process.env.IDI_NAMES.includes(user)){
				next();
				break;
			} //else, continue on to the default
		default:
			res.header("Content-Type", "application/json");
			res.status(200).json({response_type: "in_channel", text: "You don't currently have access to cliffy,"
			+ " check with haley. If you don't know who that is, you're in the wrong place."});
	}
});

// get random object in s3 bucket
router.post('/', function(req, res) {
	var text = req.body.text;

	s3.listObjects({Bucket: bucket, EncodingType: "url"}, function(err, data){
    	//pick a random item in this bucket
		var random = Math.floor((Math.random() * data.Contents.length));
	
    	//TODO: is there an api call to check if this item is public and then make it public if not?
    	//for now we have to manually make them public in the s3 console 
    	//TODO: shouldn't have this hardcoded, use get public url if possible 
    	var key = data.Contents[random].Key; 
		var url = "https://s3-us-west-1.amazonaws.com/" + bucket + "/" + data.Contents[random].Key; 
	
    	res.header("Content-Type", "application/json");
		res.status(200).json({response_type: "in_channel", attachments: [{text: "cliffy", image_url: url}]});
	});
});

//the REST (lol) of the routes will go here 

//access this set of routes through the app under the home '/'
app.use('/', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic through portal ' + port);

