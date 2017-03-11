import { DIContainer } from './DIContainer';

MyApp = {};
MyApp.diContainer = new DIContainer();

MyApp.diContainer.register('Service', [], () => {
  return new ConferenceWebSvc();
});

MyApp.diContainer.register('Messenger', [], () => {
  return new Messenger();
});

MyApp.diContainer.register('AttendeeFactory', ['Service', 'Messenger'], (service, messenger) => {
  return ((attendeeId) => {
    return new Attendee(service, messenger, attendeeId);
  });
});


let attendeeId = 123;
let sessionId = 1;

let attendee = MyApp.diContainer.get('AttendeeFactory')(attendeeId);
attendee.reserve(sessionId);