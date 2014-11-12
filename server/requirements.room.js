/**
 * # Requierements Room for Meritocracy Game
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Handles incoming connections, validates authorization tokens
 * check browser requirements, and collect feedbacks.
 * ---
 */
module.exports = function(node, channel, room) {

    // Reads in descil-mturk configuration.
    var basedir = channel.resolveGameDir('burdenRAHR');
    var confPath = basedir + '/auth/descil.conf.js';

    var dk;

    // Creates a stager object to define the game stages.
    var stager = new node.Stager();


    // Try to get descil.conf.js
    try {
        dk = require('descil-mturk')(confPath);
    }
    catch (e) {
        throw new Error('requirements.room: ' +
            'Cannot locate /auth/descil.conf.js! \n' +
            'Provide /auth/descil.conf.js with the following content: \n' +
            'module.exports.key = \"YOUR_KEY_HERE\"; \n' +
            'module.exports.project = \"YOUR_PROJECT_NAME_HERE\"; \n' +
            'module.exports.uri = \"YOUR_AUTH_SERVER_HERE\"; \n' +
            'module.exports.file = __dirname + \'/\' + \'auth_codes.js\';');
    }

    // Functions

    function init() {
        var that = this;

        console.log('********Requirements Room Created*****************');

        // Load code database
//        dk.getCodes(function() {
//            if (!dk.codes.size()) {
//                throw new Error('requirements.room: no codes found.');
//            }
//        });
        dk.readCodes(function() {
            if (!dk.codes.size()) {
                throw new Error('requirements.room: no codes found.');
            }
        });

	node.on.preconnect(function(player) {
            console.log('Player connected to Requirements room.');
            node.game.pl.add(player);
            node.remoteCommand('start', player.id);
	});

	node.on.pconnect(function(player) {
            console.log('Player connected to Requirements room.');
            node.remoteCommand('start', player.id);
	});

        node.on('MTID', function(msg) {
            var mtid, errUri, code;

            console.log('MTID');

            // M-Turk id
            mtid = msg.data;

            if ('string' !== typeof mtid) {
                return {
                    success: false,
                    msg: 'Malformed or empty code received.'
                };
            }

            code = dk.codeExists(mtid);

	    if (!code) {
		// errUri = '/ultimatum/unauth.html?id=' + mtid + '&err0=1';
		// node.redirect(errUri, msg.data.id);
		return {
                    success: false,
                    msg: 'Code not found: ' + mtid
	        };
            }

	    if (code.usage) {
		//console.log('Code ' +  mtid + ' already in use ' + code.usage + ' times.');
		// errUri = '/ultiturk/unauthr.html?id=' + mtid + '&codeInUse=1';
		// node.redirect(errUri, msg.data.id);
		// dk.decrementUsage(mtid);
                return {
                    success: false,
                    msg: 'Code already in use: ' + mtid
	        };
	    }

            return {
                success: true,
                msg: 'Code validated.',
                gameLink: '/burdenRAHR/html/informedConsent.html'
                // gameLink: '/burdenHR/index.htm'
            };
        });


        node.on.pdisconnect(function(player) {

	});

        // Results of the requirements check.
	node.on.data('requirements', function(msg) {
            console.log('requirements');
            console.log(msg.data);
	});

        // In case a user is using the feedback form display the action.
        node.on.data('FEEDBACK', function(msg) {
            console.log('Feedback received.');
            console.log(msg.data);
        });
    }

    // Define stager.

    stager.setOnInit(init);

    // A unique game stage that will handle all incoming connections.
    stager.addStage({
        id: 'requirements',
        cb: function() {
            // Returning true in a stage callback means execution ok.
            return true;
        }
    });

    stager
        .init()
        .loop('requirements');

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

    return game;
};
