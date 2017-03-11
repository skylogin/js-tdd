describe('DIContainer', () => {
	var container;
	beforeEach(() => {
		container = new DIContainer();
	});

	describe('register(name, dependencies, func)', () => {
		it('인자가 하나라도 빠졌거나 타입이 잘못되면 예외를 던진다.', () => {
			let badArgs = [
				[],   //인자가 없는경우
				['Name'],   //name만 있는 경우
				['Name', ['Dependency1', 'Dependency2']],   //name과 dependencies만 있는 경우
				['Name', () => {}],   //dependencies가 빠진경우
				// ['Name', (function() {})],   //dependencies가 빠진경우
				//그 외 경우 모음
				[1, ['a', 'b'], () => {}],
				// [1, ['a', 'b'], function() {}],
				['Name', [1,2], () => {}],
				// ['Name', [1,2], function() {}],
				['Name', ['a', 'b'], 'should be a function']
			];

			badArgs.forEach((args) => {
				expect(() => {
					container.register.apply(container, args);
				// }).toThrow();
				}).toThrowError(container.messages.registerRequiresArgs);   //더 정확한 테스트 (에러메시지까지 본다)
				// }).toThrowError(container.registerRequiresArgs);   //더 정확한 테스트 (에러메시지까지 본다)
			});
		});
	});

});

DIContainer = function(){
	if(!(this instanceof DIContainer)){
		return new DIContainer();
	}
};

DIContainer.prototype.messages = {
	registerRequiresArgs: '이 생성자 함수는 인자가 3개 있어야 합니다: 문자열, 문자열 배열, 함수'
};

DIContainer.prototype.register = function(name, dependencies, func){
	let ix;

	if(typeof name !== 'string' || !Array.isArray(dependencies) || typeof func !== 'function'){
		throw new Error(this.messages.registerRequiresArgs);
	}

	for(ix=0; ix<dependencies.length; ++ix){
		if(typeof dependencies[ix] !== 'string'){
			throw new Error(this.messages.registerRequiresArgs);
		}
	}
};


// class DIContainer{
//  constructor(){
//    this.registerRequiresArgs = '이 생성자 함수는 인자가 3개 있어야 합니다: 문자열, 문자열 배열, 함수';

//    if(!(this instanceof DIContainer)){
//      return new DIContainer();
//    }
//  }

//  register(name, dependencies, func){
//    let ix;

//    if(typeof name !== 'string' || !Array.isArray(dependencies) || typeof func !== 'function'){
//      throw new Error(this.registerRequiresArgs);
//    }

//    for(ix=0; ix<dependencies.length; ++ix){
//      if(typeof dependencies[ix] !== 'string'){
//        throw new Error(this.registerRequiresArgs);
//      }
//    }
//  }
// }