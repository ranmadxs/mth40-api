var express = require('express');
var router = express.Router();
const logger = require('../../LogConfig');
const { check, buildCheckFunction, validationResult } = require('express-validator');
const checkQuery = buildCheckFunction(['query']);
const rosterTorunamentSvc = require('../svc/RosterTournamentSvc');

logger.info("Tournament Controller", "[CTRL_INIT]");

router.get('/tmatch', [
        checkQuery('tournamentId').isNumeric(),
        checkQuery('idPlayer1').isNumeric(),
        checkQuery('idPlayer2').isNumeric(),
    ], async (req, res) => {        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(422).json({ errors: errors.array() });
        }
        const {query: {tournamentId, idPlayer1, idPlayer2}} = req;
        const player1 = await rosterTorunamentSvc.get(tournamentId, idPlayer1);
        const player2 = await rosterTorunamentSvc.get(tournamentId, idPlayer2);
        let tournament = {id: tournamentId};
        if (player1 && player1.tournament) {
            tournament = player1.tournament;
        } else if (player2 && player2.tournament) {
            tournament = player2.tournament;
        }
        const result = {
            tournament: tournament,
            player1: player1,
            player2: player2,
        };
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