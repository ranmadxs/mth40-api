var express = require('express');
var router = express.Router();
const logger = require('../../LogConfig');
var multer = require('multer');
var upload = multer();
const rosterSvc =  require('../svc/RosterSvc');
const rosterTorunamentSvc = require('../svc/RosterTournamentSvc');
fs = require('fs');
var path = require('path');
global.appRoot = path.resolve(__dirname);

logger.info("Roster Controller", "[CTRL_INIT]");

router.post('/save', upload.single("roster_file"), async (req, res) => {
    logger.debug(req.route);
    logger.debug(req.file.originalname, 'fileName');
    //logger.debug(req.body.roster_json, 'roster');    
    var jsonStr = JSON.stringify( JSON.parse(req.body.roster_json), function( key, value ) {
        if( key === "$$hashKey" ) {
            return undefined;
        }
    
        return value;
    });        
    let roster = await rosterSvc.saveRoster(JSON.parse(jsonStr));
    //rosterSvc.saveFile(req.file, roster);
    //Save roster tournament
    if (roster.tournaments && roster.tournaments.selected
        && roster.tournaments.participant && roster.id
        && roster.tournaments.participant.selected) {
        const rosterTournament = {
            tournament: {
                id: roster.tournaments.selected
            },
            participantId: roster.tournaments.participant.selected,
            roster: {
                id: roster.id,
                name: roster.name,
            }
        }
        logger.debug(rosterTournament, 'rosterTournament');
        //rosterTournament.save(rosterTournament);
    }
    res.writeHead(200, {'Content-Type': 'application/json'});
    delete roster._id;
    res.end(JSON.stringify(roster));    
});

router.post('/findParticipant', function(req, res) {
    //logger.debug(req.route);
    //logger.debug(req.body.roster_json);
    rosterSvc.suggestionParticipant(JSON.parse(req.body.roster_json)).then(result => {
        //logger.debug(result);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(result));
    });    
    
});

router.post('/validate', function(req, res) {
    //logger.debug(req.route);
    //logger.debug(req.body.roster_json);
    rosterSvc.validateRoster(JSON.parse(req.body.roster_json)).then(result => {
        //logger.debug(result);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(result));
    });    
    
});

router.get('/list', async (req, res) => {
    const projections = req.query.projections || null;
    const result = await rosterSvc.listRosters(projections); 
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(result));
});

module.exports = router;