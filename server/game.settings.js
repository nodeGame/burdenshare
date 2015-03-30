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
        // bot:      "game.bot.js",
        autoplay: "game.autoplay.js",
    },

    REPEAT: 4,

    N_PLAYERS: 4,

    // AUTH: 'local',
    // AUTH: 'remote',
    // AUTH: 'none',
    AUTH: 'none',

    WAIT_ROOM_TIMEOUT: 60000, // 10 min

    // "ra80", "sa80", "ra30", "ra80", "rotate", "random"
    CHOSEN_TREATMENT: "ra30",

    // How much does an agreement cost? (30 or 80).
    COSTGE: 80,

    timer: {

        // Instructions.
        instructions1: 20000, // 2.5 minutes
        instructions2: 20000, // 2.5 minutes
        instructions3: 20000, // 2.5 minutes
        instructions4: 20000, // 2.5 minutes

        // Game.
        initialSituation: function() {
            return 20000; // 5 minutes
            //if (node.game.globals.chosenTreatment === "sa") return 36000;
            //return 18000;
        },

        endOfPractice: 20000, // 10 seconds
        econGrowth: 60000, // 1 minute
        proposer: 200000, // 2 minutes
        reply2Prop: 20000, // 2 minutes
        respondent: 400000, // 2 minutes
        proposerDone: 400000, //2 minutes
        respondentDone: 400000, // 2 minutes
        responseDone: 400000, // 5 minutes

        // Questionnaire.
        questionnaire: 200000, // 15 minutes.
        questProfit: 20000, // 2.5 minutes

        // Logic.
        notEnoughPlayers: 6000,
    },

    // If TRUE, throws errors. For testing.
    debug: true,

    treatments: {
        sa80: {
            name: "sa80",
            fullName: "Self Assigned 80",
            description:
                "Players assign the historical responsibility themselves (80 cost)",
            GAME_NAME: '/burdenHR/',
            COSTGE: 80
        },
        ra80: {
            name: "ra80",
            fullName: "Randomly Assigned 80",
            description:
                "Players get the historical responsibility assigned randomly (80 cost)",
            GAME_NAME: '/burdenRAHR/',
            COSTGE: 80
        },
        sa30: {
            name: "sa30",
            fullName: "Self Assigned 30",
            description:
                "Players assign the historical responsibility themselves (80 cost)",
            GAME_NAME: '/burdenHR/',
            COSTGE: 30
        },
        ra30: {
            name: "ra30",
            fullName: "Randomly Assigned 30",
            description:
                "Players get the historical responsibility assigned randomly (80 cost)",
            GAME_NAME: '/burdenRAHR/',
            COSTGE: 30
        },
    }
};
