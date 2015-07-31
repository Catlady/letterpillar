var querystring = require('querystring');
var fs = require('fs');
var path = require('path');

// Convert URL request to static file path
function static(response, postData) {
    
    var filePath = '.' + postData;
    if (filePath === './' || filePath === '.' || filePath === '.\\') {
        filePath = './index.html';
    }
    console.log('Loading ' + postData);
    var contentType = getContentType(path.extname(filePath));
        
    fs.exists(filePath, function(exists) {
        if (exists) {
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    response.writeHead(500, {'Content-Type': contentType});
                    response.end('500 Error', 'utf-8');
                } else {
                    response.writeHead(200, {'Content-Type': contentType});
                    response.end(content, 'utf-8');
                }
            });
        } else {
            console.log('Static file path '+filePath+' not found, responded with 404 error');
            response.writeHead(404, {'Content-Type': contentType});
            response.end('404 Not found', 'utf-8');
        }
    });
}

function favicon() {
    console.log('No favicon set');
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
        default:
            contentType = 'text/plain';
            break;            
    }
    return contentType;
}

// public methods or something like that
exports.static = static;
exports.favicon = favicon;