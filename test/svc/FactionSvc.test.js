const factionSvc = require('../../src/svc/FactionSvc');
var logger = require('../../LogConfig');


test('findFaction by name', async () => {
    logger.debug("Test Faction by name");

    const promises = [];
    promises.push(factionSvc.find("Astra Militarum"));

    await Promise.all(promises).then(respVal => {
        logger.info(respVal[0]);
        expect(respVal[0].name).toBe('Imperium');
    }).catch(reason => { 
        logger.error(reason);
        expect(1).toBe(0);
    });  
    logger.debug("End Test Faction by Name");    
});