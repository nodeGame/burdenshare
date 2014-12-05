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

    //CHOSEN_TREATMENT: "ra", "sa",
    CHOSEN_TREATMENT: "ra",

    // How much does an agreement cost? (30 or 80).
    COSTGE: 80,

    timer: {
        instructions1: 300000,
        instructions2: 180000,
        quiz: 120000,
        questionnaire: 120000,
        bid: function() {
	    if (node.game.part == 1 &&
                node.game.getCurrentGameStage().round < 3) return 30000;
	    return 15000;
	},
        initialSituation: function() {           
            if (node.game.globals.chosenTreatment === "sa") return 36000;
	    return 18000;
        },
        // Logic
        breakPart1: 10000,
        // Waiting Room
        dispatch: 3000
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
