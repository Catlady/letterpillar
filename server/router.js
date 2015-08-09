/*Route incoming requests*/


function route(handle, pathname, response, postData) {
    
    // If pathname represents server function, pass request to that function. 
    // Otherwise, serve requested page from file system
    if (typeof handle[pathname] === 'function') {
        handle[pathname](response, postData);
    } else {
        handle['/static'](response, pathname);
    }
}
exports.route = route;