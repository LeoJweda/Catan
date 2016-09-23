/*// The HTML5 canvase where we will be rendering our map.
var canvas = document.getElementById("mapCanvas");
var ctx = canvas.getContext("2d");

// This function is used to initialize everything when the game starts.
$(document).ready(function() {
  canvas.width = 1280;
  canvas.height = 720;
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 10;

  // Handle canvas click events.
  canvas.addEventListener('click', function(e) {
    // Get the click position.
    var rect = canvas.getBoundingClientRect();

    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    x *= canvas.width / $("#mapCanvas").width();
    y *= canvas.height / $("#mapCanvas").height();

    var clickedNodeIndex = detectClickedNode(x, y);

    // Pass it to preformAction to process it.
    performAction(clickedNodeIndex);
  }, false);
});*/

"use strict";

//location card class
class Location {
    //constructor
    constructor(id, locationName, value, x, y) {
        this.id = id;
        this.locationName = locationName;
        this.value = value;
        this.x = x;
        this.y = y;

        // Get the right color and resource name for each location
        switch (locationName) {
            case "Hills":
                this.color = "#d77b42";
                this.resourceName = "brick";
                break;
            case "Forest":
                this.color = "#34a642";
                this.resourceName = "lumber";
                break;
            case "Mountains":
                this.color = "#797979";
                this.resourceName = "ore";
                break;
            case "Fields":
                this.color = "#ffd301";
                this.resourceName = "grain";
                break;
            case "Pasture":
                this.color = "#a8d242";
                this.resourceName = "wool";
                break;
            case "Desert":
                this.color = "#fdfdb9";
                break;
            default:
                this.color = "#3daad6";
                break;
        }
    }
}


//import Location from "location.js";

var tileWidth = 124,
    tileHeight = 108,
    tileBigHeight = 140;

//FOR NOW: this will be a three-dimensional array that holds the data of the coordinates for each tile
//(ArrayOfTileVerticesCoordinates[INDEX OF TILE] [INDEX OF VERTEX] [INDEX OF COORDINATE (x=0,y=1)]]
var ArrayOfTileVerticesCoordinates = [];

var ArrayOfVerticesCoordinates = [];

var ArrayOfEdgesCoordinates = [];

// Class for whole board of tiles
class Catan {
    // Constructor
    constructor() {
        // Get canvas info
        this.canvas = document.getElementById('mapCanvas');
        this.canvas.width = 1280;
        this.canvas.height = 720;
        this.ctx = this.canvas.getContext("2d");

        // Setup variables for storing used build sites
        this.usedBuildSites = [];
        this.usedRoadSites = [];
    }

    setBoard(board) {
      this.board = board;
      this.render();
    }

    // Function to draw a single tile and returns the array of vertex coordinates
    drawTile(location) {
        // Draw the hexagon and save its array of vertices
        var vertexArray = this.drawHexagon(location.x, location.y, location.color);

        // Draw the number
        if (location.value !== 0) {
          var sideLength = 72;
          var hexagonAngle = 0.523598776; // 30 degrees in radians
          var hexHeight = Math.sin(hexagonAngle) * sideLength;
          var hexRadius = Math.cos(hexagonAngle) * sideLength;
          var hexRectangleHeight = sideLength + 2 * hexHeight;
            this.drawCircle(this.ctx, location.x + hexRadius, location.y + hexRectangleHeight / 2, 30);
            if (location.value == 6 || location.value == 8)
                this.ctx.fillStyle = "red";
            else
                this.ctx.fillStyle = "black";
            this.ctx.strokeStyle = "black";
            this.ctx.font = "30px Arial";

            if (location.value < 10) {
                this.ctx.fillText(location.value, location.x + 53, location.y + 82);
                // this.ctx.strokeText(location.value, location.x + 53, location.y + 82);
            } else {
                this.ctx.fillText(location.value, location.x + 45, location.y + 82);
                // this.ctx.strokeText(location.value, location.x + 45, location.y + 82);
            }
        }

        return vertexArray; //return the array of vertex coordinates
    }

