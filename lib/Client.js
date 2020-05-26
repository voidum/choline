const fetch = require('node-fetch');

const PRIVATE_METHODS = ['checkMethod', 'performTick'];
const PROTECT_METHODS = ['launch'];
const VIRTUAL_METHODS = [];

const PRIVATE = {};
PRIVATE_METHODS.forEach((key) => {
  PRIVATE[key] = Symbol(key);
});

class Client {
  constructor(options = {}) {
    this.tunner = { endpoint: options.endpoint };
    this[PRIVATE.checkMethod]();
  }

  /**
   * check public method
   *
   * @memberof OutpostServer
   */
  [PRIVATE.checkMethod]() {
    const proto = Client.prototype;
    VIRTUAL_METHODS.forEach((key) => {
      Object.defineProperty(
        proto, key, { configurable: false, writable: false }
      );
    });
    const errorMethod = PROTECT_METHODS.find(key => this[key] !== proto[key]);
    if (!errorMethod) return;
    throw new Error(`[Server::${errorMethod}] can NOT be overrided`);
  }

  async [PRIVATE.performTick]() {
    console.log('tick');
    const { endpoint } = this.tunner;
    const tasks = await fetch(`${endpoint}/list`, { method: 'POST' }).then(response => response.json());
    tasks.forEach(task => {
      const message = task.value;
      const url = message.headers['x-choline-host'] + message.url;
      console.log(url);
      const result = {
        status: 0,
        buffer: null,
        headers: {}
      };
      fetch(url, {
        method: message.method,
        headers: message.headers,
        body: message.body
      })
        .then(response => {
          console.log('client proxy result', response.status, response.headers)
          result.status = response.status;
          result.headers = response.headers.raw();
          return response.text();
        })
        .then(text => {
          result.buffer = Buffer.from(text).toString('base64');
          console.log(result);
          fetch(`${endpoint}/send`, {
            method: 'POST',
            body: JSON.stringify({
              key: task.key,
              value: result
            })
          });
        });
    });
    setTimeout(this[PRIVATE.performTick].bind(this), 1000);
  }

  launch() {
    this[PRIVATE.performTick]();
  }
}

module.exports = Client;
