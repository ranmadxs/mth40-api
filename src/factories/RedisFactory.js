const redis = require("async-redis");
var logger = require('../../LogConfig');
var mth40 = require ('../configs');

class RedisFactory {

    constructor(){
        this.urlRedis = mth40.config.REDIS_URL;
        this.flushAll = mth40.properties.redis.flushAll || false;
        this.connected = false;
        //this.connect();
        logger.debug("Connection Redis Factory", "[REDIS_INIT]");
    }

    async disconnect(){
        logger.info("Redis [OFF]");
        this.client.quit();
    }

    async connect() {
        const flushAll = this.flushAll;
        var urlRedis = this.urlRedis;
        const redClient = this.client = redis.createClient(urlRedis);
        let promise = new Promise((resolve, reject) => {            
            redClient.on("error", function(error) {
                logger.error(error);
                reject (error);
            });
            redClient.on("connect", function(x) {        
                if(flushAll){
                    redClient.flushall();
                }                        
                logger.debug("Redis flushall ["+flushAll+"]");                   
                logger.info("Redis Connected [OK] to: " + urlRedis);
                this.connected = true;
                resolve ({redis: true});
            });
        });
        return promise;
    }

    async flushall() {
        this.client.flushall();
    }

    async set(key, value) {
        await this.client.set(key, value);
    }

    async expire(key, seconds = null) {
        this.client.expire(key, seconds);
    }

    async get(key) {
        return await this.client.get(key);
    }

    async exists(key) {
        let exists = await this.client.exists(key);
        return exists == 1?true:false;
    }
};
const instance = new RedisFactory();
//Object.freeze(instance);
module.exports = instance;