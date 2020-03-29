require('dotenv').config();
const express = require('express');
const app = express();
var logger = require('./LogConfig');
var cors = require('cors');
var swaggerUi = require('swagger-ui-express');
var swaggerDocument = require('./swagger.json');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var redisFactory = require('./src/factories/RedisFactory');
var mth40 = require ('./src/configs');
const challongeSvc =  require('./src/svc/ChallongeSvc');
var armyController = require('./src/controller/ArmyController');
var rosterController = require('./src/controller/RosterController');

const factionSvc = require('./src/svc/FactionSvc');

logger.debug (mth40);

// for parsing application/json
app.use(bodyParser.json()); 

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded

app.post('/uploads', upload.single("roster_file"),(req, res) => {
    let formData = req.body;
    console.log('form data', formData);
    console.log('form data', req.file);
    res.status(200).send(JSON.stringify({'xd': 'OK'}));
  });

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

/*
app.get('/army/list/', function (req, res) {
    console.debug(req.route, '/army/list/');
    res.writeHead(200, {'Content-Type': 'application/json'});
    var promisedResult = armySvc.listArmy();
    promisedResult.then(function (result) {
        logger.info(result);
        res.end(JSON.stringify(result));
    });       
});
*/

app.get('/challonge/tournaments/', function (req, res) {
    //console.debug(req.route, '/challonge/tournaments/');
    res.writeHead(200, {'Content-Type': 'application/json'});
    var promisedResult = challongeSvc.tournaments();

    promisedResult.then(function (result) {
        logger.info(result);
        res.end(JSON.stringify(result));
    });    
});

app.listen(mth40.config.PORT, function () {
    logger.info('server running on port ' + mth40.config.PORT, 'app.listen');
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
