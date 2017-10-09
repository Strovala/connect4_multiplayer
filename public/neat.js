var Neat = (function (Neat) {

  function random(min, max) {
    return Math.random() * (max - min) - min;
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

  var Neuron = function (type, inputGenes, outputGenes) {
    this.id = ID.getNeuron();
    this.value = 0;
    // Receved input values
    this.inputs = [];
    this.type = type || Types.INPUT;
    // Type of Gene
    this.inputGenes = inputGenes || {};
    // Type of Gene
    this.outputGenes = outputGenes || {};
  }

  Neuron.prototype.receive = function Neuron_receive(value) {
    this.inputs.push(value);
  };

  Neuron.prototype.ready = function Neuron_ready() {
    return this.inputs.length == Object.keys(this.inputGenes).length;
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
    var that = this;
    Object.keys(this.outputGenes).forEach(function (key) {
      var gene = that.outputGenes[key];
      gene.out.receive(that.value);
    });
  };

  Neuron.prototype.isInput = function () {
    return this.type == Types.INPUT;
  };

  Neuron.prototype.addOutputGene = function Neuron_addOutputGene(gene) {
    var hashKey = gene.innovation.toString();
    this.outputGenes[hashKey] = gene;
  };

  Neuron.prototype.addInputGene = function Neuron_addInputGene(gene) {
    var hashKey = gene.innovation.toString();
    this.inputGenes[hashKey] = gene;
  };

  var Gene = function (in, out, weight) {
    this.in = in;
    this.out = out;
    this.weight = weight || random(Config.weightScope.min, Config.weightScope.max);
    this.enable = true;
    this.innovation = ID.getInnovation();
  };

  // TODO:
  var Network = function () {

  };

})(Neat || {});
