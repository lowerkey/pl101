var PEG = require('pegjs');
var assert = require('assert');
var fs = require('fs');

// Read file contents
var data = fs.readFileSync('scheem.peg', 'utf-8');

// Show the PEG grammar file
console.log(data);

// Create the parser
var parse = PEG.buildParser(data).parse;

// TESTS
console.log('\n\n=====\nTESTS\n=====');

function test(fun, title){
    try{
	fun();
	console.log('pass: ' + title);
    }catch(e){
	try{
	    if(e instanceof SyntaxError){
		console.log('\nError: ' + e.message);
		console.log('fail: ' + title);
	    }else{
		throw e;
	    }
	}catch(e){
	    if(e instanceof assert.AssertionError){
		console.log('fail: ' + title);
	    }else{
		throw e;
	    }
	}
    }
}


// simple test from website
test(function(){
    assert.deepEqual( parse( '(a b c)' ), ['a', 'b', 'c'] );
}, 'simple (a b c)');

// test the factorial function
test(function(){
    assert.deepEqual( parse('(* n (factorial (- n 1)))'),
		      ['*', 'n', ['factorial', ['-', 'n', '1']]] );
}, 'nested (* n (factorial (- n 1)))');

// homework part 1.1 whitespace
test(function(){
    assert.deepEqual( parse('( a   b c)'), ['a', 'b', 'c'] );
}, 'leading spaces ( a  b c)');

// homework part 1.1 newlines and tabs
test(function(){
    assert.deepEqual( parse('(a\nb\tc)'), ['a','b','c']);
}, 'newlines and tabs');

// homework part 1.2 quotes
test(function(){
    assert.deepEqual( parse("'x"), ['quote', 'x']);
}, "simple quotes 'x");

test(function(){
    assert.deepEqual( parse("'(1 2 3)"), ['quote', ['1', '2', '3']]);
}, "exression list quotes '(1 2 3)");