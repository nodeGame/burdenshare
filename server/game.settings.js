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

    // AUTH: 'local'
    // AUTH: 'remote'
    AUTH: 'none',

    WAIT_ROOM_TIMEOUT: 600000, // 10 min

    // "ra", "sa",
    CHOSEN_TREATMENT: "sa",

    // How much does an agreement cost? (30 or 80).
    COSTGE: 80,

    timer: {

        // Instructions.
        instructions1: 480000,
        instructions2: 480000,
        instructions3: 480000,
        instructions4: 480000,

        // Game.
        initialSituation: function() {
            //return 1000;
            if (node.game.globals.chosenTreatment === "sa") return 36000;
            return 18000;
        },

        econGrowth: 40000, // 40 seconds
        proposer: 90000, // 2 minutes
        reply2Prop: 120000, // 2 minutes
        respondent: 60000, // 1 minute
        proposerDone: 240000, // 6 minutes
        respondentDone: 240000, // 6 minutes
        responseDone: 120000, // 2 minutes

        // Questionnaire.
        questionnaire: 1800000, // 30 minutes
        questProfit: 60000, // 1 minute

        // Logic.
        notEnoughPlayers: 10000,
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
