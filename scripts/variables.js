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

var colours = 
{
	1: "red", 
	2 : "orange", 
	3 : "yellow",
	4: "green", 
	5 : "blue", 
	8 : "purple",
	10: "violet", 
};