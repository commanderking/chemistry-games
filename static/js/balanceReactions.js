// TODO

var getReactionsJSON = function() {
	return $.getJSON("./static/json/reactions.json").then(function(data) {
		return data;
	})
}
/*
console.log("start");
$.getJSON("./static/json/reactions.json", function(data) {
	console.log(data);
}).done(function(data) {
	// maybe run function for creating reaction?
	// index of the reaction that we are on in the JSON file
	var indexOfReaction = 0;

	var equation = data.equations[indexOfReaction];
	var products = equation.products;
	var reactants = equation.reactants;

	Reaction(reactants, products, equation);
}).fail(function(d, textStatus,error) {
	console.log(textStatus);
	console.log(error);
}); */

var Reaction = function(equation) {
	var reactants = equation.reactants;
	var products = equation.products;
	// get the elements first
	var elements = [];
	for (var i = 0; i < reactants.length; i++) {
		elements = elements.concat(reactants[i].composition);
	}
	for (var i = 0; i < products.length; i++) {
		elements = elements.concat(products[i].composition);
	}
	// get rid of duplicates
	this.elements = elements.filter(function (item, pos) {
		return elements.indexOf(item) == pos;
	})

	this.reactionBalanced = false;
	this.reactantsArray = [];
	this.productsArray = [];
	for (var i = 0; i < reactants.length; i++) {
		var reactant = {
			"id" : "r"+i,
			"formula" : reactants[i].formula,
			"composition": reactants[i].composition,
			"shape" : reactants[i].shape,
			"startCoordinates" : {
				"x": i*200 + 100,
				"y": 50
			},
			"active": false,
			"currentNumber" : 0,
			"lastNumber" : 0
		}
		this["r"+i] = reactant;
		this.reactantsArray.push(reactant);
	}
	for (var i = 0; i < products.length; i++) {
		var drawIndex = i + reactants.length;
		var product = {
			"id" : "p"+i,
			"formula" : products[i].formula,
			"composition": products[i].composition,
			"shape" : products[i].shape,
			"startCoordinates" : {
				"x": drawIndex*200 + 100,
				"y": 50
			},
			"active": false,
			"currentNumber" : 0,
			"lastNumber" : 0
		}
		this["p"+i] = product;
		this.productsArray.push(product);
	}
	this.correctRatio = equation.correctRatio;
}
/*
var Reaction = function() {
	this.elements = ["Mg", "O"];
	this.reactionBalanced = false;
	this["r1"] = {
		"id" : "r1",
		"formula": "Mg",
		"composition" : ["Mg"],
		"shape" : "single",
		"startCoordinates" : {
			"x": 100,
			"y": 50
		},
		"active": false,
		"currentNumber" : 0,
		"lastNumber" : 0
	};

	this["r2"] = {
		"id": "r2",
		"formula": "O₂",
		"composition" : ["O", "O"],
		"shape" : "linear",
		"startCoordinates" : {
			"x": 300,
			"y": 50
		},
		"active": false,
		"currentNumber" : 0,
		"lastNumber" : 0
	};
	this["p1"] = {
		"id" : "p1",
		"formula" : "MgO",
		"composition" :["Mg", "O"],
		"shape" : "linear",
		"startCoordinates" : {
			"x": 500,
			"y": 50
		},
		"active": false,
		"currentNumber" : 0,
		"lastNumber" : 0
	};
	this["p2"] = null;

	this.reactantsArray = [];
	this.productsArray = [];
	this.reactantsArray.push(this.r1);
	this.reactantsArray.push(this.r2);
	this.productsArray.push(this.p1);

	this.correctRatio = [2,1,2];
};


var Reaction = function() {
	this.elements = ["N", "H"];
	this.reactionBalanced = false;
	this["r1"] = {
		"id" : "r1",
		"formula": "N₂",
		"composition" : ["N", "N"],
		"shape" : "linear",
		"startCoordinates" : {
			"x": 100,
			"y": 50
		},
		"active": false,
		"currentNumber" : 0,
		"lastNumber" : 0
	};

	this["r2"] = {
		"id": "r2",
		"formula": "H₂",
		"composition" : ["H", "H"],
		"shape" : "linear",
		"startCoordinates" : {
			"x": 300,
			"y": 50
		},
		"active": false,
		"currentNumber" : 0,
		"lastNumber" : 0
	};
	this["p1"] = {
		"id" : "p1",
		"formula" : "NH₃",
		"composition" :["N", "H", "H", "H"],
		"shape" : "trigonal-pyrimidal",
		"startCoordinates" : {
			"x": 500,
			"y": 50
		},
		"active": false,
		"currentNumber" : 0,
		"lastNumber" : 0
	};
	this["p2"] = null;

	this.reactantsArray = [];
	this.productsArray = [];
	this.reactantsArray.push(this.r1);
	this.reactantsArray.push(this.r2);
	this.productsArray.push(this.p1);

	this.correctRatio = [1,3,2];
};*/

