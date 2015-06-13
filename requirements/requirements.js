/**
 * # Requirements functions
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Sets requiremetns for accessing the channel.
 * ---
 */
module.exports = function(requirements, settings) {

    var ngr = require('nodegame-requirements');

    requirements.add(ngr.nodegameBasic);
    // requirements.add(ngr.nodegameSetup);
    requirements.add(ngr.speedTest, settings.speedTest);
    requirements.add(ngr.browserDetect, settings.excludeBrowsers);
    requirements.add(ngr.loadFrameTest);
    requirements.add(ngr.cookieSupport);

    requirements.setMaxExecutionTime(settings.maxExecTime);

    requirements.onFailure(function() {
        var str, args;
        console.log('failed');
        str = '%spanYou are NOT allowed to take the HIT. If you ' +
            'have already taken it, you must return it.%span';
        args = {
            '%span': {
                'class': 'requirements-fail'
            }
        };
        W.sprintf(str, args, this.summary);

        // You can leave a feedback using the form below.
        // window.feedback = node.widgets.append('Feedback', div);
    });

    requirements.onSuccess(function() {
        var str, args;
        var button, link;
        var clientType;
        var div;
        var gameLink = '/';

        div = this.summary;

        // node.emit('HIDE', 'unsupported');
        str = '%spanYou are allowed to take the HIT.%span';
        args = {
            '%span': {
                'class': 'requirements-success'
            }
        };
        W.sprintf(str, args, div);
        // node.store.cookie('token', token);

        div.appendChild(document.createElement('br'));
        div.appendChild(document.createElement('br'));

        link = document.createElement('a');
        link.href = gameLink;
        button = document.createElement('button');
        button.innerHTML = 'Proceed to the game';
        button.className = 'btn btn-lg btn-primary';
        link.appendChild(button);
        div.appendChild(link);

        clientType = JSUS.getQueryString('clientType');
        if (clientType === 'autoplay') {
            link.href = link.href + '?clientType=autoplay';
            setTimeout(function() {
                button.click();
            }, 3000);
        }
    });

    // Either success or failure.
    // requirements.onComplete(function() {
    // ...something.
    // });

};
