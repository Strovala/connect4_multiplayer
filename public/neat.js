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
    }
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
    debugger;
    var hashKey = gene.innovation != undefined ? gene.innovation.toString() : gene.id.toString();
    this[hashKey] = gene;
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
  Neuron.prototype.send = function Neuron_send() {
    this.outputGenes.forEach(function (gene) {
      gene.out.receive(that.value);
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
    this.in = input;
    this.out = out;
    debugger
    this.weight = weight || random(Config.weightScope.min, Config.weightScope.max);
    this.enable = true;
  };

  var Network = function (inputNeuronsNum, outputNeuronsNum, neurons, genes) {
    // Default value for connect 4
    this.inputsNum = inputNeuronsNum || 126;
    this.outputsNum = outputNeuronsNum || 7;
    this.neurons = neurons || new Genes();
    this.genes = genes || new Genes();
    var fitness = 0;

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
        var gene = new Gene(input, output);
        that.genes.push(gene);
        input.addOutputGene(gene);
        output.addInputGene(gene);
      });
    });
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

      this.neurons.forEach(function (neuron) {
        if (!neuron.sent) {
          var ready = neuron.process(function sigmoid(t) {
            return 1/(1+Math.pow(Math.E, -t));
          });
          if (!ready)
            allDone = false;
          neuron.send();
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

  var Species = function () {

  }

  Neat.Network = Network;

  return Neat;

})(Neat || {});
