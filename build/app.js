(function () {

	'use strict';

	/* TODO
	
		* fix images- diff images for diff genotypes
		* add new species in & objectives
		* mechanism to vary species
		* add multiple genotypes
		* reset function (in case end up in a corner by mating wrong parents)
		* keep track of score
		* display score
		* fix UI
		* etc...

	*/

	var game = {
		// Initialise the view
		render: function ( template ) {
			game.view = new Ractive({
				el: 'container',
				template: template,
				data: {
					pending: true,
					dialog: true


				}
			});

			game.view.on({
				start: game.start,

				intro: function( event ){
					game.view.set('instructions', true);
				},

				mate: function ( event) {
					game.createOffspring( );
				},

				selectParentGender: function(event, gender){
					game.selectParentGender(gender);
				},

				selectParent: function ( event, offspringNumber ) {
					game.selectParent( offspringNumber );
				},

				submitOffspring: function (event){
					game.submitOffspring();
				},

				continuePlaying: function(event){
					game.continuePlaying();
				},

				playAgain: function (event){ 
					game.reset();
					game.start();
				}
			});
		},

		reset: function () {
			
			game.view.set({
					pending: true,
					generation: false,
					mateButton: false,
					instructions:true,
					secondInstructions:false,
					nextMateInstructions: false,
					objectives: false,
					endgame: false,
					dialog: false
				
			});
		},

		// Start a new round
		start: function () {

			game.reset();
			
			// Clone csv data for organisms
			var wildlife = game.level[2];
			shuffle(wildlife);
			var randomParent = wildlife[0];
			var randomParent2 = wildlife[1];

			// Assign 2 random parent creatures to start the game
			game.mother = randomParent;
			game.father = randomParent2;
			game.mother.name = 'Mummy';
			game.father.name = 'Daddy';
			game.generation = {

					number: 0

				};


			//clone csv data for objectives
			var objectives = game.objectives;
			shuffle(objectives);
			game.thisGameTarget = objectives[0];


			// Unfade images and hide initial message
			game.view.set({
				pending: false,
				mateButton: true,
				'instructions': "Hi, I'm Gregor Mendel - Priest, Biologist and Geneticist. I like breeding things. Maybe you'll like it too? Why don't you have a go? Breed these pea plants for me.",
				secondInstructions: false,
				mother: game.mother,
				father: game.father,
				offspringOne: false,
				offspringTwo: false,
				offspringThree: false,
				offspringFour: false,
				objectives: game.thisGameTarget,
				gameMode: true
				
			});

		},

		//mates the two parents to create 4 offspring- start with object constructor
		createOffspring: function () {

		function offspring(gene1, gene2, name ) {
	
			this.name = name;
			this.description = 'Unknown';
			this.image = gene1+gene2;
			this.genotype1 = gene1;
			this.genotype2 = gene2;
			this.dominants = 0;
			this.recessives = 0;
			this.set_description = function ( array ){
				for (var i=0; i<array.length; i++) {
					if (array[i].genotype1 === this.genotype1 && array[i].genotype2 === this.genotype2){
						this.description = array[i].description;
						this.dominants += array[i].dominants;
						this.recessives += array[i].recessives;
					}
				}
			}

		}
		
		
		

		//then create the 4 offspring based on the combinations of the parents' genes. Put them in an array
		game.allOffspring = [];
		game.allOffspring[0] = new offspring(game.mother.genotype1, game.father.genotype1, 'Offspring 1');
		game.allOffspring[1] = new offspring(game.mother.genotype1, game.father.genotype2, 'Offspring 2');
		game.allOffspring[2] = new offspring(game.mother.genotype2, game.father.genotype1, 'Offspring 3');
		game.allOffspring[3] = new offspring(game.mother.genotype2, game.father.genotype2, 'Offspring 4');

		game.allOffspring[0].set_description(game.level[2]);
		game.allOffspring[1].set_description(game.level[2]);
		game.allOffspring[2].set_description(game.level[2]);
		game.allOffspring[3].set_description(game.level[2]);

		game.generation.number +=1;
		game.mother.name = 'Mummy';
		game.father.name = 'Daddy';



		game.view.set('offspringOne', game.allOffspring[0]);
		game.view.set('offspringTwo', game.allOffspring[1]);
		game.view.set('offspringThree', game.allOffspring[2]);
		game.view.set('offspringFour', game.allOffspring[3]);

		
			
			game.view.set({
				pending: false,
				selectedParent: null,
				selectedParent2: null,
				mother: game.mother,
				father: game.father,
				generation: game.generation,
				firstInstructions: false,
				secondInstructions: true,
				nextMateInstructions: true,
				mateButton: false			
			});
		},

		//takes the selected gender when choosing the new parent (and allows user to change this)
		selectParentGender: function (gender){
			game.gender = gender;
			return game.gender;

		},


		// Select offspring to become parents
		selectParent: function ( offspringNumber ) {
			


			var newNumber = offspringNumber - 1 

			if(game.gender === 'mother'){
				if(game.father === game.allOffspring[newNumber]){
					alert("You can't have the same offspring as both mother and father!")
				} else {
					game.mother = game.allOffspring[newNumber];
					game.mother.name = 'New Mummy';
					game.view.set('mother', game.allOffspring[newNumber]);
					game.view.set({
						'instructions.message': 'hello',
						selectedParent: newNumber

					});
			
				}

			} else{
				if(game.mother === game.allOffspring[newNumber]){
					alert("You can't have the same offspring as both mother and father!")
				} else {

			game.father = game.allOffspring[newNumber];
			game.father.name = 'New Daddy';
			game.view.set('father', game.allOffspring[newNumber]);
			game.view.set({

						selectedParent2: newNumber

					});
			}
		}


			if(game.father.name === 'New Daddy' && game.mother.name === 'New Mummy'){
				game.view.set({

					mateButton: true

				});
			}
			

		},


		submitOffspring: function () {
			var offspringDominants = 0;
			var offspringRecessives = 0;

			for (var i=0; i<game.allOffspring.length; i++) {
				 offspringDominants +=  game.allOffspring[i].dominants;
				 offspringRecessives += game.allOffspring[i].recessives;

			}
			

			if (offspringDominants === game.thisGameTarget.dominantsTotals && offspringRecessives === game.thisGameTarget.recessivesTotals){
				game.winGame();
			} else {
				game.continue();
			}
		
		},


		winGame: function () {
			// won the game
			game.view.set({
				'dialog.message': 'You have won the game!',
				endgame: true
			});

			game.counter = 2;
		},

		continue: function () {
			// offspring aren't correct
			game.view.set({
				'dialog.message': "Nope! Those offspring aren't right. Try Again",
				wrong: true
			});
		},

		continuePlaying: function(){
			game.view.set({
				dialog: false
			});
		},

		transferCards: function ( playerWon ) {
			var winnings, hand;

			winnings = [ game.playerCard, game.opponentCard ].concat( game.centrePot );
			hand = playerWon ? game.playerHand : game.opponentHand;

			hand.push.apply( hand, winnings );

			// empty the center pot
			game.centrePot.splice( 0 );
		}
	};

	window.game = game; // for the debugging
	
	game.level = [];
	// load CSV data for both genotypes and objectives
	get( 'data.csv', function ( csv ) {
		var parser = new CSVParser( csv );
		game.level[1] = parser.json();

		// TODO don't enable user to start game until we've got the data
	});

	get ('objectives.csv', function( csv ) {
		var parser = new CSVParser ( csv );
		game.objectives = parser.json();
	});

	get ('data2.csv', function( csv ) {
		var parser = new CSVParser ( csv );
		game.level[2] = parser.json();
	});


	// load template
	get( 'template.html', function ( template ) {
		game.render( template );
	});



	// helper functions
	function  get ( url, callback ) {
		var xhr = new XMLHttpRequest();

		xhr.open( 'get', url );
		xhr.onload = function () {
			callback( xhr.responseText )
		};

		xhr.send();
	}

	//shuffles array of creatures
	function shuffle ( array ) {
		var counter = array.length, temp, index;

		// While there are elements in the array
		while (counter--) {
			// Pick a random index
			index = (Math.random() * counter) | 0;

			// And swap the last element with it
			temp = array[counter];
			array[counter] = array[index];
			array[index] = temp;
		}

		return array;
	}
	//function gives a random creature from the array
	function randomCreature ( array ) {
		var counter = array.length, temp, index;

		// While there are elements in the array
		while (counter--) {
			// Pick a random index
			index = (Math.random() * counter) | 0;

			// and return that
		
		}

		return array[index];
	}

	function preload ( url ) {
		var image = new Image();
		image.src = url;
	}

}());