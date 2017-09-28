var Genetic = (function(Genetic) {

  function Individual() {
    this.sizesOfNeural = [126, 126, 126, 7];

    this.wins = 0;
    this.turns = 0;

    this.winsReward = 10000;
    this.turnsReward = 100;

    this.value = 0;

    this.network = new Neural.Network(this.sizesOfNeural);
    this.network.setRandomWeights();

    this.layerMutationRate = 0.01;
    this.neuronMutationRate = 0.01;
    this.weightMutationRate = 0.01;

    this.surviveRate = 0.4;
  }

  Individual.prototype.evaluate = function Individual_evaluate() {
    this.value = this.wins * this.winsReward + this.turns * + this.turnsReward;
  }

  function Population(individualsNumber) {
    this.size = individualsNumber;
    this.individuals = [];
    this.init();
  }

  Population.prototype.init = function Population_init() {
    for (var i = 0; i < this.size; i++) {
      var individual = new Individual();
      this.individuals.push(individual);
    }
  }

  Population.prototype.sort = function Population_sort() {
    this.individuals.sort(function(individual_1, individual_2) {
      return individual_2.value - individual_1.value;
    });
  }

  Population.prototype.evaluate = function Population_evaluate() {
    this.individuals.forEach(function (individual) {
      individual.evaluate();
    });
    this.sort();
  }

  Population.prototype.murder = function Population_murder(murderRate) {
    var surviveIndex = Math.floor(this.individuals.length * this.surviveRate);
    this.individuals = this.individuals.map(function (individual, ind) {
      if (ind < surviveIndex) {
        return individual;
      }
    });
  }

  Population.prototype.calculateTotalValue = function Population_calculateTotalValue() {
    var that = this;
    this.totalValue = 0;
    this.individuals.forEach(function (individual) {
      that.totalValue += individual.value;
    });
  }

  Population.prototype.calculateAvgValue = function Population_calculateAvgValue() {
    var that = this;
    this.individuals.forEach(function (individual) {
      individual.avgValue = individual.value / that.totalValue;
    });
  }

  Population.prototype.calculateValues = function Population_calculateValues() {
    this.calculateTotalValue();
    this.calculateAvgValue();
  }

  Population.prototype.getParent = function Population_getParent() {
    this.calculateValues();
  }

  Population.prototype.nextGeneration = function Population_nextGeneration() {
    this.evaluate();
    this.murder(this.surviveRate);

    for (var i = 0; i < this.size; i++) {
      var mum = this.getParent();
      var dad = this.getParent();

      var son = this.crossover(mum, dad);
      this.individuals.push(son);

      if (this.individuals.length >= this.size)
        break;

      var doughter = this.crossover(dad, mum);
      this.individuals.push(doughter);
    }
  }

  Population.prototype.crossover = function Population_crossover() {
    var mum = this.individuals[0];
    var dad = this.individuals[1];
    this.individuals = [];
    this.individuals.push(mum);
    this.individuals.push(dad);
    for (var i = 0; i < this.size - 2; i++)
      this.individuals.push(this.breed(mum, dad));
  }

  Population.prototype.breed = function Population_breed(mum, dad) {
    var mum = mum.network.getWeights();
    var dad = dad.network.getWeights();
    var son = [];
    var doughter = [];

    this.mum.forEach(function (layer) {

    });
    // map indteas
    for (var i = 0; i < mum.length; i++) {
      var sonLayer = [];
      for (var j = 0; j < mum[0].length; j++) {
        var sonNeuron = [];
        for (var k = 0; k < mum[0][0].length; k++) {
          var randomIndex = Math.floor(Math.random()*mum[0][0].length);
          // for(var p = 0; i<)
        }
      }
    }

  }

  Genetic.Population = Population;

  return Genetic;

}(Genetic || {}));
