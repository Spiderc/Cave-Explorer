var gameLevel;
var map;
var userSquare = [0, 0];
var torchesCount = 0;

jQuery(document).ready(function(){
	jQuery("#welcomeDialog").dialog({autoOpen: false});
	jQuery("#rulesDialog").dialog({autoOpen: false});
	jQuery("#deathDialog").dialog({autoOpen: false});
	displayRules();
});

function displayRules(){
	jQuery("#welcomeDialog").dialog({
		width: 500
	});
	jQuery("#rulesDialog").dialog({
		width: 500
	});
	jQuery("#welcomeDialog").dialog("open");
	jQuery("#welcomeDialog").dialog({
		close: function(event, ui){
			jQuery("#rulesDialog").dialog("open");
		}
	});
	jQuery("#rulesDialog").dialog({
		close: function(event, ui){
			jQuery(document).keypress(function(event){
				if(event.key === "ArrowUp"){
					moveUp();
				} else if(event.key === "ArrowDown"){
					moveDown();
				} else if(event.key === "ArrowLeft"){
					moveLeft();
				} else if(event.key === "ArrowRight"){
					moveRight();
				} else if(event.key === " " && torchesCount > 0){
					useTorch();
				}
			});
			startGame();
		}
	});
}

function startGame(){
	gameLevel = 0;
	torchesCount = 0;
	createMap();
}

function createMap(){
	var square;
	map = new Array(gameLevel + 3);
	for(var i=0; i < gameLevel + 3; i++){
		map[i] = new Array(gameLevel + 3);
	}
	map[0][0] = "user";
	userSquare = [0, 0];
	if(gameLevel > 2){
		for(i = 0; i < gameLevel; i++){
			square = pickRandomEmptyNonEdgeSquare();
			map[square[0]][square[1]] = "ice patch";
		}
	}
	//~ if(gameLevel > 1){
		//~ for(i = 0; i < gameLevel; i++){
			//~ square = pickRandomEmptySquare();
			//~ map[square[0]][square[1]] = "ice block";
		//~ }
	//~ }
	//~ if(gameLevel > 0){
		//~ for(i = 0; i < gameLevel; i++){
			//~ square = pickRandomEmptySquare();
			//~ map[square[0]][square[1]] = "pit";
		//~ }
	//~ }
	square = pickRandomEmptySquare();
	map[square[0]][square[1]] = "torch";
	drawMap();
}

function pickRandomEmptySquare(){
	var row = Math.floor(Math.random() * (gameLevel + 3));
	var col = Math.floor(Math.random() * (gameLevel + 3));
	while(map[row][col] != null){
		row = Math.floor(Math.random() * (gameLevel + 3));
		col = Math.floor(Math.random() * (gameLevel + 3));
	}
	return [row, col];
}

function pickRandomEmptyNonEdgeSquare(){
	var row = Math.floor(Math.random() * (gameLevel + 1)) + 1;
	var col = Math.floor(Math.random() * (gameLevel + 1)) + 1;
	while(map[row][col] != null){
		row = Math.floor(Math.random() * (gameLevel + 1)) + 1;
		col = Math.floor(Math.random() * (gameLevel + 1)) + 1;
	}
	return [row, col];
}

function checkCurrentSquare(){
	userRow = userSquare[0];
	userCol = userSquare[1];
	if(map[userRow][userCol] != null && map[userRow][userCol] !== "explored"){
		if(map[userRow][userCol] === "torch"){
			torchesCount = torchesCount + 1;
			addMessage("Level " + gameLevel + " complete.");
			gameLevel = gameLevel + 1;
			addMessage("Starting level " + gameLevel + ".");
			createMap();
		} else if(map[userRow][userCol] === "pit"){
			jQuery("#deathMessage").html("You fell into a pit!");
			jQuery("#deathDialog").dialog("open");
			jQuery("#deathDialog").dialog({
				close: function(event, ui){
					addMessage("Restarting to level 0.");
					startGame();
				}
			});
		} else if(map[userRow][userCol] === "ice block"){
			addMessage("The way was blocked by a large block of ice!");
			for(var i = 0; i < gameLevel + 3; i++){
				for(var j = 0; j < gameLevel + 3; j++){
					if(map[i][j] === "user"){
						userSquare = [i, j];
					}
				}
			}
		} else if(map[userRow][userCol] === "ice patch" || map[userRow][userCol] === "ice patch e"){
			addMessage("You slipped on a patch of ice!");
			for(var i = 0; i < gameLevel + 2; i++){
				for(var j = 0; j < gameLevel + 2; j++){
					if(map[i][j] === "user"){
						moveuser(userRow + (userRow - i), userCol + (userCol - j));
						userSquare = [userRow + (userRow - i), userCol + (userCol - j)];
						map[userRow][userCol] = "ice patch e";
					}
				}
			}
		}
	} else {
		moveuser(userRow, userCol);
	}
	drawMap();
}

