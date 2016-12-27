
var $ = require("jquery");
var _ = require("lodash");
var p5 = require("p5");
var p5dom = require("../js/p5.dom.js");

let backgroundCanvasDefault = 200;

var getReactionsJSON = function() {
	return $.getJSON("./static/json/reactions.json").then(function(data) {
		return data;
	})
}

var elementColors = {
	colorData: {},
	getColorData: function() {
		$.getJSON("./static/json/elementColors.json").done((data) => {
			console.log(data);
			this.colorData = data;
			return data;
		});
	},
	getElementColor: function(elementSymbol) {
		var color = this.colorData.defaultColor;
		this.colorData.typeToColor.forEach(function(group) {
			for (i=0; i<group.symbol.length; i++) {
				if (elementSymbol === group.symbol[i]) {
					color = group.bgColor;
				}
			}
		})
		return color;
	}
}

elementColors.getColorData();

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

// Displays reactant on user input in form
Reaction.prototype.displayReactant = function(input, moleculeID) {
	var that = this;
	// p5 input executes the function when the input changes
	input.input(function() {
		that[moleculeID].active = true;
		that[moleculeID].currentNumber = this.value();
	});
};

var thisReaction;
var allEquations = null;
var indexOfReaction;
var numberOfEquations;
var canvas;

