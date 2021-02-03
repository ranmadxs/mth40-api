const axios = require('axios');
const btoa = require('btoa');
const _ = require('lodash');
var redisFactory = require('../factories/RedisFactory');
var logger = require('../../LogConfig');
var mth40 = require ('../configs');
var challongeUtils = require ('../utils/ChallongeUtils');
var tournamentSvc = require('./TournamentSvc');

class ChallongeSvc {

    constructor() {
        if(! ChallongeSvc.instance) {
            this.CACHE = true;
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
            logger.debug("get matches from challonge API", tournamentId);
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
            logger.debug("get participant from API");
            var api_key = mth40.properties.challonge.api_key;
            var session_url = mth40.properties.challonge.base_url 
                + '/tournaments/'+tournamentId 
                + '.json?api_key='+api_key 
                + '&include_participants=' + include_participants
                + '&include_matches=' + include_matches;
            tournament = await axios.get(session_url)
                .then(response => {
                    const fullTournament = response.data.tournament;
                    let matches = fullTournament.matches;
                    let participants = fullTournament.participants;
                    var tournament = challongeUtils.formatTournament(fullTournament);
                    logger.debug(tournament, 'pre-tournament');
                    tournament.participants = participants;
                    let tournamentMatches = [];
                    let lastGroup = null;
                    let currentGroup = null;
                    let groupName = "A";
                    if( matches ) {
                        matches.forEach( ({match}) => {
                          logger.debug(match, 'match');
                            if ( match.state != 'pending'
                                && match.player1_id && match.player2_id) {
                                let player1 =participants.filter(({participant}) =>
                                    participant.id == match.player1_id || participant.group_player_ids.includes(match.player1_id));
                                let player2 =participants.filter(({participant}) =>
                                    participant.id == match.player2_id || participant.group_player_ids.includes(match.player2_id));
                                player1 = challongeUtils.formatParticipant(player1[0].participant);
                                player2 = challongeUtils.formatParticipant(player2[0].participant);
                                if(match.group_id != null && match.group_id > 1){
                                  match.group_name = groupName;
                                  currentGroup = match.group_id;
                                  if(lastGroup != currentGroup && lastGroup != null) {
                                    groupName = String.fromCharCode(groupName.charCodeAt(0) + 1);
                                  }
                                  lastGroup = currentGroup;
                                }
                                let matchTournament = challongeUtils
                                    .formatMatch(match, player1, player2);
                                tournamentMatches.push(matchTournament);
                            }
                        });
                        tournament.matches = tournamentMatches;
                        tournamentSvc.save(tournament);
                        logger.debug(tournament, 'post-tournament');    
                    }
                    return tournament;
            });
            await redisFactory.set(redisKey, JSON.stringify(tournament));
            redisFactory.expire(redisKey, mth40.properties.redis.ttl.challongeTournaments);
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
                    return challongeUtils.formatParticipant(response.data.participant);;
            });
            await redisFactory.set(redisKey, JSON.stringify(participant));
            redisFactory.expire(redisKey, mth40.properties.redis.ttl.challongeTournaments);
        }        
        return participant;
    }

    async listMatches(tournamentId) {
        var api_key = mth40.properties.challonge.api_key;
        var session_url = mth40.properties.challonge.base_url + '/tournaments/'+tournamentId+'/matches.json?api_key='+api_key;
        logger.debug(session_url, 'url');
        var matches = await axios.get(session_url)
        .then(async response => {
            var matches = [];
            for (let i = 0; i < response.data.length; i++){
                const fullMatch = response.data[i].match;
                const state = fullMatch.state;
                if ( state != 'pending' && fullMatch.player1_id && fullMatch.player2_id) {
                    const matchNumber = fullMatch.suggested_play_order;
                    console.log(fullMatch, 'fullMatch');
                    logger.debug(fullMatch.group_id, 'fullMatch.group_id');
                    if(fullMatch.group_id) {
                      matches.push(fullMatch);
                    } else{
                      console.log("XDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD");
                      const player1 = await this.getParticipant(tournamentId, fullMatch.player1_id);
                      const player2 = await this.getParticipant(tournamentId, fullMatch.player2_id);
                      matches.push(challongeUtils.formatMatch(fullMatch, player1, player2));
                    }
                }
            }
            return (matches);
        }).catch(error => {
            logger.error(error);
        });

        return matches;
    }

    async tournaments() {
        var listTournaments = [];
        
        let existsCache = await redisFactory.exists("tournaments");
        if(this.CACHE && existsCache){      
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
                var tournament = challongeUtils.formatTournament(fullTournament);
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