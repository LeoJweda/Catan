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

var tileWidth = 124;
var tileHeight = 108;

// Class for whole board of tiles
class Board {
    // Constructor
    constructor() {
        // Setup array for all tiles
        this.tiles = [];

        // Make a list with the right number of each tile
        var locations = ["Hills", "Hills", "Hills",
            "Forest", "Forest", "Forest", "Forest",
            "Mountains", "Mountains", "Mountains",
            "Fields", "Fields", "Fields", "Fields",
            "Pasture", "Pasture", "Pasture", "Pasture",
            "Desert"];

        // Make a list with the right number of each tile value
        var values = [5, 2, 6, 3, 8, 10, 9, 12, 11, 4, 8, 10, 9, 4, 5, 6, 3, 11];

        // Randomly shuffle the location array and the values array
        locations = shuffle(locations);

        // Get the position of the robber
        this.robberPosition = locations.indexOf("Desert");

    		var valIndex = 0,
      			i,
      			OutterRing = [0, 1, 2, 6, 11, 15, 18, 17, 16, 12, 7, 3],
      			InnerRing = [4, 5, 10, 14, 13, 8],
      			Center = 9;

    		var StartIndex = Math.round(Math.random()*11);

    		var Spiral = [];

        for (i = 0; i < OutterRing.length; i++) {
            Spiral.push(OutterRing[(i + StartIndex) % OutterRing.length]);
        }

    		var SecondRingStart = InnerRing.indexOf(getSecondRing(OutterRing[StartIndex]));
        for (i = 0; i < InnerRing.length; i++) {
            Spiral.push(InnerRing[(i + SecondRingStart) % InnerRing.length]);
        }

    		Spiral.push(Center);
    		for (i = 0; i < 19; i++){
          var j = Spiral[i];
    			if (j != this.robberPosition) {
            this.tiles.push(new Location(j, locations[j], values[valIndex++], getX(j), getY(j)));
          } else {
            this.tiles.push(new Location(j, locations[j], 0, getX(j), getY(j)));
          }
    		}

        // Setup variables for storing used build sites
        this.usedBuildSites = [];
        this.usedRoadSites = [];
    }
}

function getSecondRing(startIndex){
	switch(startIndex){
		case 0:
		case 1:
			return 4;
		case 2:
		case 6:
			return 5;
		case 11:
		case 15:
			return 10;
		case 18:
		case 17:
			return 14;
		case 16:
		case 12:
			return 13;
		case 7:
		case 3:
			return 8;
	}
}

function getX(location){
  if (location <= 2) {
    return (3.5 + location) * tileWidth;
  } else if (location <= 6) {
    return (3 + location - 3) * tileWidth;
  } else if (location <= 11) {
    return (2.5 + location - 7) * tileWidth;
  } else if (location <= 15) {
    return (3 + location - 12) * tileWidth;
  } else {
    return (3.5 + location - 16) * tileWidth;
  }
}

function getY(location){
	if (location <= 2)
			return tileHeight;
	else if (location <= 6)
			return 2 * tileHeight;
	else if (location <= 11)
			return 3 * tileHeight;
	else if (location <= 15)
			return 4 * tileHeight;
	else
			return 5 * tileHeight;
}

// Function to randomly shuffle an array
function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

module.exports = new Board();
