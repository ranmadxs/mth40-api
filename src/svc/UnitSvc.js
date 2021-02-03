const _ = require('lodash');
const logger = require('../../LogConfig');
const Mth40Error = require  ('../utils/Mth40Error');
const rosterSvc = require('./RosterSvc');
const factionSvc = require('./FactionSvc');
var Roster = require ('../schemas/RosterSchema');
var RosterUnitExtended = require ('../schemas/RosterUnitExtended');

class UnitSvc {
  constructor() {
    if(! UnitSvc.instance) {
      UnitSvc.instance = this;
      logger.debug("Unit SVC", "[SVC_INSTANCE]");
    }
    return UnitSvc.instance;
  }

  async saveAlias(rosterUnitExtended) {
    rosterUnitExtended.updateAt = new Date();
    await RosterUnitExtended.model.updateOne({ 
        'unitId': rosterUnitExtended.unitId
    }, { $set: { alias: rosterUnitExtended.alias }, $inc: { __v: 1 } },
    rosterUnitExtended).then(async (result) => {
      if (result.n === 0) {
        let rosterUnitExtendedNew = new RosterUnitExtended.model(rosterUnitExtended);
        await rosterUnitExtendedNew.save(function (err) {
          if (err) logger.error (err, "Error Save rosterUnitExtended")
        });
      }
    });
    return rosterUnitExtended;   
  }

  async findRosterUnit(rosterId, unitId) {
    let unitRoster = null;
    await Roster.model.aggregate([
      { "$unwind": "$forces" },
      { "$unwind": "$forces.units" },
      { "$match": {
        'forces.units.id': unitId,
        _id: rosterId,
      }},
      { "$project": {
        _id: 0,
        "unitId": "$forces.units.id",
        "name": "$forces.units.name",
        "url": "$forces.units.suggestion.url",
        "mainCategory": "$forces.units.categories.main",
    }},
    ]).then((unit) => {
      unitRoster = unit;
    }).catch((err) => {
      logger.error(err);
      throw new Mth40Error(err.message, 424, 'UnitSvcError');      
    });
    if (unitRoster && unitRoster.length > 0 ) {
      const extRostUnit = await this.findAlias(unitRoster[0].unitId);
      if(!_.isEmpty(extRostUnit)) {
        unitRoster[0].alias = extRostUnit.alias;
      }
    }
    return unitRoster && unitRoster.length > 0?unitRoster[0]:null;
  }

  async findAlias (unitId) {
    logger.debug("findAlias=" + unitId);
    const findCond = { "unitId": unitId };
    const queryObj = await RosterUnitExtended.model.findOne(findCond);
    return queryObj;
  }

  async updateUnits(roster) {
    logger.info('update units rosterId = ', roster.id);        
    //const roster = await rosterSvc.getRoster(rosterId);
    for (let i = 0; i < roster.forces.length; i++) {
      const force = roster.forces[i];
      logger.debug(force, 'force');
      if(force.units && force.units.length > 0 ){
        const rosterUnits = force.units;
        var armyUnits = rosterUnits.map((unit) => ({
            name: unit.name,
            type: unit.type,
            mainCategory: unit.categories.main,
          })
        );
        if(_.isEmpty(force.suggestion)) {
          throw new Mth40Error(
            `No se encuentra el force.suggestion.army.faction en roster ${roster._id}`, 
            424, 'MatchScoreError');
        }
        //logger.debug(force.suggestion, 'force.suggestion');
        const rosterArmy = force.suggestion.army;
        const armyFaction = await factionSvc.find(rosterArmy.faction.name);
        const factionUnits = armyFaction.factions[0].units?armyFaction.factions[0].units:[];
        if(armyUnits && armyUnits.length > 0) {
          let isUp = false;
          armyUnits.forEach(aUnit => {
            if (!(factionUnits.filter(fUnit => fUnit.name == aUnit.name).length > 0)) {
              logger.warn('No existe la unidad', aUnit.name);
              factionUnits.push(aUnit);
              isUp = true;
            }
          });
          armyFaction.factions[0].units = factionUnits;
          if(isUp) {
            factionSvc.updateFactionUnits(rosterArmy.id, rosterArmy.faction.name, factionUnits);
          }
        }        
        //logger.info(armyFaction.factions, 'armyFaction');
      }
    }
    
  }  
}


const instance = new UnitSvc();
Object.freeze(instance);
module.exports = instance;  