// For now assign color based on the order the atom appears in reaction
// TODO: In future, might want to change colors based on the exact element
Reaction.prototype.assignAtomColor = function(index) {
	switch(index){
		case 0:
			//orange
			return [255,127,80];
			break;
		case 1:
			//light blue
			return [127, 255, 255];
			break;
		default:
			break;
	}
}

Reaction.prototype.mapColorScheme = function() {
	// Generate color scheme for atoms
	var colorSchemeArray = [];
	this.elements.forEach(function(element, i) {

		var colorScheme = {};
		colorScheme["index"] = i;
		colorScheme["element"] = element;
		colorScheme["color"] = thisReaction.assignAtomColor(i);
		colorSchemeArray.push(colorScheme);
	});
	this.colorScheme = colorSchemeArray;
};

Reaction.prototype.getColorArray = function(elementSymbol) {
	var rgbArray;
	console.log(elementSymbol);

	if (this.colorSchemeArray) {
		colorSchemeArray.forEach(function(colorSchemeObject) {
			if (elementSymbol === colorSchemeObject.element) {
				colorToReturn = colorSchemeObject.color;
			}
		});
	} else {
		rgbArray = [0,0,0];
	}
	return rgbArray;
};

// Draw atom or molecule
Reaction.prototype.drawMolecule = function(molecule) {
	if (molecule.active === true) {
		var x = molecule.startCoordinates.x;
		var y = molecule.startCoordinates.y;
		// xBuffer determines spacing between one atom and next atom in molecule
		// yBuffer determines spacing between one molecule and next molecule below it
		var xBuffer = 45;
		var yBuffer = 60;
		var atomWidth = 50;
		var atomHeight = 50;

		if (molecule.shape === "linear") {
			// Erase previous molecules by drawing white circles over
			for (i=0; i <= molecule.lastNumber; i++) {
				molecule.composition.forEach(function(element,j) {
					stroke(200);
					fill(200);
					ellipseTemp = ellipse(x + j * xBuffer, y + i * yBuffer, atomWidth, atomHeight);
				});
			}
			for (i=0; i < molecule.currentNumber; i++) {
				// draw one of the molecule
				molecule.composition.forEach(function(element, j){
					console.log(element);
					var rgbArray = thisReaction.getColorArray(element);
					console.log(rgbArray);
					noStroke();
					fill(255,127,80);
					ellipse(x + j * xBuffer, y + i * yBuffer, atomWidth, atomHeight);
					stroke(0);
					fill(255);
					textFont("Helvetica", 20, 30);
					textAlign(CENTER, CENTER);
					textSize(16);
					text(element, x + (j * xBuffer) - atomWidth/2, y - atomHeight/2 + i* yBuffer, atomWidth, atomHeight);
					molecule.lastNumber = i;
				});
			}
			// Changes actual value in Reaction function
		} else if (molecule.shape === "trigonal-pyrimidal") {
			fill(200);
			stroke(200);
			rect(x,y - 22, 100, windowHeight);
			// First element in array is central atom
			for (i=0; i<molecule.currentNumber; i++) {
				// Defines how much each molecule should be separated from one below it
				var verticalShift = i * yBuffer * 2;
				noStroke();
				textFont("Helvetica", 20, 30);
				textAlign(CENTER, CENTER);

				// Define colors
				console.log(this.colorScheme);

				// Assume surrounding atoms are smaller
				// Top left atom
				fill(127, 255, 255);
				ellipse(x + 25, y + verticalShift, atomWidth/1.3 ,atomHeight/1.3);
				fill(0);
				text(molecule.composition[1], x + 5, y - 22 + verticalShift, atomWidth/1.3, atomHeight/1.3);

				// Top right atom
				fill(127, 255, 255);
				ellipse(x + 75, y + verticalShift, atomWidth/1.3 ,atomHeight/1.3);
				fill(0);
				text(molecule.composition[2], x + 60, y - 22 + verticalShift, atomWidth/1.3, atomHeight/1.3);

				// Bottom atom
				fill(127, 255, 255);
				ellipse(x + 50, y + 50 + verticalShift, atomWidth/1.3, atomHeight/1.3);
				fill(0);
				text(molecule.composition[3], x + 35, y + 40 + verticalShift, atomWidth/1.3, atomHeight/1.3);

				// Central atom
				fill(255,127,80);
				ellipse(x + 50, y + 20 + verticalShift, atomWidth, atomHeight);
				fill(255);
				text(molecule.composition[0], x + 28, y - 4 + verticalShift, atomWidth, atomHeight);
			}
		}

		molecule.active = false;

	}
};

