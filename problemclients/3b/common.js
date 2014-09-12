var config = require('./config');
var random = require('seedrandom');

var prng = random(config.secret);
var key = nextKey();

function getKey() {
    return key;
}

function nextKey() {
    key = String(prng()).substr(2, 8);

    return getKey();
}

module.exports = {
    getKey: getKey,
    nextKey: nextKey
};
