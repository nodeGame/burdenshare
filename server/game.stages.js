
var ngc = require('nodegame-client');

module.exports = function(settings) {
    var stager = ngc.getStager();

    stager.init()
	.next('instructions')
	.repeat('burdenSharingControl', settings.REPEAT)
	.next('questionnaire');

    return stager.getState();
};

  