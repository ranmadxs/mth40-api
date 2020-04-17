const rp = require('request-promise');
const cheerio = require('cheerio');
var logger = require('../../LogConfig');
var mth40 = require ('../configs');
var redisFactory = require('../factories/RedisFactory');
let armySvc = require ('../svc/ArmySvc');

String.prototype.hexDecode = function(){
  return this.replace('&#x2019;', "'");
}

class WahapediaSvc {

    constructor() {
        if(! WahapediaSvc.instance) {
            this.armies_url = mth40.properties.wahapedia.base_url + mth40.properties.wahapedia.armies_url;
            WahapediaSvc.instance = this;
            logger.debug("Wahapedia SVC", "[SVC_INSTANCE]");
        }
        return WahapediaSvc.instance;     
    }


    async getFactions(){
      rp(this.armies_url).then(function(html){
          const $ = cheerio.load(html);
          let arrayArmies = $('.NavDropdown-content .FactionHeader').toArray();
          let armies = [];          
          let armie = {
            factions : []
          };
          $('div[class="NavColumns"]').find('div a').each(function (index, element) {            
            if($(element).prev()[0].name == "div") {
              armie = {
                name: $($(element).prev()).html(),
                factions : []
              };              
              logger.debug("* " + armie.name);
            }
            let faction = {
              name: $(element).html().hexDecode(),
              url: $(element).attr('href')
            }
            armie["factions"].push(faction);
            logger.debug("  > " + faction.name);
            logger.debug("     " + faction.url);
            if($(element).next()[0].name == "div"){
              armies.push(armie);
            }
          });
          //logger.debug(armies);
          armySvc.saveArmy(armies);
        })
        .catch(function(err){          
          logger.error(err);
        });
    }
}

const instance = new WahapediaSvc();
Object.freeze(instance);
module.exports = instance;
