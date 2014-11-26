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
        player: "game.client.js"
    },

    REPEAT: 4,

    N_PLAYERS: 4,

    // AUTH: 'local'
    // AUTH: 'remote'
    AUTH: 'none',

    CHOSEN_TREATMENT: "ra",

    // How much does an agreement cost? (30 or 80).
    COSTGE: 30,

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
