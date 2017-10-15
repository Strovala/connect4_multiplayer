var generation = new Neat.Generation();
console.log(generation);
for (var i = 0; i < 100; i++) {
  generation.nextGeneration();
  generation.species.forEach(function (species) {
    species.genomes.forEach(function (genome) {
      genome.wins = [
        { win: Math.random() < 0.5 ? 1 : -1, turns: Math.random()*30 },
        { win: Math.random() < 0.5 ? 1 : -1, turns: Math.random()*30 }
      ];
    });
  });
}
console.log(generation);
