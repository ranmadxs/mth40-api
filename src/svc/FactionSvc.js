var logger = require('../../LogConfig');
var Army = require ('../schemas/ArmySchema');
var mth40 = require ('../configs');

class FactionSvc {
    constructor() {
        //super("FactionSvc");
        if(! FactionSvc.instance) {
            FactionSvc.instance = this;
            logger.debug("Faction SVC", "[SVC_INSTANCE]");
        }
        this.wahapediaFactionUrl = mth40.properties.wahapedia.base_url + "/" + mth40.properties.wahapedia.edition + "/factions";
        return FactionSvc.instance;     
    }

    async findRosterFaction (factions) {
        let factionsRet = [];
        let subFactionObj = {};
        await Promise.all( factions.map (async (faction) => {
            const arrayArmy = faction.catalogueName.split('-');
            const army = arrayArmy[0].trim();
            const factionName = arrayArmy[1].trim();
            const suggestionsLvl1 = await this.find(factionName);
            if(suggestionsLvl1 && suggestionsLvl1._id){
                const armyId = suggestionsLvl1._id;
                const factionName = suggestionsLvl1.factions[0].name;
                const subFactionName = faction.subFaction;
                if(subFactionName){
                    logger.debug(subFactionName, "[SubFaction]");
                    let armySubFact = await this.findSubFaction(subFactionName);
                    //logger.info(armySubFact, "[SubFaction]");
                    if(armySubFact.length > 0){
                        logger.debug(armySubFact[0].factions, "[READY]");
                        subFactionObj = armySubFact[0].factions.subFactions;
                    }else {
                        logger.warn("No tiene subfaction", subFactionName);
                        this.addSubFaction(armyId, factionName, subFactionName);
                        subFactionObj["name"] = subFactionName;
                    }
                }

                const factionUrl = this.wahapediaFactionUrl + "/" + factionName.replace(/\s+/g, '-').toLowerCase();

                faction['suggestion'] = {
                    army: {
                        id: armyId,
                        name: suggestionsLvl1.name,
                        faction: {
                            name: factionName,
                            url: factionUrl,
                            subFaction: subFactionObj
                        }
                    },
                }
                const factionAux = suggestionsLvl1.factions[0];
                factionsRet.push(faction);
            }
        }));
        logger.warn(factionsRet);
        return factions;        
    }

    async addSubFaction(armyId, factionName, subFactionName) {   
        const res = await Army.model.updateOne(
            { 'factions.name':factionName },
            {
              $addToSet: {
                "factions.$.subFactions": {
                     "name": subFactionName
                }
              }
            }
         );
        logger.info (res);
        logger.info("> Add SubFaction = " + subFactionName, "[OK]");      
    }

    async findSubFaction (subFactionName) {
        logger.debug("find=" + subFactionName);
        let armyRet = {};
        const matchQuery = {
            'factions.subFactions.name': { $eq: subFactionName },
        };
        const queryObj = Army.model.aggregate([
            // First Stage
            { $unwind: "$factions" },

            // Second Stage
            { $unwind: { path: "$factions.subFactions" } },
            
            // Third Stage
            { $match: matchQuery },
          ]);

          let promiseQuery = new Promise( async (resolve, reject) => {
            queryObj.exec((err, army) => {
                if (err) reject(err);
                resolve( army );
            });
          });

          await promiseQuery.then((army) => {
              armyRet = army;
          });

          return armyRet;

    }

  async updateFactionUnits (armyId, factionName, units) {
    const updateCond = { 
      '_id': armyId,
      "factions.name": factionName 
    };
    await Army.model.update(
      updateCond, {'$set': {
        'factions.$.units': units
    }});
  }

  scpecialFactions(factionName) {
    let ret = factionName;
    const spaceMarinesFaction = "Adeptus Astartes";
    switch (factionName) {
      case "Blood Angels": 
      case "Space Wolves":
      case "Dark Angels":
        ret = spaceMarinesFaction;
      break;
      
      default: ret = factionName
    }
   return ret;
  }

  async find (factionNameIn) {
    const factionName = this.scpecialFactions(factionNameIn);
    logger.debug("find=" + factionName);
    const findCond = { "factions.name": factionName };
    const findFilter = { name: 1, factions: { $elemMatch: { name: {$eq :factionName} } } };
    const queryObj = await Army.model.findOne(findCond, findFilter);
    return queryObj;
  }
};

const instance = new FactionSvc();
Object.freeze(instance);
module.exports = instance;
