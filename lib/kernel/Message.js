/* eslint-disable max-classes-per-file */

const MAX_BUFFER_LENGTH = 1024 * 1024 * 64;
const EMPTY_BUFFER = Buffer.from([]);

class IncomingMessage {
  constructor(message = { url: '/', method: 'GET', headers: {} }) {
    this.url = message.url;
    this.method = message.method;
    this.headers = { ...message.headers };
  }

  get uniqueId() {
    return this.headers.host + this.url;
  }
}

class OutgoingMessage {
  constructor(message = { status: 200, buffer: EMPTY_BUFFER, headers: {} }) {
    if (typeof message.status !== 'number' || message.status < 0) {
      throw new Error('illegal status');
    }
    if (
      !Buffer.isBuffer(message.buffer)
      || message.buffer.length > MAX_BUFFER_LENGTH
    ) {
      throw new Error('illegal buffer');
    }
    this.status = message.status;
    this.buffer = message.buffer;
    this.headers = {};
    Object.keys(message.headers).forEach((key) => {
      this.headers[key.toLowerCase()] = message.headers[key];
    });
  }

  /**
   * set header field
   *
   * @param {String} key - field key
   * @param {String=} value - field value
   * @memberof Context
   */
  header(key, value) {
    if (!key || typeof key !== 'string') return;
    // header will discard key when null value
    this.headers[key] = value == null ? undefined : value;
  }
}

module.exports = {
  IncomingMessage, OutgoingMessage
};