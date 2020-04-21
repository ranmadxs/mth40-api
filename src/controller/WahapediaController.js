var express = require('express');
var router = express.Router();
const logger = require('../../LogConfig');
fs = require('fs');
var path = require('path');
global.appRoot = path.resolve(__dirname);

const wahapediaSvc =  require('../svc/WahapediaSvc');

logger.info("Wahapedia Controller", "[CTRL_INIT]");

router.get('/factions', function(req, res) {
    logger.debug("wahapedia->factions get");
    wahapediaSvc.getFactions();
    res.writeHead(200, {'Content-Type': 'application/json'});
    let result = {status: "OK"};
    res.end(JSON.stringify(result));    
});

router.get('/subFactions', function(req, res) {
    logger.debug("wahapedia->subFactions get");
    logger.debug(req.query);
    const url = 'http://wahapedia.ru/wh40k8ed/factions/' + req.query.faction + '/';
    logger.info(url);
    wahapediaSvc.getSubFactions(url);
    //wahapediaSvc.getFactions();
    res.writeHead(200, {'Content-Type': 'application/json'});
    let result = {status: "OK"};
    res.end(JSON.stringify(result));    
});

module.exports = router;