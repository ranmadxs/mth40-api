var express = require('express');
const _ = require('lodash');
var router = express.Router();
const logger = require('../../LogConfig');
const { check, validationResult } = require('express-validator');
const matchScoreSvc = require('../svc/MatchScoreSvc');
const unitScoreSvc = require('../svc/UnitScoreSvc');
const matchSvc = require('../svc/MatchSvc');
const unitSvc = require('../svc/UnitSvc');
const rosterTournamentSvc = require('../svc/RosterTournamentSvc');
const Mth40Error = require  ('../utils/Mth40Error');

logger.info("Score Controller", "[CTRL_INIT]");

router.get('/unitsByRoster/:tournamentId/:rosterId', [
  check('tournamentId').isNumeric(),
  check('rosterId').exists(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const { params: {tournamentId, rosterId} } = req;
  let result = null;
  try{
    const rosterTournament = await rosterTournamentSvc.getRosterTournament(tournamentId, rosterId);
    if (rosterTournament && rosterTournament._id) {
      result = await unitScoreSvc.getScoresByRosterTournament(rosterTournament._id);
    }
  } catch(ex){
    logger.error(ex);
    return res.status(_.isEmpty(ex)?500:ex.code).json(_.isEmpty(ex)?{ error: ex.message }:ex);
  }
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(result));
});


module.exports = router;
