const _ = require('lodash');
const logger = require('../../LogConfig');
const Mth40Error = require  ('../utils/Mth40Error');
const rosterSvc = require('./RosterSvc');
const factionSvc = require('./FactionSvc');

class UnitSvc {
  constructor() {
    if(! UnitSvc.instance) {
      UnitSvc.instance = this;
      logger.debug("Unit SVC", "[SVC_INSTANCE]");
    }
    return UnitSvc.instance;
  }

  async updateUnits(rosterId) {
    logger.info('update units rosterId = ', rosterId);    
    const roster = await rosterSvc.getRoster(rosterId, 'conferenceName forces');
    //const roster = await rosterSvc.getRoster(rosterId);
    for (let i = 0; i < roster.forces.length; i++) {
      const force = roster.forces[i];
      //logger.debug(force, 'force');
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
        logger.debug(force.suggestion, 'force.suggestion');
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
        logger.info(armyFaction.factions, 'armyFaction');
      }
    }
    
    //logger.debug(faction, 'faction');
  }  
}


const instance = new UnitSvc();
Object.freeze(instance);
module.exports = instance;  