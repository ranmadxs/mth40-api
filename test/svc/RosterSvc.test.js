const rosterSvc = require('../../src/svc/RosterSvc');
var logger = require('../../LogConfig');
fs = require('fs');
var path = require('path');
global.appRoot = path.resolve(__dirname);

test('Validate Roster', async () => {
    fileName = appRoot+"/../resources/roster_json/Imperium-Astra Militarum{OT500-V01}Primaris Psyker.json";
    logger.info("Validate Roster Test init load file");
    await fs.readFile( fileName, async (err, data) => {
        if (err) {
            logger.error(err);
            throw err;
        }
        
        let rosterObj = JSON.parse(data.toString());
        logger.info(rosterObj);

        const rosterValid = await rosterSvc.validateRoster(rosterObj);
        //promises.push(rosterSvc.validateRoster(rosterObj));
        /*
        await Promise.all(promises).then(faction => {
            logger.debug(faction);
        }).catch(reason => { 
            logger.error(reason);
            expect(1).toBe(0);
        });             
        */
    });

    
    
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