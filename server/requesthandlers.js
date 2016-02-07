var querystring = require('querystring');
var fs = require('fs');
var path = require('path');

const ENCODING = 'utf-8';

// Convert URL request to static file path
function static(response, pathname) {
    
    var filePath = '.' + pathname;
    if (filePath === './' || filePath === '.' || filePath === '.\\') {
        filePath = './index.html';
    }
	
    var contentType = getContentType(path.extname(filePath));
        
    fs.exists(filePath, function(exists) {
        if (exists) {
			console.log('Loading ' + filePath + '...');
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    response.writeHead(500, {'Content-Type': contentType});
                    response.end('500 Error', ENCODING);
                } else {
                    response.writeHead(200, {'Content-Type': contentType});
                    response.end(content, ENCODING);
                }
            });
        } else {
            console.log('Static file path '+filePath+' not found, responded with 404 error');
            response.writeHead(404, {'Content-Type': contentType});
            response.end('404 Not found', ENCODING);
        }
    });
}

function favicon(response) {
	
	console.log('Fetching favicon');
	return static(response, 'favicon.ico');
}

function testingfunction(){
	console.log('Yes this is a function');
}

function getContentType(extname){
    var contentType;
    switch (extname) {
        case '.html':
            contentType = 'text/html';
            break;
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.gif':
            contentType = 'image/gif';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.xml':
            contentType = 'text/xml';
            break;
		case '.ico':
            contentType = 'image/x-icon';
            break;
        default:
            contentType = 'text/plain';
            break;            
    }
    return contentType;
}

exports.static = static;
exports.favicon = favicon;
exports.testingfunction = testingfunction;