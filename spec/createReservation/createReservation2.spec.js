
describe('createResrvation(passenger, flight)', () => {
	var testPassenger = null;
	var	testFlight = null;
	var	testReservation = null;

	beforeEach(function(){
		testPassenger = {
			firstName: '윤지',
			lastName: '김'
		};

		testFlight = {
			number: 433,
			carrier: '대한항공',
			destination: '울산'
		};

		testReservation = createReservation(testPassenger, testFlight);
	});


	it('passenger를 passengerInformation 프로퍼티에 할당한다', () => {
		expect(testReservation.passengerInformation).toBe(testPassenger);
	});
	it('flight를 flightInformation 프로퍼티에 할당한다', () => {
		expect(testReservation.flightInformation).toBe(testFlight);
	});
});

function createReservation(passenger, flight){
	return{
		passengerInformation: passenger,
		flightInformation: flight
	};
}