var sketchReaction = function(p) {

	var clearCanvas = function() {
		canvas.background(backgroundCanvasDefault);
	}

	// Reactant takes a moleculeObject, such as this.r1
	renderMolecularFormula = function(moleculeObject, i, moleculeArray) {
		var reactantDOM = {};
		p.createDiv('').parent('reaction').addClass('formulaWidth').id(moleculeObject.id);
		reactantDOM[moleculeObject.id] = p.createInput('').addClass(moleculeObject.id + "input").parent(moleculeObject.id);
		p.createSpan(moleculeObject.formula).addClass(moleculeObject.id + "formula").parent(moleculeObject.id);
		if (i < moleculeArray.length - 1) {
			p.createSpan(' +').addClass('plusSign').parent('reaction');
		}
		thisReaction.displayReactant(reactantDOM[moleculeObject.id], moleculeObject.id);
	};

	var renderChemicalEquation = function() {
		// Render equation (reactants, then products);
		thisReaction.reactantsArray.forEach(renderMolecularFormula);
		p.createSpan('->').addClass('equals').parent('reaction');
		thisReaction.productsArray.forEach(renderMolecularFormula);
		p.createButton('Submit').mousePressed(submitAnswer).parent('reaction')
			.addClass('btn btn-sm btn-info');
		p.createSpan('<br>').parent('reaction');
		p.createButton('<').mousePressed(moveBackOneEquation).parent('reaction').addClass('btn btn-sm');
		p.createButton('>').mousePressed(moveForwardOneEquation).parent('reaction').addClass('btn btn-sm');
	}

	// Draw atom or molecule
	drawMolecule = function(molecule) {
		if (molecule.active === true) {

			var x = molecule.startCoordinates.x;
			var y = molecule.startCoordinates.y;
			// xBuffer determines spacing between one atom and next atom in molecule
			// yBuffer determines spacing between one molecule and next molecule below it
			var xBuffer = 45;
			var yBuffer = 60;
			var atomWidth = 50;
			var atomHeight = 50;

			// Store colors that are needed for each element in array
			var elementColorArray = [];
			molecule.composition.forEach(function(element){
				console.log(element);
				elementColorArray.push(elementColors.getElementColor(element))
			})
			//var color = elementColors.getElementColor(molecule.composition[0]);
			console.log(elementColorArray);

			if (molecule.shape === "linear") {
				// Erase previous molecules by drawing circles that share color with background
				for (i=0; i <= molecule.lastNumber; i++) {
					molecule.composition.forEach(function(element,j) {
						p.stroke(backgroundCanvasDefault);
						p.fill(backgroundCanvasDefault);
						ellipseTemp = p.ellipse(x + j * xBuffer, y + i * yBuffer, atomWidth, atomHeight);
					});
				}

				for (i=0; i < molecule.currentNumber; i++) {
					// draw one of the molecule
					molecule.composition.forEach(function(element, j){
						console.log(element);
						p.noStroke();
						p.fill(elementColorArray[j]);
						p.ellipse(x + j * xBuffer, y + i * yBuffer, atomWidth, atomHeight);
						p.stroke(0);
						p.fill(255);
						p.textFont("Helvetica", 20, 30);
						p.textAlign(p.CENTER, p.CENTER);
						p.textSize(16);
						p.text(element, x + (j * xBuffer) - atomWidth/2, y - atomHeight/2 + i* yBuffer, atomWidth, atomHeight);
						molecule.lastNumber = i;
					});
				}
				// Changes actual value in Reaction function
			} else if (molecule.shape === "trigonal-pyrimidal") {
				p.fill(backgroundCanvasDefault);
				p.stroke(backgroundCanvasDefault);
				p.rect(x,y - 22, 100, p.windowHeight);
				// First element in array is central atom
				for (i=0; i<molecule.currentNumber; i++) {
					// Defines how much each molecule should be separated from one below it
					var verticalShift = i * yBuffer * 2;
					p.noStroke();
					p.textFont("Helvetica", 20, 30);
					p.textAlign(p.CENTER, p.CENTER);

					// Assume surrounding atoms are smaller
					// Top left atom
					p.fill(elementColorArray[1]);
					p.ellipse(x + 25, y + verticalShift, atomWidth/1.3 ,atomHeight/1.3);
					p.fill(0);
					p.text(molecule.composition[1], x + 5, y - 22 + verticalShift, atomWidth/1.3, atomHeight/1.3);

					// Top right atom
					p.fill(elementColorArray[2]);
					p.ellipse(x + 75, y + verticalShift, atomWidth/1.3 ,atomHeight/1.3);
					p.fill(0);
					p.text(molecule.composition[2], x + 60, y - 22 + verticalShift, atomWidth/1.3, atomHeight/1.3);

					// Bottom atom
					p.fill(elementColorArray[3]);
					p.ellipse(x + 50, y + 50 + verticalShift, atomWidth/1.3, atomHeight/1.3);
					p.fill(0);
					p.text(molecule.composition[3], x + 35, y + 40 + verticalShift, atomWidth/1.3, atomHeight/1.3);

					// Central atom
					p.fill(elmentColorArray[0]);
					p.ellipse(x + 50, y + 20 + verticalShift, atomWidth, atomHeight);
					p.fill(255);
					p.text(molecule.composition[0], x + 28, y - 4 + verticalShift, atomWidth, atomHeight);
				}
			}
			molecule.active = false;
		}
	};

	var moveForwardOneEquation = function() {
		if (indexOfReaction < numberOfEquations - 1) {
			clearCanvas();
			p.removeElements();
			indexOfReaction++;
			thisReaction = new Reaction(allEquations.equations[indexOfReaction]);
			renderChemicalEquation();
		}
	};
	var moveBackOneEquation = function() {
		if (indexOfReaction > 0) {
			clearCanvas();
			p.removeElements();
			indexOfReaction--;
			thisReaction = new Reaction(allEquations.equations[indexOfReaction]);
			renderChemicalEquation();
		}
	}

	var submitAnswer = function() {
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

	p.setup = function() {
		canvas = p.createCanvas(p.windowWidth, p.windowHeight);
		canvas.background(backgroundCanvasDefault);
		getReactionsJSON().then(function(returnData){
			allEquations = returnData;
			indexOfReaction = 0;
			numberOfEquations = allEquations.equations.length;
			var equation = allEquations.equations[indexOfReaction];
			thisReaction = new Reaction(equation);
			renderChemicalEquation();
		})
	}

	p.draw = function() {
		if (allEquations != null) {
			// Draw reactants
			thisReaction.reactantsArray.forEach(function(molecule) {
				drawMolecule(molecule);
			});

			// Draw products
			thisReaction.productsArray.forEach(function(molecule){
				drawMolecule(molecule);
			});
		}
	}
}

var newSketch = new p5(sketchReaction);
console.log(newSketch);
