const wahapediaSvc = require('../../src/svc/WahapediaSvc');
var logger = require('../../LogConfig');

test('getSubFactions by url', async () => {
    logger.debug("Test getSubFactions by url");
    const url = 'http://wahapedia.ru/wh40k8ed/factions/chaos-space-marines/';
    
    const promises = [];
    promises.push(wahapediaSvc.getSubFactions(url));

    await Promise.all(promises).then(respVal => {
        logger.info(respVal);
        expect(1).toBe(1);
    }).catch(reason => { 
        logger.error(reason);
        expect(1).toBe(0);
    });  

    logger.debug("End ******************************************");    
});