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
    var Page, SVOPage, RiskPage, NEPPage, DemographicsPage;

    // The first time this stage is executed, we set all listeners and callbacks
    // We also initialize node.game.questionnaire, which is why we use it for
    // this check.
    // If questionnaire is defined, we are repeating the stage.
    if ('undefined' !== typeof node.game.questionnaire) {
        node.game.questionnaire.pageExecutor.next();
        return;
    }


    node.timer.setTimestamp("BEGIN_QUESTIONNAIRE");
    node.game.visualRound.setDisplayMode(['COUNT_UP_STAGES_TO_TOTAL',
                                          'COUNT_UP_ROUNDS_TO_TOTAL']);


    // Initializing storage.
    node.game.questionnaire = {
        blocks: [],
        SVOChoices: {length: 0},
    };

    randomBlockExecutor = new RandomOrderExecutor();

    // Makes a callback which loads a single questionnaire page and
    // listens to onclick of the element with id 'done', to write
    // currentAnswer to database and emit "DONE".

    makePageLoad = function(page) {
        return function() {
            debugger;
            page.load();
        };
    };

    Page = function(block, name) {
        this.name = block + '/' + name;
        this.html = '/burdenshare/html/questionnaire/' + block + '/' +
                        name + '.html';
    };

    Page.prototype.load = function() {
        var that = this;
        W.loadFrame(this.html, function() {
            that.onLoad();
            W.getElementById('done').onclick = function() {
                that.onDone();
            };
        });
    };

    Page.prototype.onLoad = function() {
        node.timer.setTimestamp(this.name);
    };

    Page.prototype.onDone = function() {
        if (this.checkAnswer()) {
            this.onValidAnswer();
        }
        else {
            this.onInvalidAnswer();
        }
    };

    Page.prototype.checkAnswer = function() {
        return 'undefined' !== typeof node.game.questionnaire.currentAnswer;
    };

    Page.prototype.onValidAnswer = function() {
        node.set('bsc_data', {
            player:         node.game.ownID,
            question:       this.name,
            answer:         node.game.questionnaire.currentAnswer,
            timeElapsed:    node.timer.getTimeSince(this.name),
            clicks:         node.game.questionnaire.numberOfClicks
        });
        this.cleanUp();
    };

    Page.prototype.cleanUp = function() {
        node.game.questionnaire.currentAnswer = undefined;
        node.game.questionnaire.numberOfClicks = 0;
        node.emit("DONE");
    };

    Page.prototype.onInvalidAnswer = function() {
        node.game.globals.checkID(
            'Please select an option.'
        );
    };

    SVOPage = function(number) {
        this.number = number;
        Page.call(this, 'socialValueOrientation', this.number);
    };

    SVOPage.prototype = Object.create(Page.prototype);
    SVOPage.prototype.constructor = SVOPage;
    SVOPage.prototype.onValidAnswer = function () {
        node.game.questionnaire.SVOChoices[this.number] =
            node.game.questionnaire.currentAnswer;
        node.game.questionnaire.SVOChoices.length++;
        Page.prototype.onValidAnswer.call(this);
    };

    RiskPage = function(name) {
        Page.call(this, 'risk', name);
    };

    RiskPage.prototype = Object.create(Page.prototype);
    RiskPage.prototype.constructor = RiskPage;

    NEPPage = function(executor) {
        this.executor = executor;
        this.numberOfQuestions = 15;
        this.questionsPerPage = 5;
        this.questionsDone = 0;
        this.order = null;
        Page.call(this, 'newEcologicalParadigm', 'allNEP');
    };

    NEPPage.prototype = Object.create(Page.prototype);
    NEPPage.prototype.constructor = NEPPage;
    NEPPage.prototype.onLoad = function() {
        var i = 0;
        var questionsBody = W.getElementById('Questions');
        var questions = questionsBody.children;

        // Shuffle the nodes (randomly the first time).
        if (!this.order) {
            this.order = W.shuffleNodes(questionsBody);
            node.game.questionnaire.currentAnswer = [];
            node.game.questionnaire.numberOfClicks = [];
        }
        else {
            W.shuffleNodes(questionsBody, this.order);
        }

        // Hide some questions such that only `questionsPerPage` questions
        // remain visible.
        for (i = 0; i < questionsDone; ++i) {
            questions[i].style.display = 'none';
        }
        for (i = questionsDone + questionsPerPage;
                i < numberOfQuestions; ++i) {
            questions[i].style.display = 'none';
        }
        Page.prototype.onLoad.call(this);
    };

    NEPPage.prototype.checkAnswer = function() {
        var i,
        currentAnswer = node.game.questionnaire.currentAnswer;
        for (i = 0; i < questionsPerPage; ++i) {
            if ('undefined' ===
                    typeof currentAnswer[i + questionsDone]) {

                return false;
            }
            return true;
        }
        return false;

    };

    NEPPage.prototype.onValidAnswer = function() {
        this.questionsDone += this.questionsPerPage;
        if (this.questionsDone >= this.numberOfQuestions) {
            node.set('bsc_data',{
                player: node.game.ownID,
                question: this.name,
                answer: node.game.questionnaire.currentAnswer,
                timeElapsed:
                node.timer.getTimeSince(this.name),
                clicks: questionnaire.numberOfClicks,
                order: this.order
            });
            this.cleanUp();
        }
    };

    NEPPage.prototype.cleanUp = function() {
            node.game.questionnaire.pageExecutor = this.executor;
            Page.prototype.cleanUp.call(this);
    };

    NEPPage.prototype.onInvalidAnswer = function() {
        node.game.globals.checkID(
            'Please select an option for each row.'
        );
    };

    DemographicsPage = function(name, next) {
        this.next = next;
        Page.call(this, 'demographics', name);
    };

    DemographicsPage.prototype = Object.create(Page.prototype);
    DemographicsPage.prototype.constructor = DemographicsPage;

    DemographicsPage.prototype.cleanUp = function() {
        node.game.questionnaire.pageExecutor = { next: next };
        Page.prototype.cleanUp.call(this);
    };


    // Callback for the Social Value Orientation block.
    // Loads all of the SVO questions in an random order.
    socialValueOrientation = function(randomBlockExecutor) {
        var randomPageExecutor = new RandomOrderExecutor();
        var callbacks = [];
        var i;

        node.game.questionnaire.blocks.push('socialValueOrientation');

        node.game.questionnaire.pageExecutor = randomPageExecutor;

        for (i = 1; i < 7; ++i) {
            callbacks[i - 1] = makePageLoad(makePageLoad(SVOPage(i)));
        }
        randomPageExecutor.setCallbacks(callbacks);

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
                            debugger;
                            randomPageExecutor.execute();
                        };
                    }
                   );
    };

    // Callback for the New Ecological Paradigm block.
    // Loads all of the NEP questions in an random order.
    newEcologicalParadigm = function(randomBlockExecutor) {
        var loadAllNEP = makePageLoad(new NEPPage(randomBlockExecutor));

        node.game.questionnaire.blocks.push('newEcologicalParadigm');

        node.game.questionnaire.pageExecutor = {
            next: loadAllNEP
        };

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
        var name, names = [
            'doubleOrNothing', 'patience', 'riskTaking', 'trusting'
        ];
        var callbacks = [];
        var charityPage = new RiskPage('charity');
        var gamblesPage = new RiskPage('gambles');
        var randomPageExecutor = new RandomOrderExecutor();
        node.game.questionnaire.pageExecutor = randomPageExecutor;

        node.game.questionnaire.blocks.push('risk');

        for (name in names) {
            callbacks.push(makePageLoad(new RiskPage(names[name])));
        }

        charityPage.checkAnswer = function() {
            // Checks if the value in the textfield is an integer in [min, max].
            var max = 1000;
            var min = 0;
            var value = W.getElementById('offer').value;
            var r = parseFloat(value);
            var n = parseInt(value);

            if (isNaN(n) || !isFinite(n) || (r !== n) || n < min || n > max) {
                return false;
            }
            else {
                return true;
            }
        };

        charityPage.onValidAnswer = function() {
            node.game.questionnaire.currentAnswer =
                W.getElementById('offer').value;
            node.game.questionnaire.numberOfClicks = 'NA';
            Page.prototype.onValidAnswer.call(this);
        };

        charityPage.onInvalidAnswer = function() {
            node.game.globals.checkID('Please choose a whole ' +
                'number between 0 and 1000');
        };

        callbacks.push(makePageLoad(charityPage));

        gamblesPage.onLoad = function() {
            node.game.questionnaire.currentAnswer = [];
        };

        gamblesPage.checkAnswer = function() {
            var i;
            for (i = 0; i < 6; ++i) {
                if ('undefined' ===
                    typeof node.game.questionnaire.currentAnswer) {
                        return false;
                }
            }
            return true;
        };

        gamblesPage.onInvalidAnswer = function() {
            node.game.globals.checkID('Please select an option for each row.');
        };

        randomPageExecutor.setCallbacks(callbacks);

        randomPageExecutor.setOnDone(function () {
            randomBlockExecutor.next();
        });
        randomPageExecutor.execute();
    };

    // Callback for the demographics block.
    // This block is NOT randomized!
    demographics = function() {
        var name, names = [
            'gender', 'education', 'dateOfBirth', 'politics', 'income',
            'occupation', 'participation'
        ];
        var i;
        var finalize = function() {
            node.set('bsc_data', {
                player:         node.game.ownID,
                timeElapsed:    node.timer.getTimeSince("BEGIN_QUESTIONNAIRE"),
                blockOrder:     node.game.questionnaire.blocks
            });
            W.loadFrame('/burdenshare/html/questionnaire' +
                        '/profit_adjustment.html', function() {

                W.getElementById('continue').onclick = function() {
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
                W.write((node.game.bonus.newAmountUSD + 1.0).toFixed(2) + ' $',
                        W.getElementById("amountUSD")
                );
            });
        };

        var begin = new DemographicsPage(names[names.length - 1], finalize);

        node.game.questionnaire.blocks.push('demographics');

        for (i = 2; i <= names.length; ++i) {
            begin = new DemographicsPage(names[names.length - i],
                                        makePageLoad(begin));
            // Politics page.
            if (i == 4) {
                begin.onValidAnswer = function() {
                    // If option 'other' is selected
                    if (node.game.questionnaire.currentAnswer == 5) {
                        node.game.questionnaire.currentAnswer = 'Other: ' +
                            W.getElementById('textForOther').value;
                    }
                };
            }
        }
        begin.load();
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

    node.on.data("win", function(msg) {
        W.loadFrame('/burdenshare/html/ended.html', function() {
            W.writeln("Exit code: " + msg.data);
            node.game.timer.stop();
            node.game.timer.setToZero();
        });
    });

    // Listeners for PROFIT DATA in the very first round.
    node.on("in.say.DATA", function(msg) {
        var bonus;

        console.log(msg.text);
                    if (msg.text == 'ADDED_QUESTIONNAIRE_BONUS') {
            console.log("Profit Adjustment" + msg.data.oldAmountUCE +
                        "+" + msg.data.newAmountUCE);
            node.game.bonus = msg.data;
        }
        if (msg.text == "PROFIT") {
            console.log("Payout round: " + msg.data.Payout_Round);
            console.log("Profit: " + msg.data.Profit);

            if (msg.data.Payout_Round !== "none") {
                node.game.bonus = node.game.globals.round((msg.data.Profit/50),2);
                console.log("Bonus: " + node.game.bonus);
                W.loadFrame('/burdenshare/html/questionnaire1.html', function() {

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
                W.loadFrame('/burdenshare/html/questionnaire12.html', function() {
                    var payoutText = W.getElementById("payout");
                    W.write("Unfortunately, you did not complete all the rounds to be played (3 + practice). For your participation in the experiment you will be paid out the show-up fee plus the bonus from the questionnaire.", payoutText);

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
        }

        // Goto questionnaire.
        function questionnaire(timeout) {
            console.log("Bonus: " + node.game.bonus);

            var options = {
                milliseconds: node.game.globals.timer.questionnaire,
                timeup: function() {
                    node.say("QUEST_DONE", "SERVER", node.game.bonus);
                },
                stopOnDone: false
            };
            node.game.timer.init(options);
            node.game.timer.updateDisplay();
            node.game.timer.start(options);

            randomBlockExecutor.execute();
        }
    });


    // Request profit.
    node.set('get_Profit',node.game.ownID);
}
