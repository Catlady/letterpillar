var http = require('http');
var querystring = require('querystring');

const ENCODING = 'utf8';

const SEARCH_DURATION = 100; // How often to check whether all words have been looked up
const MIN_WORD_LENGTH = 3;
const MAX_WORD_LENGTH = 12;
const GIVE_UP_AFTER_ATTEMPTS = 1000;
var lookupsSoFar;

var hostName = 'api.wordnik.com';
var apiKey = '28875f198b7568357d0251be0a70296428eac8ef76af0a3b1';
var config = {
	api_key: apiKey,
	caseSensitive: false,
	//sourceDictionaries: 'ahd,century,webster,wordnet',
	limit: 1
};
// parameter sourceDictionaries is available for other methods. should use this
/*
ahd				American Heritage Dictionary
century		The Century Dictionary Online
wiktionary	Wiktionary
webster		Merriam-Webster
wordnet		Wordnet (Princeton)
Source dictionary to return definitions from. If 'all' is received, results are returned from all sources. If multiple values are received (e.g. 'century,wiktionary'), results are returned from the first specified dictionary that has definitions. If left blank, results are returned from the first dictionary that has definitions. By default, dictionaries are searched in this order: ahd, wiktionary, webster, century, wordnet
*/

var configString = querystring.stringify(config);
var errorText = 'Error contacting Wordnik';

// Wordnik response takes the following format:
// ""{\"totalResults\":3,\"searchResults\":[{\"lexicality\":0.0,\"count\":79883,\"word\":\"apples\"}]}""


// Alternative client solution:
	// With every server response, we already know the single word that will be accepted. With 
	// every response, send back to the client the list of every word we tried
	// but ONLY IF those words we tried can still be found in the altered query string
	// the client will then send this back with every request. Server identifies all words as per normal,
	// but fills in the responses we already have rather than doing server calls for them

// Get a list of all words that need to be looked up
function getAllPossibleWords(wordQuery){
	// Use the first longest word, e.g.
	// CATORCH: catorch, catorc, atorch, cator, atorc, [torch], cato, ator,...
	
	var words = [];
	
	// TODO AMW test this carefully
	var searchLength = (wordQuery.length > MAX_WORD_LENGTH) ? MAX_WORD_LENGTH : wordQuery.length;
	addAllWordsOfLength(wordQuery, words, searchLength);
	return words;
}

function addAllWordsOfLength(wordQuery, words, tryLength){
	if(tryLength < MIN_WORD_LENGTH){
		return;
	}
	
	for(var i = 0; i <= wordQuery.length; i++){
		var min = i;
		var max = i + tryLength;
		if(max > wordQuery.length){
			return addAllWordsOfLength(wordQuery, words, tryLength - 1);
		}
		var word = wordQuery.substring(min, max);
		words.push({word:word, exists:false, response:undefined, index:i});
	}
}

// TODO AMW test this carefully
function infillWordsFromRequest(words, requestWords){
	if(requestWords == undefined){
		console.log('ERROR: REQUEST WORDS WAS UNDEFINED');
		return words;
	}
	
	for(var i = 0; i < words.length; i++){
		for(var k = 0; k < requestWords.length; k++){
			// index must remain unchanged
			if(words[i].word == requestWords[k].word && requestWords[k].response == 200){
				words[i].exists = requestWords[k].exists;
				words[i].response = requestWords[k].response;
				continue;
			}
		}
	}
	return words;
}

function functions(response, postdata) {
	var requestObject = querystring.parse(postdata);
	var wordQuery = requestObject.word;
	var requestWords = requestObject.previousRequestWords;
	console.log(requestWords);
	if(requestWords != undefined){
		console.log('previousRequestWords was not at first undefined');
		requestWords = JSON.parse(requestWords);
		console.log(requestWords);	
	}
	
	
	console.log('Looking up: '  + wordQuery);
	
	var words = getAllPossibleWords(wordQuery);
	words = infillWordsFromRequest(words, requestWords);
	
	// Kick this off for all possible words. We need to wait til they all return
	// For each word not already infilled from the request, look it up
	for(var i = 0; i < words.length; i++){
		
		if(words[i].response == undefined){ 
			console.log(words[i].response )
			lookupWord(words[i]);	
		} else {
			console.log(words[i].word + ' has already been looked up');
		}
	}
	
	// Once lookup is completed for every word, checkIfFinished will find and return the longest valid word
	lookupsSoFar = 0;
	var timer = setInterval((function() {    
            checkIfFinished(response, words, timer);
	 }), SEARCH_DURATION);
}

function lookupWord(wordThing){
	var word = wordThing.word;
	var searchPath = '/v4/words.json/search/' + word + '?' + configString;
	var definitionPath = '/v4/word.json/' + word + '/definitions?' + configString;
	
	var options = { 
		host: hostName,
		port: 80,
		path: searchPath
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
				console.log(bodyResult);
				
				var exists = false;
				if(bodyResult.totalResults != undefined){
					if(bodyResult.totalResults > 0){
						exists = bodyResult.searchResults[0].count > 0;
					}
				} else {
					exists = false;
					// if lookup is based on definitionPath, use below:
					// exists = bodyResult.length != 0;
				}
				
				wordThing.exists = exists; 
				var resultCount = bodyResult.totalResults != undefined? bodyResult.totalResults : bodyResult.length;
				if(exists)
					console.log('Successfully looked up ' + word + '. Found ' + resultCount + ' instances.');
			});            
			
		} else if(res.statusCode === 0){
			wordThing.response = 0;
			wordThing.exists = false;
			console.log(word + ' not found.');
		} else if(res.statusCode === 503){
			// This is happening quite a bit. Perhaps I am overloading the server
			wordThing.response = 503;
			wordThing.exists = false;
			console.log(word + ' not found.');
	
		} else {
			wordThing.response = res.statusCode;
			console.log(res.statusCode + ' ' + errorText);
		}
    }).on('error', function(err) {
		wordThing.response = 500;
		console.log(500 + ' ' + errorText + ': ' + err.message);
    });	
	
	req.end();

}


function checkIfFinished(response, words, timer){
	lookupsSoFar += 1;
	console.log(lookupsSoFar);
	if(lookupsSoFar == GIVE_UP_AFTER_ATTEMPTS){
		response.writeHead(500, {"Content-Type": "text/html"});    
        console.log('Timed out looking for word');
        response.write('Timed out looking for word');
        response.end();
		
		clearInterval(timer);
		return true;
	}
	
	for(var i = 0; i < words.length; i++){
		if(words[i].response == undefined) return false;
	}
	
	var longestBestWord = '';
	var index = -1;
	for(var i = 0; i < words.length; i++){
		if(words[i].exists == true) {
			longestBestWord = words[i].word;	
			index = words[i].index;
			break;
		}
	}
	response.writeHead(200, {"Content-Type": "text/html"});    
	console.log("Best word is: " + longestBestWord);
	console.log("Found at index: " + index);
        
	var responseObject = { 
		word: longestBestWord,
		points: getPointsForWord(longestBestWord),
		index: index,
		allWords: words	// send everything we looked up back to the client for storage
	};
	
	response.write(JSON.stringify(responseObject));
	response.end();
	
	clearInterval(timer);
	return true;
}

function getPointsForWord(word){
	if(word.length < MIN_WORD_LENGTH) return 0;
	switch (word.length) {
        case 3:
			return 3;
        case 4:
			return 5;
        case 5:
			return 7;
        case 6:
			return 9;
		case 7: 
			return 11;
		case 8: 
			return 13;
		default:
			return 15;
	}	
}

exports.functions = functions;
