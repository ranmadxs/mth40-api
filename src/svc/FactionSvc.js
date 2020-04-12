var conFactory = require('../factories/MySQLConnectionFactory')
var logger = require('../../LogConfig');

class FactionSvc {
    constructor() {
        //super("FactionSvc");
        if(! FactionSvc.instance) {
            FactionSvc.instance = this;
            logger.debug("Faction SVC", "[SVC_INSTANCE]");
        }
        return FactionSvc.instance;     
    }

    find (factionName) {
        const findCond = { "factions.name": factionName };
        const queryObj = Service.find(findCond);
        queryObj.exec((err, objValue) => {
            if (err) logger.error(err);
            return objValue;
        });
    }
};

const instance = new FactionSvc();
Object.freeze(instance);
module.exports = instance;
