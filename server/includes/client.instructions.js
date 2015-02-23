/**
 * # Functions used by the Client of Burden-share Game
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

module.exports = instructions;

function instructions() {
    node.game.visualRound.setDisplayMode(['COUNT_UP_STAGES_TO_TOTAL']);

    var gameName = node.game.globals.gameName;
    var chosenTreatment = node.game.globals.chosenTreatment;

    console.log('instructions');

    W.loadFrame('/burdenshare/html/instructions.html', function() {
        node.game.timeInstruction = Date.now();
        var options = {
            milliseconds: node.game.globals.timer.instructions1,
            timeup: function() {
                node.game.timeInstruction =
                    Math.round(Math.abs(node.game.timeInstruction - Date.now())/1000);
                var timeInstr = {
                    Player_ID: node.game.ownID,
                    Current_Round: "Instructions",
                    TimeInstruction_1: node.game.timeInstruction
                };
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
            node.game.timer.stop();
            this.disabled = "disabled";
            instructions2();
        };
    });

    function instructions2() {
        W.loadFrame('/burdenshare/html/' + gameName + '/instructions2.html', function() {
            node.game.timeInstruction2 = Date.now();
            var options = {
                milliseconds: node.game.globals.timer.instructions2,
                timeup: function() {
                    node.game.timeInstruction2 = Math.round(Math.abs(node.game.timeInstruction2 - Date.now())/1000);
                    var timeInstr = {
                        playerID: {Player_ID: node.game.ownID},
                        add: {TimeInstruction_2: node.game.timeInstruction2}
                    };
                    node.game.timer.stop();
                    this.disabled = "disabled";
                    instructions3();
                }
            };
            node.game.timer.init(options);
            node.game.timer.updateDisplay();
            node.game.timer.start(options);

            console.log('Instructions Page 2');
            if (chosenTreatment === 'ra') {
                W.getElementById("cost").innerHTML = node.game.costGE;
            }

            var next;
            next = W.getElementById("continue");
            next.onclick = function() {
                node.game.timeInstruction2 = Math.round(Math.abs(node.game.timeInstruction2 - Date.now())/1000);
                var timeInstr = {
                    playerID: {Player_ID: node.game.ownID},
                    add: {TimeInstruction_2: node.game.timeInstruction2}
                };
                node.game.timer.stop();
                this.disabled = "disabled";
                instructions3();
            };
        });
    }

    function instructions3() {
        W.loadFrame('/burdenshare/html/' + gameName + '/instructions3.html', function() {
            node.game.timeInstruction3 = Date.now();
            var options = {
                milliseconds: node.game.globals.timer.instructions3,
                timeup: function() {
                    node.game.timeInstruction3 = Math.round(Math.abs(node.game.timeInstruction3 - Date.now())/1000);
                    var timeInstr = {
                        playerID: {Player_ID: node.game.ownID},
                        add: {TimeInstruction_3: node.game.timeInstruction3}
                    };
                    node.game.timer.stop();
                    this.disabled = "disabled";
                    if (node.game.globals.chosenTreatment === 'ra') {
                        EconGrowthAndRisk();
                    }
                    else if (node.game.globals.chosenTreatment === 'sa') {
                        instructions4();
                    }
                }
            };
            node.game.timer.init(options);
            node.game.timer.updateDisplay();
            node.game.timer.start(options);
            console.log('Instructions Page 2');
            if (chosenTreatment === 'sa') {
                W.getElementById("cost").innerHTML = node.game.costGE;
            }

            var next;
            next = W.getElementById("continue");
            next.onclick = function() {
                node.game.timeInstruction3 = Math.round(Math.abs(node.game.timeInstruction3 - Date.now())/1000);
                var timeInstr = {
                    playerID: {Player_ID: node.game.ownID},
                    add: {TimeInstruction_3: node.game.timeInstruction3}
                };
                node.game.timer.stop();
                this.disabled = "disabled";
                if (chosenTreatment === 'ra') {
                    EconGrowthAndRisk();
                }
                else if (chosenTreatment === 'sa') {
                    instructions4();
                }
            };
        });
    }

    function instructions4() {

        var initEndow = {
            playerID: { Player_ID: node.game.ownID },
            addEndow: { 
                Initial_Endowment: node.game.endowment_own,
                Climate_Risk: node.game.risk
            }
        };

        function initEndowFunc() {
            var timeInstr;
            var setDBEconGrowth, j;
            var next;
            
            next = W.getElementById("continue");
            if (next) next.disabled = "disabled";
            
            node.game.timer.stop();
            
            node.game.timeInstruction4 = Math.round(Math.abs(node.game.timeInstruction4 - Date.now())/1000);
            timeInstr = {
                playerID: {Player_ID: node.game.ownID},
                add: {TimeInstruction_4: node.game.timeInstruction4}
            };

            // Set back values in database in case of a disconnection - reconnection.

            node.game.pgCounter = 0;
            node.game.endowment_own = 25;
            node.game.risk = 7.5;
            initEndow.addEndow.Initial_Endowment = 0;
            initEndow.addEndow.Climate_Risk = 0;

            node.set('initEndow', initEndow);

            setDBEconGrowth = {
                playerID : { Player_ID: node.game.ownID },
                add: {}
            };
            for (j = 1; j <= 5; j++) {
                node.game.EGRnd[j] = 0;
                setDBEconGrowth.add['EGRnd' + j] = node.game.EGRnd[j];
            }
            node.set("econGrowth", setDBEconGrowth);
            chooseEconGrowth();
        }

        W.loadFrame('/burdenshare/html/instructions4.html', function() {
            node.game.timeInstruction4 = Date.now();
            var options = {
                milliseconds: node.game.globals.timer.instructions4,
                timeup: initEndowFunc
            };

            node.game.timer.init(options);
            node.game.timer.updateDisplay();
            node.game.timer.start(options);
            console.log('Instructions Page 4');

            var next;
            next = W.getElementById("continue");
            next.onclick = initEndowFunc;
        });
    }

    /**
     * ## chooseEconGrowth
     *
     * participant has to choose the economic growth during 5 rounds
     *
     */
    function chooseEconGrowth() {
        W.loadFrame(node.game.url_preGame, function() {
            W.getElementById("instructionsFrame").setAttribute(
                "src",node.game.url_instructionsFrame
            );
            if (node.game.pgCounter === 0) {
                // Test Round
                var practice0 = W.getElementById('practice0');
                practice0.style.display = '';
            }
            var cumEndow = W.getElementById("propEndow");
            var cumRisk =  W.getElementById("clRiskOwn");
            W.write(node.game.endowment_own,cumEndow);
            if (node.game.risk - 7.5 <= 0) {
                W.write("0",cumRisk);
            }
            else {
                W.write(node.game.risk - 7.5,cumRisk);
            }
            node.game.pgCounter++;
            var options = {
                milliseconds: node.game.globals.timer.econGrowth,
                timeup: function() {
                    var initEndow = {
                        playerID: {Player_ID: node.game.ownID},
                        addEndow: {Initial_Endowment: node.game.endowment_own, Climate_Risk: node.game.risk}
                    };
                    if (W.getElementById("pg1").checked) {
                        node.game.EGRnd[node.game.pgCounter] = 1;
                        node.game.risk = node.game.risk + 0;
                    }
                    else if (W.getElementById("pg2").checked) {
                        node.game.EGRnd[node.game.pgCounter] = 2;
                        node.game.risk = node.game.risk + 2.5;
                    }
                    else if (W.getElementById("pg3").checked) {
                        node.game.EGRnd[node.game.pgCounter] = 3;
                        node.game.risk = node.game.risk + 5;
                    }
                    else {
                        // if count down elapsed the computer will randomly choose one of 3 options
                        var randnum = Math.floor(1+(Math.random()*3));
                        node.game.EGRnd[node.game.pgCounter] = randnum;
                        switch(randnum) {
                        case 1: node.game.risk = node.game.risk + 0; break;
                        case 2: node.game.risk = node.game.risk + 2.5; break;
                        case 3: node.game.risk = node.game.risk + 5; break;
                        }
                    }

                    // Randomly chooses on of the values within the chosen economy growth level
                    var ind = node.game.EGRnd[node.game.pgCounter] - 1;
                    var rnd = Math.floor(1+(Math.random()*node.game.growth[ind].length)) - 1;
                    node.game.endowment_own = node.game.endowment_own + node.game.growth[ind][rnd];

                    switch(node.game.pgCounter) {
                        case 1: var setDBEconGrowth = {playerID : {Player_ID: node.game.ownID}, add: {EGRnd1: node.game.EGRnd[node.game.pgCounter]}}; break;
                        case 2: var setDBEconGrowth = {playerID : {Player_ID: node.game.ownID}, add: {EGRnd2: node.game.EGRnd[node.game.pgCounter]}}; break;
                        case 3: var setDBEconGrowth = {playerID : {Player_ID: node.game.ownID}, add: {EGRnd3: node.game.EGRnd[node.game.pgCounter]}}; break;
                        case 4: var setDBEconGrowth = {playerID : {Player_ID: node.game.ownID}, add: {EGRnd4: node.game.EGRnd[node.game.pgCounter]}}; break;
                        case 5: var setDBEconGrowth = {playerID : {Player_ID: node.game.ownID}, add: {EGRnd5: node.game.EGRnd[node.game.pgCounter]}}; break;
                    }
                    node.set("econGrowth",setDBEconGrowth);
                    node.game.timer.stop();
                    this.disabled = "disabled";
                    if (node.game.pgCounter < 5) {
                        chooseEconGrowth();
                    }
                    else {
                        initEndow.addEndow.Initial_Endowment = node.game.endowment_own;
                        initEndow.addEndow.Climate_Risk = node.game.risk;
                        node.set('initEndow',initEndow);
                        node.game.pgCounter = 0;
                        node.emit('DONE');
                    }
                }
            };
            node.game.timer.init(options);
            node.game.timer.updateDisplay();
            node.game.timer.start(options);
            console.log('Choose Economy Growth');

            var next;
            next = W.getElementById("submitGrowth");
            next.onclick = function() {
                console.log("Page Counter: ---------- "+ node.game.pgCounter);
                var initEndow = {
                    playerID: {Player_ID: node.game.ownID},
                    addEndow: {Initial_Endowment: node.game.endowment_own, Climate_Risk: node.game.risk}
                };

                if (W.getElementById("pg1").checked) {
                    node.game.EGRnd[node.game.pgCounter] = 1;
                    node.game.risk = node.game.risk + 0;
                }
                else if (W.getElementById("pg2").checked) {
                    node.game.EGRnd[node.game.pgCounter] = 2;
                    node.game.risk = node.game.risk + 2.5;
                }
                else if (W.getElementById("pg3").checked) {
                    node.game.EGRnd[node.game.pgCounter] = 3;
                    node.game.risk = node.game.risk + 5;
                }

                if (W.getElementById("pg1").checked || W.getElementById("pg2").checked || W.getElementById("pg3").checked) {
                    // Randomly chooses on of the values within the chosen economy growth level
                    var ind = node.game.EGRnd[node.game.pgCounter] - 1;
                    var rnd = Math.floor((Math.random()*node.game.growth[ind].length)+1) - 1;
                    node.game.endowment_own = node.game.endowment_own + node.game.growth[ind][rnd];
                    console.log("Growth Endowment = " + node.game.growth[ind][rnd]);
                    switch(node.game.pgCounter) {
                        case 1: var setDBEconGrowth = {playerID : {Player_ID: node.game.ownID}, add: {EGRnd1: node.game.EGRnd[node.game.pgCounter]}}; break;
                        case 2: var setDBEconGrowth = {playerID : {Player_ID: node.game.ownID}, add: {EGRnd2: node.game.EGRnd[node.game.pgCounter]}}; break;
                        case 3: var setDBEconGrowth = {playerID : {Player_ID: node.game.ownID}, add: {EGRnd3: node.game.EGRnd[node.game.pgCounter]}}; break;
                        case 4: var setDBEconGrowth = {playerID : {Player_ID: node.game.ownID}, add: {EGRnd4: node.game.EGRnd[node.game.pgCounter]}}; break;
                        case 5: var setDBEconGrowth = {playerID : {Player_ID: node.game.ownID}, add: {EGRnd5: node.game.EGRnd[node.game.pgCounter]}}; break;
                    }
                    node.set("econGrowth",setDBEconGrowth);
                    node.game.timer.stop();
                    this.disabled = "disabled";
                    if (node.game.pgCounter < 5) {
                        chooseEconGrowth();
                    }
                    else {
                        W.getElementById("propEndow").innerHTML = node.game.endowment_own;
                        W.getElementById("clRiskOwn").innerHTML = node.game.risk - 7.5;
                        initEndow.addEndow.Initial_Endowment = node.game.endowment_own;
                        initEndow.addEndow.Climate_Risk = node.game.risk;
                        node.set('initEndow',initEndow);
                        node.game.pgCounter = 0;
                        node.emit('DONE');
                    }
                }
                else {
                    node.game.globals.checkEntry("Please choose one of the three options of economic growth and then continue.");
                }

            };

        });
    }

    /**
     * ## EconGrowthAndRisk
     *
     * the economic growth and corresponding climate risk is chosen randomly by the computer
     *
     * TODO: should be moved on the server.
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
        node.set('initEndow', initEndow);
        node.emit('DONE');
    }

    return true;
}
