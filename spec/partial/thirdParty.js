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
    let api = AOP.next.call(this, targetInfo);

    getRestaurantsNearConference = ((cuisine) => {
      return api.getRestaurantsWithinRadius('서울시 용산구 문배동', 2.0, cuisine);
    });

    api.getRestaurantsNearConference = api.getRestaurantsNearConference || getRestaurantsNearConference;

    return api;
  }),

  ThirdParty
)


describe('ThirdParty.restaurantApi() 애스펙트', () => {
  let api = ThirdParty.restaurantApi();

  describe('getRestaurantsNearConference(cuisine)', () => {
    let returnFromUnderlyingFunction = '아무개';
    let cuisine = '중화요리';

    beforeEach(() => {
      spyOn(api, 'getRestaurantsWithinRadius').and.returnValue(returnFromUnderlyingFunction);
    });

    it('올바른 인자로 getRestaurantWithinRadius를 호출', () => {
      api.getRestaurantsNearConference(cuisine);
      expect(api.getRestaurantsWithinRadius).toHaveBeenCalledWith('서울시 용산구 문배동', 2.0, cuisine);
    });

    it('getRestaurantsWithinRadius로 부터 받은 값을 반환', () => {
      let ret = api.getRestaurantsNearConference(cuisine);
      expect(ret).toBe(returnFromUnderlyingFunction);
    });

  })
});


