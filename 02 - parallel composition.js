
/*
	Given the start time and a note, sequence, seq or par, this function returns the 
	end time of that element
*/
function endTime(time, expr){
    if(expr.tag === 'note'){
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
		NOTES.push( {tag: 'note', pitch: expr.pitch, start: time, dur: expr.dur} );
		
	}else if( expr.tag === 'seq' ){
		inorderTraversal(time, expr.left);
		inorderTraversal(endTime(time, expr.left), expr.right);
	}else if( expr.tag === 'par' ){
		inorderTraversal(time, expr.left);
		inorderTraversal(time, expr.right);
	}
	
	TIME = endTime(TIME, expr);
}