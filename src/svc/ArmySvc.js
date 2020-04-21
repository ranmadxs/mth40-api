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
                },
            ).then((result) => {
                if (result.nModified === 0) {
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

    listArmy () {
        return new Promise(function (resolve, reject) {
            resolve( {resp: true});
        });
        /*
        return new Promise(function (resolve, reject) {
            conFactory.getConnection().query("SELECT * FROM `ARMY`", function (err, result, fields) {
                if (err) throw err;
                resolve(result.map(({
                    ID, NAME, CODE
                  }) => ({
                    id : ID,
                    name: NAME,
                    code: CODE
                })));
                //logger.debug(fields);
            });            
        });
        */
    }
};

const instance = new ArmySvc();
Object.freeze(instance);
module.exports = instance;
