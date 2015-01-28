/**
 * # Game settings: Burdenshare
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 * ---
 */

module.exports = {

    // Files
    gamePaths: {
        logic:    "game.logic.js",
        player:   "game.client.js",
        bot:      "game.bot.js",
        autoplay: "game.autoplay.js",
    },

    REPEAT: 4,

    N_PLAYERS: 4,

    // AUTH: 'local',
    // AUTH: 'remote',
    AUTH: 'none',

    WAIT_ROOM_TIMEOUT: 600000, // 10 min

    // "ra", "sa",
    CHOSEN_TREATMENT: "ra",

    // How much does an agreement cost? (30 or 80).
    COSTGE: 80,

    timer: {

        // Instructions.
        instructions1: 150000, // 2.5 minutes
        instructions2: 150000, // 2.5 minutes
        instructions3: 150000, // 2.5 minutes
        instructions4: 150000, // 2.5 minutes

        // Game.
        initialSituation: function() {
            return 300000; // 5 minutes
            //if (node.game.globals.chosenTreatment === "sa") return 36000;
            //return 18000;
        },

        endOfPractice: 10000, // 10 seconds
        econGrowth: 60000, // 1 minutes
        proposer: 120000, // 2 minutes
        reply2Prop: 120000, // 2 minutes
        respondent: 120000, // 2 minutes
        proposerDone: 120000, //2 minutes
        respondentDone: 120000, // 2 minutes
        responseDone: 300000, // 5 minutes

        // Questionnaire.
        questionnaire: 900000, // 15 minutes.
        questProfit: 150000, // 2.5 minutes

        // Logic.
        notEnoughPlayers: 100000,
    },

    // If TRUE, throws errors. For testing.
    debug: true,

    treatments: {
        sa: {
            name: "sa",
            fullName: "Self Assigned",
            description:
                "Players assign the historical responsibility themselves",
            GAME_NAME: '/burdenHR/'
        },
        ra: {
            name: "ra",
            fullName: "Randomly Assigned",
            description:
                "Players get the historical responsibility assigned randomly",
            GAME_NAME: '/burdenRAHR/'
        }
    }
};
