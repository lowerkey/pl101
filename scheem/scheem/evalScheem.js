/*
	One goal of mine is to be able to calculate everything, especially 
	variable names. 
*/
var evalScheem = function (expr, env) {
	
	// boolean values
	if(expr === '#t')
		return expr;
	
	if(expr === '#f')
		return expr;
	
	// parse integers
	if(typeof expr === 'string'){
		var parsed = parseInt(expr);
		if(parsed !== NaN)
			return parsed;
	}

    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }
	
    // Strings are variable references
    if (typeof expr === 'string') {
		return env[expr];
    }
	
    // Look at head of list for operation
    switch (expr[0]) {
	
        case '+':
			if(expr.length !== 3)
				throw new Error(expr[0] + ' takes 3 arguments.');
            return evalScheem(expr[1], env) +
                   evalScheem(expr[2], env);
				   
        case '-':
			if(expr.length !== 3)
				throw new Error(expr[0] + ' takes 3 arguments.');
            return evalScheem(expr[1], env) -
                   evalScheem(expr[2], env);
				   
        case '*':
			if(expr.length !== 3)
				throw new Error(expr[0] + ' takes 3 arguments.');
            return evalScheem(expr[1], env) * 
                   evalScheem(expr[2], env);
				   
        case '/':
			if(expr.length !== 3)
				throw new Error(expr[0] + ' takes 3 arguments.');
            return evalScheem(expr[1], env) /
                   evalScheem(expr[2], env);
				   
        case 'begin':
            var result;
            for(var i=1; i<expr.length; i++){
                result = evalScheem(expr[i], env);
            }
            return result;
		
		case 'define':
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
			
			env[expr1Eval] = evalScheem(expr[2], env);
			
			return 0;
		
        case 'set!':
			if(env[expr[1]] === undefined)
				throw new Error("Reference error: " + expr[1] + " hasn't been defined yet.");
            expr1Eval = typeof expr[1] === 'string' ? expr[1] : evalScheem(expr[1], env);
			env[expr1Eval] = evalScheem(expr[2], env);
            return 0;
			
		case 'quote':
			if(expr.length !== 2)
				throw new Error(expr[0] + ' takes 1 argument.');
            return expr[1];
			
		case '<':
			if(expr.length !== 3)
				throw new Error(expr[0] + ' takes 2 arguments.');
            return evalScheem(expr[1]) < 
                   evalScheem(expr[2]) ? 
                '#t' : '#f';
				
		case 'cons':
			// (cons a (b c)) returns (a b c)
			if(expr.length !== 3)
				throw new Error(expr[0] + ' takes 2 arguments.');
            return [evalScheem(expr[1])].concat(evalScheem(expr[2]));
			
        case 'car':
			// (car (a b c)) returns a
			if(expr.length !== 2)
				throw new Error(expr[0] + ' takes 1 argument.');
            return evalScheem(expr[1])[0];
			
        case 'cdr':
			// (cdr (a b c)) returns (b c)
			if(expr.length !== 2)
				throw new Error(expr[0] + ' takes 1 argument.');
            return evalScheem(expr[1]).slice(1);
			
		case '=':
			if(expr.length !== 3)
				throw new Error(expr[0] + ' takes 2 arguments.');
            var eq =
                (evalScheem(expr[1], env) ===
                 evalScheem(expr[2], env));
            if (eq) 
				return '#t';
			else
				return '#f';
				
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
    }
};

function evalScheemString(program){
	var environment = {};
	return evalScheem(SCHEEM.parse(program), environment);
}
