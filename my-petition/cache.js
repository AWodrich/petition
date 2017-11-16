const redis = require('redis');

var client = redis.createClient({
    host: 'localhost',
    port: 6379
});

client.on('error', err => {
    console.log(err);
});

//setting key and give expiration
client.setex('disco', 20, 'duck', (err, data) => {
    console.log(err, data);
});

//
// to make sure that the value really is a string, you have to stringify it.
// and then return it into javascirpt you parse it.

// caching null.
// try not caching null. to avoid bugs.



exports.setex = function(key) {
    return new Promise(function(resolve, reject) {
        client.setex(key, expiry, JSON.stringify(val), function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        })
    })
}
