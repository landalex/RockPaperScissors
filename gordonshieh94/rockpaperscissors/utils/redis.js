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

async function getPlayerMatch(name) {
    let keys = await client.keys("*");
    keys = keys.filter((key) => !(key.endsWith("_numgames") || key.endsWith("_elo") || key.endsWith("in_queue") || key.endsWith("_history")));
    return keys.find(x => x.startsWith(name)).split('_').pop();
}

async function getMatchMoveFromName(name, matchId) {
    return await client.get(`${name}_${matchId}`);
}

async function getMatchMoves(matchId) {
    let keys = await client.keys("*");
    keys = keys.filter((key) => !(key.endsWith("_numgames") || key.endsWith("_elo") || key.endsWith("in_queue") || key.endsWith("_history")));
    let playersInMatch = keys.filter(x => x.endsWith(matchId));

    // Assuming there's only two players, so hardcoding
    let playerName1 = playersInMatch[0].split('_')[0];
    let playerName2 = playersInMatch[1].split('_')[0];

    return {
        "player1": {
            "name": playerName1,
            "move": await getMatchMoveFromName(playerName1, matchId)
        },
        "player2": {
            "name": playerName2,
            "move": await getMatchMoveFromName(playerName2, matchId)
        }
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

async function getPlayerScore(name) {
    let score = await client.get(`${name}_elo`);

    // score can sometimes be null if the player is new.
    // returning 0, instead of null for good measure
    if (score) {
        return score;
    } else {
        return 0;
    }
}

async function setPlayerScore(name, score) {
    await client.set(`${name}_elo`, score);
}

async function getPlayerNumberGames(name) {
    let numGames = await client.get(`${name}_numgames`);

    // numGames can sometimes be null if the player is new.
    // returning 0, instead of null for good measure
    if (numGames) {
        return numGames;
    } else {
        return 0;
    }
}

async function setPlayerNumberGames(name, numGames) {
    await client.set(`${name}_numgames`, numGames);
}

function publishMessage(channel, message) {
    client.publish(channel, message);
}

module.exports = {
    createMatch,
    joinQueue,
    getPlayerMatch,
    setMatchMove,
    getMatchMoveFromName,
    getMatchMoves,
    getPlayerScore,
    setPlayerScore,
    getPlayerNumberGames,
    setPlayerNumberGames,
    publishMessage
}
