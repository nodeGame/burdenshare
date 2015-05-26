/**
 * # Game settings: Burdenshare
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 * ---
 */

module.exports = {

    REPEAT: 4,
    N_PLAYERS: 4, // min players.

    // AUTH: 'local',
    // AUTH: 'remote',
    // AUTH: 'none',
    AUTH: 'none',

    // How much does an agreement cost? (30 or 80).
    COSTGE: 30,

    timer: {

        // Instructions.
        instructions1: 180000, // 3 minutes
        instructions2: 180000, // 3 minutes
        instructions3: 180000, // 3 minutes
        instructions4: 180000, // 3 minutes

        // Game.
        initialSituation: function() {
            return 120000; // 2 minutes
            //if (node.game.settings.treatmentName === "sa") return 36000;
            //return 18000;
        },

        endOfPractice: 10000, // 10 seconds
        econGrowth: 60000, // 1 minute
        proposer: 120000, // 2 minutes
        reply2Prop: 120000, // 2 minutes
        respondent: 120000, // 2 minutes
        proposerDone: 120000, //2 minutes
        respondentDone: 120000, // 2 minutes
        responseDone: 400000, // 5 minutes

        // Questionnaire.
        questionnaire: 900000, // 15 minutes.
        questProfit: 120000, // 2.5 minutes

        // Logic.
        notEnoughPlayers: 60000,

        // AutoPlay: time before an automatic decision is made.
        randomExec: 3000
    },

    treatments: {

        sa: {
            fullName: "Self Assigned 30",
            description:
                "Players assign the historical responsibility themselves",
            gameName: '/burdenHR/'
        },

        ra: {
            fullName: "Randomly Assigned 30",
            description:
                "Players get the historical responsibility assigned randomly",
            gameName: '/burdenRAHR/'
        },

    }
};
