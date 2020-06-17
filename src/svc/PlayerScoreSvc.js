const _ = require('lodash');
var logger = require('../../LogConfig');
var PlayerScore = require ('../schemas/PlayerScoreSchema');

class PlayerScoreSvc {
  constructor() {
    if(! PlayerScoreSvc.instance) {
      PlayerScoreSvc.instance = this;
      logger.debug("PlayerScoreSvc", "[SVC_INSTANCE]");
    }
    return PlayerScoreSvc.instance;
  }

  async save(rosterTournament, unitScore){
    logger.info(`rosterTournament=${rosterTournament._id}, unitScore=${unitScore._id}`, 'save PlayerScore');
    
  }
}



const instance = new PlayerScoreSvc();
Object.freeze(instance);
module.exports = instance;  