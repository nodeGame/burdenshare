/**
 * # Requierements Room for Burden-share Game
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Handles incoming connections, validates authorization tokens
 * check browser requirements, and collect feedbacks.
 * ---
 */
module.exports = function(settings, room, runtimeConf) {
    var node = room.node;
    var channel = room.channel;
    var registry = channel.registry;
debugger
    // Creates a stager object to define the game stages.
    var stager = new node.Stager();

    // Functions

    settings.doChecking = true;

    function connectingPlayer(player) {
        console.log('Player connected to Requirements room.', player.id);

        setTimeout(function() {
//
//             node.remoteSetup('frame', player.id, {
//                 generate: { root: 'body' },
//                 load: {
//                     url: '/burdenshare/req2.htm',
//                     cb: function() { console.log('AAAAAAAAAA'); }
//                 }
//             });
            node.remoteSetup('widgets', player.id, {
                append: { 'Requirements': { 
                    root: 'widgets_div',
                    sayResults: true
                } }
            });
            node.remoteSetup('requirements', player.id, settings);

        }, 1000);

//         node.on.data('loaded', function(msg) {
//             node.remoteSetup('widgets', msg.from, {
//                 append: { 'Requirements': { root: 'widgets_div' } }
//             });
//
//             node.remoteSetup('requirements', msg.from, settings);
//         });
    }

    function init() {
        var that = this;
    console.log('AAAAAAAAAAAAA');

        node.on.preconnect(function(player) {
            console.log('Player re-connected to Requirements room.');
            node.game.pl.add(player);
            connectingPlayer(player);
            //node.remoteCommand('start', player.id);
        });
debugger
        node.on.pconnect(connectingPlayer);

        node.on.pdisconnect(function(player) {
            console.log('Player disconnected from Requirements room: ' + player.id);
        });

        // Results of the requirements check.
        node.on.data('requirements', function(msg) {
            console.log('requirements');
            console.log(msg.data);
            if (msg.data.success) {
                // Mark client as requirements passed.
                registry.updateClient(msg.from, {apt: true});
                
                 setTimeout(function() {
                     // node.remoteSetup('page', msg.from, { clearBody: true });
                     // When it reconnects, it is placed in waitingRoom.
                     // channel.registry.moveClient(msg.from, channel.waitingRoom.name);

                     // node.redirect('/burdenshare/index.htm', msg.from);
                     channel.movePlayer(msg.from, channel.waitingRoom.name);
                 }, 1000);
            }
        });

        // In case a user is using the feedback form display the action.
//         node.on.data('FEEDBACK', function(msg) {
//             console.log('Feedback received.');
//             console.log(msg.data);
//         });


    }

    stager.addStage({
        id: 'requirements',
        cb: function() {
            console.log('Requirements: AH!');
        }
    });

    // Define stager.

    stager.setOnInit(init);

    stager
        .init()
        .next('requirements');

    // Return the game.
    game = {};

    game.metadata = {
        name: 'Requirements check room for Burde-Sharing-Control-AMT',
        description: 'Validates players entry codes with an internal database.',
        version: '0.1'
    };

    // Throws errors if true.
    game.debug = true;

    game.plot = stager.getState();

    game.nodename = 'requirements';

    // game.verbosity = 100;

    return game;
};
