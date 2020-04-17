var conFactory = require('../factories/MySQLConnectionFactory')
var logger = require('../../LogConfig');
var Army = require ('../schemas/ArmySchema');
var mth40 = require ('../configs');

class FactionSvc {
    constructor() {
        //super("FactionSvc");
        if(! FactionSvc.instance) {
            FactionSvc.instance = this;
            logger.debug("Faction SVC", "[SVC_INSTANCE]");
        }
        return FactionSvc.instance;     
    }

    async findRosterFaction (factions) {
        let factionsRet = [];
        await Promise.all( factions.map (async (faction) => {
            //logger.info(faction);
            const arrayArmy = faction.catalogueName.split('-');
            const army = arrayArmy[0].trim();
            const factionName = arrayArmy[1].trim();
            const suggestionsLvl1 = await this.find(factionName);
            faction['suggestion'] = {
                army: {
                    id: suggestionsLvl1._id,
                    name: suggestionsLvl1.name
                },
                id: suggestionsLvl1.factions[0]._id,
                name: suggestionsLvl1.factions[0].name,
                url: mth40.properties.wahapedia.base_url + suggestionsLvl1.factions[0].url
            }
            factionsRet.push(faction);
        }));
        logger.warn(factionsRet);
        return factions;
        
    }

    async find (factionName) {
        logger.debug("find=" + factionName);
        const findCond = { "factions.name": factionName };
        const findFilter = { name: 1, factions: { $elemMatch: { name: {$eq :factionName} } } };
        const queryObj = await Army.model.findOne(findCond, findFilter);
        return queryObj;
    }
};

const instance = new FactionSvc();
Object.freeze(instance);
module.exports = instance;
