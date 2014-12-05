/**
 * # Functions used by the Logic and Client of Burden-share Game
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

module.exports = {
    round: require('./logic.callbacks').round,
    clearFrame: clearFrame,
    notEnoughPlayers: notEnoughPlayers,
    syncGroup: syncGroup
};

var node = module.parent.exports.node;
var channel = module.parent.exports.channel;
var gameRoom = module.parent.exports.gameRoom;
var settings = module.parent.exports.settings;
var dk = module.parent.exports.dk;


function clearFrame() {
    node.emit('INPUT_DISABLE');
    return true;
}

function notEnoughPlayers() {
    node.game.pause();
    W.lockScreen('One player disconnected. We are now waiting to see if ' +
                 'he or she reconnects. If there is no reconnection ' +
                 'within 60 seconds the game will be terminated and ' +
                 'you will be forwarded to the questionnaire.');
}

function syncGroup(stage, myStageLevel, pl, game) {
    var p = node.game.pl.get(node.game.otherID);
    if (p.stageLevel === node.constants.stageLevels.DONE) {
        if (myStageLevel === node.constants.stageLevels.DONE) {
            return true;
        }
    }
}