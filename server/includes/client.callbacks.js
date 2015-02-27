/**
 * # Functions used by the Logic and Client of Burden-share Game
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

module.exports = {
    round: require('./logic.callbacks').round,

    // Stages callbacks.
    instructions: require('./client.instructions'),
    init: require('./client.init'),
    initialSituation: require('./client.initialSituation'),
    decision: require('./client.decision'),
    questionnaire: require('./client.quest'),

    // Helper - high-level.
    clearFrame: clearFrame,
    notEnoughPlayers: notEnoughPlayers,
    syncGroup: syncGroup,

    // Helper - Check Data.
    checkID: checkID,
    checkEntry: checkEntry,

    // Helper - DOM write.
    buildTables: buildTables,
    writeOfferAccepted: writeOfferAccepted,
    writeOfferRejected: writeOfferRejected,
    writeCatastrophe: writeCatastrophe,
    writeNoCatastrophe: writeNoCatastrophe,
};

function clearFrame() {
    node.emit('INPUT_DISABLE');
    return true;
}

function notEnoughPlayers() {
    node.game.pause();
    W.lockScreen('One player disconnected. We are now waiting to see if ' +
                 'he or she reconnects. If there is no reconnection ' +
                 'within 60 seconds the game will be terminated and ' +
                 'you will be forwarded to the questionnaire.');
}

function syncGroup(stage, myStageLevel, pl, game) {
    var p = node.game.pl.get(node.game.otherID);
    if (p.stageLevel === node.constants.stageLevels.DONE) {
        if (myStageLevel === node.constants.stageLevels.DONE) {
            return true;
        }
    }
}

function writeOfferAccepted(offer) {

    var result1, result2;
    result1 = W.getElementById('result1');
    result2 = W.getElementById('result2');

    var propOffer = W.getElementById('propOffer');
    node.game.offer = offer;
    W.write(offer, propOffer);
    var resp = node.game.costGE - offer;
    node.game.respPay =  resp.toString();
    if (node.player.stage.round !== 1) {
        W.sprintf('You have %strongaccepted%strong the offer.', {
            '%strong': {}
        }, result1);
        W.write('You have successfully reached an agreement against global warming.', result2);
    }
    node.game.decision =  'Accept';
    node.game.agreement =  'Yes';
    node.game.catastrophe =  'No';
    var respDecision = W.getElementById('respDecision');
    node.game.decision =  'Accept';
    W.write('Accept',respDecision);
    var remain = node.game.endowment_responder - resp;
    if (remain < 0) {remain = 0;}
    node.game.remainResp = remain.toString();
    node.game.remainNum = remain;
    var remainResp = W.getElementById('remainResp');
    W.write(remain,remainResp);
    remProp = node.game.endowment_proposer - offer;
    if (remProp < 0) {remProp = 0;}
    var remainProp = W.getElementById('remainProp');
    W.write(remProp, remainProp);

}

function writeCatastrophe() {
    node.game.catastrophe =  'Yes';
    remProp = node.game.endowment_proposer / 2;
    var remainProp = W.getElementById('remainProp');
    W.write(remProp,remainProp);
    if (node.player.stage.round !== 1) {
        W.sprintf('A %strongclimate catastrophe has happened%strong and ' +
                  ' destroyed a part of your endowment.', null,
                  W.getElementById('result3'));
    }
}

function writeNoCatastrophe() {
    var result3 = W.getElementById('result3');
    if (node.player.stage.round !== 1) {
        // W.write('However, no climate catastrophe has happened.', result3);

        W.sprintf('However, %strongno climate catastrophe%strong has happened.', {
            '%strong': {}
        }, result3);
    }
    node.game.catastrophe =  'No';
    remProp = node.game.endowment_proposer;
    var remainProp = W.getElementById('remainProp');
    W.write(remProp,remainProp);
}

function writeOfferRejected() {
    var result1, result2;
    if (node.player.stage.round !== 1) {
        result1 = W.getElementById('result1');
        result2 = W.getElementById('result2');

        // W.write('You have rejected the offer.', result1);
        W.sprintf('You have %strongrejected%strong the offer.', {
            '%strong': {}
        }, result1);

        W.write('You have not been able to reach an ' +
                'agreement against global warming.', result2);
    }

    node.game.decision =  'Reject';
    node.game.agreement =  'No';

    var respDecision = W.getElementById('respDecision');
    W.write('Reject', respDecision);

    if (node.game.catastrophe ===  'Yes') {
        node.game.remainNum = node.game.endowment_responder / 2;
    }
    else {
        node.game.remainNum = node.game.endowment_responder;
    }

    var remainResp = W.getElementById('remainResp');
    node.game.remainResp = node.game.remainNum.toString();
    W.write(node.game.remainResp, remainResp);
}

function buildTables() {
    // Show table with initial situation.
    var propEndow = W.getElementById('propEndow');
    var respEndow = W.getElementById('respEndow');
    var costGHGE = W.getElementById('costGHGE');
    var clRiskOwn = W.getElementById('clRiskOwn');
    var clRiskOther = W.getElementById('clRiskOther');
    var clRisk = W.getElementById('clRisk');

    // Show table with result after negatiation has been finished.
    var propOffer = W.getElementById('propOffer');
    var respToPay = W.getElementById('respToPay');
    var respDecision = W.getElementById('respDecision');
    var agreement = W.getElementById('agreement');
    var climateCatastrophe = W.getElementById('climateCatastrophe');
    var remainProp = W.getElementById('remainProp');
    var remainResp = W.getElementById('remainResp');

    var propEnd, respEnd;
    var propRemain, respRemain;

    if (node.game.role === "RESPONDENT") {
        respEnd = node.game.remainProp;
        propEnd = node.game.remainResp;
    }
    else {
        propEnd = node.game.remainProp;
        respEnd = node.game.remainResp;
    }

    if (node.game.role == 'PROPOSER') {
        propEnd = node.game.endowment_own;
        respEnd = node.game.endowment_responder;
    }        
    // RESPONDER
    else {
        respEnd = node.game.endowment_own;
        propEnd = node.game.endowment_responder;
    }

    W.write(propEnd, propEndow);
    W.write(respEnd, respEndow);

    W.write(node.game.costGE, costGHGE);
    W.write(node.game.riskOwn, clRiskOwn);
    W.write(node.game.riskOther, clRiskOther);
    W.write(node.game.ClimateRisk, clRisk);


    W.write(node.game.offer, propOffer);
    W.write(node.game.respPay, respToPay);
    W.write(node.game.decision, respDecision);
    W.write(node.game.agreement, agreement);
    W.write(node.game.catastrophe, climateCatastrophe);
    W.write(propEnd, remainProp);
    W.write(respEnd, remainResp);
}

/**
 * ## checkEntry
 *
 * checks whether the question has been answered or not
 *
 * if not a warning message is shown
 *
 * @param {string} msg The text to be shown in the warning message window
 *
 */
function checkEntry(msg){
    bootbox.dialog({
        message: msg,
        buttons: {
            danger: {
                label: "Return to Question",
                className: "btn-danger",
                callback: function() {
                }
            },
        }
    });
}



/**
 * ## checkID
 *
 * checks whether the correct qualtrix id has been entered
 *
 * if not a warning message is shown
 *
 * @param {string} msg The text to be shown in the warning message window
 *
 */
function checkID(msg) {
    bootbox.dialog({
        message: msg,
        buttons: {
            danger: {
                label: "Return to Question",
                className: "btn-danger",
                callback: function() {
                }
            },
        }
    });
}
