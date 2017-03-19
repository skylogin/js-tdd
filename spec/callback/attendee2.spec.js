let Conference = {};

Conference.attendee = ((firstName = 'None', lastName = 'None') => {
  let checkedIn = false;
  let first = firstName;
  let last = lastName;

  return {
    getFullName: function(){
      return first + ' ' + last;
    },
    isCheckedIn: function(){
      return checkedIn;
    },
    checkIn: function(){
      checkedIn = true;
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
      recorder.recordCheckIn(attendee);
    }
  };
});

Conference.checkInRecorder = (() => {
  return{
    recordCheckIn: function(){

    }
  }
});

describe('Conference.attendeeCollection', () => {
  describe('contains(attendee)', () => {});
  describe('add(attendee)', () => {});
  describe('remove(attendee)', () => {});
  describe('iterate(callback)', () => {
    let collection, callbackSpy;

    const addAttendeesToCollection = ((attendeeArray) => {
      attendeeArray.forEach((attendee) => {
        collection.add(attendee);
      });
    });

    const verifyCallbackWasExecutedForEachAttendee = ((attendeeArray) => {
      expect(callbackSpy.calls.count()).toBe(attendeeArray.length);

      let allCalls = callbackSpy.calls.all();
      for(let i=0; i<allCalls.length; i++){
        expect(allCalls[i].args[0]).toBe(attendeeArray[i]);
      }
    });

    beforeEach(() => {
      collection = Conference.attendeeCollection();
      callbackSpy = jasmine.createSpy();
    });


    it('빈 콜렉션에서는 콜백을 실행하지 않는다', () => {
      collection.iterate(callbackSpy);
      expect(callbackSpy).not.toHaveBeenCalled();
    });

    it('원소가 하나뿐인 컬렉션은 콜백을 한번만 실행한다', () => {
      let attendees = [
        Conference.attendee('윤지', '김')
      ];
      addAttendeesToCollection(attendees);

      collection.iterate(callbackSpy);

      verifyCallbackWasExecutedForEachAttendee(attendees);
    });

    it('컬렉션 원소마다 한번씩 콜백을 실행한다', () => {
      let attendees = [
        Conference.attendee('Tom', 'Kazansky'),
        Conference.attendee('하나', '이'),
        Conference.attendee('윤지', '김')
      ];
      addAttendeesToCollection(attendees);

      collection.iterate(callbackSpy);

      verifyCallbackWasExecutedForEachAttendee(attendees);
    });
  });
});

describe('Conference.checkInService', () => {
  let checkInService, checkInRecorder, attendee;

  beforeEach(() => {
    checkInRecorder = Conference.checkInRecorder();
    spyOn(checkInRecorder, 'recordCheckIn');
    checkInService = Conference.checkInService(checkInRecorder);

    attendee = Conference.attendee('형철', '서');
  });

  describe('checkInService.checkIn(attendee)', () => {
    it('참가자를 체크인 처리한 것으로 표시한다', () => {
      checkInService.checkIn(attendee);
      expect(attendee.isCheckedIn()).toBe(true);
    });
    it('체크인을 등록한다', () => {
      checkInService.checkIn(attendee);
      expect(checkInRecorder.recordCheckIn).toHaveBeenCalledWith(attendee);
    });
  });
});


