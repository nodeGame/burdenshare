/**
 * # Authorization functions for Burdenshare Game
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Sets authorizations for accessing the Burdenshare channels.
 * ---
 */
module.exports = function(auth, settings) {


    /////////////////////////////// MTurk Version ///////////////////////////
    // Creating an authorization function for the players.
    // This is executed before the client the PCONNECT listener.
    // Here direct messages to the client can be sent only using
    // his socketId property, since no clientId has been created yet.

    function authPlayers(channel, info) {

        var code, player, token;
        playerId = info.cookies.player;
        token = info.cookies.token;

        // code = dk.codeExists(token);

        // Code not existing.
        if (!code) {
            console.log('not existing token: ', token);
            return false;
        }

        if (code.checkedOut) {
            console.log('token was already checked out: ', token);
            return false;
        }

        // Code in use.
        //  usage is for LOCAL check, IsUsed for MTURK
        if (code.valid === false) {
            if (code.disconnected) {
                return true;
            }
            else {
                console.log('token already in use: ', token);
                return false;
            }
        }

        // Client Authorized
        return true;
    }

    // Assigns Player Ids based on cookie token.
    function idGen(channel, info) {
        var cid = channel.registry.generateClientId();
        var cookies;
        var ids;


        // Return the id only if token was validated.
        // More checks could be done here to ensure that token is unique in ids.
        ids = channel.registry.getIds();
        cookies = info.cookies;
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

    function decorateClientObj(clientObject, info) {
        if (info.headers) clientObject.userAgent = info.headers['user-agent'];
    }

    /////////////////////////////// MTurk Version ///////////////////////////


    // Assigning the auth callbacks to the player server.
    // auth.authorization('burdenshare', 'player', authPlayers);
    // auth.clientIdGenerator('burdenshare', 'player', idGen);
    // auth.clientObjDecorator('burdenshare', 'player', decorateClientObj);


    var a = 0;
    auth.clientIdGenerator('requirements', 'player', function() {
        return "" + ++a; 
    });

};
