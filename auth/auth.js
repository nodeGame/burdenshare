
module.exports = function(auth) {

    var path = require('path');

    // Reads in descil-mturk configuration.
    var confPath = path.resolve(__dirname, 'descil.conf.js');
    var dk = require('descil-mturk')(confPath);
    var settings = require(path.resolve(__dirname, '../server/game.settings.js'));


    /////////////////////////////// MTurk Version ///////////////////////////
    // Creating an authorization function for the players.
    // This is executed before the client the PCONNECT listener.
    // Here direct messages to the client can be sent only using
    // his socketId property, since no clientId has been created yet.

    function authPlayers(channel, info) {
        var code, player, token;
        playerId = info.cookies.player;
        token = info.cookies.token;

        console.log('game.room: checking auth.');

        if (settings.AUTH === 'none') {
            return true;
        }

        // Weird thing.
        if ('string' !== typeof playerId) {
            console.log('no player: ', player)
            return false;
        }

        // Weird thing.
        if ('string' !== typeof token) {
            console.log('no token: ', token)
            return false;
        }

        code = dk.codeExists(token);

        // Code not existing.
	    if (!code) {
            console.log('not existing token: ', token);
            return false;
        }

        // Code in use.
	    if (code.usage) {
            if (code.disconnected) {
                return true;
            }
            else {
                console.log('token already in use: ', token);
                return false;
            }
	    }
	    // Mark the code as in use.
        dk.incrementUsage(token);

        // Client Authorized
        return true;
    }

    // Assigns Player Ids based on cookie token.
    function idGen(channel, info) {
        var cid, cookies, validCookie;

        cid = channel.registry.generateClientId();

        // If no auth, add the new code to the db.
        dk.codes.insert({
            AccessCode: cid,
            ExitCode: cid + '_exit'
        });
        return cid;

        // var code;
        // code = dk.codes.db[++noAuthCounter].AccessCode;
        // dk.incrementUsage(code);
        // // Return the id only if token was validated.
        // // More checks could be done here to ensure that token is unique in ids.
        if (cookies.token) {

            if (!ids[cookies.token] || ids[cookies.token].disconnected) {
   	        return cookies.token;
   	    }
   	    else {
   	        console.log("already in ids", cookies.token)
   	        return false;
   	    }
        }
    }
    /////////////////////////////// MTurk Version ///////////////////////////


    // Assigning the auth callbacks to the player server.
    auth.authorization('burdenRAHR', 'player', authPlayers);
    auth.clientIdGenerator('burdenRAHR', 'player', idGen);

};