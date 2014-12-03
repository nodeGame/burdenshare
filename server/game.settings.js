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

    WAIT_ROOM_TIMEOUT: 600000, // 600000 == 10 min

    //CHOSEN_TREATMENT: "ra", "sa",
    CHOSEN_TREATMENT: "ra",

    // How much does an agreement cost? (30 or 80).
    //COSTGE: 30,
    COSTGE: 80,

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
