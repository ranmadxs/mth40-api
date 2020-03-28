var express = require('express');
var router = express.Router();
const logger = require('../../LogConfig');
var multer = require('multer');
var upload = multer();

router.post('/validateRoster', upload.single("roster_file"), function(req, res) {
    logger.debug(req.route);
    logger.info(req.body.roster_json);
    logger.info(req.file);
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify("{res: 'OK'}"));
});

module.exports = router;