function addMessage(message){
	jQuery("#messageArea").html(message + "<br/>" + jQuery("#messageArea").html());
}

function clearMessages(){
	jQuery("#messageArea").html("");
}

function moveuser(userRow, userCol){
	for(var i=0; i < gameLevel + 3; i++){
		for(var j=0; j < gameLevel + 3; j++){
			if(map[i][j] === "user") {
				if(torchesCount > 0){
					map[i][j] = "explored";
				} else {
					map[i][j] = undefined;
				}
			}
		}
	}
	map[userRow][userCol] = "user";
}

function moveUp(){
	if(userSquare[0] - 1 < 0){
		addMessage("You cannot move up.");
	} else {
		userSquare[0] = userSquare[0] - 1;
		checkCurrentSquare();
	}
}

function moveDown(){
	if(userSquare[0] + 1 > gameLevel + 2){
		addMessage("You cannot move down.");
	} else {
		userSquare[0] = userSquare[0] + 1;
		checkCurrentSquare();
	}
}

function moveLeft(){
	if(userSquare[1] - 1 < 0){
		addMessage("You cannot move left.");
	} else {
		userSquare[1] = userSquare[1] - 1;
		checkCurrentSquare();
	}
}

function moveRight(){
	if(userSquare[1] + 1 > gameLevel + 2){
		addMessage("You cannot move right.");
	} else {
		userSquare[1] = userSquare[1] + 1;
		checkCurrentSquare();
	}
}

function useTorch(){
	torchesCount = torchesCount - 1;
	if(userSquare[0] !== 0){
		torch(userSquare[0] - 1, userSquare[1]);
	}
	if(userSquare[0] !== gameLevel + 2){
		torch(userSquare[0] + 1, userSquare[1]);
	}
	if(userSquare[1] !== 0){
		torch(userSquare[0], userSquare[1] - 1);
	}
	if(userSquare[1] !== gameLevel + 2){
		torch(userSquare[0], userSquare[1] + 1);
	}
	drawMap();
}

function drawMap(){
	jQuery("#torchesCount").html(torchesCount);
	var gameHtml = "";
	for(var i=0; i <gameLevel + 3; i++){
		for(var j=0; j <gameLevel + 3; j++){
			if(map[i][j] === "user"){
				gameHtml = gameHtml + "<div class='square user'></div>";
			} else if(map[i][j] === "explored"){
				gameHtml = gameHtml + "<div class='square explored'></div>";
			} else if(map[i][j] === "ice patch e"){
				gameHtml = gameHtml + "<div class='square ice'></div>";
			} else {
				gameHtml = gameHtml + "<div class='square'></div>";
			}
		}
		gameHtml = gameHtml + "<br/>";
	}
	jQuery("#gameArea").html(gameHtml);
	checkAdjacentSquares();
}

function checkAdjacentSquares(){
	if(userSquare[0] !== 0){
		checkSquare(userSquare[0] - 1, userSquare[1]);
	}
	if(userSquare[0] !== gameLevel + 2){
		checkSquare(userSquare[0] + 1, userSquare[1]);
	}
	if(userSquare[1] !== 0){
		checkSquare(userSquare[0], userSquare[1] - 1);
	}
	if(userSquare[1] !== gameLevel + 2){
		checkSquare(userSquare[0], userSquare[1] + 1);
	}
}

function checkSquare(row, col){
	if(map[row][col] === "pit"){
		addMessage("You feel a breeze.");
	} else if(map[row][col] === "ice block"){
		addMessage("There is a large block of ice nearby.");
	} else if(map[row][col] === "ice patch" || map[row][col] === "ice patch e"){
		addMessage("You feel a slight chill.");
	}
}

function torch(row, col){
	if(map[row][col] !== "pit" && map[row][col] !== "torch"){
		map[row][col] = "explored";
	}
}
