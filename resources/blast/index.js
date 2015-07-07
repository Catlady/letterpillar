var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requesthandlers");
var blast = require("./blast");

/*CASE SENSITIVE! (lowercase url please)*/
var handle = {};
handle["/"] = requestHandlers.static;
handle["/favicon.ico"] = requestHandlers.favicon;
handle["/blast"] = blast.blast;
handle["/static"] = requestHandlers.static;

server.start(router.route, handle);