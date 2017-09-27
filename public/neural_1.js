var Neural = (function (Neural) {

  function Neuron(receivers) {
    // Values sent to this neuron
    this.inputs = [];
    // The value this neuron will be sending out
    this.value = 0;
    // The weights on each neuron on next layer
    this.weights = [];
    // Neurons that this neuron should send data to
    this.receivers = receivers || [];
    // Bias for this neuron
    this.bias = 0.3;
  }

  Neuron.prototype.accept = function Neuron_accept(data) {
    this.inputs.push(data);
  }

  // Activation needs to be a function
  Neuron.prototype.process = function Neuron_process(activation) {
    this.value = 0;
    var that = this;
    this.inputs.forEach(function (input) {
      that.value += input;
    })
    this.value += this.bias;
    this.value = activation(this.value);
  }

  Neuron.prototype.send = function Neuron_send() {
    var that = this;
    this.receivers.forEach(function (receiver, index) {
      var valueToSend = that.value * that.weights[index];
      receiver.accept(valueToSend);
    });
  }

  // Sets wights in [-1, 1)
  Neuron.prototype.setRandomWeights = function Neuron_setRandomWeights() {
      this.weights = new Array(this.receivers.length);
      for (var i = 0; i < this.weights.length; i++) {
        this.weights[i] = Math.random() * 2 - 1;
      }
  }

  Neural.Neuron = Neuron;

  function Layer(neuronsNumber, receivers) {
    this.neurons = new Array(neuronsNumber);
    for (var i = 0; i < neuronsNumber; i++) {
      this.neurons[i] = new Neuron(receivers);
    }
  }

  Layer.prototype.fire = function Layer_fire(doesProcess) {
    // if (doesProcess == undefined)
    //   doesProcess = true;
    doesProcess = doesProcess == undefined || doesProcess;
    this.neurons.forEach(function (neuron) {
      if (doesProcess)
        neuron.process(function sigmoid(value) {
          return 1/(1+Math.pow(Math.E, -value));
        });
      neuron.send();
    });
  }

  Layer.prototype.setRandomWeights = function Layer_setRandomWeights() {
    for (var i = 0; i < this.neurons.length; i++) {
      this.neurons[i].setRandomWeights();
    }
  }

  Neural.Layer = Layer;

  function Network(sizes) {
    this.layers = new Array(sizes.length);
    for (var i = sizes.length-1; i >= 0; i--) {
      if (i < sizes.length - 1) {
        this.layers[i] = new Layer(sizes[i], this.layers[i+1].neurons);
      } else {
        this.layers[i] = new Layer(sizes[i], []);
      }
    }
  }

  Network.prototype.setInput = function Network_setInput(inputData) {
    var input = this.layers[0];
    for (var i = 0; i < input.neurons.length; i++) {
      input.neurons[i].value = inputData[i];
    }
  }

  Network.prototype.setRandomWeights = function Network_setRandomWeights() {
    for (var i = 0; i < this.layers.length; i++) {
      this.layers[i].setRandomWeights();
    }
  }

  Network.prototype.run = function Network_run(inputs) {
    this.setInput(inputs);

    this.layers.forEach(function (layer, ind) {
      if (ind !== 0)
        layer.fire();
      else
        // Dont process neurons from this layer
        layer.fire(false);
    });

    return this.getOutputs();
  }

  Network.prototype.getOutputs = function Network_getOutputs() {
    var output = [];
    var outputLayerNeurons = this.layers[this.layers.length-1].neurons;
    output = outputLayerNeurons.map(function (neuron) {
      return neuron.value;
    })
    return output;
  }

  Neural.Network = Network;

  return Neural;

})(Neural || {});
