const axios = require('axios');
const btoa = require('btoa');

class ArmyFactions {
    constructor() {
        if(! ArmyFactions.instance) {
            this.ID = null;
            this.NAME = null;
            this.CODE = null;
            ArmyFactions.instance = this;
        }
        return ArmyFactions.instance;     
    }

    getListArmyFactions() {
        console.log("XDDDDDDD", "getListArmyFactions");
        
        var api_key = 'blFKNnvFaySPiWbTKkCUSdoxvf0WieaMrcWsMztX';
        var session_url = 'https://api.challonge.com/v1/tournaments.json?api_key='+api_key;

        axios.get(session_url)
            .then(response => {
                console.log(response.data);
            }).catch(error => {
                console.log(error);
            });
    }
};

const instance = new ArmyFactions();
Object.freeze(instance);
module.exports = instance;

