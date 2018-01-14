/**
* A basic Hello World function
* @param {string} name Who you're saying hello to
* @returns {string}
*/
var redis = require('../utils/redis')

module.exports = async (name = 'default', context) => {
  return await redis.joinQueue(name)
};
