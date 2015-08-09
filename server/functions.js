var http = require('http');
var querystring = require('querystring');

const ENCODING = 'utf8';

var searchDuration = 100; // How often to check whether all words have been looked up
var minWordLength = 3;
var giveUpAfterNAttempts = 20;
var lookupsSoFar;

var hostName = 'api.wordnik.com';
var apiKey = '28875f198b7568357d0251be0a70296428eac8ef76af0a3b1';
var config = {
	api_key: apiKey,
	caseSensitive: false,
	limit: 1,
};
var configString = querystring.stringify(config);
var errorText = 'Error contacting Wordnik';

// Wordnik response takes the following format:
// ""{\"totalResults\":3,\"searchResults\":[{\"lexicality\":0.0,\"count\":79883,\"word\":\"apples\"}]}""

function getAllPossibleWords(wordQuery){
	// Use the first longest word, e.g.
	// CATORCH: catorch, catorc, atorch, cator, atorc, [torch], cato, ator,...
	var words = [];
	addAllWordsOfLength(wordQuery, words, wordQuery.length);
	return words;
}

function addAllWordsOfLength(wordQuery, words, tryLength){
	if(tryLength < minWordLength){
		return;
	}
	
	for(var i = 0; i <= wordQuery.length; i++){
		var min = i;
		var max = i + tryLength;
		if(max > wordQuery.length){
			return addAllWordsOfLength(wordQuery, words, tryLength - 1);
		}
		var word = wordQuery.substring(min, max);
		words.push({word:word, exists:false, response:undefined});
	}
}

function functions(response, postdata) {
	var queryObject = querystring.parse(postdata);
	var wordQuery = queryObject.word;
	
	console.log('Looking up: '  + wordQuery);
	
	var words = getAllPossibleWords(wordQuery);
	
	// Kick this off for all possible words. We need to wait til they all return
	for(var i = 0; i < words.length; i++){
		lookupWord(words[i], response);
	}
	
	// Once lookup is completed for every word, checkIfFinished will find and return the longest valid word
	lookupsSoFar = 0;
	var timer = setInterval((function() {    
            checkIfFinished(response, words, timer);
	 }), searchDuration);
}

function lookupWord(wordThing, response){
	var word = wordThing.word;
	var path = '/v4/words.json/search/' + word + '?' + configString;
	
	var options = { 
		host: hostName,
		port: 80,
		path: path
	};

	var req = http.get(options, function(res) {
	
		if(res.statusCode === 200){
			res.setEncoding(ENCODING);
			var body = '';
			res.on('data', function(chunk) {
					body += chunk;
			}).on('end', function () {
				
				wordThing.response = 200;
				
				var bodyResult = JSON.parse(body);
				var exists = bodyResult.totalResults != 0;
				wordThing.exists = exists; 
				console.log('Successfully looked up ' + word + '. Found ' + bodyResult.totalResults + ' instances.');
			});            
	
		} else {
			wordThing.response = 500;
			console.log(errorText);
		}
    }).on('error', function(err) {
		wordThing.response = 500;
		console.log(errorText + ': ' + err.message);
    });	
	
	req.end();

}


function checkIfFinished(response, words, timer){
	lookupsSoFar += 1;
	console.log(lookupsSoFar);
	if(lookupsSoFar == giveUpAfterNAttempts){
		response.writeHead(500, {"Content-Type": "text/html"});    
        console.log('Timed out looking for word');
        response.write('Timed out looking for word');
        response.end();
	}
	
	for(var i = 0; i < words.length; i++){
		if(words[i].response == undefined) return false;
	}
	clearInterval(timer);
	var longestBestWord = '';
	for(var i = 0; i < words.length; i++){
		if(words[i].exists == true) {
			longestBestWord = words[i].word;	
			break;
		}
	}
	response.writeHead(200, {"Content-Type": "text/html"});    
        console.log("Best word is: " + longestBestWord);
        response.write("Best word is: " + longestBestWord);
        response.end();
	
	return true;
}

exports.functions = functions;
