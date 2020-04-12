const axios = require('axios');
const btoa = require('btoa');
var redisFactory = require('../factories/RedisFactory');
var logger = require('../../LogConfig');
var mth40 = require ('../configs');

class ChallongeSvc {

    constructor() {
        if(! ChallongeSvc.instance) {
            this.ID = null;
            this.NAME = null;
            this.CODE = null;
            ChallongeSvc.instance = this;
            logger.debug("Challonge SVC", "[SVC_INSTANCE]");
        }
        return ChallongeSvc.instance;     
    }

    async tournaments(cache = true) {
        var listTournaments = [];
        
        let existsCache = await redisFactory.exists("tournaments");
        if(cache && existsCache){      
            logger.debug("get tournaments from cache");     
            const valueRedis = await redisFactory.get("tournaments");
            redisFactory.expire("tournaments", mth40.properties.redis.ttl.challongeTournaments);
            listTournaments = JSON.parse(valueRedis);
        }
        else {
            logger.debug("get tournaments from challonge API");
            listTournaments = await this.listTournaments();
            await redisFactory.set("tournaments", JSON.stringify(listTournaments));
            redisFactory.expire("tournaments", mth40.properties.redis.ttl.challongeTournaments);
        }        
        return listTournaments;
    }

    async listTournaments() {
        
        var api_key = 'blFKNnvFaySPiWbTKkCUSdoxvf0WieaMrcWsMztX';
        var session_url = 'https://api.challonge.com/v1/tournaments.json?api_key='+api_key;
        var tournaments = axios.get(session_url)
        .then(response => {
            var tournaments = [];
            response.data.forEach(element => {
                var fullTournament = element.tournament;
                var tournament = {
                    id: fullTournament.id,
                    name: fullTournament.name,
                    url: fullTournament.full_challonge_url,
                    tournament_type: fullTournament.tournament_type,
                    game_name: fullTournament.game_name,
                    state: fullTournament.state,
                    event_id: fullTournament.event_id,
                    started_at: fullTournament.started_at,
                    completed_at: fullTournament.completed_at,
                };
                tournaments.push(tournament); 

            }); 
            return (tournaments);
        }).catch(error => {
            logger.error(error);
            reject(error);
        });

        return tournaments;
    }
};

const instance = new ChallongeSvc();
Object.freeze(instance);
module.exports = instance;

