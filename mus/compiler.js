
/*
	Given the start time and a note, sequence, seq or par, this function returns the 
	end time of that element
*/
function endTime(time, expr){
	if(expr.tag === 'rest'){
		return time + expr.dur;
	}else if(expr.tag === 'note'){
        return time + expr.dur;
    }else if(expr.tag === 'seq'){
        return endTime(endTime(time, expr.left), expr.right);
    }else if(expr.tag === 'par'){
        return time + Math.max(endTime(time, expr.left), endTime(time, expr.right));
    }
}

NOTES = [];
TIME = 0;

function inorderTraversal(time, expr){

	if( expr.tag === 'note' ){
		NOTES.push( {tag: 'note', pitch: convertPitch(expr.pitch), start: time, dur: expr.dur} );
	}else if( expr.tag === 'rest'){
		NOTES.push( {tag: 'rest', start: time, dur: expr.dur} );
	}else if( expr.tag === 'seq' ){
		inorderTraversal(time, expr.left);
		inorderTraversal(endTime(time, expr.left), expr.right);
	}else if( expr.tag === 'par' ){
		inorderTraversal(time, expr.left);
		inorderTraversal(time, expr.right);
	}else if( expr.tag === 'repeat'){
		for(var i=0; i<expr.count; i++){
			inorderTraversal(time, section);
		}
	}
	
	TIME = endTime(TIME, expr);
}

function convertPitch(pitch){
	var octave = pitch.substring(1, 1);
	var letterPitch = pitch.substring(0, 1);
	
	var n = 0;
	switch(letterPitch){
		case 'c':
			n = 0;
			break;
		case 'd':
			n = 1;
			break;
		case 'e':
			n = 2;
			break;
		case 'f':
			n = 3;
			break;
		case 'g':
			n = 4;
			break;
		case 'a':
			n = 5;
			break;
		case 'b':
			n = 6;
	}
	
	return 12 + (12 * n) + octave;
}

function compile(mus){
	NOTES = [];
	TIME = 0;
	inorderTraversal(TIME, mus);
	
	return NOTES;
}
