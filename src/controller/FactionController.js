var express = require('express');
var router = express.Router();
const logger = require('../../LogConfig');

const factionSvc = require('../svc/FactionSvc');

logger.info("Faction Controller", "[CTRL_INIT]");


module.exports = router;