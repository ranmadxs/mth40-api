var mysql = require('mysql');
var logger = require('../../LogConfig');

class ConnectionFactory {
    constructor(){
        var host = this.host = "u0zbt18wwjva9e0v.cbetxkdyhwsb.us-east-1.rds.amazonaws.com";
        this.user = "fgwr0eqvwtaijamb";
        this.password = "tsp0gaybdzyuaeuv";
        this.database = "m7vety412v628e4l";
        this.con = mysql.createConnection({
            host: this.host,
            user: this.user,
            password: this.password,
            database: this.database
        });
        this.con.connect(function(err) {
            if (err) throw err;
            logger.debug("Connected [OK] to: " + host, "AbstractDB");
        }); 
    }

    getConnection(){
        return this.con;
    }
}

//module.exports = AbstractDB;

const instance = new ConnectionFactory();
Object.freeze(instance);
module.exports = instance;