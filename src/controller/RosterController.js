var express = require('express');
var router = express.Router();
const logger = require('../../LogConfig');

router.post('/validateRoster', function(req, res) {
    logger.debug(req.route);
    logger.info(req.params);
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify("{res: 'OK'}"));
});

module.exports = router;