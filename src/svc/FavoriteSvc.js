var logger = require('../../LogConfig');
var Favorite = require ('../schemas/FavoriteSchema');

class FavoriteSvc {

  constructor() {
    if(! FavoriteSvc.instance) {
      FavoriteSvc.instance = this;
      logger.debug("FavoriteSvc SVC", "[SVC_INSTANCE]");
    }
    return FavoriteSvc.instance;     
  }

  async save(favorite) {   
    var favoriteSchema = new Favorite.model(favorite);
    logger.debug(favoriteSchema, "[INIT_SAVE_FAVORITE]");
    await favoriteSchema.save(function (err) {if (err) logger.error (err, "Error Save Favorite")});
  }
};

const instance = new FavoriteSvc();
Object.freeze(instance);
module.exports = instance;