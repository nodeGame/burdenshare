/**
 * # Functions used by the Client of Burden-share Game
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

module.exports = decision;

function decision() {

    node.game.visualRound.setDisplayMode(['COUNT_UP_STAGES_TO_TOTAL',
                                          'COUNT_UP_ROUNDS_TO_TOTAL']);

    var gameName = node.game.globals.gameName;
    var chosenTreatment = node.game.globals.chosenTreatment;

    var that = this;

    /////////////////////////////////// PROPOSER ///////////////////////////////////

    if (node.game.role == 'PROPOSER') {
        W.loadFrame(node.game.url_bidder, function() {
            var options;

            W.getElementById("instructionsFrame").setAttribute(
                "src",node.game.url_instructionsFrame
            );

            if (node.player.stage.round === 1) {
                // Test Round
                W.getElementById('practice2').style.display = '';
            }
            W.getElementById("offer").selectedIndex = -1;
            node.game.timeMakingOffer = Date.now();


            var submitoffer = W.getElementById('submitOffer');

            options = {
                milliseconds: node.game.globals.timer.proposer,
                timeup: function() {
                    W.getElementById("fieldset").disabled = true;
                    submitoffer.onclick = null;
                    node.game.timer.stop();
                    var randnum = Math.floor(1+Math.random()*node.game.costGE);
                    var offer = W.getElementById('offer');
                    node.game.proposal = ""+randnum;
                    node.game.decisionOffer = 0;
                    node.emit('BID_DONE', randnum, node.game.otherID);
                }
            };
            node.game.timer.restart(options);

            var propEndow = W.getElementById('propEndow');
            var respEndow = W.getElementById('respEndow');
            var costGHGE = W.getElementById('costGHGE');
            var clRiskOwn = W.getElementById('clRiskOwn');
            var clRiskOther = W.getElementById('clRiskOther');
            var clRisk = W.getElementById('clRisk');
            W.write(node.game.endowment_proposer.toString(),propEndow);
            W.write(node.game.endowment_responder.toString(),respEndow);
            W.write(node.game.costGE.toString(),costGHGE);
            W.write(node.game.riskOwn.toString(),clRiskOwn);
            W.write(node.game.riskOther.toString(),clRiskOther);
            W.write(node.game.ClimateRisk.toString(),clRisk);

            submitoffer.onclick = function() {
                var offer = W.getElementById('offer');
                if (!that.isValidBid(offer.value)) {
                    var msg = 'Please choose an integer number between 0 and ' +
                        node.game.costGE;
                    node.game.globals.checkID(msg);
                    return;
                }
                node.game.proposal = parseInt(offer.value);

                node.game.timer.stop();
                node.game.timer.setToZero();
                W.getElementById("fieldset").disabled = true;
                submitoffer.onclick = null;
                node.game.decisionOffer = 1;
                node.emit('BID_DONE', node.game.proposal, node.game.otherID);
            };

            node.on.data("ACCEPT", function(msg) {
                W.loadFrame('/burdenshare/html/resultProposer.html', function() {
                    if (node.player.stage.round === 1) {
                        // Test Round
                        W.getElementById('practice3').style.display = '';
                        W.getElementById("practiceAccept").style.display = "";
                    }

                    node.game.timeResultProp = Date.now();
                    // Start the timer.
                    var options = {
                        milliseconds: node.game.globals.timer.reply2Prop,
                        timeup: function() {
                            node.game.timer.stop();
                            this.disabled = "disabled";
                            node.emit('PROPOSER_DONE', node.game.results, node.game.ownID);
                        }
                    };
                    node.game.timer.restart(options);
                    var result1 = W.getElementById('result1');
                    var result2 = W.getElementById('result2');
                    var result3 = W.getElementById('result3');
                    var proceed = W.getElementById('continue');
                    var propOffer = W.getElementById('propOffer');
                    node.game.offer = msg.data.offer.toString();
                    W.write(msg.data.offer.toString(),propOffer);
                    var resp = node.game.costGE - msg.data.offer;
                    node.game.respPay =  resp.toString();
                    if (node.player.stage.round !== 1) {
                        // W.write('The other player has accepted your offer.',result1);
                        W.sprintf('The other player has %strongaccepted%strong your offer.', {
                            '%strong': {}  
                        } , result1);
                        W.write('You have successfully reached an agreement against global warming.',result2);
                    }

                    node.game.decision =  'Accept';
                    node.game.agreement =  'Yes';
                    node.game.catastrophe =  'No';

                    var respDecision = W.getElementById('respDecision');
                    W.write('Accept',respDecision);
                    var remain = node.game.endowment_proposer - msg.data.offer;
                    if (remain < 0) {
                        remain = 0;
                    }
                    node.game.remainProp = remain.toString();
                    var remainProp = W.getElementById('remainProp');
                    W.write(remain.toString(),remainProp);
                    var remainResp = W.getElementById('remainResp');
                    remResp = node.game.endowment_responder - resp;
                    if (remResp < 0) {
                        remResp = 0;
                    }
                    W.write(remResp.toString(),remainResp);

                    node.game.results = {
                        Current_Round: node.player.stage.round,
                        Player_ID: node.game.ownID,
                        timeInitSituaProp: node.game.timeInitialSituation,
                        timeOffer: node.game.timeMakingOffer,
                        GroupNumber: node.game.nbrGroup,
                        Role_Of_Player: node.game.role,
                        Offer: msg.data.offer,
                        Decision_Offer: node.game.decisionOffer,
                        Decision_Accept1_Reject0: 1,
                        Climate_Catastrophy: msg.data.cc,
                        Profit: remain,
                        P_QuestRound: '',
                        Endow_Prop: node.game.endowment_proposer,
                        RiskContrib_P: node.game.riskOwn,
                        GroupRisk: (node.game.riskOwn + node.game.riskOther + 15)
                    };
                    proceed.onclick = function() {
                        node.game.timer.stop();
                        this.disabled = "disabled";
                        node.emit('PROPOSER_DONE', node.game.results, node.game.ownID);
                    };
                });
            });

            node.on.data("REJECT", function(msg) {
                W.loadFrame('html/resultProposer.html', function () {
                    if (node.player.stage.round === 1) {
                        // Test Round
                        var practice3 = W.getElementById('practice3');
                        practice3.style.display = '';
                        W.getElementById("practiceReject").style.display = "";
                        W.getElementById('practice' + (msg.data.cc === 0 ? 'No':'') +
                        'Catastrophe').style.display = '';

                    }

                    node.game.timeResultProp = Date.now();
                    // Start the timer.
                    var options = {
                        milliseconds: node.game.globals.timer.reply2Prop,
                        timeup: function() {
                            node.game.timer.stop();
                            this.disabled = "disabled";
                            node.emit('PROPOSER_DONE', node.game.results, node.game.ownID);
                        }
                    };
                    node.game.timer.restart(options);

                    var result1 = W.getElementById('result1');
                    var result2 = W.getElementById('result2');
                    var result3 = W.getElementById('result3');
                    var proceed = W.getElementById('continue');
                    var propOffer = W.getElementById('propOffer');
                    node.game.offer =  msg.data.offer.toString();
                    W.write(msg.data.offer.toString(),propOffer);
                    var resp = node.game.costGE - msg.data.offer;
                    node.game.respPay =  resp.toString();

                    if (node.player.stage.round !== 1) {
                        // W.write('The other player has rejected your offer.', result1);
                        W.sprintf('The other player has %strongrejected%strong your offer.', {
                            '%strong': {}
                        }, result1);
                        W.write('You have not been able to reach an agreement against global warming.', result2);
                    }

                    if (msg.data.cc === 0) {
                        if (node.player.stage.round !== 1) {
                            // W.write('However, no climate catastrophe has happened.', result3);
                            W.sprintf('However, %strongno climate catastrophe%strong has happened.', {
                                '%strong': {}
                            }, result3);
                        }
                        node.game.catastrophe =  'No';
                        var remainProp = W.getElementById('remainProp');
                        remaining = node.game.endowment_proposer;
                        node.game.remainProp = remaining.toString();
                        W.write(remaining.toString(),remainProp);
                        var remainResp = W.getElementById('remainResp');
                        remResp = node.game.endowment_responder;
                        W.write(remResp.toString(),remainResp);
                    }
                    else {
                        if (node.player.stage.round !== 1) {
                            // W.write('A climate catastrophe has happened and destroyed a part of your endowment.', result3); 
                            W.sprintf('A %strongclimate catastrophe has happened%strong and destroyed a part of your endowment.', 
                                      { '%strong': {} }, result3);
                        }
                        node.game.catastrophe =  'Yes';
                        var remainProp = W.getElementById('remainProp');
                        remaining = node.game.endowment_proposer/2;
                        node.game.remainProp = remaining.toString();
                        W.write(remaining,remainProp);
                        var remainResp = W.getElementById('remainResp');
                        remResp = node.game.endowment_responder / 2;
                        W.write(remResp.toString(),remainResp);
                    }

                    node.game.decision =  'Reject';
                    node.game.agreement =  'No';
                    var respDecision = W.getElementById('respDecision');
                    W.write('Reject',respDecision);

                    node.game.results = {
                        Current_Round: node.player.stage.round,
                        Player_ID: node.game.ownID,
                        timeInitSituaProp: node.game.timeInitialSituation,
                        timeOffer: node.game.timeMakingOffer,
                        GroupNumber: node.game.nbrGroup,
                        Role_Of_Player: node.game.role,
                        Offer: msg.data.offer,
                        Decision_Accept1_Reject0: 0,
                        Decision_Offer: node.game.decisionOffer,
                        Climate_Catastrophy: msg.data.cc,
                        Profit: remaining,
                        P_QuestRound: '',
                        Endow_Prop: node.game.endowment_proposer,
                        RiskContrib_P: node.game.riskOwn,
                        GroupRisk: (node.game.riskOwn + node.game.riskOther + 15)
                    };
                    proceed.onclick = function() {
                        node.game.timer.stop();
                        this.disabled = "disabled";
                        node.emit('PROPOSER_DONE', node.game.results, node.game.ownID);
                    };
                });
            });

        });
    }

    /////////////////////////////////// RESPONDENT ///////////////////////////////////
    else if (node.game.role == 'RESPONDENT') {
        W.loadFrame(node.game.url_resp, function() {
            W.getElementById("instructionsFrame").setAttribute(
                "src",node.game.url_instructionsFrame
            );
            var span_dot = W.getElementById('span_dot');
            // Refreshing the dots...
            setInterval(function() {
                if (span_dot.innerHTML !== '......') {
                    span_dot.innerHTML = span_dot.innerHTML + '.';
                }
                else {
                    span_dot.innerHTML = '.';
                }
            }, 1000);

            var propEndow = W.getElementById('propEndow');
            var respEndow = W.getElementById('respEndow');
            var costGHGE = W.getElementById('costGHGE');
            var clRiskOwn = W.getElementById('clRiskOwn');
            var clRiskOther = W.getElementById('clRiskOther');
            var clRisk = W.getElementById('clRisk');
            W.write(node.game.endowment_proposer.toString(),propEndow);
            W.write(node.game.endowment_responder.toString(),respEndow);
            W.write(node.game.costGE.toString(),costGHGE);
            W.write(node.game.riskOwn.toString(),clRiskOwn);
            W.write(node.game.riskOther.toString(),clRiskOther);
            W.write(node.game.ClimateRisk.toString(),clRisk);

            node.on("in.say.DATA", function(msg) {
                node.game.timeResponse = Date.now();
                if (msg.text == "OFFER") {
                    var options = {
                        milliseconds: node.game.globals.timer.respondent,
                        timeup: function() {
                            node.game.timer.stop();
                            node.game.decisionResponse = 0;
                            that.randomAccept(msg.data, node.game.otherID);
                        }
                    };
                    node.game.timer.init(options);
                    node.game.timer.updateDisplay();
                    node.game.timer.start(options);

                    var dots =  W.getElementById('dots');
                    dots.style.display = 'none';
                    var text =  W.getElementById('text');
                    text.style.display = '';
                    var offered = W.getElementById('offered');
                    offered.style.display = '';
                    var proposer = W.getElementById('proposer');
                    var respondent = W.getElementById('respondent');
                    var respPay = node.game.costGE - msg.data;
                    W.write(msg.data.toString(), proposer);
                    W.write(respPay.toString(), respondent);

                    var accept = W.getElementById('accept');
                    var reject = W.getElementById('reject');


                    if (node.player.stage.round == 1) {
                        // Test Round
                        W.getElementById('practice3').style.display = '';

                        W.getElementById('otherContribution').innerHTML =
                            msg.data.toString();
                        W.getElementById('yourContribution').innerHTML =
                            respPay;
                        W.getElementById('climateRisk').innerHTML =
                            node.game.ClimateRisk;
                    }

                    node.game.offer = msg.data;
                    node.game.respPay = ""+respPay;

                    accept.onclick = function() {
                        node.game.response = 'accept';
                        node.game.timer.stop();
                        node.game.decisionResponse = 1;
                        node.emit('RESPONSE_DONE', 'ACCEPT', msg.data, node.game.otherID);
                    };

                    reject.onclick = function() {
                        node.game.response = 'reject';
                        node.game.timer.stop();
                        node.game.decisionResponse = 1;
                        node.emit('RESPONSE_DONE', 'REJECT', msg.data, node.game.otherID);
                    };
                }
            });
        });
    }
    return true;
}
