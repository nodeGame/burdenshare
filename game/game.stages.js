/**
 * Stages definition for the Burden Game.
 *
 * They will be extended in game.logic, and game.client.
 *
 */

module.exports = function(stager, settings) {

    stager.init()
        .next('instructions')
        .repeat('burdenSharingControl', settings.REPEAT)
        .repeat('questionnaire', 23);

    // Modify the stager to skip one stage.
    // stager.skip('instructions');
    // stager.skip('burdenSharingControl');
};
