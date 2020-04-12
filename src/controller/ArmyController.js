var express = require('express');
var router = express.Router();
const logger = require('../../LogConfig');

const armySvc = require('../svc/ArmySvc');

logger.info("Army Controller", "[CTRL_INIT]");

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
    logger.debug('Time: ', Date.now());
    next();
});

// define the home page route
router.get('/list', function(req, res) {
    logger.debug(req.route);
    res.writeHead(200, {'Content-Type': 'application/json'});
    var promisedResult = armySvc.listArmy();
    promisedResult.then(function (result) {
        logger.info(result);
        res.end(JSON.stringify(result));
    });    
});

module.exports = router;