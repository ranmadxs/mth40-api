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

    async get (tournamentId, participantId) {
        let rosterTournament = await RosterTournament.model.find({
            'tournament.id': parseInt(tournamentId),
            'participant.id': parseInt(participantId),
        });
        return rosterTournament;
    }


    async save (rtour) {
        rtour.updateAt = new Date();
        await RosterTournament.model.updateOne({ 
            'tournament.id': rtour.tournament.id,
            'participant.id': rtour.participant.id,
        }, { $set: { ... rtour }, $inc: { __v: 1 } },
        rtour).then(async (result) => {
            if (result.n === 0) {
                logger.warn(result, 'No se ha encontrado el roster tournament');
                let rosterTour = new RosterTournament.model(rtour);
                await rosterTour.save(function (err) {
                    if (err) logger.error (err, "Error Save RosterTournament")
                });
            }
        });
        return rtour;
    }
}

const instance = new RosterTournamentSvc();
Object.freeze(instance);
module.exports = instance;