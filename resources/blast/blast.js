/*
 * Request handlers for contacting NCBI Blast Server
 */

var http = require('http');

var hostName = 'www.ncbi.nlm.nih.gov';
var searchDuration = 10000;     // Time between each NCBI search after initial request is sent
var numReqBeforeTimeout = 10;   // Number of times to check NCBI for response before timeout

/*Initiate a blast search*/
function blast(response, postdata) {
    console.log('Processing blast request: ?CMD=Put&'+postdata);
    getResult(response, hostName, 
                '/blast/Blast.cgi?CMD=Put&'+postdata, getRid);
}

/*Send a GET request to NCBI, and pass the response to function onEnd*/
function getResult(response, hostName, path, onEnd, i, rid, timer){
    var options = { host: hostName,
                    port: 80,
                    path: path};
        
    var req = http.get(options, function(res) {
        
        if(res.statusCode === 200){
            res.setEncoding('utf8');
            var body = "";
            res.on('data', function(chunk) {
                    body += chunk;
            }).on('end', function () {
                onEnd(response, body, i, rid, timer);
            });            
        
        } else {
            console.log('Unknown error getting results from NCBI');
            response.writeHead(500, {"Content-Type": "text/html"});    
            response.write("Error getting response from NCBI");
            response.end();
            clearInterval(timer);
        }
        
    }).on('error', function(err) {
        console.log('got error: ' + err.message);
        response.writeHead(500, {"Content-Type": "text/html"});    
        response.write("Error contacting NCBI");
        response.end();
        clearInterval(timer);
    });
}

/*Get request ID from NCBI initial response, and poll until search results are available*/
function getRid(response, body){
    var rid = getRequestID(body);
    checkSearchStatus(response, rid);
}

/*Check if search results are ready. If yes, get results as XML*/
function checkRequestStatus(response, body, i, rid, timer){
    console.log(i+":  Checking if results are ready");    
    if (isRequestReady(body) === 1) {
        console.log("SEARCH IS READY");
        var i = 0;
        getResult(response, hostName,
                '/blast/Blast.cgi?RESULTS_FILE=on&RID=' 
                        + rid + '&FORMAT_TYPE=XML&FORMAT_OBJECT=Alignment&CMD=Get',
                xmlRsltToJson, ++i);
        clearInterval(timer);
    } else if(isRequestReady(body) === -1){
        console.log('Error contacting NCBI');
        response.writeHead(500, {"Content-Type": "text/html"});    
        response.write("Error contacting NCBI");
        response.end();
        clearInterval(timer);
    } else if(i > numReqBeforeTimeout){
        console.log('Timed out checking for response ('+i+')');
        response.writeHead(500, {"Content-Type": "text/html"});    
        response.write("Timed out getting response from NCBI");
        response.end();
        clearInterval(timer);
    } else {
        //if(isRequestReady(body) === 0), do nothing
    }
}
/*Write XML search results as JSON string to localStorage*/
function xmlRsltToJson(response, body){
    console.log("Loading XML");
    response.writeHead(200, {"Content-Type": "text/html"});    
    var result = JSON.stringify(body);
    response.write('<script type=\'text/javascript\'>localStorage.resultFile = \''
            +result+'\'; localStorage.pleaseLoad = \'true\'; window.close();</script>');
    response.end();
}

/*Get formatted comment section from NCBI response. Comment format will be:
    <!--QBlastInfoBegin
       [body of comment]
       QBlastInfoEnd
       -->
 */
function getNcbiComment(str){
    return str.split('QBlastInfoBegin')[1].split('QBlastInfoEnd')[0];
}

/*Get RID from NCBI response. Comment format will be:
    <!--QBlastInfoBegin
    RID = V86FGRN3014
    RTOE = 20
    QBlastInfoEnd
    -->
 */
function getRequestID(body){
    return getNcbiComment(body).split('RID = ')[1].split('RTOE')[0].trim();
}

/*Get request status from NCBI response. Returns 1 if response is ready, 0 if 
still waiting, and -1 for error conditionComment format will be:
    <!--QBlastInfoBegin
        Status=WAITING          [ || READY]
    QBlastInfoEnd
    -->
 */
function isRequestReady(body){
    var xx = getNcbiComment(body).split('Status=')[1].trim();
    if(xx === 'WAITING'){
        return 0;
    } else if (xx === 'READY') {
        return 1;
    } else {
        return -1;
    }
} 

/*Check NCBI every 10 seconds for search result*/
function checkSearchStatus(response, rid){
    console.log("RID " + rid );
    if(typeof rid === 'undefined' || rid === ""){ 
        response.writeHead(200, {"Content-Type": "text/html"});    
        console.log('getResultFile error: invalid search query (no rid returned)');
        response.write("Error: invalid search query");
        response.end();
    } else {
        var i = 0;
        var timer = setInterval((function() {    
            getResult(response, hostName, 
                '/blast/Blast.cgi?RID='+rid+'&CMD=Get', checkRequestStatus, ++i, rid, timer);
          }), searchDuration);
    }
}

exports.blast = blast;
