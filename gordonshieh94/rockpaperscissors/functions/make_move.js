var redis = require('../utils/redis');

/**
* Record a move.
* @param {string} name The user making the move
* @param {string} move The move being made ("rock", "paper", or "scissors")
* @returns {string}
*/

module.exports = async (name, move) => {
    var matchId = await redis.getPlayerMatch(name);
    await redis.setMatchMove(name, matchId, move);
    return matchId;
};
