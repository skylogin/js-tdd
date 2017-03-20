let Conference = {};
Conference.caches = Conference.caches || {};

Conference.simpleCache = function(){
  let privateCache = {};

  function getCacheKey(key){
      return JSON.stringify(key);
  }

  return {
    hasKey: function(key){

    },
    setValue: function(key, value){
      privateCache[getCacheKey(key)] = value;
    },
    getValue: function(key){
      return privateCache[getCacheKey(key)];
    }
  };
};

Conference.caches.RestaurantsWithinRadiusCache = (()=>{
  let instance = null;

  return {
    getInstance: function(){
      if(!instance){
        instance = Conference.simpleCache();
      }
      return instance;
    }
  };
})();

describe('Conference.caches.RestaurantsWithinRadiusCache', () => {
  describe('getInstance', () => {
    it('항상 동일한 인스턴스를 반환', () => {
      expect(Conference.caches.RestaurantsWithinRadiusCache.getInstance()).toBe(Conference.caches.RestaurantsWithinRadiusCache.getInstance());
    });
  });
});