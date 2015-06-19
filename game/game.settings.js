/**
 * # Game settings: Burdenshare
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 * ---
 */

module.exports = {

    REPEAT: 4,
    N_PLAYERS: 4, // min players.

    // How much does an agreement cost? (30 or 80).
    COSTGE: 30,

    timer: {

        // Instructions.
        instructions1: 60000, // 1 minutes
        instructions2: 60000, // 1 minutes
        instructions3: 60000, // 1 minutes
        instructions4: 60000, // 1 minutes

        // Game.
        endOfPractice: 10000, // 10 seconds
        initialSituation: 90000, // 1.5 minutes
        econGrowth: 60000, // 1 minute
        proposer: 90000, // 1.5 minutes
        reply2Prop: 90000, // 1.5 minutes
        respondent: 90000, // 1.5 minutes
        proposerDone: 90000, // 1.5 minutes
        respondentDone: 90000, // 1.5 minutes
        responseDone: 120000, // 2 minutes

        // Questionnaire.
        questionnaire: 600000, // 10 minutes.
        questProfit: 60000, // 1 minutes

        // Logic.
        notEnoughPlayers: 30000,

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
