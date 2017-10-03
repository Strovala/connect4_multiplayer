var Genetic = (function(Genetic) {

  var posId = 0;

  function Individual(sizes) {
    this.sizesOfNeural = sizes != undefined ? sizes : [126, 126, 126, 7];

    this.wins = [
      {
        win: 0,
        turns: 0
      },
      {
        win: 0,
        turns: 0
      }
    ];

    this.winsReward = 10000;
    this.turnsReward = 100;

    this.value = 0;

    this.network = new Neural.Network(this.sizesOfNeural);
    this.network.setRandomWeights();

    this.mutateRandomRate = 0.6;
    this.mutateAddRandomRate = 0.8;
    this.mutateChangeSingRate = 0.4;
    this.mutateBias = 0.7;
    this.id = posId++;
  }


  Individual.prototype.evaluate = function Individual_evaluate() {
    this.value = 0;
    for (var i = 0; i < this.wins.length; i++) {
      this.value += this.wins[i].win * this.winsReward;
      // If won punish for taking so long
      // If lost reward for staying that long
      this.value += this.wins[i].turns * this.turnsReward * this.wins[i].win * -1;
    }
  }

  Individual.prototype.setWeight = function Individual_setWeight(layer, neuron, weight, value) {
    this.network.layers[layer].neurons[neuron].weights[weight] = value;
  }

  Individual.prototype.setBias = function Individual_setBias(layer, neuron, value) {
    this.network.layers[layer].neurons[neuron].bias = value;
  }

  Individual.prototype.equals = function Individual_equals(individual) {
    var me = this.network.getWeights();
    var other = individual.network.getWeights();

    for (var i = 0; i < me.length; i++)
      for (var j = 0; j < me[i].length; j++)
        for (var k = 0; k < me[i][j].length; k++)
          if (me[i][j][k] != other[i][j][k])
            return false;
    return true;
  }

  Individual.prototype.mutate = function Individual_mutate() {
    var weights = this.network.getWeights();
    var randomLayer = Math.floor(Math.random() * (weights.length - 1));
    var randomNeuron = Math.floor(Math.random() * weights[randomLayer].length);

    var that = this;
    weights[randomLayer][randomNeuron].forEach(function (weight, ind) {
      var random = Math.random();
      if (random < that.mutateRandomRate) {
        var value = Math.random() * 2 - 1;
        that.setWeight(randomLayer, randomNeuron, ind, value);
      }

      random = Math.random();
      if (random < that.mutateAddRandomRate) {
        var value = weight + Math.random() * 2 - 1;
        that.setWeight(randomLayer, randomNeuron, ind, value);
      }

      random = Math.random();
      if (random < this.mutateChangeSingRate) {
        var value = weight * (-1);
        that.setWeight(randomLayer, randomNeuron, ind, value);
      }
    });

    var random = Math.random();
    if (random < that.mutateBias) {
      var value = Math.random();
      this.setBias(randomLayer, randomNeuron, value);
    }
  }

  function Population(individualsNumber, sizes) {
    this.size = individualsNumber;
    this.sizesOfNeural = sizes;
    this.individuals = [];

    this.surviveRate = 0.4;
    this.crossoverLayersRate = 0.3;

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

  // Give a list of individuals
  Population.prototype.equals = function Population_equals(individuals) {
    for (var i = 0; i < this.individuals.length; i++)
      if (!this.individuals[i].equals(individuals[i]))
        return false;
    return true;
  }

  // Return a copy of list of individuals
  Population.prototype.copy = function Population_copy() {
    return this.individuals.map(function (individual) {
      return individual;
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

  Population.prototype.scaleValues = function Population_scaleValues() {
    var minIndividual = this.individuals[this.individuals.length-1];

    this.individuals.forEach(function (individual) {
      individual.value += -minIndividual.value + 1;
    });
  }

  // Calculates average fitness of all individuals
  Population.prototype.calculateValues = function Population_calculateValues() {
    this.scaleValues();
    this.calculateTotalValue();
    this.calculateAvgValue();
  }

  Population.prototype.rouleteWheel = function Population_rouleteWheel() {
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

  Population.prototype.best = function Population_best(rank) {
    return this.individuals[rank-1];
  }

  // Spins roulete wheel and pick parent
  Population.prototype.getParent = function Population_getParent(rank) {
    return this.rouleteWheel();
    // return this.best(rank);
  }


  // Sets up a new generation
  Population.prototype.nextGeneration = function Population_nextGeneration() {
    this.evaluate();
    this.murder(this.surviveRate);
    console.log("==============");
    console.log("Best network wins");
    console.log(this.individuals[0].wins[0]);
    console.log(this.individuals[0].wins[1]);
    console.log("==============");
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
      // mutate only children
      child.mutate();

      that.individuals.push(child);
    });

  }

  Population.prototype.mutate = function Population_mutate() {
    this.individuals.forEach(function (individual) {
      individual.mutate();
    })
  }

  // Mixes chromosomes of two parents by layers
  Population.prototype.crossoverLayers = function Population_crossoverLayers(dad, mum) {
    var randomIndex = Math.floor(Math.random() * (dad.length - 2) + 1);
    var leftDad = dad.slice(0, randomIndex);
    var rightDad = dad.slice(randomIndex, dad.length);
    var leftMum = mum.slice(0, randomIndex);
    var rightMum = mum.slice(randomIndex, dad.length);

    var son = leftDad.concat(rightMum);
    var doughter = leftMum.concat(rightDad);

    return {
      son: son,
      doughter: doughter
    }
  }

  // Mixes chromosomes of two parents by neurons
  Population.prototype.crossoverNeurons = function Population_crossoverNeurons(dad, mum) {
    var randomLayer = Math.floor(Math.random() * (dad.length - 1));
    var randomNeuron = Math.floor(Math.random() * dad[randomLayer].length);
    var son = dad.map(function (layer) {
      return layer.map(function (neuron) {
        return neuron.map(function (weight) {
          return weight;
        })
      })
    });
    var doughter = mum.map(function (layer) {
      return layer.map(function (neuron) {
        return neuron.map(function (weight) {
          return weight;
        })
      })
    });
    son[randomLayer][randomNeuron] = mum[randomLayer][randomNeuron];
    doughter[randomLayer][randomNeuron] = dad[randomLayer][randomNeuron];
    return {
      son: son,
      doughter: doughter
    }
  }


  Population.prototype.crossover = function Population_crossover(dad, mum) {
    if (Math.random() < this.crossoverLayersRate) {
      return this.crossoverLayers(dad, mum);
    } else {
      return this.crossoverNeurons(dad, mum);
    }
  }

  Genetic.Population = Population;

  return Genetic;

}(Genetic || {}));
