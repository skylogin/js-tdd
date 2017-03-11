describe('DIContainer', () => {
	var container;
	beforeEach(() => {
		container = new DIContainer();
	});

	describe('register(name, dependencies, func)', () => {
		it('인자가 하나라도 빠졌거나 타입이 잘못되면 예외를 던진다.', () => {
			let badArgs = [
				[],		//인자가 없는경우
				['Name'],		//name만 있는 경우
				['Name', ['Dependency1', 'Dependency2']],		//name과 dependencies만 있는 경우
				['Name', () => {}], 	//dependencies가 빠진경우
				//그 외 경우 모음
				[1, ['a', 'b'], () => {}],
				['Name', [1,2], () => {}],
				['Name', ['a', 'b'], 'should be a function']
			];

			badArgs.forEach((args) => {
				expect(() => {
					container.register.apply(container, args);
				}).toThrowError(container.registerRequiresArgs);		//더 정확한 테스트 (에러메시지까지 본다)
			});
		});
	});

	describe('get(name)', () => {
		it('성명이 등록되어 있지 않으면 undefined를 반환한다', () => {
			expect(container.get('notDefined')).toBeUndefined();
		});

		it('등록된 함수를 실행한 결과를 반환한다', () => {
			let name = 'MyName';
			let returnFromRegisteredFunction = 'something';

			container.register(name, [], () => {
				return returnFromRegisteredFunction;
			});

			expect(container.get(name)).toBe(returnFromRegisteredFunction);
		});
	});

});


class DIContainer{
	constructor(){
		this.registerRequiresArgs = '이 생성자 함수는 인자가 3개 있어야 합니다: 문자열, 문자열 배열, 함수';
		this.registrations = [];

		if(!(this instanceof DIContainer)){
			return new DIContainer();
		}
	}

	register(name, dependencies, func){
		if(typeof name !== 'string' || !Array.isArray(dependencies) || typeof func !== 'function'){
			throw new Error(this.registerRequiresArgs);
		}

		for(let ix=0; ix<dependencies.length; ++ix){
			if(typeof dependencies[ix] !== 'string'){
				throw new Error(this.registerRequiresArgs);
			}
		}

		this.registrations[name] = { func: func };
	}

	get(name){
		const registration = this.registrations[name];
		if(registration === undefined){
			return undefined;
		}

		return registration.func();
	}
}