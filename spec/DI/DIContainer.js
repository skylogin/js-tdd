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

		this.registrations[name] = {
			dependencies: dependencies,
			func: func
		};
	}

	get(name){
		const self = this;
		const registration = this.registrations[name];
		const dependencies = [];

		if(registration === undefined){
			return undefined;
		}

		registration.dependencies.forEach((dependencyName) => {
			let dependency = self.get(dependencyName);
			dependencies.push( (dependency === undefined)? undefind: dependency);
		});

		return registration.func.apply(undefined, dependencies);
	}
}

export default DIContainer;