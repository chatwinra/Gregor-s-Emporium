(function () {

	'use strict';

	/* TODO
	
		* fix images- diff images for diff genotypes
		* update descriptions 
		* fix bull/cow level- then call it quits!
		* reset function (in case end up in a corner by mating wrong parents)
		* re-visit score mechanism- is it the best implementation?
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

					dialog: true,

				}
			});

			game.view.on({
				start: game.start,


				mate: function ( event) {
					game.createOffspring( );
				},

				displayInstructions: function (event, a){
					game.displayInstructions( a );
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

					generation: false,
					mateButton: false,
					instructions:true,
					nextMateInstructions: false,
					objectives: false,
					endgame: false,
					dialog: false
				
			});
		},

		// Start a new round
		start: function () {

			game.reset();

			//check what 'level' the player is on. At the start the counter will be undefined, but each time the player wins it goes up by 1
			function levelSelect(){

			if (typeof game.levelCounter === 'undefined'){
				game.levelCounter = 1;
			}
		}

			levelSelect();

			// Clone csv data for organisms & Assign 2 random parent creatures to start the game
			var wildlife = game.level[game.levelCounter];



			shuffle(wildlife);

			if(game.levelCounter === 4){
				var wildlifeMothers = game.level[5];
				shuffle(wildlifeMothers);
				game.mother = wildlifeMothers[0];
			} else {
				game.mother = wildlife[0];
			}


			game.father = wildlife[1];

			game.mother.name = 'Mummy';
			game.father.name = 'Daddy';

			//This tracks the generation of the offspring, goes up as the player mates more offspring

			game.generation = {number: 0};

			//track the score- it will start off as undefined but will increase as the player wins games (as same as the level counter)
			function gameScore (){
				if (typeof game.score === 'undefined'){
					game.score = 0;
				}
			}
			gameScore();


			//clone csv data for objectives
			var objectives = game.objectives;
			shuffle(objectives);
			game.thisGameTarget = objectives[0];
			game.thisGameTarget.dominantTrait = game.mother.dominantTrait;
			game.thisGameTarget.recessiveTrait = game.mother.recessiveTrait;

			//clone csv data for instructions

			var instructions = game.instructions



			// Unfade images and hide initial message
			game.view.set({
				offspringOne: false,
				offspringTwo: false,
				offspringThree: false,
				offspringFour: false,
				mateButton: true,
				instructions: game.instructions[0].instructions,
				secondInstructions: false,
				mother: game.mother,
				father: game.father,
				objectives: game.thisGameTarget,
				score: game.score
				
			});

		},

		displayInstructions: function(){
			game.number;

			if(typeof game.number === 'undefined' || game.number >= game.instructions.length-1){
				game.number = -1;
			} else {

			game.number ++;
			}

			game.view.set({
				instructions: game.instructions[game.number].instructions
			});


		},

		//mates the two parents to create 4 offspring- start with object constructor
		createOffspring: function () {

		function Offspring(gene1, gene2, gene3, gene4, name ) {
	
			this.name = name;
			this.description = 'Unknown';
			this.image = 'Unknown';
			this.genotype1 = gene1;
			this.genotype2 = gene2;
			this.genotype3 = gene3;
			this.genotype4 = gene4;
			this.dominants = 0;
			this.recessives = 0;

		}
		
		//this method sets the number of dominant & recessive genes property, as well as the description, for each offspring created.
		Offspring.prototype.setDescription = function ( array ){
				for (var i=0; i<array.length; i++) {
					if (array[i].genotype1 === this.genotype1 && array[i].genotype2 === this.genotype2 && array[i].genotype3 === this.genotype3 && array[i].genotype4 === this.genotype4){
						this.description = array[i].description;
						this.dominants += array[i].dominants;
						this.recessives += array[i].recessives;
						this.image = array[i].image;
					}
				}
			}
		
		

		//Punnet Square version - create the 4 offspring based on the combinations of the parents' genes. Put them in an array
		game.allOffspring = [];
		game.allOffspring[0] = new Offspring(game.mother.genotype1, game.father.genotype1, game.mother.genotype3, game.father.genotype3, 'Offspring 1');
		game.allOffspring[1] = new Offspring(game.mother.genotype1, game.father.genotype2, game.mother.genotype3, game.father.genotype4, 'Offspring 2');
		game.allOffspring[2] = new Offspring(game.mother.genotype2, game.father.genotype1, game.mother.genotype4, game.father.genotype3, 'Offspring 3');
		game.allOffspring[3] = new Offspring(game.mother.genotype2, game.father.genotype2, game.mother.genotype4, game.father.genotype4, 'Offspring 4');

		//set their dominant/recessive gene count and description
		function offspringDescriptions(){
				
				for(var i = 0; i<game.allOffspring.length; i++){
					if(game.allOffspring[i].genotype3 && game.allOffspring[i].genotype4 == 'X'){
						game.allOffspring[i].setDescription(game.level[3]);
					}else{
					game.allOffspring[i].setDescription(game.level[game.levelCounter]);
				}

			}
		}

		offspringDescriptions();

		//move the offspring counter up by one and reset the mother/father names so they don't stay as 'new mummy' and 'new daddy' (only applicable afer the first mating) 
		game.generation.number +=1;
		game.mother.name = 'Mummy';
		game.father.name = 'Daddy';




			game.view.set({
				'offspringOne': game.allOffspring[0],
				'offspringTwo': game.allOffspring[1],
				'offspringThree': game.allOffspring[2],
				'offspringFour': game.allOffspring[3],
				selectedParent: null,
				selectedParent2: null,
				mother: game.mother,
				father: game.father,
				generation: game.generation,
				firstInstructions: false,
				secondInstructions: true,
				nextMateInstructions: true,
				submitOffspring: true,
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
			// offspring are correct - won the game
			var snd = new Audio('assets/nature/correct.mp3');
			snd.play();
			game.view.set({
				'dialog.message': 'You have won the game!',
				endgame: true
			});

			/*game.levelCounter ++;*/
			game.score ++;
		},

		continue: function () {
			// offspring aren't correct
			var snd = new Audio('assets/nature/incorrect.mp3');
			snd.play();
			game.score --;
			game.view.set({
				'dialog.message': "Nope! Those offspring aren't right. Try Again",
				wrong: true,
				score: game.score
			});


		},

		continuePlaying: function(){
			game.view.set({
				dialog: false
			});
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

	get ('data2father.csv', function( csv ) {
		var parser = new CSVParser ( csv );
		game.level[4] = parser.json();
	});

	get ('data2mother.csv', function( csv ) {
		var parser = new CSVParser ( csv );
		game.level[5] = parser.json();
	});

	// load template
	get ('instructions.csv', function( csv ) {
		var parser = new CSVParser ( csv );
		game.instructions = parser.json();
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

	function preload ( url ) {
		var image = new Image();
		image.src = url;
	}

}());