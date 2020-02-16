const express = require('express');
const app = express();
var cors = require('cors');
var swaggerUi = require('swagger-ui-express');
var swaggerDocument = require('./swagger.json');

app.use(
        cors({
            credentials: true,
            origin: true
        })
        );
app.options('*', cors());

app.get('/', (req, res) => 
    res.redirect('/api-docs')
    //res.send('Hola API')
);

app.get('/armies/list/', function (req, res) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    var response = "{resp:'XD'}";
    res.end(JSON.stringify(response));
});

app.listen(process.env.PORT || 3000, function () {
    console.log('server running on port 3000', '');
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));