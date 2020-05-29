const axios = require('axios');
const btoa = require('btoa');
var redisFactory = require('../factories/RedisFactory');
var logger = require('../../LogConfig');
var mth40 = require ('../configs');
var challongeUtils = require ('../utils/ChallongeUtils');

class ChallongeSvc {

    constructor() {
        if(! ChallongeSvc.instance) {
            this.CACHE = false;
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

    async matches(tournamentId){
        var listMatches = [];
        const redisKey = "matches_tid="+tournamentId;
        let existsCache = await redisFactory.exists(redisKey);
        if(this.CACHE && existsCache){
            logger.debug("get matches from cache");     
            const valueRedis = await redisFactory.get(redisKey);
            redisFactory.expire(redisKey, mth40.properties.redis.ttl.challongeTournaments);
            listMatches = JSON.parse(valueRedis);
        } else {
            logger.debug("get participants from challonge API", tournamentId);
            listMatches = await this.listMatches(tournamentId);
            await redisFactory.set(redisKey, JSON.stringify(listMatches));
            redisFactory.expire(redisKey, mth40.properties.redis.ttl.challongeTournaments);
        }
        return listMatches;
    }

    async getTournament(tournamentId, include_participants = 0, include_matches = 0){
        const redisKey = `getTournament_id=${tournamentId}`;
        let existsCache = await redisFactory.exists(redisKey);
        let tournament = null;
        if (this.CACHE && existsCache) {
            logger.debug("get participant from cache");
            const valueRedis = await redisFactory.get(redisKey);
            redisFactory.expire(redisKey, mth40.properties.redis.ttl.challongeTournaments);
            tournament = JSON.parse(valueRedis);
        } else{
            var api_key = mth40.properties.challonge.api_key;
            var session_url = mth40.properties.challonge.base_url 
                + '/tournaments/'+tournamentId 
                + '.json?api_key='+api_key 
                + '&include_participants=' + include_participants
                + '&include_matches=' + include_matches;
            tournament = await axios.get(session_url)
                .then(response => {
                    const fullTournament = response.data.tournament;
                    /*
                    let matches = [];
                    fullTournament.matches.forEach(match => {
                        const state = match.state;

                        if()
                    });
                    */
                    let matches = fullTournament.matches;
                    let participants = fullTournament.participants;
                    var tournament = challongeUtils.formatTournamet(fullTournament);
//                    matches: matches,
//                    participants: participants,

                    console.log(tournament, 'tournament');
                    return tournament;
            });
        }
        return tournament;
    }

    async getParticipant(tournamentId, participantId) {
        const redisKey = "tournament_id="+tournamentId+",part_Id="+participantId;
        let existsCache = await redisFactory.exists(redisKey);
        let participant = null;
        if(this.CACHE && existsCache){
            logger.debug("get participant from cache");     
            const valueRedis = await redisFactory.get(redisKey);
            redisFactory.expire(redisKey, mth40.properties.redis.ttl.challongeTournaments);
            participant = JSON.parse(valueRedis);
        }
        else{
            var api_key = mth40.properties.challonge.api_key;
            var session_url = mth40.properties.challonge.base_url 
                + '/tournaments/'+tournamentId+'/participants/'+participantId+'.json?api_key='+api_key;
            participant = await axios.get(session_url)
                .then(response => {
                    //console.log(response.data.participant, 'participant');                    
                    var participant = {
                        id: response.data.participant.id,
                        name: response.data.participant.name,
                        seed: response.data.participant.seed,
                        created_at: response.data.participant.created_at,
                        final_rank: response.data.participant.final_rank,
                        tournament_id: response.data.participant.tournament_id,
                        
                    };                    
                    return participant;
            });
            await redisFactory.set(redisKey, JSON.stringify(participant));
            redisFactory.expire(redisKey, mth40.properties.redis.ttl.challongeTournaments);
        }        
        return participant;
    }

    async listMatches(tournamentId) {
        var api_key = mth40.properties.challonge.api_key;
        var session_url = mth40.properties.challonge.base_url + '/tournaments/'+tournamentId+'/matches.json?api_key='+api_key;
        var matches = await axios.get(session_url)
        .then(async response => {
            var matches = [];
            for (let i = 0; i < response.data.length; i++){
                const fullMatch = response.data[i].match;
                const state = fullMatch.state;
                if ( state != 'pending' && fullMatch.player1_id && fullMatch.player2_id) {
                    const matchNumber = fullMatch.suggested_play_order;
                    const player1 = await this.getParticipant(tournamentId, fullMatch.player1_id);
                    const player2 = await this.getParticipant(tournamentId, fullMatch.player2_id);
                    const matchName = matchNumber + ') ' + player1.name + " VS " + player2.name;
                    var match = {
                        id: fullMatch.id,
                        name: matchName,
                        state: state,
                        tournament: {
                            id: fullMatch.tournament_id
                        },
                        players: {
                            player1: player1,
                            player2: player2,
                        },
                        results: {
                            winner_id: fullMatch.winner_id,
                            loser_id: fullMatch.loser_id,
                            scores: fullMatch.scores_csv,
                        },
                        created_at: fullMatch.created_at,
                        round: fullMatch.round,
                        group_id: fullMatch.group_id,
                        matchNumber: fullMatch.suggested_play_order,
                        matchIdentifier: fullMatch.identifier,        
                    };
                    matches.push(match);
                }
            }
            return (matches);
        }).catch(error => {
            logger.error(error);
            reject(error);
        });

        return matches;
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
                var tournament = challongeUtils.formatTournamet(fullTournament);
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