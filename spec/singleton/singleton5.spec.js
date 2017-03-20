AOP = {
  around: function(fnName, advice, fnObj){
    let originalFn = fnObj[fnName];
    fnObj[fnName] = function(){
      return advice.call(this, {fn:originalFn, args:arguments});
    };
  },
  next: function(targetInfo){
    return targetInfo.fn.apply(this, targetInfo.args);
  }
};

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

let Aspects = {};

Aspects.returnValueCache = function(sharedCache){
  let cache = sharedCache || {};


  return{
    advice: function(targetInfo){
      let cacheKey = JSON.stringify(targetInfo.args);

      if(cache.hasOwnProperty(cacheKey)){
        return cache[cacheKey];
      }

      let returnValue = AOP.next(targetInfo);
      cache[cacheKey] = returnValue;
      return returnValue;
    }
  }
};

let ThirdParty = {};

ThirdParty.restaurantApi= (() => {
  return{
    getRestaurantsWithinRadius: function(address, radiusMiles, cuisine){
    }
  };
});

AOP.around(
  'restaurantApi',

  ((targetInfo) => {
    //addMemoizationToGetRestaurantsWithinRadius
    let api = AOP.next.call(this, targetInfo);

    //get singleton cache
    let cache = Conference.caches.RestaurantsWithinRadiusCache.getInstance();

    //add memoization
    AOP.around('getRestaurantsWithinRadius', Aspects.returnValueCache(cache).advice, api);

    return api;
  }),

  ThirdParty
);

AOP.around(
  'restaurantApi',

  ((targetInfo) => {
    //addGetRestaurantsNearConference
    let api = AOP.next.call(this, targetInfo);

    getRestaurantsNearConference = ((cuisine) => {
      return api.getRestaurantsWithinRadius('서울시 용산구 문배동', 2.0, cuisine);
    });

    api.getRestaurantsNearConference = api.getRestaurantsNearConference || getRestaurantsNearConference;
    return api;
  }),

  ThirdParty
);

Conference.memoizedRestaurantsApi = ((thirdPartyApi) => {
  let api = thirdPartyApi;
  let cache = {};

  return {
    getRestaurantsNearConference: function(cuisine){
      if(cache.hasOwnProperty(cuisine)){
        return cache[cuisine];
      }

      let returnedPromise = api.getRestaurantsNearConference(cuisine);
      cache[cuisine] = returnedPromise;
      return returnedPromise;
    }
  };
});


describe('returnValueCache', () => {
  let testObject, testValue, args, spyReference;

  function createATestObject(){
    let obj = {
      testFunction: function(arg){
        return testValue;
      }
    };
    spyOn(obj, 'testFunction').and.callThrough();

    obj.spyReference = obj.testFunction;
    return obj;
  };


  beforeEach(() => {
    testValue = {};
    testObject = {
      testFunction: function(args){
        return testValue;
      }
    };

    spyOn(testObject, 'testFunction').and.callThrough();

    //after aspect, didn't reference from spy. so we save the value that current.
    spyReference = testObject.testFunction;

    //testObject.testFuntion is decorated of aspect by returnValueCache.
    AOP.around('testFunction', Aspects.returnValueCache().advice, testObject);

    args = [{key:'value'}, 'someValue'];
  });

  describe('advice(targetInfo)', () => {
    it('첫번째 실행시 장식된 함수의 반환값을 반환', () => {
      let value = testObject.testFunction.apply(testObject, args);
      expect(value).toBe(testValue);
    });

    it('여러번 실행시 장식된 함수의 반환값을 반환', () => {
      let iterations = 3;
      for(let i=0; i<iterations; i++){
        let value = testObject.testFunction.apply(testObject, args);
        expect(value).toBe(testValue);
      }
    });

    it('같은 키값으로 여러번 실행해도 장식된 함수만 실행', () => {
      let iterations = 3;
      for(let i=0; i<iterations; i++){
        let value = testObject.testFunction.apply(testObject, args);
        expect(value).toBe(testValue);
      }
      expect(spyReference.calls.count()).toBe(1);
    });

    it('고유한 각 키 값마다 꼭 한번씩 장식된 함수를 실행', () => {
      let keyValues = ['value1', 'value2', 'value3'];

      keyValues.forEach((arg) => {
        let value = testObject.testFunction(arg);
      });

      //again. didn't execute function. because result from cache.
      keyValues.forEach((arg) => {
        let value = testObject.testFunction(arg);
      });

      expect(spyReference.calls.count()).toBe(keyValues.length);
    });

    it('주입된 캐시를 인스턴스 간에 공유할 수 있다.', () => {
      let sharedCache = Conference.simpleCache();
      let object1 = createATestObject();
      let object2 = createATestObject();

      AOP.around('testFunction', new Aspects.returnValueCache(sharedCache).advice, object1);
      AOP.around('testFunction', new Aspects.returnValueCache(sharedCache).advice, object2);

      object1.testFunction(args);

      expect(object2.testFunction(args)).toBe(testValue);
      expect(object2.spyReference.calls.count()).toBe(0);

    });

  });
});

describe('Conference.caches.RestaurantsWithinRadiusCache', () => {
  describe('getInstance', () => {
    it('항상 동일한 인스턴스를 반환', () => {
      expect(Conference.caches.RestaurantsWithinRadiusCache.getInstance()).toBe(Conference.caches.RestaurantsWithinRadiusCache.getInstance());
    });
  });
});


describe('memoizedRestaurantsApi', () => {
  let api, serivce, returnedFromService;

  beforeEach(() => {
    api = ThirdParty.restaurantApi();
    service = Conference.memoizedRestaurantsApi(api);
    returnedFromService = {};
  });

  describe('getRestaurantsNearConference(cuisine)', () => {
    it('기대 인자를 넘겨 api 의 getRestaurantsNearConference 를 실행', () => {
      let cuisine = '분식';
      spyOn(api, 'getRestaurantsNearConference');
      service.getRestaurantsNearConference(cuisine);

      let args = api.getRestaurantsNearConference.calls.argsFor(0);
      expect(args[0]).toEqual(cuisine);
    });

    it('서드파티 API 의 반환값을 반환', () => {
      spyOn(api, 'getRestaurantsNearConference').and.returnValue(returnedFromService);
      let value = service.getRestaurantsNearConference('Asian Fusion');
      expect(value).toBe(returnedFromService);
    });

    it('같은 요리를 여러번 요청해도 api 는 한번만 요청한다', () => {
      let cuisine = '분식';

      spyOn(api, 'getRestaurantsNearConference').and.returnValue(returnedFromService);

      let iterations = 5;
      for(let i=0; i<iterations; i++){
        let value = service.getRestaurantsNearConference(cuisine);
      }

      expect(api.getRestaurantsNearConference.calls.count()).toBe(1);
    });

    it('같은 요리를 여러번 요청해도 같은 값으로 반환', () => {
      let cuisine = '한정식';

      spyOn(api, 'getRestaurantsNearConference').and.returnValue(returnedFromService);

      let iterations = 5;
      for(let i=0; i<iterations; i++){
        let value = service.getRestaurantsNearConference(cuisine);
        expect(value).toBe(returnedFromService);
      }
    });
  });
});