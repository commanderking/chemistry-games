
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
				"x": i*170 + 50,
				"y": 75
			},
			"drawNow": true,
			"currentNumber" : 1,
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
				"x": drawIndex*180 + 30,
				"y": 75
			},
			"drawNow": true,
			"currentNumber" : 1,
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
		that[moleculeID].drawNow = true;
		that[moleculeID].currentNumber = this.value();
	});
};

elementColors.init();

var sketchReaction = function(p) {
	var that = this;
	this.indexOfReaction = 0;
	this.allEquations = null;
	this.currentReaction = null;
	this.numberOfEquations = 0;
	// molecule spacing refers to pixels one molecule should take up along x;
	this.moleculeSpacing = 162.5;
	this.canvas = null;
	this.canvasHeight = p.windowHeight < 500 ? 500 : p.windowHeight;

	var equationDiv = $('.equationDiv');

	var clearCanvas = function() {
		that.canvas.background(backgroundCanvasDefault);
	}

	var renderMolecularFormula = function(moleculeObject, i, moleculeArray) {
		var reactantDOM = {};

		// If reaction previously balanced, populate correct coefficients
		var coefficient = equationIsBalanced() ? that.currentReaction.correctRatio[i] : '';
		console.log(coefficient);
		p.createDiv('').parent('reaction').addClass('formulaWidth').id(moleculeObject.id);
		reactantDOM[moleculeObject.id] = p.createInput(coefficient.toString())
			.addClass(moleculeObject.id + "input coefficientInput")
			.parent(moleculeObject.id)
			.attribute('type', 'number')
			.attribute('min', '0')
			.attribute('max', '10')
			.attribute('onkeypress', 'return event.charCode >= 48 && event.charCode <= 57');
		p.createSpan(moleculeObject.formula).addClass(moleculeObject.id + "formula").parent(moleculeObject.id);
		if (i < moleculeArray.length - 1) {
			p.createSpan(' +').addClass('plusSign').parent('reaction');
		}
		that.currentReaction.displayReactant(reactantDOM[moleculeObject.id], moleculeObject.id);
	}
	var renderChemicalEquation = function() {
		// Render equation (reactants, then products);
		that.currentReaction.reactantsArray.forEach(renderMolecularFormula);
		p.createSpan('->').addClass('equals').parent('reaction');
		that.currentReaction.productsArray.forEach(renderMolecularFormula);
	}

	var renderButtons = function() {
		if (!equationIsBalanced()) {
			$('#buttonsNext').hide();
			$('#buttons').show();
			p.createButton('<').mousePressed(previousEquation).parent('buttons').addClass('btn');
			p.createButton('Submit').mousePressed(submitAnswer).parent('buttons')
				.addClass('btn btn-info');
			p.createSpan('<br>').parent('reaction');
			p.createButton('>').mousePressed(nextEquation).parent('buttons').addClass('btn');
		} else {
			$('#buttons').hide();
			$('#buttonsNext').show();
			p.createDiv('Well done! <br>').addClass("successText").parent('buttonsNext');
			p.createButton('Next').mousePressed(nextEquation).parent('buttonsNext')
				.addClass('btn btn-lg btn-info');
		}
	}

	var drawReactantProductBorder = function() {
		if (equationIsBalanced()){

		} else {
			p.stroke(50);
			p.strokeWeight(4);
			p.fill(255);
			p.rect(0,
						0,
						that.currentReaction.reactantsArray.length * this.moleculeSpacing + 10,
						that.canvasHeight);
			p.textSize(16);
			p.strokeWeight(1);
			p.fill(5);
			p.text("Reactants", 10, 10, 100, 50)

			p.strokeWeight(4);
			p.fill(255);
			p.rect(that.currentReaction.reactantsArray.length * this.moleculeSpacing + 10,
						0,
						that.currentReaction.productsArray.length * 170.5 + 20,
						that.canvasHeight);
			p.strokeWeight(1);
			p.fill(50);
			p.text("Products", that.currentReaction.reactantsArray.length * this.moleculeSpacing + 20,
						10, 100, 50)
		}
	}

	var renderNewEquation = function() {
		clearCanvas();
		p.removeElements();
		equationDiv.removeClass('correctGreen').removeClass('wrongRed');
		renderChemicalEquation();
		renderButtons();
		drawReactantProductBorder();
	}

	var equationIsBalanced = function() {
		return that.allEquations.equations[that.indexOfReaction].balanced;
	}

	var renderCorrectAnswer = function() {
		clearCanvas();
		renderButtons();
		equationDiv.removeClass('wrongRed');
		equationDiv.addClass('correctGreen');
	}

	var renderWrongAnswer = function() {
		equationDiv.removeClass('correctGreen');
		equationDiv.addClass('wrongRed');
	}

	// Draw atom or molecule
	this.drawMolecule = function(molecule) {
		if (molecule.drawNow === true) {
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
			// Stop drawing
			molecule.drawNow = false;
		}
	};

	var nextEquation = function() {
		if (that.indexOfReaction < that.numberOfEquations - 1) {
			that.indexOfReaction++;
			that.currentReaction = new Reaction(that.allEquations.equations[that.indexOfReaction]);
			renderNewEquation();
		}
	};
	var previousEquation = function() {
		if (that.indexOfReaction > 0) {
			that.indexOfReaction--;
			that.currentReaction = new Reaction(that.allEquations.equations[that.indexOfReaction]);
			renderNewEquation();
		}
	}

	var parseCoefficient = function(userCoefficient) {
		var parsedCoefficient = userCoefficient === "" ? 1 : parseInt(userCoefficient);
		return parsedCoefficient;
	}

	var submitAnswer = function() {
		var userAnswer = [];

		that.currentReaction.reactantsArray.forEach(function(moleculeObject){
			console.log(moleculeObject.currentNumber);
			// if user submits nothing as coefficient, submit 1
			userAnswer.push(parseCoefficient(moleculeObject.currentNumber));
			/*
			if (moleculeObject.currentNumber === "") {
				console.log("blank string");
				userAnswer.push(1);
			} else {
				userAnswer.push(parseInt(moleculeObject.currentNumber));
			}*/
		});
		that.currentReaction.productsArray.forEach(function(moleculeObject){
			userAnswer.push(parseCoefficient(moleculeObject.currentNumber));
		});

		// Find lowest number to calculate the lowest ratio
		var min = Math.min.apply(Math, userAnswer);
		var lowestRatioArray = userAnswer.map(function(numberOfElement){
			return numberOfElement/min;
		});

		if(_.isEqual(lowestRatioArray, that.currentReaction.correctRatio)) {
			that.allEquations.equations[that.indexOfReaction].balanced = true;
			renderCorrectAnswer();
		} else {
			renderWrongAnswer();
		}
	};

	p.setup = function() {
		that.canvas = p.createCanvas(p.windowWidth, that.canvasHeight);
		that.canvas.background(backgroundCanvasDefault);
		getReactionsJSON().then(function(returnData){
			that.allEquations = returnData;
			that.numberOfEquations = that.allEquations.equations.length;
			var equation = that.allEquations.equations[that.indexOfReaction];
			that.currentReaction = new Reaction(equation);
			renderNewEquation();
		})
	}

	p.draw = function() {
		if (that.allEquations != null) {
			// Draw reactants
			that.currentReaction.reactantsArray.forEach(function(molecule) {
				this.drawMolecule(molecule);
			});
			// Draw products
			that.currentReaction.productsArray.forEach(function(molecule){
				this.drawMolecule(molecule);
			});
		}
	}
}

var newSketch = new p5(sketchReaction);
