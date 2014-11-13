/**
 * This is a game that spawns sub-games
 *
 */
module.exports = function(node, channel, gameRoom) {

    // Reads in descil-mturk configuration.

    var basedir = channel.resolveGameDir('burdenRAHR');
    var confPath = basedir + '/auth/descil.conf.js';
    var settings = require(basedir + '/server/game.settings.js');

    // Load the code database.
    var dk = require('descil-mturk')();

    // Load code database
    if (settings.AUTH !== 'none') {
        dk.readConfiguration(confPath);
        if (settings.AUTH === 'remote') {
            dk.getCodes(function() {
                if (!dk.codes.size()) {
                    throw new Error('game.room: no codes found.');
                }
            });
        }
        else {
            dk.readCodes(function() {
                if (!dk.codes.size()) {
                    throw new Error('game.room: no codes found.');
                }
            });
        }
    }

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

    stager.addStage({
	id: 'waiting',
	cb: function() {
	    // Returning true in a stage callback means execution ok.
	    return true;
	}
    });

    //	stager.addStage(waitingStage);

    stager.setOnInit(function() {

	this.channel = channel;
	var counter = 1;
	console.log('********Waiting Room Created*****************');

	function TimeOut(playerID, nbrPlayers) {

	    var code = dk.codes.id.get(playerID);

	    var timeOutData = {
		over: "Time elapsed!!!",
		exit: code.ExitCode
	    }

	    if (nbrPlayers == 1) {

		countDown1 = setTimeout(function() {
		    // console.log("Timeout has not been cleared!!!");
		    dk.checkOut(code.AccessCode, code.ExitCode, 0.0, function(err, response, body) {
			if (err) {
			    // Retry the Checkout
			    setTimeout(function() {
				dk.checkOut(code.AccessCode, code.ExitCode, 0.0);
			    }, 2000)
			}
		    });
		    node.say("TIME", playerID, timeOutData);

		    for (i = 0; i < channel.waitingRoom.clients.player.size(); i++) {
			if (channel.waitingRoom.clients.player.db[i].id == playerID) {
			    delete channel.waitingRoom.clients.player.db[i];
			    channel.waitingRoom.clients.player.db = channel.waitingRoom.clients.player.db.filter(function(a) {return typeof a !== 'undefined';})	;
			}
		    }

		}, 600000); // 600000 == 10 min
	    }
	    else if (nbrPlayers == 2) {

		countDown2 = setTimeout(function() {
		    // console.log("Timeout has not been cleared!!!");
		    dk.checkOut(code.AccessCode, code.ExitCode, 0.0, function(err, response, body) {
			if (err) {
			    // Retry the Checkout
			    setTimeout(function() {
				dk.checkOut(code.AccessCode, code.ExitCode, 0.0);
			    }, 2000)
			}
		    });
		    node.say("TIME", playerID, timeOutData);
		    for (i = 0; i < channel.waitingRoom.clients.player.size(); i++) {
			if (channel.waitingRoom.clients.player.db[i].id == playerID) {
			    delete channel.waitingRoom.clients.player.db[i];
			    channel.waitingRoom.clients.player.db = channel.waitingRoom.clients.player.db.filter(function(a) {return typeof a !== 'undefined';})	;
			}
		    }

		}, 600000); // 600000 == 10 min
	    }
	    else if (nbrPlayers == 3) {
		countDown3 = setTimeout(function() {
		    // console.log("Timeout has not been cleared!!!");
		    dk.checkOut(code.AccessCode, code.ExitCode, 0.0, function(err, response, body) {
			if (err) {
			    // Retry the Checkout
			    setTimeout(function() {
				dk.checkOut(code.AccessCode, code.ExitCode, 0.0);
			    }, 2000)
			}
		    });
		    node.say("TIME", playerID, timeOutData);
		    for (var i = 0; i < channel.waitingRoom.clients.player.size(); i++) {
			if (channel.waitingRoom.clients.player.db[i].id == playerID) {
			    delete channel.waitingRoom.clients.player.db[i];
			    channel.waitingRoom.clients.player.db = channel.waitingRoom.clients.player.db.filter(function(a) {return typeof a !== 'undefined';})	;
			}
		    }

		}, 600000); // 600000 == 10 min
	    }
	    else if (nbrPlayers == 4) {
		countDown4 = setTimeout(function() {
		    // console.log("Timeout has not been cleared!!!");
		    dk.checkOut(code.AccessCode, code.ExitCode, 0.0, function(err, response, body) {
			if (err) {
			    // Retry the Checkout
			    setTimeout(function() {
				dk.checkOut(code.AccessCode, code.ExitCode, 0.0);
			    }, 2000)
			}
		    });
		    node.say("TIME", playerID, timeOutData);
		    for (var i = 0; i < channel.waitingRoom.clients.player.size(); i++) {
			if (channel.waitingRoom.clients.player.db[i].id == playerID) {
			    delete channel.waitingRoom.clients.player.db[i];
			    channel.waitingRoom.clients.player.db = channel.waitingRoom.clients.player.db.filter(function(a) {return typeof a !== 'undefined';})	;
			}
		    }

		}, 600000); // 600000 == 10 min
	    }
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
	    wRoom = channel.waitingRoom.clients.player;

	    for (i = 0; i < wRoom.size(); i++) {
		// console.log(wRoom.db[i].id);
		node.say("PLAYERSCONNECTED", wRoom.db[i].id, wRoom.size());
	    }

	    TimeOut(p.id, wRoom.size());

            // Wait for all players to connect.
	    if (wRoom.size() < NPLAYERS) return;

	    for (i = 0; i < wRoom.size(); i++) {
		timeOutData = {
		    over: "AllPlayersConnected",
		    exit: 0
		}
		node.say("TIME", wRoom.db[i].id, timeOutData);
		if (i == 0) {
		    clearTimeout(countDown1);
		}
		else if (i == 1) {
		    clearTimeout(countDown2);
		}
		else if (i == 2) {
		    clearTimeout(countDown3);
		}
		else if (i == 3) {
		    clearTimeout(countDown4);
		}
	    };

	    console.log('-----------We have four players-----Game Room ID: ' + counter);

	    tmpPlayerList = wRoom.shuffle().limit(NPLAYERS);

// 	    room = channel.createGameRoom({
// 		group: 'burdenRAHR',
// 		clients: tmpPlayerList,
// 		channel: channel,
// 		logicPath: logicPath
// 	    });

            room = channel.createGameRoom({
                group: 'burdenshare',
                clients: tmpPlayerList,
                gameName: 'burdenRAHR'
            });

            debugger
            room.setupGame();
            room.startGame(true, tmpPlayerList.id.getAllKeys());

//	    // Setting metadata, settings, and plot
//	    tmpPlayerList.each(function (p) {
//		node.remoteSetup('game_metadata',  p.id, client.metadata);
//		node.remoteSetup('game_settings', p.id, client.settings);
//		node.remoteSetup('plot', p.id, client.plot);
//		node.remoteSetup('env', p.id, client.env);
//		node.remoteCommand('start', p.id);
//	    });
//	    room.startGame();

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
	    counter ++;

	    // Save User ID permanently such that he or she can onlyparticipate once
	    // var fs = require('fs');
	    // // fs.appendFile(__dirname + "/codes.json", dk.codes.stringify(false), function(err) {
	    // // });
	    // var auth_codes = require(__dirname + "/codes.json");
	    // for (i = 0; i<dk.codes.db.length; i++) {
	    // if (dk.codes.db[i].usage == 1) {
	    // auth_codes.push(dk.codes.db[i]);
	    // }
	    // }
	    // fs.writeFile(__dirname + "/codes.json", JSON.stringify(auth_codes));

        }

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
            connectingPlayer(p);
        });

        // This must be done manually for now (maybe will change in the future).
        node.on.mreconnect(function(p) {
            node.game.ml.add(p);
        });

        // This callback is executed when a player connects to the channel.
        node.on.pconnect(connectingPlayer);

        // This callback is executed when a player connects to the channel.
        node.on.pdisconnect(function(p) {

            // Client really disconnected (not moved into another game room).
            if (channel.registry.clients.disconnected.get(p.id)) {
                // Free up the code.
                dk.decrementUsage(p.id);
            }

        });

    });

    stager.setOnGameOver(function() {
	console.log('^^^^^^^^^^^^^^^^GAME OVER^^^^^^^^^^^^^^^^^^');
    });

    stager
	.init()
	.loop('waiting');

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
