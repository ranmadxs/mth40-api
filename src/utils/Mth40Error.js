module.exports = class Mth40Error extends Error {
  constructor(message, code, type) {
    super(message);
    this.code = code;
    this.type = type;
    this.msg = message;
  }
}