    // Function to draw a hexagon and returns an array with an array of vertex coordinates
    drawHexagon(x, y, fillColor) {
        var sideLength = 72;
        var hexagonAngle = 0.523598776; // 30 degrees in radians
        var hexHeight = Math.sin(hexagonAngle) * sideLength;
        var hexRadius = Math.cos(hexagonAngle) * sideLength;
        var hexRectangleHeight = sideLength + 2 * hexHeight;
        var hexRectangleWidth = 2 * hexRadius;
        var listOfVertexCoordinates = []; //array that will hold the vertices of the hexagon

        this.ctx.fillStyle = fillColor;
        this.ctx.beginPath();
        var v0 = [x + hexRadius, y]; //creates an array with the coordinates as entries
        this.ctx.moveTo(v0[0], v0[1]); //move to vertex 0
        listOfVertexCoordinates.push(v0); //pushes the coordinates array to the vertex array
        var v1 = [x + hexRectangleWidth, y + hexHeight];
        this.ctx.lineTo(v1[0], v1[1]); // move to vertex 1
        listOfVertexCoordinates.push(v1);
        var v2 = [x + hexRectangleWidth, y + hexHeight + sideLength];
        this.ctx.lineTo(v2[0], v2[1]); //move to vertex 2
        listOfVertexCoordinates.push(v2);
        var v3 = [x + hexRadius, y + hexRectangleHeight];
        this.ctx.lineTo(v3[0], v3[1]); //move to vertex 3
        listOfVertexCoordinates.push(v3);
        var v4 = [x, y + sideLength + hexHeight];
        this.ctx.lineTo(v4[0], v4[1]); //move to vertex 4
        listOfVertexCoordinates.push(v4);
        var v5 = [x, y + hexHeight];
        this.ctx.lineTo(v5[0], v5[1]); //move to vertex 5
        listOfVertexCoordinates.push(v5);
        this.ctx.closePath(); //close off the hexagon by going back to vertex 0

        this.ctx.fill();
        this.ctx.fillStyle = "black";
        this.ctx.stroke();

        return listOfVertexCoordinates; //returns the list of of vertices for the hexagon
        //(two-dimensional array that holds arrays of x and y pairs for each vertex)
    }

    // Function to draw a circle
    drawCircle(context, centerX, centerY, radius) {
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.fillStyle = "white";
        context.fill();
        context.strokeStyle = "black";
        context.stroke();
    }

    // Function to draw a triangle
    drawTriangle(context, centerX, centerY, sideLength, color, orientation) {
      context.beginPath();
      context.moveTo(centerX, centerY);

      if (orientation == 0 || orientation == 1) {
        context.lineTo(centerX + Math.sqrt(3) * sideLength / 2, centerY - sideLength / 2);
      }

      if (orientation == 1 || orientation == 2) {
        context.lineTo(centerX + Math.sqrt(3) * sideLength / 2, centerY + sideLength / 2);
      }

      if (orientation == 2 || orientation == 3) {
        context.lineTo(centerX, centerY + sideLength);
      }

      if (orientation == 3 || orientation == 4) {
        context.lineTo(centerX - Math.sqrt(3) * sideLength / 2, centerY + sideLength / 2);
      }

      if (orientation == 4 || orientation == 5) {
        context.lineTo(centerX - Math.sqrt(3) * sideLength / 2, centerY - sideLength / 2);
      }

      if (orientation == 5 || orientation == 0) {
        context.lineTo(centerX, centerY - sideLength);
      }

      context.closePath();
      context.fillStyle = color;
      context.fill();
      context.strokeStyle = "black";
      context.stroke();
    }

