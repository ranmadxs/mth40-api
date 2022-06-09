const _ = require('lodash');
const logger = require('../../LogConfig');
const Mth40Error = require  ('../utils/Mth40Error');
const UnitScore = require ('../schemas/UnitScoreSchema');
const unitSvc = require('./UnitSvc');
const rosterSvc =  require('./RosterSvc');
var mongoose = require ("mongoose");

class UnitScoreSvc {
  constructor() {
    if(! UnitScoreSvc.instance) {
      UnitScoreSvc.instance = this;
      logger.debug("Unit Score SVC", "[SVC_INSTANCE]");
    }
    return UnitScoreSvc.instance;
  }

  async getScoresByRosterTournament(rosterTournament) {
    let rosterTournamentScores = {};
    let unitScoreList = [];
    const rosterTournamentId = rosterTournament._id;

    let scoreTotals = await UnitScore.model.aggregate([ 
      {"$match":{"rosterTournament": mongoose.Types.ObjectId(rosterTournamentId)}},      
      { 
        $group: { 
          _id: null, 
          scoreTotal: { $sum: "$score" },
          count: {$sum: 1},
          offKillTotal: { $sum: "$offensive.kill" },
          offWoundTotal: { $sum: "$offensive.wound" },
          offObjetiveTotal: { $sum: "$offensive.objetive" },
          defDeathTotal: { $sum: "$defensive.death" },
          defWoundTotal: { $sum: "$defensive.wound" },
          defSavingTotal: { $sum: "$defensive.saving" },
        }
      },
      { $project :{
        score: {
          total: "$scoreTotal",
          average: null,
          offensive: {
            kill: {total: "$offKillTotal", average: null},
            wound: {total: "$offWoundTotal", average: null},
            objetive: {total: "$offObjetiveTotal", average: null},
          },
          defensive: {
            death: {total: "$defDeathTotal", average: null},
            wound: {total: "$defWoundTotal", average: null},
            saving: {total: "$defSavingTotal", average: null},
          },
          count: "$count"
        }
      }}      
    ] );
    scoreTotals = scoreTotals && scoreTotals.length > 0?scoreTotals[0]:null;    
    await UnitScore.model.aggregate([
      {"$match":{"rosterTournament": mongoose.Types.ObjectId(rosterTournamentId)}},
      {
         $group: {
            _id: "$unitId",
            scoreTotal: { $sum: "$score"},
            scoreAvg: { $avg: "$score"},
            offKillTotal: { $sum: "$offensive.kill" },
            offKillAvg: { $avg: "$offensive.kill" },
            offWoundTotal: { $sum: "$offensive.wound" },
            offWoundAvg: { $avg: "$offensive.wound" },
            offObjetiveTotal: { $sum: "$offensive.objetive" },
            offObjetiveAvg: { $avg: "$offensive.objetive" },
            defDeathTotal: { $sum: "$defensive.death" },
            defDeathAvg: { $avg: "$defensive.death" },
            defWoundTotal: { $sum: "$defensive.wound" },
            defWoundAvg: { $avg: "$defensive.wound" },
            defSavingTotal: { $sum: "$defensive.saving" },
            defSavingAvg: { $avg: "$defensive.saving" },            
            count: {$sum: 1}
         },
      },
      {$sort:  {'scoreTotal': -1}},
      { $project :{        
        score: {
          total: "$scoreTotal", 
          average: "$scoreAvg",
          offensive: {
            kill: {total: "$offKillTotal", average: "$offKillAvg"},
            wound: {total: "$offWoundTotal", average: "$offWoundAvg"},
            objetive: {total: "$offObjetiveTotal", average: "$offObjetiveAvg"},
          },
          defensive: {
            death: {total: "$defDeathTotal", average: "$defDeathAvg"},
            wound: {total: "$defWoundTotal", average: "$defWoundAvg"},
            saving: {total: "$defSavingTotal", average: "$defSavingAvg"},
          },
          count: "$count"
        }
      }}
    ]).then(async (unitScoreResp) => {
      unitScoreList = unitScoreResp;
      for (let index = 0; index < unitScoreList.length; index++) {
        const unitScore = unitScoreList[index];
        unitScore['id'] = unitScore._id;
        const rosterUnit = await rosterSvc.getRosterUnitById([unitScore._id]);
        if(rosterUnit && rosterUnit.length > 0 ){
          unitScoreList[index] = { ...rosterUnit[0], ...unitScore };
        }
      }
      if ( unitScoreList && unitScoreList.length > 0) {
        //const totalPartidos = scoreTotals.score.total;
        const totalPartidos = scoreTotals.score.count;
        const totalUnits = unitScoreList.length;
        const totDiv = totalPartidos / totalUnits;
        scoreTotals.score.average = scoreTotals.score.total / totDiv;
        scoreTotals.score.offensive.kill.average = scoreTotals.score.offensive.kill.total / totDiv;
        scoreTotals.score.offensive.wound.average = scoreTotals.score.offensive.wound.total / totDiv;
        scoreTotals.score.offensive.objetive.average = scoreTotals.score.offensive.objetive.total / totDiv;
        scoreTotals.score.defensive.death.average = scoreTotals.score.defensive.death.total / totDiv;
        scoreTotals.score.defensive.wound.average = scoreTotals.score.defensive.wound.total / totDiv;
        scoreTotals.score.defensive.saving.average = scoreTotals.score.defensive.saving.total / totDiv;
        scoreTotals.score.count = totDiv;
      }      
    }).catch((err) => {
      logger.error(err);
      throw new Mth40Error(err.message, 424, 'UnitSvcError');      
    });
    rosterTournamentScores.roster = rosterTournament.roster;
    rosterTournamentScores.resume = scoreTotals;
    rosterTournamentScores.units = unitScoreList;
    return rosterTournamentScores;

  }

