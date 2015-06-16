/**
 * # Channel codes example file
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * File must export an array of objects containing at the very least two
 * properties: _AccesCode_, and _ExitCode_. The values of such properties
 * must be unique.
 *
 * For real authorization codes use at least 32 random characters and digits.
 * ---
 */

module.exports = function(settings, done) {
 
    return {
        user: 'admin',
        pwd: 'admin'
    };    
};
