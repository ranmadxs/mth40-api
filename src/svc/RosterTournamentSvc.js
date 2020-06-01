var logger = require('../../LogConfig');
var RosterTournament = require ('../schemas/RosterTournament');

class RosterTournamentSvc {
    constructor() {
        if(! RosterTournamentSvc.instance) {
            RosterTournamentSvc.instance = this;
            logger.debug("RosterTournament SVC", "[SVC_INSTANCE]");
        }
        return RosterTournamentSvc.instance;     
    }

    async save (rosterTournamentJson) {
        var rosterTournament = new RosterTournament.model(rosterTournamentJson);
        await rosterTournament.save(function (err) {
            if (err) logger.error (err, "Error Save RosterTournament")
        });
    }

    /*
    async exist (rosterTournamentJson) {

    }
    */

}

const instance = new RosterTournamentSvc();
Object.freeze(instance);
module.exports = instance;