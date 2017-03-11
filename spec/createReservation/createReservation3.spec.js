
describe('createResrvation(passenger, flight, saver)', () => {
	var testPassenger = null;
	var	testFlight = null;
	var	testReservation = null;
	var	testSaver = null;

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

		testSaver = new ReservationSaver();
		spyOn(testSaver, 'saveReservation');

		testReservation = createReservation(testPassenger, testFlight, testSaver);
	});


	it('passenger를 passengerInformation 프로퍼티에 할당한다', ()=> {
		expect(testReservation.passengerInformation).toBe(testPassenger);
	});
	it('flight를 flightInformation 프로퍼티에 할당한다', () => {
		expect(testReservation.flightInformation).toBe(testFlight);
	});
	it('예약 정보를 저장한다', () => {
		expect(testSaver.saveReservation).toHaveBeenCalled();
	})
});

function createReservation(passenger, flight, saver){
	var reservation = {
		passengerInformation: passenger,
		flightInformation: flight
	};

	saver.saveReservation(reservation);

	return reservation;
}

class ReservationSaver {
	saveReservation(reservation){

	}
}

// function ReservationSaver(reservation){
// 	this.saveReservation = function(reservation){

// 	};
// }
