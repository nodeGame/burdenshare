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
//debugger

        var window = parent;
        var W = parent.W;
        var node = parent.node;

        var J = window.JSUS;
        var div = W.getElementById('widgets_div');

        console.log('A');

        // Requirements Box.
//         window.req = node.widgets.append('Requirements', div, {
//             // Automatically sends a SAY message with the outcome of the
//             // tests, and the navigator.userAgent property.
//             sayResults: true,
//             // Mixin the properties of the object returned by the callback
//             // with the default content of the SAY message. It can also
//             // overwrite the defaults.
//             // addToResults: function() {
//             //    return { token: token };
//             // }
//         });

//        node.setup('nodegame', {
//            verbosity: 100,
//            debug : true,
//            window : {
//                promptOnleave : false
//            },
//            env : {
//                auto : false,
//                debug : false
//            },
//            events : {
//                dumpEvents : true
//            },
//            socket : {
//                type : 'SocketIo',
//                reconnect : false
//            }
//        });
//        node.connect("/burdenshare");
//        node.log('Testing requirements.');
    })();
}
