Target = function(){
  let self = this;
  this.targetFn = (() => {
    expect(this).toBe(self);
  });
};

describe('AOP', () => {
  let targetObj;
  let executionPoints;
  let argPassingAdvice;
  let argsToTarget;
  let targetFnReturn = 123;

  beforeEach(() => {
    targetObj = {
      targetFn: function(){
        executionPoints.push('targetFn');
        argsToTarget = Array.prototype.slice.call(arguments, 0);

        return targetFnReturn;
      }
    };

    executionPoints = [];

    argPassingAdvice = function(targetInfo){
      return targetInfo.fn.apply(this, targetInfo.args);
    };

    argsToTarget = [];
  });

  describe('AOP.around(fnName, advice, targetObj)', () => {
    it('타깃 함수를 호출 시 어드바이스를 실행하도록 한다', () => {
      let executedAdvice = false;
      let advice = (() => {
        executedAdvice = true;
      });

      AOP.around('targetFn', advice, targetObj);
      targetObj.targetFn();

      expect(executedAdvice).toBe(true);
    });

    it('어드바이스가 타깃 호출을 래핑한다', () => {
      let wrappingAdvice = ((targetInfo) => {
        executionPoints.push('wrappingAdvice - 처음');
        targetInfo.fn();
        executionPoints.push('wrappingAdvice - 끝');
      });

      AOP.around('targetFn', wrappingAdvice, targetObj);
      targetObj.targetFn();

      expect(executionPoints).toEqual(['wrappingAdvice - 처음', 'targetFn', 'wrappingAdvice - 끝']);
    });

    it('마지막 어드바이스가 기존 어드바이스에 대해 실행되는 방식으로 체이닝할 수 있다', () => {
      let adviceFactory = ((adviceID) => {
        return ((targetInfo) => {
          executionPoints.push('wrappingAdvice - 처음 ' + adviceID);
          targetInfo.fn();
          executionPoints.push('wrappingAdvice - 끝 ' + adviceID);
        });
      });

      AOP.around('targetFn', adviceFactory('안쪽'), targetObj);
      AOP.around('targetFn', adviceFactory('바깥쪽'), targetObj);
      targetObj.targetFn();

      expect(executionPoints).toEqual([
        'wrappingAdvice - 처음 바깥쪽',
        'wrappingAdvice - 처음 안쪽',
        'targetFn',
        'wrappingAdvice - 끝 안쪽',
        'wrappingAdvice - 끝 바깥쪽'
      ]);
    });

    it('어드바이스에서 타깃으로 일반 인자를 넘길 수 있다', () => {
      AOP.around('targetFn', argPassingAdvice, targetObj);
      targetObj.targetFn('a', 'b');

      expect(argsToTarget).toEqual(['a', 'b']);
    });

    it('타깃의 반환값도 어드바이스에서 참조할 수 있다', () => {
      AOP.around('targetFn', argPassingAdvice, targetObj);
      let returnedValue = targetObj.targetFn();

      expect(returnedValue).toBe(targetFnReturn);
    });

     it('타깃 함수를 해당 객체의 콘텍스트에서 실행한다', () => {
      const Target = function(){
        let self = this;
        this.targetFn = (() => {
          expect(this).toBe(self);
        });
      };

      let targetInstance = new Target();
      let spyOnInstance = spyOn(targetInstance, 'targetFn').and.callThrough();
      AOP.around('targetFn', argPassingAdvice, targetInstance);
      targetInstance.targetFn();
      expect(spyOnInstance).toHaveBeenCalled();

    });
  });


  describe('AOP.next(context, targetInfo)', () => {
    let advice = ((targetInfo) => {
      return AOP.next.call(this, targetInfo);
    });

    let originalFn;
    beforeEach(() => {
      originalFn = targetObj.targeFn;
      AOP.around('targetFn', advice, targetObj);
    });

    it('targetInfo.fn에 있는 함수를 호출한다', () => {
      targetObj.targetFn();
      expect(executionPoints).toEqual(['targetFn']);
    });

    it('targetInfo.args에 인자를 전달한다',  () => {
      targetObj.targetFn('a', 'b');
      expect(argsToTarget).toEqual(['a', 'b']);
    });

    it('targetInfo 함수에서 받은 값을 반환한다', () => {
      let ret = targetObj.targetFn();
      expect(ret).toEqual(targetFnReturn);
    });

    it('주어진 컨텍스트에서 타깃 함수를 실행한다', () => {
      let targetInstance = new Target();
      let spyOnInstance = spyOn(targetInstance, 'targetFn').and.callThrough();
      AOP.around('targetFn', advice, targetInstance);
      targetInstance.targetFn();
      expect(spyOnInstance).toHaveBeenCalled();
    });

  });
});

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