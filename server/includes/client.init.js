/**
 * # Functions used by the Client of Burden-share Game
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

module.exports = init;

function init() {

    console.log('INIT PLAYER!');

    // Polyfills

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now
    if (!Date.now) {
        Date.now = function now() {
            return new Date().getTime();
        };
    }

    // http://stackoverflow.com/questions/2790001/fixing-javascript-array-functions-in-internet-explorer-indexof-foreach-etc
    if (!('indexOf' in Array.prototype)) {
        Array.prototype.indexOf= function(find, i /*opt*/) {
            if (i===undefined) i= 0;
            if (i<0) i+= this.length;
            if (i<0) i= 0;
            for (var n= this.length; i<n; i++)
                if (i in this && this[i]===find)
                    return i;
            return -1;
        };
    }
    if (!('lastIndexOf' in Array.prototype)) {
        Array.prototype.lastIndexOf= function(find, i /*opt*/) {
            if (i===undefined) i= this.length-1;
            if (i<0) i+= this.length;
            if (i>this.length-1) i= this.length-1;
            for (i++; i-->0;) /* i++ because from-argument is sadly inclusive */
                if (i in this && this[i]===find)
                    return i;
            return -1;
        };
    }

    // Clear the WaitPage, if still there.
    var waitingForPlayers = W.getElementById('waitingForPlayers');
    var that = this;

    var gameName = node.game.globals.gameName;
    var chosenTreatment = node.game.globals.chosenTreatment;

    if (waitingForPlayers) {
        waitingForPlayers.style.display = 'none';
    }

    // Clear countdown interval.
    if ('undefined' !== typeof timeCheck) {
        clearInterval(timeCheck);
    }

    function sendDataToServer() {
        var dataExist, answerQR;

        answerQR = W.getElementById('questRounds').value;
        node.game.results.P_QuestRound = answerQR;

        // Check if data for playerID
        // and current round already exists.
        dataExist = {
            Player_ID: node.player.id,
            Current_Round: node.player.stage.round
        };

        // Call data base and check existence of data.
        // Triggers a msg CheckData.
        node.set('check_Data', dataExist);
        
        node.on.data('CheckData', function(msg) {
            console.log('Current Round: ' + msg.data[0]);
            if ('undefined' !== typeof msg.data[0]) {
                // If data already exists, delete and save the new data
                console.log('Data Exist: ' + dataExist.Player_ID);
                node.set('delete_data', dataExist);
                console.log('Player already finished this round.');
            }
            node.set('bsc_data', node.game.results);
            that.endOfQuestionsround();
        });
    }
    

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

    // condition for one of the two game versions
    if (node.game.costGE === 30) {
        node.game.url_bidder = '/burdenshare/html/bidder_30.html';
        node.game.url_resp = '/burdenshare/html/resp_30.html';
        node.game.url_initprop = '/burdenshare/html/initialSituationProp_30.htm';
        node.game.url_initresp = '/burdenshare/html/initialSituationResp_30.htm';
        node.game.url_preGame = '/burdenshare/html/preGame_30.html';
        node.game.url_instructionsFrame = '/burdenshare/html/' + gameName +
            '/instructions_full_30.html';
    }
    else if (node.game.costGE === 80) {
        node.game.url_bidder = '/burdenshare/html/bidder_80.html';
        node.game.url_resp = '/burdenshare/html/resp_80.html';
        node.game.url_initprop = '/burdenshare/html/initialSituationProp_80.htm';
        node.game.url_initresp = '/burdenshare/html/initialSituationResp_80.htm';
        node.game.url_preGame = '/burdenshare/html/preGame_80.html';
        node.game.url_instructionsFrame = '/burdenshare/html/' + gameName +
            '/instructions_full_80.html';
    }

    // Generate header and frame.
    W.generateHeader();
    W.generateFrame();

    node.game.visualRound = node.widgets.append('VisualRound', W.getHeader());
    node.game.timer = node.widgets.append('VisualTimer', W.getHeader());


    // Function called as soon as proposer made his offer (bid).
    node.on('BID_DONE', function(offer, to) {
        var timeMakingOffer, bidDone, span_dots;

        node.game.timeMakingOffer =
            Math.round(Math.abs(node.game.timeMakingOffer - Date.now())/1000);
        timeMakingOffer = {timeMakingOffer: node.game.timeMakingOffer};

        W.getElementById('submitOffer').disabled = 'disabled';
        bidDone = W.getElementById('offered');
        bidDone.innerHTML = ' You offer to pay ' +  offer.toString() +
            '. Please wait until the experiment continues <br> <span id="span_dots">.</span> ';

        span_dots = W.getElementById('span_dots');
        // Refreshing the dots...
        setInterval(function() {
            if (span_dots.innerHTML !== '......') {
                span_dots.innerHTML = span_dots.innerHTML + '.';
            }
            else {
                span_dots.innerHTML = '.';
            }
        }, 1000);

        node.say('OFFER', node.game.otherID, offer);
    });

    // Function called as soon as proposer has finished the current round.
    node.on('PROPOSER_DONE', function() {

        node.game.timeResultProp =
            Math.round(Math.abs(node.game.timeResultProp - Date.now())/1000);

        // short question at the end of each round
        W.loadFrame('/burdenshare/html/questionRounds_prop.html', function() {
            var options, quest, string, next;

            node.game.timequestionsRounds = Date.now();

            options = {
                // Count down time.
                milliseconds: node.game.globals.timer.propDone,
                // if count down elapsed and no action has been taken by participant function is called
                timeup: function() {

                    node.game.timequestionsRounds =
                        Math.round(Math.abs(node.game.timequestionsRounds - Date.now())/1000);

                    node.game.timer.stop();
                    this.disabled = "disabled";

                    sendDataToServer();
                }
            };

            node.game.timer.init(options);
            node.game.timer.updateDisplay();
            node.game.timer.start(options);

            // Build Tables for presentation and results - 2
            node.game.globals.buildTables();

            // short question at the end of each round
            quest = W.getElementById("quest");
            if (node.game.decisionOffer === 1) {
                string = 'Why did you propose ' + node.game.proposal + ' ECU ?';
                W.write(string, quest);
            }
            else {
                quest.style.display = 'none';
                W.getElementById("questRounds").style.display = 'none';
            }

            next = W.getElementById("continue");
            next.onclick = function() {
                sendDataToServer();
            };
        });
    });


    // Function called as soon as responder has finished the current round.
    node.on('RESPONDER_DONE', function(data) {
        var quest, string, next;

        node.game.timeResultResp =
            Math.round(Math.abs(node.game.timeResultResp - Date.now())/1000);

        console.log("Time InitResp:" + node.game.timeInitSituaResp);

        // Check if data for playerID
        // and current round already exists.
        W.loadFrame('/burdenshare/html/questionRounds_resp.html', function() {
            var options;

            node.game.timequestionsRounds = Date.now();

            options = {
                milliseconds: node.game.globals.timer.respondentDone,
                timeup: function() {
                    var answerQR, dataExist;
                    node.game.timequestionsRounds =
                        Math.round(Math.abs(node.game.timequestionsRounds - Date.now())/1000);

                    node.game.timer.stop();
                    this.disabled = "disabled";

                    answerQR = W.getElementById('questRounds').value;
                    node.game.results.R_QuestRound = answerQR;

                    // Check if data for playerID
                    // and current round already exists.
                    dataExist = {
                        Player_ID: data.Player_ID,
                        Current_Round: node.player.stage.round
                    };

                    node.set('check_Data', dataExist);

                    node.on("in.say.DATA", function(msg) {
                        if (msg.text == "CheckData") {
                            console.log('Current Round: ' + msg.data[0]);
                            if ('undefined' !== typeof msg.data[0]) {
                                console.log('Data Exist: ' + dataExist.Player_ID);
                                node.set('delete_data', dataExist);
                                console.log('Player already finished this round.');
                            }
                            node.set('bsc_data',node.game.results);
                            that.endOfQuestionsround();
                        }
                    });
                }
            };

            node.game.timer.init(options);
            node.game.timer.updateDisplay();
            node.game.timer.start(options);

            // Build Tables for presentation and results. - 1
            node.game.globals.buildTables();

            // Short question at the end of each round
            quest = W.getElementById("quest");
            if (node.game.decisionResponse === 1) {
                string = 'Why did you ' + node.game.response + ' the proposal ?';
                W.write(string, quest);
            }
            else {
                quest.style.display = 'none';
                W.getElementById("questRounds").style.display = 'none';
            }

            next = W.getElementById("continue");
            next.onclick = function() {
                var answerQR, datExist;

                answerQR = W.getElementById('questRounds').value;
                node.game.results.R_QuestRound = answerQR;

                // Check if data for playerID
                // and current round already exists
                dataExist = {
                    Player_ID: data.Player_ID,
                    Current_Round: node.player.stage.round
                };

                node.set('check_Data', dataExist);
                node.on("in.say.DATA", function(msg) {
                    if (msg.text == "CheckData") {
                        console.log('Current Round: ' + msg.data[0]);
                        if ('undefined' !== typeof msg.data[0]) {
                            console.log('Data Exist: ' + dataExist.Player_ID);
                            node.set('delete_data', dataExist);
                            console.log('Player already finished this round.');
                        }
                        node.set('bsc_data',node.game.results);
                        that.endOfQuestionsround();
                    }
                });
            };
        });
    });

    // Function called as soon as responder made his descision (accept or reject the offer)
    node.on('RESPONSE_DONE', function(response, offer, from) {
        node.game.timeResponse =
            Math.round(Math.abs(node.game.timeResponse - Date.now())/1000);

        W.loadFrame('/burdenshare/html/resultResponder.html', function() {
            var options, proceed;
            var catastrObj;

            var cc, acceptPlayer;

            if (node.player.stage.round == 1) {
                // Test Round.
                W.getElementById('practice3').style.display = '';
                W.getElementById('practice' +
                    (response ==='ACCEPT' ? 'Accept' : 'Reject')
                ).style.display = '';
            }
            node.game.timeResultResp = Date.now();

            // Start the timer.
            options = {
                milliseconds: node.game.globals.timer.responseDone,
                timeup: function() {
                    node.game.timer.stop();
                    this.disabled = "disabled";
                    node.emit('RESPONDER_DONE', node.game.results,
                              node.game.ownID);
                }
            };

            node.game.timer.restart(options);

            catastrObj = {
                cc: 0,
                offer: offer
            };

            if (response === 'ACCEPT') {
                node.say('ACCEPT', node.game.otherID, catastrObj);
                acceptPlayer = 1;
                cc = 0;

                // Display to the user.
                node.game.globals.writeOfferAccepted(offer);
            }
            else {
                acceptPlayer = 0;

                catastrObj.remainEndowResp = node.game.endowment_responder;

                // A climate catastrophe will happen with a
                // probability of node.game.ClimateRisk.
                if (Math.random() <= (node.game.ClimateRisk/100)) {
                    // Climate catastrophy happened.
                    catastrObj.cc = 1;
                    catastrObj.remainEndowResp = node.game.endowment_responder/2;
                    cc = 1;
                    node.game.globals.writeCatastrophe();
                }
                else {
                    // Climate catastrophy did not happen.
                    cc = 0;
                    node.game.globals.writeNoCatastrophe();
                }

                // Practice round.
                if (node.player.stage.round === 1) {
                    W.getElementById('practice' + (cc === 0 ? 'No':'') +
                        'Catastrophe').style.display = '';
                }
                node.say('REJECT', node.game.otherID, catastrObj);
                node.game.globals.writeOfferRejected();
            }

            // These values are stored in the mongoDB data base table called bsc_data
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
                Profit: node.game.remainNum,
                R_QuestRound: '',
                Endow_Resp: node.game.endowment_responder,
                RiskContrib_R: node.game.riskOwn,
                GroupRisk: (node.game.riskOwn + node.game.riskOther + 15)
            };

            proceed = W.getElementById('continue');
            proceed.onclick = function() {
                node.game.timer.stop();
                this.disabled = "disabled";
                node.emit('RESPONDER_DONE', node.game.results, node.game.ownID);
            };
        });
    });

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


    this.endOfQuestionsround = function() {
        var options = {};

        if (node.player.stage.round !== 1) {
            node.emit('DONE');
        }
        else {
            node.game.timer.stop();
            node.game.timer.setToZero();

            options.milliseconds = node.game.globals.timer.endOfPractice;
            options.timeup = function() {
                node.game.timer.stop();
                node.emit('DONE');
            };

            node.game.timer.init(options);
            node.game.timer.updateDisplay();
            node.game.timer.start(options);

            W.loadFrame('/burdenshare/html/practiceDone.html', function() {
                W.getElementById('continue').onclick = function() {
                    node.emit('DONE');
                };
            });
        }
    };

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
    this.isValidBid = function(n) {
        // Only numbers, no decimals.
        var regex = /^[0-9\b]+$/;
        if (!regex.test(n)) return false;

        var r = parseFloat(n);
        n = parseInt(n);

        return !isNaN(n) && isFinite(n) && (r === n) && n >= 0 &&
            n <= node.game.costGE;
    };
}
