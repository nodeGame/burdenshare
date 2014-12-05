/**
 * # Functions used by the waiting room of Burden-share game.
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

module.exports = {
    makeTimeOut: makeTimeOut,
    connectingPlayer: connectingPlayer
};

var node = module.parent.exports.node;
var channel = module.parent.exports.channel;
var gameRoom = module.parent.exports.gameRoom;
var settings = module.parent.exports.settings;
var dk = module.parent.exports.dk;
var timeOuts = module.parent.exports.timeOuts;

// Game Rooms counter.
var counter = 1;

function makeTimeOut(playerID, nbrPlayers) {

    var code = dk.codes.id.get(playerID);

    var timeOutData = {
        over: "Time elapsed!!!",
        exit: code.ExitCode
    };

    timeOuts[nbrPlayers] = setTimeout(function() {
        // console.log("Timeout has not been cleared!!!");
        dk.checkOut(code.AccessCode, code.ExitCode, 0.0, function(err, response,
                                                                  body) {

            if (err) {
                // Retry the Checkout
                setTimeout(function() {
                    dk.checkOut(code.AccessCode, code.ExitCode, 0.0);
                }, 2000);
            }
        });

        node.say("TIME", playerID, timeOutData);

        for (i = 0; i < channel.waitingRoom.clients.player.size(); i++) {
            if (channel.waitingRoom.clients.player.db[i].id == playerID) {
                delete channel.waitingRoom.clients.player.db[i];
                channel.waitingRoom.clients.player.db =
                    channel.waitingRoom.clients.player.db.filter(
                        function(a) {
                            return typeof a !== 'undefined';
                        }
                    );
            }
        }

    }, settings.WAIT_ROOM_TIMEOUT);
}

function connectingPlayer(p) {
    var room, wRoom;
    var NPLAYERS;
    var code;
    var i;
    var timeOutData;

    NPLAYERS = settings.N_PLAYERS;

    code = dk.codes.id.get(p.id);
    dk.checkIn(code.AccessCode);

    console.log('-----------Player connected ' + p.id);

    dk.markInvalid(p.id);

    wRoom = channel.waitingRoom.clients.player;

    for (i = 0; i < wRoom.size(); i++) {
        // console.log(wRoom.db[i].id);
        node.say("PLAYERSCONNECTED", wRoom.db[i].id, wRoom.size());
    }

    makeTimeOut(p.id, wRoom.size());

    debugger
    // Wait for all players to connect.
    if (wRoom.size() < NPLAYERS) {
        // channel.connectPhantom();
        return;
    }

    for (i = 0; i < wRoom.size(); i++) {
        timeOutData = {
            over: "AllPlayersConnected",
            exit: 0
        };
        node.say("TIME", wRoom.db[i].id, timeOutData);

        // Clear timeout for players.
        clearTimeout(timeOuts[i]);
    }

    console.log('-----------We have four players-----Game Room ID: ' + counter);

    tmpPlayerList = wRoom.shuffle().limit(NPLAYERS);


    room = channel.createGameRoom({
        group: 'burdenshare',
        clients: tmpPlayerList,
        gameName: 'burdenshare',
        treatmentName: settings.CHOSEN_TREATMENT

    });

    room.setupGame();
    room.startGame(true, tmpPlayerList.id.getAllKeys());


    // Send room number to admin
    channel.admin.socket.send2roomAdmins(node.msg.create({
        target: node.constants.target.TXT,
        text: 'ROOMNO',
        data: {
            roomNo: counter,
            pids: room.clients.player.id.getAllKeys(),
            aids: room.clients.admin.id.getAllKeys()
        }
    }), room);

    counter++;
}