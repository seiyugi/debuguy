#! /usr/bin/env node

/**
 * Parsing:
 *
 * $ debuguy parse <source_dir>
 * $ debuguy parse <source_dir> <destination_dir>
 * $ debuguy parse -r <source_dir>
 * $ debuguy parse -r <source_dir> <destination_dir>
 *
 * Profiling:
 *
 * $ <stream> | debuguy profile
 *
 */

'use strict';

var app = require('./lib/app');
var minimist = require('minimist');
var args = minimist(process.argv.slice(2));

app.run(args, console.log);
