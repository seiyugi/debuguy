#! /usr/bin/env node

/**
 * Parsing:
 *
 * $ debuguy parse <source_dir> [options]
 * $ debuguy parse <source_dir> <destination_dir> [options]
 *
 * Options:
 * --r      Read source_dir recursively.
 * -c       Enable call stack graph.
 *
 * Profiling:
 *
 * $ <stream> | debuguy profile
 *
 */

'use strict';

var app = require('./lib/app');
var minimist = require('minimist');
var args = minimist(process.argv.slice(2), {boolean: true});

app.run(args, console.log);
