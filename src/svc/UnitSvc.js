var logger = require('../../LogConfig');
var Army = require ('../schemas/ArmySchema');
var mth40 = require ('../configs');

class UnitSvc {
    constructor() {
        //super("FactionSvc");
        if(! UnitSvc.instance) {
            UnitSvc.instance = this;
            logger.debug("UnitSvc SVC", "[SVC_INSTANCE]");
        }
        return UnitSvc.instance;     
    }

    transformName(name, key){
        const cleanName = name.replace(/\s/g, key);        
        return cleanName;
    }

    findUnits(faction) {
        logger.info(faction.suggestion.army.faction.url);
        faction.units.forEach(unit => {
            unit['suggestion'] = {
                'url' : faction.suggestion.army.faction.url + "/" + this.transformName(unit.name, "-")
            }            
        });
        return faction;
    }
};

const instance = new UnitSvc();
Object.freeze(instance);
module.exports = instance;