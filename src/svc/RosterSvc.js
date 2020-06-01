var logger = require('../../LogConfig');
const challongeSvc =  require('./ChallongeSvc');
const factionSvc = require('./FactionSvc');
const unitSvc = require('./UnitSvc');
var Roster = require ('../schemas/RosterSchema');
var RosterFileSchema = require ('../schemas/RosterFileSchema');
class RosterSvc {
    constructor() {
        if(! RosterSvc.instance) {
            RosterSvc.instance = this;
            logger.debug("Roster SVC", "[SVC_INSTANCE]");
        }
        return RosterSvc.instance;     
    }

    searchTournament(i, tournamentName){
        logger.debug(i.name);
        logger.info(tournamentName);
        return i.name.match("/"+tournamentName+"/i");
    }

    async suggestionParticipant(roster) {
        const tournamentId = roster.tournaments.selected;
        if(tournamentId > 1){
            //let participants = await challongeSvc.participants(true, tournamentId);
            let participants = await challongeSvc.listParticipants(tournamentId);
            logger.debug(participants, "[participants]");
            let suggestions = [];
            if(participants.length > 0){
                let suggestionsLvl1 = participants
                    .filter(participant => 
                        participant.name.search(new RegExp(roster.mainFaction, "i")) >= 0);
                logger.debug(suggestionsLvl1, 'suggestionsLvl1:'+roster.mainFaction);
                suggestions = suggestionsLvl1;
                let suggestionsLvl2 = participants
                    .filter(participant => 
                        participant.name.search(new RegExp(roster.teamOwner, "i")) >= 0);
                logger.debug(suggestionsLvl2, 'suggestionsLvl2:'+roster.teamOwner);
                if(suggestionsLvl2.length > 0){
                    suggestions = suggestionsLvl2;
                }
                logger.debug(suggestionsLvl1, "suggestionsLvl1");
                logger.debug(suggestionsLvl2, "suggestionsLvl2");
                roster.tournaments.participant = {
                    suggestions: suggestions
                }
            }        
        }
        return roster;
    }

    async suggestionTournaments(tournamentName, conferenceName){
        const tournaments = await challongeSvc.tournaments();
        logger.debug(tournaments.length, 'tournaments length');
        let suggestions = [];
        if(tournaments.length > 0){
            let suggestionsLvl1 = tournaments
                .filter(tournament => tournament.name.search(new RegExp(tournamentName, "i")) >= 0);
            logger.debug(suggestionsLvl1, 'suggestionsLvl1');
            let suggestionsLvl2 = [];
            if (conferenceName != null){
                suggestionsLvl2 = suggestionsLvl1
                    .filter(tournament => tournament.name.search(new RegExp(conferenceName, "i")) >= 0);
                logger.debug(suggestionsLvl2, 'suggestionsLvl2');                  
            }
            suggestions = suggestionsLvl2.length > 0?suggestionsLvl2:suggestionsLvl1;
        }else {
            logger.warn("No se han encontrado torneos en Challonge");
        }
        logger.debug(suggestions, 'suggestions');
        return suggestions;
    }

    async saveFile(file, roster) {
        logger.debug(file.originalname, "[INIT_SAVE_FILE]");
        
        var rosterFile = new RosterFileSchema.model({
            name: file.originalname,
            rosterName: roster.name,
            rosterId: roster._id,
            binary: file.buffer
        });
        await rosterFile.save(function (err) {if (err) logger.error (err, "Error Save RFile")});
    }

    async saveRoster(rosterJSON){       
        logger.debug(rosterJSON.name, "[INIT_SAVE]");
        rosterJSON.status = "SAVED";
        rosterJSON.updateAt = new Date();
        await Roster.model.updateOne({ name: rosterJSON.name, },
            {
                $set: {
                    ... rosterJSON
                  },
                $inc: { __v: 1 }
            },
            rosterJSON).
            then(async (result) => {
                logger.debug(result, 'result');
                if (result.n === 0) {
                    logger.warn(result, 'No se ha encontrado el roster');
                    let roster = new Roster.model(rosterJSON);
                    await roster.save(function (err) {if (err) logger.error (err, "Error Save Roster")});
                    rosterJSON.id = roster._id;
                } else{
                    let ids = await Roster.model.find({ name: rosterJSON.name,}, '_id');
                    rosterJSON.id = ids[0]._id;             
                }           
        });
        logger.info(`(${rosterJSON.id}) ${rosterJSON.name}`, "SaveRoster [OK]");        
        return rosterJSON;        
    }
    async validateRoster(roster){
        const rosterName = roster.name;

        var matches = rosterName.match(/\{(.*?)\}/);

        let factionMain = null;
        let tournamentName = null;
        let conferenceName = null;
        let teamOwner = null;
        if (matches) {
            var submatch = matches[1];
            logger.info(submatch, "Tournament version");
            const arrayRoster = roster.name.split('{'+submatch+'}');
            logger.info(arrayRoster[0]);
            if (arrayRoster[0].includes("-")){
                const arrayFaction = arrayRoster[0].split('-');
                conferenceName = arrayFaction[0].trim();
                factionMain = arrayFaction[1].trim();
            }else {
                factionMain = arrayRoster[0].trim();
            }
            tournamentName = submatch;
            teamOwner = arrayRoster[1].trim();
        }

        const suggestions = await this.suggestionTournaments(tournamentName, conferenceName);
        roster['tournaments'] = {'suggestions': suggestions};
        roster.status = "VALID";
        roster['mainFaction'] = factionMain;
        roster['conferenceName'] = conferenceName;
        roster['teamOwner'] = teamOwner;
        logger.debug("validate Roster for " + factionMain);
        logger.debug("Get Factions");
        roster['forces'] = await factionSvc.findRosterFaction(roster.forces);
        roster['forces'].forEach(force => {
            force = unitSvc.findUnits(force);
        });
        return roster;
    }

    async listRosters(projections = null) {
        let rosters = [];
        await Roster.model.find({}, projections, (err, rostersList) => {
            console.log(rostersList);
            rosters = rostersList;
        });
        return rosters;
    }

}

const instance = new RosterSvc();
Object.freeze(instance);
module.exports = instance;