  async listFull(rosterId, rosterTournamentId, matchScoreId) {
    let retList = [];
    let listUScores = await this.list(rosterTournamentId, matchScoreId);
    for(let i = 0; i < listUScores.length; i++){
      let unitScore = listUScores[i];
      let unitRoster = await unitSvc.findRosterUnit(rosterId, unitScore.unitId);
      if (unitRoster == null){
        logger.warn('No se ha encontrado el unitScore.unitId = ', unitScore.unitId);
        logger.warn(matchScoreId, 'matchScoreId');
      }
      if (!_.isEmpty(unitRoster)){
        unitScore.url = unitRoster.url;
        unitScore.name = unitRoster.name;
        listUScores[i] = unitScore;
        retList.push({
          id: unitScore._id,   
          ...unitRoster,
          matchScoreId: unitScore.matchScore,
          rosterTournamentId: unitScore.rosterTournament,
          defensive: unitScore.defensive,
          offensive: unitScore.offensive,
        });
      }
    }
    return retList;
  }

  async list(rosterTournamentId, matchScoreId){
    const listMs = await UnitScore.model.find({
      'matchScore': matchScoreId,
      'rosterTournament': rosterTournamentId,      
     });
     return listMs;
  }

  async createAll(matchScore) {
    for (let j = 0; j < matchScore.rosterTournaments.length; j++) {
      const rosterTournament = matchScore.rosterTournaments[j];
      const roster = rosterTournament.roster;
      logger.debug(`Save all units in roster ${roster._id}`, roster.name);
      for (let i = 0; i < roster.forces.length; i++) {
        const force = roster.forces[i];
        //logger.debug(force, 'force');
        if(force.units && force.units.length > 0 ){
          const rosterUnits = force.units;
          let matchUnits = await this.list(rosterTournament._id, matchScore._id);
          for (let k = 0; k < rosterUnits.length; k++) {
            const rUnit = rosterUnits[k];
            if (!(matchUnits.filter(fUnit => fUnit.unitId == rUnit.id).length > 0)) {
              logger.debug(rUnit, 'rUnit');
              logger.warn('No existe la unidad', rUnit.name);
              //Aca se guarda.
              let unitScore = {
                unitId: rUnit.id,
                matchScore: matchScore.id,
                rosterTournament: rosterTournament.id,
                offensive: {kill: 0, wound: 0, objetive: 0},
                defensive: {death: 0, wound: 0, saving: 0},
              };
              unitScore = await this.save(unitScore);
            }
          };
          //logger.debug(rosterUnits, 'rosterUnits');
        }
      }
    }
  }

  calculateUnitMVP (unit) {
    const C = parseInt(unit.offensive.objetive);
    const D = parseInt(unit.offensive.kill) - parseInt(unit.defensive.death);
    const U = parseInt(unit.offensive.wound) + parseInt(unit.defensive.saving) - parseInt(unit.defensive.wound);
    const mvpScore = C*50 + D*25 + U*10;
    return mvpScore;
  }  

  async updateAllScore () {
    logger.debug("[UPDATE ALL SCORE]");
    let unitScoreList =  await UnitScore.model.find();
    unitScoreList.forEach(async unitScore => {
      const score = this.calculateUnitMVP(unitScore);
      const objName = {};
      objName['updateAt'] = new Date;
      objName['score'] = score;
      await UnitScore.model.updateOne({ _id: unitScore._id, },
        { $set: objName, $inc: { __v: 1 } });
    });
  }

  async saveScore(matchScoreOption) {
    logger.debug(matchScoreOption, "[INIT_SAVE_SCORE]");
    let currentScore =  await UnitScore.model.findById(matchScoreOption.id);
    const score = this.calculateUnitMVP(currentScore);
    const setModel = {};
    setModel[`${matchScoreOption.type}`] = {};
    setModel[`${matchScoreOption.type}`][`${matchScoreOption.subType}`] = matchScoreOption.value;
    const objName = {};
    objName[`${matchScoreOption.type}.${matchScoreOption.subType}`] = matchScoreOption.value;
    objName['updateAt'] = new Date;
    objName['score'] = score;
    let responseSvc = null;
    await UnitScore.model.updateOne({ _id: matchScoreOption.id, },
      { $set: objName, $inc: { __v: 1 } })
    .then((resp) => {
      logger.debug(resp, 'resp');
      responseSvc = resp;
    }).catch((err) => {
      logger.error(err);
      throw new Mth40Error(err.message, 424, 'UnitSvcError');
    });
    return responseSvc;
  }

  async save(unitScoreObj) {
    logger.debug(unitScoreObj, "[INIT_SAVE]");
    unitScoreObj.updateAt = new Date();
    let errorObj = null;
      await UnitScore.model.updateOne({ _id: unitScoreObj.id, },
          { $set: { ... unitScoreObj }, $inc: { __v: 1 } }, unitScoreObj).
          then(async (result) => {
              if (result.n === 0) {
                  logger.warn(result, 'No se ha encontrado el unitScore');
                  let unitScore = new UnitScore.model(unitScoreObj);      
                  await unitScore.save()
                    .then((unitScore) => {
                      logger.debug(unitScore, 'Guardado OK');
                    }).catch((err) => {
                    errorObj = new Mth40Error(err.message, 424, 'UnitScoreSvcError');
                  });
                  unitScoreObj.id = unitScore._id;
              }
          });
      if (!_.isEmpty(errorObj)){
        throw errorObj;
      }
      return unitScoreObj;
  }
}


const instance = new UnitScoreSvc();
Object.freeze(instance);
module.exports = instance;  