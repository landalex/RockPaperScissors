var redis = require('redis');

 async function calculateResults (matchId, context) {
	let {player1, player2} = await redis.getMatchMoves(matchId);
	let names = [player1.name, player2.name].sort();
	let result = {
		[names[0]]: "",
		[names[1]]: ""
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
	return result

	player1.games = parseInt(await redis.getPlayerNumberGames(player1.name)) + 1;
	player2.games = parseInt(await redis.getPlayerNumberGames(player2.name)) + 1;
	player1.rating = parseInt(await redis.getPlayerScore(player1.name));
	player2.rating = parseInt(await redis.getPlayerScore(player2.name));

	[player1.rating, player2.rating] = eloUpdate(player1, player2, result);

	await redis.setPlayerNumberGames(player1.name, player1.games);
	await redis.setPlayerNumberGames(player2.name, player2.games);
	await redis.setPlayerScore(player1.name, player1.rating);
	await redis.setPlayerScore(player2.name, player2.rating);

	return JSON.stringify({
		"result": result,
		[player1.name]: player1,
		[player2.name]: player2
	});
};


function eloUpdate (player, opponent, result) {
	var EPlayer = 1 / (1 + Math.pow(10,(opponent.rating - player.rating)/400));
	var EOpponent=1 / (1 + Math.pow(10,(player.rating - opponent.rating)/400));

	var ScorePlayer = 0;
	var ScoreOpponent=0;
	if(result[player.name] === "Win"){
		ScorePlayer = 1;
		ScoreOpponent=0;
	}
	else if(result[player.name] === "Lose"){
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

module.exports = {
	calculateResults
}
