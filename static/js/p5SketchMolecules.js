var canvasBGColor = require("./Constants.js").canvasBGColor

// These functions are called in sketchReaction of balanceReaction.js
// the this context refers to the context of sketchReaction

module.exports = {
  linear: function(p, molecule) {
    // Erase previous molecules by drawing circles that share color with background
    for (i=0; i <= molecule.lastNumber; i++) {
      molecule.composition.forEach(function(element,j) {
        p.stroke(canvasBGColor);
        p.fill(canvasBGColor);
        ellipseTemp = p.ellipse(this.x + j * this.xBuffer,
          this.y + i * this.yBuffer,
          this.atomWidth,
          this.atomHeight);
      });
    }

    for (i=0; i < molecule.currentNumber; i++) {
      // draw one of the molecule
      molecule.composition.forEach(function(element, j){
        p.noStroke();
        p.fill(elementColorArray[j]);
        p.ellipse(this.x + j * this.xBuffer, this.y + i * this.yBuffer,
          this.atomWidth,
          this.atomHeight);
        p.stroke(0);
        p.fill(255);
        p.textFont("Helvetica", 20, 30);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(16);
        p.text(element, this.x + (j * this.xBuffer) - this.atomWidth/2,
        this.y - this.atomHeight/2 + i* this.yBuffer, this.atomWidth, this.atomHeight);
        molecule.lastNumber = i;
      });
    }
  },
  bent: function(p, molecule) {
    p.fill(canvasBGColor);
    p.stroke(canvasBGColor);
    p.rect(this.x - 10, this.y - 40, 120, p.windowHeight);

    for (i=0; i < molecule.currentNumber; i++) {
      // Defines how much each molecule should be separated from one below it
      var verticalShift = i * yBuffer * 2.2;
      p.noStroke();
      p.textFont("Helvetica", 20, 30);
      p.textAlign(p.CENTER, p.CENTER);

      molecule.composition.forEach(function(element, j){
        // Left atom
        p.fill(elementColorArray[1]);
        p.ellipse(x + 10, y + 40 + verticalShift, atomWidth, atomHeight);
        p.fill(255);
        p.text(molecule.composition[1],
          x - 12, y + 15 + verticalShift, atomWidth, atomHeight);

        // Right atom
        p.fill(elementColorArray[1]);
        p.ellipse(x + 90, y + 40 + verticalShift, atomWidth, atomHeight);
        p.fill(255);
        p.text(molecule.composition[1], x + 68, y + 15 + verticalShift, atomWidth, atomHeight);

        // Central atom
        p.fill(elementColorArray[0]);
        p.ellipse(x + 50, y + 20 + verticalShift, atomWidth, atomHeight);
        p.fill(255);
        p.text(molecule.composition[0], x + 28, y - 4 + verticalShift, atomWidth, atomHeight);
      });
    }
  },
  trigonalPyrimidal: function(p, molecule) {
    p.fill(canvasBGColor);
    p.stroke(canvasBGColor);
    p.rect(this.x ,this.y - 22, 100, p.windowHeight);
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
      p.ellipse(this.x + 25,
                this.y + verticalShift,
                this.atomWidth/1.3 ,
                this.atomHeight/1.3);
      p.fill(0);
      p.text(molecule.composition[1],
              this.x + 5,
              this.y - 22 + verticalShift,
              this.atomWidth/1.3, this.atomHeight/1.3);
      // Top right atom
      p.fill(elementColorArray[2]);
      p.ellipse(this.x + 75,
                this.y + verticalShift,
                this.atomWidth/1.3 ,
                this.atomHeight/1.3);
      p.fill(0);
      p.text(molecule.composition[2],
              this.x + 60,
              this.y - 22 + verticalShift,
              this.atomWidth/1.3,
              this.atomHeight/1.3);

      // Bottom atom
      p.fill(elementColorArray[3]);
      p.ellipse(this.x + 50,
                this.y + 50 + verticalShift,
                this.atomWidth/1.3,
                this.atomHeight/1.3);
      p.fill(0);
      p.text(molecule.composition[3],
              this.x + 35,
              this.y + 40 + verticalShift,
              this.atomWidth/1.3,
              this.atomHeight/1.3);

      // Central atom
      p.fill(elementColorArray[0]);
      p.ellipse(this.x + 50,
                this.y + 20 + verticalShift,
                this.atomWidth,
                this.atomHeight);
      p.fill(255);
      p.text(molecule.composition[0],
              this.x + 28,
              this.y - 4 + verticalShift,
              this.atomWidth,
              this.atomHeight);
    }
  },
  tetrahedral: function(p, molecule) {
    p.fill(canvasBGColor);
    p.stroke(canvasBGColor);
    p.rect(this.x - 10, this.y - 40, 120, p.windowHeight);

    for (i=0; i<molecule.currentNumber; i++) {
      // Defines how much each molecule should be separated from one below it
      var verticalShift = i * yBuffer * 2.2;
      p.noStroke();
      p.textFont("Helvetica", 20, 30);
      p.textAlign(p.CENTER, p.CENTER);

      // Assume surrounding atoms are smaller
      // Top atom
      p.fill(elementColorArray[1]);
      p.ellipse(this.x + 50,
                this.y - 20 + verticalShift,
                this.atomWidth/1.3,
                this.atomHeight/1.3);
      p.fill(0);
      p.text(molecule.composition[1],
            this.x + 35,
            this.y - 40 + verticalShift,
            this.atomWidth/1.3,
            this.atomHeight/1.3);

      // Bottom atom
      p.fill(elementColorArray[2]);
      p.ellipse(this.x + 50,
                this.y + 55 + verticalShift,
                this.atomWidth/1.3,
                this.atomHeight/1.3);
      p.fill(0);
      p.text(molecule.composition[2],
              this.x + 35,
              this.y + 42 + verticalShift,
              this.atomWidth/1.3,
              this.atomHeight/1.3);

      // Left atom
      p.fill(elementColorArray[3]);
      p.ellipse(this.x + 15,
                this.y + 35 + verticalShift,
                this.atomWidth/1.3,
                this.atomHeight/1.3);
      p.fill(0);
      p.text(molecule.composition[3],
              this.x,
              this.y + 15 + verticalShift,
              this.atomWidth/1.3,
              this.atomHeight/1.3);

      // Right atom
      p.fill(elementColorArray[4]);
      p.ellipse(this.x + 85,
                this.y + 35 + verticalShift,
                this.atomWidth/1.3,
                this.atomHeight/1.3);
      p.fill(0);
      p.text(molecule.composition[3],
            this.x + 70,
            this.y + 15 + verticalShift,
            this.atomWidth/1.3,
            this.atomHeight/1.3);

      // Central atom
      p.fill(elementColorArray[0]);
      p.ellipse(this.x + 50,
                this.y + 20 + verticalShift,
                this.atomWidth,
                this.atomHeight);
      p.fill(255);
      p.text(molecule.composition[0],
            this.x + 28,
            this.y - 4 + verticalShift,
            this.atomWidth,
            this.atomHeight);
    }
  }
}
