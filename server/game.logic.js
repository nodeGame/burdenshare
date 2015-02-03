var path = require('path');
var channel = module.parent.exports.channel;
var ngc = require('nodegame-client');
var stepRules = ngc.stepRules;
var GameStage = ngc.GameStage;
var J = ngc.JSUS;

var counter = 0;
var PLAYING_STAGE = 1;

// Round 1 of 4 is a test round.

var DUMP_DIR = path.resolve(__dirname, '..', '/data');

// Here we export the logic function. Receives three parameters:
// - node: the NodeGameClient object.
// - channel: the ServerChannel object in which this logic will be running.
// - gameRoom: the GameRoom object in which this logic will be running.
module.exports = function(node, channel, gameRoom, treatmentName, settings) {

    var REPEAT, MIN_PLAYERS;

    // Client game to send to reconnecting players.
    var client = require(gameRoom.gamePaths.player)(gameRoom,
                                                    treatmentName,
                                                    settings);

    // Reads in descil-mturk configuration.
    var dk = require('descil-mturk')();

    // Requiring additiinal functions.
    var cbs = channel.require(__dirname + '/includes/logic.callbacks.js', {
        ngc: ngc,
        client: client,
        dk: dk,
        settings: settings,
        gameRoom: gameRoom,
        node: node
    }, true);


    // Import the stager.
    var gameSequence = require(__dirname + '/game.stages.js')(settings);
    var stager = ngc.getStager(gameSequence);


    // DBS functions.
    // Objects were created and cached in previous call in game.room.
    var dbs = require(__dirname + '/game.db.js');

    // Settings variables.

    REPEAT = settings.REPEAT;
    MIN_PLAYERS = settings.N_PLAYERS;

    //The stages / steps of the logic are defined here
    // but could be loaded from the database
    stager.setOnInit(function() {
        console.log('********************** Burden-Sharing-Control - SessionID: ' +
                    gameRoom.name);

        console.log('init');

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
        });

        var disconnected;
        disconnected = {};


        // Adds treatment name to incoming SET messages.
        // Must be registered before other listeners.
        node.on('in.set.DATA', function(msg) {
            msg.data.treatment = treatmentName;
            msg.data.costGE = settings.COSTGE;
        });

        // Clearing timeout on the client's browser window.
        node.on.pconnect(function(p) {
            node.say("CLEAR_COUNTDOWN", p.id, 'clearCountDown');
        });

        function addQuestionnaireBonus(msg) {
            dbs.mdbCheckProfit.checkProfit(msg.data.player, function(rows, items) {
                // Adds to the profit a bonus depending on the
                // choice made in the SVO questionnaire block.
                var choicesMade = msg.data.choices;

                // TODO: This is a direct copy-paste from the context file for the html
                // page used in the experiment. This should not be hard-coded.
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

                var profit =  items[0];

                // Selecting one of the own choices at random.
                var selectedRound = Math.floor(Math.random() *
                    choicesMade.length) + 1;

                var bonusFromSelf = SVOChoices[selectedRound].topRow[
                    choicesMade[selectedRound]
                ];

                var bonusToOther = SVOChoices[selectedRound].bottomRow[
                    choicesMade[selectedRound]
                ];

                if('undefined' === typeof node.game.pl.otherBonus) {
                    node.game.pl.otherBonus = [];
                }

                node.game.pl.otherBonus[
                    node.game.pl.id.resolve[msg.data.player]
                ] = bonusToOther;


                var newAmountUCE = profit.Amount_UCE + bonusFromSelf;
                var newAmountUSD = cbs.round((newAmountUCE/50),2);

                dbs.mdbWriteProfit.update({
                    playerID: {
                        "Player_ID": msg.data.player
                    },
                    add: {
                        SelfBonus_UCE: bonusFromSelf,
                    },
                });

                dbs.mdbWriteProfit

                node.socket.send(node.msg.create({
                    text: 'ADDED_QUESTIONNAIRE_BONUS',
                    to: msg.data.player,
                    data: {
                        oldAmountUCE: profit.Amount_UCE,
                        newAmountUCE: newAmountUCE,
                        newAmountUSD: newAmountUSD
                    }
                }));
            });
        }

        // Player reconnecting.
        // Reconnections must be handled by the game developer.
        node.on.preconnect(cbs.playerReconnects);


        // dbs.mdbInstrTime.connect(function() {});
        node.on.data('bsc_instrTime',function(msg) {
            // Checking if game time has been saved already.
            bsc_check_instrData = dbs.mdbInstrTime.checkData(msg.data, function(rows, items) {
                var currentRound = items;
                if (currentRound === '') {
                    dbs.mdbInstrTime.store(msg.data);
                }
            });
        });

        node.on.data('bsc_instrTimeUpdate',function(msg) {
            dbs.mdbInstrTime.update(msg.data);
        });

        node.on.data('add_questionnaire_bonus', function(msg) {
            console.log('adding questionnaire bonus');
            addQuestionnaireBonus(msg);
        });
        node.on.data('bsc_data',function(msg) {
            console.log('Writing Result Data!!!');
            dbs.mdbWrite.store(msg.data);
        });

        node.on.data('questionnaireAnswer', function(msg) {
            console.log('Writing Questionnaire Answer!');
            mdnWrite.store(msg.data);
        });

        function writePlayerData() {
            var IDPlayer = node.game.pl.id.getAllKeys();
            for (var i = 0; i < IDPlayer.length; i++) {
                var idData = {
                    Player_ID: IDPlayer[i],
                    Session_ID: gameRoom.name,
                    treatment: treatmentName,
                    costGE: settings.COSTGE
                };
                dbs.mdbWrite_idData.store(idData);
            }
        }

        writePlayerData();

        node.on.data('check_Data',function(msg) {
            bsc_check_data = dbs.mdbCheckData.checkData(msg.data, function(rows, items) {
                var currentRound = items;
                node.socket.send(node.msg.create({
                    text:'CheckData',
                    to: msg.data.Player_ID,
                    data: currentRound
                }));
            });
        });

        // Delet data from the database
        node.on.data('delete_data',function(msg) {
            dbs.mdbDelet.deleting(msg.data.Player_ID, msg.data.Current_Round);
        });

        // Check whether profit data has been saved already.
        // If not, save it, otherwise ignore it
        node.on.data('get_Profit',function(msg) {
            dbs.mdbCheckProfit.checkProfit(msg.data, function(rows, items) {
                var prof = items;

                if (typeof prof[0] !== 'undefined') {
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
                    dbs.mdbGetProfit.getCollectionObj(msg.data,
                                                      function(rows, items) {

                            var profit, nbrRounds, write_profit, profit_data;
                            var payoutRound;

                            profit = items;
                            console.log(profit);

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

                            write_profit = {
                                treatment: treatmentName,
                                costGE: settings.COSTGE,
                                Player_ID: msg.data
                            };

                            if (nbrRounds >= 1) {
                                payoutRound = Math.floor((Math.random()*nbrRounds) + 2);

                                J.mixin(write_profit, {
                                    Payout_Round: payoutRound,
                                    Amount_UCE: profit[payoutRound-1].Profit,
                                    Amount_USD: cbs.round((profit[payoutRound-1].Profit/50),2),
                                    Nbr_Completed_Rounds: nbrRounds,
                                });

                                profit_data = {
                                    Payout_Round: payoutRound,
                                    Profit: profit[payoutRound-1].Profit
                                };
                            }
                            else {
                                J.mixin(write_profit, {
                                    Payout_Round: "none",
                                    Amount_UCE: "none",
                                    Amount_USD: "show up fee: 1.00 $",
                                    Nbr_Completed_Rounds: 0
                                });

                                profit_data = {
                                    Payout_Round: "none",
                                    Profit: "show up fee"
                                };
                            }

                            console.log('Writing Profit Data!!!');
                            dbs.mdbWriteProfit.store(write_profit);

                            // Sending to client.
                            node.socket.send(node.msg.create({
                                text:'PROFIT',
                                to: msg.data,
                                data: profit_data
                            }));

                        }
                    );
                }
            });
        });

        node.on.data('bsc_gameTime',function(msg) {
            //checking if game time has been saved already
            bsc_check_data = dbs.mdbCheckData.checkData(msg.data, function(rows, items) {
                var currentRound = items;
                if (currentRound === '') {
                    dbs.mdbWrite_gameTime.store(msg.data);
                }
                else {
                    // first delete and then save new data
                    dbs.mdbDeletTime.deleting(msg.data.Player_ID, msg.data.Current_Round);
                    dbs.mdbWrite_gameTime.store(msg.data);
                }
            });
        });

        node.on.data('bsc_questionnaireTime',function(msg) {
            console.log('Writing Time Questionaire!!!');
            dbs.mdbWrite_questTime.store(msg.data);
        });

        node.on.data('bsc_questTime',function(msg) {
            dbs.mdbWrite_questTime.update(msg.data);
        });

        node.on.data("econGrowth", function(msg) {
            dbs.mdbWrite_idData.update(msg.data);
        });

        node.on.data("initEndow", function(msg) {
            dbs.mdbWrite_idData.updateEndow(msg.data);
        });

        node.on.data('get_InitEndow',function(msg) {
            bsc_get_initEndow = dbs.mdbgetInitEndow.getInitEndow(msg.data.otherPlayerId, function(rows, items) {
                var endow = items;
                if (!J.isEmpty(endow[0])) {
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
            dbs.mdbWrite_idData.update(msg.data);
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
        }, settings.timer.notEnoughPlayers);
    }

    // Adds an 'other'-bonus to all players and calls dk.checkOut iff all
    // players have had their codes checked-out.
    function adjustPayoffAndCheckout() {
        var i, checkoutFlag;
        var currentCode, profit;
        var idList = [];
        checkoutFlag = true;
        // Check whether all players codes have been checked-out.
        for (i = 0; i < node.game.pl.size(); ++i) {
            idList[i] = node.game.pl.db[i].id;
            try {
                currentCode =
                    dk.codes.id.get(idList[i]);
            }
            catch(e) {
                console.log("Questionnaire: QUEST_DONE: \n" +
                    "Player: " + idList[i] + "\n" +
                    "dk.code does not exist!");
            }
            checkoutFlag = checkoutFlag && !!currentCode.checkout;
        }
        if (checkoutFlag) {
            if (!node.game.pl.checkout) {
                node.game.pl.checkout = true;

                // Gets profit for all players.
                dbs.mdbCheckProfit.checkProfit({ $in : idList},
                    function(rows, items) {

                    var j;
                    var bonus;
                    var code;
                    var idResolve = node.game.pl.id.resolve;
                    var otherBonus = node.game.pl.otherBonus || [];
                    var otherPlayer = [];
                    var postPayoffs = [];
                    var bonusFromOther;
                    var bonusFromSelf;
                    var writeProfitUpdate;

                    for (i = 0; i < idList.length; ++i) {
                        code = dk.codes.id.get(idList[i]);
                        bonus = items[i].Amount_UCE;

                        // Adding the bonusToOther from the next player in the
                        // list.
                        // If player has finished SVO questionnaire:
                        if ('undefined' !==
                                typeof otherBonus[idResolve[idList[i]]]) {

                            bonusFromSelf = items[i].SelfBonus_UCE;
                            bonus += bonusFromSelf;

                            for (j = 1; j <= idList.length; ++j) {
                                otherPlayer = idResolve[
                                    idList[(i+j)%idList.length]];

                                if ('undefined' !==
                                        typeof otherBonus[otherPlayer]) {

                                    bonusFromOther = otherBonus[otherPlayer];
                                    bonus += bonusFromOther;
                                    break;
                                }
                            }
                            writeProfitUpdate = {
                                OtherBonus_UCE: bonusFromOther
                            };
                        }
                        else {
                            writeProfitUpdate = {
                                OtherBonus_UCE: "NA",
                                SelfBonus_UCE: "NA"
                            };
                        }

                        profit = cbs.round((bonus/50),2);

                        dbs.mdbWriteProfit.update({
                            playerID: {
                                "Player_ID": idList[i]
                            },
                            add: writeProfitUpdate
                        });

                        postPayoffs[i] = {
                            "AccessCode": code.AccessCode,
                            "Bonus": profit,
                            "BonusReason": "Full Bonus"
                        };
                    }
                    dk.postPayoffs(postPayoffs, function(err, response, body) {
                        if (err) {
                            console.log("adjustPayoffAndCheckout: " +
                                "dk.postPayoff: " + err);
                        };
                    });
                });

            }
        }
    }

    // Set default step rule.
    stager.setDefaultStepRule(stepRules.OTHERS_SYNC_STEP);

    stager.extendStep('instructions', {
        cb: function() {
            console.log('********************** Instructions - SessionID: ' +
                            gameRoom.name);

            var players, groups, proposer, respondent;
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
                            };
                            var Resps = {
                                groupR: i+1,
                                respondent: node.game.groups[i][1]
                            };
                            proposer = node.game.groups[i][0];
                            respondent = node.game.groups[i][1];

                            node.socket.send(node.msg.create({
                                text: 'RESPONDENT',
                                to: respondent,
                                data: Props
                            }));
                            node.socket.send(node.msg.create({
                                text: 'PROPOSER',
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
                            };
                            var Resps = {
                                groupR: i+1,
                                respondent: node.game.groups[i][1]
                            };
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
                            };
                            var Resps = {
                                groupR: i+1,
                                respondent: node.game.groups[i][1]
                            };
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
                            };
                            var Resps = {
                                groupR: i+1,
                                respondent: node.game.groups[i][1]
                            };
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
                }
            });
        },
    });


    stager.addStep({
        id: "initialSituation",
        cb: function() {
            console.log('********************** Initial Situation - SessionID: ' +
                gameRoom.name
            );
        }
    });

    stager.addStep({
        id: "decision",
        cb: function() {
            var round = node.player.stage.round;
            console.log('********************** Burden-Sharing-Control stage ' +
                round + ' - SessionID: ' + gameRoom.name
            );
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
                    // Checkout the player code.
                    var code = dk.codes.id.get(msg.from);
                    console.log("Checkout code of splayer" + msg.from);
                    code.checkout = true;

                    // If a player has disconnected, delay payoff and
                    // checkout by 10s to give time for reconnect.
                    if (node.game.pl.size() < MIN_PLAYERS) {
                        setTimeout(adjustPayoffAndCheckout, 10000);
                    }
                    else {
                        adjustPayoffAndCheckout();
                    }
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
        verbosity: 0
    };
};
