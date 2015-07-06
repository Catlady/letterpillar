 $(document).ready(function() {
	$('#gridWidth').val(defaultWidth);
	$('#gridHeight').val(defaultHeight); 
	
	function setGrid(){
		gridWidth = $('#gridWidth').val();
		gridHeight = $('#gridHeight').val(); 
		
		var gridPoints = new Array(gridWidth*gridHeight);
		var m = 0;
		for(var i = 0; i < gridWidth; i++){
			for(var k = 0; k < gridHeight; k++){
				gridPoints[m++] = makeSquare(i,k,undefined);
			}
		}
		return gridPoints;
	}
	
	function fillBag(){
		var bag = [];
		
		/* Bag uses Scrabble letter/point distribution:
		1 point: E ×12, A ×9, I ×9, O ×8, N ×6, R ×6, T ×6, L ×4, S ×4, U ×4
		2 gridPoints: D ×4, G ×3
		3 gridPoints: B ×2, C ×2, M ×2, P ×2
		4 gridPoints: F ×2, H ×2, V ×2, W ×2, Y ×2
		5 gridPoints: K ×1
		8 gridPoints: J ×1, X ×1
		10 gridPoints: Q ×1, Z ×1\*/
		
		makeLetter(bag, 'A', 9, 1); 
		makeLetter(bag, 'B', 2, 3);
		makeLetter(bag, 'C', 2, 3);
		makeLetter(bag, 'D', 4, 2);
		makeLetter(bag, 'E', 12, 1);
		makeLetter(bag, 'F', 2, 4);
		makeLetter(bag, 'G', 3, 2);
		makeLetter(bag, 'H', 2, 4);
		makeLetter(bag, 'I', 9, 1);
		makeLetter(bag, 'J', 1, 8);
		makeLetter(bag, 'K', 1, 5);
		makeLetter(bag, 'L', 4, 1);
		makeLetter(bag, 'M', 2, 3);
		makeLetter(bag, 'N', 6, 1);
		makeLetter(bag, 'O', 8, 1);
		makeLetter(bag, 'P', 2, 3);
		makeLetter(bag, 'Q', 1, 10);
		makeLetter(bag, 'R', 6, 1);
		makeLetter(bag, 'S', 4, 1);
		makeLetter(bag, 'T', 6, 1);
		makeLetter(bag, 'U', 4, 1);
		makeLetter(bag, 'V', 2, 4);
		makeLetter(bag, 'W', 2, 4);
		makeLetter(bag, 'X', 1, 8);
		makeLetter(bag, 'Y', 2, 4);
		makeLetter(bag, 'Z', 1, 10);
		
		return bag;
	}
	
	function eat(letter){
		var node = makeDismemberedBodyPart(undefined, undefined, letter, letterpillar[letterpillar.length-1]);
		letterpillar.push(node);
	}
	
	function move(){
	
		switch (lastMove) {
        case 'up':
            letterpillar[0].y -= 1;
			if(letterpillar[0].y < 0) stopGame();
            break;
        case 'down':
            letterpillar[0].y += 1;
			if(letterpillar[0].y >= gridHeight) stopGame();
            break;
        case 'left':
            letterpillar[0].x -= 1;
			if(letterpillar[0].x < 0) stopGame();
            break;
        case 'right':
            letterpillar[0].x += 1;
			if(letterpillar[0].x >= gridWidth) stopGame();
            break;
		}
		
		// If there is a letter at this position, eat it
		var letterAtPosition = $.grep( gridPoints, function( point, i ) {
			return point.letter != undefined && point.letter.letter != undefined 
				&& point.x == letterpillar[0].x && point.y == letterpillar[0].y;
		});
		if(letterAtPosition.length > 0)
			eat(letterAtPosition[0]);
		
		for(var i = letterpillar.length-1; i > 0; i--){
			letterpillar[i].x = letterpillar[i].prev.x;
			letterpillar[i].y = letterpillar[i].prev.y;
		}
		redrawLetterpillar();
	}
	
	function verifyWord(){
		var word = letterpillar.splice(0,1);
		// TODO AMW post the word to the server
		// Use the first longest word, e.g.
		// CATORCH: catorch, catorc, atorch, cator, atorc, [torch], cato, ator,...
	}
	
	 function makeLetter(bag, letter, quantity, score){
		 for(var i = 0; i < quantity; i++){
			bag.push({letter:letter, score:score}); // quick check suggests this might not be as inefficient as you would think
		 }
	 }
	 
	 function isVowel(letter){
		 return (letter.letter == 'A' || letter.letter == 'E' || letter.letter == 'I' || letter.letter == 'O' || letter.letter == 'U');
	 }
	 
	function drawGameBoard(){
		
		gameBoard = d3.select('#gameBoard');
		$('svg').remove();
		var width = $(document).innerWidth() - $('#sideBar').width() - 70;
		var height = $(document).innerHeight() - $('header').height() - $('footer').height() - 40;
		var canvas = gameBoard.append('svg')
			.attr("width", width)
			.attr("height", height);
		
		var padRangeBy = circleWidth + gameBoardPadding;
		
		scaleX = d3.scale.linear()
			.range([padRangeBy, width - padRangeBy])
			.domain(d3.extent(gridPoints, function(d) { return d.x; }));
		scaleY = d3.scale.linear()
			.range([padRangeBy, height - padRangeBy])
			.domain(d3.extent(gridPoints, function(d) { return d.y; }));

		var groups = d3.select('#gameBoard svg')
			.selectAll("g")
			.data(gridPoints)
			.enter()
			.append('g')
			.attr("transform", function(d) {
				 return "translate(" + scaleX(d.x) + "," + scaleY(d.y) + ")"; 
			   });
			
			groups.append('circle')
			.attr("r", 0)
			.attr("stroke", "white")
			.attr("fill", "transparent");
			
			groups.append('text')
				.attr("dy", ".35em")
				.attr("text-anchor", "middle");
				
			d3.select('#gameBoard svg')
				.selectAll('rect')
				.data(letterpillar)
				.enter()
				.append('rect')
				.attr('width', 15)
				.attr('height', 15)
				.attr('x', function(d){
					return scaleX(d.x) ;
				})
				.attr('y', function(d){
					return scaleY(d.y) ;
				});
	}
	
	function redrawLetterpillar(){
		d3.select('#gameBoard svg')
				.selectAll('rect')
				.data(letterpillar) // TODO AMW it should not be necessary to rebind
				.enter()
				.append('rect')
				;
				
				d3.select('#gameBoard svg')
				.selectAll('rect')
				.attr('width', 15)
				.attr('height', 15)
				.attr('x', function(d){
					return scaleX(d.x) ;
				})
				.attr('y', function(d){
					return scaleY(d.y) ;
				});
				
	}
	
	function redrawLetters(){
		d3.select('#gameBoard svg')
			.selectAll('circle')
			//.data(gridPoints) // should not have to re-bind
			.attr("r", 10)
			.attr("stroke", function(d){
				return d.letter == undefined || d.letter.score == 0 ? "white" : colours[d.letter.score];
			});
			
		d3.select('#gameBoard svg')
			.selectAll('text')
			.data(gridPoints) // should not have to re-bind
			.attr("dy", ".35em")
			.attr("text-anchor", "middle")
			.text(function(d){
				return d.letter == undefined || d.letter.letter == '' ? '' : d.letter.letter;
			});
	}
	
	function updateGameBoard(){
		if(addLetter())
			redrawLetters();
	}
	
	function getRandomNumber(min, max){
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	
	function addLetter(){
		
		if(bag.length == 0){
			bag = fillBag();
		}
				
		var letter = drawLetter(bag, getRandomNumber(0, bag.length-1));
		
		var emptygridPoints = $.grep( gridPoints, function( point, i ) {
			
			// A grid position is not empty if it is occupied by the letterpillar
			for(var i = 0; i < letterpillar.length; i++){
				if(letterpillar[i].x == point.x && letterpillar[i].y == point.y) return false;
			}
			
			return point.letter == undefined;
		});
		
		if(emptygridPoints.length == 0){
			stopGame();
			return false;
		}
		
		var randomIndex2 = getRandomNumber(0, emptygridPoints.length-1);
		emptygridPoints[randomIndex2].letter = letter;
		return true;
		
	}
	
	function drawLetter(bag, index){
		var letter = bag[index];
		if(letter.quantity == 0){
			bag.splice(index, 1);
		}
		return letter;
	}
	
	function moveLetterpillar(){
		
	}
	
	// Repeatedly redraw the canvas until timer is no longer running
	function drawCanvas() {
 
		// clear canvas
		//context.fillStyle = "#FFFFFF";
		//context.rect(0,0,canvas.attr("width");canvas.attr("height"));
		//context.rect(0,0,500,500);
		//context.fill();

		$('#gameBoard canvas').find("custom.rect").each(function(d) {
			var node = d3.select(this);
			context.beginPath();
			context.fillStyle = node.attr("fillStyle");
			context.strokeStyle = node.attr("strokeStyle");
			context.arc(node.attr("x"), node.attr("y"), 10, 0, 2 * Math.PI);
			context.stroke();
			context.fill();			
		});
		
		if(!timerIsRunning) return true;
}
	
	function stopGame(){
		timerIsRunning = false;
		updateDisplayedTime();
		clearInterval(timerIntervalId);
		clearInterval(gameBoardIntervalId);
		$('#toggleTimer').html('Start');
		
		$('#overlay').show();	
		
		var dialog = $('#dialog');
		dialog.show();
		dialog.css('left', $(document).innerWidth() / 2 - dialog.width() / 2 +'px');
		dialog.css('top', $(document).innerHeight() / 2 - dialog.height() / 2 +'px');
		dialog.find('button').focus(); // I don't think this is working yet
	}
	
		 function makeSquare(x,y,letter){
		 return {x:x, y:y, letter:letter};
	 }
	 
	function makeDismemberedBodyPart(x, y, letter, prev){
		return {x: x, y: y, letter: letter, prev: prev};
	}
	
	function startGame(){
		
		timerIsRunning = true;
		startTime = $.now();
		timerIntervalId = setInterval(updateDisplayedTime, 100);
		gameBoardIntervalId = setInterval(updateGameBoard, 1000);
		
		gridPoints = setGrid();
		bag = fillBag();
		letterpillar = [makeDismemberedBodyPart(getRandomNumber(0,gridWidth-1),
			getRandomNumber(0, gridHeight-1),undefined, undefined)];
		
		drawGameBoard();
		
		$('#toggleTimer').html('Stop');
		$('#dialog').hide();
		$('#overlay').hide();
	}
	
	function updateDisplayedTime(){
		var miliseconds = $.now() - startTime; 

		var seconds = 0;
		if(miliseconds > 1000){
			seconds = miliseconds/1000;
			miliseconds = (seconds % 1) * 1000; 
			miliseconds -= (miliseconds % 1); 
			seconds -= (seconds % 1); 
		}
		
		var minutes = 0;
		if(seconds > 60){
			minutes = seconds / 60;
			seconds = (minutes % 1) * 60;
			minutes -= (minutes % 1); 	
		}
		
		var hours = 0;
		if(minutes > 60){
			hours = minutes / 60;
			minutes = (hours % 1) * 60;
			hours -= (hours % 1);	
		}
		
		if(minutes < 10) minutes = '0'+minutes;
		if(seconds < 10) seconds = '0'+seconds;
		if(miliseconds < 10) miliseconds = '00' + miliseconds;
		else if(miliseconds < 100) miliseconds = '0' + miliseconds;
		
		var timeValue = (''+minutes).substring(0,3) + ':' + (''+seconds).substring(0,3);
		if(hours > 0)
			timeValue = (''+hours).substring(0,3) + ':'+timeValue;
		$('#time time').html(timeValue + '<span>:' + miliseconds + '</span>');
	}
	
		$('#toggleTimer').click(function(){
		if(!timerIsRunning){
			startGame();
		} else {
			stopGame();
		}
	});
	
	$('#dialog button').click(function(){
		$('#dialog').hide();
		$('#overlay').hide();
		$('#toggleTimer').focus();
	});
	
		$('input').change(function(){
		console.log($(this).val());
	});
	
		$(document).keydown(function(e) {		
		switch (e.keyCode) {
        case 37:
			lastMove = 'left';
			move();
            break;
        case 38:
			lastMove = 'up';
			move();
            break;
        case 39:
			lastMove = 'right';
			move();
            break;
        case 40:
			lastMove = 'down';
			move();
            break;
		case 13:  // 'enter'
			// enter - validate word
			break;
		}
	});
	
	
});







