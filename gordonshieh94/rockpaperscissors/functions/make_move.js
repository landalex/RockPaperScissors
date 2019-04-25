var redis = require('../utils/redis');
var result = require('../utils/result');

/**
* Record a move.
* @param {string} name The user making the move
* @param {string} move The move being made ("rock", "paper", or "scissors")
* @returns {string}
*/

module.exports = async (name, move) => {
    var matchId = await redis.getPlayerMatch(name);
    await redis.setMatchMove(name, matchId, move);
    let players = await redis.getMatchMoves(matchId);
    let player1 = players[0];
    let player2 = players[1];
    if (player1.move !== false && player2.move !== false) {
        let r = await result.calculateResults(matchId);
        // await new Promise(resolve => setTimeout(resolve, 10000));
        redis.publishMessage(`${player1.name}_${matchId}_channel`, JSON.stringify(r));
        // await new Promise(resolve => setTimeout(resolve, 10000));
        redis.publishMessage(`${player2.name}_${matchId}_channel`, JSON.stringify(r));

    }
    return matchId;
};
