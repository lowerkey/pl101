/*
	One goal of mine is to be able to calculate everything, especially 
	variable names. 
*/
var lookup = function (env, v) {
	if(!env || !env.bindings){
		throw new Error("lookup couldn't find " + JSON.stringify(v) + " in env " + JSON.stringify(env) + ".");
		// thanks fabriceleal
	}

    if(!env.hasOwnProperty('bindings'))
		throw new Error("lookup couldn't find " + JSON.stringify(v) + " in env.");
        //return undefined;
    
    if(env.bindings.hasOwnProperty(v))
        return env.bindings[v];
    else
        return lookup(env.outer, v);
};
var update = function (env, v, val) {
	if(!env || !env.bindings){
		throw new Error("update couldn't find " + v + " in env.");
		// thanks fabriceleal
	}

	if(env.bindings === undefined){
		env.bindings = {};
	}
	
    if(env.bindings.hasOwnProperty(v))
        env.bindings[v] = val;
    else
        update(env.outer, v, val);
};
var add_binding = function (env, v, val) {
	if(env.bindings === undefined){
		env.bindings = {};
	}
    env.bindings[v] = val;
};

var evalScheem = function (expr, env) {
	
	// boolean values
	if(expr === '#t' || expr === '#f')
		return expr;

    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }
	
    // Strings are variable references
    if (typeof expr === 'string') {
		return lookup(env, expr);
    }
	
	if(expr instanceof Array && expr.length === 1)
		return evalScheem(expr[0], env);
	
	add_binding(env, '+', function(x, y){
		return x + y;
	});
	
	add_binding(env, '-', function(x, y){
		return x - y;
	});
	
	add_binding(env, '*', function(x, y){
		return x * y;
	});
	
	add_binding(env, '/', function(x, y){
		return x / y;
	});
	
	add_binding(env, '<', function(x, y){
		return x < y ? '#t' : '#f';
	});
	
	add_binding(env, 'cons', function(a, b){
		return [a].concat(b);
	});
	
	add_binding(env, 'car', function(a){
		return a[0];
	});

	add_binding(env, 'cdr', function(a){
		return a.slice(1);
	});

	add_binding(env, '=', function(a, b){
		return a === b ? '#t' : '#f';
	});
	
	try{
		
		// Look at head of list for operation
		switch (expr[0]) {
  
			case 'begin':
				if(expr.length < 2)
					throw new Error(expr[0] + ' takes at least 1 argument.');
				var result;
				for(var i=1; i<expr.length; i++){
					result = evalScheem(expr[i], env);
				}
				return result;
			
			case 'define':
				if(!env.bindings){
					env.bindings = {};
					env.outer = {};
				}
				
				if(expr.length !== 3)
					throw new Error(expr[0] + ' takes 2 arguments.');
			
				if(typeof expr[1] === 'string')
					expr1Eval = expr[1];
				else
					expr1Eval = evalScheem(expr[1], env);
					
				if(typeof expr1Eval !== 'string')
					throw new Error(expr1Eval + ' must be or evaluate to a string.');
				
				if(env[expr1Eval] !== undefined)
					throw new Error('Variable ' + expr1Eval + ' already defined.');
				
				add_binding(env, expr1Eval, evalScheem(expr[2], env));
				
				return 0;
			
			case 'set!':
				expr1Eval = typeof expr[1] === 'string' ? expr[1] : evalScheem(expr[1], env);
				
				if(lookup(env, expr1Eval) === undefined)
					throw new Error("Reference error: set! couldn't find " + expr1Eval);
				update(env, expr1Eval, evalScheem(expr[2], env));
				return 0;
				
			case 'quote':
				if(expr.length !== 2)
					throw new Error(expr[0] + ' takes 1 argument.');
				return expr[1];
					
			case 'if':
				if(expr.length !== 4)
					throw new Error(expr[0] + ' takes 3 arguments.');
				if(evalScheem(expr[1], env) === '#t')
					return evalScheem(expr[2], env);
				else
					return evalScheem(expr[3], env);
					
			case 'concatStr':
				if(expr.length !== 3)
					throw new Error(expr[0] + ' takes 2 arguments.');
				var expr1Eval = evalScheem(expr[1], env);
				var expr2Eval = evalScheem(expr[2], env);
				
				if(typeof expr1Eval !== 'string')
					throw new Error(expr[1] + ' is a ' + typeof expr1Eval + ' instead of a string');
				if(typeof expr2Eval !== 'string')
					throw new Error(expr[2] + ' is a ' + typeof expr2Eval + ' instead of a string');
				
				return evalScheem(expr[1], env) + evalScheem(expr[2], env);
				
			case 'lambda':
				return function(/* arguments */){
				
					var bindings = {};
					var newEnv = {bindings: bindings, outer: env};
					
					for(var i=0; i<expr[1].length; i++){
						bindings[expr[1][i]] = evalScheem(arguments[i], env);
					}
					
					return evalScheem(expr[2], newEnv);
				};
				
			default:
				var func = lookup(env, expr[0]);
				return func.apply(null, expr.slice(1).map(function(arg){ return evalScheem(arg, env); }));
		}
	}catch(e){
		throw new Error("Evaluating " + JSON.stringify(expr) + " failed: \n\t" + e.toString());
	}
};

function evalScheemString(program){
	var environment = {};
	return evalScheem(parse(program), environment);
}

// If we are used as Node module, export evalScheem
if (typeof module !== 'undefined') {
    module.exports.evalScheem = evalScheem;
	module.exports.evalScheemString = evalScheemString;
}