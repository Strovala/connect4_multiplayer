var Genetic = (function(Genetic) {

  function Individual(sizes) {
    this.sizesOfNeural = sizes != undefined ? sizes : [126, 126, 126, 7];

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
  }

  Individual.prototype.evaluate = function Individual_evaluate() {
    this.value = this.wins * this.winsReward + this.turns * + this.turnsReward;
  }

  function Population(individualsNumber, sizes) {
    this.size = individualsNumber;
    this.sizesOfNeural = sizes;
    this.individuals = [];

    this.surviveRate = 0.4;

    this.init();
  }

  Population.prototype.init = function Population_init() {
    for (var i = 0; i < this.size; i++) {
      var individual = new Individual(this.sizesOfNeural);
      this.individuals.push(individual);
    }
  }

  Population.prototype.sort = function Population_sort() {
    this.individuals.sort(function(individual_1, individual_2) {
      return individual_2.value - individual_1.value;
    });
  }

  // Calculates fitness for all individuals
  // and sorts them according to fitness
  Population.prototype.evaluate = function Population_evaluate() {
    this.individuals.forEach(function (individual) {
      individual.evaluate();
    });
    this.sort();
  }

  // Keep n individuals given by survive rate
  // Individuals must be sorted by fitness
  Population.prototype.murder = function Population_murder() {
    var surviveIndex = Math.floor(this.individuals.length * this.surviveRate);
    this.individuals = this.individuals.slice(0, surviveIndex);
  }

  // Calculates sum of all individual fitness
  Population.prototype.calculateTotalValue = function Population_calculateTotalValue() {
    var that = this;
    this.totalValue = 0;
    this.individuals.forEach(function (individual) {
      that.totalValue += individual.value;
    });
  }

  // Calculate percentage of individuals fitness according to total fitness
  Population.prototype.calculateAvgValue = function Population_calculateAvgValue() {
    var that = this;
    this.individuals.forEach(function (individual) {
      individual.avgValue = individual.value / that.totalValue;
    });
  }

  // Calculates average fitness of all individuals
  Population.prototype.calculateValues = function Population_calculateValues() {
    this.calculateTotalValue();
    this.calculateAvgValue();
  }

  // Spins roulete wheel and pick parent
  Population.prototype.getParent = function Population_getParent() {
    this.calculateValues();

    var total = 0;
    var wheel = Math.random();
    for (var i = 0; i < this.individuals.length; i++) {
      var individual = this.individuals[i];
      total += individual.avgValue;
      if (wheel < total) {
        return individual;
      }
    }
  }

  // Sets up a new generation
  Population.prototype.nextGeneration = function Population_nextGeneration() {
    this.evaluate();
    debugger;
    this.murder(this.surviveRate);
    var children = [];
    var childrenSize = this.size - this.individuals.length;

    for (var i = 0; i < childrenSize; i++) {
      var mum = this.getParent();
      var dad = this.getParent();
      var dadWeights = dad.network.getWeights();
      var mumWeights = mum.network.getWeights();

      var childerWeights = this.crossover(mumWeights, dadWeights);

      var son = new Individual(this.sizesOfNeural);
      son.network.setWeights(childerWeights.son);
      children.push(son);

      if (children.length >= childrenSize)
        break;

      var doughter = new Individual(this.sizesOfNeural);
      doughter.network.setWeights(childerWeights.doughter);
      children.push(doughter);
    }

    // Add children into individuals
    var that = this;
    children.forEach(function (child) {
      that.individuals.push(child);
    });
  }

  // Mixes chromosomes of two parents
  Population.prototype.crossover = function Population_crossover(dad, mum) {
    var randomIndex = Math.floor(Math.random() * dad.length - 1);
    var leftDad = dad.slice(0, randomIndex+1);
    var rightDad = dad.slice(randomIndex, dad.length);
    var leftMum = mum.slice(0, randomIndex+1);
    var rightMum = mum.slice(randomIndex, dad.length);

    var son = leftDad.concat(rightMum);
    var doughter = leftMum.concat(rightDad);

    return {
      son: son,
      doughter: doughter
    }
  }

  Genetic.Population = Population;

  return Genetic;

}(Genetic || {}));
