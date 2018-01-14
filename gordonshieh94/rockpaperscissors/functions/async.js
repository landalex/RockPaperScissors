
var redis = require('redis');
var asyncRedis = require("async-redis");
const ghettoClient = redis.createClient('redis://34.211.214.70:6379');
const client = asyncRedis.decorate(ghettoClient);
const key_filter = "!(*_numgames|*_elo|in_queue|_history)";


module.exports = async (name = 'default', context) => {
    // ghettoClient.keys('*', (err, result) => {
    //     callback(null, err)
    // })
    let keys = await client.keys("*");
    keys = keys.filter((key) => !(key.endsWith("_numgames") || key.endsWith("_elo") || key.endsWith("in_queue") || key.endsWith("_history")));
    return keys.find(x => x.startsWith(name)).split('_').pop();
    // return keys.find(x => x.startsWith(name)).split('_').pop();
  // return await client.keys("*").find(x => x.startsWith(name)).split('_').pop();
};
