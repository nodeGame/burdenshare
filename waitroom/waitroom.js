/**
 * # Standard Waiting Room for a nodeGame Channel
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Handles incoming connections, matches them, sets the Burden-share game
 * in each client, move them in a separate gaming room, and start the game.
 */
module.exports = function(settings, waitRoom, runtimeConf) {

    // Load the code database.
    // var dk = require('descil-mturk')();
    var J = require('JSUS').JSUS;

    var node = waitRoom.node;
    var channel = waitRoom.channel;

    var GROUP_SIZE = settings.GROUP_SIZE;
    var POOL_SIZE = settings.poolSize || GROUP_SIZE;
    var MAX_WAIT_TIME = settings.MAX_WAIT_TIME;

    var treatments = Object.keys(channel.gameInfo.settings);
    var tLen = treatments.length;

    // Keep timeouts for all 4 players.
    var timeOuts = {};

    var stager = new node.Stager();

    // decideTreatment: check if string, or use it.
    function decideTreatment(t) {
        if (t === "treatment_rotate") {
            return treatmentName = treatments[(channel.autoRoomNo-1) % tLen];
        }
        else if ('undefined' === typeof t) {
            return treatmentName = treatments[J.randomInt(-1,tLen-1)];
        }
        return t;
    }

    function makeTimeOut(playerID) {

        timeOuts[playerID] = setTimeout(function() {            
            var timeOutData, clientObj;

            channel.sysLogger.log("Timeout has not been cleared!!!");

            clientObj = channel.registry.getClient(playerID);

            timeOutData = {
                over: "Time elapsed!!!",
                exit: clientObj.exitCode
            };

            // dk.checkOut(code.AccessCode, code.ExitCode, 0.0, function(
            // err, response, body) {
            //
            //     if (err) {
            //         // Retry the Checkout
            //         setTimeout(function() {
            //             dk.checkOut(code.AccessCode, code.ExitCode, 0.0);
            //         }, 2000);
            //     }
            // });

            node.say("TIME", playerID, timeOutData);

            // for (i = 0; i < channel.waitingRoom.clients.player.size(); i++) {
            //     if (channel.waitingRoom.clients.player.db[i].id ==
            // playerID) {
            //
            //         delete channel.waitingRoom.clients.player.db[i];
            //         channel.waitingRoom.clients.player.db =
            //             channel.waitingRoom.clients.player.db.filter(
            //                 function(a) {
            //                     return typeof a !== 'undefined';
            //                 }
            //             );
            //     }
            // }

        }, MAX_WAIT_TIME);

    }

    function clearTimeOut(playerID) {
        clearTimeout(timeOuts[playerID]);
        delete timeOuts[playerID];
    }

    function clientReconnects(p) {
        channel.sysLogger.log('Reconnection in the waiting room.', p);

        node.game.pl.each(function(player) {
            node.socket.send(node.msg.create({
                target: 'PCONNECT',
                data: p,
                to: player.id
            }));
        });

        // Send currently connected players to reconnecting one.
        node.socket.send(node.msg.create({
            target: 'PLIST',
            // TODO: this sends a bit too much.
            data: node.game.pl.db,
            to: p.id
        }));
        node.game.pl.add(p);
        clientConnects(p);
    }

    function clientDisconnects(p) {
        var wRoom, i;

        // Clear timeout in any case.
        clearTimeOut(p.id);

        // Client really disconnected (not moved into another game room).
        if (channel.registry.clients.disconnected.get(p.id)) {
            // Free up the code.
            channel.registry.markValid(p.id);
        }
        wRoom = waitRoom.clients.player;
        for (i = 0; i < wRoom.size(); i++) {
            node.say("PLAYERSCONNECTED", wRoom.db[i].id, wRoom.size());
        }
    }

    function clientConnects(p) {
        var gameRoom, pList;
        var NPLAYERS;
        var i;
        var timeOutData;
        var treatmentName;
        var nPlayers;

        // Mark code as used.
        channel.registry.markInvalid(p.id);

        // Send the number of minutes to wait.
        node.say('WAITTIME', p.id, MAX_WAIT_TIME);

        pList = waitRoom.clients.player;
        nPlayers = pList.size();

        // Notify other players of new connection.
        for (i = 0; i < nPlayers; i++) {
            node.say("PLAYERSCONNECTED", pList.db[i].id, nPlayers);
        }

        // Start counting a timeout for max stay in waiting room.
        makeTimeOut(p.id);

        // Wait for all players to connect.
        if (nPlayers < POOL_SIZE) return;

        for (i = 0; i < nPlayers; i++) {
            timeOutData = {
                over: "AllPlayersConnected",
                exit: 0
            };

            node.say("TIME", pList.db[i].id, timeOutData);

            // Clear timeout for players.
            clearTimeout(timeOuts[i]);
        }

        // Select a subset of players from pool.
        tmpPlayerList = pList.shuffle().limit(GROUP_SIZE);

        // Decide treatment.
        treatmentName = decideTreatment(settings.CHOSEN_TREATMENT);
        
        // Create new game room.
        gameRoom = channel.createGameRoom({
            group: 'burdenshare',
            clients: tmpPlayerList,
            gameName: 'burdenshare',
            treatmentName: treatmentName
        });

        // Setup and start game.
        gameRoom.setupGame();
        gameRoom.startGame(true, tmpPlayerList.id.getAllKeys());
    }

    function monitorReconnects(p) {
        node.game.ml.add(p);
    }

    stager.setOnInit(function() {

        // This callback is executed when a player connects to the channel.
        node.on.pconnect(clientConnects);

        // This callback is executed when a player connects to the channel.
        node.on.pdisconnect(clientDisconnects);

        // This callback is executed whenever a player reconnects.
        node.on.preconnect(clientReconnects);

        // This must be done manually for now.
        // (maybe will change in the future).
        node.on.mreconnect(monitorReconnects);

        channel.sysLogger.log('Waiting Room Created');
    });

    stager.setDefaultProperty('publishLevel', 0);

    stager
        .init()
        .next('waiting');

    return {
        nodename: 'standard_wroom',
        metadata: {
            name: 'standard_wroom',
            version: '1.0.0'
        },
        plot: stager.getState(),
        debug: settings.debug || false,
        verbosity: 0,
        //clientConnects: clientConnects
    };
};