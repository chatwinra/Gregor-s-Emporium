(function () {

	'use strict';

	/* TODO
	
		* fix images- diff images for diff genotypes
		* add new species in & objectives
		* mechanism to vary species
		* add multiple genotypes
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
					mateButton: false,
					firstInstructions:true,
					secondInstructions:false,
					newMummy: false,
					newMother: false,
					mummyName: true,
					newDaddy: false,
					daddyName: true,
					nextMate: false,
					objectives: false
				}
			});

			game.view.on({
				start: game.start,

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

				playAgain: function (event){ 
					game.reset();
					game.start();
				}
			});
		},

		reset: function () {
			game.view.set({
				father: null,
				mother: null,
				offspring: null,
				pending: true,
				dialog: null,
				objectives: false,
				endgame: false
				
			});
		},

		// Start a new round
		start: function () {

			game.reset();
			
			// Clone csv data for organisms
			var wildlife = game.wildlife;
			shuffle(wildlife);
			var randomParent = wildlife[0];
			var randomParent2 = wildlife[1];

			// Assign 2 random parent creatures to start the game
			game.mother = randomParent;
			game.father = randomParent2;
			game.mother.name = 'Mummy';
			game.father.name = 'Daddy';

			//clone csv data for objectives
			var objectives = game.objectives;
			shuffle(objectives);
			game.thisGameTarget = objectives[0];

			// Unfade images and hide initial message
			game.view.set({
				pending: false,
				mateButton: true,
				firstInstructions: true,
				secondInstructions: false,
				mother: game.mother,
				father: game.father,
				offspringOne: false,
				offspringTwo: false,
				offspringThree: false,
				offspringFour: false,
				objectives: game.thisGameTarget
				
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

		game.allOffspring[0].set_description(game.wildlife);
		game.allOffspring[1].set_description(game.wildlife);
		game.allOffspring[2].set_description(game.wildlife);
		game.allOffspring[3].set_description(game.wildlife);



		game.view.set('offspringOne', game.allOffspring[0]);
		game.view.set('offspringTwo', game.allOffspring[1]);
		game.view.set('offspringThree', game.allOffspring[2]);
		game.view.set('offspringFour', game.allOffspring[3]);
		
			
			game.view.set({
				pending: false,
				firstInstructions: false,
				secondInstructions: true,
				mummyName: true,
				newMummy: false,
				daddyName: true,
				newDaddy: false,
				nextMate: false



				
			});
		},

		//takes the selected gender when choosing the new parent (and allows user to change this)
		selectParentGender: function (gender){
			game.gender = gender;
			return game.gender;

		},


		// Select offspring to become parents
		selectParent: function ( offspringNumber ) {
			
			var d = parseInt(offspringNumber);

			if(game.gender === 'mother'){
				if(game.father === game.allOffspring[d-1]){
					alert("You can't have the same offspring as both mother and father!")
				} else {
					game.mother = game.allOffspring[d-1];
					game.mother.name = 'New Mummy';


					game.view.set('mother', game.allOffspring[d-1]);
			
					game.view.set({

						newMummy: true,
						mummyName: false

						
					});
						}


			} else{
				if(game.mother === game.allOffspring[d-1]){
					alert('You can%t have the same offspring as both mother and father!')
				} else {

			game.father = game.allOffspring[d-1];
			game.father.name = 'New Daddy';
			game.view.set('father', game.allOffspring[d-1]);
			game.view.set({

				newDaddy: true,
				daddyName: false

				
				});
			}
		}


			if(game.view.data.daddyName === false && game.view.data.mummyName === false){
				game.view.set({

					nextMate: true

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
				alert('You win!');
			} else {
				alert('You lose :(');
			}
		
		},

		win: function () {
			game.transferCards( true );

			if ( !game.opponentHand.length ) {
				game.winGame();
			} else {
				game.view.set( 'dialog.message', 'You win!' );
			}

			game.playerTurn = true;
		},

		lose: function () {
			game.transferCards( false );
			
			if ( !game.playerHand.length ) {
				game.loseGame();
			} else {
				game.view.set( 'dialog.message', 'You lose :(' );
			}

			game.playerTurn = false;
		},

		draw: function () {
			game.centrePot.push( game.playerCard, game.opponentCard );

			if ( !game.opponentHand.length ) {
				game.winGame();
			} else if ( !game.playerHand.length ) {
				game.loseGame();
			} else {
				game.view.set( 'dialog.message', 'Draw!' );
			}
		},

		winGame: function () {
			// won the game
			game.view.set({
				'dialog.message': 'You have won the game!',
				endgame: true
			});
		},

		loseGame: function () {
			// won the game
			game.view.set({
				'dialog.message': 'You have lost the game :(',
				endgame: true
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
	

	// load CSV data for both genotypes and objectives
	get( 'data.csv', function ( csv ) {
		var parser = new CSVParser( csv );
		game.wildlife = parser.json();

		// TODO don't enable user to start game until we've got the data
	});

	get ('objectives.csv', function( csv ) {
		var parser = new CSVParser ( csv );
		game.objectives = parser.json();
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