var logger = require('../../LogConfig');
var Tournament = require ('../schemas/TournamentSchema');
var matchSvc = require('./MatchSvc');
var rosterTorunamentSvc = require('./RosterTournamentSvc');

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

  async getTMatch(tournamentId, matchId) {
    logger.info(tournamentId, 'tournamentId');
    logger.info(matchId, 'matchId');
    const match = await matchSvc.find(tournamentId, matchId);
    logger.info(match, 'match');
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
    return result;
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
        logger.info('Se está modificando el Tournament:', tournament.id);
      }
    });
    return tournament;
  }
}

const instance = new TournamentSvc();
Object.freeze(instance);
module.exports = instance;