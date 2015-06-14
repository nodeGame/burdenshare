/**
 * # Auth settings: Burdenshare
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 * ---
 */

module.exports = {

    enabled: false, // [false] Default: TRUE.

    mode: 'auto', // 'remote', 'local'

    // Must export a function that returns an array of codes synchronously
    // or asynchronously. Default: 'auth.codes.js'
    codes: 'auth.codes.js', 

    // Used to sign json tokens.
    secret: 'this is my secret',

    page: 'login.htm',

};