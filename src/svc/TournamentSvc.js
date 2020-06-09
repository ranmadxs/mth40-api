var logger = require('../../LogConfig');
var Tournament = require ('../schemas/TournamentSchema');

class TournamentSvc {
  constructor() {
    if(! TournamentSvc.instance) {
      TournamentSvc.instance = this;
      logger.debug("Tournament SVC", "[SVC_INSTANCE]");
    }
    return TournamentSvc.instance;
  }

  async get (id) {
    let tournament = await tournament.model.find({
     'id': id,
    });
    return tournament && tournament.length > 0?tournament[0]:null;
  }


  async save (tournament) {
    tournament.updateAt = new Date();
    await Tournament.model.updateOne({
      'id': tournament.id,
    }, { $set: { ... tournament }, $inc: { __v: 1 } },
    tournament).then(async (result) => {
      if (result.n === 0) {
        logger.warn('No se ha encontrado el tournament: ', tournament.id );
        let tournamentNew = new Tournament.model(tournament);
        await tournamentNew.save(function (err) {
          if (err) logger.error (err, "Error Save Tournament")
        });
      } else {
        logger.warn('Se está modificando el Tournament:', tournament.id);
      }
    });
    return tournament;
  }
}

const instance = new TournamentSvc();
Object.freeze(instance);
module.exports = instance;