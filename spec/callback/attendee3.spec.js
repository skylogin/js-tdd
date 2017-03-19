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

Conference.checkedInAttendeeCounter = (() => {
  let checkedInAttendees = 0;

  return{
    increment: function(){
      checkedInAttendees++;
    },
    getCount: function(){
      return checkedInAttendees;
    },
    countIfCheckedIn: function(attendee){
      if(attendee.isCheckedIn()){
        this.increment();
      }
    }
  };
});

describe('Conference.checkedInAttendeeCounter', () => {
  let counter;

  beforeEach(() => {
    counter = Conference.checkedInAttendeeCounter();
  });

  describe('increment()', () => {});
  describe('getCount()', () => {});
  describe('countIfCheckedIn(attendee)', () => {
    let attendee;

    beforeEach(() => {
      attendee = Conference.attendee('태영', '김');
    });

    it('참가자가 체크인하지 않으면 인원수를 세지 않는다', () => {
      counter.countIfCheckedIn(attendee);
      expect(counter.getCount()).toBe(0);
    });
    it('참가자가 체크인하면 인원수를 센다', () => {
      attendee.checkIn();
      counter.countIfCheckedIn(attendee);
      expect(counter.getCount()).toBe(1);
    });
  });
});