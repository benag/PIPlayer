require(['app/API','../../examples/dscore/Scorer'], function(API,Scorer) {

	var attribute1 = 'Bad Words';
	var attribute2 = 'Good Words';
	var category1 = 'White People';
	var category2 = 'Black People';

	API.addSettings('canvas',{
		maxWidth: 800,
		proportions : 0.8
	});

	API.addSettings('base_url',{
		image : '../examples/images',
		template : '../../examples/IAT'
	});

	API.addSettings('logger',{
		url : 'google.com',
		pulse : 20
	});

	//the Scorer that computes the user feedback
	Scorer.addSettings('compute',{
		condVar:"trialCategories",
		cond1VarValues: ["Black People/Bad Words","White People/Good Words"], //condition 1
		cond2VarValues: ["Black People/Good Words","White People/Bad Words"], //condition 2
		parcelVar : "block",
		parcelValue : [3,4,6,7],
		fastRT : 150, //Below this reaction time, the latency is considered extremely fast.
		maxFastTrialsRate : 0.1, //Above this % of extremely fast responses within a condition, the participant is considered too fast.
		minRT : 150, //Below this latency
		maxRT : 5000, //above this
		errorLatency : {use:"false", penalty:600, useForSTD:true}//ignore error respones
	});

	Scorer.addSettings('message',{
		MessageDef: [
			{ cut:'-0.65', message:'Your data suggest a strong implicit preference for Black People compared to White People' },
			{ cut:'-0.35', message:'Your data suggest a moderate implicit preference for Black People compared to White People.' },
			{ cut:'-0.15', message:'Your data suggest a slight implicit preference for Black People compared to White People.' },
			{ cut:'0', message:'Your data suggest little to no difference in implicit preference between Black People and White People.' },
			{ cut:'0.15', message:'Your data suggest a slight implicit preference for White People compared to Black People' },
			{ cut:'0.35', message:'Your data suggest a moderate implicit preference for White People compared to Black People' },
			{ cut:'0.65', message:'Your data suggest a strong implicit preference for White People compared to Black People' }
		]
	});

	/**
	 * Create default Trial
	 * note that this function takes a single object
	 */
	API.addTrialSets('Default',{
		// by default each trial is correct, this is modified in case of an error
		data: {score:1},

		// set the interface for trials
		input: [
			{handle:'enter',on:'enter'},
			{handle:'left',on:'keypressed',key:'e'},
			{handle:'right',on:'keypressed',key:'i'},
			{handle:'left',on:'leftTouch',touch:true},
			{handle:'right',on:'rightTouch',touch:true}
		],

		// constant elements in the display, in this case: the user instructions: left / right
		layout: [
			{location:{left:0,top:0},media:{template:'left.jst'}},
			{location:{left:'auto',right:0,top:0},media:{template:'right.jst'}}
		],

		// user interactions
		interactions: [
			// begin trial : display stimulus imidiately
			{
				propositions: [{type:'begin'}],
				actions: [{type:'showStim',handle:'myStim'}]
			},

			// error
			{
				propositions: [
					{type:'stimEquals',value:'side',negate:true},								// check if the input handle is unequal to the "side" attribute of stimulus.data
					{type:'inputEquals',value:'error_end', negate:true}							// make sure this isn't an error end interaction
				],
				actions: [
					{type:'showStim',handle:'error'},											// show error stimulus
					{type:'setInput',input:{handle:'error_end', on:'timeout',duration:300}},	// hide error stimulus after 300ms
					{type:'setTrialAttr', setter:{score:0}}										// set the score to 0
				]
			},

			// hide error stimulus
			{
				propositions: [{type:'inputEquals',value:'error_end'}],							// check if the input handle is "error_end"
				actions: [{type:'hideStim', handle: 'error'}]									// hide error stim
			},

			// correct
			{
				propositions: [{type:'stimEquals',value:'side'}],								// check if the input handle is equal to the "side" attribute of stimulus.data
				actions: [
					{type:'hideStim', handle: 'error'},											// hide error stim if it is displayed
					{type:'log'},																// log this trial
					{type:'endTrial'}															// move on to the next trial
				]
			},

			// skip block
			{
				propositions: [{type:'inputEquals',value:'enter'}],
				actions: [
					{type:'goto', destination: 'nextWhere', properties: {blockStart:true}},
					{type:'endTrial'}
				]
			}
		]
	});

	/**
	 * Create default Introduction trials
	 * note that this function takes an array of objects
	 */
	API.addTrialSets("introduction", [
		// generic introduction trial, to be inherited by all other inroduction trials
		{
			// set block as generic so we can inherit it later
			data: {block: 'generic'},

			// create user interface (just click to move on...)
			input: [
				{handle:'space',on:'space'},
				{handle:'enter',on:'enter'},
				{handle:'space',on:'centerTouch',touch:true}
			],

			// display fixed layout
			layout:[
				{location:{left:0,top:0},media:{template:'left.jst'}},
				{location:{right:0,top:0},media:{template:'right.jst'}}
			],

			interactions: [
				// display instructions
				{
					propositions: [{type:'begin'}],
					actions: [
						{type:'showStim',handle:'All'}
					]
				},

				// end trial
				{
					propositions: [{type:'inputEquals',value:'space'}],
					actions: [{type:'endTrial'}]
				},

				// skip block
				{
					propositions: [{type:'inputEquals',value:'enter'}],
					actions: [
						{type:'goto', destination: 'nextWhere', properties: {blockStart:true}},
						{type:'endTrial'}
					]
				}
			]
		}
	]);

	/**
	 * Create specific trials for each block
	 */
	API.addTrialSets("IAT", [

		// block1
		{
			data: {block:1, left1 : attribute1, right1:attribute2, condition: attribute1 + '/' + attribute2},
			inherit: 'Default',													// inherit the default trial
			stimuli: [
				{inherit:{type:'exRandom',set:'attribute1_left'}},
				{inherit:{type:'random',set:'feedback'}}
			]
		},

		// block2
		{
			data: {block:2, left1:category1, right1:category2, condition: category1 + '/' + category2},
			inherit: 'Default',
			stimuli: [
				{inherit:{type:'exRandom',set:'category1_left'}},
				{inherit:{type:'random',set:'feedback'}}
			]
		},

		// block3
		{
			data: {block:3, row:1, left1:attribute1, right1:attribute2, left2:category1, right2:category2, condition: attribute1 + ',' + category1 + '/' + attribute2 + ',' + category2},
			inherit: 'Default',
			stimuli: [
				{inherit:{type:'exRandom',set:'category1_left'}},
				{inherit:{type:'random',set:'feedback'}}
			]
		},

		{
			data: {block:3, row:2, left1:attribute1, right1:attribute2, left2:category1, right2:category2, condition: attribute1 + ',' + category1 + '/' + attribute2 + ',' + category2},
			inherit: 'Default',
			stimuli: [
				{inherit:{type:'exRandom',set:'attribute1_left'}},
				{inherit:{type:'random',set:'feedback'}}
			]
		},

		// block4 (same as 3)
		{
			data: {block:4, row:1, left1:attribute1, right1:attribute2, left2:category1, right2:category2, condition: attribute1 + ',' + category1 + '/' + attribute2 + ',' + category2},
			inherit: 'Default',
			stimuli: [
				{inherit:{type:'exRandom',set:'category1_left'}},
				{inherit:{type:'random',set:'feedback'}}
			]
		},

		{
			data: {block:4, row:2, left1:attribute1, right1:attribute2, left2:category1, right2:category2, condition: attribute1 + ',' + category1 + '/' + attribute2 + ',' + category2},
			inherit: 'Default',
			stimuli: [
				{inherit:{type:'exRandom',set:'attribute1_left'}},
				{inherit:{type:'random',set:'feedback'}}
			]
		},

		// block5
		{
			data: {block:5, left1:category1, right1:category2, condition: category1 + '/' + category2},
			inherit: 'Default',
			stimuli: [
				{inherit:{type:'exRandom',set:'category1_left'}},
				{inherit:{type:'random',set:'feedback'}}
			]
		},

		// block6
		{
			data: {block:6, row:1, left1:attribute1, right1:attribute2, left2:category2, right2:category1, condition: attribute1 + ',' + category2 + '/' + attribute2 + ',' + category1},
			inherit: 'Default',
			stimuli: [
				{inherit:{type:'exRandom',set:'category1_right'}},
				{inherit:{type:'random',set:'feedback'}}
			]
		},

		{
			data: {block:6, row:2, left1:attribute1, right1:attribute2, left2:category2, right2:category1, condition: attribute1 + ',' + category2 + '/' + attribute2 + ',' + category1},
			inherit: 'Default',
			stimuli: [
				{inherit:{type:'exRandom',set:'attribute1_left'}},
				{inherit:{type:'random',set:'feedback'}}
			]
		},

		// block7  (same as 6)
		{
			data: {block:7, row:1, left1:attribute1, right1:attribute2, left2:category2, right2:category1, condition: attribute1 + ',' + category2 + '/' + attribute2 + ',' + category1},
			inherit: 'Default',
			stimuli: [
				{inherit:{type:'exRandom',set:'category1_right'}},
				{inherit:{type:'random',set:'feedback'}}
			]
		},

		{
			data: {block:7, row:2, left1:attribute1, right1:attribute2, left2:category2, right2:category1, condition: attribute1 + ',' + category2 + '/' + attribute2 + ',' + category1},
			inherit: 'Default',
			stimuli: [
				{inherit:{type:'exRandom',set:'attribute1_left'}},
				{inherit:{type:'random',set:'feedback'}}
			]
		}
	]);

	/*
	 *	Stimulus Sets
	 *
	 */
	API.addStimulusSets({
		// This Default stimulus is inherited by the other stimuli so that we can have a consistent look and change it from one place
		Default: [
			{css:{color:'blue','font-size':'2em'}}
		],

		Instructions: [
			{css:{'font-size':'1.3em'}}
		],

		// The trial stimuli
		// Each stimulus set holds the left and right stimuli for a specific page settings (is the first attribute/category in the left or right?)
		// Notably the attribute/category sets repeat themselves 5 times each, this is so that when calling them they will be balanced accross each ten trials
		attribute1_left : [
			{data:{side:'left', handle:'myStim', alias:attribute1}, inherit:'Default', media: {inherit:{type:'exRandom',set:'attribute1'}}},
			{data:{side:'right', handle:'myStim', alias:attribute2}, inherit:'Default', media: {inherit:{type:'exRandom',set:'attribute2'}}},
			{data:{side:'left', handle:'myStim', alias:attribute1}, inherit:'Default', media: {inherit:{type:'exRandom',set:'attribute1'}}},
			{data:{side:'right', handle:'myStim', alias:attribute2}, inherit:'Default', media: {inherit:{type:'exRandom',set:'attribute2'}}},
			{data:{side:'left', handle:'myStim', alias:attribute1}, inherit:'Default', media: {inherit:{type:'exRandom',set:'attribute1'}}},
			{data:{side:'right', handle:'myStim', alias:attribute2}, inherit:'Default', media: {inherit:{type:'exRandom',set:'attribute2'}}},
			{data:{side:'left', handle:'myStim', alias:attribute1}, inherit:'Default', media: {inherit:{type:'exRandom',set:'attribute1'}}},
			{data:{side:'right', handle:'myStim', alias:attribute2}, inherit:'Default', media: {inherit:{type:'exRandom',set:'attribute2'}}},
			{data:{side:'left', handle:'myStim', alias:attribute1}, inherit:'Default', media: {inherit:{type:'exRandom',set:'attribute1'}}},
			{data:{side:'right', handle:'myStim', alias:attribute2}, inherit:'Default', media: {inherit:{type:'exRandom',set:'attribute2'}}}
		],
		attribute1_right : [
			{data:{side:'left', handle:'myStim', alias:attribute2}, inherit:'Default', media: {inherit:{type:'exRandom',set:'attribute2'}}},
			{data:{side:'right', handle:'myStim', alias:attribute1}, inherit:'Default', media: {inherit:{type:'exRandom',set:'attribute1'}}},
			{data:{side:'left', handle:'myStim', alias:attribute2}, inherit:'Default', media: {inherit:{type:'exRandom',set:'attribute2'}}},
			{data:{side:'right', handle:'myStim', alias:attribute1}, inherit:'Default', media: {inherit:{type:'exRandom',set:'attribute1'}}},
			{data:{side:'left', handle:'myStim', alias:attribute2}, inherit:'Default', media: {inherit:{type:'exRandom',set:'attribute2'}}},
			{data:{side:'right', handle:'myStim', alias:attribute1}, inherit:'Default', media: {inherit:{type:'exRandom',set:'attribute1'}}},
			{data:{side:'left', handle:'myStim', alias:attribute2}, inherit:'Default', media: {inherit:{type:'exRandom',set:'attribute2'}}},
			{data:{side:'right', handle:'myStim', alias:attribute1}, inherit:'Default', media: {inherit:{type:'exRandom',set:'attribute1'}}},
			{data:{side:'left', handle:'myStim', alias:attribute2}, inherit:'Default', media: {inherit:{type:'exRandom',set:'attribute2'}}},
			{data:{side:'right', handle:'myStim', alias:attribute1}, inherit:'Default', media: {inherit:{type:'exRandom',set:'attribute1'}}}
		],
		category1_left: [
			{data:{side:'left', handle:'myStim', alias:category1}, inherit:'Default', media: {inherit:{type:'exRandom',set:'category1'}}},
			{data:{side:'right', handle:'myStim', alias:category2}, inherit:'Default', media: {inherit:{type:'exRandom',set:'category2'}}},
			{data:{side:'left', handle:'myStim', alias:category1}, inherit:'Default', media: {inherit:{type:'exRandom',set:'category1'}}},
			{data:{side:'right', handle:'myStim', alias:category2}, inherit:'Default', media: {inherit:{type:'exRandom',set:'category2'}}},
			{data:{side:'left', handle:'myStim', alias:category1}, inherit:'Default', media: {inherit:{type:'exRandom',set:'category1'}}},
			{data:{side:'right', handle:'myStim', alias:category2}, inherit:'Default', media: {inherit:{type:'exRandom',set:'category2'}}},
			{data:{side:'left', handle:'myStim', alias:category1}, inherit:'Default', media: {inherit:{type:'exRandom',set:'category1'}}},
			{data:{side:'right', handle:'myStim', alias:category2}, inherit:'Default', media: {inherit:{type:'exRandom',set:'category2'}}},
			{data:{side:'left', handle:'myStim', alias:category1}, inherit:'Default', media: {inherit:{type:'exRandom',set:'category1'}}},
			{data:{side:'right', handle:'myStim', alias:category2}, inherit:'Default', media: {inherit:{type:'exRandom',set:'category2'}}}
		],
		category1_right : [
			{data:{side:'left', handle:'myStim', alias:category2}, inherit:'Default', media: {inherit:{type:'exRandom',set:'category2'}}},
			{data:{side:'right', handle:'myStim', alias:category1}, inherit:'Default', media: {inherit:{type:'exRandom',set:'category1'}}},
			{data:{side:'left', handle:'myStim', alias:category2}, inherit:'Default', media: {inherit:{type:'exRandom',set:'category2'}}},
			{data:{side:'right', handle:'myStim', alias:category1}, inherit:'Default', media: {inherit:{type:'exRandom',set:'category1'}}},
			{data:{side:'left', handle:'myStim', alias:category2}, inherit:'Default', media: {inherit:{type:'exRandom',set:'category2'}}},
			{data:{side:'right', handle:'myStim', alias:category1}, inherit:'Default', media: {inherit:{type:'exRandom',set:'category1'}}},
			{data:{side:'left', handle:'myStim', alias:category2}, inherit:'Default', media: {inherit:{type:'exRandom',set:'category2'}}},
			{data:{side:'right', handle:'myStim', alias:category1}, inherit:'Default', media: {inherit:{type:'exRandom',set:'category1'}}},
			{data:{side:'left', handle:'myStim', alias:category2}, inherit:'Default', media: {inherit:{type:'exRandom',set:'category2'}}},
			{data:{side:'right', handle:'myStim', alias:category1}, inherit:'Default', media: {inherit:{type:'exRandom',set:'category1'}}}
		],

		// this stimulus used for giving feedback, in this case only the error notification
		feedback : [
			{handle:'error', location: {top: 80}, css:{color:'red','font-size':'2em'}, media: {word:'X'}, nolog:true}
		]
	});

	API.addMediaSets({
		attribute1 : [
			{word: 'Bomb'},
			{word: 'Abuse'},
			{word: 'Sadness'},
			{word: 'Pain'},
			{word: 'Poison'},
			{word: 'Grief'}
		],
		attribute2: [
			{word: 'Paradise'},
			{word: 'Pleasure'},
			{word: 'Cheer'},
			{word: 'Wonderful'},
			{word: 'Splendid'},
			{word: 'Love'}
		],
		category1: [
			{image: 'epbm1.jpg'},
			{image: 'epbm2.jpg'},
			{image: 'epbm3.jpg'},
			{image: 'epbf1.jpg'},
			{image: 'epbf2.jpg'},
			{image: 'epbf3.jpg'}
		],
		category2: [
			{image: 'epwm1.jpg'},
			{image: 'epwm2.jpg'},
			{image: 'epwm3.jpg'},
			{image: 'epwf1.jpg'},
			{image: 'epwf2.jpg'},
			{image: 'epwf3.jpg'}
		]
	});


	/*
		Regular IAT sequence
		***********************************************************
	*/
	var regularIAT = [
		// block 1
		// block 1 instructions
		{
			data: {block:1, left1 : attribute1, right1:attribute2,blockStart:true},			// we set the data with the category names so the template can display them
			inherit: {set:'introduction', type:'byData', data: {block:'generic'}},			// inhertit the generic instruction block
			stimuli: [{
				inherit:'Instructions',
				media:{template:'inst1.jst'}
			}]
		},
		{
			mixer : 'repeat',
			times : 20,
			data : [
				{inherit : {type:'byData', data:{block:1}, set:'IAT'}}
			]
		},

		// block 2
		// block 2 instructions
		{
			data: {block:2, left1:category1, right1:category2,blockStart:true},
			inherit: {set:'introduction', type:'byData', data: {block:'generic'}},
			stimuli: [{
				inherit:'Instructions',
				media:{template:'inst2.jst'}
			}]
		},
		{
			mixer : 'repeat',
			times : 20,
			data : [
				{inherit : {type:'byData', data:{block:2}, set:'IAT'}}
			]
		},

		// block 3
		// block 3 instructions
		{
			data: {block:3, left1:attribute1, right1:attribute2, left2:category1, right2:category2,blockStart:true},
			inherit: {set:'introduction', type:'byData', data: {block:'generic'}},
			stimuli: [{
				inherit:'Instructions',
				media:{template:'inst3.jst'}
			}]
		},
		{
			mixer: 'repeat',
			times: 20,
			data: [
				{inherit : {type:'byData', data:{block:3,row:1}, set:'IAT'}},
				{inherit : {type:'byData', data:{block:3,row:2}, set:'IAT'}}
			]
		},

		// block 4
		// block 4 instructions
		{
			data: {block:4, left1:attribute1, right1:attribute2, left2:category1, right2:category2,blockStart:true},
			inherit: {set:'introduction', type:'byData', data: {block:'generic'}},
			stimuli: [{
				inherit:'Instructions',
				media:{template:'inst4.jst'}
			}]
		},
		{
			mixer: 'repeat',
			times: 20,
			data: [
				{inherit : {type:'byData', data:{block:4,row:1}, set:'IAT'}},
				{inherit : {type:'byData', data:{block:4,row:2}, set:'IAT'}}
			]
		},

		// block 5
		// block 5 instructions
		{
			data: {block:5, left1:category1, right1:category2,blockStart:true},
			inherit: {set:'introduction', type:'byData', data: {block:'generic'}},
			stimuli: [{
				inherit:'Instructions',
				media:{template:'inst5.jst'}
			}]
		},
		{
			mixer : 'repeat',
			times : 40,
			data : [
				{inherit : {type:'byData', data:{block:5}, set:'IAT'}}
			]
		},

		// block 6
		// block 6 instructions
		{
			data: {block:6, left1:attribute1, right1:attribute2, left2:category2, right2:category1,blockStart:true},
			inherit: {set:'introduction', type:'byData', data: {block:'generic'}},
			stimuli: [{
				inherit:'Instructions',
				media:{template:'inst6.jst'}
			}]
		},
		{
			mixer: 'repeat',
			times: 10,
			data: [
				{inherit : {type:'byData', data:{block:6,row:1}, set:'IAT'}},
				{inherit : {type:'byData', data:{block:6,row:2}, set:'IAT'}}
			]
		},

		// block 7
		// block 7 instructions
		{
			data: {block:7, left1:attribute1, right1:attribute2, left2:category2, right2:category1,blockStart:true},
			inherit: {set:'introduction', type:'byData', data: {block:'generic'}},
			stimuli: [{
				inherit:'Instructions',
				media:{template:'inst7.jst'}
			}]
		},
		{
			mixer: 'repeat',
			times: 20,
			data: [
				{inherit : {type:'byData', data:{block:6,row:1}, set:'IAT'}},
				{inherit : {type:'byData', data:{block:6,row:2}, set:'IAT'}}
			]
		}
	]; // end regular IAT

	/*
		Swaped IAT sequence
		***********************************************************
	*/
	var swapedIAT = [

		// block 5
		// block 5 instructions
		{
			data: {block:5, left1:category1, right1:category2,blockStart:true},
			inherit: {set:'introduction', type:'byData', data: {block:'generic'}},
			stimuli: [{
				inherit:'Instructions',
				media:{template:'inst1.jst'}
			}]
		},
		{
			mixer : 'repeat',
			times : 40,
			data : [
				{inherit : {type:'byData', data:{block:5}, set:'IAT'}}
			]
		},

		// block 2
		// block 2 instructions
		{
			data: {block:2, left1:category1, right1:category2,blockStart:true},
			inherit: {set:'introduction', type:'byData', data: {block:'generic'}},
			stimuli: [{
				inherit:'Instructions',
				media:{template:'inst2.jst'}
			}]
		},
		{
			mixer : 'repeat',
			times : 20,
			data : [
				{inherit : {type:'byData', data:{block:2}, set:'IAT'}}
			]
		},

		// block 6
		// block 6 instructions
		{
			data: {block:6, left1:attribute1, right1:attribute2, left2:category2, right2:category1,blockStart:true},
			inherit: {set:'introduction', type:'byData', data: {block:'generic'}},
			stimuli: [{
				inherit:'Instructions',
				media:{template:'inst3.jst'}
			}]
		},
		{
			mixer: 'repeat',
			times: 10,
			data: [
				{inherit : {type:'byData', data:{block:6,row:1}, set:'IAT'}},
				{inherit : {type:'byData', data:{block:6,row:2}, set:'IAT'}}
			]
		},

		// block 7
		// block 7 instructions
		{
			data: {block:7, left1:attribute1, right1:attribute2, left2:category2, right2:category1,blockStart:true},
			inherit: {set:'introduction', type:'byData', data: {block:'generic'}},
			stimuli: [{
				inherit:'Instructions',
				media:{template:'inst4.jst'}
			}]
		},
		{
			mixer: 'repeat',
			times: 20,
			data: [
				{inherit : {type:'byData', data:{block:6,row:1}, set:'IAT'}},
				{inherit : {type:'byData', data:{block:6,row:2}, set:'IAT'}}
			]
		},

		// block 1
		// block 1 instructions
		{
			data: {block:1, left1 : attribute1, right1:attribute2,blockStart:true},			// we set the data with the category names so the template can display them
			inherit: {set:'introduction', type:'byData', data: {block:'generic'}},			// inhertit the generic instruction block
			stimuli: [{
				inherit:'Instructions',
				media:{template:'inst5.jst'}
			}]
		},
		{
			mixer : 'repeat',
			times : 20,
			data : [
				{inherit : {type:'byData', data:{block:1}, set:'IAT'}}
			]
		},

		// block 3
		// block 3 instructions
		{
			data: {block:3, left1:attribute1, right1:attribute2, left2:category1, right2:category2,blockStart:true},
			inherit: {set:'introduction', type:'byData', data: {block:'generic'}},
			stimuli: [{
				inherit:'Instructions',
				media:{template:'inst6.jst'}
			}]
		},
		{
			mixer: 'repeat',
			times: 20,
			data: [
				{inherit : {type:'byData', data:{block:3,row:1}, set:'IAT'}},
				{inherit : {type:'byData', data:{block:3,row:2}, set:'IAT'}}
			]
		},

		// block 4
		// block 4 instructions
		{
			data: {block:4, left1:attribute1, right1:attribute2, left2:category1, right2:category2,blockStart:true},
			inherit: {set:'introduction', type:'byData', data: {block:'generic'}},
			stimuli: [{
				inherit:'Instructions',
				media:{template:'inst7.jst'}
			}]
		},
		{
			mixer: 'repeat',
			times: 20,
			data: [
				{inherit : {type:'byData', data:{block:4,row:1}, set:'IAT'}},
				{inherit : {type:'byData', data:{block:4,row:2}, set:'IAT'}}
			]
		},
	]; // end swaped IAT

	/*
	 *	Create the Task sequence
	 */
	API.addSequence([
		{
			mixer: 'pick',
			data: [
				{mixer:'wrapper',data:regularIAT},
				{mixer:'wrapper',data:swapedIAT},
			]
		},

		// user feedback- here we will use the computeD function.
		{
			inherit: {set:'introduction', type:'byData', data: {block:'generic'}},
			data: {blockStart:true},
			stimuli: [],
			customize: function(){
				var trial = this;
				console.log('calling Scorer');
				var DScore = Scorer.computeD();
				var FBMsg = Scorer.getFBMsg(DScore);
				console.log(FBMsg);
				console.log(DScore);
				var media = {media:{html:'<div><p style="font-size:28px"><color="#FFFAFA"> '+FBMsg+'<br>The Score is:'+DScore+'</p></div>'}};
				trial.stimuli.push(media);
			}
		},

		{ //Instructions trial, the end of the task, instruction what to do next
			inherit: {set:'introduction', type:'byData', data: {block:'generic'}},
			stimuli: [
				{//The instructions stimulus
					data : {'handle':'instStim'},
					media:{html:'<div><p style="font-size:28px"><color="#FFFAFA">You have completed the study<br/><br/>Thank you very much for your participation.<br/><br/> Press "space" for continue to next task.</p></div>'}
				}
			]
		}
	]);

	API.play();
});