var express = require('express');
var router = express.Router();
const logger = require('../../LogConfig');

var redisFactory = require('../factories/RedisFactory');


logger.info("Config Controller", "[CTRL_INIT]");


router.get('/redis/clear', function(req, res) {

    logger.info("Clear Redis Keys");
    redisFactory.flushall();
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({resp: true}));
});


module.exports = router;