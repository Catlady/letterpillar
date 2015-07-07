
    TEMP_CIRCLE = null;
    OUTER_CIRCLE = null;
    NODES = null;
    EDGES = null; 
    GROUPS = null;
    TEXT = null;
    CENTER_NODE = null;
    ROWS = null; 
    CELLS = null;
    CHECKBOXES = null;
    BARS = null;
    TARGET_BAR = null;
    SVG = null; 
    CENTER_X = null, CENTER_Y = null;
    BAR_SCALE = null, LIN_SCALE = null, LOG_SCALE = null;
    CURR_ZOOM = 1;    
    XDATA = null;
    XTARGETDATA = null;
    LATEST_CB = null;
    SCALE_UP = 10;
    columns = ['', 'Hit_num', 'Hit_id', 'Hit_def', 
        'Hit_accession', 'Hit_len', 'Hsp_num', 'Hsp_bit-score', 'Hsp_score', 
        'Hsp_evalue', 'Hsp_query-from', 'Hsp_query-to', 'Hsp_hit-from', 'Hsp_hit-to', 'Hsp_query-frame', 'Hsp_hit-frame', 'Hsp_identity', 'Hsp_positive', 'Hsp_gaps', 'Hsp_align-len', 'Hsp_qseq', 'Hsp_hseq', 'Hsp_midline']; // columns to display in table
    uniqueColId = 'Hit_num'; // unique identifier column
 
    var currentSort = uniqueColId;
    var currentSortType = "asc";
    
 


