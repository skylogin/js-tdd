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
      return new Promise((resolve, reject) => {
        attendee.checkIn();
        recorder.recordCheckIn(attendee)
          .then((checkInNumber) => {
            //function onRecordCheckInSucceeded
            attendee.setCheckInNumber(checkInNumber);
            resolve(checkInNumber);
          }, (reason) => {
            //function onRecordCheckInFailed
            attendee.undoCheckIn();
            reject(reason);
          });
      });
    }
  };
});

Conference.checkInRecorder = (() => {
  let messages = {
    mustBeCheckedIn: '참가자는 체크인 된 것으로 표시되어야 한다.'
  }
  return{
    getMessage: function(){
      return messages;
    },
    recordCheckIn: function(){
      return new Promise((resolve, reject) => {
        if(attendee.isCheckedIn()){
          resolve(4444);
        } else{
          reject(new Error(messages.mustBeCheckedIn));
        }
      });
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

describe('Conference.checkInRecorder', () => {
  let checkInRecorder;
  let attendee;

  beforeEach(() => {
    attendee = Conference.attendee('Tom', 'Jones');
    checkInRecorder = Conference.checkInRecorder();
  });

  describe('recordCheckIn(attendee)', () => {
    it('참가자가 체크인되면 checkInNumber로 성공된 프로미스를 반환', (done) => {
      attendee.checkIn();
      checkInRecorder.recordCheckIn(attendee)
        .then((actualCheckInNumber) => {
          expect(typeof actualCheckInNumber).toBe('number');
        }, () => {
          expect('fail').toBe(false);
        });
        done();
    });
  });

  it('참가자가 체크인되지 않으면 에러와 실패 프로미스를 반환', (done) => {
    checkInRecorder.recordCheckIn(attendee)
      .then(() => {
        expect('success').toBe(false);
      }, (reason) => {
        expect(reason instanceof Error).toBe(true);
        expect(reason.message).toBe(checkInRecorder.getMessages().mustBeCheckedIn);
      });
      done();
  });
});