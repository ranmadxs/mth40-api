var express = require('express');
var router = express.Router();
const logger = require('../../LogConfig');
var multer = require('multer');
var upload = multer();
const rosterSvc =  require('../svc/RosterSvc');
fs = require('fs');
var path = require('path');
global.appRoot = path.resolve(__dirname);

logger.info("Roster Controller", "[CTRL_INIT]");

router.post('/save', upload.single("roster_file"), function(req, res) {
    logger.debug(req.route);
    logger.debug(req.file.originalname, 'fileName');
    logger.debug(req.body.roster_json, 'roster');
    const result = {result: true};
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(result));    
});

router.post('/validate', function(req, res) {
    logger.debug(req.route);
    logger.debug(req.body.roster_json);
    rosterSvc.validateRoster(JSON.parse(req.body.roster_json)).then(result => {
        //logger.debug(result);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(result));
    });    
    
});

module.exports = router;