$(document).ready(function() {

    calculateRadius();
    
    if (! (window.File && window.FileReader && window.FileList && window.Blob)) {
      alert('The File APIs are not fully supported in this browser. This will prevent \n\
            you from uploading data files. \n\nWe recommend the latest versions of Chrome, \n\
            Firefox or IE for this site.');
    }
    
    // Read data from file and render to display
    $.get('NASM6PVC01R-Alignment.xml', null, function (data) {
        XDATA = $(data).find('Hit');
        XTARGETDATA = [$(data).find('Iteration_query-ID').html(),$(data)
                    .find('Iteration_query-def').html()];
        addBarData("#bars");
        drawBars();
        addWheelData("#visualisation");
        drawWheel(calculateRadius());  
        addTableData("#tablePanelInner");
        drawTable(columns, uniqueColId);    
    }, 'text');


    d3.select("#zoomIn").on("click", function () {
        zoomIn();    
    });
    d3.select("#zoomOut").on("click", function () {
        zoomOut();
    });
    
    // Reverses the current selection pattern
    d3.select("#reverseSelected").on("click", function () {
        $('.rowSelectBox').click();
    });

    // Redraw wheel on button click (i.e. if window display has been resized)
    d3.select("#redraw").on("click", function () {
        drawWheel(calculateRadius());  
    });

    $("#removeSelected").click(function () {
        removeSelectedNodes();
    });

    // Toggle wheel scale
    d3.select("#toggleScaleButton")
                .html("View Lin Scale <img src='Images/eye.png'>")
                .on("click", function () {
                    var scale = toggleScale(SVG);                
                    this.innerHTML = scale;
            });

    d3.select("#hasLabels").on("click", function () {
                if(this.checked){
                    TEXT.attr("opacity",1);
                } else {
                    TEXT.attr("opacity",0);
                }
            });
    d3.select("#hasLines").on("click", function () {
                if(this.checked){
                    EDGES.attr("opacity",1);
                } else {
                    EDGES.attr("opacity",0);
                }
            });

    d3.select("#viewClassic").on("click", function () {
                if(this.checked){
                    EDGES.classed("classic",true);
                    NODES.classed("classic",true);
                    TEXT.classed("classic",true);
                    d3.selectAll("#visualisation, #sidebar, #content, #tablePanelInner")
                            .classed("classic",true);
                } else {
                    EDGES.classed("classic",false);
                    NODES.classed("classic",false);
                    TEXT.classed("classic",false);
                    d3.selectAll(["#visualisation, #sidebar, #content, #tablePanelInner"])
                            .classed("classic",false);
                }
            });
        
        // Select/deselect all checkbox
        d3.select("#selectAll").on("click", function () {
                if(this.checked){
                    $('.rowSelectBox:not(:checked)').click();
                } else {
                    $('.rowSelectBox:checked').click();
                }
            });

    $('#file').bind("change", function (event, ui) {
        handleFileSelect(event);
    });

}); // end on document ready
    
    
    /**
     * Adds bars representing hit length
     * @param {type} container - ID of container in which to render bars
     */
    function addBarData(container){
        setBarScale();
        BARS = d3.select(container).selectAll("div")
            .data(XDATA).enter().append("div");    
        TARGET_BAR = d3.select("#bars").insert("div", ":first-child")
            .datum(XTARGETDATA).attr("class", "targetBar");
    }

    /**
     * Removes bars representing hit length
     */
    function removeBarData(){
        setBarScale();
        d3.select("#bars").selectAll(".bar").data(XDATA).exit().remove();
        BARS = d3.select("#bars").selectAll(".bar");
        TARGET_BAR.datum(XTARGETDATA);
    }
    
    /**
     * Adds bars representing hit length, where bars have already been rendered
     */
    function updateBarData(){
        setBarScale();
        d3.select("#bars").selectAll(".bar").data(XDATA).enter().append("div").classed("bar", true);
        BARS = d3.select("#bars").selectAll(".bar");
        TARGET_BAR.datum(XTARGETDATA);
    }

    function setBarScale(){
        BAR_SCALE = d3.scale.linear()
                .domain([0, d3.max(XDATA, function(d) {
                        return Number(myGet(d,"Hsp_query-to")); 
                    })])
                .range([0, 100]);
    }

    /**
     * Renders bars. One bar is rendered per hit, with
     * length based on hit length and colour based on bit score
     */
    function drawBars() {
        setClassByData(BARS, "bar");
        setBarLength(BARS);
        setTitle(BARS);
        setCenterTitle(TARGET_BAR);
        setClick(BARS);
        setMouseover(BARS);
        BARS.classed("selected", function(d){return d.selected;}); // apply data selected status
    }
    
    function getBarLength(d){
        return (myGet(d, "Hsp_query-to")) - (myGet(d, "Hsp_query-from")) + 1;
    }

    function setBarLength(element){
        element
            .transition().duration(2500)
            .attr("style", function(d,i) {
                var len = getBarLength(d);
                return "width: " + BAR_SCALE(len) + "%;"
                + "margin-left: " + BAR_SCALE(myGet(d, "Hsp_query-from")-1) + "%;"; // minus 1 because biologists don't start at 0
            });
    }

    /**
     * Adds nodes and edges, each representing a hit
     * @param {type} container - ID of container in which to render visualisation
     */
    function addWheelData(container){
        SVG = d3.select(container).append("svg").attr("id", "wheel");
        EDGES = SVG.selectAll("line").data(XDATA)
            .enter().append("line");
        NODES = SVG.selectAll("circle").data(XDATA)
            .enter().append("circle").attr("class","node");        
        TEMP_CIRCLE = SVG.insert("circle", ":first-child").data([0])
            .attr("cx", CENTER_X).attr("cy", CENTER_Y)
            .attr("class", "tempCircle");             
        OUTER_CIRCLE = SVG.insert("circle", ":first-child");
        CENTER_NODE = SVG.insert("circle", ":last-child")
            .datum(XTARGETDATA).attr("class", "centerNode");
        TEXT = SVG.selectAll("text").data(XDATA)
            .enter().append("text");
        
        // Default styling (styling in this section must consistently apply to all 
        // styled elements, all the time)
        SVG.scale = "LOG_SCALE";
        
        EDGES.attr("x1", ""+CENTER_X) // setting values enables animated transform from this position
            .attr("y1", ""+CENTER_Y)    
            .attr("x2", ""+CENTER_X)    
            .attr("y2", ""+CENTER_Y);
                                
        TEXT.attr("x", ""+CENTER_X) // setting values enables animated transform from this position
            .attr("y", ""+CENTER_Y)
            .attr("transform", "rotate(360)");;
    }

    /**
     * Removes nodes and edges without corresponding data
     */
    function removeWheelData(){
        SVG.selectAll("line").data(XDATA).exit().remove();
        SVG.selectAll("text").data(XDATA).exit().remove();
        SVG.selectAll(".node").data(XDATA).exit().remove();
        
        EDGES = SVG.selectAll("line");
        TEXT = SVG.selectAll("text");
        NODES = SVG.selectAll(".node");
        CENTER_NODE.datum(XTARGETDATA);
    }

    function updateWheelData(){
        SVG.selectAll("line").data(XDATA).enter().append("line");
        SVG.selectAll("text").data(XDATA).enter().append("text");
        SVG.selectAll(".node").data(XDATA).enter().append("circle").attr("class", "node");  
    
        EDGES = SVG.selectAll("line");
        TEXT = SVG.selectAll("text");
        NODES = SVG.selectAll(".node");
        CENTER_NODE.datum(XTARGETDATA);
    }

    /**
     * Renders nodes and edges onto wagon wheel visualisation
     * @param {type} r - radius of wheel
     */
    function drawWheel(r){
        CURR_ZOOM = 1;                       // optionally, don't reset this to 1 if not desired
        var numNodes = XDATA.length;         // num outer nodes
        var displacement = 360 / numNodes;   // distance btw outer nodes
        var position = 0;                    // position of next outer node (incremented by displacement for each node)
        var nodeR = displacement/1.2;        // radius of node
        var maxNodeR = r/2;                  // max node radius (prevents overlap)
        var diameter = r*2;
        CENTER_X = getX(r, position);        // x coordinate for center of wheel
        CENTER_Y = getY(r, position, r);     // y coordinate for center of wheel
        var margin = 5;
        var upScale = 10;                    // TODO look into D3 scaling for this
        var width = diameter*upScale + margin*upScale;
        var height = width;
        
        setSizeAndZoom(SVG, width, height);
        setLabels();
        
        // reduce circle radius by width of text (takes first text label, assumes all are same length)
        var maxTextWidth = d3.max(TEXT[0], function(d){return d.getBBox().width;});
        r = r-(maxTextWidth*1.5)/upScale; // max width of text, plus arbitrary .5 to allow for browsers chopping off text
        
        setCenterNode(nodeR, maxNodeR);
        setEdgeXY(EDGES, r);        
        (SVG.scale === "LOG_SCALE") ? setXYScale(NODES, LOG_SCALE) : setXYScale(NODES, LIN_SCALE);
        
        setLabelXY(TEXT,  r);
      
        setRadius(NODES, nodeR, maxNodeR);
        
        setMouseover(NODES);
        setMouseover(EDGES);
        setMouseover(TEXT);
        
        setClick(NODES);   
        setClick(TEXT);   
        
        setTitle(NODES);  
        setCenterTitle(CENTER_NODE);
        setTitle(TEXT);
        
        setClassByData(NODES, "node");
        EDGES.classed("edge", true);
        
        d3.selectAll([EDGES, NODES, TEXT]).each(function(){
            this.classed("selected", function(d){return d.selected;});
        });      
            
        $(".node").unbind('dblclick')
                .dblclick(function () {
                        d3.select(this).each(function(d){
                                        var arr = myGet(d, "Hit_id").split("|");
                                        localStorage.passQuery = arr[0] + "|" + arr[1];
                                    });
                            $("#newBlast").click();
                        });
    }
    
    function setSizeAndZoom(element, width, height){
        element.attr("width", width)
            .attr("height", height)
            .attr("style", "zoom: "+CURR_ZOOM 
                + "; -moz-transform: scale("+CURR_ZOOM+")");
        ;    
    }
    function setLabels(){
        TEXT.text(function(d) { 
                        return myGet(d, "Hit_accession");
                    }).attr("text-anchor", "start");
    }

    // Various styling for center node
    function setCenterNode(nodeR, maxNodeR){
        CENTER_NODE.attr("class", "centerNode")
                .transition().duration(1000)
                .attr("r", nodeR*2 > maxNodeR ? maxNodeR : nodeR*2)
                .attr("cx", CENTER_X)
                .attr("cy", CENTER_Y); 
    }
    // Set x and y for edges (layout as spokes radiating out from wheel)
    function setEdgeXY(elements, r){
        var minDist = Number.MAX_VALUE;      // min e-value
        var maxDist = Number.MIN_VALUE;      // max e-value
        var numNodes = XDATA.length;
        
        elements.each( function(d,i){
                            var myDist = Number(myGet(d, "Hsp_evalue"));
                                // minDist must be greater than 0, otherwise unable to convert to log scale
                                minDist = (minDist > myDist && myDist !== 0) ? myDist : minDist;
                                maxDist = (maxDist < myDist) ? myDist : maxDist;
                                
                                // Scales are set based on min/max evalues when first known
                                if(i === numNodes-1){
                                    LIN_SCALE = d3.scale.linear()
                                        .domain([Number(minDist), Number(maxDist)])
                                        .range([r/5, r]); 
                                
                                   LOG_SCALE = d3.scale.log()
                                        .domain([minDist, Number(maxDist)])
                                        .range([r/5, r]);   
                                }         
                            })
                
                .transition().duration(1000)
                .attr("x1", function(d, i) {    
                                    return getX2(r, numNodes, i, CENTER_X);;
                                })
                .attr("y1", function(d, i) {
                                    return getY2(r, numNodes, i, CENTER_Y);
                                })
                .attr("x2", function(d, i) {
                                return getX2(r/5, numNodes, i, CENTER_X);
                            })
                .attr("y2", function(d, i) {
                                return getY2(r/5, numNodes, i, CENTER_Y);
                            });                        
    }


    function setLabelXY(elements, r){
        var numNodes = XDATA.length;
        elements.each(function(d,i){
                    // Setting these values first enables smooth transition by applying
                    // before assigning x and y coordinates.
                    d.x = getX2(r+1, numNodes, i, CENTER_X);
                    d.y = getY2(r+1, numNodes, i, CENTER_Y);
                })
            .transition().duration(1000)
            .attr("transform", function(d, i){
                            var rotation = 360/numNodes*i;
                            var rotate = "rotate("+rotation+", "
                                    +(d.x) + ", " + (d.y) + ")";
                            return rotate;
                        })
            .attr("x", function(d, i) {
                            return d.x;
                        })                        
            .attr("y", function(d, i) {      
                            return d.y;
                        });
}

    // Replaces class data
    function setClassByData(elements, otherClass){    
        elements.attr("class", function(d) {
                        return (typeof otherClass === 'undefined') ? "" : otherClass
                                + " " + getBitScoreColour(myGet(d,"Hsp_bit-score"));
                        });
    }

    function setXYScale(elements, scale){
        var numNodes = XDATA.length;
        elements.transition().duration(1000)
                .attr("cx", function(d, i) {
                                    var eval = Number(myGet(d,"Hsp_evalue"));
                                    d.dist = (eval <= 0) ? scale.range()[0] : scale(eval);
                                    return getX2(d.dist, numNodes, i, CENTER_X);
                                })
                .attr("cy", function(d, i) {
                                    return getY2(d.dist, numNodes, i, CENTER_Y);
                                });
    }

    function setRadius(elements, nodeR, maxNodeR){
        elements.attr("r", nodeR > maxNodeR ? maxNodeR : nodeR);
    }

    function setMouseover(elements){
            elements.on("mouseover", function (d,i) {
                        d3.selectAll([  NODES[0][i],    ROWS[0][i], 
                                        EDGES[0][i],    BARS[0][i], 
                                        TEXT[0][i] ])
                                    .classed("tempSelected", true);
                        
                        if(elements === NODES){
                            SVG.select(".tempCircle").classed("visible", true)
                                .attr("r", d.dist*10)
                                .attr("cx", CENTER_X)
                                .attr("cy", CENTER_Y);        
                        }
                    });
            elements.on("mouseout", function (d,i) { 
                        d3.selectAll([  NODES[0][i],    ROWS[0][i], 
                                        EDGES[0][i],    BARS[0][i], 
                                        TEXT[0][i] ])
                                    .classed("tempSelected", false);
                        
                        if(elements === NODES){
                            d3.select(".tempCircle").classed("visible", false);    
                        }    
                    });
    }

