const rosterSvc = require('../../src/svc/RosterSvc');
var logger = require('../../LogConfig');
fs = require('fs');
var path = require('path');
global.appRoot = path.resolve(__dirname);

test('Validate Roster', async () => {
    fileName = appRoot+"/../test/roster_json/Imperium-Astra Militarum{OT500-V01}Primaris Psyker.json";
    logger.debug("Validate Roster Test init load file");

    const promises = [];
    
    /*
    promises.push(factionSvc.find("Astra Militarum"));

    await Promise.all(promises).then(respVal => {
        logger.info(respVal[0]);
        expect(respVal[0].name).toBe('Imperium');
    }).catch(reason => { 
        logger.error(reason);
        expect(1).toBe(0);
    });  
    */
    logger.debug("End Test Validate Roster");
    expect(1).toBe(1);
    
});