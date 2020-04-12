var mysql = require('mysql');
var logger = require('../../LogConfig');
var mth40 = require ('../configs');

class MySQLConnectionFactory {
    constructor(){
        //var host = this.host = "u0zbt18wwjva9e0v.cbetxkdyhwsb.us-east-1.rds.amazonaws.com";
        var host = this.host = mth40.properties.database.mysql.host;
        this.user = mth40.properties.database.mysql.user;
        this.password = mth40.properties.database.mysql.password;
        this.database = mth40.properties.database.mysql.db_instance;
        logger.debug("MySQLConnection Factory", "[DB_INIT]");
        //this.user = "fgwr0eqvwtaijamb";
        //this.password = "tsp0gaybdzyuaeuv";
        //this.database = "m7vety412v628e4l";
        this.con = mysql.createConnection({
            host: this.host,
            user: this.user,
            password: this.password,
            database: this.database
        });
        this.con.connect(function(err) {
            if (err) throw err;
            logger.info("MySQL Database Connected [OK] to: " + host);
        }); 
    }

    getConnection(){
        return this.con;
    }
}

//module.exports = AbstractDB;

const instance = new MySQLConnectionFactory();
Object.freeze(instance);
module.exports = instance;