const _ = require('lodash');
const logger = require('../../LogConfig');
const Mth40Error = require  ('../utils/Mth40Error');
const matchSvc = require('./MatchSvc');
const factionSvc = require('./FactionSvc');
const unitSvc = require('./UnitSvc');
const unitScoreSvc = require('./UnitScoreSvc');
const rosterSvc = require('./RosterSvc');
const tournamentSvc = require('./TournamentSvc');
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

  calculateUnitMVP (unit) {
    logger.info(unit, 'unit');
    logger.info(unit.offensive, 'unit.offensive');
    const C = parseInt(unit.offensive.objetive);
    const D = parseInt(unit.offensive.kill) - parseInt(unit.defensive.death);
    const U = parseInt(unit.offensive.wound) + parseInt(unit.defensive.saving) - parseInt(unit.defensive.wound);
    const mvpScore = C*50 + D*25 + U*10;
    return mvpScore;
  }

  async calculateMVP (matchFull) {
    matchFull.players.forEach(player => {
      let mvp = 0;
      let mvpScore  = null;
      player.units.forEach(unit => {
        mvpScore = this.calculateUnitMVP(unit);
        unit.mvp = {
          score: mvpScore,
        };
      });      
    });
    return matchFull;    
  }

  async findFull (tournamentId, matchId) {
    let matchScore = await this.find(tournamentId, matchId);
    let players = [];
    const tournament = await tournamentSvc.get(tournamentId);
    if(_.isEmpty(matchScore)) {
      logger.warn(`Se debe crear el matchScore para tournamentId=${tournamentId}, matchId=${matchId}`, 'findFull');
      await this.createFull({
        tournamentId: tournamentId,
        matchId: matchId,
      });
      matchScore = await this.find(tournamentId, matchId);      
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
    let matchFull = {
      matchScore: { 
        id: matchScore._id, 
        status: matchScore.status,
        tournamentId: matchScore.tournamentId,
        tournament: tournament,
        matchId: matchScore.matchId
      }
    }

    for (let i = 0; i < matchScore.rosterTournaments.length; i++) {
      const rosterTournament = matchScore.rosterTournaments[i];
      const units = await unitScoreSvc.listFull(rosterTournament.roster._id, rosterTournament.id, matchScore.id);
      logger.info(rosterTournament.roster, 'rosterTournament.roster');
      const faction = await factionSvc.find(rosterTournament.roster.mainFaction);
      logger.debug(faction, 'faction');
      matchScore.rosterTournaments[i] = rosterTournament;
      const factionUrl = faction && faction.factions?faction.factions[0].url:null;
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
            url: factionUrl,
          },          
          teamOwner: rosterTournament.roster.teamOwner,
        },
        units: units
      };
      players.push(player);
    }
    matchFull.players = players;
    //logger.debug(matchScore, 'matchScore');
    if (matchFull && !_.isEmpty(matchFull.players) && matchFull.players.length >= 2) {
      const matchName = matchFull.players[0].participant.name + ' VS ' + matchFull.players[1].participant.name;      
      matchFull = await this.calculateMVP(matchFull);
      matchFull.matchScore.name = matchName;
    }
    return matchFull;
  }

  async createFull (fullMScore) {
    const tournamentId = fullMScore.tournamentId;
    const matchId = fullMScore.matchId;
    const match = await matchSvc.find(tournamentId, matchId);
    logger.info(`tournamentId=${tournamentId}, matchId=${matchId}`, 'Create full Match Score');
    const players = match.players;
    logger.info(match, 'match');
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
    /* (2) Se asignan los roster tournaments al matchScore (debe existir al menos 2) */
    matchScoreObj.rosterTournaments = rosterTournaments;
    if (rosterTournaments.length < 2) {
      throw new Mth40Error('Se requieren al menos 2 roster tournaments', 424, 'MatchScoreError');
    }
    /* (3) Se crea el MatchScore */
    matchScoreObj = await this.create(matchScoreObj);

    /* (4) Se crean en caso que no existan los units score */
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