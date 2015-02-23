/**
 * # Functions used by the Client of Burden-share Game
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

module.exports = initialSituation;

function initialSituation() {

    var gameName = node.game.globals.gameName;
    var chosenTreatment = node.game.globals.chosenTreatment;

    var IDs = {
        ownPlayerId: node.game.ownID,
        otherPlayerId: node.game.otherID
    };

    node.game.visualRound.setDisplayMode(['COUNT_UP_STAGES_TO_TOTAL',
                                          'COUNT_UP_ROUNDS_TO_TOTAL']);

    node.set('get_InitEndow', IDs);

    node.on.data("Endow", function(msg) {
        var initialEndow = msg.data.init_Endow;
        node.game.ClimateRisk = msg.data.cl_Risk + node.game.risk;
        node.game.riskOwn = node.game.risk - 7.5;
        node.game.riskOther = msg.data.cl_Risk - 7.5;
        
        var url, varTime;

        if (node.game.role == 'PROPOSER') {
            node.game.endowment_responder = initialEndow;
            node.game.endowment_proposer = node.game.endowment_own;
            url = node.game.url_initprop;
            varTime = 'timeInitialSituation';
        }
        
        // RESPONDER
        else {
            node.game.endowment_proposer = initialEndow;
            node.game.endowment_responder = node.game.endowment_own;
            url = node.game.url_initresp;
            varTime = 'timeInitialSituationResp';
        }

        W.loadFrame(url, function() {
            W.getElementById("instructionsFrame").setAttribute(
                "src", node.game.url_instructionsFrame);

            var initText1 = "Due to economic growth, you have received " +
                (node.game.endowment_own) + " ECU.";

            var initText2 = "This level of growth means that your economy ";
            initText2 = initText2 + "has increased the climate risk by " +
                (node.game.risk - 7.5) + "%.";

            if (node.player.stage.round == 1) {
                // Test Round.
                var practice1 = W.getElementById('practice1');
                practice1.style.display = '';
                var text1 = W.getElementById('inform1');
                W.write(initText1, text1);
                var text2 = W.getElementById('inform2');
                W.write(initText2, text2);
            }
            else if (node.player.stage.round == 2) {
                var text1 = W.getElementById('inform1');
                W.write(initText1,text1);
                var text2 = W.getElementById('inform2');
                W.write(initText2, text2);
            }

            // Keep time.
            node.game[varTime] = Date.now();

            var propEndow = W.getElementById('propEndow');
            var respEndow = W.getElementById('respEndow');
            var costGHGE = W.getElementById('costGHGE');
            var clRiskOwn = W.getElementById('clRiskOwn');
            var clRiskOther = W.getElementById('clRiskOther');
            var clRisk = W.getElementById('clRisk');

            W.write(node.game.endowment_proposer.toString(), propEndow);
            W.write(node.game.endowment_responder.toString(), respEndow);
            W.write(node.game.costGE.toString(), costGHGE);
            W.write(node.game.riskOwn.toString(), clRiskOwn);
            W.write(node.game.riskOther.toString(), clRiskOther);
            W.write(node.game.ClimateRisk.toString(), clRisk);

            var proceed = W.getElementById('continue');
            proceed.onclick = function() {
                node.game.timer.stop();
                node.game[varTime] = Math.round(Math.abs(
                    node.game[varTime] - Date.now())/1000);
                node.game.timer.setToZero();
                node.emit('DONE');
            };
        });

    });
}
