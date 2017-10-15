var Neat = (function (Neat) {

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function randomInt(min, max) {
    return Math.floor(random(min, max));
  }

  var Config = {
    weightScope: {
      min: -2,
      max: 2
    },
    adjustWeightScope: {
      min: -0.5,
      max: 0.5
    },
    excessConstant: 1,
    disjointConstant: 1,
    weightConstant: 0.4,
    compatibleThreshold: 0.5,
    mutationWeightRate: 0.8,
    mutationEnableRate: 0.05,
    mutationAddNeuronRate: 0.03,
    mutationAddGeneRate: 0.05,
    adjustWeightRate: 0.9,
    speciesNumber: 4,
    inputNeuronsNum: 2,
    outputNeuronsNum: 1,
    surviveRate: 0.4
  };

  var Types = {
    INPUT: 1,
    HIDDEN: 2,
    OUTPUT: 3
  };

  var ID = {
    innovation: 0,
    neuron: 0,
    species: 0
  };

  ID.getNeuron = function ID_getNeuron() {
    var ret = this.neuron;
    this.neuron++;
    return ret;
  };

  ID.getInnovation = function ID_getInnovation() {
    var ret = this.innovation;
    this.innovation++;
    return ret;
  };

  ID.getSpecies = function ID_getSpecies() {
    var ret = this.species;
    this.species++;
    return ret;
  };

  var Genes = function () {};

  Genes.prototype.clone = function Genes_clone() {
    var clonedObject = new Genes();
    this.forEach(function (gene) {
      clonedObject.push(gene.clone());
    });
    return clonedObject;
  };

  Genes.prototype.forEach = function Genes_forEach(callback) {
    var that = this;
    Object.keys(this).forEach(function (key) {
      var obj = that[key];
      callback(obj);
    });
  };

  Genes.prototype.size = function Genes_size(callback) {
    return Object.keys(this).length;
  };

  Genes.prototype.push = function Genes_size(gene) {
    var hashKey = gene.innovation != undefined ? gene.innovation.toString() : gene.id.toString();
    this[hashKey] = gene;
  };

  Genes.prototype.toList = function Genes_toList() {
    var list = [];
    this.forEach(function (gene) {
      list.push(gene);
    });
    return list;
  };

  Genes.prototype.get = function (id) {
    return this[id.toString()];
  };

  var Neuron = function (type, inputGenes, outputGenes) {
    this.id = ID.getNeuron();
    this.value = 0;
    this.sent = false;
    // Receved input values
    this.inputs = [];
    this.type = type || Types.INPUT;
    // Type of Gene
    this.inputGenes = inputGenes || new Genes();
    // Type of Gene
    this.outputGenes = outputGenes || new Genes();
  }

  Neuron.prototype.clone = function Neuron_clone() {
    var clonedObject = new Neuron(this.type);
    clonedObject.id = this.id;
    return clonedObject;
  };

  Neuron.prototype.reset = function Neuron_reset() {
    this.value = 0;
    this.sent = false;
    // Receved input values
    this.inputs = [];
  };

  Neuron.prototype.receive = function Neuron_receive(value) {
    this.inputs.push(value);
  };

  Neuron.prototype.ready = function Neuron_ready() {
    return this.inputs.length == this.inputGenes.size();
  };

  // Activation must be a function
  Neuron.prototype.process = function Neuron_process(activation) {
    // Returns false if neuron is not ready yet to process
    if (!this.ready())
      return false;
    // Returns true if this is input neuron, cuz that type
    // is not processing
    if (this.isInput())
      return true;
    // Sums inputs
    var sum = this.inputs.reduce(function (sum, value) {
      return sum + value;
    }, 0);
    // Apply activation onto sum
    this.value = activation(sum);
    return true;
  };

  // Needs to be called after process
  Neuron.prototype.send = function Neuron_send(network) {
    if (this.enable) {
      var that = this;
      this.outputGenes.forEach(function (gene) {
        var neuron = network.neurons.get(gene.outId);
        neuron.receive(that.value * gene.weight);
      });
    }
    this.sent = true;
  };

  Neuron.prototype.isInput = function () {
    return this.type == Types.INPUT;
  };

  Neuron.prototype.addOutputGene = function Neuron_addOutputGene(gene) {
    this.outputGenes.push(gene);
  };

  Neuron.prototype.addInputGene = function Neuron_addInputGene(gene) {
    this.inputGenes.push(gene);
  };

  var Gene = function (input, out, weight) {
    this.innovation = ID.getInnovation();
    this.inId = input;
    this.outId = out;
    this.weight = weight || random(Config.weightScope.min, Config.weightScope.max);
    this.enable = true;
  };

  Gene.prototype.clone = function Gene_clone() {
    var clonedObject = new Gene(this.inId, this.outId, this.weight);
    clonedObject.innovation = this.innovation;
    return clonedObject;
  };

  Gene.prototype.setRandomWeight = function Gene_setRandomWeight() {
    this.weight = random(Config.weightScope.min, Config.weightScope.max);
  };

  var Network = function (init, inputNeuronsNum, outputNeuronsNum, neurons, genes) {
    init = init == undefined ? true : init;
    this.inputsNum = inputNeuronsNum || Config.inputNeuronsNum;
    this.outputsNum = outputNeuronsNum || Config.outputNeuronsNum;
    this.neurons = neurons || new Genes();
    this.genes = genes || new Genes();
    this.fitness = 0;
    this.speciesId = 0;

    this.wins = [
      { win: 0, turns: 0 },
      { win: 0, turns: 0 }
    ];

    this.winsReward = 10000;
    this.turnsReward = 100;

    if (init)
      this.init();
  };

  Network.prototype.init = function Network_init() {
    for (var i = 0; i < this.inputsNum; i++) {
      this.neurons.push(new Neuron(Types.INPUT));
    }

    for (var i = 0; i < this.outputsNum; i++) {
      this.neurons.push(new Neuron(Types.OUTPUT));
    }

    // All connected at the start
    var inputs = this.getNeurons(Types.INPUT);
    var outputs = this.getNeurons(Types.OUTPUT);
    var that = this;
    inputs.forEach(function (input) {
      outputs.forEach(function (output) {
        var gene = new Gene(input.id, output.id);
        that.genes.push(gene);
        input.addOutputGene(gene);
        output.addInputGene(gene);
      });
    });
  };


  Network.prototype.reconnect = function Network_reconnect2() {
    var that = this;
    // Ensure that there isnt some gene pointers in neurons
    this.neurons.forEach(function (neuron) {
      neuron.outputGenes = new Genes();
      neuron.inputGenes = new Genes();
    });
    this.genes.forEach(function (gene) {
      var inNeuron = that.neurons.get(gene.inId)
      inNeuron.outputGenes.push(gene);

      var outNeuron = that.neurons.get(gene.outId)
      outNeuron.inputGenes.push(gene);
    });
  };

  Network.prototype.clone = function Nework_clone(reinitialize) {
    reinitialize = reinitialize == undefined ? false : reinitialize;
    var clonedObject = new Network(false, this.inputsNum, this.outputsNum, this.neurons.clone(), this.genes.clone());
    clonedObject.speciesId = this.speciesId;
    // We need to reconect neurons and genes cuz its not realy deep clone object, there are neurons and genes connected
    // from parent object
    clonedObject.reconnect();
    if (reinitialize) {
      clonedObject.genes.forEach(function (gene) {
        gene.setRandomWeight();
      });
    }
    return clonedObject;
  };

  Network.prototype.getNeurons = function Network_getNeurons(type) {
    var neurons = [];
    this.neurons.forEach(function (neuron) {
      if (neuron.type == type)
        neurons.push(neuron);
    });
    return neurons;
  };

  Network.prototype.reset = function Network_reset() {
    this.neurons.forEach(function (neuron) {
      neuron.reset();
    });
  };

  Network.prototype.getOutputData = function Network_getOutputData() {
    var outputs = this.getNeurons(Types.OUTPUT);
    return outputs.map(function (output) {
      return output.value;
    });
  };

  Network.prototype.process = function Network_process() {
    var allDone = false;
    while (!allDone) {
      allDone = true;

      var that = this;
      this.neurons.forEach(function (neuron) {
        if (!neuron.sent) {
          var ready = neuron.process(function sigmoid(t) {
            return 1/(1+Math.pow(Math.E, -t));
          });
          if (!ready)
            allDone = false;
          neuron.send(that);
        }
      });
    }
  };

  Network.prototype.run = function (data) {
    var inputs = this.getNeurons(Types.INPUT);
    inputs.forEach(function (input, ind) {
      input.value = data[ind];
    });

    this.process();

    var outData = this.getOutputData();

    this.reset();

    return outData;
  };

  Network.prototype.evaluate = function Network_evaluate() {
    this.fitness = 0;
    for (var i = 0; i < this.wins.length; i++) {
      var winsReward = this.wins[i].win == 1 ? this.winsReward * this.winsReward : this.winsReward;
      this.fitness += this.wins[i].win * winsReward;
      // If won punish for taking so long
      // If lost reward for staying that long
      this.fitness += this.wins[i].turns * this.turnsReward * this.wins[i].win * -1;
    }
  };

  Network.prototype.mutateWeight = function Network_mutateWeight() {
    this.genes.forEach(function (gene) {
      if (random(0, 1) < Config.mutationWeightRate) {
        if (random(0, 1) < Config.adjustWeightRate) {
          gene.weight += random(Config.adjustWeightScope.min, Config.adjustWeightScope.max);
        }
        // Set random weight
        else {
          gene.weight = random(Config.weightScope.min, Config.weightScope.max);
        }
      }
    });
  };

  Network.prototype.mutateEnable = function Network_mutateEnable() {
    this.genes.forEach(function (gene) {
      if (random(0, 1) < Config.mutationEnableRate) {
        // Flip value
        gene.enable = gene.enable ? false : true;
      }
    });
  };

  Network.prototype.mutateAddNeuron = function Network_mutateAddNeuron() {
    if (random(0, 1) < Config.mutationAddNeuronRate) {
      // Get random gene
      var genes = this.genes.toList();
      var index = randomInt(0, genes.length);
      var gene = genes[index];
      // Disable that gene
      gene.enable = false;
      // Create new neuron
      var neuron = new Neuron(Types.HIDDEN);
      // Create two new genes
      var geneFromIn = new Gene(gene.inId, neuron.id, gene.weight);
      var geneToOut = new Gene(neuron.id, gene.outId, 1);
      // Connect genes to new neuron
      neuron.addInputGene(geneFromIn);
      neuron.addOutputGene(geneToOut);
      // Add them to network
      this.neurons.push(neuron);
      this.genes.push(geneFromIn);
      this.genes.push(geneToOut);
    }
  };

  Network.prototype.mutateAddGene = function Network_mutateAddGene() {
    if (random(0, 1) < Config.mutationAddGeneRate) {
      var hiddenNeurons = this.getNeurons(Types.HIDDEN);
      var inputNeurons = this.getNeurons(Types.INPUT);
      var outputNeurons = this.getNeurons(Types.OUTPUT);

      var inNeurons = inputNeurons.concat(hiddenNeurons);
      var outNeurons = hiddenNeurons.concat(outputNeurons);

      var added = false;
      while (!added) {
        var inNeuron = inNeurons[randomInt(0, inNeurons.length)];
        var outNeuron = outNeurons[randomInt(0, outNeurons.length)];

        var validGene = true;
        // Cant connect to itself
        if (inNeuron.id == outNeuron.id) {
          validGene = false;
        }
        // Cant have loops
        // TODO:

        // Check if gene exists
        this.genes.forEach(function (gene) {
          if (
            gene.inId == inNeuron.id && gene.outId == outNeuron.id &&
            gene.inId == outNeuron.id && gene.outId == inNeuron.id
          )
            validGene = false;
        });

        if (validGene) {
          var gene = new Gene(inNeuron.id, outNeuron.id);
          this.genes.push(gene);
          added = true;
        }
      }

    }
  };

  Network.prototype.getExcessGenes = function Network_getExcessGenes(genome) {
    var genes = this.genes.toList();
    var largestInnovation = genes.reduce(function(a, b) {
      return Math.max(a.innovation, b.innovation);
    });

    var excessGenes = [];
    genome.genes.forEach(function (gene) {
      if (gene.innovation > largestInnovation)
        excessGenes.push(gene);
    });
    return excessGenes;
  };

  Network.prototype.getDisjointGenes = function Network_getDisjointGenes(genome) {
    var genes = this.genes.toList();
    var largestInnovation = genes.reduce(function(a, b) {
      return Math.max(a.innovation, b.innovation);
    });

    var disjointGenes = [];
    var that = this;
    genome.genes.forEach(function (gene) {
      if (that.genes.get(gene.innovation) == undefined && gene.innovation < largestInnovation)
        disjointGenes.push(gene);
    });

    this.genes.forEach(function (gene) {
      if (genome.genes.get(gene.innovation) == undefined)
        disjointGenes.push(gene);
    });

    return disjointGenes;
  };

  Network.prototype.getAvgWeight = function Network_getAvgWeight(genome) {
    var mineWeightSum = this.genes.toList().reduce(function (sum, gene) {
      return sum + gene.weight;
    }, 0);
    var comparedWeightSum = genome.genes.toList().reduce(function (sum, gene) {
      return sum + gene.weight;
    }, 0);
    var mineWeight = mineWeightSum / this.genes.size();
    var comparedWeight = comparedWeightSum / genome.genes.size();
    return Math.abs(mineWeight - comparedWeight);
  };

  Network.prototype.compatible = function Network_compatible(genome) {
    // Get maximum number of genes
    var N = Math.max(this.genes.size(), genome.genes.size());
    // Get excess genes number
    var excess = this.getExcessGenes(genome).length;
    // Get disjoint genes number
    var disjoint = this.getDisjointGenes(genome).length;
    // Get avg weight
    var weight = this.getAvgWeight(genome);

    var compatibleScore = excess * Config.excessConstant     / N +
                          disjoint * Config.disjointConstant / N +
                          weight * Config.weightConstant;
    return compatibleScore < Config.compatibleThreshold;
  };

  Network.prototype.mutate = function Network_mutate() {
    this.mutateWeight();
    this.mutateEnable();
    this.mutateAddNeuron();
    this.mutateAddGene();
  };

  var Species = function (representative) {
    this.id = ID.getSpecies();
    this.representative = representative || new Network();
    if (representative != undefined) {
      this.representative.speciesId = this.id;
    }
    this.representative.speciesId = this.id;
    this.genomes = [this.representative];
    for (var i = 1; i < Config.speciesNumber; i++)
      this.genomes.push(this.representative.clone(true));
  }

  Species.prototype.sort = function Species_sort() {
    this.genomes.sort(function(genome_1, genome_2) {
      return genome_1.fitness - genome_2.fitness;
    });
  };

  Species.prototype.evaluate = function Species_evaluate() {
    this.genomes.forEach(function (genome) {
      genome.evaluate();
    });

    this.sort();
  };

  Species.prototype.murder = function Species_murder() {
    var surviveIndex = Math.floor(this.genomes.length * Config.surviveRate);
    this.genomes = this.genomes.slice(0, surviveIndex);
  };

  Species.prototype.getByIndex = function Species_getByIndex(index) {
    return this.genomes[index];
  };

  Species.prototype.rouleteWheel = function Species_rouleteWheel() {
    // TODO:
  };

  Species.prototype.getParent = function Species_getParent(index) {
    if (index != undefined)
      return this.getByIndex(index);
    else
      this.rouleteWheel();
  };

  Species.prototype.crossover = function Species_crossover(dad, mum) {
    function copy(network, parentNetwork, gene) {
      var inNeuron = parentNetwork.neurons.get(gene.inId);
      var outNeuron = parentNetwork.neurons.get(gene.outId);
      network.genes.push(gene.clone());
      network.neurons.push(inNeuron.clone());
      network.neurons.push(outNeuron.clone());
    }

    var child = new Network(false);
    var dadGenes = dad.genes.toList();
    var mumGenes = mum.genes.toList();
    var dadCnt = 0;
    var mumCnt = 0;
    while (dadCnt < dadGenes.length && mumCnt < mumGenes.length) {
      var dadGene = dadGenes[dadCnt];
      var mumGene = mumGenes[mumCnt];
      if (dadGene.innovation == mumGene.innovation) {
        // Get better
        var gene = dad.fitness > mum.fitness ? dadGene : mumGene;
        // Copy
        copy(child, dad, gene);
        // Inc both cnts
        dadCnt++;
        mumCnt++;
      } else if (dadGene.innovation < mumGene.innovation) {
        // Copy
        copy(child, dad, dadGene);
        // Inc dad cnts
        dadCnt++;
      } else if (dadGene.innovation > mumGene.innovation) {
        // Copy
        copy(child, mum, mumGene);
        // Inc mum cnts
        mumCnt++;
      }
    }

    if (dadCnt == dadGenes.length) {
      while (mumCnt < mumGenes.length) {
        copy(child, mum, mumGenes[mumCnt]);
        mumCnt++;
      }
    }

    if (mumCnt == mumGenes.length) {
      while (dadCnt < dadGenes.length) {
        copy(child, dad, dadGenes[dadCnt]);
        dadCnt++;
      }
    }

    child.reconnect();

    return child;
  };

  Species.prototype.nextGeneration = function Species_nextGeneration() {
    this.evaluate();
    this.murder();
    var children = []
    for (var i = this.genomes.length; i < Config.speciesNumber; i++) {
      var dad = this.getParent(0);
      var mum = this.getParent(0);

      var child = this.crossover(dad, mum);
      children.push(child);
    }

    var that = this;
    children.forEach(function (child) {
      child.mutate();
      that.genomes.push(child);
    });
  };

  var Generation = function () {
    this.species = [new Species()];
  }

  Generation.prototype.nextGeneration = function Generation_nextGeneration() {
    this.species.forEach(function (species) {
      species.nextGeneration();
    });
    this.speciation();
    this.cullSpecies();
  };

  Generation.prototype.cullSpecies = function Generation_cullSpecies() {
    for (var i = 0; i < this.species.length; i++) {
      if (this.species[i].genomes.length <= 2) {
        this.species.splice(i, 1);
        i--;
      }
    }
  };

  Generation.prototype.speciation = function Generation_speciation() {
    var that = this;
    // Set new representative for each species
    this.species.forEach(function (species) {
      species.representative = species.genomes[0];
    });
    this.species.forEach(function (species) {
      var genomes = species.genomes;
      var representative = species.representative;
      for (var i = 1; i < genomes.length; i++) {
        if (genomes[i] && !genomes[i].compatible(representative)) {
          that.changeSpecies(genomes[i].clone());
          genomes[i] = undefined;
        }
      }

      // Delete undefined elements
      for (var i = 0; i < species.genomes.length; i++) {
        if (species.genomes[i] == undefined) {
          species.genomes.splice(i, 1);
          i--;
        }
      }

    });
  };

  Generation.prototype.changeSpecies = function Generation_changeSpecies(genome) {
    for (var i = 0; i < this.species.length; i++) {
      var species = this.species[i];
      if (genome.compatible(species.representative)) {
        this.addGenome(genome, i);
        return;
      }
    }
    this.createNewSpecies(genome);
  };

  // Index of species
  Generation.prototype.addGenome = function Generation_addGenome(genome, index) {
    genome.speciesId = this.species[index].id;
    this.species[index].genomes.push(genome);
  };

  Generation.prototype.createNewSpecies = function Generation_createNewSpecies(genome) {
    this.species.push(new Species(genome));
  };

  Neat.Species = Species;
  Neat.Network = Network;
  Neat.Neuron = Neuron;
  Neat.Gene = Gene;
  Neat.Genes = Genes;
  Neat.Generation = Generation;

  return Neat;

})(Neat || {});
