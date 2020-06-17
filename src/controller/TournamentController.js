var express = require('express');
var router = express.Router();
const logger = require('../../LogConfig');
const { check, buildCheckFunction, validationResult } = require('express-validator');
const checkQuery = buildCheckFunction(['query']);
const rosterTorunamentSvc = require('../svc/RosterTournamentSvc');
const tournamentSvc = require('../svc/TournamentSvc');

logger.info("Tournament Controller", "[CTRL_INIT]");

router.get('/tmatch', [
        checkQuery('tournamentId').isNumeric(),
        checkQuery('matchId').isNumeric(),
    ], async (req, res) => {        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(422).json({ errors: errors.array() });
        }
        const {query: {tournamentId, matchId}} = req;
        const result = await tournamentSvc.getTMatch(tournamentId, matchId);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(result));        

});

router.get('/troster', [
        checkQuery('tournamentId').isNumeric(),
        checkQuery('participantId').isNumeric(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(422).json({ errors: errors.array() });
        }
        const {query: {tournamentId, participantId}} = req;
        const result = await rosterTorunamentSvc.get(tournamentId, participantId);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(result));
});

module.exports = router;