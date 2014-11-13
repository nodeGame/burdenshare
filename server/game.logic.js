var path = require('path');
var channel = module.parent.exports.channel;
var ngc = require('nodegame-client');
var stepRules = ngc.stepRules;
var GameStage = ngc.GameStage;
var J = ngc.JSUS;

var counter = 0;
var PLAYING_STAGE = 1;

//Round 1 of 4 is a test round

var DUMP_DIR = path.resolve(__dirname, '..', '/data');

/////////////////////////// mongoDB ///////////////////////////
// 1. Setting up database connection.
var Database = require('nodegame-db').Database;

// Open the collection where the categories will be stored.
var mdbWrite_idData, mdbWrite, mdbWrite_questTime, mdbWrite_gameTime, mdbGetProfit,
mdbCheckData, mdbDelet, mdbDeletTime, mdbWriteProfit, mdbCheckProfit,
mdbgetInitEndow, mdbInstrTime;


// Here we export the logic function. Receives three parameters:
// - node: the NodeGameClient object.
// - channel: the ServerChannel object in which this logic will be running.
// - gameRoom: the GameRoom object in which this logic will be running.
module.exports = function(node, channel, gameRoom, treatmentName, settings) {

    var REPEAT, MIN_PLAYERS;

    // Requiring additiinal functions.
    var cbs = require(__dirname + '/includes/logic.callbacks.js')

    // Client game to send to reconnecting players.
    var client = require(gameRoom.gamePaths.player)(gameRoom,
                                                    treatmentName,
                                                    settings);


    // Reads in descil-mturk configuration.
    var basedir = channel.resolveGameDir('burdenRAHR');
    var confPath = basedir + '/auth/descil.conf.js';
    var dk = require('descil-mturk')();
    var settings = require(basedir + '/server/game.settings.js');


    // Load code database
    if (settings.AUTH !== 'none') {
        dk.readConfiguration(confPath);
        if (settings.AUTH === 'remote') {
            dk.getCodes(function() {
                if (!dk.codes.size()) {
                    throw new Error('game.logic: no codes found.');
                }
            });
        }
        else {
            dk.readCodes(function() {
                if (!dk.codes.size()) {
                    throw new Error('game.logic: no codes found.');
                }
            });
        }
    }

    // Import the stager.
    var gameSequence = require(__dirname + '/game.stages.js')(settings);
    var stager = ngc.getStager(gameSequence);

    // Settings variables.

    REPEAT = settings.REPEAT;
    MIN_PLAYERS = settings.N_PLAYERS;

    //The stages / steps of the logic are defined here
    // but could be loaded from the database
    stager.setOnInit(function() {
        console.log('********************** Burden-Sharing-Control - SessionID: ' +
                    gameRoom.name);

	++counter;

	var disconnectedState;

        // Register player disconnection, and wait for him...
        node.on.pdisconnect(function(p) {
            dk.updateCode(p.id, {
                disconnected: true,
                // stage: p.stage
                stage: node.player.stage

            });
            console.log('Disconnection in Stage: ' + node.player.stage);
            dk.decrementUsage(p.id);
        });

	var disconnected;
	disconnected = {};

        // Clearing timeout on the client's browser window.
        node.on.pconnect(function(p) {
            node.say("CLEAR_COUNTDOWN", p.id, 'clearCountDown');
        });

    function adjustProfits(msg) {
        var questionnaire = msg.data.questionnaire;
        var SVOChoices =  {
            1 :  {
                topRow :  [85, 85, 85, 85, 85, 85, 85, 85, 85],
                bottomRow :  [85, 76, 68, 59, 50, 41, 33, 24, 15]
            },
            2 :  {
                topRow :  [85, 87, 89, 91, 93, 94, 96, 98, 100],
                bottomRow :  [15, 19, 24, 28, 33, 37, 41, 46, 50]
            },
            3 :  {
                topRow :  [50, 54, 59, 63, 68, 72, 76, 81, 85],
                bottomRow :  [100, 98, 96, 94, 93, 91, 89, 87, 85]
            },
            4 :  {
                topRow :  [50, 54, 59, 63, 68, 72, 76, 81, 85],
                bottomRow :  [100, 89, 79, 68, 58, 47, 36, 26, 15]
            },
            5 :  {
                topRow :  [100, 94, 88, 81, 75, 69, 63, 56, 50],
                bottomRow :  [50, 56, 63, 69, 75, 81, 88, 94, 100]
            },
            6 :  {
                topRow :  [100, 98, 96, 94, 93, 91, 89, 87, 85],
                bottomRow :  [50, 54, 59, 63, 68, 72, 76, 81, 85]
            }
        };

        var selectedSVOQuestion = Math.floor(Math.random() * 6);
        var selectedOwnBonus = SVOChoices[selectedSVOQuestion].topRow[
            questionnaire[selectedSVOQuestion]];
        var selectedOtherBonus = SVOChoices[selectedSVOQuestion].bottomRow[
            questionnaire[selectedSVOQuestion]];
        node.game.pl
    }

	// Player reconnecting.
	// Reconnections must be handled by the game developer.
	node.on.preconnect(function(p) {

	    var code;
	    console.log('Oh...somebody reconnected!', p);
	    code = dk.codeExists(p.id);

	    if (!code) {
		console.log('game.logic: reconnecting player not found in ' +
			    'code db: ' + p.id);
		return;
	    }
	    if (!code.disconnected) {
		console.log('game.logic: reconnecting player that was not ' +
			    'marked disconnected: ' + p.id);
		return;
	    }

	    if (node.game.pl.exist(p)) {
		console.log("should not happen");
		console.log(p);
	    }

	    // Mark code as connected.
	    code.disconnected = false;

	    // Delete countdown to terminate the game.
	    clearTimeout(this.countdown);

	    // Notify other player he is back.
	    // TODO: add it automatically if we return TRUE? It must be done
	    // both in the alias and the real event handler
	    node.game.pl.each(function(player) {
		node.socket.send(node.msg.create({
		    target: 'PCONNECT',
		    data: p,
		    to: player.id
		}));
	    });

	    // Send currently connected players to reconnecting.
	    node.socket.send(node.msg.create({
		target: 'PLIST',
		data: node.game.pl.db,
		to: p.id
	    }));

	    // We could slice the game plot, and send just what we need
	    // however here we resend all the stages, and move their game plot.
	    console.log('** Player reconnected: ' + p.id + ' **');
	    // Setting metadata, settings, and plot.
	    node.remoteSetup('game_metadata',  p.id, client.metadata);
	    node.remoteSetup('game_settings', p.id, client.settings);
	    node.remoteSetup('plot', p.id, client.plot);
	    node.remoteSetup('env', p.id, client.env);

	    var RECON_STAGE = node.player.stage;
	    // console.log(RECON_STAGE);
	    // console.log(GameStage.compare(node.player.stage, '2.2.1'));

	    if (!GameStage.compare(node.player.stage, '2.2.1') ||
		!GameStage.compare(node.player.stage, '2.2.2') ||
		!GameStage.compare(node.player.stage, '2.2.3')) {

		RECON_STAGE = node.game.plot.previous(RECON_STAGE);
	    }
	    else if (!GameStage.compare(node.player.stage, '2.3.1') ||
		     !GameStage.compare(node.player.stage, '2.3.2') ||
		     !GameStage.compare(node.player.stage, '2.3.3')) {

		RECON_STAGE = node.game.plot.jump(RECON_STAGE, -2);
	    }

	    // Start the game on the reconnecting client.
	    node.remoteCommand('start', p.id);
	    // Pause the game on the reconnecting client, will be resumed later.
	    // node.remoteCommand('pause', p.id);

	    // It is not added automatically.
	    // TODO: add it automatically if we return TRUE? It must be done
	    // both in the alias and the real event handler
	    node.game.pl.add(p);

	    // Pause the game on the reconnecting client, will be resumed later.
	    //node.remoteCommand('pause', p.id);

            if (!node.game.checkPlistSize()) {
                console.log('Player reconnected, but not yet enough players');
                return;
            }

            // The client pauses itself if there aren't enough players, so this
            // has to come after checkPlistSize (this is the last player
            // reconnecting):
            // node.remoteCommand('pause', p.id);

	    // Move logic to previous stage.
	    node.game.gotoStep(RECON_STAGE);

	    if (!GameStage.compare(node.player.stage, '3.1.1')) {
	        node.remoteCommand('goto_step', p.id, RECON_STAGE);

	        // IF ALREADY CHECKOUT
		// console.log("Has checked out: " + code.checkout);
		if (code.checkout) {
		    node.say("win", p.id, code.ExitCode);
		}
	    }

	    else {
		// Will send all the players to current stage
		// (also those who were there already).
		// node.remoteCommand('goto_step', 'ALL', node.player.stage);
		node.remoteCommand('goto_step', 'ALL', RECON_STAGE);
		setTimeout(function() {
		    // Pause the game on the reconnecting client, will be resumed later.
		    //  node.remoteCommand('pause', p.id);
		    // Unpause ALL players
		    node.game.pl.each(function(player) {
		        if (player.id !== p.id) {
		            node.remoteCommand('resume', player.id);
		        }
		    });
		}, 1000);
	    }
	    //Clear the Count Down in the index.htm
	    setTimeout(function() {
		node.say("CLEAR_COUNTDOWN", p.id, 'clearCountDown');
	    }, 3000);
	});

	console.log('init');

        // Open DB connections only when the first LOGIC client is created.
	if (!mdbWrite_idData) {
	    /////////////////////////// mongoDB ///////////////////////////
	    // 1. Setting up database connection.
	    ngdb = new Database(node);

	    // Open the collection where the categories will be stored.
	    mdbWrite_idData = ngdb.getLayer('MongoDB', {
		dbName: 'burden_sharing_rahr80',
		collectionName: 'bsc_idData'
	    });

            cbs.decorateMongoObj(mdbWrite_idData);

	    mdbWrite = ngdb.getLayer('MongoDB', {
		dbName: 'burden_sharing_rahr80',
		collectionName: 'bsc_data'
	    });

            cbs.decorateMongoObj(mdbWrite);

	    mdbWrite_questTime = ngdb.getLayer('MongoDB', {
		dbName: 'burden_sharing_rahr80',
		collectionName: 'bsc_questTime'
	    });

            cbs.decorateMongoObj(mdbWrite_questTime);

	    mdbWrite_gameTime = ngdb.getLayer('MongoDB', {
		dbName: 'burden_sharing_rahr80',
		collectionName: 'bsc_gameTime'
	    });

            cbs.decorateMongoObj(mdbWrite_gameTime);

	    mdbGetProfit = ngdb.getLayer('MongoDB', {
		dbName: 'burden_sharing_rahr80',
		collectionName: 'bsc_data'
	    });

            cbs.decorateMongoObj(mdbGetProfit);

	    mdbCheckData = ngdb.getLayer('MongoDB', {
		dbName: 'burden_sharing_rahr80',
		collectionName: 'bsc_data'
	    });

            cbs.decorateMongoObj(mdbCheckData);

	    mdbDelet = ngdb.getLayer('MongoDB', {
		dbName: 'burden_sharing_rahr80',
		collectionName: 'bsc_data'
	    });

            cbs.decorateMongoObj(mdbDelet);


	    mdbDeletTime = ngdb.getLayer('MongoDB', {
		dbName: 'burden_sharing_rahr80',
		collectionName: 'bsc_gameTime'
	    });

            cbs.decorateMongoObj(mdbDeletTime);

	    mdbWriteProfit = ngdb.getLayer('MongoDB', {
		dbName: 'burden_sharing_rahr80',
		collectionName: 'bsc_profit'
	    });

            cbs.decorateMongoObj(mdbWriteProfit);

	    mdbCheckProfit = ngdb.getLayer('MongoDB', {
		dbName: 'burden_sharing_rahr80',
		collectionName: 'bsc_profit'
	    });

            cbs.decorateMongoObj(mdbCheckProfit);

	    mdbgetInitEndow = ngdb.getLayer('MongoDB', {
		dbName: 'burden_sharing_rahr80',
		collectionName: 'bsc_idData'
	    });

            cbs.decorateMongoObj(mdbgetInitEndow);

	    mdbInstrTime = ngdb.getLayer('MongoDB', {
		dbName: 'burden_sharing_rahr80',
		collectionName: 'bsc_instrTime'
	    });

            cbs.decorateMongoObj(mdbInstrTime);

	    // Opening the database for writing the profit data.
	    mdbWriteProfit.connect(function() {});
	    // Opening the database for writing the resultdata.
	    mdbWrite.connect(function() {});
	    // Check if data for current round already exist
	    mdbCheckData.connect(function() {});
	    // Delete already existing data in case of a reconnection
	    mdbDelet.connect(function() {});
	    // Check if profit data already exist
	    mdbCheckProfit.connect(function() {});
	    // Opening the database for retrieveing the profit of each player.
	    mdbGetProfit.connect(function() {});
	    mdbgetInitEndow.connect(function() {});
	}

	// mdbInstrTime.connect(function() {});
	node.on.data('bsc_instrTime', function(msg) {
	    //checking if game time has been saved already
	    bsc_check_instrData = mdbInstrTime.checkData(msg.data, function(rows, items) {
                var currentRound = items;
		if (currentRound == '') {
		    mdbInstrTime.store(msg.data);
		}
		else {
		    // if data already exists do nothing
		}
	    });
	});
	node.on.data('bsc_instrTimeUpdate', function(msg) {
	    mdbInstrTime.update(msg.data);
	});

	node.on.data('Write_Profit', function(msg) {
	    console.log('Writing Profit Data!!!');
	    mdbWriteProfit.store(msg.data);
	});

	node.on.data('bsc_data', function(msg) {
	    console.log('Writing Result Data!!!');
	    mdbWrite.store(msg.data);
	});

	node.on.data('questionnaireAnswer', function(msg) {
	    console.log('Writing Questionnaire Answer!');
	    mdnWrite.store(msg.data)
	})

	function writePlayerData() {
	    var IDPlayer = node.game.pl.id.getAllKeys();
	    for(var i = 0; i < IDPlayer.length; i++) {
		var idData = {
		    Player_ID: IDPlayer[i],
		    Session_ID: gameRoom.name
		};
		mdbWrite_idData.store(idData);
	    }
	}

	if (!mdbWrite_idData.activeCollection) {
	    // Opening the database for writing the id data.
	    mdbWrite_idData.connect(writePlayerData);
	}
	else {
	    writePlayerData();
	}

	node.on.data('check_Data', function(msg) {
	    bsc_check_data = mdbCheckData.checkData(msg.data, function(rows, items) {
                var currentRound = items;
		node.socket.send(node.msg.create({
		    text:'CheckData',
		    to: msg.data.Player_ID,
		    data: currentRound
		}));
	    });
	});

	// Delet data from the database
	node.on.data('delete_data', function(msg) {
	    mdbDelet.deleting(msg.data.Player_ID, msg.data.Current_Round);
	});

	// Check whether profit data has been saved already.
        // If not, save it, otherwise ignore it
	node.on.data('get_Profit', function(msg) {

            if (msg.data.questionnaire) {
                adjustProfits(msg);
                msg.data = msg.data.id;
            }

	    bsc_check_profit = mdbCheckProfit.checkProfit(msg.data,
	        function(rows, items) {

                    var prof = items;

		    if (prof[0] !== undefined) {
		        var profit_dat = {
			    Payout_Round: prof[0].Payout_Round,
			    Profit: prof[0].Amount_UCE
		        };
		        node.socket.send(node.msg.create({
			    text:'PROFIT',
			    to: msg.data,
			    data: profit_dat
		        }));
		    }
		    else {
		            bsc_data_table = mdbGetProfit.getCollectionObj(msg.data,
                        function(rows, items) {
                            var profit = items;
                            console.log(profit);
                            var nbrRounds;
                            if (profit.length > 1 && profit.length <= 4) {
                                nbrRounds = profit.length - 1;
                            }
                            else if (profit.length > 4) {
                                nbrRounds = 4 - 1;
                            }
                            else {
                                nbrRounds = 0;
                            }
                            console.log("Number Rounds: " + nbrRounds);
                            if (nbrRounds >= 1) {
                                var payoutRound = Math.floor((Math.random()*nbrRounds) + 2);
                                var write_profit = {
	                            Player_ID: msg.data,
	                            Payout_Round: payoutRound,
	                            Amount_UCE: profit[payoutRound-1].Profit,
	                            Amount_USD: cbs.round((profit[payoutRound-1].Profit/50),2),
	                            Nbr_Completed_Rounds: nbrRounds
                                };
                                console.log('Writing Profit Data!!!');
                                mdbWriteProfit.store(write_profit);


                                var profit_data = {
	                                Payout_Round: payoutRound,
	                                Profit: profit[payoutRound-1].Profit
                                };

                                node.socket.send(node.msg.create({
	                                text:'PROFIT',
	                                to: msg.data,
	                                data: profit_data
                                }));
                            }
                            else {
                                var write_profit = {
	                                Player_ID: msg.data,
	                                Payout_Round: "none",
	                                Amount_UCE: "none",
	                                Amount_USD: "show up fee: 1.00 $",
	                                Nbr_Completed_Rounds: 0
                                };
                                console.log('Writing Profit Data!!!');
                                mdbWriteProfit.store(write_profit);
                                var profit_data = {
	                                Payout_Round: "none",
	                                Profit: "show up fee"
                                };

                                node.socket.send(node.msg.create({
	                                text:'PROFIT',
	                                to: msg.data,
	                                data: profit_data
                                }));
                            }
                        }
                    );
		        }
	        }
        );
	});

	// Opening the database for writing the game time.
	// mdbWrite_gameTime.connect(function() {});

	node.on.data('bsc_gameTime', function(msg) {
	    //checking if game time has been saved already
	    bsc_check_data = mdbCheckData.checkData(msg.data, function(rows, items) {
                var currentRound = items;
		if (currentRound == '') {
		    mdbWrite_gameTime.store(msg.data);
		}
		else {
		    // first delete and then save new data
		    mdbDeletTime.deleting(msg.data.Player_ID, msg.data.Current_Round);
		    mdbWrite_gameTime.store(msg.data);
		}
	    });
	});

	// Opening the database for writing the time.
	// mdbWrite_questTime.connect(function() {});

	node.on.data('bsc_questionnaireTime', function(msg) {
	    console.log('Writing Time Questionaire!!!');
	    mdbWrite_questTime.store(msg.data);
	});

	node.on.data('bsc_questTime', function(msg) {
	    mdbWrite_questTime.update(msg.data);
	});

	node.on.data("econGrowth", function(msg) {
	    mdbWrite_idData.update(msg.data)
	});

	node.on.data("initEndow", function(msg) {
	    mdbWrite_idData.updateEndow(msg.data)
	});

	node.on.data('get_InitEndow', function(msg) {
	    bsc_get_initEndow = mdbgetInitEndow.getInitEndow(msg.data.otherPlayerId, function(rows, items) {
                var endow = items;
		if (endow[0] !== undefined) {
		    var init_vals = {
			init_Endow: endow[0].Initial_Endowment,
			cl_Risk: endow[0].Climate_Risk
		    };
		    node.socket.send(node.msg.create({
			text:'Endow',
			to: msg.data.ownPlayerId,
			data: init_vals
		    }));
		}
		else {
		    node.socket.send(node.msg.create({
			text:'Endow',
			to: msg.data.ownPlayerId,
			data:'We are sorry. The endowment can not be shown.'
		    }));
		}
	    });
	});

        /////////////////////////// mongoDB ///////////////////////////

	var IDPlayer = node.game.pl.id.getAllKeys();
	for(var i = 0; i < IDPlayer.length; i++) {
	    var idData = {
		Player_ID: IDPlayer[i],
		Session_ID: gameRoom.name
	    };
	    node.set('bsc_idData',idData);
	}
	node.on.data('bsc_surveyID', function(msg) {
	    mdbWrite_idData.update(msg.data);
	});

	node.on.data("QUEST_OVER", function(msg) {

	});

    });

    function notEnoughPlayers() {
	console.log('Warning: not enough players!!');
        node.timer.setTimestamp('burden_paused');
	this.countdown = setTimeout(function() {
	    console.log('Countdown fired. Going to Step: questionnaire.');
	    node.remoteCommand('resume', 'ALL');
	    // if syncStepping = false
	    node.remoteCommand('goto_step', 'ALL', '3.1');
	    node.game.gotoStep(new GameStage('3.1'));
	}, 60000);
    }

    // Set default step rule.
    stager.setDefaultStepRule(stepRules.OTHERS_SYNC_STEP);

    stager.extendStep('instructions', {
	cb: function() {
	    console.log('********************** Instructions - SessionID: ' +
                        gameRoom.name);

	    var players, groups, proposer, respondent;
	    //            players = node.game.pl.fetch();
	    // node.game.groups = node.game.pl.getNGroups(2);
	    node.game.groups = [[],[]];
	    var playerIDs = node.game.pl.id.getAllKeys();
	    node.game.playerID = J.shuffle(playerIDs);

	    node.game.groups[0][0] = node.game.playerID[0];
	    node.game.groups[0][1] = node.game.playerID[1];
	    node.game.groups[1][0] = node.game.playerID[2];
	    node.game.groups[1][1] = node.game.playerID[3];

	    console.log("Show Groups 1: ");
	    console.log(node.game.groups[0][0]);
	    console.log(node.game.groups[0][1]);
	    console.log("Show Groups 2: ");
	    console.log(node.game.groups[1][0]);
	    console.log(node.game.groups[1][1]);
	},
	minPlayers: [ MIN_PLAYERS, notEnoughPlayers ]
    });

    stager.addStep({
	id: 'syncGroups',
	cb: function() {
	    console.log('********************** Syncing all Players - SessionID: ' +
                        gameRoom.name);

	    node.on('in.say.DATA', function(msg) {
		if (msg.text === 'Round_Over') {
		    console.log("Round: " + msg.data);

		    // Round 1 is a testround for the player
                    // (The same matching of players and groups in
                    // round 1 will be repeated in round 4)
		    // Round 1 will be evaluated

		    if (msg.data == 1) {
			node.game.groups[0][0] = node.game.playerID[0];
			node.game.groups[0][1] = node.game.playerID[1];
			node.game.groups[1][0] = node.game.playerID[2];
			node.game.groups[1][1] = node.game.playerID[3];

			for (var i = 0; i < node.game.groups.length; i++) {
			    group = node.game.groups[i];
			    var Props = {
				groupP: i+1,
				proposer: node.game.groups[i][0]
			    }
			    var Resps = {
				groupR: i+1,
				respondent: node.game.groups[i][1]
			    }
			    proposer = node.game.groups[i][0];
			    respondent = node.game.groups[i][1];

			    node.socket.send(node.msg.create({
				text:'RESPONDENT',
				to: respondent,
				data: Props
			    }));
			    node.socket.send(node.msg.create({
				text:'PROPOSER',
				to: proposer,
				data: Resps
			    }));
			}
		    }

		    else if (msg.data == 2) {
			node.game.groups[0][0] = node.game.playerID[0];
			node.game.groups[0][1] = node.game.playerID[2];
			node.game.groups[1][0] = node.game.playerID[1];
			node.game.groups[1][1] = node.game.playerID[3];

			for (var i = 0; i < node.game.groups.length; i++) {
			    group = node.game.groups[i];
			    var Props = {
				groupP: i+1,
				proposer: node.game.groups[i][0]
			    }
			    var Resps = {
				groupR: i+1,
				respondent: node.game.groups[i][1]
			    }
			    proposer = node.game.groups[i][0];
			    respondent = node.game.groups[i][1];

			    node.socket.send(node.msg.create({
				text:'RESPONDENT',
				to: respondent,
				data: Props
			    }));
			    node.socket.send(node.msg.create({
				text:'PROPOSER',
				to: proposer,
				data: Resps
			    }));
			}
		    }

		    else if (msg.data == 3) {
			node.game.groups[0][0] = node.game.playerID[3];
			node.game.groups[0][1] = node.game.playerID[0];
			node.game.groups[1][0] = node.game.playerID[1];
			node.game.groups[1][1] = node.game.playerID[2];

			for (var i = 0; i < node.game.groups.length; i++) {
			    group = node.game.groups[i];
			    var Props = {
				groupP: i+1,
				proposer: node.game.groups[i][0]
			    }
			    var Resps = {
				groupR: i+1,
				respondent: node.game.groups[i][1]
			    }
			    proposer = node.game.groups[i][0];
			    respondent = node.game.groups[i][1];

			    node.socket.send(node.msg.create({
				text:'RESPONDENT',
				to: respondent,
				data: Props
			    }));
			    node.socket.send(node.msg.create({
				text:'PROPOSER',
				to: proposer,
				data: Resps
			    }));
			}
		    }
		    else if (msg.data == 4) {
			node.game.groups[0][0] = node.game.playerID[0];
			node.game.groups[0][1] = node.game.playerID[1];
			node.game.groups[1][0] = node.game.playerID[2];
			node.game.groups[1][1] = node.game.playerID[3];

			for (var i = 0; i < node.game.groups.length; i++) {
			    group = node.game.groups[i];
			    var Props = {
				groupP: i+1,
				proposer: node.game.groups[i][0]
			    }
			    var Resps = {
				groupR: i+1,
				respondent: node.game.groups[i][1]
			    }
			    proposer = node.game.groups[i][0];
			    //            console.log(proposer);
			    respondent = node.game.groups[i][1];
			    //            console.log(proposer);

			    node.socket.send(node.msg.create({
				text:'RESPONDENT',
				to: respondent,
				data: Props
			    }));
			    node.socket.send(node.msg.create({
				text:'PROPOSER',
				to: proposer,
				data: Resps
			    }));
			}
		    }
		}
	    });
	},
    });


    stager.addStep({
	id: "initialSituation",
	cb: function() {
	    console.log('********************** Initial Situation - SessionID: ' +
                        gameRoom.name);
	},
    });

    stager.addStep({
	id: "decision",
	cb: function() {
	    var round = node.player.stage.round;
	    console.log('********************** Burden-Sharing-Control stage ' +
                        round + ' - SessionID: ' + gameRoom.name);
	}
    });

    stager.extendStage('burdenSharingControl', {
	steps: ["syncGroups", "initialSituation", "decision"],
	minPlayers: [ MIN_PLAYERS, notEnoughPlayers ],
	stepRule: node.stepRules.SYNC_STAGE
    });

    stager.extendStep('questionnaire', {
	cb: function() {
	    node.on("in.say.DATA", function(msg) {
		if (msg.text === "QUEST_DONE") {
		    console.log("Bonus: " + msg.data);
		    var code = dk.codes.id.get(msg.from);
		    code.checkout = true;
		    dk.checkOut(code.AccessCode, code.ExitCode, msg.data);
		    node.say("win", msg.from, code.ExitCode);
		}
	    });
	    console.log('********************** Questionaire - SessionID: ' +
                        gameRoom.name);
	}
    });

    return {
	nodename: 'lgc' + counter,
	game_metadata: {
	    name: 'burdenSharingControl',
	    version: '0.0.1'
	},
	game_settings: {
	    publishLevel: 0,
	    syncStepping: false
	},
	plot: stager.getState(),
	debug: true,
	verbosity: 0
    };
};
