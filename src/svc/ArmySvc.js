
class ArmySvc {
    constructor() {
        if(! ArmySvc.instance) {
            this.ID = null;
            this.NAME = null;
            this.CODE = null;
            ArmySvc.instance = this;
        }
        return ArmySvc.instance;     
    }

    listArmy () {
        return {'XD': true};
    }
};

const instance = new ArmySvc();
Object.freeze(instance);
module.exports = instance;
