/**
 * catch promise reject
 *
 * @param {Promise} promise
 * @returns {Promise}
 */
function autoCatch(promise) {
  return promise.catch(error => console.log(error.message));
}

module.exports = {
  autoCatch
};
