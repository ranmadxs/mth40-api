var express = require('express');
var router = express.Router();
const logger = require('../../LogConfig');
const { check, validationResult } = require('express-validator');
const matchSvc = require('../svc/MatchSvc');

logger.info("Match Controller", "[CTRL_INIT]");

router.get('/find/:matchId/:tournamentId', [
    check('matchId').isNumeric(),
], async (req, res) => {        
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { params: {tournamentId, matchId} } = req;

    const result = await matchSvc.find(tournamentId, matchId);
    //const player2 = await rosterTorunamentSvc.get(tournamentId, idPlayer2);

    //console.log(req.params);
    //const result = {ok: true};
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(result));        
});

module.exports = router;
