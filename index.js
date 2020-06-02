require('dotenv').config();
require('./src/banner');
const express = require('express');
const app = express();
var logger = require('./LogConfig');
var cors = require('cors');
var swaggerUi = require('swagger-ui-express');
var YAML = require('yamljs');
var swaggerDocument = YAML.load('./doc/swagger.yaml');

// var swaggerDocument = require('./swagger.yml');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var redisFactory = require('./src/factories/RedisFactory');
var mth40 = require ('./src/configs');
var armyController = require('./src/controller/ArmyController');
var rosterController = require('./src/controller/RosterController');
var wahapediaController = require('./src/controller/WahapediaController');
var configController = require('./src/controller/ConfigController');
var challongeController = require('./src/controller/ChallongeController');
var mongoFactory = require('./src/factories/MongoConnectionFactory');
//var mysqlFactory = require('./src/factories/MySQLConnectionFactory');

const factionSvc = require('./src/svc/FactionSvc');
logger.debug (mth40);

//nodemon index.js

// for parsing application/json
app.use(bodyParser.json()); 

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 

app.use(
        cors({
            credentials: true,
            origin: true
        })
        );
app.options('*', cors());


app.get('/', (req, res) => 
    res.redirect('/api-docs')
);

app.use('/army', armyController);
app.use('/roster', rosterController);
app.use('/wahapedia', wahapediaController);
app.use('/config', configController);
app.use('/challonge', challongeController);

app.listen(mth40.config.PORT, function () {
    logger.debug("mth40-api starting on port="+mth40.config.PORT);
    const mongoPromised = mongoFactory.connect();
    //const mysqlPromised = mysqlFactory.connect();
    const redisPromised = redisFactory.connect();
    Promise.all([mongoPromised, redisPromised]).then(respVal => {
        console.log("********************************************************");
        console.log(respVal);
        console.log('************* Server running on port ' + mth40.config.PORT + " **************");
        console.log("********************************************************");
    }).catch(reason => { 
        logger.error(reason);
    });    
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));