var express = require('express');
var router = express.Router();
const logger = require('../../LogConfig');
const challongeSvc =  require('../svc/ChallongeSvc');

logger.info("Challonge Controller", "[CTRL_INIT]");

router.get('/tournaments', function (req, res) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    var promisedResult = challongeSvc.tournaments();

    promisedResult.then(function (result) {
        logger.info(result);
        res.end(JSON.stringify(result));
    });    
});

router.get('/matches', async (req, res) => {
    const tournamentId = req.query.tournamentId || null;
    if(tournamentId == null) {
        res.writeHead(400, {'Content-Type': 'text/plain'});
        res.end('tournament Id required');    
    }
    const result = await challongeSvc.matches(tournamentId);
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(result));  
});

router.get('/tournament', async (req, res) => {
    const tournamentId = req.query.tournamentId || null;
    const include_participants = req.query.include_participants || 0;
    const include_matches = req.query.include_matches || 0;
    if(tournamentId == null) {
        res.writeHead(400, {'Content-Type': 'text/plain'});
        res.end('tournament Id required');    
    }
    const result = await challongeSvc.getTournament(tournamentId, include_participants, include_matches);
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(result));  
});

module.exports = router;