// Displays reactant on user input in form
Reaction.prototype.displayReactant = function(input, moleculeID) {
	var that = this;
	// p5 input executes the function when the input changes
	input.input(function() {
		that[moleculeID].active = true;
		that[moleculeID].currentNumber = this.value();
	});
};

// Reactant takes a moleculeObject, such as this.r1
Reaction.prototype.renderMolecularFormula = function(moleculeObject, i, moleculeArray) {
	var reactantDOM = {};
	createDiv('').parent('reaction').addClass('formulaWidth').id(moleculeObject.id);
	reactantDOM[moleculeObject.id] = createInput('').addClass(moleculeObject.id + "input").parent(moleculeObject.id);
	createSpan(moleculeObject.formula).addClass(moleculeObject.id + "formula").parent(moleculeObject.id);
	if (i < moleculeArray.length - 1) {
		createSpan(' +').addClass('plusSign').parent('reaction');
	}
	thisReaction.displayReactant(reactantDOM[moleculeObject.id], moleculeObject.id);
};

Reaction.prototype.submitAnswer = function() {
	console.log("answer submitted");

	var userAnswer = [];
	thisReaction.reactantsArray.forEach(function(moleculeObject){
		userAnswer.push(parseInt(moleculeObject.currentNumber));
	});
	thisReaction.productsArray.forEach(function(moleculeObject){
		userAnswer.push(parseInt(moleculeObject.currentNumber));
	});

	// Find lowest number to calculate the lowest ratio
	var min = Math.min.apply(Math, userAnswer);
	var lowestRatioArray = userAnswer.map(function(numberOfElement){
		return numberOfElement/min;
	});

	if(_.isEqual(lowestRatioArray, thisReaction.correctRatio)) {
		console.log("You're correct");
		thisReaction.reactionBalanced = true;
		// move on to the next reaction
		moveForwardOneEquation();
	}
};

var thisReaction;
var allEquations = null;
var indexOfReaction;
var numberOfEquations;
var canvas;

var drawThisReaction = function() {
	thisReaction.mapColorScheme();
	thisReaction.getColorArray();

	// Render equation (reactants, then products);
	thisReaction.reactantsArray.forEach(thisReaction.renderMolecularFormula);
	createSpan('->').addClass('equals').parent('reaction');
	thisReaction.productsArray.forEach(thisReaction.renderMolecularFormula);
	createButton('Submit').mousePressed(thisReaction.submitAnswer).parent('reaction')
		.addClass('btn btn-sm btn-info');
	createSpan('<br>').parent('reaction');
	createButton('<').mousePressed(moveBackOneEquation).parent('reaction').addClass('btn btn-sm');
	createButton('>').mousePressed(moveForwardOneEquation).parent('reaction').addClass('btn btn-sm');
}

var moveForwardOneEquation = function() {
	if (indexOfReaction < numberOfEquations - 1) {
		clearCanvas();
		removeElements();
		indexOfReaction++;
		thisReaction = new Reaction(allEquations.equations[indexOfReaction]);
		drawThisReaction();
	}
}
var moveBackOneEquation = function() {
	if (indexOfReaction > 0) {
		clearCanvas();
		removeElements();
		indexOfReaction--;
		thisReaction = new Reaction(allEquations.equations[indexOfReaction]);
		drawThisReaction();
	}
}

var clearCanvas = function() {
	canvas.background(200);
}

function setup() {
	canvas = createCanvas(windowWidth, windowHeight);
	canvas.background(200);
	getReactionsJSON().then(function(returnData){
		allEquations = returnData;
		indexOfReaction = 0;
		numberOfEquations = allEquations.equations.length;
		var equation = allEquations.equations[indexOfReaction];
		thisReaction = new Reaction(equation);
		drawThisReaction();
	})
}

function draw() {
	if (allEquations != null) {
		// Draw reactants
		thisReaction.reactantsArray.forEach(function(molecule) {
			thisReaction.drawMolecule(molecule);
		});

		// Draw products
		thisReaction.productsArray.forEach(function(molecule){
			thisReaction.drawMolecule(molecule);
		});

		if (thisReaction.reactionBalanced === true) {

		}
	}
}
