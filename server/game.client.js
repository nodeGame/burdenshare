/**
 * This file contains all the building blocks (functions, and configuration)
 * that will be sent to each connecting player.
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
    var cbs = require(__dirname + '/includes/logic.callbacks.js');


    //INIT and GAMEOVER
    stager.setOnInit(function() {

        // basic amount of own endowment (here 25)
        node.game.endowment_own = 25;
        node.game.endowment_responder = 0;
        node.game.endowment_proposer = 0;
        // cost green house gas emmisions, two Versions: 30 or 80 ECU
        node.game.costGE = 30;
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
        // ground level of climate risk
        node.game.risk = 7.5;
        node.game.ClimateRisk = 0;
        // offer in each round of the game, used at the end of each round in a short question for the participant
        node.game.proposal = 0;
        // node.game.response is either "accept" or "reject", used at the end of each round in a short question for the participant
        node.game.response = '';

        // condition for one of the two game versions
        if (node.game.costGE == 30) {
            node.game.url_bidder = '/burdenRAHR/html/bidder_30.html';
            node.game.url_resp = '/burdenRAHR/html/resp_30.html';
            node.game.url_initprop = '/burdenRAHR/html/initialSituationProp_30.htm';
            node.game.url_initresp = '/burdenRAHR/html/initialSituationResp_30.htm';
        }
        else if (node.game.costGE == 80) {
            node.game.url_bidder = '/burdenRAHR/html/bidder_80.html';
            node.game.url_resp = '/burdenRAHR/html/resp_80.html';
            node.game.url_initprop = '/burdenRAHR/html/initialSituationProp_80.htm';
            node.game.url_initresp = '/burdenRAHR/html/initialSituationResp_80.htm';
        }

        console.log('INIT PLAYER!');

        //    W.setup('PLAYER');
        if (!W.root) {
            W.root = document.body;
            //this.root = this.generateNodeGameRoot();
        }

        // Generate header and frame.
        var header = W.generateHeader();
        W.generateFrame();

        node.game.stateofgame = node.widgets.append('StateOfGame', header);
        node.game.timer = node.widgets.append('VisualTimer', header);

        // indication of current state at the upper left corner of the page
        var newtag = document.createElement("stateinf");
        newtag.id = 'state';

        var my_div = node.game.stateofgame.bodyDiv;

        my_div.insertBefore(newtag, my_div.childNodes[0]);

        // function called as soon as proposer made his offer (bid)
        node.on('BID_DONE', function(offer, to) {
            node.game.timeMakingOffer = Math.round(Math.abs(node.game.timeMakingOffer - Date.now())/1000);
            var timeMakingOffer = {timeMakingOffer: node.game.timeMakingOffer};
                // node.set('bsc_time',timeMakingOffer);
            W.getElementById('submitOffer').disabled = 'disabled';
            var bidDone = W.getElementById('offered');
            bidDone.innerHTML = ' You offer to pay ' +  offer.toString() +
                '. Please wait until the experiment continues <br> <span id="span_dots">.</span> ';
            var span_dots = W.getElementById('span_dots');
            // Refreshing the dots...
                setInterval(function() {
                    if (span_dots.innerHTML !== '......') {
                        span_dots.innerHTML = span_dots.innerHTML + '.';
                    }
                    else {
                        span_dots.innerHTML = '.';
                    }
                }, 1000);

            node.say('OFFER',node.game.otherID, offer);
        });

        // function called as soon as proposer has finished the current round
        node.on('PROPOSER_DONE', function(data) {
            node.game.timeResultProp = Math.round(Math.abs(node.game.timeResultProp - Date.now())/1000);
            var gameTimeResp = {
                Player_ID: data.Player_ID,
                Current_Round: data.Current_Round,
                timeInitSituaProp: data.timeInitSituaProp,
                timeOffer: data.timeOffer,
                timeResultProp: node.game.timeResultProp
            };
            // node.set('bsc_gameTime',gameTimeResp);

            // short question at the end of each round
            W.loadFrame('/burdenRAHR/html/questionRounds_prop.html', function() {
                node.game.timequestionsRounds = Date.now();
                var options = {
                    // count down time
                    milliseconds: 2000, //240000, // 240000 ms is equivalent to 6 minutes (reading time approximately 3 minutes times 2)
                    // if count down elapsed and no action has been taken by participant function is called
                    timeup: function() {
                        node.game.timequestionsRounds = Math.round(Math.abs(node.game.timequestionsRounds - Date.now())/1000);
                        var timeInstr = {
                            playerID: {Player_ID: node.game.ownID},
                            add: {TimeQuestionRounds: node.game.timequestionsRounds}
                        };
                        // node.set('bsc_instrTimeUpdate',timeInstr);
                        node.game.timer.stop();
                        this.disabled = "disabled";
                        var answerQR = W.getElementById('questRounds').value;
                        node.game.results.P_QuestRound = answerQR;
                        //Check if data for playerID and current round already exists
                        var dataExist = {
                            Player_ID: data.Player_ID,
                            Current_Round: node.player.stage.round
                        };
                        // call data base and check existence of data
                        node.set('check_Data', dataExist);
                        node.on("in.say.DATA", function(msg) {
                            if (msg.text == "CheckData") {
                                console.log('Current Round: ' + msg.data[0]);
                                if (msg.data[0] === undefined) {
                                    node.set('bsc_data',node.game.results);
                                    node.emit('DONE');
                                }
                                else {
                                    // if data already exists, delete and save the new data
                                    console.log('Data Exist: ' + dataExist.Player_ID);
                                    node.set('delete_data', dataExist);
                                    console.log('Player already finished this round.');
                                    node.set('bsc_data',node.game.results);
                                    node.emit('DONE');
                                }
                            }
                        });
                    }
                };
                node.game.timer.init(options);
                node.game.timer.updateDisplay();
                node.game.timer.start(options);

                // show table with initial situation
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

                // show table with result after negatiation has been finished
                var propOffer = W.getElementById('propOffer');
                var respToPay = W.getElementById('respToPay');
                var respDecision = W.getElementById('respDecision');
                var agreement = W.getElementById('agreement');
                var climateCatastrophe = W.getElementById('climateCatastrophe');
                var remainProp = W.getElementById('remainProp');
                W.write(node.game.offer,propOffer);
                W.write(node.game.respPay,respToPay);
                W.write(node.game.decision,respDecision);
                W.write(node.game.agreement,agreement);
                W.write(node.game.catastrophe,climateCatastrophe);
                W.write(node.game.remainProp,remainProp);

                // short question at the end of each round
                var quest = W.getElementById("quest");
                var string = 'Why did you propose ' + node.game.proposal + ' ECU ?';
                W.write(string, quest);
                var next = W.getElementById("continue");
                next.onclick = function() {
                    // node.game.timequestionsRounds = Math.round(Math.abs(node.game.timequestionsRounds - Date.now())/1000);
                    // var timeInstr = {
                    // playerID: {Player_ID: node.game.ownID},
                    // add: {TimeQuestionRounds: node.game.timequestionsRounds}
                    // };
                    // node.set('bsc_instrTimeUpdate',timeInstr);
                    // node.game.timer.stop();
                    // this.disabled = "disabled";
                    var answerQR = W.getElementById('questRounds').value;
                    node.game.results.P_QuestRound = answerQR;
                    //Check if data for playerID and current round already exists
                    var dataExist = {
                        Player_ID: data.Player_ID,
                        Current_Round: node.player.stage.round
                    };

                    // call data base and check existence of data
                    node.set('check_Data', dataExist);
                    node.on("in.say.DATA", function(msg) {
                        if (msg.text == "CheckData") {
                            console.log('Current Round: ' + msg.data[0]);
                            if (msg.data[0] === undefined) {
                                node.set('bsc_data',node.game.results);
                                node.emit('DONE');
                            }
                            else {
                                console.log('Data Exist: ' + dataExist.Player_ID);
                                node.set('delete_data', dataExist);
                                console.log('Player already finished this round.');
                                node.set('bsc_data',node.game.results);
                                node.emit('DONE');
                            }
                        }
                    });
                };
            });
        });

        // function called as soon as responder has finished the current round
        node.on('RESPONDER_DONE', function(data) {
            node.game.timeResultResp = Math.round(Math.abs(node.game.timeResultResp - Date.now())/1000);
            var gameTimeResp = {
                Player_ID: data.Player_ID,
                Current_Round: data.Current_Round,
                timeInitSituaResp: data.timeInitSituaResp,
                timeRespondeResp: data.timeRespondeResp,
                timeResultResp: node.game.timeResultResp
            };
            console.log("Time InitResp:" + gameTimeResp.timeInitSituaResp);
            // node.set('bsc_gameTime',gameTimeResp);

            //Check if data for playerID and current round already exists
            W.loadFrame('/burdenRAHR/html/questionRounds_resp.html', function() {
                node.game.timequestionsRounds = Date.now();
                var options = {
                    milliseconds: 2000, //240000, // 240000 ms is equivalent to 4 minutes (reading time approximately 2 minutes times 2)
                    timeup: function() {
                        node.game.timequestionsRounds = Math.round(Math.abs(node.game.timequestionsRounds - Date.now())/1000);
                        var timeInstr = {
                            playerID: {Player_ID: node.game.ownID},
                            add: {TimeQuestionRounds: node.game.timequestionsRounds}
                        };
                        // node.set('bsc_instrTimeUpdate',timeInstr);
                        node.game.timer.stop();
                        this.disabled = "disabled";
                        var answerQR = W.getElementById('questRounds').value;
                        node.game.results.R_QuestRound = answerQR;
                        //Check if data for playerID and current round already exists
                        var dataExist = {
                            Player_ID: data.Player_ID,
                            Current_Round: node.player.stage.round
                        };
                        node.set('check_Data', dataExist);
                        node.on("in.say.DATA", function(msg) {
                            if (msg.text == "CheckData") {
                                console.log('Current Round: ' + msg.data[0]);
                                if (msg.data[0] === undefined) {
                                    node.set('bsc_data',node.game.results);
                                    node.emit('DONE');
                                }
                                else {
                                    console.log('Data Exist: ' + dataExist.Player_ID);
                                    node.set('delete_data', dataExist);
                                    console.log('Player already finished this round.');
                                    node.set('bsc_data',node.game.results);
                                    node.emit('DONE');
                                }
                            }
                        });
                    }
                };
                node.game.timer.init(options);
                node.game.timer.updateDisplay();
                node.game.timer.start(options);

                // show table with initial situation
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

                // show table with result after negatiation has been finished
                var propOffer = W.getElementById('propOffer');
                var respToPay = W.getElementById('respToPay');
                var respDecision = W.getElementById('respDecision');
                var agreement = W.getElementById('agreement');
                var climateCatastrophe = W.getElementById('climateCatastrophe');
                var remainResp = W.getElementById('remainResp');
                W.write(node.game.offer,propOffer);
                W.write(node.game.respPay,respToPay);
                W.write(node.game.decision,respDecision);
                W.write(node.game.agreement,agreement);
                W.write(node.game.catastrophe,climateCatastrophe);
                W.write(node.game.remainResp,remainResp);

                // short question at the end of each round
                var quest = W.getElementById("quest");
                var string = 'Why did you ' + node.game.response + ' the proposal ?';
                W.write(string, quest);
                var next = W.getElementById("continue");
                next.onclick = function() {
                    // node.game.timequestionsRounds = Math.round(Math.abs(node.game.timequestionsRounds - Date.now())/1000);
                    // var timeInstr = {
                    // playerID: {Player_ID: node.game.ownID},
                    // add: {TimeQuestionRounds: node.game.timequestionsRounds}
                    // };
                    // node.set('bsc_instrTimeUpdate',timeInstr);
                    // node.game.timer.stop();
                    // this.disabled = "disabled";
                    var answerQR = W.getElementById('questRounds').value;
                    node.game.results.R_QuestRound = answerQR;
                    //Check if data for playerID and current round already exists
                    var dataExist = {
                        Player_ID: data.Player_ID,
                        Current_Round: node.player.stage.round
                    };
                    node.set('check_Data', dataExist);
                    node.on("in.say.DATA", function(msg) {
                        if (msg.text == "CheckData") {
                            console.log('Current Round: ' + msg.data[0]);
                            if (msg.data[0] === undefined) {
                                node.set('bsc_data',node.game.results);
                                node.emit('DONE');
                            }
                            else {
                                console.log('Data Exist: ' + dataExist.Player_ID);
                                node.set('delete_data', dataExist);
                                console.log('Player already finished this round.');
                                node.set('bsc_data',node.game.results);
                                node.emit('DONE');
                            }
                        }
                    });
                };
            });
        });

        // node.on('RESPONDER_DONE', function(data) {
        // node.game.timeResultResp = Math.round(Math.abs(node.game.timeResultResp - Date.now())/1000);
        // var gameTimeResp = {
        // Player_ID: data.Player_ID,
        // Current_Round: data.Current_Round,
        // timeInitSituaResp: data.timeInitSituaResp,
        // timeRespondeResp: data.timeRespondeResp,
        // timeResultResp: node.game.timeResultResp,
        // };
        // node.set('bsc_gameTime',gameTimeResp);
        // //Check if data for playerID and current round already exists
        // node.set('check_Data', node.game.ownID);
        // node.set('bsc_data',data);
        // node.emit('DONE');
        // });


        // getting the player ID of the other player and the group number
        // depending on whether this player is the proposer or the responder in the current round
        node.on("in.say.DATA", function(msg) {
            if (msg.text == "PROPOSER") {
                node.game.role = "PROPOSER";
                node.game.otherID = msg.data.respondent;
                node.game.nbrGroup = msg.data.groupR;
            }
            else if (msg.text == "RESPONDENT") {
                node.game.role = "RESPONDENT";
                node.game.otherID = msg.data.proposer;
                node.game.nbrGroup = msg.data.groupP;
            }
            node.emit('GROUP_DONE', 'DONE', node.game.ownID);
        });

        // function called as soon as responder made his descision (accept or reject the offer)
        node.on('RESPONSE_DONE', function(response, offer, from) {
            node.game.timeResponse = Math.round(Math.abs(node.game.timeResponse - Date.now())/1000);
            // var timeResponse = {timeResponse: node.game.timeResponse};
            // node.set('bsc_time',timeResponse);

            W.loadFrame('/burdenRAHR/html/resultResponder.html', function() {
                if (node.player.stage.round == 1) {
                    // Test Round
                    var practice3 = W.getElementById('practice3');
                    practice3.style.display = '';
                }
                node.game.timeResultResp = Date.now();

                // Start the timer.
                var options = {
                    milliseconds: 2000, //120000, // 120000 ms is equivalent to 2 minutes
                    timeup: function() {
                        node.game.timer.stop();
                        this.disabled = "disabled";
                        node.emit('RESPONDER_DONE', node.game.results, node.game.ownID);
                    }
                };
                node.game.timer.restart(options);

                var result1 = W.getElementById('result1');
                var result2 = W.getElementById('result2');
                var result3 = W.getElementById('result3');
                var propOffer = W.getElementById('propOffer');
                node.game.offer = offer.toString();
                W.write(offer.toString(),propOffer);
                var resp = node.game.costGE - offer;
                var respToPay = W.getElementById('respToPay');
                node.game.respPay =  resp.toString();
                W.write(resp.toString(),respToPay);

                var catastrNo = {
                    cc: 0,
                    offer: offer
                };

                var proceed = W.getElementById('continue');
                if (response == 'ACCEPT') {
                    node.say('ACCEPT',node.game.otherID, catastrNo);
                    W.write('You have accepted the offer.',result1);
                    W.write('You have successfully reached an agreement against global warming.',result2);
                    node.game.decision =  'Accept';
                    node.game.agreement =  'Yes';
                    node.game.catastrophe =  'No';
                    var respDecision = W.getElementById('respDecision');
                    node.game.decision =  'Accept';
                    W.write('Accept',respDecision);
                    var agreement = W.getElementById('agreement');
                    W.write('Yes',agreement);
                    var climateCatastrophe = W.getElementById('climateCatastrophe');
                    W.write('No',climateCatastrophe);
                    var remain = node.game.endowment_responder - resp;
                    if (remain < 0) {remain = 0;}
                    node.game.remainResp = remain.toString();
                    var remainResp = W.getElementById('remainResp');
                    W.write(remain.toString(),remainResp);

                    remProp = node.game.endowment_proposer - offer;
                    if (remProp < 0) {remProp = 0;}
                    var remainProp = W.getElementById('remainProp');
                    W.write(remProp.toString(),remainProp);
                    acceptPlayer = 1;
                    cc = 0;
                    remaining = remain;
                }

                else {
                    acceptPlayer = 0;
                    W.write('You have rejected the offer.',result1);
                    W.write('You have not been able to reach an agreement against global warming.',result2);
                    /////////////////////////////////////////////
                    // Offer rejected
                    // A climate catastrophe will happen with a
                    // probability of node.game.ClimateRisk %
                    ///////////////////////////////////////////

                    var clim_cat = Math.random();
                    if (clim_cat <= (node.game.ClimateRisk/100)) {
                        // climate catastrophy happened
                        catastrophe = 1;
                    }
                    else {
                        // climate catastrophy did not happen
                        catastrophe = 0;
                    }

                    // climate catastrophy happened
                    if (catastrophe) {
                        W.write('A climate catastrophe has happened and destroyed a part of your endowment.', result3);
                        //                    var remainEndowResp = endowment/2;
                        var catastrYes = {
                            cc: 1,
                            offer: offer,
                            remainEndowResp: node.game.endowment_responder/2
                        };
                        cc = 1;
                        node.say('REJECT',node.game.otherID, catastrYes);
                        var climateCatastrophe = W.getElementById('climateCatastrophe');
                        W.write('Yes',climateCatastrophe);
                        node.game.catastrophe =  'Yes';
                        remProp = node.game.endowment_proposer / 2;
                        var remainProp = W.getElementById('remainProp');
                        W.write(remProp.toString(),remainProp);
                    }
                    else {
                        var catastrYes = {
                            cc: 0,
                            offer: offer,
                            remainEndowResp: node.game.endowment_responder
                        };
                        cc = 0;
                        var result3 = W.getElementById('result3');
                        W.write('However, no climate catastrophe has happened.', result3);
                        var climateCatastrophe = W.getElementById('climateCatastrophe');
                        node.game.catastrophe =  'No';
                        W.write('No',climateCatastrophe);
                        node.say('REJECT',node.game.otherID, catastrYes);
                        remProp = node.game.endowment_proposer;
                        var remainProp = W.getElementById('remainProp');
                        W.write(remProp.toString(),remainProp);
                    }
                    node.game.decision =  'Reject';
                    node.game.agreement =  'No';
                    var respDecision = W.getElementById('respDecision');
                    W.write('Reject',respDecision);
                    var agreement = W.getElementById('agreement');
                    W.write('No',agreement);
                    var remainResp = W.getElementById('remainResp');
                    node.game.remainResp = catastrYes.remainEndowResp.toString();
                    W.write(catastrYes.remainEndowResp.toString(),remainResp);
                    remaining = catastrYes.remainEndowResp;
                }

                // these values are stored in the mongoDB data base table called bsc_data
                node.game.results = {
                    Current_Round: node.player.stage.round,
                    Player_ID: node.game.ownID,
                    timeInitSituaResp: node.game.timeInitialSituationResp,
                    timeRespondeResp: node.game.timeResponse,
                    GroupNumber: node.game.nbrGroup,
                    Role_Of_Player: node.game.role,
                    Offer: "not available",
                    Decision_Accept1_Reject0: acceptPlayer,
                    Decision_Response: node.game.decisionResponse,
                    Climate_Catastrophy: cc,
                    Profit: remaining,
                    R_QuestRound: '',
                    Endow_Resp: node.game.endowment_responder,
                    RiskContrib_R: node.game.riskOwn,
                    GroupRisk: (node.game.riskOwn + node.game.riskOther + 15)
                };

                proceed.onclick = function() {
                    node.game.timer.stop();
                    this.disabled = "disabled";
                    node.emit('RESPONDER_DONE', node.game.results, node.game.ownID);
                };
            });
        });

        var that = this;
        node.on.data('burdenSharingControl', function(msg) {
            var leftSrc, rightSrc, data, imgLeft, imgRight;
            data = msg.data;
            leftSrc = msg.data.left;
            rightSrc = msg.data.right;
            imgLeft = document.createElement('img');
            imgLeft.src = leftSrc;
            imgLeft.className = 'face';
            W.getElementById('td_face_left').appendChild(imgLeft);
            imgRight = document.createElement('img');
            imgRight.src = rightSrc;
            imgRight.className = 'face';
            W.getElementById('td_face_right').appendChild(imgRight);
            console.log('created and updated pictures');
        });

        /**
         * ## randomAccept
         *
         * creates a random number "accepted" between 0 and 1 and rounds it to 0 or 1
         *
         * accepted = 1: offer accepted
         * accepted = 0: offer rejected
         *
         * @param {object} dataResp
         * @param {number} other The player ID of the other player
         *
         */
        this.randomAccept = function(dataResp, other) {
            var accepted = Math.round(Math.random());
            console.log('randomaccept');
            console.log(dataResp + ' ' + other);
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

        /**
         * ## isValidBid
         *
         * checks whether the offer made by the proposer is valid
         *
         * only integer between 0 and node.game.costGE are allowed
         *
         * @param {number} n The offer made by the proposer
         * @return {boolean} true or false
         *
         */
        this.isValidBid = function (n) {
            n = parseInt(n);
            return !isNaN(n) && isFinite(n) && n >= 0 && n <= node.game.costGE;
        };

    });

    ///// STAGES and STEPS

    function instructions() {

        var waitingForPlayers =  W.getElementById('waitingForPlayers');
        waitingForPlayers.style.display = 'none';
        // Set state in Header
        document.getElementById('state').innerHTML = "Instruction";
        console.log('instructions');

        W.loadFrame('/burdenRAHR/html/instructions.html', function() {
            node.game.timeInstruction = Date.now();
            var options = {
                milliseconds: 2000, //480000, // 240000 ms is equivalent to 6 minutes (reading time approximately 2 minutes times 2)
                timeup: function() {
                    node.game.timeInstruction = Math.round(Math.abs(node.game.timeInstruction - Date.now())/1000);
                    var timeInstr = {
                        Player_ID: node.game.ownID,
                        Current_Round: "Instructions",
                        TimeInstruction_1: node.game.timeInstruction
                    };
                    // node.set('bsc_instrTime',timeInstr);
                    this.disabled = "disabled";
                    instructions2();
                }
            };
            node.game.timer.init(options);
            node.game.timer.updateDisplay();
            node.game.timer.start(options);

            console.log('burdenSharingControl');
            W.getElementById("cost").innerHTML = node.game.costGE;

            var next;
            next = W.getElementById("continue");
            next.onclick = function() {
                node.game.timeInstruction = Math.round(Math.abs(node.game.timeInstruction - Date.now())/1000);
                var timeInstr = {
                    Player_ID: node.game.ownID,
                    Current_Round: "Instructions",
                    TimeInstruction_1: node.game.timeInstruction
                };
                // node.set('bsc_instrTime',timeInstr);
            node.game.timer.stop();
            this.disabled = "disabled";
            instructions2();
            };
        });

        function instructions2() {
            W.loadFrame('/burdenRAHR/html/instructions2.html', function() {
                node.game.timeInstruction2 = Date.now();
                var options = {
                    milliseconds: 2000, //480000, // 480000 ms is equivalent to 8 minutes (reading time approximately 4 minutes times 2)
                    timeup: function() {
                        node.game.timeInstruction2 = Math.round(Math.abs(node.game.timeInstruction2 - Date.now())/1000);
                        var timeInstr = {
                            playerID: {Player_ID: node.game.ownID},
                            add: {TimeInstruction_2: node.game.timeInstruction2}
                        };
                        // node.set('bsc_instrTimeUpdate',timeInstr);
                        node.game.timer.stop();
                        this.disabled = "disabled";
                        instructions3();
                    }
                };
                node.game.timer.init(options);
                node.game.timer.updateDisplay();
                node.game.timer.start(options);

                console.log('Instructions Page 2');
                W.getElementById("cost").innerHTML = node.game.costGE;

                var next;
                next = W.getElementById("continue");
                next.onclick = function() {
                    node.game.timeInstruction2 = Math.round(Math.abs(node.game.timeInstruction2 - Date.now())/1000);
                    var timeInstr = {
                        playerID: {Player_ID: node.game.ownID},
                        add: {TimeInstruction_2: node.game.timeInstruction2}
                    };
                    // node.set('bsc_instrTimeUpdate',timeInstr);
                    node.game.timer.stop();
                    this.disabled = "disabled";
                    instructions3();
                };
            });
        }

        function instructions3() {
            W.loadFrame('/burdenRAHR/html/instructions3.html', function() {
                node.game.timeInstruction3 = Date.now();
                var options = {
                    milliseconds: 2000, //480000, // 480000 ms is equivalent to 8 minutes (reading time approximately 4 minutes times 2)
                    timeup: function() {
                        node.game.timeInstruction3 = Math.round(Math.abs(node.game.timeInstruction3 - Date.now())/1000);
                        var timeInstr = {
                            playerID: {Player_ID: node.game.ownID},
                            add: {TimeInstruction_3: node.game.timeInstruction3}
                        };
                        // node.set('bsc_instrTimeUpdate',timeInstr);
                        node.game.timer.stop();
                        this.disabled = "disabled";
                        EconGrowthAndRisk();
                        // node.emit('DONE');
                    }
                };
                node.game.timer.init(options);
                node.game.timer.updateDisplay();
                node.game.timer.start(options);
                console.log('Instructions Page 2');

                var next;
                next = W.getElementById("continue");
                next.onclick = function() {
                    node.game.timeInstruction3 = Math.round(Math.abs(node.game.timeInstruction3 - Date.now())/1000);
                    var timeInstr = {
                        playerID: {Player_ID: node.game.ownID},
                        add: {TimeInstruction_3: node.game.timeInstruction3}
                    };
                    // node.set('bsc_instrTimeUpdate',timeInstr);
                    node.game.timer.stop();
                    this.disabled = "disabled";
                    EconGrowthAndRisk();
                };
            });
        }

        /**
             * ## EconGrowthAndRisk
             *
             * the economic growth and corresponding climate risk is chosen randomly by the computer
             *
         */
        function EconGrowthAndRisk() {
            var initEndow = {
                playerID: {Player_ID: node.game.ownID},
                addEndow: {Initial_Endowment: node.game.endowment_own, Climate_Risk: node.game.risk}
            };
            // randomly assigned value of historical growth between 5 and 100
            var endowment_assigned = Math.floor((Math.random() * 96) + 1) + 4;
            // assign the historical responsibility
            if (endowment_assigned >= 5 && endowment_assigned < 25) {
                node.game.risk += 0;
            }
            else if (endowment_assigned >= 25 && endowment_assigned <= 50) {
                node.game.risk += (Math.floor(Math.random() * 5)) * 2.5;
            }
            else if (endowment_assigned > 50 && endowment_assigned <= 75) {
                node.game.risk += ((Math.floor(Math.random() * 5)) * 2.5) + 12.5;
            }
            else if (endowment_assigned > 75 && endowment_assigned <= 100) {
                node.game.risk += 25;
            }
            initEndow.addEndow.Initial_Endowment = node.game.endowment_own + endowment_assigned;
            node.game.endowment_own += endowment_assigned;
            initEndow.addEndow.Climate_Risk = node.game.risk;
            node.set('initEndow',initEndow);
            node.emit('DONE');
        }

        return true;
    }


    function initialSituation() {

        // Set state in Header
        document.getElementById('state').innerHTML = 'Game Period: ' +  node.player.stage.round + " - of - " + node.game.nbrRounds ;
        var IDs = {
            ownPlayerId: node.game.ownID,
            otherPlayerId: node.game.otherID
        };
        node.set('get_InitEndow', IDs);
        node.on("in.say.DATA", function(msg) {
            if (msg.text == "Endow") {
                var initialEndow = msg.data.init_Endow;
                node.game.ClimateRisk = msg.data.cl_Risk + node.game.risk;
                node.game.riskOwn = node.game.risk - 7.5;
                node.game.riskOther = msg.data.cl_Risk - 7.5;
                if (node.game.role == 'PROPOSER') {
                    node.game.endowment_responder = initialEndow;
                    node.game.endowment_proposer = node.game.endowment_own;

                    W.loadFrame(node.game.url_initprop, function() {
                        var initText1 = "Due to economic growth, you have received " + (node.game.endowment_own-25) + " ECU which will be added ";
                        initText1 = initText1 + "to your initial endowment.";
                        var initText2 = "This level of growth means that your economy ";
                        initText2 = initText2 + "has increased the climate risk by " + (node.game.risk-7.5) + " percent.";
                        if (node.player.stage.round == 1) {
                            // Test Round
                            var practice1 = W.getElementById('practice1');
                            practice1.style.display = '';
                            var text1 = W.getElementById('inform1');
                            W.write(initText1,text1);
                            var text2 = W.getElementById('inform2');
                            W.write(initText2, text2);
                        }
                        else if (node.player.stage.round == 2) {
                            var text1 = W.getElementById('inform1');
                            W.write(initText1,text1);
                            var text2 = W.getElementById('inform2');
                            W.write(initText2, text2);
                        }
                        node.game.timeInitialSituation = Date.now();
//                        var options = {
//                        milliseconds: 330000,
//                        timeup: function() {
//                        node.game.timer.stop();
//                        node.game.timeInitialSituation = Math.round(Math.abs(node.game.timeInitialSituation - Date.now())/1000);
//                        var timeInitialSituation = {timeInitialSituation: node.game.timeInitialSituation};
//                        // node.set('bsc_time',timeInitialSituation);
//                        node.emit('DONE');
//                        },
//                        };
//                        node.game.timer.restart(options);


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
                        var proceed = W.getElementById('continue');

                        proceed.onclick = function() {
                            node.game.timer.stop();
                            node.game.timeInitialSituation = Math.round(Math.abs(node.game.timeInitialSituation - Date.now())/1000);
                            // var timeInitialSituation = {timeInitialSituation: node.game.timeInitialSituation};
                            // node.set('bsc_time',timeInitialSituation);
                            node.game.timer.setToZero();
                            node.emit('DONE');
                        };
                    });
                }

                else if (node.game.role == 'RESPONDENT') {
                    node.game.endowment_proposer = initialEndow;
                    node.game.endowment_responder = node.game.endowment_own;

                    W.loadFrame(node.game.url_initresp, function() {
                        var initText1 = "Due to economic growth, you have received " + (node.game.endowment_own-25) + " ECU which will be added ";
                        initText1 = initText1 + "to your initial endowment.";
                        var initText2 = "This level of growth means that your economy ";
                        initText2 = initText2 + "has increased the climate risk by " + (node.game.risk-7.5) + " percent.";
                        if (node.player.stage.round == 1) {
                            // Test Round
                            var practice1 = W.getElementById('practice1');
                            practice1.style.display = '';
                            var text1 = W.getElementById('inform1');
                            W.write(initText1,text1);
                            var text2 = W.getElementById('inform2');
                            W.write(initText2, text2);
                        }
                        else if (node.player.stage.round == 2) {
                            var text1 = W.getElementById('inform1');
                            W.write(initText1,text1);
                            var text2 = W.getElementById('inform2');
                            W.write(initText2, text2);
                        }
                        node.game.timeInitialSituationResp = Date.now();
//                        var options = {
//                        milliseconds: 330000,
//                        timeup: function() {
//                        node.game.timer.stop();
//                        node.game.timeInitialSituationResp = Math.round(Math.abs(node.game.timeInitialSituationResp - Date.now())/1000);
//                        // var timeInitialSituationResp = {timeInitialSituationResp: node.game.timeInitialSituationResp};
//                        // node.set('bsc_time',timeInitialSituationResp);
//                        node.emit('DONE');
//                        },
//                        };
//                        node.game.timer.restart(options);

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
                        var proceed = W.getElementById('continue');
                        proceed.onclick = function() {
                            node.game.timer.stop();
                            node.game.timeInitialSituationResp = Math.round(Math.abs(node.game.timeInitialSituationResp - Date.now())/1000);
                            // var timeInitialSituationResp = {timeInitialSituationResp: node.game.timeInitialSituationResp};
                            // node.set('bsc_time',timeInitialSituationResp);
                            node.game.timer.setToZero();
                            node.emit('DONE');
                        };
                    });
                }
            }
        });
    }

    function decision() {

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
                            //                success: {
                            //                  label: "ID is correct",
                            //                  className: "btn-success",
                            //                  callback: function() {
                            //                          var saveId = {
                            //                                Player_ID: 666
                            //                        };
                            //                          node.emit('player_id',saveId);
                            //                        <!-- node.set('player_id',saveId); -->
                            //
                            //                      location.href="http://localhost:8080/pairs/";
                            //                  }
                            //                },
                }
            });
        }
        var that = this;

        /////////////////////////////////// PROPOSER ///////////////////////////////////

        if (node.game.role == 'PROPOSER') {
            W.loadFrame(node.game.url_bidder, function() {
                if (node.player.stage.round == 1) {
                    // Test Round
                    var practice1 = W.getElementById('practice1');
                    practice1.style.display = '';
                }
                W.getElementById("offer").selectedIndex = -1;
                node.game.timeMakingOffer = Date.now();
                var options = {
                    milliseconds: 2000, //90000, // 120000 ms is equivalent to 2 minutes
                    timeup: function() {
                        W.getElementById("fieldset").disabled = true;
                        node.game.timer.stop();
                        var randnum = Math.floor(1+Math.random()*node.game.costGE);
                        var offer = W.getElementById('offer');
                        node.game.proposal = offer.value;
                            // W.write(randnum, offer);
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

                var submitoffer = W.getElementById('submitOffer');
                submitoffer.onclick = function() {
                    var offer = W.getElementById('offer');
                    node.game.proposal = offer.value;
                    if (!that.isValidBid(offer.value)) {
                        var msg = 'Please choose a number between 0 and ' + node.game.costGE;
                        checkID(msg);
                        return;
                    }
                    node.game.timer.stop();
                    node.game.timer.setToZero();
                    W.getElementById("fieldset").disabled = true;
                    node.game.decisionOffer = 1;
                    node.emit('BID_DONE', offer.value, node.game.otherID);
                };

                node.on("in.say.DATA", function(msg) {
                    if (msg.text == "ACCEPT") {
                        W.loadFrame('/burdenRAHR/html/resultProposer.html', function() {
                            if (node.player.stage.round == 1) {
                                // Test Round
                                var practice3 = W.getElementById('practice3');
                                practice3.style.display = '';
                            }
                            node.game.timeResultProp = Date.now();
                            // Start the timer.
                            var options = {
                                milliseconds: 2000, //120000, // 120000 ms is equivalent to 2 minutes
                                timeup: function() {
                                    node.game.timer.stop();
                                    this.disabled = "disabled";
                                    node.emit('PROPOSER_DONE', node.game.results, node.game.ownID);
                                        //                                    profitPeriods[node.game.currentRound - 1] = node.game.results.profit;
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
                            var respToPay = W.getElementById('respToPay');
                            node.game.respPay =  resp.toString();
                            W.write(resp.toString(),respToPay);
                            W.write('The other player has accepted your offer.',result1);
                            W.write('You have successfully reached an agreement against global warming.',result2);

                            node.game.decision =  'Accept';
                            node.game.agreement =  'Yes';
                            node.game.catastrophe =  'No';

                            var respDecision = W.getElementById('respDecision');
                            W.write('Accept',respDecision);
                            var agreement = W.getElementById('agreement');
                            W.write('Yes',agreement);
                            var climateCatastrophe = W.getElementById('climateCatastrophe');
                            W.write('No',climateCatastrophe);
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
                                    // profitPeriods[node.game.currentRound - 1] = node.game.results.profit;
                            };
                        });
                    }
                    else if (msg.text == "REJECT") {
                        W.loadFrame('html/resultProposer.html', function () {
                            node.game.timeResultProp = Date.now();
                            // Start the timer.
                            var options = {
                                milliseconds: 2000, //120000, // 120000 ms is equivalent to 2 minutes
                                timeup: function() {
                                    node.game.timer.stop();
                                    this.disabled = "disabled";
                                    node.emit('PROPOSER_DONE', node.game.results, node.game.ownID);
                                        // profitPeriods[node.game.currentRound - 1] = node.game.results.profit;
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
                            var respToPay = W.getElementById('respToPay');
                            node.game.respPay =  resp.toString();
                            W.write(resp.toString(),respToPay);
                            W.write('The other player has rejected your offer.', result1);
                            W.write('You have not been able to reach an agreement against global warming.', result2);
                            if (msg.data.cc === 0) {
                                W.write('However, no climate catastrophe has happened.', result3);
                                var climateCatastrophe = W.getElementById('climateCatastrophe');
                                node.game.catastrophe =  'No';
                                W.write('No',climateCatastrophe);
                                var remainProp = W.getElementById('remainProp');
                                remaining = node.game.endowment_proposer;
                                node.game.remainProp = remaining.toString();
                                W.write(remaining.toString(),remainProp);
                                var remainResp = W.getElementById('remainResp');
                                remResp = node.game.endowment_responder;
                                W.write(remResp.toString(),remainResp);
                            }
                            else {
                                W.write('A climate catastrophe has happened and destroyed a part of your endowment.', result3);
                                var climateCatastrophe = W.getElementById('climateCatastrophe');
                                node.game.catastrophe =  'Yes';
                                W.write('Yes',climateCatastrophe);
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
                            var agreement = W.getElementById('agreement');
                            W.write('No',agreement);

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
                                    // profitPeriods[node.game.currentRound - 1] = node.game.results.profit;
                            };
                        });
                    }
                });
            });
        }

        /////////////////////////////////// RESPONDENT ///////////////////////////////////
        else if (node.game.role == 'RESPONDENT') {
            W.loadFrame(node.game.url_resp, function() {
                if (node.player.stage.round == 1) {
                    // Test Round
                    var practice2 = W.getElementById('practice2');
                    practice2.style.display = '';
                }
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
                            milliseconds: 2000, //60000, // 120000 ms is equivalent to 2 minutes
                            timeup: function() {
                                node.game.timer.stop();
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


    ////////////////////////////QUESTIONAIRE ////////////////////////////

    function questionnaire() {

        function randomOrderQuestionnaire() {
            var randomBlockExecutor;
            var socialValueOrientation, newEcologicalParadigm, risk;

            // Initializing storage.
            node.game.questionnaire = {};


            // Makes a callback which loads a single questionnaire page and
            // listens to onclick of the element with id 'done', to write
            // currentAnswer to database and advance the executor.
            function makePageLoad(block, page, onDoneCallback, onLoadCallback) {
                return function(executor) {
                    W.loadFrame('/burdenRAHR/html/questionnaire/'+ block + '/' +
                        page + '.html', function() {
                            if (onLoadCallback) {
                                onLoadCallback(block, page);
                            }
                            node.timer.setTimestamp(block + '/' + page);
                            W.getElementById('done').onclick =function() {
                                var questionnaire =
                                    node.game.questionnaire;
                                if (onDoneCallback) {
                                        onDoneCallback(block,page);
                                }
                                if (questionnaire.currentAnswerMade) {
                                    node.set('bsc_data',{
                                        player: node.game.ownID,
                                        question: block + '/' + page,
                                        answer: questionnaire.currentAnswer,
                                        timeElapsed:
                                            node.timer.getTimeSince(block +
                                                '/' + page),
                                        clicks: questionnaire.numberOfClicks
                                    });
                                    executor.next();
                                }
                                else {
                                    alert('Please select an option.');
                                }
                            };
                        }
                    );
                };
            }

            // Makes an array of page load callbacks
            function makeBlockArray(block, pages, onDoneCallback, onLoadCallback) {
                var i, result = [];
                for (i = 0; i < pages.length; ++i) {
                    result.push(
                        makePageLoad(
                            block,
                            pages[i],
                            onDoneCallback,
                            onLoadCallback
                    ));
                }
                return result;
            }


            randomBlockExecutor = new RandomOrderExecutor();

            // Callback for the Social Value Orientation block.
            // Loads all of the SVO questions in an random order.
            socialValueOrientation = function(randomBlockExecutor) {
                var randomPageExecutor = new RandomOrderExecutor();
                node.game.questionnaire.SVOChoices = {length: 0};
                randomPageExecutor.setCallbacks(
                    makeBlockArray(
                        'socialValueOrientation',
                        ['1', '2','3','4','5','6'],
                        function(block,page) {
                            node.game.questionnaire.SVOChoices[page] =
                                node.game.questionnaire.currentAnswer;
                            node.game.questionnaire.SVOChoices.length++;
                        }
                    )
                );
                randomPageExecutor.setOnDone(function() {
                    node.set('Adjust_Profit',{
                        choices: node.game.questionnaire.SVOChoices,
                        player: node.game.ownID
                    });
                    randomBlockExecutor.next();
                });

                // At the beginning of the block is an instructions page.
                W.loadFrame('/burdenRAHR/html/questionnaire/' +
                    'socialValueOrientation/instructions.html', function() {
                        W.getElementById('done').onclick = function() {
                            randomPageExecutor.execute();
                        };
                    }
               );
            };

            // Callback for the New Ecological Paradigm block.
            // Loads all of the NEP questions in an random order.
            newEcologicalParadigm = function(randomBlockExecutor) {
                var randomPageExecutor = new RandomOrderExecutor();
                var numberOfQuestions = 15;
                var questionsPerPage = 5;
                var i;
                var pageName = 'allNEP';
                var pageNameArray = [];

                for (i = 0; i < numberOfQuestions; i += questionsPerPage) {
                    pageNameArray = pageNameArray.concat([pageName]);
                }
                node.game.questionnaire.NEPQuestions = [];
                for (i = 0; i < numberOfQuestions; ++i) {
                    node.game.questionnaire.NEPQuestions[i] =
                    {
                        position: i,
                        questionId: 'Question' + i,
                        rank: Math.random()
                    }
                }


                randomPageExecutor.setCallbacks(
                    makeBlockArray(
                        'newEcologicalParadigm',
                         pageNameArray,
                         false,
                         function() {
                            // Unhides `numberOfQuestions` questions on the
                            // page.
                            var NEPQuestions =
                                node.game.questionnaire.NEPQuestions;
                            var question, i;
                            var currentAnswersMade =
                                W.getFrame().contentWindow.currentAnswersMade;

                            NEPQuestions.sort(function(left,right) {
                               return left.rank < right.rank ? -1 : 1;
                            });
                            // Unhides the 5 questions with lowest rank.
                            for (i = 0; i < numberOfQuestions; ++i){
                                if (i < questionsPerPage) {
                                    NEPQuestions[i].rank = 2; // Push to back.
                                }
                                // Hide the question.
                                else {
                                    currentAnswersMade[
                                        NEPQuestions[i].position
                                    ] = true;
                                    question = W.getElementById(
                                        NEPQuestions[i].questionId
                                    );
                                    question.style.display = "none";
                                }
                            }
                         }
                     )
                );
                randomPageExecutor.setOnDone(function() {
                    randomBlockExecutor.next();
                });

                // At the beginning of the block is an instructions page.
                W.loadFrame('/burdenRAHR/html/questionnaire/' +
                    'newEcologicalParadigm/instructions.html', function() {
                        W.getElementById('done').onclick = function() {
                            randomPageExecutor.execute();
                        };
                    }
               );
            };

            // Callback for the Risk block.
            risk = function(randomBlockExecutor) {
                var randomPageExecutor = new RandomOrderExecutor();

                randomPageExecutor.setCallbacks(
                    makeBlockArray('risk', [
                        'doubleOrNothing','gambles', 'patience', 'riskTaking',
                        'trusting','charity'
                    ])
                );

                randomPageExecutor.setOnDone(function () {
                    randomBlockExecutor.next();
                });
                randomPageExecutor.execute();
            };

            // Callback for the demographics block.
            // This block is NOT randomized!
            demographics = function() {
                var linearPageExecutor = {
                    // Begin execution of the callbacks.
                    execute: function() {
                        this.index = 1;
                        this.callbacks[0](this);
                    },
                    // Advance to net callback or call done.
                    next: function() {
                        if (this.index < this.callbacks.length) {
                            this.callbacks[this.index++](this);
                        }
                        else {
                            this.done();
                        }
                    },
                    // Final operation
                    done: function() {
                        W.loadFrame('/burdenRAHR/html/profit_adjustment.html',
                            function() {
                                W.getElementById('continue').onclick =
                                    function() {
                                        node.game.timeQuest1 =
                                            Math.round(Math.abs(
                                                node.game.timeQuest1 -
                                                    Date.now())/1000
                                            );
                                        node.game.timer.stop();
                                        node.say("QUEST_DONE", "SERVER",
                                            node.game.bonus.newAmountUSD);
                                    };
                                W.write(node.game.bonus.newAmountUCE,
                                    W.getElementById("amountECU")
                                );
                                W.write(node.game.bonus.oldAmountUCE,
                                    W.getElementById("ECUfromGame")
                                );
                                W.write(node.game.bonus.newAmountUCE -
                                        node.game.bonus.oldAmountUCE,
                                            W.getElementById("ECUfromQuest")
                                );
                                W.write(node.game.bonus.newAmountUSD + 1.0,
                                    W.getElementById("amountUSD")
                                );
                            }
                        );
                    }
                };

                linearPageExecutor.callbacks = makeBlockArray('demographics', [
                    'gender','politics', 'participation', 'occupation',
                    'income','dateOfBirth','education']);

                // Add politics page. (Because of the textfield it requires
                // special treatement)
                linearPageExecutor.callbacks.splice(3,0,
                    makePageLoad('demographics','politics', function() {
                        // If option 'other' is selected
                        if (node.game.questionnaire.currentAnswer == 5) {
                            if (W.getElementById('textForOther').value !== "") {
                                node.game.questionnaire.currentAnswer =
                                    W.getElementById('textForOther').value;
                                node.game.questionnaire.currentAnswerMade =
                                    true;
                            }
                        }
                    })
                );
                linearPageExecutor.execute();
            };

            // Execute the SVO, NEP and RISK block in random order, then execute
            // demographics.
            randomBlockExecutor.execute([newEcologicalParadigm], demographics);

        }

        // shows last page if dk.checkout has been called

        document.getElementById('state').innerHTML = "End of Game - Questionnaire";

        node.set('get_Profit',node.game.ownID);

        node.on.data("win", function(msg) {
            // W.clearFrame();
            function showWin() {
                W.loadFrame('/burdenRAHR/html/ended.html', function() {
                    W.writeln("Exit code: " + msg.data);
                    node.game.timer.stop();
                    node.game.timer.setToZero();
                });

            }
            setTimeout(function() {showWin();}, 500);
        });

        node.on("in.say.DATA", function(msg) {
            var bonus;

            // if (msg.text == "win") {}
            console.log(msg.text);
            if (msg.text == "PROFIT") {
                console.log("Payout round: " + msg.data.Payout_Round);
                console.log("Profit: " + msg.data.Profit);



                if (msg.data.Payout_Round != "none") {
                    node.game.bonus = node.game.globals.round((msg.data.Profit/50),2);
                    console.log("Bonus: " + node.game.bonus);
                    W.loadFrame('/burdenRAHR/html/questionnaire1.html', function() {
                        var payoutText = W.getElementById("payout");
                        W.write("Payout so far: " + msg.data.Payout_Round, payoutText);
                        var round = W.getElementById("payoutRound");
                        W.write(msg.data.Payout_Round , round);
                        var amountUCE = W.getElementById("amountECU");
                        W.write(msg.data.Profit + " ECU" , amountUCE);
                        var amountUSD = W.getElementById("amountUSD");
                        var profitUSD = node.game.bonus + 1.0;
                        console.log("Profit" + profitUSD);
                        W.write(profitUSD + " $" , amountUSD);

                        node.game.timeResult = Date.now();
                        var options = {
                            milliseconds: 2000, //60000, // 30000 ms is equivalent to 30 seconds
                            timeup: function() {
                                node.game.timeResult = Math.round(Math.abs(node.game.timeResult - Date.now())/1000);
                                var timeResultProp = {
                                    Player_ID : node.game.ownID,
                                    timeResult: node.game.timeResult
                                };
                                // node.set('bsc_questionnaireTime',timeResultProp);
                                questionnaire(1);
                            }
                        };

                        node.game.timer.init(options);
                        node.game.timer.updateDisplay();
                        node.game.timer.start(options);

                        var quest2 = W.getElementById('continue');
                        quest2.onclick = function () {
                            node.game.timeResult = Math.round(Math.abs(node.game.timeResult - Date.now())/1000);
                            var timeResultProp = {
                                Player_ID : node.game.ownID,
                                timeResult: node.game.timeResult
                            };
                            // node.set('bsc_questionnaireTime',timeResultProp);
                            node.game.timer.stop();
                            questionnaire(0);
                        };
                    });
                }

                else {
                    node.game.bonus = 0.0;
                    W.loadFrame('/burdenRAHR/html/questionnaire12.html', function() {
                        var payoutText = W.getElementById("payout");
                        W.write("Unfortunately you did not complete any of the 3 rounds (excluding the test round) to be played. For your participation in the experiment you will be paid out a fixed amount of 1.00 $.", payoutText);

                        node.game.timeResult = Date.now();
                        var options = {
                            milliseconds: 2000, //60000, // 30000 ms is equivalent to 30 seconds
                            timeup: function() {
                                node.game.timeResult = Math.round(Math.abs(node.game.timeResult - Date.now())/1000);
                                var timeResultProp = {
                                    Player_ID : node.game.ownID,
                                    timeResult: node.game.timeResult
                                };
                                // node.set('bsc_questionnaireTime',timeResultProp);
                                questionnaire(1);
                            }
                        };
                        node.game.timer.init(options);
                        node.game.timer.updateDisplay();
                        node.game.timer.start(options);

                        var quest2 = W.getElementById('continue');
                        quest2.onclick = function () {
                            node.game.timeResult = Math.round(Math.abs(node.game.timeResult - Date.now())/1000);
                            var timeResultProp = {
                                Player_ID : node.game.ownID,
                                timeResult: node.game.timeResult
                            };
                            // node.set('bsc_questionnaireTime',timeResultProp);
                            node.game.timer.stop();
                            questionnaire(0);
                        };
                    });
                }

                console.log('Postgame including Questionaire');

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
                                //                success: {
                                //                  label: "ID is correct",
                                //                  className: "btn-success",
                                //                  callback: function() {
                                //                          var saveId = {
                                //                                Player_ID: 666
                                //                        };
                                //                          node.emit('player_id',saveId);
                                //                        <!-- node.set('player_id',saveId); -->
                                //
                                //                      location.href="http://localhost:8080/pairs/";
                                //                  }
                                //                },
                        }
                    });
                }

                // Qualtrix Questionaire iframe
                function questionnaire(timeout) {
                    console.log("Bonus: " + node.game.bonus);

                    var options = {
                        milliseconds: 1800000, // 1200000 ms is equivalent to 20 minutes
                        timeup: function() {
                            node.game.timeQuest1 = Math.round(Math.abs(node.game.timeQuest1 - Date.now())/1000);
                            // node.game.comment6 = W.getElementById('comment7').value;
                            var timeResultProp = {
                                playerID : {Player_ID: node.game.ownID},
                                add: {timeQuest1: node.game.timeQuest1}//, Question6: node.game.comment6}
                            };
                            // node.set('bsc_questTime',timeResultProp);
                            node.say("QUEST_DONE", "SERVER", node.game.bonus);
                            // node.emit('DONE');
                        }
                    };
                    node.game.timer.init(options);
                    node.game.timer.updateDisplay();
                    node.game.timer.start(options);

                    //var quest = W.getElementById('continue');
                    //quest.onclick = function() {
                        //var qualtrixID = W.getElementById("qualtrix").value;
                        //if (qualtrixID.substring(0, 1) == "R" && qualtrixID.substring(1, 2) == "_") {
                            //var surveyID = {
                                //playerID : {Player_ID: node.game.ownID},
                                //add: {Survey_ID: qualtrixID}
                            //};
                            //node.set('bsc_surveyID', surveyID);

                            //node.game.timeQuest1 = Math.round(Math.abs(node.game.timeQuest1 - Date.now())/1000);
                            //node.game.timer.stop();
                            //var timeResultProp = {
                                //playerID : {Player_ID: node.game.ownID},
                                //add: {timeQuest1: node.game.timeQuest1} //, Question6: node.game.comment6}
                            //};
                             ////node.set('bsc_questTime',timeResultProp);
                            //node.say("QUEST_DONE", "SERVER", node.game.bonus);
                            ////node.say("questionnaire_done", "SERVER");
                             ////node.emit('DONE');
                        //}
                        //else {
                            //var msg = 'Wrong ID! Please copy the character string starting with "R_" from the questionnaire box and enter it in the free textbox below.';
                            //checkID(msg);
                        //}
                    //};
                    randomOrderQuestionnaire();
                }
            }
            if (msg.text == "PROFIT_ADJUSTMENT") {
                    console.log("Profit Adjustment" + msg.data.oldAmountUCE +
                        "+" + msg.data.newAmountUCE);
                    node.game.bonus = msg.data;
            }
        });
    }


    function clearFrame() {
        node.emit('INPUT_DISABLE');
        return true;
    }

    function notEnoughPlayers() {
        //  alert('Not Enought Players');
        node.game.pause();
        W.lockScreen('One player disconnected. We are now waiting to see if ' +
                     ' he or she reconnects. If there is no reconnection within 60 seconds the game will be terminated and you will be forwarded to the questionnaire.');
    }

    function syncGroup(stage, myStageLevel, pl, game) {
        var p = node.game.pl.get(node.game.otherID);
        if (p.stageLevel === node.constants.stageLevels.DONE) {
            if (myStageLevel === node.constants.stageLevels.DONE) {
                return true;
            }
        }
    }

    stager.extendStep('instructions', {
        cb: instructions,
        minPlayers: [ 4, notEnoughPlayers ],
        steprule: stepRules.SYNC_STAGE,
        syncOnLoaded: false,
        done: clearFrame
    });

    stager.addStep({
        id: "initialSituation",
        cb: initialSituation,
        stepRule: syncGroup,
        timer: {
            milliseconds: 2000, //180000, // 120000 ms is equivalent to 2 minutes
            update: 1000,
            timeup: function() {
                node.game.timer.stop();
                node.game.timeInitialSituation = Math.round(Math.abs(node.game.timeInitialSituation - Date.now())/1000);
                node.game.timeInitialSituationResp = Math.round(Math.abs(node.game.timeInitialSituationResp - Date.now())/1000);
                var timeInitialSituation = {timeInitialSituation: node.game.timeInitialSituation};
                        // node.set('bsc_time',timeInitialSituation);
                node.emit('DONE');
            },
        }
    });

    stager.addStep({
        id: "decision",
        cb: decision,
        stepRule: syncGroup
    });

    stager.addStep({
        id: "syncGroups",
        cb: function() {
            node.socket.send(node.msg.create({
                to: 'ALL',
                text: 'Round_Over',
                data: node.player.stage.round
            }));
            node.on('GROUP_DONE', function(msg) {
                node.emit("DONE");
            });
        },
        stepRule: syncGroup
    });

    stager.extendStage('burdenSharingControl', {
        steps: ["syncGroups", "initialSituation", "decision"],
        minPlayers: [ 4, notEnoughPlayers ],
        steprule: stepRules.SYNC_STEP,
        done: clearFrame
    });

    stager.extendStep('questionnaire', {
        cb: questionnaire
    });

    stager.setDefaultGlobals({
        round: cbs.round
    });

    //We serialize the game sequence before sending it
    game.plot = stager.getState();

    //Let's add the metadata information
    game.metadata = {
        name: 'burdenSharingControl',
        version: '0.0.2',
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

    game.window = {
        promptOnleave: true
    };

    return game;
};
