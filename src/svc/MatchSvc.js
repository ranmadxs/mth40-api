var logger = require('../../LogConfig');
var Tournament = require ('../schemas/TournamentSchema');

class MatchSvc {
  constructor() {
    if(! MatchSvc.instance) {
        MatchSvc.instance = this;
      logger.debug("Tournament SVC", "[SVC_INSTANCE]");
    }
    return MatchSvc.instance;
  }

  async find (tournamentId = null, matchId) {    
    /*
    let tournament = await Tournament.model.find({
     'id': tournamentId,
     'matches.id': parseInt(matchId),
    }).select({ _id: 0, id: 1, matches: 1 });
    return tournament && tournament.length > 0?tournament[0]:null;
    */
    const matchQuery = {};
    let match = null;
    if (tournamentId) {
      matchQuery.id = parseInt(tournamentId);
    }
    await Tournament.model.aggregate([
      { $match: matchQuery },
      { $project: {
        _id: 0,
        id: 1,
        name: 1,
        matches: {
          $filter: {
          input: '$matches',
          as: 'item',
            cond: {
              $and: [
                { $eq: ['$$item.id', parseInt(matchId)] },
              ],
            },
          },
        },
      },
    },
    ]).then((result) => {        
        const tmatch = result && result.length > 0?result[0]:null;
        match = tmatch && tmatch.matches && tmatch.matches.length > 0?tmatch.matches[0]:null;
    });
    
    return match;
  }
}

const instance = new MatchSvc();
Object.freeze(instance);
module.exports = instance;