 $(document).ready(function() {

	// Stretch the timer text across the whole width of the side bar
	$('#sideBar').width( $('#time .milliseconds').width() + $('#time .seconds').width()  );
	
	// TODO AMW on page resize, if a game is not running, I need to reset these
	setGameBoardSize();
	$('#gameBoard').width(gameBoardWidth);
	$('#gameBoard').height(gameBoardHeight);
	
	
	// Given a width w and height h, return a set of w*h grid squares
	function setGrid(){
		
		gridWidth = Math.floor(gameBoardWidth / (rectWidth + paddingBetweenCircles));;
		gridHeight = Math.floor(gameBoardHeight / (rectWidth + paddingBetweenCircles));
		
		var gridPoints = new Array(gridWidth*gridHeight);
		var m = 0;
		for(var i = 0; i < gridWidth; i++){
			for(var k = 0; k < gridHeight; k++){
				gridPoints[m++] = makeGridSquare(i,k,undefined);
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
		var node = makeDismemberedBodyPart(undefined, undefined, letter.letter, 
			letterpillar[letterpillar.length-1], lastMove);
		letterpillar.push(node);
		updateBottomPanel();
	}
	
	function getLetterpillarMaybeWord(){
		var maybeWord = $.map($(letterpillar), function(val, i){
			return val.letter == undefined ? '' : val.letter.letter;
		});
		return maybeWord.join('');
	}
	
	function updateBottomPanel(text){
		if(text == undefined)
			$('#bottomPanel p').html(getLetterpillarMaybeWord());
		else
			$('#bottomPanel p').html(text);
	}
	
	function move(direction){
	
		var newX = letterpillar[0].x;
		var newY = letterpillar[0].y;
	
		switch (direction) {
			case 'up':
				letterpillar[0].moveDirection = 'vertical';
				newY -= 1;
				if(newY < 0) stopGame();
				break;
			case 'down':
				letterpillar[0].moveDirection = 'vertical';
				newY += 1;
				if(newY >= gridHeight) stopGame();
				break;
			case 'left':
				letterpillar[0].moveDirection = 'horizontal';
				newX -= 1;
				if(newX < 0) stopGame();
				break;
			case 'right':
				letterpillar[0].moveDirection = 'horizontal';
				newX += 1;
				if(newX >= gridWidth) stopGame();
				break;
			}
	
		// If there is a letter at this position, eat it
		var position = -1;
		var drawType = undefined;
		var letterAtPosition = $.grep( gridPoints, function( point, i ) {
			var result =  point.letter != undefined && point.letter.letter != undefined 
				&& point.x == newX && point.y == newY;
			if(result && position == -1) position = i;
			return result;
		});
		if(letterAtPosition.length > 0){
			eat(letterAtPosition[0]);
			gridPoints[position].letter = undefined;
			redrawLetters();
			drawType = 'enter';
		}
		
		for(var i = letterpillar.length-1; i > 0; i--){
			letterpillar[i].x = letterpillar[i].prev.x;
			letterpillar[i].y = letterpillar[i].prev.y;
		}
		
		letterpillar[0].x = newX;
		letterpillar[0].y = newY;
	
		redrawLetterpillar(drawType);
		
		// starts at the end and each piece follows its parent
		// if i splice and remove the parents it doesn't work
		
	}
	
	
	function validateWord(){	 
		 var queryWord = getLetterpillarMaybeWord();
		 if(queryWord == undefined || queryWord.length == 0)
			 return;
		
		console.log('looking up ' + queryWord);
		
		var requestObject  = {
			word: queryWord,
			previousRequestWords: JSON.stringify(previousRequestWords)
		};
		
		$.post( "/functions", requestObject, function( data ) {
			console.log(data);
			var responseObject = JSON.parse(data);
			scoreWord(responseObject);
			previousRequestWords = responseObject.allWords;
		});
	}
	
	function scoreWord(responseObject){
		var bestWord = responseObject.word;
		var points = responseObject.points;
		var wordFirstIndex = responseObject.index;
		
		if(bestWord == '' ) return false;
		
		updateScore(points);
		removeWordFromLetterpillar(wordFirstIndex, bestWord.length);
		updateWordList(bestWord, points);
		updateBottomPanel();
		return true;
	}
	
	function updateWordList(word, points){
		var wordListDiv = $('#wordList');
		wordListDiv.html( '<span><span class="wordListWord">'+word.toUpperCase()
			+'</span><span class="wordListPoints">'+points+'</span></span>'  
			+ wordListDiv.html() );
	}
	
	function updateScore(points){
		var scoreDiv = $('#score');
		
		var score = scoreDiv.html();
		// TODO AMW remove the * 100
		score = (score == undefined || score == '' ) ? points : Number(score) + Number(points) * 100;
		scoreDiv.html(score);
	}
	
	function removeWordFromLetterpillar(index, length){
		// TODO AMW because the server call was asynchronous, do we have to check if this is indeed the correct word?
		var remainingTail = index+1+length;
		if(remainingTail < letterpillar.length)
			letterpillar[remainingTail].prev = letterpillar[index];
		
		var xyPositions = $(letterpillar).map(function(){
			return {x: this.x, y: this.y}
		}).get();
		
		letterpillar.splice(index+1, length); // +1 ignores the head
		
		$(letterpillar).each(function(index){
			this.x = xyPositions[index].x;
			this.y = xyPositions[index].y;
			
		});
		
		redrawLetterpillar('exit');
	}

	 function makeLetter(bag, letter, quantity, score){
		 for(var i = 0; i < quantity; i++){
			bag.push({letter:letter, score:score}); // quick check suggests this might not be as inefficient as you would think
		 }
	 }
	 
	 function isVowel(letter){
		 return (letter.letter == 'A' || letter.letter == 'E' || letter.letter == 'I' || letter.letter == 'O' || letter.letter == 'U');
	 }
	 
	 function setGameBoardSize(){
		gameBoardWidth = $(document).innerWidth() - $('#sideBar').width() - gameBoardWidthPadding;
		gameBoardHeight = $(document).innerHeight() - $('header').height() - $('footer').height() - $('#bottomPanel').height() - gameBoardHeightPadding;
	 }
	 
	function drawGameBoard(){
		
		gameBoard = d3.select('#gameBoard');
		$('svg').remove();
		
		var canvas = gameBoard.append('svg')
			.attr("width", gameBoardWidth)
			.attr("height", gameBoardHeight);
			
		var letterpillarG = canvas.append('g').classed('letterpillarG', true);
		var lettersG = canvas.append('g').classed('lettersG', true);
		var textG = canvas.append('g').classed('textG', true);
		
		// Ensure that elements are not chopped off when drawn at the limits of the range
		var padRangeBy = circleRadius + gameBoardPadding;
		
		scaleX = d3.scale.linear()
			.range([padRangeBy, gameBoardWidth - padRangeBy])
			.domain(d3.extent(gridPoints, function(d) { return d.x; }));
		scaleY = d3.scale.linear()
			.range([padRangeBy, gameBoardHeight - padRangeBy])
			.domain(d3.extent(gridPoints, function(d) { return d.y; }));

		// Draw letters
		var groups = d3.select('.lettersG')
			.selectAll('g')
			.data(gridPoints)
			.enter()
			.append('g')
			.attr("transform", function(d) {
				 return "translate(" + scaleX(d.x) + "," + scaleY(d.y) + ")"; 
			});
			
			// Begin by drawing an invisible circle at every position
			groups.append('circle')
				.attr("r", circleRadius)
				.attr("stroke", "transparent")
				.attr("fill", "transparent");
			
			groups.append('text')
				.attr("dy", textOffset);
			
			// Draw letterpillar
			d3.select('.letterpillarG')
				.selectAll('rect')
				.data(letterpillar)
				.enter()
				.append('rect')
				.attr("transform", function(d) {
					 return "translate(" + scaleX(d.x) + "," + scaleY(d.y) + ")"; 
				})
				.classed('head', true)
				.attr('width', rectWidth)
				.attr('height', rectWidth)
				.attr("rx", rectCorner)
				.attr("ry", rectCorner)
				.attr("x", -circleRadius)
				.attr("y", -circleRadius)
				;
				
	}
	
	function redrawLetterpillar(drawType){
		
		if(drawType == 'exit'){
			d3.select('.letterpillarG')
				.selectAll('rect')
				.data(letterpillar)
				.exit()
				.remove();
				
			d3.select('.textG')
				.selectAll('g')
				.remove();
			d3.select('.textG')
				.selectAll('g')
				.data(letterpillar) // TODO AMW it should not be necessary to rebind
				.enter()
				.append('g');
				
		}
		else if(drawType == 'enter'){
			d3.select('.letterpillarG')
					.selectAll('rect')
					.data(letterpillar) // TODO AMW it should not be necessary to rebind
					.enter()
					.append('rect');	
					
			d3.select('.textG')
				.selectAll('g')
				.data(letterpillar) // TODO AMW it should not be necessary to rebind
				.enter()
				.append('g');
		}
		
		
			var letterpillarGroups =  d3.select('.letterpillarG')
				.selectAll('rect') 
				.attr("rx", rectCorner)
				.attr("ry", rectCorner)
				.attr("x", -circleRadius)
				.attr("y", -circleRadius)
				.attr("transform", function(d) {
					 return "translate(" + scaleX(d.x) + "," + scaleY(d.y) + ")"; 
				   });		

			d3.select('.letterpillarG')
				.selectAll('rect')
				.attr('width', function(d){
					return rectWidth;
					if(d.moveDirection == undefined || d.moveDirection == 'none') return 18;
					return (d.moveDirection == 'vertical') ? 18 : rectWidth;
				})
				.attr('height', function(d){
					return rectWidth;
					if(d.moveDirection == undefined || d.moveDirection == 'none') return 18;
					return (d.moveDirection == 'vertical') ? rectWidth : 18;
				});
				
			d3.select('.textG')
				.selectAll('g')
				.attr("transform", function(d) {
					 return "translate(" + scaleX(d.x) + "," + scaleY(d.y) + ")"; 
				   })
				.each(function(){
					
			d3.select(this)
					.selectAll('text')
					.data(function(d){return [d]})
					.enter()
					.append('text')
					.attr("dy", textOffset)
					.text(function(d){
						return d.letter == undefined || d.letter.letter == '' ? '' : d.letter.letter;
					});
			});
	}
	
	function redrawLetters(){
		d3.select('.lettersG')
			.selectAll('circle')
			.attr("r", circleRadius)
			.attr("stroke", function(d){
				if(d.letter == undefined || d.letter.score == 0 ){
					return 'transparent';
				}
				else if(isVowel(d.letter)){
					return vowelColour;
				}
				return colours[d.letter.score];
			})
			.attr("fill", function(d){
				if(d.letter == undefined || d.letter.score == 0 ){
					return 'transparent';
				}
				else if(isVowel(d.letter)){
					return vowelColour;
				}
				return colours[d.letter.score];
			});
			
		d3.select('.lettersG')
			.selectAll('text')
			//.attr("dx", '-'+textOffset)
			.attr("dy", textOffset)
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
	
	function stopGame(){
		timerIsRunning = false;
		updateDisplayedTime();
		clearInterval(timerIntervalId);
		clearInterval(gameBoardIntervalId);
		$('#toggleTimer').html('start');
		
		
		$('#bottomPanel').hide();
		$('#pauseGame').prop('disabled', true);
		$('#validateWord').prop('disabled', true);
		
		showDialog();
	}
	
	function showDialog(){
		var dialog = $('#dialog');
		dialog.show();
		$('#overlay').show();	
		dialog.css('left', $(document).innerWidth() / 2 - dialog.width() / 2 +'px');
		dialog.css('top', $(document).innerHeight() / 2 - dialog.height() / 2 +'px');
		dialog.find('button').focus(); 
	}
	
	function hideDialog(){
		$('#dialog').hide();
		$('#overlay').hide();
		$('#toggleTimer').focus();
	}
	
	function showInstructions(){
		var instructions = $('#instructions');
		instructions.show();
		$('#overlay').show();	
		instructions.css('left', $(document).innerWidth() / 2 - instructions.width() / 2 +'px');
		instructions.css('top', $(document).innerHeight() / 2 - instructions.height() / 2 +'px');
		instructions.find('button').focus();
	}
	
	function hideInstructions(){
		$('#instructions').hide();
		$('#overlay').hide();
		// TODO AMW focus on what?
		//$('#toggleTimer').focus();
	}
	
	function makeGridSquare(x,y,letter){
		 return {x:x, y:y, letter:letter};
	 }
	 
	function makeDismemberedBodyPart(x, y, letter, prev, moveDirection){
		var direction = undefined;
		if(moveDirection != undefined)
			direction = moveDirection == 'up' || moveDirection == 'down' ? 'vertical' : 'horizontal';
		
		return {x: x, y: y, letter: letter, prev: prev, moveDirection: direction};
	}
	
	function startGame(){
		
		// Start both timers
		timerIsRunning = true;
		startTime = $.now();
		timerIntervalId = setInterval(updateDisplayedTime, timerUpdateDuration);
		gameBoardIntervalId = setInterval(updateGameBoard, gameBoardUpdateDuration);
		
		setGameBoardSize();
		
		gridPoints = setGrid();
		bag = fillBag();
		letterpillar = [makeDismemberedBodyPart(getRandomNumber(0,gridWidth-1),
			getRandomNumber(0, gridHeight-1),undefined, undefined, lastMove)];
		
		drawGameBoard();
		
		updateBottomPanel('');
		
		$('#toggleTimer').html('stop');
		//$('#dialog').hide();
		$('#overlay').hide();
		$('#score').html('');
		$('#bottomPanel').show();
		$('#wordList').html('');
		$('#pauseGame').prop('disabled', false);
		$('#validateWord').prop('disabled', false);
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
		
		var timeValue = (''+minutes).substring(0,2) + ':' + (''+seconds).substring(0,2);
		if(hours > 0)
			timeValue = (''+hours).substring(0,3) + ':'+timeValue;
		$('#time time .seconds').html(timeValue);
		$('#time time .milliseconds').html(':'+miliseconds);
	}
	
	$('#validateWord').click(function(){
		validateWord();
	});
	
	$('#toggleTimer').click(function(){
		if(!timerIsRunning){
			startGame();
		} else {
			stopGame();
		}
	});
	
	$('#dialog button').click(function(){
		hideDialog();
	});
	
	$('#instructions button').click(function(){
		hideInstructions();
	});
	
	$('#instructionsLink').click(function(d){
		showInstructions();
		
		d.originalEvent.returnValue = false; // IE (TODO AMW find out how necessary this is)
		return false;
	});
	
	$('#pauseGame').click(function(d){
		// Timer will continue but letters will stop being added
		alert('Click OK to resume.');
	});
	
	$('#overlay').click(function(event){
		
		
		event.preventDefault();
		event.stopPropagation();
		event.stopImmediatePropagation();
		
		event.originalEvent.returnValue = false; // IE (TODO AMW find out how necessary this is)
		
	});
	
	
	$('input').change(function(){
		console.log($(this).val());
	});
	
	$(document).keydown(function(e) {		
		switch (e.keyCode) {
        case 37:
		case 100: // numpad
			lastMove = 'left';
			move(lastMove);
            break;
        case 38:
		case 104: // numpad
			lastMove = 'up';
			move(lastMove);
            break;
        case 39:
		case 102:
			lastMove = 'right';
			move(lastMove);
            break;
        case 40:
		case 98: // numpad
			lastMove = 'down';
			move(lastMove);
            break;
		case 13: 	// [enter]
		case 0:  	// [space] mozilla
		case 32:  // [space] other browsers
			validateWord();
			break;
		}
	});
	
});







