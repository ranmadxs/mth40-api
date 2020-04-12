var mongoFactory = require('../src/factories/MongoConnectionFactory');
var mysqlFactory = require('../src/factories/MySQLConnectionFactory');
var logger = require('../LogConfig');

beforeEach(async () => {
    logger.info('Before', 'Jest');
    await mongoFactory.connect();    
    await mysqlFactory.connect();
  });
  
afterEach(async () => {
    logger.info('After', 'Jest');
    await mysqlFactory.disconnect();
    await mongoFactory.disconnect();
});