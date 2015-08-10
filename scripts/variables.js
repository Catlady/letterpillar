var defaultWidth = 45;
var defaultHeight = 15;
var circleWidth = 10;
var gameBoardPadding = 5;

var timerIsRunning = false;
var startTime = undefined;
var timerIntervalId;
var gameBoardIntervalId;
var gridWidth, gridHeight;
var lastMove = undefined; // left, right, up, down

var gridPoints;

var letterpillar;
var bag;
var gridPoints;

 
 var scaleX, scaleY;
var context;
var gameBoard;

//  consider rendering vowels in green and colours
// graduated from blue to red (cold -> warm
// http://html-color-codes.info/
// http://www.perbang.dk/rgbgradient/ --  really good site for precalculating [n] graduated colours -> need 7
/*var colours = 
{
	1: '#5ABEF6', 
	2 : '#5ABEF6', 
	3 : '#7A5BF5',
	4: '#BC5BF5', 
	5 : '#F45CEC', 
	8 : '#F45CAB',
	10: '#F45D6B', 
};*/
var colours = 
{
	1: '#5ABFF6', 
	2 : '#74B4F3', 
	3 : '#8EA9F1',
	4: '#A89EEF', 
	5 : '#C293ED', 
	8 : '#DC88EB',
	10: '#F67EE9', 
};

// nice orange
// #F6B772
