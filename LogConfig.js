const log4js = require('log4js');
const log4js_extend = require("log4js-extend");
log4js_extend(log4js, {
    path: __dirname,
    format: "(@file:@line:@column)"
  });

const logger = log4js.getLogger(">");
logger.level = 'debug';

logger.info("Init Logger level = [" + logger.level + "]");
module.exports = logger;
