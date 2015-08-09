var http = require('http');

function functions(response, postdata) {
	console.log('Handling request for... '  + postdata);
	
    var apiKey = '28875f198b7568357d0251be0a70296428eac8ef76af0a3b1';
	var baseUrl = 'http://developer.wordnik.com/v4';
	var addnlUrl = '/words.json';
	var wordnikURL = 'http://api.wordnik.com/v4/word.json/' + word + '/definitions?';

	var word = "barnacle";
	var config = {
		api_key: apiKey,
		limit: 10,
		sourceDictionaries: 'ahd,wiktionary'
	};
	  for(var option in config) {
  	wordnikURL = wordnikURL + "&" + option + "=" + config[option];
  }
		
	
	var hostName = 'www.ncbi.nlm.nih.gov';
	hostName = 'api.wordnik.com';
	
	var path = '/blast/Blast.cgi?CMD=Put&'+postdata;
	path = '/v4/word.json/' + word + '/definitions?';
	for(var option in config) {
		path = path + "&" + option + "=" + config[option];
	}
		
	
	var options = { host: hostName,
                    port: 80,
                    path: path};
			

	    var req = http.get(options, function(res) {
        
        if(res.statusCode === 200){
            res.setEncoding('utf8');
            var body = '';
            res.on('data', function(chunk) {
                    body += chunk;
            }).on('end', function () {
				
                console.log('FINISHED');
				console.log(res);
				response.writeHead(200, {"Content-Type": "text/html"});    
				var petString = JSON.stringify(body);
			response.write(petString);
				response.end();
            });            
        
        } else {
			console.log(path);
            console.log('Unknown error getting results from NCBI');
            response.writeHead(500, {"Content-Type": "text/html"});    
            response.write("Error getting response from NCBI");
			//var petString = JSON.stringify(res);
			//response.write(petString);
			
            response.end();
            
        }
        
    }).on('error', function(err) {
        console.log('got error: ' + err.message);
        response.writeHead(500, {"Content-Type": "text/html"});    
        response.write("Error contacting NCBI");
        response.end();
        //clearInterval(timer);
    });		
					
}



exports.functions = functions;
