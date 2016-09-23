"use strict";

class Player {
    // Constructor
    constructor() {
        this.id = "";
        this.name = "";
        this.color = "";
        this.points = 0;
        this.longestRoad = false;
        this.largestArmy = false;
        this.devCards = [];
        this.resources = {
            brick: 0,
            lumber: 0,
            ore: 0,
            grain: 0,
            wool: 0
        };
        // Trick to make array of 0's
        this.ownedTiles = new Array(19 + 1).join('0').split('').map(parseFloat);
        this.settlements = [];
        this.cities = [];
    }
}


var express = require('express');
var app = express();
var counter = 0;
var BALL_SPEED = 10;
var WIDTH = 1100;
var HEIGHT = 580;
var TANK_INIT_HP = 100;

app.use(express.static(__dirname + '/www'));

var server = app.listen(8082, function () {
	var port = server.address().port;
	console.log('Server running at port %s', port);
});

var io = require('socket.io')(server);





// Setup new game
var gameddd = require('./js/game.js');
/*
for (var i = 1; i <= numPlayers; i++) {
    var playerName, color;

    // Get name and color, checking for blanks and duplicates
    do {
        playerName = prompt("Enter Player " + i + " name: ");
    } while (!playerName || playerNames.indexOf(playerName) != -1);

    do {
        color = prompt("Enter Player " + i + " color (Ex. blue, red, green, yellow): ");
    } while (!color || playerColors.indexOf(color) != -1);

    // Add new player to player list
    players.push(new Player(playerName, color));
    playerNames.push(playerName);
    playerColors.push(color);
}

game.newBoard();

// Render the new board
// game.board.render(game.players);

while (!game.over) {
    game.nextTurn();
}
*/









function GameServer(){
  var players = [];
  var playerNames = [];
  var playerColors = [];
}

GameServer.prototype = {
	addTank: function(tank){
		this.tanks.push(tank);
	},

	addBall: function(ball){
		this.balls.push(ball);
	},

	removeTank: function(tankId){
		//Remove tank object
		this.tanks = this.tanks.filter( function(t){return t.id != tankId} );
	},

	//Sync tank with new data received from a client
	syncTank: function(newTankData){
		this.tanks.forEach( function(tank){
			if(tank.id == newTankData.id){
				tank.x = newTankData.x;
				tank.y = newTankData.y;
				tank.baseAngle = newTankData.baseAngle;
				tank.cannonAngle = newTankData.cannonAngle;
			}
		});
	},

	//The app has absolute control of the balls and their movement
	syncBalls: function(){
		var self = this;
		//Detect when ball is out of bounds
		this.balls.forEach( function(ball){
			self.detectCollision(ball);

			if(ball.x < 0 || ball.x > WIDTH
				|| ball.y < 0 || ball.y > HEIGHT){
				ball.out = true;
			}else{
				ball.fly();
			}
		});
	},

	//Detect if ball collides with any tank
	detectCollision: function(ball){
		var self = this;

		this.tanks.forEach( function(tank){
			if(tank.id != ball.ownerId
				&& Math.abs(tank.x - ball.x) < 30
				&& Math.abs(tank.y - ball.y) < 30){
				//Hit tank
				self.hurtTank(tank);
				ball.out = true;
				ball.exploding = true;
			}
		});
	},

	hurtTank: function(tank){
		tank.hp -= 2;
	},

	getData: function(){
		var gameData = {};
		gameData.tanks = this.tanks;
		gameData.balls = this.balls;

		return gameData;
	},

	cleanDeadTanks: function(){
		this.tanks = this.tanks.filter(function(t){
			return t.hp > 0;
		});
	},

	cleanDeadBalls: function(){
		this.balls = this.balls.filter(function(ball){
			return !ball.out;
		});
	},

	increaseLastBallId: function(){
		this.lastBallId ++;
		if(this.lastBallId > 1000){
			this.lastBallId = 0;
		}
	}
}

var game = new GameServer();

/* Connection events */

var players = [];

io.on('connection', function(client) {
	console.log('User connected');
	client.emit('connected', {id: players.length, colors: ["Blue", "Orange", "Red", "White"], players: players});
	players.push(new Player());
  players[players.length - 1].id = players.length - 1;

	client.on('changedName', function(data){
    var result = players.filter(function(p) {
        return p.name === data.name;
    });

		if (result.length == 0) {
			players[data.id].name = data.name;
			client.emit("nameValid");
		} else if (result[0].id == data.id) {
			players[data.id].name = data.name;
			client.emit("nameValid");
		} else {
			client.emit("nameExists");
		}
		io.sockets.emit("playersUpdate", players);
	});

  client.on('changedColor', function(data){
    var result = players.filter(function(p) {
        return p.color === data.color;
    });

		if (result.length == 0) {
			players[data.id].color = data.color;
			client.emit("colorValid");
		} else if (result[0].id == data.id) {
			players[data.id].color = data.color;
			client.emit("colorValid");
		} else {
			client.emit("colorExists");
		}
		io.sockets.emit("playersUpdate", players);
	});

  client.on('ready', function(data){
		if (players.length == 3 || players.length == 4) {
      io.sockets.emit("start", gameddd.board);
    }
	});

  client.on('roll', function(data){
    var RandomOrg = require('random-org');

    var random = new RandomOrg({apiKey: 'f91c992f-7c53-4e83-9dee-93c618522e22'});
    random.generateIntegers({ min: 1, max: 6, n: 2 })
    .then(function(result) {
      io.sockets.emit("diceRolled", result.random.data);
    });
	});







	client.on('joinGame', function(tank){
		console.log(tank.id + ' joined the game');
		var initX = getRandomInt(40, 900);
		var initY = getRandomInt(40, 500);
		client.emit('addTank', { id: tank.id, type: tank.type, isLocal: true, x: initX, y: initY, hp: TANK_INIT_HP });
		client.broadcast.emit('addTank', { id: tank.id, type: tank.type, isLocal: false, x: initX, y: initY, hp: TANK_INIT_HP} );

		game.addTank({ id: tank.id, type: tank.type, hp: TANK_INIT_HP});
	});

	client.on('sync', function(data){
		//Receive data from clients
		if(data.tank != undefined){
			game.syncTank(data.tank);
		}
		//update ball positions
		game.syncBalls();
		//Broadcast data to clients
		client.emit('sync', game.getData());
		client.broadcast.emit('sync', game.getData());

		//I do the cleanup after sending data, so the clients know
		//when the tank dies and when the balls explode
		game.cleanDeadTanks();
		game.cleanDeadBalls();
		counter ++;
	});

	client.on('shoot', function(ball){
		var ball = new Ball(ball.ownerId, ball.alpha, ball.x, ball.y );
		game.addBall(ball);
	});

	client.on('leaveGame', function(data){
		// console.log(tankId + ' has left the game');
		// game.removeTank(tankId);
    for (var i = 0; i < players.length; i++) {
      if (players[i].id == data.id) {
        players.splice(i, 1);
      }
    }
		io.sockets.emit("playersUpdate", players);
	});
});

function Ball(ownerId, alpha, x, y){
	this.id = game.lastBallId;
	game.increaseLastBallId();
	this.ownerId = ownerId;
	this.alpha = alpha; //angle of shot in radians
	this.x = x;
	this.y = y;
	this.out = false;
};

Ball.prototype = {

	fly: function(){
		//move to trayectory
		var speedX = BALL_SPEED * Math.sin(this.alpha);
		var speedY = -BALL_SPEED * Math.cos(this.alpha);
		this.x += speedX;
		this.y += speedY;
	}

}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}
