var mysql = require('mysql');
var logger = require('../../LogConfig');
var mth40 = require ('../configs');

class MySQLConnectionFactory {
/*
    var mysql = require('mysql');
    var pool  = mysql.createPool({
      connectionLimit : 10,
      host            : 'example.org',
      user            : 'bob',
      password        : 'secret'
    });

    pool.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
      if (err) throw err;

      console.log('The solution is: ', rows[0].solution);
    });

exports.Pool = pool;
*/
    constructor(){        
        //var host = this.host = "u0zbt18wwjva9e0v.cbetxkdyhwsb.us-east-1.rds.amazonaws.com";
        this.host = mth40.properties.database.mysql.host;
        this.user = mth40.properties.database.mysql.user;
        this.password = mth40.properties.database.mysql.password;
        this.database = mth40.properties.database.mysql.db_instance;
        this.con = null;
        logger.debug("MySQLConnection Factory", "[DB_INIT]");
        //this.user = "fgwr0eqvwtaijamb";
        //this.password = "tsp0gaybdzyuaeuv";
        //this.database = "m7vety412v628e4l";

    }

    async connect(){ 
        const hostConn = this.host;    
        return new Promise((resolve, reject) => {        
            this.con = mysql.createConnection({
                host: this.host,
                user: this.user,
                password: this.password,
                database: this.database
            });
                  
                this.con.connect(function(err) {
                if (err) {
                    logger.error (err);
                    reject(err);
                }
                resolve({mysql: true});
                logger.info("MySQL Database Connected [OK] to: " + hostConn);
            }); 
        });
    }

    getConnection(){
        return this.con;
    }

    async disconnect() {
        logger.info("MySQL [OFF]");
        this.con.end();
    }
}

//module.exports = AbstractDB;

const instance = new MySQLConnectionFactory();
//Object.freeze(instance);
module.exports = instance;