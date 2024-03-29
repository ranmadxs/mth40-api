require('dotenv').config();
require('./src/banner');
const express = require('express');
const app = express();
var logger = require('./LogConfig');
var cors = require('cors');
/***** LIbs Swagger *******/
var YAML = require('yamljs');
var swaggerUi = require('swagger-ui-express');
//var swaggerDocument = YAML.load('./doc/swagger.yaml');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var mth40 = require ('./src/configs');
//const swaggerFile = require('./resources/swagger-output.json');

const router = require('./routes')

/*** Controladores */
var armyController = require('./src/controller/ArmyController');
var rosterController = require('./src/controller/RosterController');
var wahapediaController = require('./src/controller/WahapediaController');
var configController = require('./src/controller/ConfigController');
var challongeController = require('./src/controller/ChallongeController');
var tournamentController = require('./src/controller/TournamentController');
var matchController = require('./src/controller/MatchController');
var scoreController = require('./src/controller/ScoreController');
var favoriteController = require('./src/controller/FavoriteController')
//var authController = require('./src/controller/AuthController')
/*** Factorias */
var redisFactory = require('./src/factories/RedisFactory');
var mongoFactory = require('./src/factories/MongoConnectionFactory');
//var mysqlFactory = require('./src/factories/MySQLConnectionFactory');
var loadSwagger = require('./loadSwagger');
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
//app.use('/auth', authController);
app.use('/roster', rosterController);
app.use('/wahapedia', wahapediaController);
app.use('/config', configController);
app.use('/challonge', challongeController);
app.use('/tournament', tournamentController);
app.use('/match', matchController);
app.use('/score', scoreController);
app.use('/favorite', favoriteController);

/* Middlewares */
app.use(router)

app.listen(mth40.config.PORT, async () => {
    logger.debug("mth40-api starting on port="+mth40.config.PORT);
    const docSample = await loadSwagger.load('./doc/index.yaml');
    const swaggerDocument = YAML.parse(docSample);
    const mongoPromised = mongoFactory.connect();
    //const mysqlPromised = mysqlFactory.connect();
    const redisPromised = redisFactory.connect();
    const swaggerFile = require('./swagger-output.json');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    app.use('/docs-v2', swaggerUi.serve, swaggerUi.setup(swaggerFile))

    Promise.all([mongoPromised, redisPromised]).then(respVal => {
        console.log("********************************************************");
        console.log(respVal);
        console.log('************* Server running on port ' + mth40.config.PORT + " **************");
        console.log("********************************************************");
    }).catch(reason => { 
        logger.error(reason);
    });    
});