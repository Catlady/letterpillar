/*Start server and pass incoming requests to router*/

var http = require('http');
var url = require('url');

const PORT = 1337;
const ENCODING = 'utf8';

function start(route, handle) {
    
    // Start server
    http.createServer(onRequest).listen(process.env.VMC_APP_PORT || PORT, null);
	console.log('Server listening on: http://localhost:%s', PORT);
    
    // Executed whenever server receives a request
    function onRequest(request, response) {
		
        var postData = '';
        var pathname = url.parse(request.url, true).pathname.toLowerCase();
		console.log('Received request for ' + pathname);
		
        request.setEncoding(ENCODING);
        request.addListener('data', function(postDataChunk) {
            postData += postDataChunk;
        });
        request.addListener('end', function() {
            route(handle, pathname, response, postData);
        });
    }
}
exports.start = start;
