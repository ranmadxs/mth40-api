const _ = require('lodash');
const logger = require('../../LogConfig');
const Mth40Error = require  ('../utils/Mth40Error');
const matchSvc = require('./MatchSvc');
const factionSvc = require('./FactionSvc');
const unitSvc = require('./UnitSvc');
const unitScoreSvc = require('./UnitScoreSvc');
const rosterSvc = require('./RosterSvc');
const rosterTournamentSvc = require('./RosterTournamentSvc');
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
     }).populate("rosterTournaments");
     return matchScore && matchScore.length > 0?matchScore[0]:null;
  }

  async findFull (tournamentId, matchId) {
    const matchScore = await this.find(tournamentId, matchId);
    let players = [];

    if(_.isEmpty(matchScore)) {
      logger.warn(`Se debe crear el matchScore para tournamentId=${tournamentId}, matchId=${matchId}`, 'findFull');
      matchScore = await this.createFull({
        tournamentId: tournamentId,
        matchId: matchId,
      });
    } else {
      for (let i = 0; i < matchScore.rosterTournaments.length; i++){
        const rosterTournament = matchScore.rosterTournaments[i];
        const roster = await rosterSvc.getRoster(rosterTournament.roster.id, 
          'conferenceName forces name mainFaction teamOwner');        
        rosterTournament.roster = roster;
        await unitSvc.updateUnits(roster);
        matchScore.rosterTournaments[i] = rosterTournament;
      }
      await unitScoreSvc.createAll(matchScore);
    }
    const matchFull = {
      matchScore: { 
        id: matchScore._id, 
        status: matchScore.status,
        tournamentId: matchScore.tournamentId,
        matchId: matchScore.matchId
      }
    }

    for (let i = 0; i < matchScore.rosterTournaments.length; i++) {
      const rosterTournament = matchScore.rosterTournaments[i];
      const units = await unitScoreSvc.listFull(rosterTournament.id, matchScore.id);
      const faction = await factionSvc.find(rosterTournament.roster.mainFaction);
      //logger.debug(faction, 'faction');
      matchScore.rosterTournaments[i] = rosterTournament;
      const player = {
        participant: {
          id: rosterTournament.participant.id,
          name: rosterTournament.participant.name,
        },
        roster: {
          id: rosterTournament.roster.id,
          name: rosterTournament.roster.name,
          conferenceName: rosterTournament.roster.conferenceName,
          mainFaction: {
            name: rosterTournament.roster.mainFaction,
            url: faction.factions[0].url,
          },          
          teamOwner: rosterTournament.roster.teamOwner,
        },
        units: units
      };
      players.push(player);
    }
    matchFull.players = players;
    //logger.debug(matchScore, 'matchScore');
    return matchFull;
  }

  async createFull (fullMScore) {
    const tournamentId = fullMScore.tournamentId;
    const matchId = fullMScore.matchId;
    logger.info(`tournamentId=${tournamentId}, matchId=${matchId}`, 'Create full Match Score');
    const players = fullMScore.match.players;
    let matchScoreObj = {
      tournamentId: tournamentId,
      matchId: matchId,
      status: 'INIT',      
    };
    let rosterTournaments = [];
    for (var pKey in players) {
      const rosterTournament = await rosterTournamentSvc.get(tournamentId, players[pKey].id);
      if(_.isEmpty(rosterTournament) || _.isNaN(rosterTournament._id)) {
        throw new Mth40Error('No se encuentra el rosterTournament', 424, 'MatchScoreError');
      }
      /* (1) Se refuerza la creación de unidades en caso que no existan previamente en el Army */
      const roster = await rosterSvc.getRoster(rosterTournament.roster.id, 'conferenceName forces name');
      rosterTournament.roster = roster;
      await unitSvc.updateUnits(roster);
      
      rosterTournaments.push(rosterTournament);
    }
    matchScoreObj.rosterTournaments = rosterTournaments;
    /* (2) Se crea el MatchScore */
    matchScoreObj = await this.create(matchScoreObj);

    /* (3) Se crean en caso que no existan los units score */
    await unitScoreSvc.createAll(matchScoreObj);
    return matchScoreObj;
  }

  async create(matchScoreObj) {
    logger.debug(matchScoreObj.matchId, "[INIT_SAVE]");
    matchScoreObj.status = "SAVED";
    matchScoreObj.updateAt = new Date();
    let matchScore = new MatchScore.model(matchScoreObj);
    await matchScore.save(function (err) {if (err) logger.error (err, "Error Save MatchScore")});
    matchScoreObj.id = matchScore._id;    
    return matchScoreObj;
  }
}

const instance = new MatchScoreSvc();
Object.freeze(instance);
module.exports = instance;