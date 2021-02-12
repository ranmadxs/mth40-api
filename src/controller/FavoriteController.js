var express = require('express');
const _ = require('lodash');
var router = express.Router();
const logger = require('../../LogConfig');
const { check, validationResult } = require('express-validator');
const favoriteSvc = require('../svc/FavoriteSvc');
logger.info("Favorite Controller", "[CTRL_INIT]");

router.post('/save', async function(req, res) {
  let result = null;
  try{
    const favorite = {
      name,
      description,
      info,
      url
    } = req.body;
    //logger.debug(favorite, "favorite");
    await favoriteSvc.save(favorite);
  //await favoriteSvc.calculateUnitMVP(req.body);
  } catch(ex){
    logger.error(ex);
    return res.status(_.isEmpty(ex)?500:ex.code).json(_.isEmpty(ex)?{ error: ex.message }:ex);
  }
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(result));  
});

module.exports = router;