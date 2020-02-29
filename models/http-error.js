class HttpError extends Error {
  constructor(message, errorCode) {
    super(message); //adde a message property
    this.code = errorCode; // add a code property
  }
}
module.exports = HttpError;
