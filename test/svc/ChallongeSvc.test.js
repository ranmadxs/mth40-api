const challongeSvc = require('../../src/svc/ChallongeSvc');

var logger = require('../../LogConfig');

test('listParticipants by tournamentId', async () => {
    logger.debug("List Faction by tournamentId");

    const promises = [];
    const tournamentId = 7968393;
    promises.push(challongeSvc.listParticipants(tournamentId));

    await Promise.all(promises).then(respVal => {
        logger.info(respVal);       
    }).catch(reason => {
        logger.error(reason);
        expect(1).toBe(0);
    });  
    logger.debug("End Test listParticipants by tournamentId");    
});