
var $ = require("jquery");
var _ = require("lodash");
var p5 = require("p5");
var p5dom = require("../js/p5.dom.js");
var sketchMoleculeShape = require('./p5SketchMolecules');

let backgroundCanvasDefault = 255;

var getReactionsJSON = function() {
	return $.getJSON("./static/json/reactions.json").then(function(data) {
		return data;
	})
}

var elementColors = {
	colorData: {},
	init: function() {
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

elementColors.init();
var thisReaction;
var canvas;

var sketchReaction = function(p) {
	var that = this;
	this.indexOfReaction = 0;
	this.allEquations = null;
	this.numberOfEquations = 0;

	var clearCanvas = function() {
		canvas.background(backgroundCanvasDefault);
	}

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
	this.drawMolecule = function(molecule) {
		if (molecule.active === true) {
			this.x = molecule.startCoordinates.x;
			this.y = molecule.startCoordinates.y;

			// xBuffer determines spacing between one atom and next atom in molecule
			// yBuffer determines spacing between one molecule and next molecule below it
			this.xBuffer = 45;
			this.yBuffer = 60;
			this.atomWidth = 50;
			this.atomHeight = 50;

			// Store colors that are needed for each element in array
			this.elementColorArray = [];
			molecule.composition.forEach(function(element){
				this.elementColorArray.push(elementColors.getElementColor(element));
			})

			switch(molecule.shape) {
				case "linear":
					sketchMoleculeShape.linear.call(this, p, molecule);
					break;
				case "trigonal-pyrimidal":
					sketchMoleculeShape.trigonalPyrimidal.call(this, p, molecule);
					break;
				case "tetrahedral":
					sketchMoleculeShape.tetrahedral.call(this, p, molecule);
					break;
				case "bent":
					sketchMoleculeShape.bent.call(this, p, molecule);
					break;
			}
			molecule.active = false;
		}
	};

	var moveForwardOneEquation = function() {
		if (that.indexOfReaction < that.numberOfEquations - 1) {
			clearCanvas();
			p.removeElements();
			console.log(that.indexOfReaction);
			that.indexOfReaction++;
			console.log(that.indexOfReaction);

			thisReaction = new Reaction(that.allEquations.equations[that.indexOfReaction]);
			renderChemicalEquation();
		}
	};
	var moveBackOneEquation = function() {
		if (that.indexOfReaction > 0) {
			clearCanvas();
			p.removeElements();
			that.indexOfReaction--;
			thisReaction = new Reaction(that.allEquations.equations[that.indexOfReaction]);
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
			that.allEquations = returnData;
			that.numberOfEquations = that.allEquations.equations.length;
			var equation = that.allEquations.equations[that.indexOfReaction];
			thisReaction = new Reaction(equation);
			renderChemicalEquation();
		})
	}

	p.draw = function() {
		if (allEquations != null) {
			// Draw reactants
			thisReaction.reactantsArray.forEach(function(molecule) {
				this.drawMolecule(molecule);
			});
			// Draw products
			thisReaction.productsArray.forEach(function(molecule){
				this.drawMolecule(molecule);
			});
		}
	}
}

var newSketch = new p5(sketchReaction);
