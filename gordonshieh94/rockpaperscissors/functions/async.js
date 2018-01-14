var redis = require('../utils/redis');
var result = require('../utils/result');


module.exports = async (name = 'default', context) => {
    var matchId = await redis.getPlayerMatch(name);
    await redis.setMatchMove(name, matchId, move);
    let [player1, player2] = await redis.getMatchMoves(matchId);
    if (player1.move !== false && player2.move !== false) {
        let result = await result.calculateResults(matchId);
        redis.publishMessage(matchId, result);
    }
    return matchId;
};
