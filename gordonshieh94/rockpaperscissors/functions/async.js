/**
* A basic Hello World function
* @param {string} name Who you're saying hello to
* @returns {string}
*/
var redis = require('redis');
var asyncRedis = require("async-redis");
const client = asyncRedis.decorate(redis.createClient('redis://34.211.214.70:6379'));

module.exports = async (name = 'default', context) => {
  let exists = await client.exists(name);
  return name;
};
