var express = require('express');
var router = express.Router();
const logger = require('../../LogConfig');
var multer = require('multer');
var upload = multer();
const rosterSvc =  require('../svc/RosterSvc');

logger.info("Roster Controller", "[CTRL_INIT]");

router.post('/validate', upload.single("roster_file"), function(req, res) {
    logger.debug(req.route);
    logger.info(req.body.roster_json);
    logger.info(req.file);
    rosterSvc.validateRoster(JSON.parse(req.body.roster_json), req.file).then(result => {
        logger.info(result);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(result));
    });    
});

module.exports = router;