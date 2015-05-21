/**
 * # Game settings: Burdenshare
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 * ---
 */

module.exports = function(settings) {
    
    var game = {};

    //Let's add the metadata information
    game.metadata = {
        name: 'burdenSharingControl',
        version: '0.1.0',
        description: 'no descr'
    };

    //Other settings, optional
    game.settings = {
        publishLevel: 2
    };

    //auto: true = automatic run, auto: false = user input
    game.env = {
        auto: false
    };

    game.debug = settings.debug;

    game.verbosity = 1;

    game.window = {
        promptOnleave: !settings.debug
    }

    return game;
};
