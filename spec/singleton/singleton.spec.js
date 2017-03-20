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
      let sharedCache = {}
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