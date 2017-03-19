let Conference = {};
let ThirdParty = {};

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

ThirdParty.restaurantApi= (() => {
  return{
    getRestaurantsWithinRadius: function(address, radiusMiles, cuisine){
    }
  };
});

AOP.around(
  'restaurantApi',

  ((targetInfo) => {
    let api = AOP.next.call(this, targetInfo);

    getRestaurantsNearConference = ((cuisine) => {
      return api.getRestaurantsWithinRadius('서울시 용산구 문배동', 2.0, cuisine);
    });

    api.getRestaurantsNearConference = api.getRestaurantsNearConference || getRestaurantsNearConference;
    return api;
  }),

  ThirdParty
)

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
    })
  })
})