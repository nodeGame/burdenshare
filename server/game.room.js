/**
 * # Waiting Room for Burden-share Game
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Handles incoming connections, matches them, sets the Burden-share game
 * in each client, move them in a separate gaming room, and start the game.
 */
module.exports = function(node, channel, gameRoom) {

    // Reads in descil-mturk configuration.
    var basedir = channel.resolveGameDir('burdenshare');
    var confPath = basedir + '/auth/descil.conf.js';
    var settings = require(basedir + '/server/game.settings.js');

    // Load the code database.
    var dk = require('descil-mturk')();

    // Keep timeouts for all 4 players.
    var timeOuts = [undefined, undefined, undefined, undefined];

    var cbs = channel.require(__dirname + '/includes/room.callbacks.js', {
        node: node,
        gameRoom: gameRoom,
        dk: dk,
        settings: settings,
        timeOuts: timeOuts
    });

    // If NO authorization is found, local codes will be used,
    // and assigned automatically.
    var noAuthCounter = -1;
    ///////////////////////////// MTurk Version ///////////////////////////


    var Database = require('nodegame-db').Database;
    var ngdb = new Database(node);
    var mdb = ngdb.getLayer('MongoDB');

    var stager = new node.Stager();
    var logicPath = __dirname + '/game.logic';

    var ngc = require('nodegame-client');

    // second parameter makes available to the required file its properties
    var client = channel.require(__dirname + '/game.client', {
        ngc: ngc
    });

    stager.setOnInit(function() {

        this.channel = channel;
        console.log('********Waiting Room Created*****************');

        // This callback is executed whenever a previously disconnected
        // players reconnects.
        node.on.preconnect(function(p) {
            console.log('Oh...somebody reconnected in the waiting room!', p);
            // Notify other player he is back.
            // TODO: add it automatically if we return TRUE? It must be done
            // both in the alias and the real event handler
            // TODO: Cannot use to: ALL, because this includes the reconnecting
            // player.
            node.game.pl.each(function(p) {
                node.socket.send(node.msg.create({
                    target: 'PCONNECT',
                    data: p,
                    to: p.id
                }));
            });
            node.game.pl.add(p);
            cbs.connectingPlayer(p);
        });

        // This must be done manually for now (maybe will change in the future).
        node.on.mreconnect(function(p) {
            node.game.ml.add(p);
        });

        // This callback is executed when a player connects to the channel.
        node.on.pconnect(cbs.connectingPlayer);

        // This callback is executed when a player connects to the channel.
        node.on.pdisconnect(function(p) {
            // Client really disconnected (not moved into another game room).
            if (channel.registry.clients.disconnected.get(p.id)) {
                // Free up the code.
                dk.markValid(p.id);
            }            
        });

    });

    stager.setOnGameOver(function() {
        console.log('^^^^^^^^^^^^^^^^GAME OVER^^^^^^^^^^^^^^^^^^');
    });

    stager
        .init()
        .next('waiting');

    return {
        nodename: 'wroom',
        game_metadata: {
            name: 'wroom',
            version: '0.1.0'
        },
        game_settings: {
            publishLevel: 0
        },
        plot: stager.getState(),
        debug: true,
        verbosity: 0
    };
};
