const redis = require('redis')
const asyncRedis = require("async-redis");
const client = asyncRedis.decorate(redis.createClient('redis://34.211.214.70:6379'));

async function createMatch(player1, player2) {
    let matchId = Math.random().toString(36).substring(7);
    await client.set(`${player1}_${matchId}`, false);
    await client.set(`${player2}_${matchId}`, false);
    return matchId;
}

async function joinQueue(name) {
    let queue = await client.smembers('in_queue');
    if (queue.length > 0 && !queue.includes(name)) {
        
        let otherPlayer = queue[0];
        await client.srem('in_queue', otherPlayer);

        let matchId = await createMatch(name, otherPlayer);
        return {'matchId': matchId};
    } else {
        await client.sadd('in_queue', name);
        return true;
    }
}

async function getMyMatch(name) {
    let keys = await client.keys();
    let myMatch = keys.find(x => x.startsWith(name)).split('_')[1];
    return myMatch;
}

async function setMatchResult(name, match, result) {
    await client.set(`${name}_${match}`, result);
    let keys = await client.keys();
    let otherPlayersMatch = keys.find(x => !x.startsWith(name) && x.endsWith(match));
    
    let otherPlayerName = otherMatchResult.split('_')[0];
    let otherMatchResult = await client.get(otherPlayersMatch);
    return {
        [name]: result,
        [otherPlayerName]: otherMatchResult
    }
}

module.exports = {
    createMatch,
    joinQueue,
    getMyMatch,
    setMatchResult
}
