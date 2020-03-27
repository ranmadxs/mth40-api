var conFactory = require('./ConnectionFactory')

class FactionSvc {
    constructor() {
        //super("FactionSvc");
        if(! FactionSvc.instance) {
            FactionSvc.instance = this;
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
