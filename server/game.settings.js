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

        instructions1: 48000, // 2000,
        instructions2: 48000, 
        instructions3: 48000,
        instructions4: 48000,

        // Game.
        initialSituation: function() {
            return 300000; //10000;
            if (node.game.globals.chosenTreatment === "sa") return 36000;
            return 18000;
        },
        econGrowth: 200000, //100000, //40000, // 40000 ms is equal to 40 seconds
        proposer: 200000, //200000, //90000, // 120000 ms is equivalent to 2 minutes
        reply2Prop: 200000, //20000, //120000, // 120000 ms is equivalent to 2 minutes
        respondent: 200000, //20000, //60000, // 120000 ms is equivalent to 2 minutes
        proposerDone: 200000, //20000, //240000, // 240000 ms is equivalent to 6 minutes
        respondentDone: 200000, //20000, //240000, // 240000 ms is equivalent to 6 minutes
        responseDone: 200000, //20000, //120000, // 120000 ms is equivalent to 2 minutes

        // Questionnaire.
        questionnaire: 3000000, // 1800000, // 30 minutes
        questProfit: 3000000, // 60000, // 1 minute

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