function toggleSelectedData(i){
    var isSelected = XDATA[i].selected;
    XDATA[i].selected = (isSelected) ? false : true;
    
    d3.selectAll([ BARS[0][i],          NODES[0][i], 
                   EDGES[0][i],         ROWS[0][i], 
                   CHECKBOXES[0][i],    TEXT[0][i]])
            .classed("selected", !isSelected);
    
    CHECKBOXES[0][i].checked = !isSelected;
}



    function setClick(elements){
        elements.on("click", function (d, i) {
            toggleSelectedData(i);
            
            if (!d3.event.shiftKey) {
                LATEST_CB = i;
            } else {
                var prevClick = LATEST_CB;
                LATEST_CB = i; 
                var box, fromBox = $('.rowSelectBox').get(prevClick);
                
                if(prevClick < LATEST_CB){
                    for(var j = prevClick+1; j < LATEST_CB; j++){
                        box = $('.rowSelectBox').get(j);
                        selectBoxInRange(box, fromBox, i);
                    }
                } else {
                    for(var j = prevClick-1; j > LATEST_CB; j--){
                        box = $('.rowSelectBox').get(j);
                        selectBoxInRange(box, fromBox, i);
                    }
                }
            }
            
        });
    }

    function selectBoxInRange(box, fromBox, i) {
        if(  (!$(box).attr("checked")) && $(fromBox).attr("checked")  
                || ($(box).attr("checked")) && !$(fromBox).attr("checked")){
            box.click();
            LATEST_CB = i; 
        }
    }
    
    // Short title based on data
    function setTitle(elements){
            elements.selectAll("title").remove();
            elements.append("svg:title").text(function(d) { 
                return "Hit num: "+myGet(d, "Hit_num")+"\nId: "+myGet(d, "Hit_id");
                                });   
            elements.attr("title", (function(d) { 
                return "Hit num: "+myGet(d, "Hit_num")+"\nId: "+myGet(d, "Hit_id");
                                }));
                            
    }

    // Set title for target node
    function setCenterTitle(elements){
        elements.selectAll("title").remove(); 
        elements.append("svg:title").text(function() { 
                return XTARGETDATA[0] +  "\n" 
                        + XTARGETDATA[1];
            });
        elements.attr("title", (function(d) { 
            return XTARGETDATA[0] +  "\n" 
                + XTARGETDATA[1];
                            }));
    }


    /**
     * Adds rows, cells and checkboxes to a table
     * @param {type} container - ID of the container to render the table in
     */
    function addTableData(container){
        var table = d3.select(container).append("table");

        var thead = table.append("thead").append("tr").selectAll("th")
            .data(columns).enter().append("th")
            .text(function(d) { return d; })
            .attr("onclick", "sortData(this);");
                /*click event is assigned like this so that it can be copied via
                 * innerHTML into a duplicate header row with the least possible
                 * overhead in the already over-busy bindResize event*/
    
        $("#tableHeaderDisplay").html($("thead").html());
            
        ROWS = table.append("tbody")
            .selectAll("tr")
            .data(XDATA)
            .enter()
            .append("tr");

            CELLS = ROWS.selectAll("td")
            .data(function(row) {    
                return columns.map(function(column) {          
                    var value = myGet(row,column);
                    return {column: column, value: value};
                });
            }).enter().append("td");

        setTitle(ROWS);
        setMouseover(ROWS);
    }
    
    
    function removeTableData(){
        
        CHECKBOXES.data(XDATA).exit().remove();
        d3.select("#tablePanelInner").select("tbody").selectAll("tr").data(XDATA).exit().remove();
        
        ROWS = d3.select("#tablePanelInner").select("tbody").selectAll("tr");
        ROWS.selectAll("td").data(function(row) {    
                return columns.map(function(column) {
                    var value =  myGet(row, column); 
                    return {column: column, value: value};
                });
            }).exit().remove();        
    }

    function updateTableData(){
        d3.select("#tablePanelInner").select("tbody").selectAll("tr").data(XDATA).enter().append("tr");
        ROWS = d3.select("#tablePanelInner").select("tbody").selectAll("tr");
        
        CELLS = ROWS.selectAll("td")
            .data(function(row) {    
                return columns.map(function(column) {                    
                    var value = myGet(row,column);
                    return {column: column, value: value};
                });
            }).enter().append("td");
        
        CELLS = d3.select("#tablePanelInner").select("tbody").selectAll("td");
    }

    /**
     * Draws a table representation of the data, with a row of data for each hit.
     * @param {type} columns - an array indicating which data fields to display in the table
     * @param {type} uniqueColId - string indicating which data field is the "primary key"
     */
    function drawTable(columns, uniqueColId){
        ROWS.attr("class", (function(d, i) { 
                            var evenOdd =  (i % 2 === 0) ? "evenRow" : "oddRow";    
                            var bitScore = myGet(d, "Hsp_bit-score");
                            return evenOdd + " " + getBitScoreColour(bitScore)
                            ;
                        }));

        CELLS.html(function(d) { 
                        if(d.column === uniqueColId){
                            var rowID = d.column + "_"+d.value;
                            this.parentNode.setAttribute("value", rowID);
                        }
                        if(d.value === ""){
                            return '<input type="checkbox" class="rowSelectBox checkbox rowCheckbox"></input>';
                        }
                        return d.value; 
                        })
                .classed('selectedRow', false);
        
        CHECKBOXES = d3.selectAll(".rowCheckbox");
        CHECKBOXES.data(XDATA);
        CHECKBOXES.attr("type", "checkbox")
                .attr("id", function(d){return myGet(d,"Hit_num");})
                .attr("class", "rowSelectBox checkbox ");
        setClick(CHECKBOXES);
        setMouseover(ROWS);
        
        CHECKBOXES.classed("selected", function(d){return d.selected;})
                .attr("checked", function(d){return (d.selected) ? d.selected : null;});
        ROWS.classed("selected", function(d){return d.selected;});
        
        setColumnWidths();
        
        // Double click on row also triggers checkbox
        $('tr').unbind('dblclick');    
        $("tr").dblclick(function () {
            $(this).children('td').children('input').click();
        });
    }


