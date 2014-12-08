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
module.exports = function(gameRoom, treatmentName, settings) {
    var gameSequence, stager;

    // Import the stager.
    gameSequence = require(__dirname + '/game.stages.js')(settings);
    stager = ngc.getStager(gameSequence);

    var game = {};
    var cbs = require(__dirname + '/includes/client.callbacks.js');

    stager.setOnInit(cbs.init);

    stager.extendStep('instructions', {
        cb: cbs.instructions,
        minPlayers: [ 4, cbs.notEnoughPlayers ],
        steprule: stepRules.SYNC_STAGE,
        syncOnLoaded: false,
        done: cbs.clearFrame
    });

    stager.addStep({
        id: "initialSituation",
        cb: cbs.initialSituation,
        stepRule: cbs.syncGroup,
        timer: {
            milliseconds: settings.timer.initialSituation,
            update: 1000,
            timeup: function() {

                node.game.timer.stop();
                node.game.timeInitialSituation =
                    Math.round(Math.abs(node.game.timeInitialSituation - Date.now())/1000);
                node.game.timeInitialSituationResp =
                    Math.round(Math.abs(node.game.timeInitialSituationResp - Date.now())/1000);

                // TODO what is this for????
                var timeInitialSituation = {
                    timeInitialSituation: node.game.timeInitialSituation
                };

                node.emit('DONE');
            },
        }
    });

    stager.addStep({
        id: "decision",
        cb: cbs.decision,
        stepRule: cbs.syncGroup
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
        stepRule: cbs.syncGroup
    });

    stager.extendStage('burdenSharingControl', {
        steps: ["syncGroups", "initialSituation", "decision"],
        minPlayers: [ 4, cbs.notEnoughPlayers ],
        steprule: stepRules.SYNC_STEP,
        done: cbs.clearFrame
    });

    stager.extendStep('questionnaire', {
        cb: cbs.questionnaire
    });

    stager.setDefaultGlobals({
        round: cbs.round,
        gameName: settings.GAME_NAME,
        chosenTreatment: settings.CHOSEN_TREATMENT,
        costGE: settings.COSTGE,
        timer: settings.timer,
        buildTables: cbs.buildTables,
        checkID: cbs.checkID,
        checkEntry: cbs.checkEntry,
        writeCatastrophe: cbs.writeCatastrophe,
        writeNoCatastrophe: cbs.writeNoCatastrophe,
        writeOfferRejected: cbs.writeOfferRejected,
        writeOfferAccepted: cbs.writeOfferAccepted,
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
