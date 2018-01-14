/**
* A basic Hello World function
* @param {string} name Who you're saying hello to
* @returns {string}
*/
var redis = require('redis')

var client = redis.createClient('redis://localhost:6379')

module.exports = (name = 'default', context, callback) => {
  client.set('in_queue', name, 'EX', 15);
  callback(null, `hello ${name}`);
};
