var express = require('express');
var router = express.Router();
const logger = require('../../LogConfig');
var multer = require('multer');
var upload = multer();
const rosterSvc =  require('../svc/RosterSvc');
fs = require('fs');
var path = require('path');
global.appRoot = path.resolve(__dirname);

logger.info("Roster Controller", "[CTRL_INIT]");

router.post('/validate', upload.single("roster_file"), function(req, res) {
    logger.debug(req.route);
    //logger.debug(req.body.roster_json);
    //logger.info(req.file);
    if(req.query.saveJson == "true"){
        folderJson = appRoot + "/../../test/resources/roster_json/";
        const originalName = req.file.originalname.replace("'", "");
        fileJson = folderJson + originalName.replace(".ros", ".json");
        logger.info("Save Json to: " + fileJson);        
        fs.writeFile(fileJson, req.body.roster_json, function (err,data) {
            if (err) {
              return logger.error(err);
            }
            logger.info("Create file [OK]");
        });            
    }
    
    rosterSvc.validateRoster(JSON.parse(req.body.roster_json)).then(result => {
        //logger.debug(result);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(result));
    });    
    
});

module.exports = router;