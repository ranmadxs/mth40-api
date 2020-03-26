const axios = require('axios');
const btoa = require('btoa');

class ChallongeSvc {
    constructor() {
        if(! ChallongeSvc.instance) {
            this.ID = null;
            this.NAME = null;
            this.CODE = null;
            ChallongeSvc.instance = this;
        }
        return ChallongeSvc.instance;     
    }

    listTournaments() {
        
        var api_key = 'blFKNnvFaySPiWbTKkCUSdoxvf0WieaMrcWsMztX';
        var session_url = 'https://api.challonge.com/v1/tournaments.json?api_key='+api_key;

        return new Promise(function (resolve, reject) {
            console.log("new promise");
            axios.get(session_url)
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
                    resolve(tournaments);
                }).catch(error => {
                    console.log(error);
                    reject(error);
                });
        });
    }
};

const instance = new ChallongeSvc();
Object.freeze(instance);
module.exports = instance;

