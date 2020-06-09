var express = require('express');
var router = express.Router();
const logger = require('../../LogConfig');
const { check, buildCheckFunction, validationResult } = require('express-validator');
const checkQuery = buildCheckFunction(['query']);
const rosterTorunamentSvc = require('../svc/RosterTournamentSvc');
const matchSvc = require('../svc/MatchSvc');

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
        const match = await matchSvc.find(tournamentId, matchId);
        let player1 = null;
        let player2 = null;
        if (match.players && match.players.player1 && match.players.player1.id) {
            player1 = await rosterTorunamentSvc.get(tournamentId, match.players.player1.id);
        } 
        
        if (match.players && match.players.player2 && match.players.player2.id) {
            player2 = await rosterTorunamentSvc.get(tournamentId, match.players.player2.id);
        }
        const result = {
            id: matchId,
            name: match.name,
            state: match.state,
            round: match.round,
            matchNumber: match.matchNumber,
            matchIdentifier: match.matchIdentifier,
            tournament: match.tournament,
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