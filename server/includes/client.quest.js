/**
 * # Functions used by the Client of Burden-share Game
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

module.exports = questionnaire;

function questionnaire() {

    var gameName = node.game.globals.gameName;
    var chosenTreatment = node.game.globals.chosenTreatment;
    var randomBlockExecutor;
    var socialValueOrientation, newEcologicalParadigm, risk;
    var makePageLoad, makeBlockArray;

    // The first time this stage is executed, we set all listeners and callbacks
    // We also initialize node.game.questionnaire, which is why we use it for
    // this check.
    if ('undefined' === typeof node.game.questionnaire) {
        node.game.visualRound.setDisplayMode(['COUNT_UP_STAGES_TO_TOTAL',
                                              'COUNT_UP_ROUNDS_TO_TOTAL']);


        // Initializing storage.
        node.game.questionnaire = {};

        randomBlockExecutor = new RandomOrderExecutor();

        // Makes a callback which loads a single questionnaire page and
        // listens to onclick of the element with id 'done', to write
        // currentAnswer to database and advance the executor.
        makePageLoad = function(block, page, onDoneCallback, onLoadCallback) {
            return function(executor) {
                W.loadFrame('/burdenshare/html/questionnaire/'+ block + '/' +
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
                                        node.emit("DONE");
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
        makeBlockArray = function(block, pages,
                                  onDoneCallback, onLoadCallback) {
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

        // Callback for the Social Value Orientation block.
        // Loads all of the SVO questions in an random order.
        socialValueOrientation = function(randomBlockExecutor) {
            var randomPageExecutor = new RandomOrderExecutor();
            node.game.questionnaire.pageExecutor = randomPageExecutor;
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
                node.set('add_questionnaire_bonus',{
                    choices: node.game.questionnaire.SVOChoices,
                    player: node.game.ownID
                });
                randomBlockExecutor.next();
            });

            // At the beginning of the block is an instructions page.
            W.loadFrame('/burdenshare/html/questionnaire/' +
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
            var numberOfQuestions = 15;
            var questionsPerPage = 5;
            var i;
            var questionsDone = 0
            var pageName = 'allNEP';
            var pageNameArray = [];

            var loadAllNEP = function() {
                W.loadFrame('/burdenshare/html/questionnaire/' +
                        'newEcologicalParadigm/allNEP.html', function() {
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
                    for (i = 0; i < numberOfQuestions; ++i) {
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
                    W.getElementById('done').onclick = function() {
                        var questionnaire =
                            node.game.questionnaire;

                        if (questionnaire.currentAnswerMade) {
                            questionsDone += questionsPerPage;
                            if (questionsDone < numberOfQuestions) {
                                node.emit("DONE");
                            }
                            else {
                                finishNEP();
                            }
                        }
                        else {
                            alert('Please select an option.');
                        }
                    };
                });
            }
            var finishNEP = function() {
                node.set('bsc_data',{
                    player: node.game.ownID,
                    question: 'newEcologicalParadigm',
                    answer: node.game.questionnaire.currentAnswer,
                    timeElapsed:
                    node.timer.getTimeSince('newEcologicalParadigm'),
                    clicks: questionnaire.numberOfClicks
                });
                randomBlockExecutor.next();
            }
            node.game.questionnaire.pageExecutor = {
                next: loadAllNEP
            };

            node.game.questionnaire.NEPQuestions = [];
            for (i = 0; i < numberOfQuestions; ++i) {
                node.game.questionnaire.NEPQuestions[i] = {
                    position: i,
                    questionId: 'Question' + i,
                    rank: Math.random()
                };
            }

            node.timer.setTimestamp('newEcologicalParadigm');
            // At the beginning of the block is an instructions page.
            W.loadFrame('/burdenshare/html/questionnaire/' +
                        'newEcologicalParadigm/instructions.html', function() {
                            W.getElementById('done').onclick = function() {
                                loadAllNEP();
                            };
                        }
                       );

        };

        // Callback for the Risk block.
        risk = function(randomBlockExecutor) {
            var randomPageExecutor = new RandomOrderExecutor();
            node.game.questionnaire.pageExecutor = randomPageExecutor;

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
                    W.loadFrame('/burdenshare/html/questionnaire' +
                                '/profit_adjustment.html', function() {
                                    W.getElementById(
                                        'continue'
                                    ).onclick = function() {
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
                                    W.write(
                                        node.game.bonus.newAmountUCE -
                                            node.game.bonus.oldAmountUCE,
                                        W.getElementById("ECUfromQuest")
                                    );
                                    W.write((node.game.bonus.newAmountUSD
                                            + 1.0).toFixed(2) +
                                            ' $',
                                        W.getElementById("amountUSD")
                                    );
                                }
                    );
                }
            };

            node.game.questionnaire.pageExecutor = linearPageExecutor;

            linearPageExecutor.callbacks = makeBlockArray('demographics', [
                'gender', 'education', 'dateOfBirth', 'politics', 'income',
                'occupation', 'participation']);

            // Add politics page. (Because of the textfield it requires
            // special treatement)
            linearPageExecutor.callbacks[3] = makePageLoad(
                'demographics',
                'politics',
                function() {
                    // If option 'other' is selected
                    if (node.game.questionnaire.currentAnswer == 5) {
                        if (W.getElementById('textForOther').value !== "") {
                            node.game.questionnaire.currentAnswer =
                                W.getElementById('textForOther').value;
                            node.game.questionnaire.currentAnswerMade =
                                true;
                        }
                    }
                }
            );
            linearPageExecutor.execute();
        };

        // Setup to execute the SVO, NEP and RISK block in random order, then
        // execute demographics.
        randomBlockExecutor.setCallbacks(
            [
                newEcologicalParadigm,
                socialValueOrientation,
                risk
            ]
        );
        randomBlockExecutor.setOnDone(
            demographics
        );

        // Listeners for PROFIT DATA in the on the very first round.
        node.on("in.say.DATA", function(msg) {
            var bonus;

            console.log(msg.text);
            if (msg.text == "PROFIT") {
                console.log("Payout round: " + msg.data.Payout_Round);
                console.log("Profit: " + msg.data.Profit);

                if (msg.data.Payout_Round !== "none") {
                    node.game.bonus = node.game.globals.round((msg.data.Profit/50),2);
                    console.log("Bonus: " + node.game.bonus);
                    W.loadFrame('/burdenshare/html/' + gameName + '/questionnaire1.html', function() {
                        var payoutText = W.getElementById("payout");
                        payoutText.innerHTML = "<strong>Payout so far: </strong>";
                        var round = W.getElementById("payoutRound");
                        W.write(msg.data.Payout_Round , round);
                        var amountUCE = W.getElementById("amountECU");
                        W.write(msg.data.Profit + " ECU" , amountUCE);
                        var amountUSD = W.getElementById("amountUSD");
                        var profitUSD = (node.game.bonus + 1.0).toFixed(2);
                        console.log("Profit" + profitUSD);
                        W.write(profitUSD + " $" , amountUSD);

                        node.game.timeResult = Date.now();

                        var options = {
                            milliseconds:  node.game.globals.timer.questProfit,
                            timeup: function() {
                                node.game.timeResult =
                                    Math.round(Math.abs(node.game.timeResult - Date.now())/1000);
                                var timeResultProp = {
                                    Player_ID : node.game.ownID,
                                    timeResult: node.game.timeResult
                                };
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
                            node.game.timer.stop();
                            questionnaire(0);
                        };
                    });
                }

                else {
                    node.game.bonus = 0.0;
                    W.loadFrame('/burdenshare/html/' + gameName + '/questionnaire12.html', function() {
                        var payoutText = W.getElementById("payout");
                        W.write("Unfortunately you did not complete any of the 3 rounds (excluding the test round) to be played. For your participation in the experiment you will be paid out a fixed amount of 1.00 $.", payoutText);

                        node.game.timeResult = Date.now();
                        var options = {
                            milliseconds: node.game.globals.timer.questProfit,
                            timeup: function() {
                                node.game.timeResult =
                                    Math.round(Math.abs(node.game.timeResult - Date.now())/1000);
                                var timeResultProp = {
                                    Player_ID : node.game.ownID,
                                    timeResult: node.game.timeResult
                                };
                                questionnaire(1);
                            }
                        };
                        node.game.timer.init(options);
                        node.game.timer.updateDisplay();
                        node.game.timer.start(options);

                        var quest2 = W.getElementById('continue');
                        quest2.onclick = function () {
                            node.game.timeResult =
                                Math.round(Math.abs(node.game.timeResult - Date.now())/1000);
                            var timeResultProp = {
                                Player_ID : node.game.ownID,
                                timeResult: node.game.timeResult
                            };
                            node.game.timer.stop();
                            questionnaire(0);
                        };
                    });
                }

                console.log('Postgame including Questionaire');

                // Goto questionnaire.
                function questionnaire(timeout) {
                    console.log("Bonus: " + node.game.bonus);

                    var options = {
                        milliseconds: node.game.globals.timer.questionnaire,
                        timeup: function() {
                            node.game.timeQuest1 = Math.round(Math.abs(node.game.timeQuest1 - Date.now())/1000);
                            var timeResultProp = {
                                playerID : {Player_ID: node.game.ownID},
                                add: {timeQuest1: node.game.timeQuest1}
                            };
                            node.say("QUEST_DONE", "SERVER", node.game.bonus);
                        },
                        stopOnDone: false
                    };
                    node.game.timer.init(options);
                    node.game.timer.updateDisplay();
                    node.game.timer.start(options);

                    randomBlockExecutor.execute();
                }
            }
        });


        // Request profit.
        node.set('get_Profit',node.game.ownID);
    }
    // If questionnaire is defined, we are repeating the stage.
    // We do not do the initialization.
    else {
        node.on("in.say.DATA", function(msg) {
            if (msg.text == 'ADDED_QUESTIONNAIRE_BONUS') {
                console.log("Profit Adjustment" + msg.data.oldAmountUCE +
                            "+" + msg.data.newAmountUCE);
                node.game.bonus = msg.data;
            }
        });

        node.on.data("win", function(msg) {
            if (msg.text === "win") {
                // W.clearFrame();
                W.loadFrame('/burdenshare/html/' + gameName + '/ended.html', function() {
                    W.writeln("Exit code: " + msg.data);
                    node.game.timer.stop();
                    node.game.timer.setToZero();
                });
            }
        });

        node.game.questionnaire.pageExecutor.next();
    }
}
