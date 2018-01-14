var redis = require('../utils/redis');

/**
* Record a move.
* @param {string} matchId The matchId to find the result of
* @returns {object}
*/

module.exports = async (matchId, context, callback) => {
	// Use Redis to get players and their data based on match Id, or send "wait" message
	let {player1, player2} = await redis.getMatchMoves(matchId);
	let result = {
		[player1.name]: "",
		[player2.name]: ""
	};
	if (player1.move === player2.move){
		result[player1.name] = "draw";
		result[player2.name] = "draw";
	}
	else if (player1.move === "rock" && player2.move === "scissors" || player1.move === "scissors" && player2.move === "paper" || player1.move === "paper" && player2.move === "rock"){
		result[player1.name] = "win";
		result[player2.name] = "lose";
	}
	else {
		result[player1.name] = "lose";
		result[player2.name] = "win";
	}

	player1.games = player1.games + 1;
	player2.games = player2.games + 1;
	ratings = eloUpdate(player1, player2);
	player1.rating = ratings[0];
	player2.rating = ratings[1];
	return result;
};


function eloUpdate (player, opponent) {
	var EPlayer = 1 / (1 + Math.pow(10,(opponent.rating - player.rating)/400));
	var EOpponent=1 / (1 + Math.pow(10,(player.rating - opponent.rating)/400));

	var ScorePlayer = 0;
	var ScoreOpponent=0;
	if(player.result === "Win"){
		ScorePlayer = 1;
		ScoreOpponent=0;
	}
	else if(player.result === "Lose"){
		ScorePlayer = 0;
		ScoreOpponent=1;
	}
	else{
		ScorePlayer = 0.5;
		ScoreOpponent=0.5;
	}
	/* Based on FIDE recommended learning factor */
	if(player.rating < 2300 && player.games <= 30){
		KPlayer = 40;
	}
	else if(player.rating < 2400){
		KPlayer = 20;
	}
	else{
		KPlayer = 10;
	}

	if(opponent.rating < 2300 && opponent.games <= 30){
		KOpponent = 40;
	}
	else if(opponent.rating < 2400){
		KOpponent = 20;
	}
	else{
		KOpponent = 10;
	}

	return [player.rating + KPlayer * (ScorePlayer - EPlayer), opponent.rating + KOpponent * (ScoreOpponent - EOpponent)];
}
