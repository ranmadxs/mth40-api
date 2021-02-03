var express = require('express');
const _ = require('lodash');
var router = express.Router();
const logger = require('../../LogConfig');
const { check, validationResult } = require('express-validator');
const matchScoreSvc = require('../svc/MatchScoreSvc');
const unitScoreSvc = require('../svc/UnitScoreSvc');
const matchSvc = require('../svc/MatchSvc');
const unitSvc = require('../svc/UnitSvc');
const Mth40Error = require  ('../utils/Mth40Error');

logger.info("Match Controller", "[CTRL_INIT]");

router.put('/calculateMVP', async (req, res) => {
  logger.info(req.body, 'body');
  let result = null;
  try{
    const {
      unit,
    } = req.body;
    //logger.debug(unit, 'unit');
    result = await matchScoreSvc.calculateUnitMVP(req.body);
  } catch(ex){
    logger.error(ex);
    return res.status(_.isEmpty(ex)?500:ex.code).json(_.isEmpty(ex)?{ error: ex.message }:ex);
  }
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(result));  
}); 

router.put('/saveOption', async (req, res) => {
  logger.info(req.body, 'body');
  let result = null;
  try{
    const {
      type,
      alias,
      unitId,
    } = req.body;
    if (type.toLowerCase() === 'alias') {      
      const rosterUnitExtended = {
        alias: alias,
        unitId: unitId,
      };
      logger.info(rosterUnitExtended, 'Saving alias');
      await unitSvc.saveAlias(rosterUnitExtended);
    } else if(type.toLowerCase() === 'offensive' || type.toLowerCase() === 'defensive'){    
      result = await unitScoreSvc.saveOption(req.body);
    }
  } catch(ex){
    logger.error(ex);
    return res.status(_.isEmpty(ex)?500:ex.code).json(_.isEmpty(ex)?{ error: ex.message }:ex);
  }
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(result));  
}); 

router.get('/score/:tournamentId/:matchId', [
    check('matchId').isNumeric(),
    check('tournamentId').isNumeric(),
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { params: {tournamentId, matchId} } = req;
    let result = null;
    try{
      result = await matchScoreSvc.findFull(tournamentId, matchId);
    } catch(ex){
      logger.error(ex);
      return res.status(_.isEmpty(ex)?500:ex.code).json(_.isEmpty(ex)?{ error: ex.message }:ex);
    }
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(result));
});

router.get('/find/:matchId/:tournamentId', [
    check('matchId').isNumeric(),
    check('tournamentId').isNumeric(),
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { params: {tournamentId, matchId} } = req;

    const result = await matchSvc.find(tournamentId, matchId);
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(result));
});



module.exports = router;
