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
      recorder.recordCheckIn(attendee)
        .then(attendee.setCheckInNumber, attendee.undoCheckIn);
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
        checkInService.checkIn(attendee);
        expect(attendee.getCheckInNumber()).toBe(checkInNumber);
      })

    });
  });

});