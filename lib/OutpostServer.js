const http = require('http');
const Runway = require('./Runway.js');

const PRIVATE_METHODS = ['checkMethod', 'handleRequest', 'getRequestDigest'];
const PROTECT_METHODS = ['listen'];
const VIRTUAL_METHODS = ['reviseRequest'];

const PRIVATE = {};
PRIVATE_METHODS.forEach((key) => {
  PRIVATE[key] = Symbol(key);
});

class OutpostServer {
  constructor(options = {}) {
    this.server = http.createServer(this[PRIVATE.handleRequest].bind(this));
    // this.market = new Market();
    // this.broker = new Broker();
    this.runway = new Runway();
    this[PRIVATE.checkMethod]();
  }

  /**
   * check public method
   *
   * @memberof OutpostServer
   */
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

  /**
   * handle server request
   *
   * @param {http.IncomingMessage} request
   * @param {http.ServerResponse} response
   * @memberof OutpostServer
   */
  async [PRIVATE.handleRequest](request, response) {
    // all requests changed into thread in worker
  }
}

module.exports = OutpostServer;
