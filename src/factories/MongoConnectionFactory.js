var mongoose = require ("mongoose");
var logger = require('../../LogConfig');
var mth40 = require ('../configs');

class MongoConnectionFactory {
    constructor(){
        this.url = mth40.config.MONGO_URL;
        logger.debug("MongoDB Factory", "[DB_INIT]");
    }

    async connect() {
        const uristring = this.url;
        return new Promise(function (resolve, reject) {
            mongoose.set('debug', mth40.properties.database.mongodb.debug);
            mongoose.set('useFindAndModify', false);
            mongoose.connect(uristring, { useNewUrlParser: true , useUnifiedTopology: true}, function (err, res) {
                if (err) {
                    logger.info ('MongoDB ERROR connecting to: ' + uristring + '. ' + err);
                    reject({mongodb: false});
                } else {
                    logger.info ('MongoDB [ON] Succeeded connected to: ' + uristring);
                    resolve({mongodb: true});
                    
                }
          });          
        });
    }

    async disconnect() {
        logger.info("MongoDB [OFF]");
        mongoose.disconnect();
    }
}

const instance = new MongoConnectionFactory();
Object.freeze(instance);
module.exports = instance;