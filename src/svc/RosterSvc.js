var logger = require('../../LogConfig');
const challongeSvc =  require('./ChallongeSvc');
const factionSvc = require('./FactionSvc');
const unitSvc = require('./UnitSvc');

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
}

const instance = new RosterSvc();
Object.freeze(instance);
module.exports = instance;