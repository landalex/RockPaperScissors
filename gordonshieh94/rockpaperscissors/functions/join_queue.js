/**
* Register yourself in the queue to be matched with another player
* @param {string} name Your name
* @returns {string}
*/
var redis = require('../utils/redis')

module.exports = async (name = 'default', context) => {
  return await redis.joinQueue(name);
};
