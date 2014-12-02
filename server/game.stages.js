/**
 * Stages definition for the Burden Game.
 *
 * They will be extended in game.logic, and game.client.
 *
 */
var ngc = require('nodegame-client');

module.exports = function(settings) {
    var stager = ngc.getStager();

    stager.init()
	.next('instructions')
	.repeat('burdenSharingControl', settings.REPEAT)
	.next('questionnaire');

    debugger
    // Modifty the stager to skip one stage.
    // stager.skip('instructions');

    return stager.getState();
};
