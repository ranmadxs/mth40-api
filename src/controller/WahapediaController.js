var express = require('express');
const _ = require ('lodash');
var router = express.Router();
const logger = require('../../LogConfig');
fs = require('fs');
var path = require('path');
const { check, validationResult } = require('express-validator');
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

router.get('/unit/:edition/:faction/:unit', [
  check('edition').exists(),
  check('faction').exists(),
  check('unit').exists(),
], async (req, res) => {
  logger.debug("wahapedia->unit get");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  let result = { status: "NOK" };
  try{
    const { params: {edition, faction, unit} } = req;
    result = await wahapediaSvc.getUnit(edition, faction, unit);
  } catch(ex){
    logger.error(ex);
    return res.status(_.isEmpty(ex)?500:ex.code).json(_.isEmpty(ex)?{ error: ex.message }:ex);
  }  
  res.writeHead(200, {'Content-Type': 'application/json'});  
  res.end(JSON.stringify(result));
});

module.exports = router;