const redis = require("async-redis");
var logger = require('../../LogConfig');

class RedisFactory {

    constructor(){
        var urlRedis = this.urlRedis = "redis://h:pd84c59ffd70de057d03f71c553bf6e1a6a1ad076ee9b3ff89bc2e6115be72fde@ec2-52-202-26-118.compute-1.amazonaws.com:14009";
        this.init();
    }

    async init() {        
        var urlRedis = this.urlRedis;
        const redClient = this.client = redis.createClient(urlRedis);
        let promise = new Promise((resolve, reject) => {            
            redClient.on("error", function(error) {
                logger.error(error);
                reject (error);
            });
            redClient.on("connect", function(x) {                
                redClient.flushall();            
                logger.debug("Redis flushall [TRUE]");        
                resolve (true);
            });
        });
        let result = await promise;
        if(result == true){
            logger.info("Redis Connected [OK] to: " + urlRedis);
        }
    }

    async set(key, value){
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
Object.freeze(instance);
module.exports = instance;