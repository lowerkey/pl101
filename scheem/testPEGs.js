var PEG = require('pegjs');
var assert = require('assert');
var fs = require('fs');

// Read file contents
var data = fs.readFileSync('scheem.peg', 'utf-8');

// Show the PEG grammar file
console.log(data + '\n');

// Create the parser
var parse = PEG.buildParser(data).parse;

// Do a test
assert.deepEqual( parse('(a b c)'), ['a', 'b', 'c'] );
