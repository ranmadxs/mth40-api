const express = require('express');
const app = express();
var logger = require('./LogConfig');
var cors = require('cors');
var swaggerUi = require('swagger-ui-express');
var swaggerDocument = require('./swagger.json');
const challongeSvc =  require('./src/svc/ChallongeSvc');
var armyController = require('./src/controller/ArmyController');
var rosterController = require('./src/controller/RosterController');

const factionSvc = require('./src/svc/FactionSvc');


//let armyFactions = new ArmyFactions();

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
    console.debug(req.route, '/challonge/tournaments/');
    res.writeHead(200, {'Content-Type': 'application/json'});
    var promisedResult = challongeSvc.listTournaments();

    promisedResult.then(function (result) {
        logger.info(result);
        res.end(JSON.stringify(result));
    });    
});

app.listen(process.env.PORT || 3000, function () {
    logger.info('server running on port 3000', 'app.listen');
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
