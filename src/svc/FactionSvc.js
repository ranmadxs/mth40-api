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

    listFactions () {
        return {'XD': true};
    }
};

const instance = new FactionSvc();
Object.freeze(instance);
module.exports = instance;
