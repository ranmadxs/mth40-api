const _ = require ('lodash');
const rp = require('request-promise');
const cheerio = require('cheerio');
var convert = require('xml-js');
var logger = require('../../LogConfig');
var mth40 = require ('../configs');
var redisFactory = require('../factories/RedisFactory');
let armySvc = require ('../svc/ArmySvc');
const Mth40Error = require  ('../utils/Mth40Error');

String.prototype.hexDecode = function(){
  return this.replace('&#x2019;', "'");
}

class WahapediaSvc {

  constructor() {
    if(! WahapediaSvc.instance) {
      this.armies_url = mth40.properties.wahapedia.base_url + mth40.properties.wahapedia.armies_url;
      WahapediaSvc.instance = this;
      this.cache = false;      
      logger.debug("Wahapedia SVC", "[SVC_INSTANCE]");
    }
    return WahapediaSvc.instance;     
  }

    async getSubFactions(url) {
      logger.debug("*************************************=====***************");
      const folderHTML = appRoot + "/../../test/resources/html/";
      const fileHTML = folderHTML + "example.html";

      //fs.readFile( fileHTML, async (err, data) => {      
      rp(url).then(function(html){
        //logger.debug(html);    
        /*  

        logger.info("Save HTML to: " + fileHTML);        
        fs.writeFile(fileHTML, html, function (err,data) {
            if (err) {
              return logger.error(err);
            }
            logger.info("Create file [OK]");
        });    
        */    
        //const html = data.toString(); 
        //logger.debug(html);
        const $ = cheerio.load(html);
        //const selector = $('.NavDropdown-content_P').html();
        const selector = $('select').html();
        logger.debug("================= SELECTOR IS COMMING ============== ");
        logger.debug(selector);
      });
    }

  async parseWahapediaUnit (url) {
    let unitInfo;
    let retUnit = {};
    await rp(url).then( async (html) => {
      const $ = cheerio.load(html);        
      const table = $('table').html();
      unitInfo = convert.xml2json(table, {compact: true});      
      if (unitInfo.includes("tbody")){ 
        unitInfo = JSON.parse(unitInfo);        
        if (!_.isEmpty(unitInfo.tbody) && !_.isEmpty(unitInfo.tbody.tr)) {
          //retUnit = unitInfo.tbody.tr[0];
          logger.info(unitInfo.tbody.tr[0]);
          logger.info(unitInfo.tbody.tr[2]);
          let idx = 0;
          unitInfo.tbody.tr[0].td.forEach(td => {           
            let nameTd = td._text?td._text:td.span[0]._text;
            let tdVsal = unitInfo.tbody.tr[2].td[idx]._text?unitInfo.tbody.tr[2].td[idx]._text:unitInfo.tbody.tr[2].td[idx].span._text;
            retUnit[nameTd] = tdVsal;
            idx++;
          });
        } else {
          logger.info(unitInfo.tbody);
          throw new Mth40Error('No se encuentra UnitInfo', 424, 'WahapediaSvc');
        }
      } else {
        throw new Mth40Error('No se encuentra Tbody en UnitInfo', 424, 'WahapediaSvc');
      }
    });
    return retUnit;
  }

  async getUnit(edition, faction, unit) {
    if (_.isEmpty(unit)) {
      throw new Mth40Error('Unit requerido', 424, 'WahapediaSvc');
    }
    if (_.isEmpty(faction)) {
      throw new Mth40Error('Faction requerido', 424, 'WahapediaSvc');
    }

    const redisKey = "wahapedia_"+edition+"_"+faction+"_"+unit;
    let unitInfo;
    let existsCache = await redisFactory.exists(redisKey);
    if(this.cache && existsCache) {
      logger.debug("Get Unit from info from cache");
      redisFactory.expire(redisKey, mth40.properties.redis.ttl.wahapedia);
      const valueRedis = await redisFactory.get(redisKey);
      unitInfo = JSON.parse(valueRedis);
    } else {
      logger.debug("Get Unit from info from Wahapedia");
      redisFactory.expire(redisKey, mth40.properties.redis.ttl.wahapedia);
      //const url = 'http://wahapedia.ru/wh40k9ed/factions/adepta-sororitas/Celestine';
      let url = `${mth40.properties.wahapedia.base_url}/${edition}/factions/${faction}/${unit}`;    
      logger.info(url, 'url');
      unitInfo = await this.parseWahapediaUnit(url);
      await redisFactory.set(redisKey, JSON.stringify(unitInfo));
    }
    logger.info(unitInfo);
    return unitInfo;
  }

    async getFactions(){
      const baseUrl = mth40.properties.wahapedia.base_url;
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
              url: baseUrl + $(element).attr('href')
            }
            armie["factions"].push(faction);
            logger.debug("  > " + faction.name);
            logger.debug("     " + faction.url);
            if (faction.name == 'Space Marines'){
              const factionAstartes = {
                name: 'Adeptus Astartes',
                url: faction.url,
              }
              armie["factions"].push(factionAstartes);
              logger.debug("  > " + factionAstartes.name);
              logger.debug("     " + factionAstartes.url);              
            }
            
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
