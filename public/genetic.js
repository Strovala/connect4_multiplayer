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



  Population.prototype.evaluate = function Population_evaluate() {

  }

  Genetic.Population = Population;

  return Genetic;

}(Genetic || {}));
