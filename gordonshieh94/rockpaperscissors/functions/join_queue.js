/**
* A basic Hello World function
* @param {string} name Who you're saying hello to
* @returns {string}
*/
var redis = require('redis')

var client = redis.createClient('redis://34.211.214.70:6379')

module.exports = (name = 'default', context, callback) => {
  client.exists(name, (err, exists) => {
    if (exists == 0) {
      // Add name (uuid) to set
      client.sadd('in_queue', name);
      // Sets don't have an expiry, so we need to make a key with a value that expires
      client.set(name, 'still alive!', 'EX', 10);
      callback(null, `hello ${name}`);
    } else {
      callback(null, `get outta here ${name}`)
    }

  })
};
