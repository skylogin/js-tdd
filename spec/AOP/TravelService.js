TravelService = ((rawWebService) => {
  let conferenceAirport = 'BOS';
  let maxArrival = new Date('20170312');
  let minDeparture = new Date('20170313');

  var cache = [];

  return {
    getSuggestedTicket: ((homeAirport) => {
      if(cache[homeAirport]){
        return cache[homeAirport];
      }
      let ticket = rawWebService.getCheapestRoundTrip(homeAirport, conferenceAirport, maxArrival, minDeparture);

      cache[homeAirport] = ticket;
      return ticket;
    });
  }
})();


TravelService.getSuggestedTicket(attendee.homeAirport);