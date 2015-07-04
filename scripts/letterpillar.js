 var array = new Array(20,20);
 
 var columns = new Array(20);
 for(var i = 0; i < columns.length; i++){
	 var row = columns[i] = new Array(20);
	 for(var k = 0; k < row.length; k++){
		 row[k] = makeSquare(i,k,'',0);
	 }
 }
 
 var bag = [
	makeLetter('A', 9, 1), 
	makeLetter('B', 2, 3),
	makeLetter('C', 2, 3),
	makeLetter('D', 4, 2),
	makeLetter('E', 12, 1),
	makeLetter('F', 2, 4),
	makeLetter('G', 3, 2),
	makeLetter('H', 2, 4),
	makeLetter('I', 9, 1),
	makeLetter('J', 1, 8),
	makeLetter('K', 1, 5),
	makeLetter('L', 4, 1),
	makeLetter('M', 2, 3),
	makeLetter('N', 6, 1),
	makeLetter('O', 8, 1),
	makeLetter('P', 2, 3),
	makeLetter('Q', 1, 10),
	makeLetter('R', 6, 1),
	makeLetter('S', 4, 1),
	makeLetter('T', 6, 1),
	makeLetter('U', 4, 1),
	makeLetter('V', 2, 4),
	makeLetter('W', 2, 4),
	makeLetter('X', 1, 8),
	makeLetter('Y', 2, 4),
	makeLetter('Z', 1, 10),
	];
 
 /*
 2 blank tiles (scoring 0 points)
1 point: E ×12, A ×9, I ×9, O ×8, N ×6, R ×6, T ×6, L ×4, S ×4, U ×4
2 points: D ×4, G ×3
3 points: B ×2, C ×2, M ×2, P ×2
4 points: F ×2, H ×2, V ×2, W ×2, Y ×2
5 points: K ×1
8 points: J ×1, X ×1
10 points: Q ×1, Z ×1\*/
 function makeLetter(letter, quantity, score){
	 return {letter:letter, quantity:quantity, score:score};
 }
 
 function makeSquare(x,y,letter,score){
	 return {x:x, y:y, letter:letter, score:score};
 }
 
 $(document).ready(function() {
	for(var i = 0; i < columns.length; i++){
		for(var k = 0; k < columns[i].length; k++){
			console.log(columns[i][k].x + "," + columns[i][k].y + " ");
		}
	}
});