let Conference = {};

Conference.attendee = ((firstName='None', lastName='None') => {
  let checkedIn = false;
  let first = firstName;
  let last = lastName;
  let checkInNumber;

  return {
    getFullName: function(){
      return first + ' ' + last;
    },
    isCheckedIn: function(){
      return checkedIn;
    },
    checkIn: function(){
      checkedIn = true;
    },
    setCheckInNumber: function(number){
      checkInNumber = number;
    },
    getCheckInNumber: function(){
      return checkInNumber;
    },
    undoCheckIn: function(){

    }
  };
});

Conference.attendeeCollection = (() => {
  let attendees = [];

  return {
    contains: function(attendee){
      return attendees.indexOf(attendee) > -1;
    },
    add: function(attendee){
      if(!this.contains(attendee)){
        attendees.push(attendee);
      }
    },
    remove: function(attendee){
      let index = attendees.indexOf(attendee);
      if(index > -1){
        attendees.splice(index, 1);
      }
    },
    iterate: function(callback){
      attendees.forEach(callback);
    }
  };
});

Conference.checkInService = ((checkInRecorder) => {
  let recorder = checkInRecorder;

  return{
    checkIn: function(attendee){
      attendee.checkIn();
      return recorder.recordCheckIn(attendee)
        .then((checkInNumber) => {
          //function onRecordCheckInSucceeded
          attendee.setCheckInNumber(checkInNumber);
          return Promise.resolve(checkInNumber);
        }, (reason) => {
          //function onRecordCheckInFailed
          attendee.undoCheckIn();
          return Promise.reject(reason);
        });
    }
  };
});

Conference.checkInRecorder = (() => {
  return{
    recordCheckIn: function(){

    }
  }
});

Conference.checkedInAttendeeCounter = (() => {
  let checkedInAttendees = 0;
  let self = {
    increment: function(){
      checkedInAttendees++;
    },
    getCount: function(){
      return checkedInAttendees;
    },
    countIfCheckedIn: function(attendee){
      if(attendee.isCheckedIn()){
        self.increment();
      }
    }
  }
  return self
});

describe('Conference.checkInService', () => {
  let checkInService, checkInRecorder;
  let attendee;

  beforeEach(() => {
    checkInRecorder = Conference.checkInRecorder();
    checkInService = Conference.checkInService(checkInRecorder);
    attendee = Conference.attendee('형철', '서');
  });

  describe('checkInService.checkIn(attendee)', () => {
    describe('checkInRecorder 성공시', () => {
      let checkInNumber = 1234;
      beforeEach(() => {
        spyOn(checkInRecorder, 'recordCheckIn').and.callFake(() => {
          return Promise.resolve(checkInNumber);
        });
      });

      it('참가자를 체크인 처리한 것으로 표시한다', () => {
        checkInService.checkIn(attendee);
        expect(attendee.isCheckedIn()).toBe(true);
      });
      it('체크인을 등록한다', () => {
        checkInService.checkIn(attendee);
        expect(checkInRecorder.recordCheckIn).toHaveBeenCalledWith(attendee);
      });

      it('참가자의 checkInNumber를 지정한다', (done) => {
        checkInService.checkIn(attendee)
          .then(() => {
            //function onPromiseResolved
            expect(attendee.getCheckInNumber()).toBe(checkInNumber);
            done();
          }, () => {
            //function onPromiseRejected
            expect('이 실패 분기 코드가 실행됐다').toBe(false);
            done();
          });
      });
    });

    describe('checkInRecorder 실패 시', () => {
      let recorderError = '체크인 등록 실패!';
      beforeEach(() => {
        spyOn(checkInRecorder, 'recordCheckIn').and.returnValue(Promise.reject(new Error(recorderError)));
        spyOn(attendee, 'undoCheckIn');
      });

      it('기대 사유와 함께 실패 프로미스 반환', (done) => {
        checkInService.checkIn(attendee)
          .then(() => {
            //promiseResolved()
            expect('이 성공함수 실행').toBe(false);
            done();
          }, (reason) => {
            expect(reason.message).toBe(recorderError);
            done();
          });
      });
    });
  });

});