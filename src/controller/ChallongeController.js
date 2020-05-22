var express = require('express');
var router = express.Router();
const logger = require('../../LogConfig');
const challongeSvc =  require('../svc/ChallongeSvc');

logger.info("Challonge Controller", "[CTRL_INIT]");

router.get('/tournaments', function (req, res) {
    //console.debug(req.route, '/challonge/tournaments/');
    res.writeHead(200, {'Content-Type': 'application/json'});
    var promisedResult = challongeSvc.tournaments();

    promisedResult.then(function (result) {
        logger.info(result);
        res.end(JSON.stringify(result));
    });    
});

module.exports = router;