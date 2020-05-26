const http = require('http');
const { v1: uuidv1 } = require('uuid');
const Flight = require('./Flight.js');
const { IncomingMessage, OutgoingMessage, buildOutgoing } = require('./kernel/Message.js');

const PRIVATE_METHODS = ['checkMethod', 'handleConsumer', 'handleProducer'];
const PROTECT_METHODS = ['listen'];
const VIRTUAL_METHODS = [];

const PRIVATE = {};
PRIVATE_METHODS.forEach((key) => {
  PRIVATE[key] = Symbol(key);
});

/**
 * respond with message
 *
 * @param {http.ServerResponse} response
 * @param {OutgoingMessage} message
 */
function respondWith(response, message) {
  if (message instanceof OutgoingMessage) {
    response.writeHead(message.status, message.headers);
    response.write(message.buffer);
    response.end();
  }
}

class Server {
  constructor(options = {}) {
    this.consumer = http.createServer(this[PRIVATE.handleConsumer].bind(this));
    this.producer = http.createServer(this[PRIVATE.handleProducer].bind(this));
    this.flights = new Map();
    this[PRIVATE.checkMethod]();
  }

  [PRIVATE.checkMethod]() {
    const proto = Server.prototype;
    VIRTUAL_METHODS.forEach((key) => {
      Object.defineProperty(
        proto, key, { configurable: false, writable: false }
      );
    });
    const errorMethod = PROTECT_METHODS.find(key => this[key] !== proto[key]);
    if (!errorMethod) return;
    throw new Error(`[Server::${errorMethod}] can NOT be overrided`);
  }

  async [PRIVATE.handleConsumer](request, response) {
    const incoming = new IncomingMessage(request);
    const uniqueId = uuidv1();
    const flight = new Flight(incoming);
    this.flights.set(uniqueId, flight);
    flight.board((outgoing) => {
      console.log('respond', outgoing);
      respondWith(response, outgoing);
    });
    flight.start(10 * 1000, (outgoing) => {
      this.flights.delete(uniqueId);
    });
  }

  async [PRIVATE.handleProducer](request, response) {
    const incoming = new IncomingMessage(request);

    if (incoming.method !== 'POST') {
      const message = buildOutgoing(405);
      respondWith(response, message);
      return;
    }

    const body = await incoming.body;
    switch (incoming.url) {
      case '/list': {
        const flights = [];
        this.flights.forEach((value, key) => {
          flights.push({ key, value: value.message });
        });
        console.log(flights);
        const message = buildOutgoing(200, JSON.stringify(flights));
        respondWith(response, message);
        return;
      }
      case '/mark': {
        const flight = this.flights[body.key];
        if (flight) {
          flight.order();
        }
        const message = buildOutgoing(200);
        respondWith(response, message);
        return;
      }
      case '/send': {
        console.log(body);
        const { key, value } = JSON.parse(body);
        value.buffer = Buffer.from(value.buffer, 'base64');
        const flight = this.flights.get(key);
        console.log('send flight', flight);
        if (flight) {
          flight.mount(value);
          const message = buildOutgoing(200);
          respondWith(response, message);
        }
        return;
      }
      default: {
        const message = buildOutgoing(404);
        respondWith(response, message);
      }
    }
  }

  listen(options, callback) {
    this.consumer.listen(options.consumer);
    this.producer.listen(options.producer);
  }
}

module.exports = Server;
