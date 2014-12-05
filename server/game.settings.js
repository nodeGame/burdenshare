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
        logic:  "game.logic.js",
        player: "game.client.js",
        autoplay: "game.autoplay"
    },

    REPEAT: 4,

    N_PLAYERS: 4,

    // AUTH: 'local'
    // AUTH: 'remote'
    AUTH: 'none',

    WAIT_ROOM_TIMEOUT: 10000, // 600000 == 10 min

    // "ra", "sa",
    CHOSEN_TREATMENT: "sa",

    // How much does an agreement cost? (30 or 80).
    COSTGE: 80,

    timer: {

        // Instructions.
        instructions1: 2000, //480000, // 480000 ms is equivalent to 8 minutes (reading time approximately 4 minutes times 2)
        instructions2: 2000, //480000, // 480000 ms is equivalent to 8 minutes (reading time approximately 4 minutes times 2)
        instructions3: 2000, //480000, // 480000 ms is equivalent to 8 minutes (reading time approximately 4 minutes times 2)
        instructions4: 2000, //480000, // 240000 ms is equivalent to 8 minutes (reading time approximately 4 minutes times 2)

        // Game.
        initialSituation: function() {
            return 2000;
            if (node.game.globals.chosenTreatment === "sa") return 36000;
	    return 18000;
        },
        econGrowth: 2000, //40000, // 40000 ms is equal to 40 seconds
        proposer: 2000, //90000, // 120000 ms is equivalent to 2 minutes
        reply2Prop: 2000, //120000, // 120000 ms is equivalent to 2 minutes
        respondent: 2000, //60000, // 120000 ms is equivalent to 2 minutes
        proposerDone: 2000, //240000, // 240000 ms is equivalent to 6 minutes (reading time approximately 3 minutes times 2)
        respondentDone: 2000, //240000, // 240000 ms is equivalent to 6 minutes (reading time approximately 3 minutes times 2)
        responseDone: 2000, //120000, // 120000 ms is equivalent to 2 minutes

        // Questionnaire.
        quest: 2000, // 1800000, // 30minutes
        questProfit: 2000, //60000,

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
