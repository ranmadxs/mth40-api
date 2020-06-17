var express = require('express');
const _ = require('lodash');
var router = express.Router();
const logger = require('../../LogConfig');
const { check, validationResult } = require('express-validator');
const matchScoreSvc = require('../svc/MatchScoreSvc');
const matchSvc = require('../svc/MatchSvc');
const Mth40Error = require  ('../utils/Mth40Error');

logger.info("Match Controller", "[CTRL_INIT]");

router.get('/score/:tournamentId/:matchId', [
    check('matchId').isNumeric(),
    check('tournamentId').isNumeric(),
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { params: {tournamentId, matchId} } = req;
    const result = null;
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