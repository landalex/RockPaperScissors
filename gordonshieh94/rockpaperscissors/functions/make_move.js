var redis = require('../utils/redis');
var result = require('../utils/result');

/**
* Record a move.
* @param {string} name The user making the move
* @param {string} move The move being made ("rock", "paper", or "scissors")
* @returns {string}
*/

module.exports = async (name, move) =>
    var matchId = await redis.getPlayerMatch(name);
    await redis.setMatchMove(name, matchId, move);
    let {player1, player2} = await redis.getMatchMoves(matchId);
    if (player1.move !== false && player2.move !== false) {
        redis.publishMessage(matchId, await result.calculateResults(matchId));
    }
    return matchId;
};
