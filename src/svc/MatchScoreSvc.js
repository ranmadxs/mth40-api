const _ = require('lodash');
const logger = require('../../LogConfig');
const Mth40Error = require  ('../utils/Mth40Error');
//import { Mth40Error } from '../utils/Mth40Error';

const matchSvc = require('./MatchSvc');
const unitSvc = require('./UnitSvc');
const unitScoreSvc = require('./UnitScoreSvc');
const rosterSvc = require('./RosterSvc');
const tournamentSvc = require('./TournamentSvc');
const rosterTournamentSvc = require('./RosterTournamentSvc');
const playerScoreSvc = require('./PlayerScoreSvc');
var MatchScore = require ('../schemas/MatchScoreSchema');


class MatchScoreSvc {
  constructor() {
    if(! MatchScoreSvc.instance) {
      MatchScoreSvc.instance = this;
      logger.debug("Match Score SVC", "[SVC_INSTANCE]");
    }
    return MatchScoreSvc.instance;
  }

  async find(tournamentId, matchId) {
    let matchScore = await MatchScore.model.find({
      'tournamentId': parseInt(tournamentId),
      'matchId': parseInt(matchId),
     });
     return matchScore && matchScore.length > 0?matchScore[0]:null;    
  }

  async findFull (tournamentId, matchId) {
    //const match = await matchSvc.find(tournamentId, matchId);
    //const tournament = await tournamentSvc.getTMatch(tournamentId, matchId);
    //logger.debug(tournament, 'tournament');
    const matchScore = await this.find(tournamentId, matchId);
    
    const match = await matchSvc.find(tournamentId, matchId);
    if(_.isEmpty(match)) {
      throw new Mth40Error('No se encuentra el match', 424, 'MatchScoreError');
    }
    
    let fullMScore = {
      tournamentId: tournamentId,
      matchId: matchId,
      status: match.state,
      match: match
    };
    logger.debug(matchScore, 'matchScore');
    if(_.isEmpty(matchScore)) {
      logger.warn(`Se debe crear el matchScore para tournamentId=${tournamentId}, matchId=${matchId}`, 'findFull');
      await this.createFull(fullMScore);
    }
    return matchScore;
  }

  async createFull (fullMScore) {
    const tournamentId = fullMScore.tournamentId;
    const matchId = fullMScore.matchId;
    logger.info(`tournamentId=${tournamentId}, matchId=${matchId}`, 'Create full Match Score');
    logger.debug(fullMScore.match, 'match');
    const players = fullMScore.match.players;
    let playersScore = [];
    for (var pKey in players) {
      logger.info(players[pKey], pKey);
      const rosterTournament = await rosterTournamentSvc.get(tournamentId, players[pKey].id);
      if(_.isEmpty(rosterTournament) || _.isNaN(rosterTournament._id)) {
        throw new Mth40Error('No se encuentra el rosterTournament', 424, 'MatchScoreError');
      }
      /* Se refuerza la creación de unidades en caso que no existan previamente en el Army */
      await unitSvc.updateUnits(rosterTournament.roster.id);
      let playerScore = {
        rosterTournament: rosterTournament
      };
      playersScore.push(playerScore);

    }    

    //playerScoreSvc.save(rosterTournament, unitScore);
    throw new Mth40Error('Not implemented yet', 501, 'MatchScoreError');
    this.save(tournamentId, matchId);
  }

  async save(tournamentId, matchId) {
    logger.info(`tournamentId=${tournamentId}, matchId=${matchId}`, 'save Match Score');
  }
}

const instance = new MatchScoreSvc();
Object.freeze(instance);
module.exports = instance;