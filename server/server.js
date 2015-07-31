/*Start server and pass incoming requests to router*/

var http = require('http');
var url = require('url');

function start(route, handle) {
    
    // Start server
    http.createServer(onRequest).listen(process.env.VMC_APP_PORT || 1337, null);
    console.log('STARTED SERVER');
    
    // Executed whenever server receives a request
    function onRequest(request, response) {
        var postData = '';
        var pathname = url.parse(request.url, true).pathname.toLowerCase();
        request.setEncoding('utf8');
        request.addListener('data', function(postDataChunk) {
            postData += postDataChunk;
        });
        request.addListener('end', function() {
            route(handle, pathname, response, postData);
        });
    }
}
exports.start = start;
