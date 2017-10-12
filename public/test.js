var species = new Neat.Species();

var dad = new Neat.Network(false, 2, 1);
var mum = new Neat.Network(false, 2, 1);
var in1 = new Neat.Neuron(1); // 0
var in2 = new Neat.Neuron(1); // 1
var out1 = new Neat.Neuron(3); // 2
var hid1 = new Neat.Neuron(2); // 3
var hid2 = new Neat.Neuron(2); // 4

var gene02 = new Neat.Gene(in1.id, out1.id); // 0
var gene12 = new Neat.Gene(in2.id, out1.id); // 1
var gene04 = new Neat.Gene(in1.id, hid2.id); // 3
var gene03 = new Neat.Gene(in1.id, hid1.id); // 2

var in1Dad = in1.clone();
in1Dad.addOutputGene(gene02.clone());
in1Dad.addOutputGene(gene03.clone());
var in2Dad = in2.clone();
in2Dad.addOutputGene(gene12.clone());
dad.neurons.push(in1Dad); // 0
dad.neurons.push(in2Dad); // 1
dad.neurons.push(out1.clone()); // 2
dad.neurons.push(hid1.clone()); // 3
dad.genes.push(gene02.clone());
dad.genes.push(gene12.clone());
dad.genes.push(gene03.clone());

dad.reconnect();


mum.neurons.push(in1.clone()); // 0
mum.neurons.push(in2.clone()); // 1
mum.neurons.push(out1.clone()); // 2
mum.neurons.push(hid2.clone()); // 4
mum.genes.push(gene02.clone());
mum.genes.push(gene04.clone());

mum.reconnect();

debugger;
var child = species.crossover(dad, mum);
