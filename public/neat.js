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
    speciesNumber: 10,
    inputNeuronsNum: 3,
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
    neuron: 0
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
    var clonedObject = new Neuron(this.type, this.inputGenes, this.outputGenes);
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
    var that = this;
    this.outputGenes.forEach(function (gene) {
      var neuron = network.neurons.get(gene.outId);
      neuron.receive(that.value * gene.weight);
    });
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
    var fitness = 0;

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

  // Reconnect neurons and genes objects based on id
  Network.prototype.reconnect = function Network_reconnect() {
    var that = this;
    this.neurons.forEach(function (neuron) {
      // Get ids of input genes
      var genesIds = [];
      neuron.inputGenes.forEach(function (gene) {
        genesIds.push(gene.innovation);
      });
      // Reset genes
      neuron.inputGenes = new Genes();
      // Find gene based on ids got above and assign to input genes
      for (var i = 0; i < genesIds.length; i++) {
        var geneId = genesIds[i];
        var gene = that.genes.get(geneId);
        neuron.addInputGene(gene);
      }

      // Get ids of output genes
      var genesIds = [];
      neuron.outputGenes.forEach(function (gene) {
        genesIds.push(gene.innovation);
      });
      // Reset genes
      neuron.outputGenes = new Genes();
      // Find gene based on ids got above and assign to output genes
      for (var i = 0; i < genesIds.length; i++) {
        var geneId = genesIds[i];
        var gene = that.genes.get(geneId);
        neuron.addOutputGene(gene);
      }
    });
  };

  Network.prototype.clone = function Nework_clone(reinitialize) {
    reinitialize = reinitialize == undefined ? false : reinitialize;
    var clonedObject = new Network(false, this.inputsNum, this.outputsNum, this.neurons.clone(), this.genes.clone());
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

  var Species = function (representative) {
    this.representative = representative || new Network();
    this.genomes = [this.representative];
    for (var i = 1; i < Config.speciesNumber; i++)
      this.genomes.push(this.representative.clone(true));
  }

  Species.prototype.sort = function Species_sort() {
    this.genoms.sort(function(genome_1, genome_2) {
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

  Species.prototype.getParent = function Species_getParent(index) {
    if (index)
      return this.getByIndex(index);
    // else
    //   this.rouleteWheel();
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
    var dadGenes = [];
    dad.genes.forEach(function (gene) {
      dadGenes.push(gene);
    });
    var mumGenes = [];
    mum.genes.forEach(function (gene) {
      mumGenes.push(gene);
    });
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
      var mum = this.getParent(1);

      var child = this.crossover(dad, mum);
      children.push(child);
    }

    children.forEach(function (child) {
      child.mutate();
      this.genomes.push(child);
    });
  };

  Neat.Species = Species;
  Neat.Network = Network;
  Neat.Neuron = Neuron;
  Neat.Gene = Gene;
  return Neat;

})(Neat || {});
