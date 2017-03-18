describe('AOP', () => {
  let targetObj;
  let executionPoints;

  beforeEach(() => {
    targetObj = {
      targetFn: function(){
        executionPoints.push('targetFn');
      }
    };

    executionPoints = [];
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

  });
});

AOP = {
  around: function(fnName, advice, fnObj){
    let originalFn = fnObj[fnName];
    fnObj[fnName] = (() => {
      let targetContext = {};
      advice.call(targetContext, {fn: originalFn});
    });
  }
};