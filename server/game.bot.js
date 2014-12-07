/**
 * # Functions used by the Client of Burden-share Game
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * This file contains all the building blocks (functions, and configuration)
 * that will be sent to each connecting player.
 * 
 * http://www.nodegame.org
 */
var ngc = require('nodegame-client');
var stepRules = ngc.stepRules;
var constants = ngc.constants;

// Export the game-creating function. It needs the name of the treatment and
// its options.
module.exports = function(gameRoom, treatmentName, settings, node) {
    var gameSequence, stager;

    // Import the stager.
    gameSequence = require(__dirname + '/game.stages.js')(settings);
    stager = ngc.getStager(gameSequence);

    var game = {};

    function notEnoughPlayers() {
        node.game.pause();
    }

    function syncGroup(stage, myStageLevel, pl, game) {
        var p = node.game.pl.get(node.game.otherID);
        if (p.stageLevel === node.constants.stageLevels.DONE) {
            if (myStageLevel === node.constants.stageLevels.DONE) {
                return true;
            }
        }
    }

    stager.setOnInit(function() {

        var gameName = node.game.globals.gameName;
        var chosenTreatment = node.game.globals.chosenTreatment;

        // basic amount of own endowment (here 25). 
        node.game.endowment_own = 25;
        node.game.endowment_responder = 0;
        node.game.endowment_proposer = 0;
        // cost green house gas emmisions, two Versions: 30 or 80 ECU
        node.game.costGE = node.game.globals.costGE;
        // number of rounds including the test round
        node.game.nbrRounds = 4;
        // initialization first round
        node.game.currentRound = 0;
        // own player id
        node.game.ownID = node.player.id;
        // player id opponent
        node.game.otherID = node.game.pl.db[0].id;
        // offer made by person = 1, offer made by computer due to time out = 0
        node.game.decisionOffer = 0;
        // response made by person = 1, response made by computer due to time out = 0
        node.game.decisionResponse = 0;

        if (chosenTreatment === 'sa') {
            // counter: number of rounds during the self selection of risk and economic growth in the first part
            node.game.pgCounter = 0;
            node.game.EGRnd = [];
            // 3 levels (first index of array) of economic growth
            // for each chosen level a a number is selected randomly (second index of array)
            node.game.growth = [
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
                [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
            ];
        }

        // ground level of climate risk
        node.game.risk = 7.5;
        node.game.ClimateRisk = 0;
        // offer in each round of the game, used at the end of each round in a short question for the participant
        node.game.proposal = 0;
        // node.game.response is either "accept" or "reject", used at the end of each round in a short question for the participant
        node.game.response = '';

        node.on('RESPONSE_DONE', function(response, offer, from) {
            var catastrObj = {
                cc: 0,
                offer: offer
            };

            if (response === 'ACCEPT') {
                node.say('ACCEPT', node.game.otherID, catastrObj);
            }
            else {   
                catastrObj.remainEndowResp = node.game.endowment_responder;

                // A climate catastrophe will happen with a
                // probability of node.game.ClimateRisk.
                if (Math.random() <= (node.game.ClimateRisk/100)) {
                    // Climate catastrophy happened.                    
                    catastrObj.cc = 1;
                    catastrObj.remainEndowResp = node.game.endowment_responder/2;                        
                    cc = 1;
                }
                else {
                    // Climate catastrophy did not happen.
                    cc = 0;
                }

                node.say('REJECT',node.game.otherID, catastrObj);
            }

            // See if should write to DB as well.
            node.done();            
        });
    
        this.randomAccept = function(dataResp, other) {
            var accepted = Math.round(Math.random());
            node.game.decisionResponse = 0;
            if (accepted) {
                node.game.response = 'accept';
                node.emit('RESPONSE_DONE', 'ACCEPT', dataResp, other);
            }
            else {
                node.game.response = 'reject';
                node.emit('RESPONSE_DONE', 'REJECT', dataResp, other);
            }
        };

    });

    stager.extendStep('instructions', {
        cb: function() {
            var initEndow;
            var i, len;
            var randnum;
            var ind, rnd;
            var setDBEconGrowth;
            
            debugger

            if (node.game.globals.chosenTreatment === 'sa') {
                initEndow = {
                    playerID: {Player_ID: node.game.ownID},
                    addEndow: {
                        Initial_Endowment: node.game.endowment_own,
                        Climate_Risk: node.game.risk
                    }
                };
                node.game.pgCounter = 0;
                node.game.endowment_own = 25;
                node.game.risk = 7.5;
                initEndow.addEndow.Initial_Endowment = 0;
                initEndow.addEndow.Climate_Risk = 0;
                
                // node.set('initEndow', initEndow);

                i = 1, len = 6;
                for ( ; ++i < len ; ) {

                    randnum = Math.floor(1 + (Math.random()*3) );
                    node.game.EGRnd[i] = randnum;
                    switch(randnum) {
                    case 1: node.game.risk = node.game.risk + 0; break;
                    case 2: node.game.risk = node.game.risk + 2.5; break;
                    case 3: node.game.risk = node.game.risk + 5; break;
                    }

                    // Randomly chooses one of the values within
                    // the chosen economy growth level.
                    ind = node.game.EGRnd[i] - 1;
                    rnd = Math.floor(1 + (Math.random() * node.game.growth[ind].length)) - 1;
                    node.game.endowment_own = node.game.endowment_own + node.game.growth[ind][rnd];

                    setDBEconGrowth = {
                        playerID : {Player_ID: node.player.id}, 
                        add: {}
                    };                    
                    setDBEconGrowth.add['EGRnd'+i] = node.game.EGRnd[i];
                    
                    node.set("econGrowth", setDBEconGrowth);
                }

                initEndow.addEndow.Initial_Endowment = node.game.endowment_own;
                initEndow.addEndow.Climate_Risk = node.game.risk;
                node.set('initEndow', initEndow);
                node.game.pgCounter = 0;                
            }
            node.done();
        },
        minPlayers: [ 4, notEnoughPlayers ],
        steprule: stepRules.SYNC_STAGE,
        syncOnLoaded: false,
    });

    stager.addStep({
        id: "initialSituation",
        cb: function() {
            node.done();
        },
        stepRule: syncGroup,       
    });

    stager.addStep({
        id: "decision",
        cb: function() {
            if (node.game.role == 'PROPOSER') {
                debugger
                var randnum = Math.floor(1 + Math.random() * node.game.costGE);
                node.say('OFFER', node.game.otherID, randnum);
            }
            else {
                node.on.data('OFFER', this.randomAccept);
            }
        },
        stepRule: syncGroup
    });

    stager.addStep({
        id: "syncGroups",
        cb: function() {

            // Getting the player ID of the other player and the group number
            // depending on whether this player is the proposer or the responder
            // in the current round.
            node.on.data("PROPOSER", function(msg) {
                node.game.role = "PROPOSER";
                node.game.otherID = msg.data.respondent;
                node.game.nbrGroup = msg.data.groupR;
                node.done();
            });
            
            node.on.data("RESPONDENT", function(msg) {
                node.game.role = "RESPONDENT";
                node.game.otherID = msg.data.proposer;
                node.game.nbrGroup = msg.data.groupP;
                node.done();
            });
            
            node.socket.send(node.msg.create({
                to: 'ALL',
                text: 'Round_Over',
                data: node.player.stage.round
            }));
        },
        stepRule: syncGroup
    });

    stager.extendStage('burdenSharingControl', {
        steps: ["syncGroups", "initialSituation", "decision"],
        minPlayers: [ 4, notEnoughPlayers ],
        steprule: stepRules.SYNC_STEP
    });

    stager.extendStep('questionnaire', {
        cb: function() {
            node.done();
        }
    });

    stager.setDefaultGlobals({
        gameName: settings.GAME_NAME,
        chosenTreatment: settings.CHOSEN_TREATMENT,
        costGE: settings.COSTGE,     
    });

    //We serialize the game sequence before sending it
    game.plot = stager.getState();

    //Let's add the metadata information
    game.metadata = {
        name: 'burdenSharingControl',
        version: '0.1.0',
        session: 1,
        description: 'no descr'
    };

    //Other settings, optional
    game.settings = {
        publishLevel: 2
    };

    //auto: true = automatic run, auto: false = user input
    game.env = {
        auto: false
    };

    game.debug = settings.debug;

    game.verbosity = 1;

    game.window = {
        promptOnleave: !settings.debug
    };

    return game;
};
