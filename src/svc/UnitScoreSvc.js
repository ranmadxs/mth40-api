const _ = require('lodash');
const logger = require('../../LogConfig');
const Mth40Error = require  ('../utils/Mth40Error');

const rosterSvc = require('./RosterSvc');
var Army = require ('../schemas/ArmySchema');

class UnitScoreSvc {
  constructor() {
    if(! UnitScoreSvc.instance) {
      UnitScoreSvc.instance = this;
      logger.debug("Unit Score SVC", "[SVC_INSTANCE]");
    }
    return UnitScoreSvc.instance;
  }

}


const instance = new UnitScoreSvc();
Object.freeze(instance);
module.exports = instance;  