
describe('createReservation(passenger, flight)', () => {
	it('주어진 passenger를 passengerInformation 프로퍼티에 할당한다', function(){
		let testPassenger = {
			firstName: '윤지',
			lastName: '김'
		};

		let testFlight = {
			number: 433,
			carrier: '대한항공',
			destination: '울산'
		};

		let reservation = createReservation(testPassenger, testFlight);
		expect(reservation.passengerInformation).toBe(testPassenger);
	});
});

function createReservation(passenger, flight){
	return{
		passengerInformation: passenger,
		flightInformation: flight
	};
}
