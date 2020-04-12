var conFactory = require('../factories/MySQLConnectionFactory')
var logger = require('../../LogConfig');
var Army = require ('../schemas/ArmySchema');

class FactionSvc {
    constructor() {
        //super("FactionSvc");
        if(! FactionSvc.instance) {
            FactionSvc.instance = this;
            logger.debug("Faction SVC", "[SVC_INSTANCE]");
        }
        return FactionSvc.instance;     
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
