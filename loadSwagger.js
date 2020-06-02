var resolve = require('json-refs').resolveRefs;
var YAML = require('js-yaml');
var fs = require('fs');
var logger = require('./LogConfig');
var pjson = require('./package.json');
const { version } = pjson;

module.exports = {
    load : async (swaggerFile) => {        
        var root = YAML.safeLoad(fs.readFileSync(swaggerFile).toString());
        var options = {
            filter        : ['relative', 'remote'],
            loaderOptions : {
                processContent : (res, callback) => {
                    callback(null, YAML.safeLoad(res.text));
                }
            }
        };                       
        let promisedSwagger = new Promise(function (resolvePromised, reject) {
            resolve(root, options).then(async (results) => {
                let swaggerDoc = await YAML.safeDump(results.resolved);                    
                resolvePromised(swaggerDoc);
            });
        });

        let swagDoc = null;
        await promisedSwagger.then((doc) => {
            swagDoc = doc;
            swagDoc = doc.replace("${version}", version);
        });        
        logger.info('Load Swagger YAML', '[OK]');
        return swagDoc;
    }
}