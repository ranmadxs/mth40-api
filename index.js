const express = require('express');
const app = express();
var cors = require('cors');
var swaggerUi = require('swagger-ui-express');
var swaggerDocument = require('./swagger.json');
const challongeSvc =  require('./src/svc/ChallongeSvc');
const armySvc = require('./src/svc/ArmySvc');

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

app.get('/army/list/', function (req, res) {
    console.debug(req.route, '/army/list/');
    res.writeHead(200, {'Content-Type': 'application/json'});
    var promisedResult = armySvc.listArmy();
    console.log(promisedResult);
    res.end(JSON.stringify(promisedResult));        
});

app.get('/challonge/tournaments/', function (req, res) {
    console.debug(req.route, '/challonge/tournaments/');
    res.writeHead(200, {'Content-Type': 'application/json'});
    var promisedResult = challongeSvc.listTournaments();

    promisedResult.then(function (result) {
        console.log(result);
        res.end(JSON.stringify(result));
    });    
});

app.listen(process.env.PORT || 3000, function () {
    console.log('server running on port 3000', '');
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));