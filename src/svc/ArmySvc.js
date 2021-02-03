var logger = require('../../LogConfig');
var Army = require ('../schemas/ArmySchema');
var async = require("async");

class ArmySvc {
  constructor() {
    if(! ArmySvc.instance) {
      ArmySvc.instance = this;
      logger.debug("Army SVC", "[SVC_INSTANCE]");
    }
    return ArmySvc.instance;     
  }
    
  async getArmy (name, projections = null) {
    let army = await Army.model.find({
      'name': name,
    }, projections);
    return army && army.length > 0?army[0]:null;  
  }


    async saveArmy (armyArray) {
        async.mapLimit(armyArray, 10, function(armyJson){
            Army.model.updateOne(
                {
                  'name': armyJson.name
                },
                {
                $set: {
                    factions: armyJson.factions
                  },
                $inc: { __v: 1 }
                },
            ).then((result) => {
                if (result.n === 0) {
                    logger.warn("Se esta ingresando un registro nuevo", armyJson.name);
                    var army = new Army.model({
                        name: armyJson.name,
                        factions: armyJson.factions
                    });
                    army.save(function (err) {if (err) logger.error (err, "Error Save Army")});
                } 
            })         
        });        
    }

    async listArmy () {
        return new Promise(async (resolve, reject)  => {
          const armies = await Army.model.find();
          resolve( armies );
        });
    }
};

const instance = new ArmySvc();
Object.freeze(instance);
module.exports = instance;
