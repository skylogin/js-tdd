require('jasmine-ajax');

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

    },
    setId: function(){

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
    mustBeCheckedIn: '참가자는 체크인 된 것으로 표시되어야 한다.',
    httpFailure: 'HTTP 요청 실패'
  }
  return{
    getMessage: function(){
      return messages;
    },
    recordCheckIn: function(){
      return new Promise((resolve, reject) => {
        if(attendee.isCheckedIn()){
          let xhr = new XMLHttpRequest();
          xhr.onreadystatechange = (() => {
            if(xhr.readyState == 4){
              resolve(xhr.responseText);
            } else{
              reject(new Error(messages.httpFailure));
            }
          });
          xhr.open('post', '/checkin/' + attendee.getId(), true);
          xhr.send();
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
    attendee.setId(777);
    checkInRecorder = Conference.checkInRecorder();

    jasmine.Ajax.install();
  });

  afterEach(() => {
    jasmine.Ajax.uninstall();
  })

  describe('recordCheckIn(attendee)', () => {
    it('HTTP요청이 성공하여 참가자가 체크인되면 checkInNumber로 성공된 프로미스를 반환', () => {
      let expectedCheckInNumber = 1234;
      let request;

      attendee.checkIn();
      checkInRecorder.recordCheckIn(attendee)
        .then((actualCheckInNumber) => {
          expect(actualCheckInNumber).toBe(expectedCheckInNumber);
        }, () => {
          expect('fail').toBe(false);
        });

      request = jasmine.Ajax.requests.mostRecent();
      expect(request.url).toBe('/checkin/' + attendee.getId());

      request.response({
        'status': 200,
        'contentType': 'text/plain',
        'responseText': expectedCheckInNumber
      });
    });

    it('HTTP요청이 실패하여 참가자가 체크인되지 않으면 정확한 메시지와 함께 실패한 프로미스를 반환', () => {
      let request;

      attendee.checkIn();
      checkInRecorder.recordCheckIn(attendee)
        .then((actualCheckInNumber) => {
          expect('success').toBe(false);
        }, (reason) => {
          expect(reason instanceof Error).toBe(true);
          expect(reason.mesage).toBe(checkInRecorder.getMessage().httpFailure);
        });

      request = jasmine.Ajax.requests.mostRecent();
      expect(request.url).toBe('/checkin/' + attendee.getId());

      request.response({
        'status': 404,
        'contentType': 'text/plain',
        'responseText': '404 error'
      });
    })
  });


});