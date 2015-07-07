/*
 * User interface layout and layout-related events for HTML5 Blast Explorer
 */

// Arbitrary padding to cover for $(window).width() and $(window).height() inaccuracy
var PAD_W = 43;     // mirrors 20px left margin; 4*5px margins (and resulting 20px right margin)
var PAD_H = 10;     // totally arbitrary, seems to be just enough to prevent vertical scrollbar
var MIN_WIDTH = 40; // minimum panel width


$(document).ready(function() {
    setToInitialSize();    
    $("#loadingDiv").remove();
    

    $("#QUERY").html(localStorage.passQuery);
    $("#QUERY").val(localStorage.passQuery);
    if($("#QUERY").val() !== ""){   
        $("#blastButton").click();
    }
    localStorage.passQuery = ""; 
});

$(window).resize(function() {
        setToInitialSize(); 
});    


// todo jquery-ify
/*if (window.attachEvent) { // ::sigh:: IE8 support
   window.attachEvent('onstorage', storageEvent);
} else {
    window.addEventListener('storage', storageEvent, false);
}*/


$(window).bind("storage", function (event, ui) {
    
    if(localStorage.resultFile !== undefined && localStorage.pleaseLoad === "true"){
        //alert(localStorage.resultFile);
        loadFileData(localStorage.resultFile);
        localStorage.pleaseLoad = "false";
        document.getElementById('fileName').innerHTML = "Displaying: your BLAST query";
    }
    event = event || window.event; // give IE8 some love (not sure if needed??) todo
    
});

$("#newBlast").bind("click", function (event, ui) {
    var left  = ($(window).width()/3)-(600/2),
    top   = ($(window).height()/3)-(300/2),
    popup = window.open ("searchform.html", "popup", "menubar=0, toolbar=0, width=600, height=350, top="+top+", left="+left);
});

$("#blastButton").bind("click", function (event, ui) {
    $('#loadingDivSml').removeClass('hidden');
});


$(".resetButton").bind("click", function (event, ui) {
    setToInitialSize();
    setToInitialSize(); // TODO For some reason this sometimes (only sometimes) doesn't work 100% if only triggered once. Find out why...
});

// Scroll table header copy when scrolling table horizontally
$("#tablePanelInner").scroll(function (event, ui) {
    $('#tableHeaderInner').scrollLeft($(this).scrollLeft());
});

$("#maximiseVis").bind("click", function (event, ui) {
    maximise("#content");
});
$("#maximiseTable").bind("click", function (event, ui) {
    maximise("#tablePanel");
    setColumnWidths();
});

function maximise(panel){
    if(!$(panel).hasClass('maximised')){

        $(panel).addClass('maximised');
        var width = ($("#outerPanel").width()-10); 
        $(panel).width(width);
        var id = $(panel).attr('id');
        $(".panel:not(#"+id+")").addClass('hidden');    
    // Restore
    } else {
        $(panel).removeClass('maximised');
        $(".panel").removeClass('hidden');
        $('.resetButton').click();
        $('#redraw').click();
    }
}



/**
 * Resizing one panel triggers a resize in another panel (bigger/smaller or smaller/bigger).
 * This method assumes that three panels are used, one is triggered and one is not
 *
 * @param {type} thisPanel          panel being resized
 * @param {type} otherFixedPanel    panel not affected by resize
 * @param {type} boundPanel         panel affected by resize
 */
function bindResize(thisPanel, otherFixedPanel, boundPanel){
    
    $(thisPanel).bind("resize", function (event, ui) {
        
            $(boundPanel).width($("#outerPanel").width()
                    -$(thisPanel).width()
                    -$(otherFixedPanel).width()-PAD_W); 
            setColumnWidths();
        }); 
}



/*
 * Initialise panel sizes and set resize events
 */
function setToInitialSize(){
    $( "#sidebar" ).resizable({handles: 'e', 
        containment: "parent", minWidth: MIN_WIDTH, 
        start: function( event, ui ) {
            $( "#sidebar" ).resizable( "option", "maxWidth", 
                    $("#outerPanel").width()
                    - MIN_WIDTH - PAD_W
                    - $( "#tablePanel" ).width() );
        }
    });
    $( "#content" ).resizable({handles: 'e', 
        containment: "parent", minWidth: MIN_WIDTH, 
        start: function( event, ui ) {
            $( "#content" ).resizable( "option", "maxWidth", 
                    $("#outerPanel").width()
                    - $( "#sidebar" ).width()
                    - MIN_WIDTH - PAD_W   );
        }
    }); 

    //$("#visualisation").draggable();
    $( "#redraw" ).draggable();
    bindResize("#sidebar", "#tablePanel", '#content');    
    bindResize("#content", "#sidebar", '#tablePanel');    

    $('#outerPanel')
            //.width("100%")
            .height($(window).height()  
            -  $("header").height() - $("footer").height() - PAD_H  );
    var quarter = ($("#outerPanel").width()-PAD_W)/4;
    
    $('#content').width(quarter*2 + 2 ).height("100%").css("margin-left", "4px");

    
    $('#tablePanel').width(quarter).height("100%");
    $('#sidebar').width(quarter).height("100%");

    $('#visualisation').height($('#content').height() 
            - $('#visToolbarTop').height() /*- $('#visToolbarBottom').height() */ - 10);
    $('#tablePanelInner').height($('#tablePanel').height() 
            - $('#tableToolbarTop').height() - 10
            //- $('#tableToolbarBottom').height() 
            //- $('#tableHeaderDisplay').height()
        );
        //defaultColourLegend
    $('#bars').height($('#sidebar').height() /*- $("#defaultColourLegend").height()*/
            - $('#barsToolbar').height() -20 ); // 20 == 2 10px margins

    //$('header').width($(window).width()-PAD_W/2);
    //$('footer').width($(window).width()-PAD_W/2);

    $(".panel").removeClass('hidden').removeClass('closed').removeClass('maximised'); 

    setColumnWidths();
    //$("#redraw").click(); // do we want to automatically resize the wagon wheel?
}

function setColumnWidths(){
    
    // set width of header equal to table width
    $("#tableHeaderDisplay").width($("#tablePanelInner table").width());
    
    // fixes nowrap problem (allows resizing down before locking size in)
    $("th").each(function(){
         $(this).css({
            "min-width": 0
        });
    });
    $("th").each(function(){
         $(this).css({
            "min-width": $(this).width(),
            "max-width": $(this).width()
        });
    });

    $("#tableHeaderDisplay").html($("thead").html());
    
    /*
    var displayHeaders = $("#tableHeaderDisplay th");
    var realHeaders = $("#tablePanelInner th");
    for(var i = 0; i < realHeaders.length; i++){
        $(displayHeaders[i]).width($(realHeaders[i]).width());
    }
*/
}

// TODO JQUERY-IFY
function storageEvent(event) {
  event = event || window.event; // give IE8 some love
  alert('Yo people! Something just got stored!');
}

