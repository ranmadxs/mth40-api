const _ = require('lodash');
const logger = require('../../LogConfig');
const Mth40Error = require  ('../utils/Mth40Error');
const UnitScore = require ('../schemas/UnitScoreSchema');
const unitSvc = require('./UnitSvc');

class UnitScoreSvc {
  constructor() {
    if(! UnitScoreSvc.instance) {
      UnitScoreSvc.instance = this;
      logger.debug("Unit Score SVC", "[SVC_INSTANCE]");
    }
    return UnitScoreSvc.instance;
  }

  async listFull(rosterTournamentId, matchScoreId) {
    let retList = [];
    let listUScores = await this.list(rosterTournamentId, matchScoreId);
    for(let i = 0; i < listUScores.length; i++){
      let unitScore = listUScores[i];
      let unitRoster = await unitSvc.findRosterUnit(unitScore.unitId);
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

  async saveOption(matchScoreOption) {
    logger.debug(matchScoreOption, "[INIT_SAVE]");
    const setModel = {};
    setModel[`${matchScoreOption.type}`] = {};
    setModel[`${matchScoreOption.type}`][`${matchScoreOption.subType}`] = matchScoreOption.value;
    const objName = {};
    objName[`${matchScoreOption.type}.${matchScoreOption.subType}`] = matchScoreOption.value;
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