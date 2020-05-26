const { OutgoingMessage } = require('./kernel/Message.js');

class Flight {
  constructor(message) {
    this.message = message;
    this.actions = [];
    this.timeout = -1;
  }

  board(action) {
    this.actions.push(action);
  }

  async start(timeout, callback) {
    const result = await new Promise((resolve) => {
      this.timeout = setTimeout(() => {
        const message = new OutgoingMessage({
          status: 504,
          buffer: Buffer.from('upstream timeout\r\n'),
          headers: {}
        });
        resolve(message);
      }, timeout);
      this.mount = (payload) => {
        clearTimeout(this.timeout);
        const message = new OutgoingMessage(payload);
        resolve(message);
      }
    })
    this.actions.forEach(action => action(result));
    if (callback) callback(result);
    this.actions = [];
  }
}

module.exports = Flight;
