module.exports = (context, callback) => {
	var comp = Math.random();
	if(comp < 0.33) {
		callback(null, "scissors");
	}
	else if(comp < 0.66){
		callback(null, "paper");
	}
	else{
	    callback(null, "rock");
	}
};
