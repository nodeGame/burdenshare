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
var publishLevels = constants.publishLevels;

// Export the game-creating function.
module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    var game = setup;

    var cbs = require(__dirname + '/includes/client.callbacks.js');

    stager.setOnInit(cbs.init);

    stager.extendStep('instructions', {
        cb: cbs.instructions,
        // Ste commented 19 june.
        // steprule: stepRules.SYNC_STAGE,
        syncOnLoaded: false,
        done: cbs.clearFrame
    });

// old:

//   stager.addStep({
//       id: "initialSituation",
//       cb: cbs.initialSituation,
//       // stepRule: cbs.syncGroup,
//       timer: {
//           milliseconds: settings.timer.initialSituation,
//           update: 1000,
//           timeup: function() {
//               node.game.timeInitialSituation =
//                   node.timer.getTimeSince('initialSituation');
//               node.done();
//           },
//       }
//   });
//
//   stager.addStep({
//       id: "decision",
//       cb: cbs.decision,
//       // stepRule: cbs.syncGroup
//   });
//
//   stager.addStep({
//       id: "syncGroups",
//       cb: function() {
//
//           // Getting the player ID of the other player and the group number
//           // depending on whether this player is the proposer or the responder
//           // in the current round.
//           node.on.data("PROPOSER", function(msg) {
//               node.game.role = "PROPOSER";
//               node.game.otherID = msg.data.respondent;
//               node.game.nbrGroup = msg.data.groupR;
//               node.done();
//           });
//
//           node.on.data("RESPONDENT", function(msg) {
//               node.game.role = "RESPONDENT";
//               node.game.otherID = msg.data.proposer;
//               node.game.nbrGroup = msg.data.groupP;
//               node.done();
//           });
//       },
//       // stepRule: cbs.syncGroup
//   });
//
//   stager.extendStage('burdenSharingControl', {
//       steps: ["syncGroups", "initialSituation", "decision"],
//       // Ste: commented 19 June.
//       // stepRule:  stepRules.SYNC_STEP,
//       done: cbs.clearFrame
//   });


// new:

    stager.extendStep("initialSituation", {
        cb: cbs.initialSituation,
        // stepRule: cbs.syncGroup,
        timer: {
            milliseconds: settings.timer.initialSituation,
            update: 1000,
            timeup: function() {
                node.game.timeInitialSituation =
                    node.timer.getTimeSince('initialSituation');
                node.done();
            }
        }
    });

    stager.extendStep("decision", {
        cb: cbs.decision,
        // stepRule: cbs.syncGroup
    });

    stager.extendStep("syncGroups", {
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
        },
        // stepRule: cbs.syncGroup
    });

    stager.extendStage('burdenSharingControl', {
        // steps: ["syncGroups", "initialSituation", "decision"],
        // Ste: commented 19 June.
        // stepRule:  stepRules.SYNC_STEP,
        done: cbs.clearFrame
    });

    stager.extendStep('questionnaire', {
        cb: cbs.questionnaire,
        globals: {
            makeChoiceTD: cbs.makeChoiceTD,
            makeChoiceTDRow: cbs.makeChoiceTDRow,
            makeChoiceSPAN: cbs.makeChoiceSPAN,
            makeChoiceSELECT: cbs.makeChoiceSELECT
        },
        publishLevel: publishLevels.FEW,
        stepRule:  stepRules.SOLO
    });

    stager.setDefaultGlobals({
        round: cbs.round,
        timer: settings.timer,
        buildTables: cbs.buildTables,
        checkID: cbs.checkID,
        checkEntry: cbs.checkEntry,
        writeCatastrophe: cbs.writeCatastrophe,
        writeNoCatastrophe: cbs.writeNoCatastrophe,
        writeOfferRejected: cbs.writeOfferRejected,
        writeOfferAccepted: cbs.writeOfferAccepted,
        writeRoundResults: cbs.writeRoundResults
    });

    stager.setDefaultProperties({
        publishLevel: publishLevels.REGULAR,
        syncStepping: false
    });

    stager.setDefaultStepRule(stepRules.WAIT);

    //We serialize the game sequence before sending it
    game.plot = stager.getState();

    return game;
};
