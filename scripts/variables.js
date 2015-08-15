var defaultWidth = 45;
var defaultHeight = 15;

var gameBoardPadding = 5;

var circleRadius = 15;
var rectWidth = 30;
var rectCorner = 10;
var paddingBetweenCircles = 10;

// The available width and height for the game board
var gameBoardWidth;
var gameBoardHeight;

var previousRequestWords = undefined;

var textOffset = '0.35em'; // how far down the text is spaced vertically

var gameBoardWidthPadding = 70;
var gameBoardHeightPadding = 20;

var timerUpdateDuration = 100;
var gameBoardUpdateDuration = 1000;

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

var vowelColour = '#F6B772';
// nice orange
// #F6B772
