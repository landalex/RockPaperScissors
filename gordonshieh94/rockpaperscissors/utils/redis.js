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
    return keys.find(x => x.startsWith(name)).split('_').pop();
}

async function getMatchMoveFromName(name, matchId) {
    return await client.get(`${name}_${matchId}`);
}

async function getMatchMoves(matchId) {
    let keys = await client.keys();
    let playersInMatch = keys.filter(x => x.endsWith(match));

    // Assuming there's only two players, so hardcoding
    let playerName1 = playersInMatch[0].split('_')[0];
    let playerName2 = playersInMatch[1].split('_')[0];

    return {
        [playerName1]: await getMatchMove(playerName1, matchId),
        [playerName2]: await getMatchMove(playerName2, matchId)
    }
}

async function setMatchMove(name, matchId, move) {
    await client.set(`${name}_${matchId}`, move);
}

async function appendMoveHistory(user, move) {
    await client.rpush(`${user}_history`, move)
}

async function getMoveHistory(user) {
    return await client.get(`${user}_history`)
}

module.exports = {
    createMatch,
    joinQueue,
    getMyMatch,
    setMatchMove,
    getMatchMoveFromName,
    getMatchMoves,
}
