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

  async list() {
    let favorites = await Favorite.model.find().sort({'_id': -1}).limit(4);
    return favorites;
  }
};

const instance = new FavoriteSvc();
Object.freeze(instance);
module.exports = instance;