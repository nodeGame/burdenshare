/**
 * # Requirements client script.
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Incoming connections are validated against the requirements sent by server.
 *
 * On success, clients are sent to the real waiting room.
 *
 * http://nodegame.org
 * ---
 */
window.onload = function() {
    (function Requirements() {
        var node = parent.node;
        node.setup('nodegame', {
            verbosity: 100,
            debug : true,
            window : {
                promptOnleave : false
            },
            env : {
                auto : false,
                debug : false
            },
            events : {
                dumpEvents : true
            },
            socket : {
                type : 'SocketIo',
                reconnect : false
            }
        });
        node.connect("/burdenshare");
//        node.log('Testing requirements.');
    })();
}