function sortData(elem){
    var thisSortBy = d3.select(elem).html();

    d3.selectAll("th").classed("sortedBy", function(d,i){
        return (d3.select(this).html() === thisSortBy) ? true : false;
    });    
    sortDataBy(d3.select(elem).html());
    removeBarData();
    drawBars();
    removeTableData();
    drawTable(columns, uniqueColId);
    removeWheelData();
    drawWheel(calculateRadius());
}
    
/***************************************************************************
 * Buttons
 */



function removeSelectedNodes(){
    
    var toDeleteData = new Array();
    d3.selectAll(".rowSelectBox")
            .each(function(d,i){
                toDeleteData[i] = (this.checked) ? 1 : 0;
           });
    for(var j = (toDeleteData.length-1); j >= 0; j--){
        if(toDeleteData[j] === 1){
            XDATA.splice(j,1);
        }
    }
    removeBarData();
    drawBars();
    removeWheelData();
    drawWheel(calculateRadius());  
    removeTableData();
    drawTable(columns, uniqueColId);
                       
}
    


// Sort the data by one of the columns (sorts by hit group)
// Does not support sorting by hsp, because there are multiple and it is unclear
// which sort order is desired
function sortDataBy(sortColumn){
    
    for(var i = 0; i < columns.length; i++){
        if(columns[i] === sortColumn){
            // Determine ascending or descending order for sort
            if(currentSort === columns[i]){ 
                currentSortType = (currentSortType === "asc") ? "desc" : "asc";
            } else {
                currentSort = columns[i];
                currentSortType = "asc";
            }        
            var value = myGet(XDATA, currentSort); // the value for that column
            if(isNaN(value)){   
                XDATA = XDATA.sort(function(a,b){
                        a = myGet(a, currentSort).toLowerCase();
                        b = myGet(b, currentSort).toLowerCase();
                        return (currentSortType === "asc") ? (a > b ? 1 : -1) : (a < b ? 1 : -1);
                    });
             
            } else {
                XDATA = XDATA.sort(function(a,b){
                        a = Number(myGet(a, currentSort));
                        b = Number(myGet(b, currentSort));
                        return (currentSortType === "asc") ? (a > b ? 1 : -1) : (a < b ? 1 : -1);
                    });
            }
        }      
    }  
}

    
    
