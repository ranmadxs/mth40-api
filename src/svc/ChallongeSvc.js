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

    
    async participants(cache = true, tournamentId){
        var listParticipants = [];
        const redisKey = "participants_"+tournamentId;
        let existsCache = await redisFactory.exists(redisKey);
        if(cache && existsCache){      
            logger.debug("get participants from cache", tournamentId);     
            const valueRedis = await redisFactory.get(redisKey);
            redisFactory.expire(redisKey, mth40.properties.redis.ttl.challongeTournaments);
            listParticipants = JSON.parse(valueRedis);
        }
        else {
            logger.debug("get participants from challonge API", tournamentId);
            listParticipants = await this.listParticipants(tournamentId);
            await redisFactory.set(redisKey, JSON.stringify(listParticipants));
            redisFactory.expire("participants", mth40.properties.redis.ttl.challongeTournaments);
        }        
        return listParticipants;
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

    async listParticipants(tournamentId) {
        var api_key = mth40.properties.challonge.api_key;
        var session_url = mth40.properties.challonge.base_url + '/tournaments/'+tournamentId+'/participants.json?api_key='+api_key;
        var participants = axios.get(session_url)
        .then(response => {
            var participants = [];
            response.data.forEach(element => {
                var fullParticipant = element.participant;
                var participant = {
                    id: fullParticipant.id,
                    name: fullParticipant.name,
                    tournament_id: fullParticipant.tournament_id,
                    created_at: fullParticipant.created_at,
                    seed: fullParticipant.seed,
                    attached_participatable_portrait_url: fullParticipant.attached_participatable_portrait_url
                };
                participants.push(participant); 

            }); 
            return (participants);
        }).catch(error => {
            logger.error(error);
            reject(error);
        });

        return participants;
    }

    async listTournaments() {
        
        var api_key = mth40.properties.challonge.api_key;
        var session_url = mth40.properties.challonge.base_url + '/tournaments.json?api_key='+api_key;
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

