var conFactory = require('../factories/ConnectionFactory');
var logger = require('../../LogConfig');

class ArmySvc {
    constructor() {
        if(! ArmySvc.instance) {
            ArmySvc.instance = this;
        }
        return ArmySvc.instance;     
    }

    listArmy () {
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
    }
};

const instance = new ArmySvc();
Object.freeze(instance);
module.exports = instance;