/***************************************************************************
 * Various helper methods
 */
    function getX(rad, pos) {
        return (Math.sin(pos * Math.PI / 180) * rad + rad + 1) * SCALE_UP;
    }
    function getY(rad, pos, offset) {
        offset = typeof offset !== 'undefined' ? offset : 0;
        return (Math.cos((pos) * Math.PI / 180) * rad + rad + 1 - offset) * SCALE_UP;
    }
    function getX2(rad, numNodes, count, center) {
        
        var angle=2*Math.PI/numNodes;
        rad = rad * SCALE_UP;   
        return rad*Math.cos(angle*count)+center;
    }
    function getY2(rad, numNodes, count, center) {
        var angle=2*Math.PI/numNodes;
        rad = rad * SCALE_UP;
        return rad*Math.sin(angle*count)+center ;    
    }

    // Specifies which colour to use based on bit score range
    // Note that these colour values are also hardcoded into the legend in index.html
    function getBitScoreColour(bitScore){
        if(bitScore < 40){
             return "black";
         } else if(bitScore < 50){
             return "blue";
         } else if(bitScore < 80){
             return "green";
         } else if(bitScore < 200){
             return "purple";
         } else {
             return "red";
         }
    }
   
   /*Given a string (element from columns array), returns the attribute of the 
    * current element described by that string.
    * Only works on data in a very strict data structure*/
   function getDataString(row, string){
    var value;
    if(row[string] === undefined){
                    if(string === ''){
                        value = "";
                    } else {
                        if(row['Hit_hsps'].Hsp[0] !== undefined){
                            value = row['Hit_hsps'].Hsp[0][string];
                        }
                    }
                } else {
                    value = row[string];
                }
            return value;
}

    // Gets all the classes you might ever need from the data element
    // No longer using this
    function getAllClasses(d, columns){
    var classString = "";
                                for(var i = 0; i < columns.length; i++){
                                    if(columns[i] !== ""){
                                        var data = getDataString(d, columns[i]);
                                        data = data.toString().replace(/\s+/g, '');
                                        classString = classString + " "+columns[i]+"_"+data;    
                                    }
                                }
                            classString = classString + " dist_"+d.dist;
                            return classString;
}

    //Toggles visualisation between linear and logarithmic scale. Returns the original scale
    function toggleScale(svg){
        var origScale;
        svg.attr("scale", function(){
            if(svg.scale === "LIN_SCALE"){
                svg.scale = "LOG_SCALE";
                setXYScale(NODES, LOG_SCALE);
                origScale = "View Lin Scale <img src='Images/eye.png'>";
            } else {
                svg.scale = "LIN_SCALE";
                setXYScale(NODES, LIN_SCALE);
                origScale = "View Log Scale <img src='Images/eye.png'>";
            }
            return svg.scale;
        });
        return origScale;
    }