    // Function to draw robber
    drawRobber() {
      var sideLength = 72;
      var hexagonAngle = 0.523598776; // 30 degrees in radians

      var hexRadius = Math.cos(hexagonAngle) * sideLength;
        var robberX = 4 * tileWidth,
            robberY = tileHeight + sideLength;

        if (0 <= this.board.robberPosition && this.board.robberPosition < 3) {
            robberX += tileWidth * this.board.robberPosition;
        } else if (3 <= this.board.robberPosition && this.board.robberPosition < 7) {
            robberX += tileWidth * (this.board.robberPosition - 3) - 0.5 * tileWidth;
            robberY += tileHeight;
        } else if (7 <= this.board.robberPosition && this.board.robberPosition < 12) {
            robberX += tileWidth * (this.board.robberPosition - 7) - 1 * tileWidth;
            robberY += 2 * tileHeight;
        } else if (12 <= this.board.robberPosition && this.board.robberPosition < 16) {
            robberX += tileWidth * (this.board.robberPosition - 12) - 0.5 * tileWidth;
            robberY += 3 * tileHeight;
        } else {
            robberX += tileWidth * (this.board.robberPosition - 16);
              robberY += 4 * tileHeight;
        }

        this.ctx.beginPath();
        this.ctx.arc(robberX, robberY, 20, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = "#7f7f7f";
        this.ctx.fill();

        //this.drawCircle(this.ctx, robberX, robberY, 20);
    }

    // Function to draw a settlement
    drawSettlement(index, color) {
        // Set color
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = "black";

        // Get the coordinates of where to draw the settlement
        var x = 2 * tileWidth, y = 0.416666667 * tileHeight;

        if (0 <= index && index < 3) {
            x += tileWidth * index;
        } else if (3 <= index && index < 7) {
            x += tileWidth * (index - 3) - 0.5 * tileWidth;
            y += (1 / 4) * tileBigHeight;
        } else if (7 <= index && index < 11) {
            x += tileWidth * (index - 7) - 0.5 * tileWidth;
            y += (3 / 4) * tileBigHeight;
        } else if (11 <= index && index < 16) {
            x += tileWidth * (index - 11) - 1 * tileWidth;
            y += (4 / 4) * tileBigHeight;
        } else if (16 <= index && index < 21) {
            x += tileWidth * (index - 16) - 1 * tileWidth;
            y += (6 / 4) * tileBigHeight;
        } else if (21 <= index && index < 27) {
            x += tileWidth * (index - 21) - 1.5 * tileWidth;
            y += (7 / 4) * tileBigHeight;
        } else if (27 <= index && index < 33) {
            x += tileWidth * (index - 27) - 1.5 * tileWidth;
            y += (9 / 4) * tileBigHeight;
        } else if (33 <= index && index < 38) {
            x += tileWidth * (index - 33) - 1 * tileWidth;
            y += (10 / 4) * tileBigHeight;
        } else if (38 <= index && index < 43) {
            x += tileWidth * (index - 38) - 1 * tileWidth;
            y += (12 / 4) * tileBigHeight;
        } else if (43 <= index && index < 47) {
            x += tileWidth * (index - 43) - 0.5 * tileWidth;
            y += (13 / 4) * tileBigHeight;
        } else if (47 <= index && index < 51) {
            x += tileWidth * (index - 47) - 0.5 * tileWidth;
            y += (15 / 4) * tileBigHeight;
        } else if (51 <= index && index < 54) {
            x += tileWidth * (index - 51);
            y += (16 / 4) * tileBigHeight;
        } else {
            x = NaN;
            y = NaN;
        }

        // Draw the square
        this.ctx.fillRect(x, y, 25, 25);
        this.ctx.strokeRect(x, y, 25, 25);
    }

    /*****************************************************************
     *      Draw Road function method that Isaac is working on
     *****************************************************************/
    //Function to draw roads
    drawRoad(edge, color) {

    }

    // Function to draw a city
    drawCity(index, color) {
        // Set color
        this.ctx.fillStyle = color;
    }

    // Render function
    render() {
        // Fill the background
        this.ctx.fillStyle = "#3daad6";
        this.ctx.fillRect(0, 0, 1280, 720);

        // Draw each tile and add it's array of vertices to the big array
        for (var i = 0; i < this.board.tiles.length; i++) {
            var vertices = this.drawTile(this.board.tiles[i]);
            ArrayOfTileVerticesCoordinates.push(vertices);
            addToArrayOfVerticesCoordinates(vertices);

            var edges = [];
            var x, y;
            for (var j = 0; j < vertices.length; j++) {
              if (j < vertices.length - 1) {
                x = (vertices[j][0] + vertices[j + 1][0]) / 2;
                y = (vertices[j][1] + vertices[j + 1][1]) / 2;
              } else {
                x = (vertices[j][0] + vertices[0][0]) / 2;
                y = (vertices[j][1] + vertices[0][1]) / 2;
              }
              edges.push([x, y]);
            }

            addToArrayOfEdgesCoordinates(edges);
        }

        var sideLength = 72;
        var hexagonAngle = 0.523598776; // 30 degrees in radians
        var hexRadius = Math.cos(hexagonAngle) * sideLength;
        console.log(hexRadius);

        this.drawTriangle(this.ctx, 3 * tileWidth + hexRadius, sideLength, hexRadius, "#cccccc", 2);
        this.drawTriangle(this.ctx, 5 * tileWidth + hexRadius, sideLength, hexRadius, "#ffd300", 3);
        this.drawTriangle(this.ctx, 6.5 * tileWidth + hexRadius, tileHeight + sideLength, hexRadius, "#797979", 3);
        this.drawTriangle(this.ctx, 7.5 * tileWidth + hexRadius, 3 * tileHeight + sideLength, hexRadius, "#cccccc", 4);
        this.drawTriangle(this.ctx, 6.5 * tileWidth + hexRadius, 5 * tileHeight + sideLength, hexRadius, "#a8d242", 5);
        this.drawTriangle(this.ctx, 5 * tileWidth + hexRadius, 6 * tileHeight + sideLength, hexRadius, "#cccccc", 5);
        this.drawTriangle(this.ctx, 3 * tileWidth + hexRadius, 6 * tileHeight + sideLength, hexRadius, "#cccccc", 0);
        this.drawTriangle(this.ctx, 2 * tileWidth + hexRadius, 4 * tileHeight + sideLength, hexRadius, "#d77b42", 1);
        this.drawTriangle(this.ctx, 2 * tileWidth + hexRadius, 2 * tileHeight + sideLength, hexRadius, "#34a642", 1);

        // Draw the robber
        this.drawRobber();

        /*// Draw all of the players settlements and cities
        for (i = 0; i < players.length; i++) {
            for (var j = 0; j < players[i].settlements.length; j++) {
                this.drawSettlement(players[i].settlements[j], players[i].color);
            }
            for (j = 0; j < players[i].cities.length; j++) {
                this.drawCity(players[i].cities[j], this.players[i].color);
            }
        }*/

        // TODO: Draw all of the players roads
    }
}

function addToArrayOfEdgesCoordinates(edges) {
  for (var i = 0; i < edges.length; i++) {
    var found = false;
    for (var j = 0; j < ArrayOfEdgesCoordinates.length; j++) {
        if (ArrayOfEdgesCoordinates[j][0] == edges[i][0] && ArrayOfEdgesCoordinates[j][1] == edges[i][1]) {
          found = true;
          break;
        }
    }
    if (!found){
      ArrayOfEdgesCoordinates.push(edges[i]);
    }
  }
}

function addToArrayOfVerticesCoordinates(vertices) {
  for (var i = 0; i < vertices.length; i++) {
    var found = false;
    for (var j = 0; j < ArrayOfVerticesCoordinates.length; j++) {
        if (ArrayOfVerticesCoordinates[j][0] == vertices[i][0] && ArrayOfVerticesCoordinates[j][1] == vertices[i][1]) {
          found = true;
          break;
        }
    }
    if (!found){
      ArrayOfVerticesCoordinates.push(vertices[i]);
    }
  }
}
