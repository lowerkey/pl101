if (typeof module !== 'undefined') {
    // In Node.js load required modules
    var assert = require('chai').assert;
    var PEG = require('pegjs');
    var fs = require('fs');
    var evalScheem = require('../scheem-lang/evalScheem.js').evalScheem;
	//var evalScheemString = require('../scheem-lang/evalScheem.js').evalScheemString;
    var parse = PEG.buildParser(fs.readFileSync('scheem-lang/scheem.peg', 'utf-8')).parse;
} else {
    // In browser assume loaded by <script>
    var parse = SCHEEM.parse;
    var assert = chai.assert;
}

function evalScheemString(program){
	var environment = {};
	return evalScheem(parse(program), environment);
}

// Some unit tests

// interpreter
suite('quote', function() {
    test('a number', function() {
        assert.deepEqual(
            evalScheem(['quote', 3], {}),
            3
        );
    });
    test('an atom', function() {

	assert.deepEqual(
            evalScheem(['quote', 'dog'], {}),
            'dog'
        );
    });
    test('a list', function() {
        assert.deepEqual(
            evalScheem(['quote', [1, 2, 3]], {}),
            [1, 2, 3]
        );
    });
});
suite('add', function() {
    test('two numbers', function() {
        assert.deepEqual(
            evalScheem(['+', 3, 5], {}),
            8
        );
    });
    test('a number and an expression', function() {
        assert.deepEqual(
            evalScheem(['+', 3, ['+', 2, 2]], {}),
            7       
	   );
    });
	test('2 + 2 = 4', function(){
		assert.deepEqual(
			evalScheem(['+', 2, 2], {}),
			4
		);
	});
});
suite('other arithmetic', function(){
	test('multiplication', function(){
		assert.deepEqual(
			evalScheem(['*', 3, 4], {}),
			12
		);
	});
	test('division', function(){
		assert.deepEqual(
			evalScheem(['/', 12, 4], {}),
			3
		);
	});
});
suite('begin define and set', function(){
	test('begin', function(){
		assert.deepEqual(
			evalScheem(['begin', ['+', 2, 2]], {}),
			4
		);
	});
	test('set!', function(){
		var environment = {};
		evalScheem(['begin', ['define', 'x', 0], ['set!', 'x', 3]], environment);
		assert.deepEqual(
			environment.bindings.x,
			3
		);
	});
	test('define', function(){
		var environment = {};
		evalScheem(['begin', ['define', 'ab', 0], ['set!', 'ab', 4]], environment);
		assert.deepEqual(
			environment.bindings.ab,
			4
		);
	});	
	test('define multiple arguments', function(){
		assert.deepEqual(
			evalScheemString('(begin (define addThreeNumbers (lambda (x y z) (+ x (+ y z)))) (addThreeNumbers 1 2 3))'),
			6
		);
	});
	test('define eval variable name', function(){
		var environment = {};
		evalScheem(['begin', ['define', ['concatStr', ['quote', 'a'], ['quote', 'b']], 3], ['set!', 'ab', 4]], environment);
		assert.deepEqual(
			environment.bindings.ab,
			4
		);
	});
});
suite('boolean', function(){
	test('< true', function(){
		assert.deepEqual(
			evalScheem(['<', 3, 4], {}),
			'#t'
		);
	});
	test('< false', function(){
		assert.deepEqual(
			evalScheem(['<', 4, 3], {}),
			'#f'
		);
	});
	test('= true', function(){
		assert.deepEqual(
			evalScheem(['=', 4, 4], {}),
			'#t'
		);
	});
	test('= false', function(){
		assert.deepEqual(
			evalScheem(['=', 4, 3], {}),
			'#f'
		);
	});
	test('if true', function(){
		assert.deepEqual(
			evalScheem(['if', '#t', 1, 0], {}),
			1
		);
	});
	test('if false', function(){
		assert.deepEqual(
			evalScheem(['if', '#f', 1, 0], {}),
			0
		);
	});
});
suite('pitches', function(){
	test('+ throws on too many arguments', function(){
		assert.throws(function(){
			evalScheem(['+', 1, 2, 3], {});
		});
	});	
	test('- throws on too many arguments', function(){
		assert.throws(function(){
			evalScheem(['-', 3, 2, 4], {});
		});
	});
	test('* throws on too many arguments', function(){
		assert.throws(function(){
			evalScheem(['*', 3, 3, 2], {});
		});
	});
	test('/ throws on too many arguments', function(){
		assert.throws(function(){
			evalScheem(['/', 2, 3, 4], {});
		});
	});
	test('define throws if variable already exists', function(){
		assert.throws(function(){
			evalScheem(['define', 'x', 4], {x: 0});
		});
	});
	test('set! throws if variable not previously defined', function(){
		assert.throws(function(){
			evalScheem(['set!', 'x', 4], {});
		});
	});
	test('quote throws if more than 1 argument', function(){
		assert.throws(function(){
			evalScheem(['quote', 'test', 'superfluous'], {});
		});
	});
	test('quote throws if less than one argument', function(){
		assert.throws(function(){
			evalScheem(['quote'], {});
		});
	});
	test('< throws if not two arguments.', function(){
		assert.throws(function(){
			evalScheem(['<'], {});
		});
	});
	test('cons throws if not one argument.', function(){
		assert.throws(function(){
			evalScheem(['cons'], {});
		});
	});
	test('car throws if not one argument.', function(){
		assert.throws(function(){
			evalScheem(['car'], {});
		});
	});
	test('cdr throws if not one argument.', function(){
		assert.throws(function(){
			evalScheem(['cdr'], {});
		});
	});
	test('= throws if not three arguments.', function(){
		assert.throws(function(){
			evalScheem(['='], {});
		});
	});
	test('if throws if not two arguments.', function(){
		assert.throws(function(){
			evalScheem(['if'], {});
		});
	});
	test('concatStr throws if not two arguments.', function(){
		assert.throws(function(){
			evalScheem(['concatStr'], {});
		});
	});
	test("concatStr throws if first argument isn't a string.", function(){
		assert.throws(function(){
			evalScheem(['concatStr', 1, '2'], {});
		});
	});
	test("concatStr throws if second argument isn't a string.", function(){
		assert.throws(function(){
			evalScheem(['concatStr', '1', 2], {});
		});
	});
});
suite('concatStr', function(){
	test('concatStr throws if too many arguments', function(){
		assert.throws(function(){
			evalScheem(['concatStr', ['quote', '1'], ['quote', '2'], ['quote', '3']], {});
		});
	});
	test('concatStr throws if too few arguments', function(){
		assert.throws(function(){
			evalScheem(['concatStr', ['quote', '1']], {});
		});
	});
	test('concatStr', function(){
		assert.deepEqual(
			evalScheem(['concatStr', ['quote', '1'], ['quote', '2']], {}),
			'12'
		);
	});
});
suite('<', function(){
	test('less than', function(){
		assert.deepEqual(
			evalScheem(['<', 2, 3], {}),
			'#t'
		);
	});
	test('not less than', function(){
		assert.deepEqual(
			evalScheem(['<', 3, 2], {}),
			'#f'
		);
	});
});
suite('cons', function(){
	test('(cons 1 (2 3)) --> (1 2 3)', function(){
		assert.deepEqual(
			evalScheem(['cons', 1, ['quote', [2, 3]]], {}),
			[1, 2, 3]
		);
	});
});
suite('car', function(){
	test('(car (a b c)) --> a', function(){
		assert.deepEqual(
			evalScheem(['car', ['quote', [1, 2, 3]]], {}),
			1
		);
	});
});
suite('cdr', function(){
	test('(cdr (1 2 3) --> (2 3)', function(){
		assert.deepEqual(
			evalScheem(['cdr', ['quote', [1, 2, 3]]], {}),
			[2, 3]
		);
	});
});
suite('=', function(){
	test('= numbers true', function(){
		assert.deepEqual(
			evalScheem(['=', 1, 1], {}),
			'#t'
		);
	});
	test('= numbers false', function(){
		assert.deepEqual(
			evalScheem(['=', 1, 2], {}),
			'#f'
		);
	});
	test('= strings true', function(){
		assert.deepEqual(
			evalScheem(['=', ['quote', 'test'], ['quote', 'test']], {}),
			'#t'
		);
	});
	test('= strings false', function(){
		assert.deepEqual(
			evalScheem(['=', ['quote', 'test'], ['quote', 'notest']], {}),
			'#f'
		);
	});
	test('= variables true', function(){
		assert.deepEqual(
			evalScheem(['=', ['+', 1, 2], 3], {}),
			'#t'
		);
	});
});	
suite('integers', function(){
	test('parseInt', function(){
		assert.deepEqual(
			evalScheemString("'(1 2 3)"),
			[1, 2, 3]
		);
	});
	test('negative integer', function(){
		assert.deepEqual(
			evalScheemString("'(1 -2 3)"),
			[1, -2, 3]
		);
	});
});
// parser
suite('parser', function(){
	test('a number', function(){
		assert.deepEqual(
			parse('42'),
			42
		);
	});
	test('a variable', function(){
		assert.deepEqual(
			parse('x'),
			'x'
		);
	});
	test('define', function(){
		assert.deepEqual(
			parse('(define x 3)'),
			['define', 'x', 3]
		);
	});
	test('begin', function(){
		assert.deepEqual(
			evalScheemString('(begin (define x 3) x)'),
			3
		);
	});
});
suite('evalScheemString', function(){
	test('#t', function(){
		assert.deepEqual(
			evalScheemString('#t'),
			'#t'
		);
	});
	test('#f', function(){
		assert.deepEqual(
			evalScheemString('#f'),
			'#f'
		);
	});	
	test('(#t)', function(){
		assert.deepEqual(
			evalScheemString('(#t)'),
			'#t'
		);
	});
	test('(= #t #t)', function(){
		assert.deepEqual(
			evalScheemString('(= #t #t)'),
			'#t'
		);
	});
	test('(begin (define x 3) (+ x 4))', function(){
		assert.deepEqual(
			evalScheemString('(begin (define x 3) (+ x 4))'),
			7
		);
	});
});	
suite('#t', function(){
	test('parse #t', function(){
		assert.deepEqual(
			parse('#t'),
			'#t'
		);
	});
	test('eval #t', function(){
		assert.deepEqual(
			evalScheemString('#t'),
			'#t'
		);
	});
	test('parse (#t)', function(){
		assert.deepEqual(
			parse('(#t)'),
			['#t']
		);
	});
	test('eval (#t)', function(){
		assert.deepEqual(
			evalScheemString('(#t)'),
			'#t'
		);
	});	
});
suite('functions, recursion', function(){
	test("(begin (define factorial (lambda (n) (if (= n 0) 1 (* n (factorial (- n 1)))))) (factorial 5))", function(){
		assert.deepEqual(
			evalScheemString("(begin (define factorial (lambda (n) (if (= n 0) 1 (* n (factorial (- n 1)))))) (factorial 5))"),
			120
		);
	});
});
suite('variables', function(){
	test('(begin (define x 3) (x))', function(){
		assert.deepEqual(
			evalScheemString('(begin (define x 3) (x))'),
			3
		);
	});
	test('(= 6 (begin (define x 3) (+ x 3)))', function(){
		assert.deepEqual(
			evalScheemString('(= 6 (begin (define x 3) (+ x 3)))'),
			'#t'
		);
	});
});
suite('various', function(){
	test('(((1)))', function(){
		assert.deepEqual(
			evalScheemString('(((1)))'),
			1
		);
	});
});
