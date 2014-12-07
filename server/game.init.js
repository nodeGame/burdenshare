/**
 * # Init Game Burden-share
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Open connections to database.
 */

var path = require('path');
var channel = module.parent.exports.channel;
var ngc = module.paretn.exports.ngc;
var stepRules = ngc.stepRules;
var J = ngc.JSUS;


var Database = require('nodegame-db').Database;
var ngdb = new Database(node);
var mdb = ngdb.getLayer('MongoDB');

