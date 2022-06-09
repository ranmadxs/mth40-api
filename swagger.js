const swaggerAutogen = require('swagger-autogen')()
var pjson = require('./package.json');
const { version } = pjson;
const outputFile = './swagger-output.json'  
const endpointsFiles = ['./src/controller/AuthController.js']
var mth40 = require ('./src/configs');

const docBase = {
  info: {
      version: version,
      title: "WH40K API V02",
      description: "Documentation automatically generated by the <b>swagger-autogen</b> module."
  },
  host: mth40.config.BASE_URL+":"+mth40.config.PORT,
  basePath: "/",
  schemes: ['http', 'https'],
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [
      {
          "name": "User",
          "description": "Endpoints"
      }
  ],
  securityDefinitions: {
      apiKeyAuth:{
          type: "apiKey",
          in: "header",       // can be "header", "query" or "cookie"
          name: "X-API-KEY",  // name of the header, query parameter or cookie
          description: "any description..."
      }
  },
  definitions: {
      Parents: {
          father: "Simon Doe",
          mother: "Marie Doe"
      },
      User: {
          name: "Jhon Doe",
          age: 29,
          parents: {
              $ref: '#/definitions/Parents'
          },
          diplomas: [
              {
                  school: "XYZ University",
                  year: 2020,
                  completed: true,
                  internship: {
                      hours: 290,
                      location: "XYZ Company"
                  }
              }
          ]
      },
      AddUser: {
          $name: "Jhon Doe",
          $age: 29,
          about: ""
      }
  }
}

loadDocs = async function() {
  swaggerAutogen(outputFile, endpointsFiles, docBase).then(() => {
    //require('./src/index')           // Your project's root file
  });
 }

loadDocs();

module.exports = {
  swaggerBase : loadDocs
}
/*
swaggerAutogen(outputFile, endpointsFiles, docBase).then(() => {
  //require('./src/index')           // Your project's root file
})
*/

/*
var loadSwagger = require('./loadSwagger');
var YAML = require('yamljs');

loadDocs = async function(yamlFile) {
  const result = await loadSwagger.loadInternal(yamlFile); 
  return result;
}

function start() {
  return myfunction();
}

// Call start
(async() => {
  const docSample = await loadDocs('./resources/swagger-doc/index.yaml');
  const swaggerDocument = YAML.parse(docSample);  
  const outputFile = './resources/swagger-output.json'  
  const endpointsFiles = ['./src/controller/AuthController.js']
  swaggerAutogen(outputFile, endpointsFiles, swaggerDocument).then(() => {
    //require('./index')           // Your project's root file
  })
  
})();
*/