function calculateRadius(){
    RADIUS = $("#visualisation").height()/20 
            - $("footer").height()/20 ; // wagon wheel radius
    return RADIUS;
}





/*Gets data from either json or xml format*/
// WILL ONLY GET THE FIRST MATCHED ELEMENT
function myGet(d, fieldName){
    if($(d).find(fieldName).html() !== null){
                    return $(d).find(fieldName).html();
                } else {
                    return getDataString(d, fieldName);
                    return d.fieldName;
                }    
}



// so new it aint even in jQuery yet
  function handleFileSelect(evt) {
      
        // Reset (allows the same file to be uploaded twice in succession)
        $('#file').replaceWith( $('#file').clone(true) );
        document.getElementById('file').addEventListener('change', handleFileSelect, false);
      
        var file = evt.target.files[0];    
        var reader = new FileReader();
        reader.onload = (function(theFile) {
        return function(e) {
            loadFileData(e.target.result);
            document.getElementById('fileName').innerHTML = "Displaying: "+escape(theFile.name);
        };
      })(file);
      reader.readAsText(file);
  }
  


function loadFileData(data){
    
        var oldLen = XDATA.length;
        XDATA = $(data).find('Hit');
        var newLen = XDATA.length;
        XTARGETDATA = [$(data).find('Iteration_query-ID').html(),$(data).find('Iteration_query-def').html()];
        
        if(oldLen > newLen){
            removeBarData();
            removeWheelData();
            removeTableData();
            
        } else {
            updateBarData();
            updateWheelData();
            updateTableData();
        }
        drawBars();
        drawWheel(calculateRadius());
        drawTable(columns, uniqueColId);    
}

function zoomIn(){
    CURR_ZOOM +=0.1;
    zoom(1);
}

function zoomOut(){
     CURR_ZOOM -=0.1;
     zoom(-1);
}
function zoom(num){
    if(num > 0){
        $("#visualisation").animate(
         {   scrollTop:$("#visualisation").scrollTop() + CURR_ZOOM * 10,
             scrollLeft:$("#visualisation").scrollLeft() + CURR_ZOOM * 10}, 0
         );
    } else {
        $("#visualisation").animate(
         {   scrollTop:$("#visualisation").scrollTop() - CURR_ZOOM * 10,
             scrollLeft:$("#visualisation").scrollLeft() - CURR_ZOOM * 10}, 0
         );
    }
     d3.select("svg")
         //.transition().duration(500)    
         .attr("style", ""
             + "-webkit-transform: scale("+CURR_ZOOM+"); " // chrome, safari
             + "-webkit-transform-origin: 0 0; "
             + "-moz-transform: scale("+CURR_ZOOM+"); " // ff
             + "-moz-transform-origin: 0 0; "
             + "-ms-transform: scale("+CURR_ZOOM+"); " // ie
             + "-ms-transform-origin: 0 0; " );
     // Transition/animation was choppy
}