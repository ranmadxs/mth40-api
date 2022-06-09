var resolve = require('json-refs').resolveRefs;
var YAML = require('js-yaml');
var fs = require('fs');
var logger = require('./LogConfig');
var pjson = require('./package.json');
const { version } = pjson;
var mth40 = require ('./src/configs');
const swaggerAutogen = require('swagger-autogen')()
var swaggerCfg = require('./swagger');

const outputFile = './resources/swagger-output.json'  
const endpointsFiles = ['./src/controller/AuthController.js']

loadInternal = async (swaggerFile) => {        
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
      swagDoc = swagDoc.replace("${port}", mth40.config.PORT);
  });         
  return swagDoc;
}

loadLocal = async function(swaggerFile) {
  //const docSample = await loadInternal('./resources/swagger-doc/index.yaml');
  //const swaggerDocument = YAML.parse(docSample);  
  //swaggerAutogen(outputFile, endpointsFiles, swaggerDocument).then(() => {
  //  logger.info('Swagger Autogen: '+outputFile, '[OK]');
  //})   
  swaggerCfg.swaggerBase();
  logger.info('Load Swagger YAML', '[OK]');  
  return await loadInternal(swaggerFile);
}
module.exports = {
  load : loadLocal,
  loadInternal : loadInternal
}