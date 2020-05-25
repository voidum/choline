const Flight = require('./Flight.js');

class Runway {
  constructor() {
    this.flights = new Map();
  }

  getFlight(digest) {
    return this.flights.get(digest);
  }

  createFlight(digest, message) {
    const flight = new Flight(message);
    this.flights.set(digest, flight);
    return flight;
  }

  removeFlight(digest) {
    this.flights.delete(digest);
  }
}

module.exports = Runway;
