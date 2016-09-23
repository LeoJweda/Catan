var WIDTH = 1100;
var HEIGHT = 580;
var socket = io.connect('http://localhost:8082');
//var game = new Game('#arena', WIDTH, HEIGHT, socket);
var game = new Catan();
var selectedTank = 1;
var tankName = '';
var players = [];
var colors = [];
var id = 0;

socket.on('connected', function(data){
  colors = data.colors;
  id = data.id;

  updatePlayers();

  $('#gameSettings').modal({
    backdrop: 'static',
    keyboard: false
  });

  populateColorDropdown();
});

socket.on('playersUpdate', function(newPlayers){
  players = newPlayers;
  updatePlayers();
});

socket.on('nameExists', function(data){
  $('#nameFormGroup').removeClass("has-success");
  $('#nameFormGroup').addClass("has-error");
});

socket.on('nameValid', function(data){
  $('#nameFormGroup').removeClass("has-error");
  $('#nameFormGroup').addClass("has-success");
});

socket.on('colorExists', function(data){
  $('#colorFormGroup').removeClass("has-success");
  $('#colorFormGroup').addClass("has-error");
});

socket.on('colorValid', function(data){
  $('#colorFormGroup').removeClass("has-error");
  $('#colorFormGroup').addClass("has-success");
});

socket.on('start', function(board){
  $('#gameSettings').modal('hide');
  game.setBoard(board);
});

socket.on('diceRolled', function(dice){
  $('#notificationCenterSpan').html(dice);
  $('#notificationCenter').removeClass("invisible");
});

$(document).ready( function(){
  $('#mapCanvas').mousemove( function(e){
      var x,
          y,
          hexX,
          hexY,
          screenX,
          screenY;
      var rect = document.getElementById('mapCanvas').getBoundingClientRect();

      x = e.clientX - rect.left;
      y = e.clientY - rect.top;

      x *= document.getElementById('mapCanvas').width / $("#mapCanvas").width();
      y *= document.getElementById('mapCanvas').height / $("#mapCanvas").height();

      var sideLength = 72;
      var hexagonAngle = 0.523598776; // 30 degrees in radians
      var hexHeight = Math.sin(hexagonAngle) * sideLength;
      var hexRadius = Math.cos(hexagonAngle) * sideLength;
      var hexRectangleHeight = sideLength + 2 * hexHeight;
      var hexRectangleWidth = 2 * hexRadius;

      hexY = Math.floor(y / (hexHeight + sideLength));
      hexX = Math.floor((x - (hexY % 2) * hexRadius) / hexRectangleWidth);

      screenX = hexX * hexRectangleWidth + ((hexY % 2) * hexRadius);
      screenY = hexY * (hexHeight + sideLength);

      document.getElementById('mapCanvas').getContext("2d").clearRect(0, 0, document.getElementById('mapCanvas').width, document.getElementById('mapCanvas').height);

      game.render();

      // edge under cursor
      // var edgeRadius = 30;
      // var index = 0;
      // for (i = 0; i < ArrayOfEdgesCoordinates.length; i++) {
      //   var dist = Math.sqrt(Math.pow(x - ArrayOfEdgesCoordinates[i][0], 2) + Math.pow(y - ArrayOfEdgesCoordinates[i][1], 2));
      //   if (dist < edgeRadius) {
      //     index = i;
      //     console.log(index);
      //     break;
      //   }
      // }
      //
      // game.drawCircle(document.getElementById('mapCanvas').getContext("2d"), ArrayOfEdgesCoordinates[index][0], ArrayOfEdgesCoordinates[index][1], edgeRadius);

      // vertex under cursor
      // var vertexRadius = 30;
      // var index = 0;
      // for (i = 0; i < ArrayOfVerticesCoordinates.length; i++) {
      //   var dist = Math.sqrt(Math.pow(x - ArrayOfVerticesCoordinates[i][0], 2) + Math.pow(y - ArrayOfVerticesCoordinates[i][1], 2));
      //   if (dist < vertexRadius) {
      //     index = i;
      //     console.log(index);
      //     break;
      //   }
      // }
      //
      // game.drawCircle(document.getElementById('mapCanvas').getContext("2d"), ArrayOfVerticesCoordinates[index][0], ArrayOfVerticesCoordinates[index][1], vertexRadius);

      // tile under cursor
      var index = 0;
      for (i = 0; i <= 18; i++) {
        var dist = Math.sqrt(Math.pow(screenX - game.tiles[i].x, 2) + Math.pow(screenY - game.tiles[i].y, 2));
        if (dist < hexRadius) {
          index = i;
          console.log(index);
          break;
        }
      }

      if(hexX >= 0 && hexX < 10) {
          if(hexY >= 0 && hexY < 10) {
              game.drawHexagon(screenX, screenY, "rgb(255,255,255)");
          }
      }
  });

  $('#nameText').change( function(){
    socket.emit('changedName', {id: id, name: nameText.value});
  });

  $('#colorDropdown').change( function(){
    socket.emit('changedColor', {id: id, color: colorDropdown.value});
  });

  $('#ready').click( function(){
    socket.emit('ready', {id: id});
  });

  $('#rollLink').click( function(){
    socket.emit('roll', {id: id});
  });

  $('#tradeLink').click( function(){
    game.trade();
  });

  $('#buildLink').click( function(){
    game.build();
  });

  $('#endTurnLink').click( function(){
    game.endTurn();
  });
});

$(window).on('beforeunload', function(){
	socket.emit('leaveGame', {id: id});
});

function populateColorDropdown() {
  $("#colorDropdown option").remove();
  for (var i = 0; i < colors.length; i++) {
    var player = $.grep(players, function(p){ return p.color == colors[i]; });
    if (player.length == 0) {
      $("#colorDropdown").append("<option value=\"" + colors[i] + "\">" + colors[i] + "</option>");
    } else if (player[0].id == id) {
      $("#colorDropdown").append("<option value=\"" + colors[i] + "\" selected=\"selected\">" + colors[i] + "</option>");
    } else {
      $("#colorDropdown").append("<option value=\"" + colors[i] + "\" disabled=\"disabled\">" + colors[i] + "</option>");
    }
  }
}

function updatePlayers() {
  $("#players").html("");
  for (var i = 0; i < players.length; i++) {
    $("#players").append(players[i].name + " " + players[i].color + "<br/>");
  }

  populateColorDropdown();
}
