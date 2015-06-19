/**
 * # Channels definition file for Ultimatum Game
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Configuration options for the channel.
 *
 * http://www.nodegame.org
 * ---
 */
module.exports =  {

    alias: 'experiment',

    // Endpoint for connecting players. (can also be an object).
    playerServer: 'burdenshare',

    // Endpoint for connecting admins. (can also be an object).
    adminServer: 'burdenshare-admin',

    // All options below are shared by player and admin servers.

    verbosity: 100,

    // If TRUE, players can invoke GET commands on admins.
    getFromAdmins: true,

    // Unauthorized clients will be redirected here.
    // (defaults: "/pages/accessdenied.htm")
    accessDeniedUrl: '/burdenshare/unauth.htm',
    
    notify: {
        onConnect: false, // 19.06 true,

        onStageUpdate: false, // 19.06 true,

        // A client changes stageLevel (e.g. INIT, CALLBACK_EXECUTED);
        onStageLevelUpdate: false // 19.06 true,
    },

    enableReconnections: true

};
